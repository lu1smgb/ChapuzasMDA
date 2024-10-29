'use client'

import { useState, useEffect } from 'react'
import { Button } from "@/components/ui/button"
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
}

export default function EliminarProfesor() {
  const [profesores, setProfesores] = useState<Profesor[]>([])
  const [selectedProfesorId, setSelectedProfesorId] = useState<string>('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [successMessage, setSuccessMessage] = useState('')

  useEffect(() => {
    const fetchProfesores = async () => {
      setIsLoading(true)
      setError('')
      try {
        const { data, error } = await supabase
          .from('Profesor')
          .select('id, nombre_apellido')
          .order('nombre_apellido', { ascending: true })

        if (error) throw error

        setProfesores(data || [])
      } catch (error) {
        console.error('Error fetching profesores:', error)
        setError('Error al cargar los profesores. Por favor, recargue la página.')
      } finally {
        setIsLoading(false)
      }
    }

    fetchProfesores()
  }, [])

  const handleProfesorChange = (profesorId: string) => {
    setSelectedProfesorId(profesorId)
    setSuccessMessage('')
    setError('')
  }

  const handleDelete = async () => {
    if (!selectedProfesorId) {
      setError('Debe seleccionar un profesor para eliminar.')
      return
    }

    const confirmDelete = window.confirm("¿Está seguro de que desea eliminar este profesor? Esta acción no se puede deshacer.");
    if (!confirmDelete) {
      return;
    }

    setIsLoading(true)
    setError('')
    setSuccessMessage('')

    try {
      const { error } = await supabase
        .from('Profesor')
        .delete()
        .eq('id', selectedProfesorId)

      if (error) throw error

      setProfesores(profesores.filter(profesor => profesor.id.toString() !== selectedProfesorId))
      setSuccessMessage('Profesor eliminado con éxito')
      setSelectedProfesorId('')
    } catch (error) {
      console.error('Error deleting professor:', error)
      setError('Error al eliminar el profesor. Por favor, intente de nuevo.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-white md:bg-gradient-to-br md:from-blue-100 md:via-purple-100 md:to-pink-100 flex items-center justify-center p-4">
      <main className="bg-white rounded-lg shadow-lg p-4 md:p-8 w-full md:max-w-2xl">
        <h1 className="text-2xl md:text-3xl font-bold mb-6 text-center text-gray-900">Eliminar Profesor</h1>
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
        <div className="space-y-6 md:space-y-8">
          <div className="space-y-2 md:space-y-3">
            <Label htmlFor="profesor" className="text-base md:text-lg font-medium text-gray-900">
              Seleccionar Profesor
            </Label>
            <Select 
              value={selectedProfesorId}
              onValueChange={handleProfesorChange}
              disabled={isLoading}
            >
              <SelectTrigger id="profesor" className="text-base md:text-lg">
                <SelectValue placeholder="Seleccione un profesor para eliminar" />
              </SelectTrigger>
              <SelectContent>
                {profesores.length === 0 ? (
                  <SelectItem value="no-profesores" disabled className="text-base md:text-lg">
                    No hay profesores disponibles
                  </SelectItem>
                ) : (
                  profesores.map((profesor) => (
                    <SelectItem key={profesor.id} value={profesor.id.toString()} className="text-base md:text-lg">
                      {profesor.nombre_apellido}
                    </SelectItem>
                  ))
                )}
              </SelectContent>
            </Select>
          </div>
          <Button 
            onClick={handleDelete}
            className="w-full text-base md:text-lg bg-red-600 hover:bg-red-700 text-white"
            aria-label="Eliminar profesor seleccionado"
            disabled={isLoading || !selectedProfesorId}
          >
            {isLoading ? 'Eliminando...' : 'Eliminar Profesor'}
          </Button>
        </div>
      </main>
    </div>
  )
}

