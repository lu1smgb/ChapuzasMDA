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
import { useRouter } from 'next/navigation'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient('https://your-project.supabase.co', 'your-anon-key')

export default function CrearAlumno() {
  const [nombre, setNombre] = useState('')
  const [tipoLogin, setTipoLogin] = useState('')
  const [tipoLoginOptions, setTipoLoginOptions] = useState<string[]>([]) 
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()

  useEffect(() => {
    // Cargar los valores permitidos de `tipo_login` desde la tabla de referencia `tipo_login_values`
    const fetchTipoLoginOptions = async () => {
      try {
        const { data, error } = await supabase
          .from('tipo_login_valores') 
          .select('valor') 

        if (error) throw error

        setTipoLoginOptions(data.map(item => item.valor)) 
      } catch (error) {
        console.error('Error fetching tipo_login options:', error)
      }
    }

    fetchTipoLoginOptions()
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')

    if (!tipoLogin || !nombre) {
      setError('Debe llenar todos los campos y seleccionar un valor permitido para el campo Tipo de Login.')
      setIsLoading(false)
      return
    }

    try {
      // Insertar un nuevo alumno en la tabla `Alumno`
      const { data, error } = await supabase
        .from('Alumno') // Asegúrate de que esta tabla existe en tu base de datos
        .insert([
          { 
            nombre_apellido: nombre, // Revisa si este campo es correcto en tu tabla
            tipo_login: tipoLogin,
          }
        ])

      if (error) throw error

      console.log('Alumno creado:', data)
      router.push('/admin/gestionarAlumnos')
    } catch (error) {
      setError('Error al crear el alumno. Por favor, intente de nuevo.')
      console.error('Error creating student:', error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-white md:bg-gradient-to-br md:from-blue-100 md:via-purple-100 md:to-pink-100 flex items-center justify-center p-4">
      <main className="bg-white rounded-lg shadow-lg p-4 md:p-8 w-full md:max-w-2xl">
        <h1 className="text-2xl md:text-3xl font-bold mb-6 text-center text-gray-900">Crear Alumno</h1>
        <nav className="mb-8">
          <Link href="/admin/dashboard" passHref>
            <Button variant="outline" className="w-full text-base md:text-lg bg-yellow-400 hover:bg-yellow-500" aria-label="Volver al dashboard">
              <ArrowLeft className="mr-2 h-4 w-4 md:h-5 md:w-5" aria-hidden="true" />
              Atrás
            </Button>
          </Link>
        </nav>
        {error && <p className="text-red-500 text-center mb-4">{error}</p>}
        <form onSubmit={handleSubmit} className="space-y-6 md:space-y-8">
          <div className="space-y-2 md:space-y-3">
            <Label htmlFor="nombre" className="text-base md:text-lg font-medium text-gray-900">
              Nombre del Alumno
            </Label>
            <Input
              id="nombre"
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              className="text-base md:text-lg"
              placeholder="Ingrese el nombre del alumno"
              required
            />
          </div>
          <div className="space-y-2 md:space-y-3">
            <Label htmlFor="tipoLogin" className="text-base md:text-lg font-medium text-gray-900">
              Tipo de Login
            </Label>
            <Select 
              value={tipoLogin} 
              onValueChange={setTipoLogin}
              aria-required="true"
            >
              <SelectTrigger id="tipoLogin" className="text-base md:text-lg">
                <SelectValue placeholder="Seleccione un valor" />
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
            aria-label="Crear alumno"
            disabled={isLoading}
          >
            {isLoading ? 'Creando...' : 'Crear Alumno'}
          </Button>
        </form>
      </main>
    </div>
  )
}