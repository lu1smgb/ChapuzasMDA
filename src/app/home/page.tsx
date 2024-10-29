'use client'
import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Gamepad2 } from 'lucide-react'

export default function HomePage() {
  const router = useRouter()
  const [currentDateTime, setCurrentDateTime] = useState('')
  const [username, setUsername] = useState('')

  useEffect(() => {
    const updateDateTime = () => {
      const now = new Date()
      const options: Intl.DateTimeFormatOptions = { 
        weekday: 'long', 
        hour: '2-digit', 
        minute: '2-digit',
        hour12: true
      }
      setCurrentDateTime(now.toLocaleString('es-ES', options))
    }

    updateDateTime()
    const timer = setInterval(updateDateTime, 60000) // Update every minute

    // Fetch user data
    const fetchUserData = async () => {
      const response = await fetch('/api/user')
      const data = await response.json()
      if (data.user) {
        setUsername(data.user.username)
      } else {
        router.push('/login')
      }
    }
    fetchUserData()

    return () => clearInterval(timer)
  }, [router])

  const navigateToAgenda = () => {
    router.push('/menu-calendario-agenda')
  }

  const navigateToGames = () => {
    router.push('/juegos-y-aplicaciones')
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-200 to-green-200 p-4 flex flex-col items-center justify-center">
      <h1 className="text-4xl font-bold text-blue-600 mb-4">Bienvenido, {username}</h1>
      <h2 className="text-2xl font-bold text-blue-600 mb-8">Mi Página Principal</h2>
      <div className="w-full max-w-4xl grid grid-cols-1 md:grid-cols-2 gap-8">
        <Button
          onClick={navigateToAgenda}
          className="h-64 text-3xl font-bold bg-yellow-400 hover:bg-yellow-500 text-blue-800 rounded-3xl shadow-lg transition-all duration-300 ease-in-out transform hover:scale-105 flex flex-col items-center justify-center p-4"
        >
          <div className="text-4xl mb-4 text-center">Agenda</div>
          <div className="text-2xl text-center capitalize">{currentDateTime}</div>
        </Button>
        <Button
          onClick={navigateToGames}
          className="h-64 text-3xl font-bold bg-pink-400 hover:bg-pink-500 text-purple-800 rounded-3xl shadow-lg transition-all duration-300 ease-in-out transform hover:scale-105 flex flex-col items-center justify-center"
        >
          <Gamepad2 className="w-24 h-24 mb-4" />
          Juegos y Aplicaciones
        </Button>
      </div>
    </div>
  )
}