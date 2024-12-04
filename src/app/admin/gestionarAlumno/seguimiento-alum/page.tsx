'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { createClient } from '@supabase/supabase-js'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ArrowLeft, Search, ChevronLeft, ChevronRight } from 'lucide-react'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { format, parse, startOfMonth, endOfMonth, addMonths, subMonths } from 'date-fns'
import { es } from 'date-fns/locale'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Interface para definir la estructura de una tarea.
interface Task {
    id: number; // Identificador de la tarea
    name: string; // Nombre de la tarea
    description: string; // Descripción de la tarea
    start_date: string; // Fecha de inicio de la tarea
    end_date: string; // Fecha de finalización de la tarea
    completed: boolean; // Indica si la tarea está completada
    task_type: string; // Tipo de tarea (juego, menú, material, pasos, etc.)
    image_url: string; // URL de la imagen asociada a la tarea
  }
  
  // Componente principal para el seguimiento de tareas de un estudiante.
  export default function StudentFollowUp() {
    const router = useRouter(); // Manejo de rutas
    const searchParams = useSearchParams(); // Parámetros de la URL
    const studentId = searchParams.get('id'); // ID del estudiante extraído de la URL
  
    // Estados locales para gestionar tareas, estado de carga, filtros, etc.
    const [tasks, setTasks] = useState<Task[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [filterStatus, setFilterStatus] = useState('all'); // Filtro por estado de la tarea
    const [filterType, setFilterType] = useState('all'); // Filtro por tipo de tarea
    const [searchTerm, setSearchTerm] = useState(''); // Filtro de búsqueda
    const [currentMonth, setCurrentMonth] = useState(new Date()); // Mes actual
  
    // Efecto para cargar las tareas cuando se obtiene el ID del estudiante.
    useEffect(() => {
      if (studentId) {
        fetchTasks(parseInt(studentId));
      }
    }, [studentId]);
  
    // Función para obtener las tareas del estudiante desde múltiples tablas.
    const fetchTasks = async (id: number) => {
      setLoading(true);
      setError(null);
  
      try {
        // Subfunción para obtener tareas de una tabla específica.
        const fetchTasksFromTable = async (table: string) => {
          const { data, error } = await supabase
            .from(table)
            .select('*')
            .eq('id_alumno', id);
  
          if (error) throw error;
  
          // Transformación de las tareas obtenidas.
          return data.map((task: any) => ({
            ...task,
            task_type: table.replace('Tarea_', ''), // Tipo derivado del nombre de la tabla
            id: task.identificador,
            name: task.nombre,
            start_date: task.fecha_inicio,
            end_date: task.fecha_fin,
            completed: task.completada,
            image_url: task.imagen_tarea,
          }));
        };
  
        // Obtención de tareas de cada tabla.
        const taskJuego = await fetchTasksFromTable('Tarea_Juego');
        const taskMenu = await fetchTasksFromTable('Tarea_Menu');
        const taskMaterial = await fetchTasksFromTable('Tarea_Material');
        const taskPasos = await fetchTasksFromTable('Tarea_Pasos');
  
        // Unión y ordenamiento cronológico de todas las tareas.
        const allTasks = [...taskJuego, ...taskMenu, ...taskMaterial, ...taskPasos];
        setTasks(sortTasksChronologically(allTasks));
      } catch (error) {
        console.error('Error fetching tasks:', error);
        setError('Error al cargar las tareas. Por favor, inténtalo de nuevo.');
      } finally {
        setLoading(false);
      }
    };
  
    // Función para ordenar las tareas cronológicamente.
    const sortTasksChronologically = (tasks: Task[]) => {
      return tasks.sort((a, b) => new Date(a.start_date).getTime() - new Date(b.start_date).getTime());
    };
  
    // Tareas filtradas según filtros activos (mes, estado, tipo y búsqueda).
    const filteredTasks = tasks.filter(task => {
      const taskStartDate = new Date(task.start_date);
      const taskEndDate = new Date(task.end_date);
      const monthStart = startOfMonth(currentMonth);
      const monthEnd = endOfMonth(currentMonth);
  
      // Filtros por mes, estado, tipo y término de búsqueda.
      const matchesMonth =
        (taskStartDate <= monthEnd && taskEndDate >= monthStart) ||
        (taskStartDate >= monthStart && taskStartDate <= monthEnd) ||
        (taskEndDate >= monthStart && taskEndDate <= monthEnd);
  
      const matchesStatus =
        filterStatus === 'all' ||
        (filterStatus === 'completed' && task.completed) ||
        (filterStatus === 'pending' && !task.completed && new Date(task.end_date) >= new Date()) ||
        (filterStatus === 'overdue' && !task.completed && new Date(task.end_date) < new Date());
  
      const matchesType = filterType === 'all' || task.task_type.toLowerCase() === filterType;
  
      const matchesSearch =
        task.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        task.description.toLowerCase().includes(searchTerm.toLowerCase());
  
      return matchesMonth && matchesStatus && matchesType && matchesSearch;
    });
  
    // Función para obtener el color del estado de una tarea.
    const getStatusColor = (task: Task) => {
      if (task.completed) return 'bg-green-100 text-green-800';
      if (new Date(task.end_date) < new Date()) return 'bg-red-100 text-red-800';
      return 'bg-yellow-100 text-yellow-800';
    };
  
    // Función para obtener el texto descriptivo del estado de una tarea.
    const getStatusText = (task: Task) => {
      if (task.completed) return 'Completada';
      if (new Date(task.end_date) < new Date()) return 'Atrasada';
      return 'Pendiente';
    };
  
    // Función para retroceder un mes en el calendario.
    const goToPreviousMonth = () => {
      setCurrentMonth(prevMonth => subMonths(prevMonth, 1));
    };
  
    // Función para avanzar un mes en el calendario.
    const goToNextMonth = () => {
      setCurrentMonth(prevMonth => addMonths(prevMonth, 1));
    };
  

  if (loading) return <div className="text-center mt-8">Cargando tareas...</div>
  if (error) return <div className="text-center mt-8 text-red-600">{error}</div>

  return (
    <div className="bg-white rounded-lg shadow-lg p-4 md:p-8 w-full max-w-6xl mx-auto flex flex-col h-screen">
      <nav className="mb-4">
        <Button onClick={() => router.push('.')} variant="outline" className="text-base bg-yellow-400 hover:bg-yellow-500">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Volver al listado de alumnos
        </Button>
      </nav>

      <h1 className="text-2xl font-bold mb-6 text-center text-gray-900">Seguimiento de Tareas del Alumno</h1>

      <div className="flex flex-col sm:flex-row items-center justify-between mb-4">
        <div className="flex items-center space-x-2 mb-2 sm:mb-0">
          <Button onClick={goToPreviousMonth} variant="outline" size="icon">
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <span className="text-lg font-medium">
            {format(currentMonth, 'MMMM yyyy', { locale: es })}
          </span>
          <Button onClick={goToNextMonth} variant="outline" size="icon">
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
        <div className="flex flex-wrap gap-2">
          <Select value={filterStatus} onValueChange={setFilterStatus}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Filtrar por estado" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos los estados</SelectItem>
              <SelectItem value="completed">Completadas</SelectItem>
              <SelectItem value="pending">Pendientes</SelectItem>
              <SelectItem value="overdue">Atrasadas</SelectItem>
            </SelectContent>
          </Select>
          <Select value={filterType} onValueChange={setFilterType}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Filtrar por tipo" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos los tipos</SelectItem>
              <SelectItem value="juego">Juego</SelectItem>
              <SelectItem value="menu">Menú</SelectItem>
              <SelectItem value="material">Material</SelectItem>
              <SelectItem value="pasos">Pasos</SelectItem>
            </SelectContent>
          </Select>
          <div className="relative w-full sm:w-auto">
            <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-8 w-full sm:w-[200px]"
              placeholder="Buscar tareas"
            />
          </div>
        </div>
      </div>

      <div className="flex-grow overflow-hidden">
        <div className="h-full overflow-y-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="sticky top-0 bg-white z-10">Nombre</TableHead>
                <TableHead className="sticky top-0 bg-white z-10">Descripción</TableHead>
                <TableHead className="sticky top-0 bg-white z-10">Tipo</TableHead>
                <TableHead className="sticky top-0 bg-white z-10">Fecha Inicio</TableHead>
                <TableHead className="sticky top-0 bg-white z-10">Fecha Fin</TableHead>
                <TableHead className="sticky top-0 bg-white z-10">Estado</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredTasks.map((task) => (
                <TableRow key={`${task.task_type}-${task.id}`}>
                  <TableCell className="font-medium">{task.name}</TableCell>
                  <TableCell>{task.description}</TableCell>
                  <TableCell>{task.task_type}</TableCell>
                  <TableCell>{new Date(task.start_date).toLocaleDateString()}</TableCell>
                  <TableCell>{new Date(task.end_date).toLocaleDateString()}</TableCell>
                  <TableCell>
                    <span className={`px-2 py-1 rounded-full text-xs font-semibold ${getStatusColor(task)}`}>
                      {getStatusText(task)}
                    </span>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>

      {filteredTasks.length === 0 && (
        <div className="text-center mt-8 text-gray-500">No se encontraron tareas para este mes que coincidan con los filtros aplicados.</div>
      )}
    </div>
  )
}

