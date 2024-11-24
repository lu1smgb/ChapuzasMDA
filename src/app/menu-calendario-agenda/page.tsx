'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { ArrowLeft, Calendar, CheckCircle, TrophyIcon } from 'lucide-react'
import { supabase } from "@/lib/supabase"
import { motion, AnimatePresence } from 'framer-motion'
import confetti from 'canvas-confetti'

type Task = {
  id: number
  nombre_tarea: string
  tipo_tarea: string
  completada: boolean
  id_estudiante: number
}

export default function StudentAgenda() {
  const router = useRouter()
  const [tasks, setTasks] = useState<Task[]>([])
  const [showNotification, setShowNotification] = useState(false)
 

  useEffect(() => {
    fetchTasks()
  }, [])

  const fetchTasks = async () => {

    const userId = localStorage.getItem('userId') // Recuperar el identificador del alumno del localStorage

    if (!userId) {
      console.error('No se encontró el identificador del alumno.')
      return
    }

    const { data, error } = await supabase
      .from('Tarea')
      .select('*')
      .eq('completada', false)
      .eq('id_alumno', userId) // Filtrar las tareas por el identificador del alumno
      .order('id', { ascending: true })

    if (error) {
      console.error('Error fetching tasks:', error)
    } else if (data) {
      setTasks(data)
    }
  }

  const markTaskAsComplete = async (taskId: number) => {
    const { error } = await supabase
      .from('Tarea')
      .update({ completada: true }) // Marcar la tarea como completada
      .eq('id', taskId)

    if (error) {
      console.error('Error updating task:', error)
    } else {
      setTasks(tasks.filter(task => task.id !== taskId)) // Eliminar la tarea de la lista
      showCelebration()
    }
  }

  const showCelebration = () => {
    setShowNotification(true)
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 }
    })
    setTimeout(() => setShowNotification(false), 8000)
  }

  return (
    <div className="font-escolar min-h-screen bg-gradient-to-b from-blue-200 to-green-200 p-4 flex flex-col">
      <div className="flex justify-end mb-10">
        <Button
          onClick={() => router.push('/login')} 
          className="bg-red-500 hover:bg-red-600 text-white hover:text-black text-lg py-3 px-6 h-20 flex items-center justify-center"
        >
          <ArrowLeft className="mr-1 h-10 w-10" /> CERRAR SESIÓN
        </Button>
      </div>
      <h1 className="text-4xl font-bold text-center text-blue-600 mb-8">MI AGENDA</h1>
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
            className="bg-purple-100 p-4 rounded-xl flex items-center justify-between"
          >
            <div>
            <h3 className="text-xl font-semibold text-purple-800">{task.nombre_tarea}</h3>
            <p className="text-purple-600">{task.tipo_tarea}</p>
            </div>
            <Button
            onClick={() => markTaskAsComplete(task.id)}
            className="bg-green-500 hover:bg-green-600 text-white rounded-full p-12"
            >
            <CheckCircle className="h-12 w-12" />
            </Button>
          </motion.div>
          ))}
          {tasks.length === 0 && (
          <p className="text-center font-bold text-gray-600 text-2xl">¡NO HAY TAREAS!</p>
          )}
        </div>
        </CardContent>
        <AnimatePresence>
        {showNotification && (
          <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 50 }}
          className="absolute flex items-centerjustify-center bottom-4 bg-yellow-400 text-blue-800 p-4 rounded-3xl shadow-lg"
          >
          <TrophyIcon className="h-6 w-6 mr-2" />
          <p className="text-lg font-bold">¡Felicidades! Has completado una tarea.</p>
          </motion.div>
        )}
        </AnimatePresence>
      </Card>
      <Card className="md:w-1/6 bg-white rounded-3xl shadow-lg flex">
        <Button
        onClick={() => router.push('/menu-calendario-agenda/calendario')}
        className="w-full h-full flex flex-col items-center justify-center p-6 bg-green-500 hover:bg-green-600 text-white rounded-2xl text-center"
        >
        <Calendar className="w-5 h-5 mb-2" />
        <h2 className="text-xl md:text-2xl font-bold text-center">CALENDARIO</h2>
        </Button>
      </Card>
      </div>
    </div>
  )
}