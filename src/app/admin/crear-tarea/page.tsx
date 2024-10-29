'use client'

import React from 'react'
import { useRouter } from 'next/navigation'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Utensils, Package, ListChecks, Gamepad2, ArrowLeft } from 'lucide-react'

export default function CrearTareas() {
  const router = useRouter()

  const handleNavigate = (taskType: string) => {
    // Asegúrate de que la ruta sea correcta según tu estructura de carpetas
    router.push(`/admin/crear-tarea/${taskType.toLowerCase()}`)
  }

  const handleGoBack = () => {
    // Cambia router.back() por router.push() para volver a una ruta específica
    router.push('/admin')
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-200 to-green-200 p-4 flex flex-col items-center justify-center">
      <Card className="w-full max-w-4xl bg-white rounded-3xl shadow-lg overflow-hidden">
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
            <CardTitle className="text-4xl font-bold text-blue-800 text-center flex-grow">
              Crear Tareas
            </CardTitle>
            <div className="w-32"></div> {/* Spacer para equilibrar el diseño */}
          </div>
        </CardHeader>
        <CardContent className="p-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Button
              onClick={() => handleNavigate('crear-tarea-comedor')}
              className="h-40 text-2xl font-bold bg-red-400 hover:bg-red-500 text-white rounded-2xl shadow-lg transition-all duration-300 ease-in-out transform hover:scale-105 flex flex-col items-center justify-center"
            >
              <Utensils className="w-16 h-16 mb-2" />
              COMEDOR
            </Button>
            <Button
              onClick={() => handleNavigate('crear-tarea-material')}
              className="h-40 text-2xl font-bold bg-blue-400 hover:bg-blue-500 text-white rounded-2xl shadow-lg transition-all duration-300 ease-in-out transform hover:scale-105 flex flex-col items-center justify-center"
            >
              <Package className="w-16 h-16 mb-2" />
              MATERIAL
            </Button>
            <Button
              onClick={() => handleNavigate('crear-tarea-por-pasos')}
              className="h-40 text-2xl font-bold bg-green-400 hover:bg-green-500 text-white rounded-2xl shadow-lg transition-all duration-300 ease-in-out transform hover:scale-105 flex flex-col items-center justify-center"
            >
              <ListChecks className="w-16 h-16 mb-2" />
              POR PASOS
            </Button>
            <Button
              onClick={() => handleNavigate('crear-tarea-juego')}
              className="h-40 text-2xl font-bold bg-purple-400 hover:bg-purple-500 text-white rounded-2xl shadow-lg transition-all duration-300 ease-in-out transform hover:scale-105 flex flex-col items-center justify-center"
            >
              <Gamepad2 className="w-16 h-16 mb-2" />
              JUEGO
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
