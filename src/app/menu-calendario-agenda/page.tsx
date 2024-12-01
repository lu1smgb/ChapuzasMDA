'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { supabase } from "@/lib/supabase"
import { motion, AnimatePresence } from 'framer-motion'

type Task = {
  id: number
  nombre_tarea: string
  completada: boolean
  id_estudiante: number
  tipo_tabla: string,
  fecha_inicio: string,
  imagen?:string
}


const defaultImages = {
  'Tarea_Juego': '/images/videojuego.png',
  'Tarea_Material': '/images/materialescolar.png',
  'Tarea_Menu': '/images/menu.png',
  'Tarea_Pasos': '/images/instrucciones.png',
}

export default function StudentAgenda() {
  const router = useRouter()
  const [tasks, setTasks] = useState<Task[]>([])
 

  useEffect(() => { // Obtiene las tareas de la tabla nombre_tabla y les asigna el tipo tipo_tabla
    fetchAllTasks()
  }, [])


  const fetchTasks = async (nombre_tabla: string) => {

    const userId = localStorage.getItem('userId') // Recuperar el identificador del alumno del localStorage

    
    if (!userId) {
      console.error('No se encontró el identificador del alumno.')
      return
    }

    const today = new Date().toISOString().split('T')[0]

    const { data, error } = await supabase
      .from(nombre_tabla)
      .select("identificador, fecha_inicio, nombre, id_alumno, completada, imagen_tarea") // Seleccionar los campos necesarios
      .eq('completada', false)
      .eq('id_alumno', userId)
      .gte('fecha_inicio', today) 
      .lt('fecha_inicio', today + 'T23:59:59')
      .order('identificador', { ascending: true })

    if (error) {
      console.error('Error fetching tasks:', error)
    } else if(data) {
      return data.map((task: any): Task => ({
        id: task.identificador,
        nombre_tarea: task.nombre,
        completada: task.completada,
        id_estudiante: task.id_alumno,
        tipo_tabla: nombre_tabla,
        fecha_inicio: task.fecha_inicio,
        imagen: task.imagen_tarea
      }));
    }
  }

  const fetchAllTasks = async () => {
    const taskTables = ['Tarea_Juego', 'Tarea_Material', 'Tarea_Menu', 'Tarea_Pasos'];
    const allTasks = await Promise.all(taskTables.map(fetchTasks));
    setTasks(allTasks.flat().filter((task): task is Task => task !== undefined) as Task[]);
  };

  const markTaskAsComplete = async (task: Task) => { // Marcar la tarea como completada
    const { error } = await supabase
      .from(task.tipo_tabla)
      .update({ completada: true })
      .eq('identificador', task.id);
  
    if (error) {
      console.error('Error updating task:', error);
    } else {
      setTasks(tasks.filter(t => t.id !== task.id)); // Eliminar la tarea de la lista
    }
  };


  const handleTaskClick = async (task: Task) => {
    localStorage.setItem('tareaId', task.id.toString());
    console.log(task.id);
      switch(task.tipo_tabla) {
        case 'Tarea_Juego':
            const { data, error } = await supabase
            .from('Tarea_Juego')
            .select('enlace')
            .eq('identificador', task.id)
            .single();

            if (error) {
            console.error('Error fetching external link:', error);
            } else if (data && data.enlace) {
            window.open(data.enlace, '_blank'); // Abrir el enlace en una nueva pestaña
            await markTaskAsComplete(task); // Marcar la tarea como completada
            }
          break;
        case 'Tarea_Material':
          router.push('/material');
          break;
        case 'Tarea_Menu':
          router.push('/menu');
          break;
        case 'Tarea_Pasos':
          router.push('/tareas/tarea-pasos');
          break;
        default:
          console.error('Tipo de tarea desconocido');
      }
  }

  return (
    <div className="font-escolar min-h-screen bg-gradient-to-b from-blue-200 to-green-200 p-4 flex flex-col">
      <div className="flex justify-end mb-10">
        <Button
          onClick={() => router.push('/login')} 
          className="bg-red-500 hover:bg-red-600 text-white hover:text-black font-bold text-2xl py-3 px-6 h-20 flex items-center justify-center"
        >
          <img src="/images/cerrar.png" className="mr-1 h-16 w-16" /> CERRAR
        </Button>
      </div>
      <h1 className="text-4xl font-bold text-center text-blue-600 mb-6">MI AGENDA</h1>
      <div className="flex flex-col md:flex-row gap-8 flex-grow">
        <Card className="flex-grow md:w-2/3 bg-white rounded-3xl shadow-lg overflow-hidden relative">
          <CardContent className="p-6">
            <h2 className="text-3xl font-bold mb-4 text-purple-600">TAREAS PARA HOY</h2>
            <div className="space-y-4 relative">
              {tasks.map((task) => (
                <motion.div
                  key={task.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="bg-purple-300 p-6 rounded-xl flex items-center cursor-pointer hover:bg-purple-400 transition-colors"
                  onClick={() => handleTaskClick(task)}
                >
                  <div className="w-20 h-20 mr-6 relative flex-shrink-0">
                    <img
                      src={task.imagen|| defaultImages[task.tipo_tabla as keyof typeof defaultImages]}
                      alt={task.nombre_tarea}
                      className="rounded-lg"
                    />
                  </div>
                  <h3 className="text-3xl font-semibold text-purple-900">{task.nombre_tarea}</h3>
                </motion.div>
              ))}
              {tasks.length === 0 && (
                <p className="text-center font-bold text-gray-600 text-2xl">¡NO HAY TAREAS!</p>
              )}
            </div>
          </CardContent>
        </Card>
        <Card className="md:w-1/6 bg-white rounded-3xl shadow-lg flex">
            <Button
            onClick={() => router.push('/menu-calendario-agenda/calendario')}
            className="w-full h-full flex flex-col items-center justify-center p-6 bg-green-500 hover:bg-green-600 text-white rounded-2xl text-center"
            >
            <img src="/images/calendario.png" className="w-17 h-17 mb-2" />
            <h2 className="text-2xl font-bold text-center">CALENDARIO</h2>
            </Button>
        </Card>
      </div>
    </div>
  )
}

