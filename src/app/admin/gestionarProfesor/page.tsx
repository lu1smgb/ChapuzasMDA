'use client'

import { useState, useEffect } from 'react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ArrowLeft, Search, School, Pencil, Trash2 } from 'lucide-react'
import { createClient } from '@supabase/supabase-js'
import { useRouter } from 'next/navigation'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"

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

export default function TeacherList() {
  const [teachers, setTeachers] = useState<Profesor[]>([])
  const [filterName, setFilterName] = useState('')
  const [filterAula, setFilterAula] = useState('')
  const [deleteTeacher, setDeleteTeacher] = useState<Profesor | null>(null)
  const router = useRouter()

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
    }
  };

  const handleDeleteTeacher = async (teacher: Profesor) => {
    setDeleteTeacher(teacher);
  }

  const confirmDeleteTeacher = async () => {
    if (deleteTeacher) {
      try {
        const { error } = await supabase
          .from('Profesor')
          .delete()
          .eq('identificador', deleteTeacher.identificador);
        
        if (error) throw error;
        
        fetchTeachers();
      } catch (error) {
        console.error("Error al eliminar el profesor:", error);
      }
    }
    setDeleteTeacher(null);
  }

  const filteredTeachers = teachers.filter(teacher => 
    teacher.nombre.toLowerCase().includes(filterName.toLowerCase()) &&
    teacher.aula.toLowerCase().includes(filterAula.toLowerCase())
  );

  return (
    <div className="bg-white rounded-lg shadow-lg p-4 md:p-8 w-full max-w-4xl mx-auto">
      <nav className="mb-4">
        <Button onClick={() => router.back()} variant="outline" className="text-base bg-yellow-400 hover:bg-yellow-500">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Volver
        </Button>
      </nav>

      <h1 className="text-2xl font-bold mb-6 text-center text-gray-900">Listado de Profesores</h1>

      <div className="flex space-x-2 mb-4">
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

      <div className="overflow-y-auto border border-gray-200 rounded-md mb-4" style={{ height: "300px" }}>
        <ul className="divide-y divide-gray-200">
          {filteredTeachers.map((teacher) => (
            <li key={teacher.identificador} className="py-2 px-4 hover:bg-gray-50">
              <div className="flex justify-between items-center">
                <div>
                  <p className="font-medium">{teacher.nombre}</p>
                  <p className="text-sm text-gray-600">{teacher.aula}</p>
                </div>
                <div className="flex space-x-2">
                  <Button 
                    onClick={() => router.push(`./gestionarProfesor/anad-mod-prof?id=${teacher.identificador}`)}
                    variant="outline" 
                    size="sm" 
                    className="bg-blue-500 hover:bg-blue-600 text-white"
                  >
                    <Pencil className="h-4 w-4 mr-2" />
                    Modificar
                  </Button>
                  <Button 
                    onClick={() => handleDeleteTeacher(teacher)} 
                    variant="outline" 
                    size="sm" 
                    className="bg-red-500 hover:bg-red-600 text-white"
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Eliminar
                  </Button>
                </div>
              </div>
            </li>
          ))}
        </ul>
      </div>

      <Button onClick={() => router.push('./gestionarProfesor/anad-mod-prof')} className="w-full bg-green-600 hover:bg-green-700 text-white">
        Añadir nuevo profesor
      </Button>

      <AlertDialog open={deleteTeacher !== null} onOpenChange={() => setDeleteTeacher(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar eliminación</AlertDialogTitle>
            <AlertDialogDescription>
              ¿Estás seguro de que quieres eliminar a {deleteTeacher?.nombre}? Esta acción no se puede deshacer.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDeleteTeacher} className="bg-red-500 hover:bg-red-600 text-white">
              Aceptar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}