'use client'
import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { ArrowLeft, Clock } from 'lucide-react'
import { supabase } from "@/lib/supabase";

// Inicializa el cliente de Supabase
//const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!)

type Activity = {
  id: number
  name: string
  description: string
  start_time: string
  end_time: string
}

export default function Agenda() {
  const router = useRouter()
  const [currentActivity, setCurrentActivity] = useState<Activity | null>(null)

  useEffect(() => {
    fetchCurrentActivity()
  }, [])

  const fetchCurrentActivity = async () => {
    const now = new Date()
    const { data, error } = await supabase
      .from('activities')
      .select('*')
      .lte('start_time', now.toISOString())
      .gte('end_time', now.toISOString())
      .order('start_time', { ascending: true })
      .limit(1)
      .single()

    if (error) {
      console.error('Error fetching current activity:', error)
    } else if (data) {
      setCurrentActivity(data)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-200 to-green-200 p-4">
      <Button 
        onClick={() => router.push('/')} 
        className="mb-4 bg-yellow-400 hover:bg-yellow-500 text-blue-800"
      >
        <ArrowLeft className="mr-2 h-4 w-4" /> Volver a Inicio
      </Button>
      <h1 className="text-4xl font-bold text-center text-blue-600 mb-8">Mi Agenda</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
        <Card className="p-6 bg-white rounded-3xl shadow-lg transition-all duration-300 hover:shadow-xl">
          <Button
            onClick={() => {}} // Esta función se puede usar para mostrar más detalles de la actividad actual
            className="w-full h-64 text-left flex flex-col items-start justify-center p-6 bg-purple-400 hover:bg-purple-500 text-white rounded-2xl"
          >
            <Clock className="w-16 h-16 mb-4" />
            <h2 className="text-3xl font-bold mb-2">Actividad Actual</h2>
            {currentActivity ? (
              <>
                <p className="text-xl font-semibold">{currentActivity.name}</p>
                <p className="text-sm mt-2">{currentActivity.description}</p>
              </>
            ) : (
              <p className="text-xl">No hay actividad en este momento</p>
            )}
          </Button>
        </Card>
        <Card className="p-6 bg-white rounded-3xl shadow-lg transition-all duration-300 hover:shadow-xl">
          <Button
            onClick={() => router.push('/calendario')}
            className="w-full h-64 flex flex-col items-center justify-center p-6 bg-green-400 hover:bg-green-500 text-white rounded-2xl"
          >
            
            <h2 className="text-3xl font-bold">Calendario</h2>
          </Button>
        </Card>
      </div>
    </div>
  )
}