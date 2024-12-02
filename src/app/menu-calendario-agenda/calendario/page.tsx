'use client'
import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { ArrowLeft, ArrowRight } from 'lucide-react'
import { supabase } from "@/lib/supabase";
import { motion } from 'framer-motion';
import { start } from 'repl'


type Task = {
  id: number,
  nombre_tarea: string,
  completada: boolean,
  id_estudiante: number,
  tipo_tabla: string,
  fecha_inicio: string,
  fecha_fin: string,
  imagen: string
};

export default function Calendario() {
  const router = useRouter()
  const [currentDate, setCurrentDate] = useState(new Date())
  const [tasks, setTasks] = useState<Task[]>([])
  const [currentPage, setCurrentPage] = useState(1)

  useEffect(() => {
    fetchAllTasks();
  }, [currentDate])

  const fetchTasks = async (nombre_tabla: string) => {
    const userId = localStorage.getItem('userId'); // Recuperar el identificador del alumno del localStorage

    if (!userId) {
      console.error('No se encontró el identificador del alumno.');
      return [];
    }

    const { data, error } = await supabase
      .from(nombre_tabla)
      .select("identificador, fecha_inicio, fecha_fin, completada, id_alumno, nombre, descripcion, imagen_tarea") // Seleccionar los campos necesarios
      .eq('id_alumno', userId)
      .order('identificador', { ascending: true }); // Luego ordenar por identificador

    if (error) {
      console.error('Error fetching tasks:', error);
      return [];
    } else {
      return data.map((task: any) => ({
        id: task.identificador,
        nombre_tarea: task.nombre,
        completada: task.completada,
        id_estudiante: task.id_alumno,
        tipo_tabla: nombre_tabla,
        fecha_inicio: task.fecha_inicio,
        fecha_fin: task.fecha_fin,
        imagen: task.imagen_tarea
      }));
    }
  };

  const generateDateRange = (startDate: string, endDate: string) => {
    const dates = [];
    let currentDate = new Date(startDate);
    const finalDate = new Date(endDate);

    while (currentDate <= finalDate) {
      dates.push(currentDate.toISOString().split('T')[0]);
      currentDate.setDate(currentDate.getDate() + 1);
    }

    return dates;
  };

  const fetchAllTasks = async () => {
    const taskTables = ['Tarea_Juego', 'Tarea_Material', 'Tarea_Menu', 'Tarea_Pasos'];
    const allTasks = await Promise.all(taskTables.map(fetchTasks));
    setTasks(allTasks.flat().filter((task): task is Task => task !== undefined));
  };

  const groupTasksByDate = (tasks: Task[]) => {
    const groupedTasks: { [key: string]: Task[] } = {};

    tasks.forEach(task => {
      const dates = generateDateRange(task.fecha_inicio, task.fecha_fin);
      dates.forEach(date => {
        if (!groupedTasks[date]) {
          groupedTasks[date] = [];
        }
        groupedTasks[date].push(task);
      });
    });

    // Ordenar las tareas dentro de cada fecha
    Object.keys(groupedTasks).forEach(date => {
      groupedTasks[date].sort((a, b) => Number(a.completada) - Number(b.completada));
    });

    return groupedTasks;
  };

  const groupedTasks = groupTasksByDate(tasks); 


  const nextPage = () => {
      setCurrentPage(currentPage + 1)
    
  }

  const prevPage = () => {
      setCurrentPage(currentPage - 1)
  }

  const dayImages: { [key: string]: string } = { // Imágenes para los días de la semana
    'lunes': '/images/lunes.png',
    'martes': '/images/martes.png',
    'miércoles': '/images/miércoles.png',
    'jueves': '/images/jueves.png',
    'viernes': '/images/viernes.png',
    'sábado': '/images/sábado.png',
    'domingo': '/images/domingo.png',
  };

  const defaultImages = {
    'Tarea_Juego': '/images/videojuego.png',
    'Tarea_Material': '/images/materialescolar.png',
    'Tarea_Menu': '/images/menu.png',
    'Tarea_Pasos': '/images/instrucciones.png',
  }


  return (
    <div className="font-escolar min-h-screen bg-gradient-to-b from-blue-200 to-green-200 p-4">
      <Button
        onClick={() => router.push('/menu-calendario-agenda')}
        className="mb-6 bg-yellow-400 hover:bg-yellow-500 font-bold text-blue-800 text-2xl py-3 px-6 h-20 flex items-center"
      >
        <img src="/images/agenda.png" alt="Agenda" className="mr-1 h-16 w-16" /> AGENDA
      </Button>

      <h1 className="text-4xl font-bold text-center text-blue-600 mb-7">CALENDARIO DE ACTIVIDADES</h1>

      <div className="flex justify-between mt-1 h-full">
        <Button
          onClick={prevPage}
          className="bg-purple-500 hover:bg-purple-600 text-white text-6xl py-32 px-12 rounded-l-full mr-5 transition-all duration-300 ease-in-out transform hover:scale-105"
          style={{
            clipPath: 'polygon(40% 0%, 100% 0%, 100% 100%, 40% 100%, 0% 50%)'
          }}
          aria-label="Página anterior"
        >
          <ArrowLeft className="h-32 w-32" />
        </Button>

        <div className="flex flex-grow justify-center space-x-4 h-full">
          {[...Array(3)].map((_, index) => {
            const date = new Date(currentDate);
            date.setDate(currentDate.getDate() - 1 + index + (currentPage - 1) * 3);
            const isToday = date.toDateString() === new Date().toDateString();
            const tasksForDate = groupedTasks[date.toISOString().split('T')[0]] || [];
            
            return (
              <Card key={index} className="p-4 bg-white rounded-3xl shadow-lg flex-grow mx-1 h-full">
                <div className="flex flex-col items-center h-full">
                  <div className="text-4xl font-bold text-purple-600">
                    {date.getDate()}
                  </div>
                  <div className="text-2xl font-semibold text-blue-600 mb-1"> 
                  {date.toLocaleString('default', { weekday: 'long' }).toUpperCase()} {isToday && '- HOY'}
                  </div>
                  <img src={dayImages[date.toLocaleString('default', { weekday: 'long' })]} 
                       className="w-40 h-40 object-contain -mt-10 -mb-5"
                       alt={date.toLocaleString('default', { weekday: 'long' })}  
                  />
                    <div className="flex-grow w-full space-y-2">
                    {tasksForDate.map((task: Task) => (
                      <div
                      key={task.id}
                      className={`bg-purple-300 p-6 rounded-xl flex items-center justify-between ${
                        task.completada ? 'opacity-50' : ''
                      }`}
                      >
                      <div className="flex items-center">
                        <div className="w-12 h-12 mr-2">
                        <img
                          src={task.imagen || defaultImages[task.tipo_tabla as keyof typeof defaultImages]}
                          alt={task.nombre_tarea}
                          className="rounded-lg"
                        />
                        </div>
                        <h3
                        className={`text-2xl font-bold text-purple-900 ${
                          task.completada ? 'line-through' : ''
                        }`}
                        >
                        {task.nombre_tarea}
                        </h3>
                      </div>
                      </div>
                    ))}
                    {tasksForDate.length === 0 && (
                      <p className="text-center text-gray-600 text-xl">¡NO TIENES TAREAS!</p>
                    )}
                    </div>
                </div>
              </Card>
            );
          })}
        </div>

        <Button
          onClick={nextPage}
          className="bg-purple-500 hover:bg-purple-600 text-white text-6xl py-32 px-12 rounded-r-full ml-5 transition-all duration-300 ease-in-out transform hover:scale-105"
          style={{
            clipPath: 'polygon(0% 0%, 60% 0%, 100% 50%, 60% 100%, 0% 100%)'
          }}
          aria-label="Página siguiente"
        >
          <ArrowRight className="h-32 w-32" />
        </Button>
      </div>
    </div>
  )
}