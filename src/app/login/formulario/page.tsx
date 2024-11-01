'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowLeft, Loader2 } from "lucide-react"

export default function AdminLoginPage() {
  const [fullName, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setIsLoading(true)

    try {
      const response = await fetch('/api/login', { // Llamar a la ruta de login
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fullName, password }),
      })

      const data = await response.json()

      if (data.success){
        localStorage.setItem('adminName', fullName);  // Guardar el nombre del administrador en el localStorage
        router.push('/admin') // Redirigir al dashboard del administrador
      } else {
        setError('Credenciales incorrectas. Por favor, inténtelo de nuevo.')
      }
    } catch (err) {
      setError('Ocurrió un error al iniciar sesión. Por favor, inténtelo de nuevo más tarde.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-100 to-purple-100 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-center">Iniciar Sesión</CardTitle>
          <CardDescription className="text-center">Ingrese sus credenciales para acceder al panel de administración</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="fullName">Nombre y apellidos</Label>
              <Input
                id="fullName"
                type="text"
                placeholder="Ingrese su nombre y apellidos"
                value={fullName}
                onChange={(e) => setUsername(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Contraseña</Label>
              <Input
                id="password"
                type="password"
                placeholder="Ingrese su contraseña"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            {error && <p className="text-red-500 text-sm">{error}</p>}
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Iniciando sesión...
                </>
              ) : (
                'Iniciar Sesión'
              )}
            </Button>
          </form>
        </CardContent>
        <CardFooter className="flex flex-col space-y-4">
          <Link href="./admin" passHref>
            <Button variant="outline" className="w-full">
              Registrarse como Administrador
            </Button>
          </Link>
          <Link href="/" passHref>
            <Button variant="link" className="w-full">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Volver a la página principal
            </Button>
          </Link>
        </CardFooter>
      </Card>
    </div>
  )
}