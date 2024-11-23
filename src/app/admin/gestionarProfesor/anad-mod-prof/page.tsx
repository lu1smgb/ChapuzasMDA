'use client'

import { useState, useEffect } from 'react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ArrowLeft, Eye, EyeOff } from 'lucide-react'
import { createClient } from '@supabase/supabase-js'
import { useRouter, useSearchParams } from 'next/navigation'
import { Alert, AlertDescription } from "@/components/ui/alert"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseAnonKey);

interface Profesor {
  identificador: number;
  nombre: string;
  imagen_perfil: string;
  credencial: string;
  aula: string;
}

export default function TeacherForm() {
  const [teacher, setTeacher] = useState<Profesor | null>(null)
  const [name, setName] = useState('')
  const [password, setPassword] = useState('')
  const [aula, setAula] = useState('')
  const [image, setImage] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const router = useRouter()
  const searchParams = useSearchParams()
  const id = searchParams.get('id')

  useEffect(() => {
    if (id) {
      fetchTeacher(parseInt(id));
    }
  }, [id]);

  const fetchTeacher = async (id: number) => {
    try {
      const { data, error } = await supabase
        .from("Profesor")
        .select("*")
        .eq('identificador', id)
        .single();

      if (error) throw error;

      setTeacher(data);
      setName(data.nombre);
      setPassword(data.credencial);
      setAula(data.aula);
      setImage(data.imagen_perfil);
    } catch (error) {
      console.error("Error al obtener el profesor:", error);
      setError('Error al cargar los datos del profesor.');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true)
    setError('')
    setSuccess('')
    if (!name || !password || !aula) {
      setError('Debe llenar todos los campos obligatorios.')
      setIsLoading(false)
      return
    }
    
    try {
      if (teacher) {
        const { error } = await supabase
          .from('Profesor')
          .update({
            nombre: name,
            credencial: password,
            aula,
            imagen_perfil: image
          })
          .eq('identificador', teacher.identificador);
        if (error) throw error;
        setSuccess('Profesor modificado correctamente.');
      } else {
        const { error } = await supabase
          .from("Profesor")
          .insert({
            nombre: name,
            credencial: password,
            aula: aula,
            imagen_perfil: image,
          });
        if (error) throw error;
        setSuccess('Profesor añadido correctamente.');
      }
      setTimeout(() => {
        router.push('.');
      }, 2000);
    } catch (error) {
      console.error("Error al guardar el profesor:", error);
      setError('Error al guardar el profesor. Por favor, inténtelo de nuevo.');
    } finally {
      setIsLoading(false)
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-4 md:p-8 w-full max-w-4xl mx-auto">
      <nav className="mb-4">
        <Button onClick={() => router.push('.')} variant="outline" className="text-base bg-yellow-400 hover:bg-yellow-500">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Volver
        </Button>
      </nav>

      <h1 className="text-2xl font-bold mb-6 text-center text-gray-900">
        {teacher ? 'Modificar Profesor' : 'Añadir Nuevo Profesor'}
      </h1>

      {error && (
        <Alert variant="destructive" className="mb-4">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {success && (
        <Alert variant="default" className="mb-4 bg-green-100 text-green-800 border-green-300">
          <AlertDescription>{success}</AlertDescription>
        </Alert>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="nombre">Nombre del Profesor</Label>
            <Input
              id="nombre"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Nombre completo"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="aula">Aula</Label>
            <Input
              id="aula"
              value={aula}
              onChange={(e) => setAula(e.target.value)}
              placeholder="Ej: Aula 2"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="image">URL de la Imagen de Perfil</Label>
            <Input
              id="image"
              value={image}
              onChange={(e) => setImage(e.target.value)}
            />
          </div>
        </div>
        <div className="space-y-2">
          <Label htmlFor="password">Credencial</Label>
          <div className="relative">
            <Input
              id="password"
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="pr-10"
              placeholder="Credencial"
              required
            />
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="absolute right-0 top-0 h-full px-3"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </Button>
          </div>
        </div>
        <Button type="submit" className="w-full bg-green-600 hover:bg-green-700 text-white" disabled={isLoading}>
          {teacher ? 'Guardar Cambios' : 'Añadir Profesor'}
        </Button>
      </form>
    </div>
  )
}




