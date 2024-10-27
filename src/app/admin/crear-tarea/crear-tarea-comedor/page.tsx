'use client'

import { supabase } from "@/lib/supabase";
import { useState } from 'react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { ArrowLeft } from "lucide-react"
import Link from 'next/link'
import { useRouter } from 'next/navigation'

export default function CrearTareaComedor() {
  const [nombre_tarea, setNombre] = useState('')
  const [descripcion, setDescripcion] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [successMessage, setSuccessMessage] = useState('') // Estado para el mensaje de éxito
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')
    setSuccessMessage('') // Limpia el mensaje de éxito al iniciar el envío

    try {
      const { data, error } = await supabase
        .from('Tarea')
        .insert([
          { 
            nombre_tarea, 
            descripcion, 
            tipo_tarea: 'COMEDOR'
          }
        ])
        .select()

      if (error) throw error

      console.log('Tarea creada:', data)
      setSuccessMessage('¡Tarea de comedor creada exitosamente!') // Muestra el mensaje de éxito
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
        <h1 className="text-2xl md:text-3xl font-bold mb-6 text-center text-gray-900">Crear Tarea de Comedor</h1>
        <nav className="mb-8">
          <Link href="/admin/crear-tarea" passHref>
            <Button variant="outline" className="w-full text-base md:text-lg bg-yellow-400 hover:bg-yellow-500" aria-label="Volver al dashboard">
              <ArrowLeft className="mr-2 h-4 w-4 md:h-5 md:w-5" aria-hidden="true" />
              Volver al Dashboard
            </Button>
          </Link>
        </nav>
        {error && <p className="text-red-500 text-center mb-4">{error}</p>}
        {successMessage && <p className="text-green-500 text-center mb-4">{successMessage}</p>} {/* Muestra el mensaje de éxito */}
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
              placeholder="Describa la tarea del comedor"
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
              value="COMEDOR"
              className="text-base md:text-lg bg-gray-100"
              readOnly
              disabled
            />
          </div>
          <Button 
            type="submit" 
            className="w-full text-base md:text-lg bg-blue-600 hover:bg-blue-700 text-white"
            aria-label="Crear tarea de comedor"
            disabled={isLoading}
          >
            {isLoading ? 'Creando...' : 'Crear Tarea de Comedor'}
          </Button>
        </form>
      </main>
    </div>
  )
}
