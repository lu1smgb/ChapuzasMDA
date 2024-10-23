'use client'
import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { ArrowLeft, Car, ChevronLeft, ChevronRight } from 'lucide-react'
import { supabase } from "@/lib/supabase";


type Activity = {
  id: number
  name: string
  description: string
  start_time: string
  end_time: string
}

export default function Calendario() {
  const router = useRouter()
  const [currentDate, setCurrentDate] = useState(new Date())
  const [activities, setActivities] = useState<Activity[]>([])

  useEffect(() => {
    fetchActivities()
  }, [currentDate])

  const fetchActivities = async () => {
    const startOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1)
    const endOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0)

    const { data, error } = await supabase
      .from('activities')
      .select('*')
      .gte('start_time', startOfMonth.toISOString())
      .lte('end_time', endOfMonth.toISOString())
      .order('start_time', { ascending: true })

    if (error) {
      console.error('Error fetching activities:', error)
    } else if (data) {
      setActivities(data)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-200 to-green-200 p-4">  
      <Button  // Botón para volver al menú de calendario y agenda
        onClick={() => router.push('/menu-calendario-agenda')} 
        className="mb-10 bg-yellow-400 hover:bg-yellow-500 text-blue-800 text-lg py-3 px-6 w-full h-20 flex items-center justify-center"
      >
        <ArrowLeft className="mr-1 h-10 w-10" /> ATRÁS
      </Button>
      
      <h1 className="text-4xl font-bold text-center text-blue-600 mb-8">Calendario de Actividades</h1>
      
      <div className="flex justify-between mt-8 h-full">
        <Card className="p-6 bg-white rounded-3xl shadow-lg w-1/3 h-full mx-1">
          <div className="flex flex-col items-center">
            <div className="text-5xl font-bold text-purple-600">
              {new Date(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate() - 1).getDate()}
            </div>
            <div className="text-2xl font-semibold text-blue-600 mb-4">
              {new Date(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate() - 1).toLocaleString('default', { weekday: 'long' })} - Ayer
            </div>
            <img src="/images/ayer.png" className="w-24 h-24 mb-4" />
            <div className="flex-grow w-full mt-4">
              {/* Aquí puedes agregar la lógica para mostrar las actividades de ayer */}
            </div>
          </div>
        </Card>
        <Card className="p-6 bg-white rounded-3xl shadow-lg w-1/3 h-full mx-1">
          <div className="flex flex-col items-center">
            <div className="text-5xl font-bold text-purple-600">
              {currentDate.getDate()}
            </div>
            <div className="text-2xl font-semibold text-blue-600 mb-4">
              {new Date(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate()).toLocaleString('default', { weekday: 'long' })} - Hoy
            </div>
            <img src="/images/hoy.png" alt="Imagen de la fecha" className="w-24 h-24 mb-4" />
            <div className="flex-grow w-full mt-4">
              <div className="flex flex-col items-start">
                <div className="text-lg font-semibold text-gray-800 mb-6">ACTIVIDAD 1: Pedir material</div>
                <div className="text-lg font-semibold text-gray-800 mb-6">ACTIVIDAD 2: Hacer comandas</div>
                <div className="text-lg font-semibold text-gray-800 mb-6">ACTIVIDAD 3: </div>
                <div className="text-lg font-semibold text-gray-800 mb-5">ACTIVIDAD 4: </div>
              </div>
            </div>
          </div>
        </Card>
        <Card className="p-6 bg-white rounded-3xl shadow-lg w-1/3 h-full mx-1">
          <div className="flex flex-col items-center">
            <div className="text-5xl font-bold text-purple-600">
              {new Date(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate() + 1).getDate()}
            </div>
            <div className="text-2xl font-semibold text-blue-600 mb-4">
          {new Date(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate() + 1).toLocaleString('default', { weekday: 'long' })} - Mañana
            </div>
            <img src="/images/mañana.png" alt="Imagen de la fecha" className="w-24 h-24 mb-4" />
            <div className="flex-grow w-full mt-4">
              {/* Aquí puedes agregar la lógica para mostrar las actividades de mañana */}
            </div>
          </div>
        </Card>
      </div>

    </div>
  )
}