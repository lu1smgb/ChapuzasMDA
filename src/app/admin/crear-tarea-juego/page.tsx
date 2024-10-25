/*'use client'

import { useState, useEffect } from 'react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { ArrowLeft } from "lucide-react"
import Link from 'next/link'

// Simulación de juegos de la base de datos
const juegosSimulados = [
  { id: '1', nombre: 'Memoria' },
  { id: '2', nombre: 'Puzzle' },
  { id: '3', nombre: 'Quiz' },
  { id: '4', nombre: 'Secuencia' },
]

export default function CrearTareaJuego() {
  const [nombre, setNombre] = useState('')
  const [descripcion, setDescripcion] = useState('')
  const [juegoSeleccionado, setJuegoSeleccionado] = useState('')
  const [juegos, setJuegos] = useState(juegosSimulados)

  useEffect(() => {
    // Aquí iría la lógica para obtener los juegos de la base de datos
    // Por ahora, usamos los juegos simulados
    setJuegos(juegosSimulados)
  }, [])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    console.log('Tarea de juego creada:', { nombre, descripcion, tipoTarea: 'JUEGO', juegoSeleccionado })
    // Aquí iría la lógica para guardar la tarea en la base de datos
  }

  return (
    <div className="min-h-screen bg-white md:bg-gradient-to-br md:from-blue-100 md:via-purple-100 md:to-pink-100 flex items-center justify-center p-4">
      <main className="bg-white rounded-lg shadow-lg p-4 md:p-8 w-full md:max-w-2xl">
        <h1 className="text-2xl md:text-3xl font-bold mb-6 text-center text-gray-900">Crear Tarea de Juego</h1>
        <nav className="mb-8">
          <Link href="/admin/dashboard" passHref>
            <Button variant="outline" className="w-full text-base md:text-lg bg-yellow-400 hover:bg-yellow-500" aria-label="Volver al dashboard">
              <ArrowLeft className="mr-2 h-4 w-4 md:h-5 md:w-5" aria-hidden="true" />
              Volver al Dashboard
            </Button>
          </Link>
        </nav>
        <form onSubmit={handleSubmit} className="space-y-6 md:space-y-8">
          <div className="space-y-2 md:space-y-3">
            <Label htmlFor="nombre" className="text-base md:text-lg font-medium text-gray-900">
              Nombre de la Tarea
            </Label>
            <Input
              id="nombre"
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              className="text-base md:text-lg"
              placeholder="Ingrese el nombre de la tarea"
              required
            />
          </div>
          <div className="space-y-2 md:space-y-3">
            <Label htmlFor="descripcion" className="text-base md:text-lg font-medium text-gray-900">
              Descripción
            </Label>
            <Textarea
              id="descripcion"
              value={descripcion}
              onChange={(e) => setDescripcion(e.target.value)}
              className="text-base md:text-lg"
              placeholder="Describa la tarea de juego"
              rows={4}
              required
            />
          </div>
          <div className="space-y-2 md:space-y-3">
            <Label htmlFor="tipoTarea" className="text-base md:text-lg font-medium text-gray-900">
              Tipo de Tarea
            </Label>
            <Input
              id="tipoTarea"
              value="JUEGO"
              className="text-base md:text-lg bg-gray-100"
              readOnly
              disabled
            />
          </div>
          <div className="space-y-2 md:space-y-3">
            <Label htmlFor="juego" className="text-base md:text-lg font-medium text-gray-900">
              Seleccionar Juego
            </Label>
            <Select 
              value={juegoSeleccionado} 
              onValueChange={setJuegoSeleccionado}
              aria-required="true"
            >
              <SelectTrigger id="juego" className="text-base md:text-lg">
                <SelectValue placeholder="Seleccione un juego" />
              </SelectTrigger>
              <SelectContent>
                {juegos.map((juego) => (
                  <SelectItem key={juego.id} value={juego.id} className="text-base md:text-lg">
                    {juego.nombre}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <Button 
            type="submit" 
            className="w-full text-base md:text-lg bg-blue-600 hover:bg-blue-700 text-white"
            aria-label="Crear tarea de juego"
          >
            Crear Tarea de Juego
          </Button>
        </form>
      </main>
    </div>
  )
}
  */

'use client'

import { supabase } from "@/lib/supabase";
import { useState, useEffect } from 'react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { ArrowLeft } from "lucide-react"
import Link from 'next/link'
import { useRouter } from 'next/navigation'

type Juego = {
  id: string;
  name: string;
}

export default function CrearTareaJuego() {
  const [nombre_tarea, setNombre] = useState('')
  const [descripcion, setDescripcion] = useState('')
  const [juegoSeleccionado, setJuegoSeleccionado] = useState('')
  const [juegos, setJuegos] = useState<Juego[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()

  useEffect(() => {
    fetchJuegos()
  }, [])

  const fetchJuegos = async () => {
    try {
      const { data, error } = await supabase
        .from('Juego')
        .select('id, name')

      if (error) throw error

      setJuegos(data || [])
    } catch (error) {
      setError('Error al cargar los juegos. Por favor, intente de nuevo.')
      console.error('Error fetching juegos:', error)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')

    if (!juegoSeleccionado) {
      setError('Debe seleccionar un juego antes de crear la tarea.')
      setIsLoading(false)
      return
    }


    try {
      const { data, error } = await supabase
        .from('Tarea')
        .insert([
          { 
            nombre_tarea, 
            descripcion, 
            tipo_tarea: 'JUEGO',
            juego_asociado: juegoSeleccionado // ahora 'juegoSeleccionado' contiene el 'name' del juego
          }
        ])
        .select()

      if (error) throw error

      console.log('Tarea creada:', data)
      router.push('/admin/crear-tarea-juego') // Redirige al dashboard después de crear la tarea
    } catch (error: unknown) {
      setError('Error al crear la tarea. Por favor, intente de nuevo.')
      if (error instanceof Error) {
        console.error('Error creating task:', error.message)
      } else {
        console.error('Error creating task:', error)
      }
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-white md:bg-gradient-to-br md:from-blue-100 md:via-purple-100 md:to-pink-100 flex items-center justify-center p-4">
      <main className="bg-white rounded-lg shadow-lg p-4 md:p-8 w-full md:max-w-2xl">
        <h1 className="text-2xl md:text-3xl font-bold mb-6 text-center text-gray-900">Crear Tarea de Juego</h1>
        <nav className="mb-8">
          <Link href="/admin/dashboard" passHref>
            <Button variant="outline" className="w-full text-base md:text-lg bg-yellow-400 hover:bg-yellow-500" aria-label="Volver al dashboard">
              <ArrowLeft className="mr-2 h-4 w-4 md:h-5 md:w-5" aria-hidden="true" />
              Volver al Dashboard
            </Button>
          </Link>
        </nav>
        {error && <p className="text-red-500 text-center mb-4">{error}</p>}
        <form onSubmit={handleSubmit} className="space-y-6 md:space-y-8">
          <div className="space-y-2 md:space-y-3">
            <Label htmlFor="nombre" className="text-base md:text-lg font-medium text-gray-900">
              Nombre de la Tarea
            </Label>
            <Input
              id="nombre"
              value={nombre_tarea}
              onChange={(e) => setNombre(e.target.value)}
              className="text-base md:text-lg"
              placeholder="Ingrese el nombre de la tarea"
              required
            />
          </div>
          <div className="space-y-2 md:space-y-3">
            <Label htmlFor="descripcion" className="text-base md:text-lg font-medium text-gray-900">
              Descripción
            </Label>
            <Textarea
              id="descripcion"
              value={descripcion}
              onChange={(e) => setDescripcion(e.target.value)}
              className="text-base md:text-lg"
              placeholder="Describa la tarea de juego"
              rows={4}
              required
            />
          </div>
          <div className="space-y-2 md:space-y-3">
            <Label htmlFor="tipoTarea" className="text-base md:text-lg font-medium text-gray-900">
              Tipo de Tarea
            </Label>
            <Input
              id="tipoTarea"
              value="JUEGO"
              className="text-base md:text-lg bg-gray-100"
              readOnly
              disabled
            />
          </div>
          <div className="space-y-2 md:space-y-3">
            <Label htmlFor="juego" className="text-base md:text-lg font-medium text-gray-900">
              Seleccionar Juego
            </Label>
            <Select 
              value={juegoSeleccionado} 
              onValueChange={setJuegoSeleccionado}
              aria-required="true"
            >
              <SelectTrigger id="juego" className="text-base md:text-lg">
                <SelectValue placeholder="Seleccione un juego" />
              </SelectTrigger>
              <SelectContent>
                {juegos.map((juego) => (
                  <SelectItem key={juego.id} value={juego.name} className="text-base md:text-lg">
                    {juego.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <Button 
            type="submit" 
            className="w-full text-base md:text-lg bg-blue-600 hover:bg-blue-700 text-white"
            aria-label="Crear tarea de juego"
            disabled={isLoading}
          >
            {isLoading ? 'Creando...' : 'Crear Tarea de Juego'}
          </Button>
        </form>
      </main>
    </div>
  )
}

