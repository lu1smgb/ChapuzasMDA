'use client'

import { supabase } from "@/lib/supabase"
import React, { useState, useEffect } from 'react'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { CalendarIcon, CheckCircle, AlertCircle, Search, ArrowLeft } from 'lucide-react'
import { format, isBefore } from "date-fns"
import { es } from "date-fns/locale"
import { useRouter } from 'next/navigation'

type Task = {
  id: string;
  nombre_tarea: string;
  tipo_tarea: string; 
  descripcion: string;
}

type Student = {
  id: string;
  nombre_apellido: string;
}

export default function AsignarTareas() {
  const [tasks, setTasks] = useState<Task[]>([])
  const [students, setStudents] = useState<Student[]>([])
  const [selectedTask, setSelectedTask] = useState<Task | null>(null)
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null) // Cambié el estado para almacenar un solo estudiante
  const [startDate, setStartDate] = useState<Date | undefined>()
  const [endDate, setEndDate] = useState<Date | undefined>()
  const [description, setDescription] = useState('')
  const [assigned, setAssigned] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const router = useRouter()

  useEffect(() => {
    fetchTasks();
    fetchStudents();
  }, []);

  // Efecto para actualizar la descripción cuando se selecciona una tarea
  useEffect(() => {
    if (selectedTask) {
      setDescription(selectedTask.descripcion); // Rellena la descripción con la tarea seleccionada
    } else {
      setDescription(''); // Limpia la descripción si no hay tarea seleccionada
    }
  }, [selectedTask]);

  const fetchTasks = async () => {
    try {
      const { data: taskData, error } = await supabase
        .from('Tarea')
        .select('id,nombre_tarea,tipo_tarea,descripcion');
      if (error) throw error
      setTasks(taskData || []);
    } catch (error) {
      setError('Error al cargar las tareas. Por favor, intente de nuevo.')
      console.error('Error fetching tareas:', error)
    }
  };

  const fetchStudents = async () => {
    try {
      const { data: studentData, error } = await supabase
        .from('Alumno')
        .select('id,nombre_apellido');
      if (error) throw error
      setStudents(studentData || [])
    } catch (error) {
      setError('Error al cargar los alumnos. Por favor, intente de nuevo.')
      console.error('Error fetching alumnos:', error)
    }
  };

  const handleAssign = async () => {
    if (!selectedTask) {
      setError("Por favor, selecciona una tarea.");
      return;
    }
    if (!selectedStudent) { // Cambia la condición para verificar un solo estudiante
      setError("Por favor, selecciona un estudiante.");
      return;
    }
    if (!startDate || !endDate) {
      setError("Por favor, selecciona las fechas de inicio y fin.");
      return;
    }
    if (isBefore(endDate, startDate)) {
      setError("La fecha de fin no puede ser anterior a la fecha de inicio.");
      return;
    }

    try {
      const { data, error } = await supabase
        .from('Tarea')
        .update({
          id_alumno: selectedStudent.id, // Asigna solo un alumno
          fecha_ini: startDate,
          fecha_fin: endDate,
          descripcion: description
        })
        .eq('id', selectedTask.id); // Asegúrate de que selectedTask tenga la propiedad 'id'

      if (error) throw error;

      setAssigned(true);
      setTimeout(() => setAssigned(false), 3000);
    } catch (error) {
      setError("Error al asignar la tarea. Por favor, intente de nuevo.");
      console.error("Error assigning task:", error);
    }
  };

  const handleGoBack = () => {
    router.back()
  }

  const filteredStudents = students.filter(student =>
    student && student.nombre_apellido &&
    student.nombre_apellido.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-200 to-green-200 p-4 flex flex-col items-center justify-center">
      <Card className="w-full max-w-2xl bg-white rounded-3xl shadow-lg overflow-hidden">
        <CardHeader className="bg-yellow-400 p-6">
          <div className="flex items-center justify-between mb-4">
            <Button
              onClick={handleGoBack}
              variant="secondary"
              className="flex items-center px-4 py-2 text-blue-800 bg-white hover:bg-blue-100 rounded-full shadow-md transition-all duration-300 ease-in-out"
            >
              <ArrowLeft className="h-5 w-5 mr-2" />
              Volver
            </Button>
            <CardTitle className="text-3xl font-bold text-blue-800 text-center flex-grow">
              Asignar Tareas
            </CardTitle>
            <div className="w-32"></div>
          </div>
        </CardHeader>
        <CardContent className="p-6 space-y-6">
          <div>
            <label htmlFor="task-select" className="block text-lg font-medium text-gray-700 mb-2">
              Seleccionar Tarea
            </label>
            <Select onValueChange={(value) => {
              const selected = tasks.find(task => task.id === value) || null;
              setSelectedTask(selected);
            }} value={selectedTask?.id || ''}>
              <SelectTrigger id="task-select" className="w-full">
                <SelectValue placeholder="Selecciona una tarea" />
              </SelectTrigger>
              <SelectContent>
                {tasks.map((task) => (
                  <SelectItem key={task.id} value={task.id}>
                    <div>
                      <strong>{task.nombre_tarea}</strong>
                      <p>Tipo: {task.tipo_tarea}</p>
                      <p>Descripción: {task.descripcion}</p>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="block text-lg font-medium text-gray-700 mb-2">
              Seleccionar Estudiante
            </label>
            <div className="space-y-2">
              <div className="flex items-center">
                <Search className="w-5 h-5 text-gray-500 mr-2" />
                <Input
                  type="text"
                  placeholder="Buscar estudiantes..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full"
                />
              </div>
              <ScrollArea className="h-40 w-full rounded-md border">
                <div className="p-4">
                  {filteredStudents.map((student) => (
                    <div key={student.id} className="flex items-center space-x-2 mb-2">
                      <Checkbox
                        id={`student-${student.id}`}
                        checked={selectedStudent?.id === student.id} // Cambia el control a un solo estudiante
                        onCheckedChange={() => setSelectedStudent(selectedStudent?.id === student.id ? null : student)} // Cambia a un solo estudiante
                      />
                      <label
                        htmlFor={`student-${student.id}`}
                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                      >
                        {student.nombre_apellido}
                      </label>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </div>
            <div className="mt-2 text-sm text-gray-600">
              Estudiante seleccionado: {selectedStudent ? selectedStudent.nombre_apellido : 'Ninguno'}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="start-date" className="block text-lg font-medium text-gray-700 mb-2">
                Fecha de Inicio
              </label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    id="start-date"
                    variant={"outline"}
                    className={`w-full justify-start text-left font-normal ${!startDate ? "text-muted-foreground" : ""}`}
                  >
                    {startDate ? format(startDate, "dd/MM/yyyy") : <span>Seleccionar fecha</span>}
                    <CalendarIcon className="ml-auto" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent>
                  <Calendar
                    mode="single"
                    selected={startDate}
                    onSelect={setStartDate}
                    initialFocus
                    locale={es}
                  />
                </PopoverContent>
              </Popover>
            </div>
            <div>
              <label htmlFor="end-date" className="block text-lg font-medium text-gray-700 mb-2">
                Fecha de Fin
              </label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    id="end-date"
                    variant={"outline"}
                    className={`w-full justify-start text-left font-normal ${!endDate ? "text-muted-foreground" : ""}`}
                  >
                    {endDate ? format(endDate, "dd/MM/yyyy") : <span>Seleccionar fecha</span>}
                    <CalendarIcon className="ml-auto" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent>
                  <Calendar
                    mode="single"
                    selected={endDate}
                    onSelect={setEndDate}
                    initialFocus
                    locale={es}
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>

          <div>
            <label htmlFor="description" className="block text-lg font-medium text-gray-700 mb-2">
              Descripción
            </label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Descripción de la tarea"
              rows={4}
            />
          </div>

          <div className="flex justify-between items-center">
            <Button
              onClick={handleAssign}
              className="mt-4"
              //variant="primary"
            >
              Asignar Tarea
            </Button>
            {assigned && (
              <div className="text-green-600 font-semibold">
                Tarea asignada con éxito!
              </div>
            )}
          </div>

          {error && (
            <div className="mt-2 text-red-600 font-semibold">
              {error}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

