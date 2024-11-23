'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowLeft } from 'lucide-react'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!)

type Paso = {
  identificador: number;
  texto: string | null;
  video: string | null;
  imagen: string | null;
}

type TareaPasos = {
  identificador: number;
  nombre: string;
  descripcion: string;
  fecha_inicio: string;
  fecha_fin: string;
}

export default function Component() {
  const [tarea, setTarea] = useState<TareaPasos | null>(null)
  const [pasos, setPasos] = useState<Paso[]>([])
  const [error, setError] = useState('')
  const router = useRouter()

  useEffect(() => {
    const tareaId = localStorage.getItem('tareaId')
    if (tareaId) {
      fetchTarea(tareaId)
      fetchPasos(tareaId)
    } else {
      router.push('/home')
    }
  }, [])

  const fetchTarea = async (id: string) => {
    const { data, error } = await supabase
      .from('Tarea_pasos')
      .select('*')
      .eq('identificador', id)
      .single()

    if (error) {
      console.error('Error fetching tarea:', error)
      setError('Error al cargar la tarea')
    } else if (data) {
      setTarea(data)
    }
  }

  const fetchPasos = async (tareaId: string) => {
    const { data, error } = await supabase
      .from('Pasos')
      .select('*')
      .eq('id_tarea', tareaId)
      .order('identificador', { ascending: true })

    if (error) {
      console.error('Error fetching pasos:', error)
      setError('Error al cargar los pasos de la tarea')
    } else if (data) {
      setPasos(data)
    }
  }

  const renderPaso = (paso: Paso) => {
    if (paso.texto) {
      return (
        <Card key={paso.identificador} className="flex flex-col h-full">
          <CardHeader className="flex-shrink-0">
            <CardTitle className="text-lg font-bold">Paso {paso.identificador}</CardTitle>
          </CardHeader>
          <CardContent className="flex-grow overflow-auto">
            <p className="text-sm">{paso.texto}</p>
          </CardContent>
        </Card>
      )
    } else if (paso.imagen) {
      return (
        <Card key={paso.identificador} className="flex flex-col h-full">
          <CardHeader className="flex-shrink-0">
            <CardTitle className="text-lg font-bold">Paso {paso.identificador}</CardTitle>
          </CardHeader>
          <CardContent className="flex-grow flex items-center justify-center overflow-hidden">
            <img 
              src={paso.imagen} 
              alt={`Paso ${paso.identificador} de la tarea`} 
              className="max-w-full max-h-full object-contain"
            />
          </CardContent>
        </Card>
      )
    } else if (paso.video) {
      return (
        <Card key={paso.identificador} className="flex flex-col h-full">
          <CardHeader className="flex-shrink-0">
            <CardTitle className="text-lg font-bold">Paso {paso.identificador}</CardTitle>
          </CardHeader>
          <CardContent className="flex-grow flex items-center justify-center overflow-hidden">
            <video controls className="max-w-full max-h-full">
              <source src={paso.video} type="video/mp4" />
              Tu navegador no soporta el elemento de video.
            </video>
          </CardContent>
        </Card>
      )
    } else {
      return (
        <Card key={paso.identificador} className="flex flex-col h-full">
          <CardContent className="flex-grow flex items-center justify-center">
            <p className="text-red-500">Formato de paso no soportado</p>
          </CardContent>
        </Card>
      )
    }
  }

  if (error) {
    return <div className="text-center text-red-500 text-2xl">{error}</div>
  }

  if (!tarea || pasos.length === 0) {
    return <div className="text-center text-2xl">Cargando tarea...</div>
  }

  return (
    <div className="h-screen flex flex-col p-4">
      <Button 
        onClick={() => router.push('/home')} 
        className="self-start mb-2 bg-yellow-400 hover:bg-yellow-500 text-gray-800 text-sm py-2 px-4"
      >
        <ArrowLeft className="mr-2 h-4 w-4" />
        Volver al Inicio
      </Button>
      <main className="flex-grow flex flex-col overflow-hidden">
        <h1 className="text-2xl font-bold mb-2 text-center text-gray-900">{tarea.nombre}</h1>
        <p className="text-sm mb-4 text-center text-gray-700">{tarea.descripcion}</p>
        <div 
          className="grid gap-4 flex-grow overflow-hidden" 
          style={{
            gridTemplateColumns: `repeat(auto-fit, minmax(${Math.floor(100 / Math.ceil(Math.sqrt(pasos.length)))}%, 1fr))`,
            gridTemplateRows: `repeat(auto-fit, minmax(${Math.floor(100 / Math.ceil(Math.sqrt(pasos.length)))}%, 1fr))`
          }}
        >
          {pasos.map(renderPaso)}
        </div>
      </main>
    </div>
  )
}