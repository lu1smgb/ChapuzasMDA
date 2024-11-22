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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ArrowLeft, Eye, EyeOff, UserPlus, UserMinus, UserCog, Search, School } from 'lucide-react'
import { createClient } from '@supabase/supabase-js'
import { useRouter } from 'next/navigation'


const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseAnonKey);

interface Alumno {
  identificador: string;
  nombre: string;
  año_nacimiento: string; // YYYY/MM/DD
  aula: string;
  tipo_login: string;
  credencial: string;
  tipo_interfaz: string;
  imagen_perfil: string;
}

export default function Component() {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [selectedStudent, setSelectedStudent] = useState<Alumno | null>(null)
  const [name, setName] = useState('')
  const [loginType, setLoginType] = useState('')
  const [password, setPassword] = useState('')
  const [birthDate, setBirthDate] = useState('')
  const [aula, setAula] = useState('')
  const [interfaceType, setInterfaceType] = useState('')
  const [image, setImage] = useState('')
  const [filterName, setFilterName] = useState('')
  const [filterAula, setFilterAula] = useState('')
  const [students, setStudents] = useState<Alumno[]>([])
  const [notification, setNotification] = useState({ title: '', message: '', type: '' })
  const router = useRouter()

  const showNotification = (title: string, message: string, type: string) => {
    setNotification({ title, message, type })
    setTimeout(() => setNotification({ title: '', message: '', type: '' }), 3000)
  }

  useEffect(() => {
    fetchStudents();
  }, []);

  const fetchStudents = async () => {
    try {
      const { data, error } = await supabase
        .from("Alumno")
        .select("*");

      if (error) throw error;

      setStudents(data as Alumno[]);
    } catch (error) {
      console.error("Error al obtener los alumnos:", error);
      showNotification("Error", "No se pudieron cargar los alumnos.", "error");
    }
  };

  const handleAddStudent = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true)
    setError('')
    if (!loginType || !name || !password || !birthDate || !aula || !interfaceType) {
      setError('Debe llenar todos los campos obligatorios.')
      setIsLoading(false)
      return
    }
    
    try {
      console.log('Submitting form with:', { name, loginType, password, birthDate, aula, interfaceType, image })
      const formattedDate = birthDate.replace(/-/g, '/');
      const { error } = await supabase
        .from("Alumno")
        .insert({
          nombre: name,
          credencial: password,
          año_nacimiento: formattedDate,
          tipo_interfaz: interfaceType,
          aula: aula,
          tipo_login: loginType,
          imagen_perfil: image,
        });
  
      if (error) throw error;
  
      fetchStudents();
      resetForm();
      showNotification("Éxito", "Alumno añadido correctamente.", "success");
    } catch (error) {
      console.error("Error al añadir el alumno:", error);
      showNotification("Error", "No se pudo añadir el alumno.", "error");
    } finally {
      setIsLoading(false)
    }
  };
  
  const handleSelectStudent = (student: Alumno) => {
    setSelectedStudent(student)
    setName(student.nombre)
    setLoginType(student.tipo_login)
    setPassword(student.credencial)
    setBirthDate(student.año_nacimiento.replace(/\//g, '-'))
    setAula(student.aula)
    setInterfaceType(student.tipo_interfaz)
    setImage(student.imagen_perfil)
  }
  
  const handleModifyStudent = async () => {
    if (selectedStudent) {
      setIsLoading(true)
      setError('')
      try {
        const formattedDate = birthDate.replace(/-/g, '/');
        const { error } = await supabase
          .from('Alumno')
          .update({
            nombre: name,
            tipo_login: loginType,
            credencial: password,
            año_nacimiento: formattedDate,
            aula,
            tipo_interfaz: interfaceType,
            imagen_perfil: image
          })
          .eq('identificador', selectedStudent.identificador);
        
        if (error) throw error;
        
        fetchStudents();
        showNotification("Alumno modificado", `${name} ha sido actualizado con éxito.`, "success");
        resetForm();
      } catch (error) {
        console.error("Error al modificar el alumno:", error);
        showNotification("Error", "Error al modificar el alumno.", "error");
      } finally {
        setIsLoading(false)
      }
    }
  }

  const handleDeleteStudent = async () => {
    if (selectedStudent) {
      setIsLoading(true)
      try {
        const { error } = await supabase
          .from('Alumno')
          .delete()
          .eq('identificador', selectedStudent.identificador);
        
        if (error) throw error;
        
        fetchStudents();
        showNotification("Alumno eliminado", `${selectedStudent.nombre} ha sido eliminado con éxito.`, "success");
        resetForm();
      } catch (error) {
        console.error("Error al eliminar el alumno:", error);
        showNotification("Error", "Error al eliminar el alumno.", "error");
      } finally {
        setIsLoading(false)
      }
    }
  }

  const resetForm = () => {
    setSelectedStudent(null)
    setName('')
    setLoginType('')
    setPassword('')
    setBirthDate('')
    setAula('')
    setInterfaceType('')
    setImage('')
  }

  const filteredStudents = students.filter(student => 
    student.nombre.toLowerCase().includes(filterName.toLowerCase()) &&
    student.aula.toLowerCase().includes(filterAula.toLowerCase())
  );

  const handleGoBack = () => {
    router.back()
  }

  const formatDate = (dateString: string) => {
    const [year, month, day] = dateString.split('/');
    return `${day}/${month}/${year}`;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-100 via-purple-100 to-pink-100 flex items-center justify-center p-4">
      <main className="bg-white rounded-lg shadow-lg p-4 md:p-8 w-full max-w-4xl">
        <nav className="mb-4">
          <Button onClick={handleGoBack} variant="outline" className="text-base bg-yellow-400 hover:bg-yellow-500">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Atrás
          </Button>
        </nav>

        <h1 className="text-2xl font-bold mb-6 text-center text-gray-900">Gestionar Alumnos</h1>

        {notification.message && (
          <div className={`mb-4 p-4 rounded-md ${notification.type === 'error' ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
            <h2 className="font-bold">{notification.title}</h2>
            <p>{notification.message}</p>
          </div>
        )}

        {error && (
          <div className="mb-4 p-4 rounded-md bg-red-100 text-red-700">
            <p>{error}</p>
          </div>
        )}

        <Tabs defaultValue="list" className="space-y-4">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="list">Lista de Alumnos</TabsTrigger>
            <TabsTrigger value="form">Formulario</TabsTrigger>
          </TabsList>

          <TabsContent value="list" className="space-y-4">
            <div className="flex space-x-2">
              <div className="flex-1 relative">
                <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  value={filterName}
                  onChange={(e) => setFilterName(e.target.value)}
                  className="pl-8"
                  placeholder="Buscar por nombre"
                />
              </div>
              <div className="flex-1 relative">
                <School className="absolute left-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  value={filterAula}
                  onChange={(e) => setFilterAula(e.target.value)}
                  className="pl-8"
                  placeholder="Filtrar por aula"
                />
              </div>
            </div>

            <div className="h-48 overflow-y-auto border border-gray-200 rounded-md">
              <ul className="divide-y divide-gray-200">
                {filteredStudents.map((student) => (
                  <li
                    key={student.identificador}
                    className={`py-2 px-4 cursor-pointer hover:bg-gray-50 ${
                      selectedStudent?.identificador === student.identificador ? 'bg-blue-100' : ''
                    }`}
                    onClick={() => handleSelectStudent(student)}
                  >
                    <div className="flex justify-between items-center">
                      <div>
                        <p className="font-medium">{student.nombre}</p>
                        <p className="text-sm text-gray-600">{student.aula}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm">{formatDate(student.año_nacimiento)}</p>
                        <p className="text-sm text-gray-600">{student.tipo_login} - {student.tipo_interfaz}</p>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </TabsContent>

          <TabsContent value="form" className="space-y-4">
            <form onSubmit={handleAddStudent} className="space-y-4">
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
                  <Label htmlFor="birthDate">Fecha de Nacimiento</Label>
                  <Input
                    id="birthDate"
                    type="date"
                    value={birthDate}
                    onChange={(e) => setBirthDate(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="aula">Aula</Label>
                  <Input
                    id="aula"
                    value={aula}
                    onChange={(e) => setAula(e.target.value)}
                    placeholder="Ej: 1A"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="tipoLogin">Tipo de Login</Label>
                  <Select value={loginType} onValueChange={setLoginType} required>
                    <SelectTrigger id="tipoLogin">
                      <SelectValue placeholder="Seleccionar" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="PIN">PIN</SelectItem>
                      <SelectItem value="IMAGEN">IMAGEN</SelectItem>
                      <SelectItem value="CONTRASEÑA">CONTRASEÑA</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="interfaceType">Tipo de Interfaz</Label>
                  <Select value={interfaceType} onValueChange={setInterfaceType} required>
                    <SelectTrigger id="interfaceType">
                      <SelectValue placeholder="Seleccionar" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Texto">Texto</SelectItem>
                      <SelectItem value="Imagen">Imagen</SelectItem>
                      <SelectItem value="Pictograma">Pictograma</SelectItem>
                      <SelectItem value="Video">Video</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="image">URL de la Imagen</Label>
                  <Input
                    id="image"
                    value={image}
                    onChange={(e) => setImage(e.target.value)}
                    placeholder="https://..."
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Contraseña</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pr-10"
                    placeholder="Contraseña"
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
              <div className="flex space-x-2">
                <Button type="submit" className="flex-1 bg-green-600 hover:bg-green-700 text-white" disabled={selectedStudent !== null || isLoading}>
                  <UserPlus className="mr-2 h-4 w-4" />
                  Añadir
                </Button>
                <Button type="button" onClick={handleModifyStudent} className="flex-1 bg-blue-600 hover:bg-blue-700 text-white" disabled={!selectedStudent || isLoading}>
                  <UserCog className="mr-2 h-4 w-4" />
                  Modificar
                </Button>
                <Button type="button" onClick={handleDeleteStudent} className="flex-1 bg-red-600 hover:bg-red-700 text-white" disabled={!selectedStudent || isLoading}>
                  <UserMinus className="mr-2 h-4 w-4" />
                  Eliminar
                </Button>
              </div>
            </form>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  )
}
