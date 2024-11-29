'use client'

import { useState, useEffect } from 'react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ArrowLeft, Search, Calendar } from 'lucide-react'
import { createClient } from '@supabase/supabase-js'
import { useRouter } from 'next/navigation'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseAnonKey);

interface Alumno {
  nombre: string;
}

interface Tarea {
  identificador: string;
  nombre: string;
  descripcion: string;
  fecha_inicio: string;
  fecha_fin: string;
  id_alumno: number;
  completada: boolean;
  tipo: string;
  Alumno: Alumno;
}

export default function TaskList() {
  const [tasks, setTasks] = useState<Tarea[]>([])
  const [filterTaskName, setFilterTaskName] = useState('')
  const [filterStudentName, setFilterStudentName] = useState('')
  const [filterStartDate, setFilterStartDate] = useState('')
  const [filterEndDate, setFilterEndDate] = useState('')
  const [deleteTask, setDeleteTask] = useState<Tarea | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  useEffect(() => {
    fetchTasks();
  }, []);

  // Obtiene las tareas de la tabla nombre_tabla y les asigna el tipo tipo_tabla
  const fetchAndMapTasks = async (nombre_tabla: string, tipo_tabla: string): Promise<Tarea[]> => {
    try {
      const { data, error } = await supabase
        .from(nombre_tabla)
        .select("identificador, nombre, descripcion, fecha_inicio, fecha_fin, id_alumno, completada, Alumno(nombre)");
  
      if (error) throw error;
  
      return data.map(t => ({
        identificador: t.identificador,
        nombre: t.nombre,
        descripcion: t.descripcion,
        fecha_inicio: t.fecha_inicio,
        fecha_fin: t.fecha_fin,
        id_alumno: t.id_alumno,
        completada: t.completada,
        tipo: tipo_tabla, // Asignar tipo según la tabla
        Alumno: Array.isArray(t.Alumno) ? t.Alumno[0] : t.Alumno, // Asegurar que Alumno sea un objeto
      }));
    } catch (error) {
      console.error(`Error al obtener tareas de ${nombre_tabla}:`, error);
      return [];
    }
  };
  

  const fetchTasks = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const today = new Date().toISOString().split('T')[0];
      let allTasks: Tarea[] = [];

      const [tareasJuego, tareasMenu, tareasMaterial, tareasPasos] = await Promise.all([
        fetchAndMapTasks("Tarea_Juego", "Tarea_Juego"),
        fetchAndMapTasks("Tarea_Menu", "Tarea_Menu"),
        fetchAndMapTasks("Tarea_Material", "Tarea_Material"),
        fetchAndMapTasks("Tarea_Pasos", "Tarea_Pasos")
      ]);

      allTasks = [...tareasJuego, ...tareasMaterial, ...tareasMenu, ...tareasPasos]

      console.log("Todas las tareas combinadas:", allTasks);

      // Ordenar tareas
      const orderedTasks = allTasks.sort((a, b) => {
        if (!a.completada && b.completada) return -1;
        if (a.completada && !b.completada) return 1;
        if (new Date(a.fecha_fin) > new Date(today) && new Date(b.fecha_fin) <= new Date(today)) return -1;
        if (new Date(a.fecha_fin) <= new Date(today) && new Date(b.fecha_fin) > new Date(today)) return 1;
        return 0;
      });

      setTasks(orderedTasks);
      console.log("Tareas ordenadas y establecidas en el estado:", orderedTasks);
    } catch (error) {
      console.error("Error al obtener las tareas:", error);
      setError("Hubo un error al cargar las tareas. Por favor, intenta de nuevo más tarde.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteTask = (task: Tarea) => {
    setDeleteTask(task);
  };

  const confirmDeleteTask = async () => {
    if (deleteTask) {
      try {
        const { error } = await supabase
          .from(deleteTask.tipo)
          .delete()
          .eq('identificador', deleteTask.identificador);

        if (error) throw error;
        await fetchTasks();
      } catch (error) {
        console.error("Error al eliminar la tarea:", error);
        setError("Hubo un error al eliminar la tarea. Por favor, intenta de nuevo.");
      }
    }
    setDeleteTask(null);
  };

  const filteredTasks = tasks.filter(task =>
    // Verifica si task.nombre existe antes de intentar convertirlo a minúsculas
    task.nombre && task.nombre.toLowerCase().includes(filterTaskName.toLowerCase()) &&
    // Verifica si task.Alumno y task.Alumno.nombre existen antes de intentar convertirlo a minúsculas
    (task.Alumno && task.Alumno.nombre && task.Alumno.nombre.toLowerCase().includes(filterStudentName.toLowerCase())) &&
    (!filterStartDate || task.fecha_inicio >= filterStartDate) &&
    (!filterEndDate || task.fecha_fin <= filterEndDate)
  );
  
  
  

  return (
    <div className="bg-white rounded-lg shadow-lg p-4 md:p-8 w-full max-w-4xl mx-auto">
      <nav className="mb-4">
        <Button onClick={() => router.push('.')} variant="outline" className="text-base bg-yellow-400 hover:bg-yellow-500">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Volver
        </Button>
      </nav>

      <h1 className="text-2xl font-bold mb-6 text-center text-gray-900">Listado de Tareas</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        <div className="relative">
          <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            value={filterTaskName}
            onChange={(e) => setFilterTaskName(e.target.value)}
            className="pl-8"
            placeholder="Buscar por nombre de tarea"
          />
        </div>
        <div className="relative">
          <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            value={filterStudentName}
            onChange={(e) => setFilterStudentName(e.target.value)}
            className="pl-8"
            placeholder="Buscar por nombre de alumno"
          />
        </div>
        <div className="relative">
          <Calendar className="absolute left-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            type="date"
            value={filterStartDate}
            onChange={(e) => setFilterStartDate(e.target.value)}
            className="pl-8"
            placeholder="Fecha de inicio"
          />
        </div>
        <div className="relative">
          <Calendar className="absolute left-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            type="date"
            value={filterEndDate}
            onChange={(e) => setFilterEndDate(e.target.value)}
            className="pl-8"
            placeholder="Fecha de fin"
          />
        </div>
      </div>

      {isLoading ? (
        <p className="text-center">Cargando tareas...</p>
      ) : error ? (
        <p className="text-center text-red-500">{error}</p>
      ) : (
        <div className="overflow-y-auto border border-gray-200 rounded-md mb-4" style={{ height: "300px" }}>
        <ul className="divide-y divide-gray-200">
          {filteredTasks.length > 0 ? (
            filteredTasks.map((task) => (
              <li key={`${task.tipo}_${task.identificador}`} className="py-2 px-4 hover:bg-gray-50">
                <div className="flex justify-between items-center">
                  <div>
                    <p className="font-medium">{task.nombre}</p>
                    <p className="text-sm text-gray-600">Alumno: {task.Alumno.nombre || 'No asignado'}</p>
                    <p className="text-sm text-gray-600">
                      Fechas: {new Date(task.fecha_inicio).toLocaleString()} - {new Date(task.fecha_fin).toLocaleString()}
                    </p>
                    <p className="text-sm text-gray-600">
                      Estado: 
                      {task.completada 
                        ? "Completada" 
                        : new Date(task.fecha_fin) < new Date() 
                          ? "Retrasada" 
                          : "Pendiente"}
                    </p>
                  </div>
                  <div className="flex space-x-2">
                    <Button
                      onClick={() => router.push(`./gestionarTarea/anad-tarea?id=${task.identificador}&tipo=${task.tipo}`)}
                      variant="outline"
                      size="sm"
                      className="bg-blue-500 hover:bg-blue-600 text-white"
                    >
                      Modificar
                    </Button>
                    <Button
                      onClick={() => handleDeleteTask(task)}
                      variant="outline"
                      size="sm"
                      className="bg-red-500 hover:bg-red-600 text-white"
                    >
                      Eliminar
                    </Button>
                  </div>
                </div>
              </li>
            ))
          ) : (
            <li className="py-2 px-4">
              <p className="text-center text-gray-500">No hay tareas para mostrar.</p>
            </li>
          )}
        </ul>
      </div>)}

      {deleteTask && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white p-4 rounded-lg">
            <p>¿Estás seguro de que quieres eliminar esta tarea?</p>
            <div className="mt-4 flex justify-end space-x-2">
              <Button onClick={() => setDeleteTask(null)} variant="outline">Cancelar</Button>
              <Button onClick={confirmDeleteTask} className="bg-red-500 hover:bg-red-600 text-white">Eliminar</Button>
            </div>
          </div>
        </div>
      )}

      <Button onClick={() => router.push('./gestionarTarea/anad-tarea')} className="w-full bg-green-600 hover:bg-green-700 text-white">
        Añadir nueva tarea
      </Button>
    </div>
  )
}

