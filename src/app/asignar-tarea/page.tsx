'use client'

import React, { useState } from 'react'
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
import { format, isAfter, isBefore } from "date-fns"
import { es } from "date-fns/locale"
import { useRouter } from 'next/navigation'

type Task = {
  id: string
  name: string
}

type Student = {
  id: string
  name: string
}

const tasks: Task[] = [
  { id: '1', name: 'Recoger menús' },
  { id: '2', name: 'Repartir material' },
  { id: '3', name: 'Organizar biblioteca' },
]

const students: Student[] = [
  { id: '1', name: 'Ana García' },
  { id: '2', name: 'Carlos Rodríguez' },
  { id: '3', name: 'María López' },
  { id: '4', name: 'Juan Pérez' },
  { id: '5', name: 'Laura Martínez' },
  { id: '6', name: 'Pedro Sánchez' },
  { id: '7', name: 'Sofía Fernández' },
  { id: '8', name: 'Diego Ruiz' },
  { id: '9', name: 'Carmen Jiménez' },
  { id: '10', name: 'Javier Moreno' },
  { id: '11', name: 'Isabel Torres' },
  { id: '12', name: 'Miguel Álvarez' },
  { id: '13', name: 'Lucía Romero' },
  { id: '14', name: 'Alejandro Navarro' },
  { id: '15', name: 'Elena Molina' },
  { id: '16', name: 'Roberto Delgado' },
  { id: '17', name: 'Marta Ortiz' },
  { id: '18', name: 'Francisco Ramos' },
  { id: '19', name: 'Beatriz Castro' },
  { id: '20', name: 'Andrés Herrera' },
]

export default function AsignarTareas() {
  const [selectedTask, setSelectedTask] = useState<string | undefined>()
  const [selectedStudents, setSelectedStudents] = useState<string[]>([])
  const [startDate, setStartDate] = useState<Date | undefined>()
  const [endDate, setEndDate] = useState<Date | undefined>()
  const [description, setDescription] = useState('')
  const [assigned, setAssigned] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const router = useRouter()

  const handleStudentToggle = (studentId: string) => {
    setSelectedStudents(prev => 
      prev.includes(studentId)
        ? prev.filter(id => id !== studentId)
        : [...prev, studentId]
    )
  }

  const handleAssign = () => {
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

    // Aquí iría la lógica para guardar la asignación en la base de datos
    console.log(`Tarea asignada: Tarea ${selectedTask}, Estudiantes ${selectedStudents.join(', ')}, Inicio ${format(startDate, 'dd/MM/yyyy')}, Fin ${format(endDate, 'dd/MM/yyyy')}, Descripción: ${description}`)
    setAssigned(true)
    setError(null)
    setTimeout(() => setAssigned(false), 3000) // Mostrar confirmación por 3 segundos
  }

  const handleGoBack = () => {
    router.back()
  }

  const filteredStudents = students.filter(student =>
    student.name.toLowerCase().includes(searchTerm.toLowerCase())
  )

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
            <div className="w-32"></div> {/* Spacer para equilibrar el diseño */}
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
              placeholder="Añade una descripción de la tarea..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full h-24"
            />
          </div>

          <Button 
            onClick={handleAssign}
            className="w-full bg-green-500 hover:bg-green-600 text-white text-xl font-bold py-3 px-6 rounded-full shadow-md transition-all duration-300 ease-in-out transform hover:scale-105"
          >
            Asignar Tarea
          </Button>

          {error && (
            <div className="flex items-center justify-center text-red-600">
              <AlertCircle className="mr-2" />
              <span>{error}</span>
            </div>
          )}

          {assigned && (
            <div className="flex items-center justify-center text-green-600">
              <CheckCircle className="mr-2" />
              <span>Tarea asignada correctamente</span>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}