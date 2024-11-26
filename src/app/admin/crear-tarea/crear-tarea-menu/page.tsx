'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { format } from "date-fns"
import { es } from "date-fns/locale"
import { CalendarIcon, Plus, ArrowLeft, X } from 'lucide-react'
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command"
import { supabase } from '@/lib/supabase'

type Alumno = {
  identificador: number;
  nombre: string;
}

export default function CrearTareaForm() {
  const router = useRouter()

  const [alumnos, setAlumnos] = useState<Alumno[]>([])
  const [alumnoInput, setAlumnoInput] = useState('')
  const [fechaInicio, setFechaInicio] = useState<Date>()
  const [fechaFin, setFechaFin] = useState<Date>()
  const [alumnosSugeridos, setAlumnosSugeridos] = useState<Alumno[]>([])
  const [isSearching, setIsSearching] = useState(false)
  const [isCommandListOpen, setIsCommandListOpen] = useState(false)
  const [nombre, setNombre] = useState('')
  const [descripcion, setDescripcion] = useState('')

  const commandListRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (commandListRef.current && !commandListRef.current.contains(event.target as Node)) {
        setIsCommandListOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [])

  useEffect(() => {
    if (alumnoInput.trim().length > 0) {
      console.debug('Buscando...')
      setIsSearching(true)
      setIsCommandListOpen(true)
      const buscarAlumnos = async () => {
        const { data, error } = await supabase
          .from('Alumno')
          .select('identificador, nombre')
          .ilike('nombre', `%${alumnoInput}%`)
          .limit(5)

        if (error) {
          console.error('Error al buscar alumnos:', error)
          setAlumnosSugeridos([])
        } else {
          // No se muestran los alumnos ya agregados
          const alumnosFiltrados = data?.filter(
            alumno => !alumnos.some(a => a.identificador === alumno.identificador)
          )
          setAlumnosSugeridos(alumnosFiltrados)
        }
        setIsSearching(false)
      }
      buscarAlumnos()
    } else {
      console.debug('Input vacio, no se busca nada')
      setAlumnosSugeridos([])
      setIsSearching(false)
      setIsCommandListOpen(false)
    }
  }, [alumnoInput])

  const agregarAlumno = (alumno: Alumno) => {
    console.log('Agregando alumno ', alumno)
    if (!alumnos.some(a => a.identificador === alumno.identificador)) {
      setAlumnos(prevAlumnos => [...prevAlumnos, alumno])
      setAlumnoInput('')
    }
  }

  const eliminarAlumno = (identificador: number) => {
    setAlumnos(prevAlumnos => prevAlumnos.filter(a => a.identificador !== identificador))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!nombre || !descripcion || !fechaInicio || !fechaFin || alumnos.length === 0) {
      alert('Por favor, complete todos los campos y seleccione al menos un alumno.')
      return
    }

    for (const alumno of alumnos) {
      const { error } = await supabase
        .from('Tarea_Menu')
        .insert({
          fecha_inicio: fechaInicio.toISOString(),
          fecha_fin: fechaFin.toISOString(),
          nombre,
          descripcion,
          id_alumno: alumno.identificador,
          completado: false
        })

      if (error) {
        console.error('Error al crear la tarea:', error)
        alert('Hubo un error al crear la tarea. Por favor, inténtelo de nuevo.')
        return
      }
    }

    alert('Tarea creada con éxito')
    router.push('/admin/crear-tarea/')
  }

  return (
    <div className="max-w-2xl mx-auto p-6 GeistVF">
      <Button
        variant="outline"
        className="w-12 h-12 bg-yellow-400 hover:bg-yellow-500 text-black mb-4"
        onClick={() => {
          router.push('/admin/crear-tarea/')
        }}
      >
        <ArrowLeft className="!h-10 !w-10" />
      </Button>
      <h1 className="text-3xl font-bold mb-6 text-center">Crear tarea</h1>
      <form className="space-y-6" onSubmit={handleSubmit}>
        <div>
          <label htmlFor="nombre" className="block mb-2">Nombre</label>
          <Input 
            id="nombre" 
            placeholder="Nombre de la tarea" 
            value={nombre}
            onChange={(e) => setNombre(e.target.value)}
          />
        </div>
        <div>
          <label htmlFor="descripcion" className="block mb-2">Descripción</label>
          <Textarea 
            id="descripcion" 
            placeholder="Descripción de la tarea" 
            className="min-h-[100px]"
            value={descripcion}
            onChange={(e) => setDescripcion(e.target.value)}
          />
        </div>
        <div>
          <label htmlFor="alumnos" className="block mb-2">Alumnos</label>
          <div className="flex flex-col space-y-2">
            <div className="relative flex space-x-2">
              <Command className="rounded-lg border shadow-md w-full">
                <CommandInput
                  id="alumnos"
                  placeholder="Buscar alumno"
                  value={alumnoInput}
                  onValueChange={setAlumnoInput}
                  onFocus={() => setIsCommandListOpen(true)}
                  onKeyDown={(event) => {
                    if (event.key == 'Enter') {
                      console.debug('Agregando alumno mediante Enter')
                      agregarAlumno(alumnosSugeridos[0])
                    }
                  }}
                />
                {isCommandListOpen && (
                  <CommandList ref={commandListRef} className='absolute top-full left-0 w-full max-h-64 overflow-y-auto bg-white shadow-lg z-50'>
                    {!isSearching && alumnosSugeridos.length > 0 && (
                      <CommandGroup>
                        {alumnosSugeridos.map((alumno) => (
                          <CommandItem
                            key={alumno.identificador}
                            value={alumno.nombre}
                            onSelect={() => {
                              console.debug('Agregando alumno haciendo clic')
                              agregarAlumno(alumno)
                            }}
                            className="cursor-pointer hover:bg-gray-100"
                          >
                            {alumno.nombre}
                          </CommandItem>
                        ))}
                      </CommandGroup>
                    )}
                    {!isSearching && alumnoInput.trim().length > 0 && alumnosSugeridos.length === 0 && (
                      <CommandEmpty>No se encontraron alumnos</CommandEmpty>
                    )}
                  </CommandList>
                )}
              </Command>
              <Button
                type="button"
                size="icon"
                className="rounded-full bg-blue-500 hover:bg-blue-600 text-white"
                onClick={() => {
                  if (alumnosSugeridos.length > 0) {
                    console.debug('Agregando alumno por boton')
                    agregarAlumno(alumnosSugeridos[0])
                  }
                }}
              >
                <Plus className="!h-6 !w-6" />
              </Button>
            </div>
            <div className="space-y-2">
              {alumnos.map((alumno) => (
                <div key={alumno.identificador} className="flex items-center justify-between bg-gray-100 p-2 rounded">
                  <span>{alumno.nombre}</span>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => eliminarAlumno(alumno.identificador)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label htmlFor="fechaInicio" className="block mb-2">Fecha de inicio</label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant={"outline"}
                  className={`w-full justify-start text-left font-normal ${!fechaInicio && "text-muted-foreground"}`}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {fechaInicio ? format(fechaInicio, "dd/MM/yyyy", { locale: es }) : <span>DD/MM/AAAA</span>}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={fechaInicio}
                  onSelect={setFechaInicio}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>
          <div>
            <label htmlFor="fechaFin" className="block mb-2">Fecha final</label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant={"outline"}
                  className={`w-full justify-start text-left font-normal ${!fechaFin && "text-muted-foreground"}`}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {fechaFin ? format(fechaFin, "dd/MM/yyyy", { locale: es }) : <span>DD/MM/AAAA</span>}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={fechaFin}
                  onSelect={setFechaFin}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>
        </div>
        <Button type="submit" className="w-full text-lg bg-green-600 hover:bg-green-700">Crear</Button>
      </form>
    </div>
  )
}