'use client'

import { useState, useEffect } from 'react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ArrowLeft, Eye, EyeOff, UserPlus, UserMinus, UserCog, Search, School } from 'lucide-react'
import { createClient } from '@supabase/supabase-js'
import { useRouter } from 'next/navigation'

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

export default function Component() {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [selectedTeacher, setSelectedTeacher] = useState<Profesor | null>(null)
  const [name, setName] = useState('')
  const [password, setPassword] = useState('')
  const [aula, setAula] = useState('')
  const [image, setImage] = useState('')
  const [filterName, setFilterName] = useState('')
  const [filterAula, setFilterAula] = useState('')
  const [teachers, setTeachers] = useState<Profesor[]>([])
  const [notification, setNotification] = useState({ title: '', message: '', type: '' })
  const router = useRouter()

  const showNotification = (title: string, message: string, type: string) => {
    setNotification({ title, message, type })
    setTimeout(() => setNotification({ title: '', message: '', type: '' }), 3000)
  }

  useEffect(() => {
    fetchTeachers();
  }, []);

  const fetchTeachers = async () => {
    try {
      const { data, error } = await supabase
        .from("Profesor")
        .select("*");

      if (error) throw error;

      setTeachers(data as Profesor[]);
    } catch (error) {
      console.error("Error al obtener los profesores:", error);
      showNotification("Error", "No se pudieron cargar los profesores.", "error");
    }
  };

  const handleAddTeacher = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true)
    setError('')
    if (!name || !password || !aula) {
      setError('Debe llenar todos los campos obligatorios.')
      setIsLoading(false)
      return
    }
    
    try {
      console.log('Submitting form with:', { name, password, aula, image })
      const { error } = await supabase
        .from("Profesor")
        .insert({
          nombre: name,
          credencial: password,
          aula: aula,
          imagen_perfil: image,
        });
  
      if (error) throw error;
  
      fetchTeachers();
      resetForm();
      showNotification("Éxito", "Profesor añadido correctamente.", "success");
    } catch (error) {
      console.error("Error al añadir el profesor:", error);
      showNotification("Error", "No se pudo añadir el profesor.", "error");
    } finally {
      setIsLoading(false)
    }
  };
  
  const handleSelectTeacher = (teacher: Profesor) => {
    setSelectedTeacher(teacher)
    setName(teacher.nombre)
    setPassword(teacher.credencial)
    setAula(teacher.aula)
    setImage(teacher.imagen_perfil)
  }
  
  const handleModifyTeacher = async () => {
    if (selectedTeacher) {
      setIsLoading(true)
      setError('')
      try {
        const { error } = await supabase
          .from('Profesor')
          .update({
            nombre: name,
            credencial: password,
            aula,
            imagen_perfil: image
          })
          .eq('identificador', selectedTeacher.identificador);
        
        if (error) throw error;
        
        fetchTeachers();
        showNotification("Profesor modificado", `${name} ha sido actualizado con éxito.`, "success");
        resetForm();
      } catch (error) {
        console.error("Error al modificar el profesor:", error);
        showNotification("Error", "Error al modificar el profesor.", "error");
      } finally {
        setIsLoading(false)
      }
    }
  }

  const handleDeleteTeacher = async () => {
    if (selectedTeacher) {
      setIsLoading(true)
      try {
        const { error } = await supabase
          .from('Profesor')
          .delete()
          .eq('identificador', selectedTeacher.identificador);
        
        if (error) throw error;
        
        fetchTeachers();
        showNotification("Profesor eliminado", `${selectedTeacher.nombre} ha sido eliminado con éxito.`, "success");
        resetForm();
      } catch (error) {
        console.error("Error al eliminar el profesor:", error);
        showNotification("Error", "Error al eliminar el profesor.", "error");
      } finally {
        setIsLoading(false)
      }
    }
  }

  const resetForm = () => {
    setSelectedTeacher(null)
    setName('')
    setPassword('')
    setAula('')
    setImage('')
  }

  const filteredTeachers = teachers.filter(teacher => 
    teacher.nombre.toLowerCase().includes(filterName.toLowerCase()) &&
    teacher.aula.toLowerCase().includes(filterAula.toLowerCase())
  );

  const handleGoBack = () => {
    router.back()
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

        <h1 className="text-2xl font-bold mb-6 text-center text-gray-900">Gestionar Profesores</h1>

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
            <TabsTrigger value="list">Lista de Profesores</TabsTrigger>
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
                {filteredTeachers.map((teacher) => (
                  <li
                    key={teacher.identificador}
                    className={`py-2 px-4 cursor-pointer hover:bg-gray-50 ${
                      selectedTeacher?.identificador === teacher.identificador ? 'bg-blue-100' : ''
                    }`}
                    onClick={() => handleSelectTeacher(teacher)}
                  >
                    <div className="flex justify-between items-center">
                      <div>
                        <p className="font-medium">{teacher.nombre}</p>
                        <p className="text-sm text-gray-600">{teacher.aula}</p>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </TabsContent>

          <TabsContent value="form" className="space-y-4">
            <form onSubmit={handleAddTeacher} className="space-y-4">
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
                    placeholder="Ej: 1A"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="image">URL de la Imagen de Perfil</Label>
                  <Input
                    id="image"
                    value={image}
                    onChange={(e) => setImage(e.target.value)}
                    placeholder="https://..."
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
              <div className="flex space-x-2">
                <Button type="submit" className="flex-1 bg-green-600 hover:bg-green-700 text-white" disabled={selectedTeacher !== null || isLoading}>
                  <UserPlus className="mr-2 h-4 w-4" />
                  Añadir
                </Button>
                <Button type="button" onClick={handleModifyTeacher} className="flex-1 bg-blue-600 hover:bg-blue-700 text-white" disabled={!selectedTeacher || isLoading}>
                  <UserCog className="mr-2 h-4 w-4" />
                  Modificar
                </Button>
                <Button type="button" onClick={handleDeleteTeacher} className="flex-1 bg-red-600 hover:bg-red-700 text-white" disabled={!selectedTeacher || isLoading}>
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