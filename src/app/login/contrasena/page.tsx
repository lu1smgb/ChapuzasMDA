'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { ArrowLeft, Lock } from "lucide-react"
import Link from 'next/link'
import { supabase } from '@/lib/supabase'

/**
 * Componente principal para la página de login con contraseña.
 * Maneja el estado de la contraseña, errores y datos del alumno.
 */
export default function LoginContrasena() {
  const [contrasena, setContrasena] = useState('')
  const [error, setError] = useState('')
  const [alumno, setAlumno] = useState<{ identificador: string; nombre: string } | null>(null)
  const router = useRouter()

  /**
   * useEffect que se ejecuta al montar el componente.
   * Obtiene el ID del alumno desde localStorage y llama a fetchAlumno.
   * Si no hay ID de alumno, redirige a la página de lista.
   */
  useEffect(() => {
    const alumnoId = localStorage.getItem('alumnoId')
    console.log('alumnoId en localStorage:', alumnoId)  // Console log para verificar
  
    if (alumnoId) {
      fetchAlumno(alumnoId)
    } else {
      router.push('/lista')
    }
  }, [])

  /**
   * Función asíncrona para obtener los datos del alumno desde la base de datos.
   * @param identificador - El ID del alumno a buscar.
   */
  const fetchAlumno = async (identificador: string) => {
    const { data, error } = await supabase
      .from('Alumno')
      .select('*')
      .eq('identificador', identificador)
      .single()

    if (error) {
      console.error('Error fetching alumno:', error)
      setError('No se pudo obtener los datos del alumno.')
    } else {
      setAlumno(data)
    }
  }

  /**
   * Manejador para el cambio en el campo de contraseña.
   * @param event - El evento de cambio del input.
   */
  const handleContrasenaChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setContrasena(event.target.value)
  }

  /**
   * Manejador para el envío del formulario.
   * @param event - El evento de envío del formulario.
   */
  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setError('')

    if (!contrasena) {
      setError('Por favor, ingrese su contraseña')
      return
    }

    if (!alumno) {
      setError('No se ha seleccionado un alumno')
      return
    }

    try {
      const { data, error } = await supabase
        .from('Alumno')
        .select('identificador')
        .eq('identificador', alumno.identificador)
        .eq('credencial', contrasena)
        .single()

      if (error) throw error

      if (data) {
        router.push('/menu-calendario-agenda')
        localStorage.setItem('userId', alumno.identificador)
        localStorage.setItem('nombreUsuario', alumno.nombre) // Guardar el nombre del alumno en el localStorage
      } else {
        setError('Contraseña incorrecta')
      }
    } catch (error) {
      console.error('Error verificando contraseña:', error)
      setError('Error al verificar la contraseña. Por favor, intente de nuevo.')
    }
  }

  return (
    <div className="font-escolar min-h-screen bg-gradient-to-br from-blue-100 via-purple-100 to-pink-100 flex flex-col p-8">
      <Link href="/login" passHref>
        <Button variant="outline" className="self-start mb-8 bg-yellow-400 hover:bg-yellow-500 text-gray-800 text-xl py-6 px-8">
          <ArrowLeft className="mr-2 h-6 w-6" />
          Volver
        </Button>
      </Link>
      <main className="flex-grow flex flex-col items-center justify-center">
        <Card className="w-full max-w-md bg-white/80 backdrop-blur-md shadow-lg">
          <CardHeader>
            <CardTitle className="text-3xl font-bold text-center text-gray-900">Ingresa tu Contraseña</CardTitle>
          </CardHeader>
          <CardContent>
            {alumno ? (
              <>
                <p className="text-xl text-center mb-6">
                  Bienvenido, <strong>{alumno.nombre}</strong>
                </p>
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="flex flex-col items-center">
                    <Lock className="h-12 w-12 text-blue-500 mb-4" />
                    <Input
                      type="password"
                      value={contrasena}
                      onChange={handleContrasenaChange}
                      className="text-xl text-center w-full h-16"
                      placeholder="Ingresa tu contraseña"
                      required
                    />
                  </div>
                  {error && <p className="text-red-500 text-center">{error}</p>}
                  <Button 
                    type="submit" 
                    className="w-full bg-blue-500 hover:bg-blue-600 text-white text-xl py-6"
                  >
                    Ingresar
                  </Button>
                </form>
              </>
            ) : (
              <p className="text-center text-red-500">
                {error || 'Cargando...'}
              </p>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  )
}