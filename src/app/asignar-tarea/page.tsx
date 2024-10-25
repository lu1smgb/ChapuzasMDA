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
import { CalendarIcon, CheckCircle, AlertCircle, Search, ArrowLeft, Type } from 'lucide-react'
import { format, isAfter, isBefore } from "date-fns"
import { es } from "date-fns/locale"
import { useRouter } from 'next/navigation'

type Task ={
  id: string;
  name: string;
}

type Student ={
  id: string;
  name: string;
}

export default function AsignarTareas() {
    const [tasks, setTasks] = useState<Task[]>([]); 
    const [students, setStudents] = useState<Student[]>([]);
    const [selectedTask, setSelectedTask] = useState<string | undefined>(undefined);
    const [selectedStudents, setSelectedStudents] = useState<string[]>([]);
    const [startDate, setStartDate] = useState<Date | undefined>();
    const [endDate, setEndDate] = useState<Date | undefined>();
    const [description, setDescription] = useState('');
    const [assigned, setAssigned] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const router = useRouter();

    useEffect(() => {
      fetchTasks();
      fetchStudents();
    }, []);
    
    const fetchTasks = async () => {
      const { data: taskData, error } = await supabase.from('Tarea').select('*');
      if (error) console.error("Error fetching tasks:", error);
      else setTasks(taskData as Task[]); // Usa 'as Task[]' para asegurar el tipo
   };
  
    const fetchStudents = async () => {
      const { data: studentData, error } = await supabase.from('Alumno').select('*');
      if (error) console.error("Error fetching students:", error);
      else setStudents(studentData as Student[]);
    };

    const handleStudentToggle = (studentId: string) => {
      setSelectedStudents((prev) => 
          prev.includes(studentId)
              ? prev.filter((id) => id !== studentId)
              : [...prev, studentId]
      );
   };  

    const handleAssign = async () => {
        if (!selectedTask) {
            setError("Por favor, selecciona una tarea.")
            return
        }
        if (selectedStudents.length === 0) {
            setError("Por favor, selecciona al menos un estudiante.")
            return
        }
        if (!startDate || !endDate) {
            setError("Por favor, selecciona las fechas de inicio y fin.")
            return
        }
        if (isBefore(endDate, startDate)) {
            setError("La fecha de fin no puede ser anterior a la fecha de inicio.")
            return
        }

        try {
            const { data, error } = await supabase
                .from('Tarea')
                .update({
                    id_alumno: selectedStudents,
                    fecha_ini: startDate,
                    fecha_fin: endDate,
                    descripcion: description
                })
                .eq('id', selectedTask);

            if (error) throw error;

            setAssigned(true);
            setTimeout(() => setAssigned(false), 3000);
        } catch (error) {
            setError("Error al asignar la tarea. Por favor, intente de nuevo.");
            console.error("Error assigning task:", error);
        }
    }

    const handleGoBack = () => {
        router.back()
    }

    const filteredStudents = students.filter(student => 
      student && student.name && 
      student.name.toLowerCase().includes(searchTerm.toLowerCase())
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
                        <Select onValueChange={setSelectedTask} value={selectedTask}>
                            <SelectTrigger id="task-select" className="w-full">
                                <SelectValue placeholder="Selecciona una tarea" />
                            </SelectTrigger>
                            <SelectContent>
                                {tasks.map((task) => (
                                    <SelectItem key={task.id} value={task.id}>{task.name}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    <div>
                        <label className="block text-lg font-medium text-gray-700 mb-2">
                            Seleccionar Estudiantes
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
                                                checked={selectedStudents.includes(student.id)}
                                                onCheckedChange={() => handleStudentToggle(student.id)}
                                            />
                                            <label
                                                htmlFor={`student-${student.id}`}
                                                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                                            >
                                                {student.name}
                                            </label>
                                        </div>
                                    ))}
                                </div>
                            </ScrollArea>
                        </div>
                        <div className="mt-2 text-sm text-gray-600">
                            Estudiantes seleccionados: {selectedStudents.length}
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
                                        className={`w-full justify-start text-left font-normal ${!startDate && "text-muted-foreground"}`}
                                    >
                                        <CalendarIcon className="mr-2 h-4 w-4" />
                                        {startDate ? format(startDate, "PPP", { locale: es }) : <span>Selecciona una fecha</span>}
                                    </Button>
                                </PopoverTrigger>
                                <PopoverContent className="w-auto p-0">
                                    <Calendar
                                        mode="single"
                                        selected={startDate}
                                        onSelect={setStartDate}
                                        initialFocus
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
                                        className={`w-full justify-start text-left font-normal ${!endDate && "text-muted-foreground"}`}
                                    >
                                        <CalendarIcon className="mr-2 h-4 w-4" />
                                        {endDate ? format(endDate, "PPP", { locale: es }) : <span>Selecciona una fecha</span>}
                                    </Button>
                                </PopoverTrigger>
                                <PopoverContent className="w-auto p-0">
                                    <Calendar
                                        mode="single"
                                        selected={endDate}
                                        onSelect={setEndDate}
                                        initialFocus
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
                            placeholder="Añade una descripción..."
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                        />
                    </div>

                    <Button onClick={handleAssign} className="w-full bg-blue-600 text-white hover:bg-blue-700">
                        Asignar Tarea
                    </Button>

                    {assigned && (
                        <div className="flex items-center mt-2 text-green-600">
                            <CheckCircle className="w-5 h-5 mr-2" />
                            Tarea asignada con éxito.
                        </div>
                    )}

                    {error && (
                        <div className="flex items-center mt-2 text-red-600">
                            <AlertCircle className="w-5 h-5 mr-2" />
                            {error}
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    )
}
