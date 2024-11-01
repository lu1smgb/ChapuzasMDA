'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowLeft, Loader2 } from "lucide-react"
import { supabase } from "@/lib/supabase"

//Código de verificación para que solo pueda registrarse el administrador y no otros.
const verificationCode = '1111';

export default function AdminRegistrationPage() {
  const [formData, setFormData] = useState({
    fullName: '',
    password: '',
    confirmPassword: '',
    codeVerification: '',
  })
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()
  const [successMessage, setSuccessMessage] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setIsLoading(true)

    if (formData.password !== formData.confirmPassword) { // Verificar si las contraseñas coinciden
      setError('Las contraseñas no coinciden');
      setIsLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase // Hacer insert en supabase
        .from('Administrador')
        .insert([
          { 
            nombre_apellidos: formData.fullName,
            contraseña: formData.password,
          }
        ]);

      if (error) throw error;

    setSuccessMessage('Registro exitoso. ¡Bienvenido!');

    //Limpiar el contenido tras enviar el formulario
    setFormData({ fullName: '', password: '', confirmPassword: '', codeVerification: '' });

    } catch (err) {
      setError('Ocurrió un error al registrar. Por favor, inténtelo de nuevo más tarde.')
    } finally {
      setIsLoading(false)
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-100 to-purple-100 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-center">Registro de Administrador</CardTitle>
          <CardDescription className="text-center">Complete el formulario para registrarse como administrador</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
              <Label htmlFor="fullName">Nombre Completo</Label>
              <Input
                id="fullName"
                name="fullName"
                type="text"
                placeholder="Ingrese su nombre completo"
                value={formData.fullName}
                onChange={handleChange}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Contraseña</Label>
              <Input
                id="password"
                type="password"
                name="password"
                placeholder="Ingrese su contraseña"
                value={formData.password}
                onChange={handleChange}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirmar Contraseña</Label>
              <Input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                placeholder="Confirme su contraseña"
                value={formData.confirmPassword}
                onChange={handleChange}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="codeVerification">Código de verificación</Label>
              <Input
              id="codeVerification"
              name="codeVerification"
              type="text"
              placeholder="Ingrese el código de verificación"
              value={formData.codeVerification}
              onChange={handleChange}
              maxLength={4}
              required
              />
              {formData.codeVerification.length === 4 && formData.codeVerification !== verificationCode && (
              <p className="text-red-500 text-sm">El código de verificación es incorrecto</p>
              )}
            </div>
            {error && <p className="text-red-500 text-sm">{error}</p>}
            {successMessage && <p className="text-green-500 text-sm">{successMessage}</p>}
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Registrando...
                </>
              ) : (
                'Registrarse'
              )}
            </Button>
          </form>
        </CardContent>
        <CardFooter>
          <Link href="./" passHref>
            <Button variant="link" className="w-full">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Volver al inicio de sesión
            </Button>
          </Link>
        </CardFooter>
      </Card>
    </div>
  )
}