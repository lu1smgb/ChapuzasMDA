'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { ArrowLeft, Key, Backpack } from "lucide-react"
import Link from 'next/link'
import { supabase } from '@/lib/supabase'

export default function LoginPin() {
  const [pin, setPin] = useState('')
  const [error, setError] = useState('')
  const [alumno, setAlumno] = useState<{ identificador: string; nombre: string } | null>(null)
  const router = useRouter()

  useEffect(() => {
    const alumnoId = localStorage.getItem('alumnoId') 
    console.log('alumnoId en localStorage:', alumnoId)
  
    if (alumnoId) {
      fetchAlumno(alumnoId)
    } else {
      router.push('/lista')
    }
  }, [])
  
  const fetchAlumno = async (identificador: string) => {
    const { data, error } = await supabase
      .from('Alumno')
      .select('identificador, nombre')
      .eq('identificador', identificador)
      .single()

    if (error) {
      console.error('Error fetching alumno:', error)
      router.push('/lista')
    } else if (data) {
      setAlumno(data)
    }
  }

  const handlePinInput = (digit: string) => {
    if (pin.length < 4) {
      setPin(prev => prev + digit)
    }
  }

  const handleBackspace = () => {
    setPin(prev => prev.slice(0, -1))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (pin.length !== 4) {
      setError('El PIN debe tener 4 dígitos')
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
        .eq('credencial', pin)
        .single()

      if (error) throw error

      if (data) {
        router.push('/menu-calendario-agenda')
        localStorage.setItem('userId', alumno.identificador) // Guardar el identificador del alumno en el localStorage
        localStorage.setItem('nombreUsuario', alumno.nombre) // Guardar el nombre del alumno en el localStorage
        console.log("userId en localStorage después del login:", localStorage.getItem('userId'));
      } else {
        setError('PIN incorrecto')
      }
    } catch (error) {
      console.error('Error verificando PIN:', error)
      setError('Error al verificar el PIN. Por favor, intente de nuevo.')
    }
  }

  const renderKeypad = () => {
    const digits = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '0']
    return (
      <div className="grid grid-cols-3 gap-4 mt-6">
        {digits.map((digit) => (
          <Button
            key={digit}
            onClick={() => handlePinInput(digit)}
            className="text-3xl py-8 bg-blue-400 hover:bg-blue-500 text-white"
          >
            {digit}
          </Button>
        ))}
        <Button
          onClick={handleBackspace}
          className="col-span-2 text-3xl py-8 bg-red-400 hover:bg-red-500 text-white"
        >
          <Backpack className="h-8 w-8" />
        </Button>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-100 via-purple-100 to-pink-100 flex flex-col p-8">
      <Link href="/lista-alumnos" passHref>
        <Button variant="outline" className="self-start mb-8 bg-yellow-400 hover:bg-yellow-500 text-gray-800 text-xl py-6 px-8">
          <ArrowLeft className="mr-2 h-6 w-6" />
          Volver a la Lista de Alumnos
        </Button>
      </Link>
      <main className="flex-grow flex flex-col items-center justify-center">
        <Card className="w-full max-w-2xl bg-white/80 backdrop-blur-md shadow-lg">
          <CardHeader>
            <CardTitle className="text-3xl font-bold text-center text-gray-900">Ingresa tu PIN</CardTitle>
          </CardHeader>
          <CardContent>
            {alumno ? (
              <>
                <p className="text-xl text-center mb-6">
                  Bienvenido, <strong>{alumno.nombre}</strong>
                </p>
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="flex flex-col items-center">
                    <Key className="h-12 w-12 text-blue-500 mb-4" />
                    <Input
                      type="password"
                      value={pin}
                      readOnly
                      className="text-4xl text-center w-48 h-16"
                      placeholder="****"
                    />
                  </div>
                  {renderKeypad()}
                  {error && <p className="text-red-500 text-center mt-4">{error}</p>}
                  <Button 
                    type="submit" 
                    className="w-full bg-green-500 hover:bg-green-600 text-white text-2xl py-6 mt-6"
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