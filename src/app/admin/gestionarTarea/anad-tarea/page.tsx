'use client'

import React from 'react'
import { useRouter } from 'next/navigation'
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Utensils, Package, ListChecks, Gamepad2, ArrowLeft } from 'lucide-react'

export default function CrearTareas() {
  const router = useRouter()

  const taskTypes = [
    { 
      title: 'TAREA MENÚ', 
      icon: Utensils, 
      link: '/admin/crear-tarea/crear-tarea-menu',
      color: 'bg-red-500 hover:bg-red-600'
    },
    { 
      title: 'TAREA MATERIAL', 
      icon: Package, 
      link: '/admin/crear-tarea/crear-tarea-material',
      color: 'bg-blue-500 hover:bg-blue-600'
    },
    { 
      title: 'TAREA POR PASOS', 
      icon: ListChecks, 
      link: '/admin/crear-tarea/crear-tarea-por-pasos',
      color: 'bg-green-500 hover:bg-green-600'
    },
    { 
      title: 'TAREA JUEGO', 
      icon: Gamepad2, 
      link: '/admin/crear-tarea/crear-tarea-juego',
      color: 'bg-purple-500 hover:bg-purple-600'
    },
  ]

  return (
    <div className="bg-white rounded-lg shadow-lg p-4 md:p-8 w-full max-w-4xl mx-auto">
      <nav className="mb-4">
        <Button onClick={() => router.push('.')} variant="outline" className="text-base bg-yellow-400 hover:bg-yellow-500">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Volver
        </Button>
      </nav>

      <h1 className="text-2xl font-bold mb-6 text-center text-gray-900">Crear Tareas</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {taskTypes.map((task, index) => (
          <Button
            key={index}
            onClick={() => router.push(task.link)}
            className={`h-24 text-xl font-bold ${task.color} text-white rounded-lg shadow-md transition-all duration-300 ease-in-out transform hover:scale-105 flex items-center justify-center`}
          >
            <task.icon className="w-8 h-8 mr-2" />
            {task.title}
          </Button>
        ))}
      </div>
    </div>
  )
}


