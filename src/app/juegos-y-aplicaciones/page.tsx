'use client'
import React from 'react'
import { useRouter } from 'next/navigation'
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { ArrowLeft, Puzzle, Book, Music, PenTool, Brain } from 'lucide-react'

type AppOrGame = {
  id: number;
  name: string;
  //icon: React.ReactNode;
  emoji: string;
  url: string;
  color: string;
}

export default function Aplicaciones() {
  const router = useRouter()
  const appsAndGames: AppOrGame[] = [
    { 
      id: 1, 
      name: "Juegos de Puzzle", 
      //icon: <Puzzle className="w-12 h-12" />, 
      emoji: "🧩", 
      url: "https://www.cokitos.com/categoria/puzzles/", 
      color: "bg-blue-400" 
    },
    { 
      id: 2, 
      name: "Cuentos Interactivos", 
      //icon: <Book className="w-12 h-12" />, 
      emoji: "📚", 
      url: "https://www.cuentosinteractivos.org/", 
      color: "bg-green-400" 
    },
    { 
      id: 3, 
      name: "Juegos Musicales", 
      //icon: <Music className="w-12 h-12" />, 
      emoji: "🎵", 
      url: "https://www.cokitos.com/categoria/musica/", 
      color: "bg-yellow-400" 
    },
    { 
      id: 4, 
      name: "Dibujo y Colorear", 
      //icon: <PenTool className="w-12 h-12" />, 
      emoji: "🎨", 
      url: "https://www.colorear-online.com/", 
      color: "bg-pink-400" 
    },
    { 
      id: 5, 
      name: "Juegos de Memoria", 
      //icon: <Brain className="w-12 h-12" />, 
      emoji: "🧠", 
      url: "https://www.cokitos.com/categoria/memoria/", 
      color: "bg-purple-400" 
    },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-200 to-green-200 p-4">
      <Button 
        onClick={() => router.push('/home')} 
        className="mb-4 bg-yellow-400 hover:bg-yellow-500 text-blue-800"
      >
        <ArrowLeft className="mr-2 h-4 w-4" /> Volver a Inicio
      </Button>
      <h1 className="text-4xl font-bold text-center text-blue-600 mb-8">Juegos y Aplicaciones</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
        {appsAndGames.map((item) => (
          <Card key={item.id} className={`${item.color} p-6 rounded-3xl shadow-lg transition-transform duration-300 hover:scale-105`}>
            <a href={item.url} target="_blank" rel="noopener noreferrer" className="flex flex-col items-center text-center">
              <div className="text-6xl mb-4">{item.emoji}</div>
              {/* <div className="bg-white rounded-full p-4 mb-4">
                {item.icon}
              </div> */}
              <h2 className="text-2xl font-bold text-white mb-2">{item.name}</h2>
              <p className="text-white">Haz clic para jugar</p>
            </a>
          </Card>
        ))}
      </div>
    </div>
  )
}