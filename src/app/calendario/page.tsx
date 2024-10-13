'use client'
import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { ArrowLeft, ChevronLeft, ChevronRight } from 'lucide-react'
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

  const changeMonth = (increment: number) => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + increment, 1))
  }

  const getDaysInMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate()
  }

  const getMonthName = (date: Date) => {
    return date.toLocaleString('default', { month: 'long' })
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-200 to-green-200 p-4">
      <Button 
        onClick={() => router.push('/menu-calendario-agenda')} 
        className="mb-4 bg-yellow-400 hover:bg-yellow-500 text-blue-800"
      >
        <ArrowLeft className="mr-2 h-4 w-4" /> Volver a Menu de Calendario y Agenda
      </Button>
      <h1 className="text-4xl font-bold text-center text-blue-600 mb-8">Calendario de Actividades</h1>
      <Card className="p-6 bg-white rounded-3xl shadow-lg max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-4">
          <Button onClick={() => changeMonth(-1)} className="bg-blue-500 hover:bg-blue-600">
            <ChevronLeft className="h-6 w-6" />
          </Button>
          <h2 className="text-5xl font-bold text-purple-600">
            {getMonthName(currentDate).toUpperCase()}
          </h2>
          <Button onClick={() => changeMonth(1)} className="bg-blue-500 hover:bg-blue-600">
            <ChevronRight className="h-6 w-6" />
          </Button>
        </div>
        <div className="text-2xl font-bold text-center text-blue-600 mb-4">
          {currentDate.getFullYear()}
        </div>
        <div className="grid grid-cols-7 gap-2">
          {['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'].map(day => (
            <div key={day} className="text-center font-bold text-lg text-purple-700">{day}</div>
          ))}
          {Array.from({ length: getDaysInMonth(currentDate) }).map((_, index) => {
            const date = index + 1
            const activitiesForDay = activities.filter(activity => 
              new Date(activity.start_time).getDate() === date
            )
            return (
              <Button
                key={date}
                className={`h-24 ${
                  activitiesForDay.length > 0 
                    ? 'bg-green-400 hover:bg-green-500 text-white' 
                    : 'bg-gray-100 hover:bg-gray-200 text-gray-800'
                }`}
                onClick={() => {
                  // Aquí puedes agregar la lógica para mostrar las actividades del día
                  console.log(`Actividades para el ${date}:`, activitiesForDay)
                }}
              >
                <div className="flex flex-col items-center">
                  <span className="text-2xl font-bold">{date}</span>
                  {activitiesForDay.length > 0 && (
                    <span className="text-sm mt-1 font-semibold">
                      {activitiesForDay.length} actividad{activitiesForDay.length !== 1 ? 'es' : ''}
                    </span>
                  )}
                </div>
              </Button>
            )
          })}
        </div>
      </Card>
    </div>
  )
}