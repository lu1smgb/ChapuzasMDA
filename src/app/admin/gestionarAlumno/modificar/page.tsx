'use client'

import { useState, useEffect } from 'react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
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
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

const supabase = createClient(supabaseUrl, supabaseAnonKey);

interface Alumno {
  id: number;
  nombre_apellido: string;
  tipo_login: string;
}

export default function EditarAlumno() {
  const [alumnos, setAlumnos] = useState<Alumno[]>([])
  const [selectedAlumno, setSelectedAlumno] = useState<Alumno | null>(null)
  const [tipoLoginActual, setTipoLoginActual] = useState('')
  const [nuevoNombre, setNuevoNombre] = useState('')
  const [nuevoTipoLogin, setNuevoTipoLogin] = useState('')
  const [tipoLoginOptions, setTipoLoginOptions] = useState<string[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [successMessage, setSuccessMessage] = useState('')

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true)
      setError('')
      try {
        // Fetch alumnos
        const { data: alumnosData, error: alumnosError } = await supabase
          .from('Alumno')
          .select('id, nombre_apellido, tipo_login')

        if (alumnosError) throw alumnosError

        setAlumnos(alumnosData || [])

        // Fetch tipo_login options
        const { data: tipoLoginData, error: tipoLoginError } = await supabase
          .from('TipoLogin')
          .select('tipo_login')

        if (tipoLoginError) throw tipoLoginError

        if (!tipoLoginData || tipoLoginData.length === 0) {
          throw new Error('No se encontraron opciones de tipo de login')
        }

        const options = tipoLoginData.map(item => item.tipo_login)
        setTipoLoginOptions(options)
      } catch (error) {
        console.error('Error fetching data:', error)
        setError('Error al cargar los datos. Por favor, recargue la página.')
      } finally {
        setIsLoading(false)
      }
    }

    fetchData()
  }, [])

  const handleAlumnoChange = (alumnoId: string) => {
    const alumno = alumnos.find(a => a.id.toString() === alumnoId)
    setSelectedAlumno(alumno || null)
    if (alumno) {
      setNuevoNombre(alumno.nombre_apellido)
      setTipoLoginActual(alumno.tipo_login)
      setNuevoTipoLogin(alumno.tipo_login)
    }
    setSuccessMessage('')
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedAlumno) {
      setError('Debe seleccionar un alumno.')
      return
    }

    // Nueva validación para evitar nombres vacíos
    if (nuevoNombre.trim() === '') {
      setError('El nombre no puede ser una cadena vacía.')
      return
    }

    setIsLoading(true)
    setError('')
    setSuccessMessage('')

    const updates: Partial<Alumno> = {}
    if (nuevoNombre !== selectedAlumno.nombre_apellido) {
      updates.nombre_apellido = nuevoNombre
    }
    if (nuevoTipoLogin !== selectedAlumno.tipo_login) {
      updates.tipo_login = nuevoTipoLogin
    }

    if (Object.keys(updates).length === 0) {
      setError('No se han realizado cambios.')
      setIsLoading(false)
      return
    }

    try {
      const { data, error } = await supabase
        .from('Alumno')
        .update(updates)
        .eq('id', selectedAlumno.id)
        .select()

      if (error) throw error

      if (data && data.length > 0) {
        const updatedAlumno = data[0] as Alumno
        setSelectedAlumno(updatedAlumno)
        setNuevoNombre(updatedAlumno.nombre_apellido)
        setTipoLoginActual(updatedAlumno.tipo_login)
        setNuevoTipoLogin(updatedAlumno.tipo_login)
        
        // Update the alumnos array with the new data
        setAlumnos(alumnos.map(a => a.id === updatedAlumno.id ? updatedAlumno : a))
        
        setSuccessMessage('Alumno actualizado con éxito')
      }
    } catch (error) {
      console.error('Error updating student:', error)
      setError('Error al actualizar el alumno. Por favor, intente de nuevo.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-white md:bg-gradient-to-br md:from-blue-100 md:via-purple-100 md:to-pink-100 flex items-center justify-center p-4">
      <main className="bg-white rounded-lg shadow-lg p-4 md:p-8 w-full md:max-w-2xl">
        <h1 className="text-2xl md:text-3xl font-bold mb-6 text-center text-gray-900">Editar Alumno</h1>
        <nav className="mb-8">
          <Link href="/admin/gestionarAlumno" passHref>
            <Button variant="outline" className="w-full text-base md:text-lg bg-yellow-400 hover:bg-yellow-500" aria-label="Volver a gestionar alumnos">
              <ArrowLeft className="mr-2 h-4 w-4 md:h-5 md:w-5" aria-hidden="true" />
              Atrás
            </Button>
          </Link>
        </nav>
        {error && <p className="text-red-500 text-center mb-4" role="alert">{error}</p>}
        {successMessage && <p className="text-green-500 text-center mb-4" role="status">{successMessage}</p>}
        <form onSubmit={handleSubmit} className="space-y-6 md:space-y-8">
          <div className="space-y-2 md:space-y-3">
            <Label htmlFor="alumno" className="text-base md:text-lg font-medium text-gray-900">
              Seleccionar Alumno
            </Label>
            <Select 
              onValueChange={handleAlumnoChange}
              disabled={isLoading}
            >
              <SelectTrigger id="alumno" className="text-base md:text-lg">
                <SelectValue placeholder="Seleccione un alumno" />
              </SelectTrigger>
              <SelectContent>
                {alumnos.map((alumno) => (
                  <SelectItem key={alumno.id} value={alumno.id.toString()} className="text-base md:text-lg">
                    {alumno.nombre_apellido}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2 md:space-y-3">
            <Label htmlFor="tipoLoginActual" className="text-base md:text-lg font-medium text-gray-900">
              Tipo de Login Actual
            </Label>
            <Input
              id="tipoLoginActual"
              value={tipoLoginActual}
              className="text-base md:text-lg"
              disabled
            />
          </div>
          <div className="space-y-2 md:space-y-3">
            <Label htmlFor="nuevoNombre" className="text-base md:text-lg font-medium text-gray-900">
              Nuevo Nombre del Alumno
            </Label>
            <Input
              id="nuevoNombre"
              value={nuevoNombre}
              onChange={(e) => setNuevoNombre(e.target.value)}
              className="text-base md:text-lg"
              placeholder="Ingrese el nuevo nombre del alumno"
              aria-required="true"
            />
          </div>
          <div className="space-y-2 md:space-y-3">
            <Label htmlFor="nuevoTipoLogin" className="text-base md:text-lg font-medium text-gray-900">
              Nuevo Tipo de Login
            </Label>
            <Select 
              value={nuevoTipoLogin} 
              onValueChange={setNuevoTipoLogin}
              disabled={isLoading}
            >
              <SelectTrigger id="nuevoTipoLogin" className="text-base md:text-lg">
                <SelectValue placeholder="Seleccione un nuevo tipo de login" />
              </SelectTrigger>
              <SelectContent>
                {tipoLoginOptions.map((tipo) => (
                  <SelectItem key={tipo} value={tipo} className="text-base md:text-lg">
                    {tipo}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <Button 
            type="submit" 
            className="w-full text-base md:text-lg bg-blue-600 hover:bg-blue-700 text-white"
            aria-label="Actualizar alumno"
            disabled={isLoading || !selectedAlumno}
          >
            {isLoading ? 'Actualizando...' : 'Actualizar Alumno'}
          </Button>
        </form>
      </main>
    </div>
  )
}
