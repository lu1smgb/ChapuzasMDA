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
import { supabase } from "@/lib/supabase"


interface Profesor {
  id: number;
  nombre_apellido: string;
  aula: string;
}

export default function EditarProfesor() {
  const [profesores, setProfesores] = useState<Profesor[]>([])
  const [selectedProfesor, setSelectedProfesor] = useState<Profesor | null>(null)
  const [nuevoNombre, setNuevoNombre] = useState('')
  const [nuevoAula, setNuevoAula] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [successMessage, setSuccessMessage] = useState('')

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true)
      setError('')
      try {
        // Fetch profesores
        const { data: profesoresData, error: profesoresError } = await supabase
          .from('Profesor')
          .select('id, nombre_apellido, aula')

        if (profesoresError) throw profesoresError

        setProfesores(profesoresData || [])
      } catch (error) {
        console.error('Error fetching data:', error)
        setError('Error al cargar los datos. Por favor, recargue la página.')
      } finally {
        setIsLoading(false)
      }
    }

    fetchData()
  }, [])

  const handleProfesorChange = (profesorId: string) => {
    const profesor = profesores.find(p => p.id.toString() === profesorId)
    setSelectedProfesor(profesor || null)
    if (profesor) {
      setNuevoNombre(profesor.nombre_apellido)
      setNuevoAula(profesor.aula)
    }
    setSuccessMessage('')
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedProfesor) {
      setError('Debe seleccionar un profesor.')
      return
    }

    if (nuevoNombre.trim() === '') {
      setError('El nombre no puede ser una cadena vacía.')
      return
    }

    setIsLoading(true)
    setError('')
    setSuccessMessage('')

    const updates: Partial<Profesor> = {}
    if (nuevoNombre !== selectedProfesor.nombre_apellido) {
      updates.nombre_apellido = nuevoNombre
    }
    if (nuevoAula !== selectedProfesor.aula) {
      updates.aula = nuevoAula
    }

    if (Object.keys(updates).length === 0) {
      setError('No se han realizado cambios.')
      setIsLoading(false)
      return
    }

    try {
      const { data, error } = await supabase
        .from('Profesor')
        .update(updates)
        .eq('id', selectedProfesor.id)
        .select()

      if (error) throw error

      if (data && data.length > 0) {
        const updatedProfesor = data[0] as Profesor
        setSelectedProfesor(updatedProfesor)
        setNuevoNombre(updatedProfesor.nombre_apellido)
        setNuevoAula(updatedProfesor.aula)
        
        // Update the profesores array with the new data
        setProfesores(profesores.map(p => p.id === updatedProfesor.id ? updatedProfesor : p))
        
        setSuccessMessage('Profesor actualizado con éxito')
      }
    } catch (error) {
      console.error('Error updating professor:', error)
      setError('Error al actualizar el profesor. Por favor, intente de nuevo.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-white md:bg-gradient-to-br md:from-blue-100 md:via-purple-100 md:to-pink-100 flex items-center justify-center p-4">
      <main className="bg-white rounded-lg shadow-lg p-4 md:p-8 w-full md:max-w-2xl">
        <h1 className="text-2xl md:text-3xl font-bold mb-6 text-center text-gray-900">Editar Profesor</h1>
        <nav className="mb-8">
          <Link href="/admin/gestionarProfesor" passHref>
            <Button variant="outline" className="w-full text-base md:text-lg bg-yellow-400 hover:bg-yellow-500" aria-label="Volver a gestionar profesores">
              <ArrowLeft className="mr-2 h-4 w-4 md:h-5 md:w-5" aria-hidden="true" />
              Atrás
            </Button>
          </Link>
        </nav>
        {error && <p className="text-red-500 text-center mb-4" role="alert">{error}</p>}
        {successMessage && <p className="text-green-500 text-center mb-4" role="status">{successMessage}</p>}
        <form onSubmit={handleSubmit} className="space-y-6 md:space-y-8">
          <div className="space-y-2 md:space-y-3">
            <Label htmlFor="profesor" className="text-base md:text-lg font-medium text-gray-900">
              Seleccionar Profesor
            </Label>
            <Select 
              onValueChange={handleProfesorChange}
              disabled={isLoading}
            >
              <SelectTrigger id="profesor" className="text-base md:text-lg">
                <SelectValue placeholder="Seleccione un profesor" />
              </SelectTrigger>
              <SelectContent>
                {profesores.map((profesor) => (
                  <SelectItem key={profesor.id} value={profesor.id.toString()} className="text-base md:text-lg">
                    {profesor.nombre_apellido}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2 md:space-y-3">
            <Label htmlFor="nuevoNombre" className="text-base md:text-lg font-medium text-gray-900">
              Nuevo Nombre del Profesor
            </Label>
            <Input
              id="nuevoNombre"
              value={nuevoNombre}
              onChange={(e) => setNuevoNombre(e.target.value)}
              className="text-base md:text-lg"
              placeholder="Ingrese el nuevo nombre del profesor"
              aria-required="true"
            />
          </div>
          <div className="space-y-2 md:space-y-3">
            <Label htmlFor="nuevoAula" className="text-base md:text-lg font-medium text-gray-900">
              Nueva Aula del Profesor
            </Label>
            <Input
              id="nuevoAula"
              value={nuevoAula}
              onChange={(e) => setNuevoAula(e.target.value)}
              className="text-base md:text-lg"
              placeholder="Ingrese el nuevo aula del profesor"
              aria-required="true"
            />
          </div>
          <Button 
            type="submit" 
            className="w-full text-base md:text-lg bg-blue-600 hover:bg-blue-700 text-white"
            aria-label="Actualizar profesor"
            disabled={isLoading || !selectedProfesor}
          >
            {isLoading ? 'Actualizando...' : 'Actualizar Profesor'}
          </Button>
        </form>
      </main>
    </div>
  )
}
