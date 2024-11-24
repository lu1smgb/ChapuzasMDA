'use client'
import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { ArrowLeft, ArrowRight } from 'lucide-react'
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
  const [currentPage, setCurrentPage] = useState(1)

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

  const nextPage = () => {
      setCurrentPage(currentPage + 1)
    
  }

  const prevPage = () => {
      setCurrentPage(currentPage - 1)
  }

  return (
    <div className="font-escolar min-h-screen bg-gradient-to-b from-blue-200 to-green-200 p-4">
      <Button
        onClick={() => router.push('/menu-calendario-agenda')}
        className="mb-10 bg-yellow-400 hover:bg-yellow-500 text-blue-800 text-lg py-3 px-6 h-20 flex items-center"
      >
        <ArrowLeft className="mr-1 h-10 w-10" /> ATRÁS
      </Button>

      <h1 className="text-4xl font-bold text-center text-blue-600 mb-8">CALENDARIO DE ACTIVIDADES</h1>

      <div className="flex justify-between mt-8 h-full">
        <Button
          onClick={prevPage}
          className="bg-purple-500 hover:bg-purple-600 text-white text-6xl py-32 px-12 rounded-l-full mr-8 transition-all duration-300 ease-in-out transform hover:scale-105"
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
            return (
              <Card key={index} className="p-6 bg-white rounded-3xl shadow-lg flex-grow mx-1 h-full">
                <div className="flex flex-col items-center h-full">
                  <div className="text-5xl font-bold text-purple-600">
                    {date.getDate()}
                  </div>
                  <div className="text-2xl font-semibold text-blue-600 mb-4">
                    {date.toLocaleString('default', { weekday: 'long' }).toUpperCase()} {isToday && '- HOY'}
                  </div>
                  <div className="flex-grow w-full mt-4">
                    {/* Aquí puedes agregar la lógica para mostrar las actividades */}
                  </div>
                </div>
              </Card>
            );
          })}
        </div>

        <Button
          onClick={nextPage}
          className="bg-purple-500 hover:bg-purple-600 text-white text-6xl py-32 px-12 rounded-r-full ml-8 transition-all duration-300 ease-in-out transform hover:scale-105"
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