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
import { ArrowLeft, Eye, EyeOff } from "lucide-react"
import Link from 'next/link'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseAnonKey);

export default function CrearAlumno() {
  const [nombre, setNombre] = useState('')
  const [tipoLogin, setTipoLogin] = useState('')
  const [password, setPassword] = useState('') // New state for password
  const [showPassword, setShowPassword] = useState(false) // State to toggle password visibility
  const [tipoLoginOptions, setTipoLoginOptions] = useState<string[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [successMessage, setSuccessMessage] = useState('')
  const [isLoadingOptions, setIsLoadingOptions] = useState(true)

  useEffect(() => {
    const fetchTipoLoginOptions = async () => {
      setIsLoadingOptions(true)
      setError('')
      try {
        console.log('Fetching tipo_login options...')
        const { data, error } = await supabase
          .from('TipoLogin')
          .select('tipo_login')

        if (error) throw error

        console.log('Received data:', data)
        if (!data || data.length === 0) {
          throw new Error('No se encontraron opciones de tipo de login')
        }

        const options = data.map(item => item.tipo_login)
        console.log('Processed options:', options)
        setTipoLoginOptions(options)
        
        // Set the first option as default if available
        if (options.length > 0) {
          setTipoLogin(options[0])
        }
      } catch (error) {
        console.error('Error fetching tipo_login options:', error)
        setError('Error al cargar las opciones de tipo de login. Por favor, recargue la página.')
      } finally {
        setIsLoadingOptions(false)
      }
    }

    fetchTipoLoginOptions()
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')
    setSuccessMessage('')

    if (!tipoLogin || !nombre || !password) {
      setError('Debe llenar todos los campos y seleccionar un valor permitido para el campo Tipo de Login.')
      setIsLoading(false)
      return
    }

    try {
      console.log('Submitting form with:', { nombre, tipoLogin, password })
      const { data, error } = await supabase
        .from('Alumno')
        .insert([
          { 
            nombre_apellido: nombre,
            tipo_login: tipoLogin,
            credenciales: password, 
          }
        ])

      if (error) throw error

      console.log('Alumno creado:', data)
      setSuccessMessage('Alumno creado con éxito')

      // Clear the form fields
      setNombre('')
      setTipoLogin('')
      setPassword('')
    } catch (error) {
      console.error('Error creating student:', error)
      setError('Error al crear el alumno. Por favor, intente de nuevo.')
    } finally {
      setIsLoading(false)
    }
  }

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword)
  }

  return (
    <div className="min-h-screen bg-white md:bg-gradient-to-br md:from-blue-100 md:via-purple-100 md:to-pink-100 flex items-center justify-center p-4">
      <main className="bg-white rounded-lg shadow-lg p-4 md:p-8 w-full md:max-w-2xl">
        <h1 className="text-2xl md:text-3xl font-bold mb-6 text-center text-gray-900">Crear Alumno</h1>
        <nav className="mb-8">
          <Link href="/admin/gestionarAlumno" passHref>
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
              Nombre del Alumno
            </Label>
            <Input
              id="nombre"
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              className="text-base md:text-lg"
              placeholder="Ingrese el nombre del alumno"
              required
              aria-required="true"
            />
          </div>
          <div className="space-y-2 md:space-y-3">
            <Label htmlFor="tipoLogin" className="text-base md:text-lg font-medium text-gray-900">
              Tipo de Login
            </Label>
            <Select 
              value={tipoLogin} 
              onValueChange={setTipoLogin}
              disabled={isLoadingOptions}
            >
              <SelectTrigger id="tipoLogin" className="text-base md:text-lg">
                <SelectValue placeholder={isLoadingOptions ? "Cargando opciones..." : "Seleccione un valor"} />
              </SelectTrigger>
              <SelectContent>
                {tipoLoginOptions.map((tipo) => (
                  <SelectItem key={tipo} value={tipo} className="text-base md:text-lg">
                    {tipo}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {isLoadingOptions && <p className="text-sm text-gray-500">Cargando opciones de tipo de login...</p>}
          </div>
          <div className="space-y-2 md:space-y-3">
            <Label htmlFor="password" className="text-base md:text-lg font-medium text-gray-900">
              Contraseña
            </Label>
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="text-base md:text-lg pr-10"
                placeholder="Ingrese la contraseña"
                required
                aria-required="true"
              />
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="absolute right-0 top-0 h-full px-3"
                onClick={togglePasswordVisibility}
                aria-label={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </Button>
            </div>
          </div>
          <Button 
            type="submit" 
            className="w-full text-base md:text-lg bg-blue-600 hover:bg-blue-700 text-white"
            aria-label="Crear alumno"
            disabled={isLoading || isLoadingOptions}
          >
            {isLoading ? 'Creando...' : 'Crear Alumno'}
          </Button>
        </form>
      </main>
    </div>
  )
}