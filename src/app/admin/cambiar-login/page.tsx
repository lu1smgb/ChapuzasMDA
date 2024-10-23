'use client'

import { useState } from 'react'
import { Button } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { ArrowLeft } from "lucide-react"
import Link from 'next/link'

const tiposLogin = [
  { value: 'imagenes', label: 'Imágenes' },
  { value: 'pin', label: 'PIN' },
  { value: 'contrasena', label: 'Contraseña' },
]

const alumnos = [
  { id: '1', nombre: 'Ana García' },
  { id: '2', nombre: 'Carlos Rodríguez' },
  { id: '3', nombre: 'María López' },
]

export default function CambiarLogin() {
  const [alumnoSeleccionado, setAlumnoSeleccionado] = useState('')
  const [tipoLoginSeleccionado, setTipoLoginSeleccionado] = useState('')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    console.log('Alumno:', alumnoSeleccionado, 'Nuevo tipo de login:', tipoLoginSeleccionado)
    // Implementar la lógica para guardar los cambios
  }

  return (
    <div className="min-h-screen bg-white md:bg-gradient-to-br md:from-blue-100 md:via-purple-100 md:to-pink-100 flex items-center justify-center p-4">
      <main className="bg-white rounded-lg shadow-lg p-4 md:p-8 w-full md:max-w-md">
        <h1 className="text-2xl md:text-3xl font-bold mb-6 text-center text-gray-900">Cambiar Tipo de Login</h1>
        <nav className="mb-8">
          <Link href="/dashboard" passHref>
            <Button variant="outline" className="w-full text-base md:text-lg bg-yellow-400 hover:bg-yellow-500" aria-label="Volver al dashboard">
              <ArrowLeft className="mr-2 h-4 w-4 md:h-5 md:w-5" aria-hidden="true" />
              Volver
            </Button>
          </Link>
        </nav>
        <form onSubmit={handleSubmit} className="space-y-6 md:space-y-8">
          <div className="space-y-2 md:space-y-3">
            <Label htmlFor="alumno" className="text-base md:text-lg font-medium text-gray-900">
              Seleccionar Alumno
            </Label>
            <Select 
              value={alumnoSeleccionado} 
              onValueChange={setAlumnoSeleccionado}
              aria-required="true"
            >
              <SelectTrigger id="alumno" className="text-base md:text-lg">
                <SelectValue placeholder="Seleccione un alumno" />
              </SelectTrigger>
              <SelectContent>
                {alumnos.map((alumno) => (
                  <SelectItem key={alumno.id} value={alumno.id} className="text-base md:text-lg">
                    {alumno.nombre}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2 md:space-y-3">
            <Label htmlFor="tipoLogin" className="text-base md:text-lg font-medium text-gray-900">
              Tipo de Login
            </Label>
            <Select 
              value={tipoLoginSeleccionado} 
              onValueChange={setTipoLoginSeleccionado}
              aria-required="true"
            >
              <SelectTrigger id="tipoLogin" className="text-base md:text-lg">
                <SelectValue placeholder="Seleccione un tipo de login" />
              </SelectTrigger>
              <SelectContent>
                {tiposLogin.map((tipo) => (
                  <SelectItem key={tipo.value} value={tipo.value} className="text-base md:text-lg">
                    {tipo.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <Button 
            type="submit" 
            className="w-full text-base md:text-lg bg-blue-600 hover:bg-blue-700 text-white"
            aria-label="Aplicar cambios de tipo de login"
          >
            Aplicar Cambios
          </Button>
        </form>
      </main>
    </div>
  )
}