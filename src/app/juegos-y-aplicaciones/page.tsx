'use client'
import React, { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { ArrowLeft } from 'lucide-react'
import Image from 'next/image'

interface Juego {
  id: number;
  name: string;
  site_url: string;
  img_name: string;
  bg_color: string;
}

export default function Aplicaciones() {
  const router = useRouter();

  const [games, setGames] = useState<Juego[]>([]);
  const [error, setError] = useState(null);

  const getGames = async () => {

    try {
      const response = await fetch("/api/juegos");

      if (!response.ok) {
        throw new Error("Error al obtener los juegos");
      }

      const data = await response.json();
      console.log(JSON.stringify(data, null, 2))
      setGames(data);

    }
    catch (error: any) {

      console.error(error);
      setError(error.message);

    }
  }

  useEffect(() => {
    getGames();
  }, []);

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
        {games.map((item) => (
          <Card key={item.id} className={`${item.bg_color} p-6 rounded-3xl shadow-lg transition-transform duration-300 hover:scale-105`}>
            <a href={item.site_url} target="_blank" rel="noopener noreferrer" className="flex flex-col items-center text-center">
              <div className="bg-white rounded-full p-4 mb-4">
                <Image 
                  src={`/images/${item.img_name}`} 
                  width={50} 
                  height={50} 
                  alt={item.img_name}
                  unoptimized
                />
              </div>
              <h2 className="text-2xl font-bold text-white mb-2">{item.name}</h2>
              <p className="text-white">Haz clic para jugar</p>
            </a>
          </Card>
        ))}
      </div>
    </div>
  )
}