'use client'

import { useState } from 'react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ArrowLeft } from "lucide-react"
import Link from 'next/link'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseAnonKey);

export default function CrearMenu() {
  const [nombre, setNombre] = useState('')
  const [urlImagen, setUrlImagen] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [successMessage, setSuccessMessage] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')
    setSuccessMessage('')

    if (!nombre || !urlImagen) {
      setError('Debe llenar todos los campos.')
      setIsLoading(false)
      return
    }

    try {
      const { data, error } = await supabase
        .from('Menu')
        .insert([{ nombre, url_imagen: urlImagen }])

      if (error) throw error
      setSuccessMessage('Menú creado con éxito')
      setNombre('')
      setUrlImagen('')
    } catch (error) {
      console.error('Error al crear el menú:', error)
      setError('Error al crear el menú. Por favor, intente de nuevo.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-white md:bg-gradient-to-br md:from-blue-100 md:via-purple-100 md:to-pink-100 flex items-center justify-center p-4">
      <main className="bg-white rounded-lg shadow-lg p-4 md:p-8 w-full md:max-w-2xl">
        <h1 className="text-2xl md:text-3xl font-bold mb-6 text-center text-gray-900">Crear Menú</h1>
        <nav className="mb-8">
          <Link href="/admin/gestionarMenu" passHref>
            <Button variant="outline" className="w-full text-base md:text-lg bg-yellow-400 hover:bg-yellow-500" aria-label="Volver al dashboard">
              <ArrowLeft className="mr-2 h-4 w-4 md:h-5 md:w-5" aria-hidden="true" />
              Atrás
            </Button>
          </Link>
        </nav>
        {error && <p className="text-red-500 text-center mb-4" role="alert">{error}</p>}
        {successMessage && <p className="text-green-500 text-center mb-4" role="status">{successMessage}</p>}
        <form onSubmit={handleSubmit} className="space-y-6 md:space-y-8">
          <div className="space-y-2 md:space-y-3">
            <Label htmlFor="nombre" className="text-base md:text-lg font-medium text-gray-900">
              Nombre del Menú
            </Label>
            <Input
              id="nombre"
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              className="text-base md:text-lg"
              placeholder="Ingrese el nombre del menú"
              required
              aria-required="true"
            />
          </div>
          <div className="space-y-2 md:space-y-3">
            <Label htmlFor="urlImagen" className="text-base md:text-lg font-medium text-gray-900">
              URL de la Imagen
            </Label>
            <Input
              id="urlImagen"
              value={urlImagen}
              onChange={(e) => setUrlImagen(e.target.value)}
              className="text-base md:text-lg"
              placeholder="Ingrese la URL de la imagen"
              required
              aria-required="true"
            />
          </div>
          <Button 
            type="submit" 
            className="w-full text-base md:text-lg bg-blue-600 hover:bg-blue-700 text-white"
            aria-label="Crear menú"
            disabled={isLoading}
          >
            {isLoading ? 'Creando...' : 'Crear Menú'}
          </Button>
        </form>
      </main>
    </div>
  )
}
