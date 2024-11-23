'use client'

import { useState, useEffect } from 'react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ArrowLeft, Eye, EyeOff } from 'lucide-react'
import { createClient } from '@supabase/supabase-js'
import { useRouter, useSearchParams } from 'next/navigation'
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Checkbox } from "@/components/ui/checkbox"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseAnonKey);

interface Alumno {
  identificador: number;
  nombre: string;
  imagen_perfil: string;
  credencial: string;
  año_nacimiento: string;
  aula: string;
  tipo_login: string;
  IU_Audio: boolean;
  IU_Video: boolean;
  IU_Imagen: boolean;
  IU_Pictograma: boolean;
  IU_Texto: boolean;
  numero_pasos: number;
}

export default function StudentForm() {
  const [student, setStudent] = useState<Alumno | null>(null)
  const [name, setName] = useState('')
  const [password, setPassword] = useState('')
  const [aula, setAula] = useState('')
  const [image, setImage] = useState('')
  const [birthYear, setBirthYear] = useState('')
  const [loginType, setLoginType] = useState('')
  const [IU_Audio, setIU_Audio] = useState(false)
  const [IU_Video, setIU_Video] = useState(false)
  const [IU_Imagen, setIU_Imagen] = useState(false)
  const [IU_Pictograma, setIU_Pictograma] = useState(false)
  const [IU_Texto, setIU_Texto] = useState(false)
  const [numeroPasos, setNumeroPasos] = useState(0)
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const router = useRouter()
  const searchParams = useSearchParams()
  const id = searchParams.get('id')

  useEffect(() => {
    if (id) {
      fetchStudent(parseInt(id));
    }
  }, [id]);

  const fetchStudent = async (id: number) => {
    try {
      const { data, error } = await supabase
        .from("Alumno")
        .select("*")
        .eq('identificador', id)
        .single();

      if (error) throw error;

      setStudent(data);
      setName(data.nombre);
      setPassword(data.credencial);
      setAula(data.aula);
      setImage(data.imagen_perfil);
      setBirthYear(data.año_nacimiento);
      setLoginType(data.tipo_login);
      setIU_Audio(data.IU_Audio);
      setIU_Video(data.IU_Video);
      setIU_Imagen(data.IU_Imagen);
      setIU_Pictograma(data.IU_Pictograma);
      setIU_Texto(data.IU_Texto);
      setNumeroPasos(data.numero_pasos);
    } catch (error) {
      console.error("Error al obtener el alumno:", error);
      setError('Error al cargar los datos del alumno.');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true)
    setError('')
    setSuccess('')
    if (!name || !password || !aula || !birthYear || !loginType) {
      setError('Debe llenar todos los campos obligatorios.')
      setIsLoading(false)
      return
    }
    
    try {
      const studentData = {
        nombre: name,
        credencial: password,
        aula,
        imagen_perfil: image,
        año_nacimiento: birthYear,
        tipo_login: loginType,
        IU_Audio,
        IU_Video,
        IU_Imagen,
        IU_Pictograma,
        IU_Texto,
        numero_pasos: numeroPasos
      };

      if (student) {
        const { error } = await supabase
          .from('Alumno')
          .update(studentData)
          .eq('identificador', student.identificador);
        if (error) throw error;
        setSuccess('Alumno modificado correctamente.');
      } else {
        const { error } = await supabase
          .from("Alumno")
          .insert(studentData);
        if (error) throw error;
        setSuccess('Alumno añadido correctamente.');
      }
      setTimeout(() => {
        router.push('.');
      }, 2000);
    } catch (error) {
      console.error("Error al guardar el alumno:", error);
      setError('Error al guardar el alumno. Por favor, inténtelo de nuevo.');
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
        {student ? 'Modificar Alumno' : 'Añadir Nuevo Alumno'}
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
            <Label htmlFor="nombre">Nombre del Alumno</Label>
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
          <div className="space-y-2">
            <Label htmlFor="birthYear">Año de Nacimiento</Label>
            <Input
              id="birthYear"
              type="date"
              value={birthYear}
              onChange={(e) => setBirthYear(e.target.value)}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="loginType">Tipo de Login</Label>
            <Select value={loginType} onValueChange={setLoginType}>
              <SelectTrigger>
                <SelectValue placeholder="Seleccione tipo de login" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="PIN">PIN</SelectItem>
                <SelectItem value="CONTRASEÑA">CONTRASEÑA</SelectItem>
                <SelectItem value="IMAGEN">IMAGEN</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="numeroPasos">Número de Pasos</Label>
            <Input
              id="numeroPasos"
              type="number"
              value={numeroPasos}
              onChange={(e) => setNumeroPasos(parseInt(e.target.value))}
              required
            />
          </div>
        </div>
        <div className="space-y-2">
          <Label htmlFor="password">Credencial</Label>
          {loginType === 'IMAGEN' ? (
            <Textarea
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Nombre de imagen o secuencia de imágenes separadas por comas"
              required
            />
          ) : (
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="pr-10"
                placeholder={loginType === 'PIN' ? 'PIN' : 'Contraseña'}
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
          )}
        </div>
        <div className="space-y-2">
          <Label>Interfaz de Usuario</Label>
          <div className="flex flex-wrap gap-4">
            <div className="flex items-center space-x-2">
              <Checkbox id="IU_Audio" checked={IU_Audio} onCheckedChange={(checked) => setIU_Audio(checked as boolean)} />
              <Label htmlFor="IU_Audio">Audio</Label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox id="IU_Video" checked={IU_Video} onCheckedChange={(checked) => setIU_Video(checked as boolean)} />
              <Label htmlFor="IU_Video">Video</Label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox id="IU_Imagen" checked={IU_Imagen} onCheckedChange={(checked) => setIU_Imagen(checked as boolean)} />
              <Label htmlFor="IU_Imagen">Imagen</Label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox id="IU_Pictograma" checked={IU_Pictograma} onCheckedChange={(checked) => setIU_Pictograma(checked as boolean)} />
              <Label htmlFor="IU_Pictograma">Pictograma</Label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox id="IU_Texto" checked={IU_Texto} onCheckedChange={(checked) => setIU_Texto(checked as boolean)} />
              <Label htmlFor="IU_Texto">Texto</Label>
            </div>
          </div>
        </div>
        <Button type="submit" className="w-full bg-green-600 hover:bg-green-700 text-white" disabled={isLoading}>
          {student ? 'Guardar Cambios' : 'Añadir Alumno'}
        </Button>
      </form>
    </div>
  )
}



