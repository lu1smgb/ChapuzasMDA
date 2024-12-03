'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@supabase/supabase-js'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from 'lucide-react'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseAnonKey);

interface Alumno {
  identificador: number;
  nombre: string;
  imagen_perfil: string;
}

interface Tarea {
  identificador: string;
  nombre: string;
  fecha_inicio: string;
  id_alumno: number;
  Alumno: Alumno;
}

export default function TareasDelDia() {
  const [tareasComedor, setTareasComedor] = useState<Tarea[]>([])
  const [tareasMaterial, setTareasMaterial] = useState<Tarea[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  useEffect(() => {
    fetchTareasDelDia()
  }, [])

  const fetchTareasDelDia = async () => {
    setIsLoading(true)
    setError(null)
    try {
      const today = new Date().toISOString().split('T')[0]
      
      const { data: dataComedor, error: errorComedor } = await supabase
        .from('Tarea_Menu')
        .select(`
          identificador,
          nombre,
          fecha_inicio,
          id_alumno,
          Alumno(identificador, nombre, imagen_perfil)
        `)
        .gte('fecha_inicio', `${today}T00:00:00`)
        .lt('fecha_inicio', `${today}T23:59:59`)
        .not('id_alumno', 'is', null)

      if (errorComedor) throw errorComedor

      const { data: dataMaterial, error: errorMaterial } = await supabase
        .from('Tarea_Material')
        .select(`
          identificador,
          nombre,
          fecha_inicio,
          id_alumno,
          Alumno(identificador, nombre, imagen_perfil)
        `)
        .gte('fecha_inicio', `${today}T00:00:00`)
        .lt('fecha_inicio', `${today}T23:59:59`)
        .not('id_alumno', 'is', null)


      if (errorMaterial) throw errorMaterial

      // Asegúrate de que Alumno sea un solo objeto y no un arreglo
      setTareasComedor(
        dataComedor?.map(tarea => ({
          ...tarea,
          Alumno: Array.isArray(tarea.Alumno) ? tarea.Alumno[0] : tarea.Alumno,
        })) || []
      );
      
      setTareasMaterial(
        dataMaterial?.map(tarea => ({
          ...tarea,
          Alumno: Array.isArray(tarea.Alumno) ? tarea.Alumno[0] : tarea.Alumno,
        })) || []
      );

    } catch (error) {
      console.error("Error al obtener las tareas del día:", error)
      setError("Hubo un error al cargar las tareas. Por favor, intenta de nuevo más tarde.")
    } finally {
      setIsLoading(false)
    }
  }

  const handleAddTask = (tipo: string) => {
    router.push(`/admin/gestionarTarea/anad-tarea?tipo=${tipo}`)
  }

  if (isLoading) return <div className="text-center p-4">Cargando tareas...</div>
  if (error) return <div className="text-center p-4 text-red-500">{error}</div>

  return (
    <div className="bg-white rounded-lg shadow-lg p-4 md:p-8 w-full max-w-4xl mx-auto">
      <nav className="mb-4">
        <Button onClick={() => router.push('/admin')} variant="outline" className="text-base bg-yellow-400 hover:bg-yellow-500">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Volver
        </Button>
      </nav>

      <h1 className="text-2xl font-bold mb-6 text-center text-gray-900">Tareas del Día</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <TareasCard tareas={tareasComedor} tipo="Comedor" onAddTask={() => handleAddTask('Tarea_Menu')} />
        <TareasCard tareas={tareasMaterial} tipo="Material" onAddTask={() => handleAddTask('Tarea_Material')} />
      </div>
    </div>
  )
}

function TareasCard({ tareas, tipo, onAddTask }: { tareas: Tarea[], tipo: string, onAddTask: () => void }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-xl font-semibold">Tareas de {tipo}</CardTitle>
      </CardHeader>
      <CardContent>
        {tareas.length === 0 ? (
          <p className="text-gray-500 mb-4">No hay tareas asignadas para hoy</p>
        ) : (
          <div className="overflow-y-auto border border-gray-200 rounded-md mb-4" style={{ height: "300px" }}>
            <ul className="divide-y divide-gray-200">
              {tareas.map((tarea) => (
                <li key={tarea.identificador} className="py-2 px-4 hover:bg-gray-50">
                  <div className="flex items-center space-x-4">
                    <Image
                      src={tarea.Alumno.imagen_perfil || '/placeholder.svg'}
                      alt={`Foto de ${tarea.Alumno.nombre}`}
                      width={50}
                      height={50}
                      className="rounded-full"
                    />
                    <div>
                      <p className="font-medium">{tarea.Alumno.nombre}</p>
                      <p className="text-sm text-gray-500">{tarea.nombre}</p>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        )}
        <div className="mt-4">
          <Button onClick={onAddTask} className="w-full bg-green-600 hover:bg-green-700 text-white">
            Añadir tarea de {tipo}
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
