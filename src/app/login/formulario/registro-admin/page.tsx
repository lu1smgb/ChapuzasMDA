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
const verificationCode = '1234';

interface FormData { // Interfaz para el formulario de registro
  fullName: string;
  password: string;
  confirmPassword: string;
  codeVerification: string;
  image: File | null;
}

export default function AdminRegistrationPage() {
  const [formData, setFormData] = useState<FormData>({
    fullName: '',
    password: '',
    confirmPassword: '',
    codeVerification: '',
    image: null 
  })
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()
  const [successMessage, setSuccessMessage] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const fileType = file.type;
      if (fileType === 'image/jpeg' || fileType === 'image/png' || fileType === 'image/jpg' ) {
        setFormData(prev => ({ ...prev, image: file }));
      } else {
        setError('Por favor, seleccione una imagen en formato JPG, JPEG o PNG.');
      }
    }
  };

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
      let imageUrl = '';
      if (formData.image) {
        const fileExt = formData.image.name.split('.').pop() // Obtener la extensión del archivo
        const fileName = `${Math.random()}.${fileExt}` // Nombre del archivo
        const filePath = `${fileName}`  // Ruta del archivo
        
        const { data: uploadData, error: uploadError } = await supabase
          .storage
          .from('ImagenesPrueba/administradores')   // Nombre del bucket de la imagen
          .upload(filePath, formData.image); // Hacer el upload de la imagen

        if (uploadError) throw uploadError;

        const { data: { publicUrl } } = supabase.storage
        .from('ImagenesPrueba/administradores')   // Nombre del bucket de la imagen
        .getPublicUrl(filePath)

        imageUrl = publicUrl; // URL de la imagen
      }
      

      const { data, error } = await supabase // Hacer insert en supabase
        .from('Administrador')
        .insert([
          { 
            nombre: formData.fullName, // Insertar el nombre completo
            credencial: formData.password, // Insertar la contraseña
            imagen_perfil: imageUrl // Insertar la URL de la imagen
          }
        ]);

      if (error) throw error;

    setSuccessMessage('Registro exitoso. ¡Bienvenido!');

    //Limpiar el contenido tras enviar el formulario
    setFormData({ fullName: '', password: '', confirmPassword: '', codeVerification: '', image: null });

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
            <div className="space-y-2">
              <Label htmlFor="image">Añade la imagen de perfil (opcional)</Label>
              <div className="flex items-center justify-center w-full h-32 border-2 border-dashed border-gray-300 rounded-lg relative">
                {formData.image ? (
                  <img
                    src={URL.createObjectURL(formData.image)}
                    alt="Imagen de perfil"
                    className="h-full w-full object-cover rounded-lg"
                  />
                ) : (
                  <div className="text-center text-gray-500">
                    <svg
                      className="mx-auto h-12 w-12 text-gray-400"
                      stroke="currentColor"
                      fill="none"
                      viewBox="0 0 48 48"
                      aria-hidden="true"
                    >
                      <path
                        d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                        strokeWidth={2}
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                    <p>Arrastra una imagen o haz clic para seleccionar una imagen (JPG, JPEG, PNG)</p>
                  </div>
                )}
                <Input
                  id="image"
                  name="image"
                  type="file"
                  accept="image/jpeg,image/png,image/jpg"
                  onChange={handleFileChange}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                />
              </div>
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
                'Registrar'
              )}
            </Button>
          </form>
        </CardContent>
        <CardFooter>
          <Button variant="link" onClick={() => router.push('/login')}>
            <ArrowLeft className="mr-2 h-4 w-4" /> Volver al inicio de sesión
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}