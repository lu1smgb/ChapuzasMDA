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

export default function StudentList() {
  const [students, setStudents] = useState<Alumno[]>([])
  const [filterName, setFilterName] = useState('')
  const [filterAula, setFilterAula] = useState('')
  const [deleteStudent, setDeleteStudent] = useState<Alumno | null>(null)
  const router = useRouter()

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
    }
  };

  const handleDeleteStudent = async (student: Alumno) => {
    setDeleteStudent(student);
  }

  const confirmDeleteStudent = async () => {
    if (deleteStudent) {
      try {
        const { error } = await supabase
          .from('Alumno')
          .delete()
          .eq('identificador', deleteStudent.identificador);
        
        if (error) throw error;
        
        fetchStudents();
      } catch (error) {
        console.error("Error al eliminar el alumno:", error);
      }
    }
    setDeleteStudent(null);
  }

  const filteredStudents = students.filter(student => 
    student.nombre.toLowerCase().includes(filterName.toLowerCase()) &&
    student.aula.toLowerCase().includes(filterAula.toLowerCase())
  );

  return (
    <div className="bg-white rounded-lg shadow-lg p-4 md:p-8 w-full max-w-4xl mx-auto">
      <nav className="mb-4">
        <Button onClick={() => router.push('.')} variant="outline" className="text-base bg-yellow-400 hover:bg-yellow-500">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Volver
        </Button>
      </nav>

      <h1 className="text-2xl font-bold mb-6 text-center text-gray-900">Listado de Alumnos</h1>

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
          {filteredStudents.map((student) => (
            <li key={student.identificador} className="py-2 px-4 hover:bg-gray-50">
              <div className="flex justify-between items-center">
                <div>
                  <p className="font-medium">{student.nombre}</p>
                  <p className="text-sm text-gray-600">{student.aula}</p>
                </div>
                <div className="flex space-x-2">
                  <Button 
                    onClick={() => router.push(`./gestionarAlumno/anad-mod-alum?id=${student.identificador}`)}
                    variant="outline" 
                    size="sm" 
                    className="bg-blue-500 hover:bg-blue-600 text-white"
                  >
                    <Pencil className="h-4 w-4 mr-2" />
                    Modificar
                  </Button>
                  <Button 
                    onClick={() => handleDeleteStudent(student)} 
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

      <Button onClick={() => router.push('./gestionarAlumno/anad-mod-alum')} className="w-full bg-green-600 hover:bg-green-700 text-white">
        Añadir nuevo alumno
      </Button>

      <AlertDialog open={deleteStudent !== null} onOpenChange={() => setDeleteStudent(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar eliminación</AlertDialogTitle>
            <AlertDialogDescription>
              ¿Estás seguro de que quieres eliminar a {deleteStudent?.nombre}? Esta acción no se puede deshacer.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDeleteStudent} className="bg-red-500 hover:bg-red-600 text-white">
              Aceptar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}

