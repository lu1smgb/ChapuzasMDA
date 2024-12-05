'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowLeft, ArrowRight, ChevronLeft, ChevronRight } from 'lucide-react'
import { createClient } from '@supabase/supabase-js'
import confetti from 'canvas-confetti'

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!)

type Alumno = {
  identificador: string;
  nombre: string;
  numero_pasos: number;
  IU_Audio: boolean;
  IU_Video: boolean;
  IU_Imagen: boolean;
  IU_Pictograma: boolean;
  IU_Texto: boolean;
}

type Tarea = {
  identificador: number;
  nombre: string;
  descripcion: string;
  fecha_inicio: string;
  fecha_fin: string;
}

type Paso = {
  identificador: number;
  texto: string | null;
  imagen: string | null;
  audio: string | null;
  video: string | null;
  pictograma: string | null;
  id_tarea: string | null;
}

export default function TareaPasos() {
  const [alumno, setAlumno] = useState<Alumno | null>(null)
  const [tarea, setTarea] = useState<Tarea | null>(null)
  const [pasos, setPasos] = useState<Paso[]>([])
  const [currentStep, setCurrentStep] = useState(0)
  const [error, setError] = useState<string | null>(null)
  const [showCompletionPage, setShowCompletionPage] = useState(false)
  const [currentMediaIndex, setCurrentMediaIndex] = useState<{ [key: number]: number }>({})
  const router = useRouter()

  useEffect(() => {
    const alumnoId = localStorage.getItem('alumnoId')
    const tareaId = localStorage.getItem('tareaId')
    if (alumnoId && tareaId) {
      fetchAlumno(alumnoId)
      fetchTarea(tareaId)
      fetchPasos(tareaId)
    } else {
      setError('No se encontró información del alumno o la tarea')
    }
  }, [])

  const fetchAlumno = async (id: string) => {
    const { data, error } = await supabase
      .from('Alumno')
      .select('*')
      .eq('identificador', id)
      .single()

    if (error) {
      console.error('Error fetching alumno:', error)
      setError('Error al cargar los datos del alumno')
    } else if (data) {
      setAlumno(data)
    }
  }

  const fetchTarea = async (id: string) => {
    const { data, error } = await supabase
      .from('Tarea_Pasos')
      .select('*')
      .eq('identificador', id)
      .single()

    if (error) {
      console.error('Error fetching tarea:', error)
      setError('Error al cargar los datos de la tarea')
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
      const initialMediaIndex = data.reduce((acc, _, index) => {
        acc[index] = 0
        return acc
      }, {} as { [key: number]: number })
      setCurrentMediaIndex(initialMediaIndex)
    }
  }

  const nextStep = () => {
    if (alumno && currentStep < Math.ceil(pasos.length / alumno.numero_pasos) - 1) {
      setCurrentStep(currentStep + 1);
    } else if (
      alumno &&
      currentStep === Math.ceil(pasos.length / alumno.numero_pasos) - 1 &&
      pasos.length <= (currentStep + 1) * alumno.numero_pasos
    ) {
      setShowCompletionPage(true);
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1)
    }
  }

  const nextMedia = (pasoIndex: number) => {
    setCurrentMediaIndex(prev => ({
      ...prev,
      [pasoIndex]: (prev[pasoIndex] + 1) % getMediaCount(pasos[pasoIndex])
    }))
  }

  const prevMedia = (pasoIndex: number) => {
    setCurrentMediaIndex(prev => ({
      ...prev,
      [pasoIndex]: (prev[pasoIndex] - 1 + getMediaCount(pasos[pasoIndex])) % getMediaCount(pasos[pasoIndex])
    }))
  }

  const getMediaCount = (paso: Paso) => {
    return [paso.texto, paso.audio, paso.imagen, paso.video, paso.pictograma].filter(Boolean).length
  }

  const renderPasoContent = () => {
    if (!alumno || pasos.length === 0) return null

    const startIndex = currentStep * alumno.numero_pasos
    const endIndex = Math.min(startIndex + alumno.numero_pasos, pasos.length)
    const currentPasos = pasos.slice(startIndex, endIndex)

    const gridCols = alumno.numero_pasos <= 2 ? 'md:grid-cols-2' : 'md:grid-cols-3'
    const cardHeight = `h-[${Math.floor(100 / Math.ceil(alumno.numero_pasos / 3))}vh]`

    return (
      <div className={`grid grid-cols-1 ${gridCols} gap-4 h-full`}>
        {currentPasos.map((paso, index) => {
          const pasoIndex = startIndex + index
          const currentMedia = currentMediaIndex[pasoIndex] || 0
          const mediaCount = getMediaCount(paso)

          return (
            <Card key={paso.identificador} className={`font-escolar flex flex-col justify-between p-4 bg-white shadow-lg rounded-lg ${cardHeight}`}>
              <CardHeader>
                <CardTitle className="text-2xl font-bold text-center">Paso Nº {pasoIndex + 1}</CardTitle>
              </CardHeader>
              <CardContent className="flex-grow flex flex-col justify-center items-center">
                {alumno.IU_Texto && paso.texto && currentMedia === 0 && (
                  <p className="text-xl mb-4">{paso.texto}</p>
                )}
                {alumno.IU_Audio && paso.audio && currentMedia === (alumno.IU_Texto ? 1 : 0) && (
                  <audio controls className="w-full mb-4">
                    <source src={paso.audio} type="audio/mpeg" />
                    Tu navegador no soporta el elemento de audio.
                  </audio>
                )}
                {alumno.IU_Pictograma && paso.pictograma && currentMedia === (alumno.IU_Texto && alumno.IU_Audio ? 2 : alumno.IU_Texto || alumno.IU_Audio ? 1 : 0) && (
                  <img src={paso.pictograma} alt={`Pictograma del paso ${pasoIndex + 1}`} className="w-full h-auto object-contain mb-4 rounded-lg" />
                )}
                {alumno.IU_Imagen && paso.imagen && currentMedia === (alumno.IU_Texto && alumno.IU_Audio && alumno.IU_Pictograma ? 3 : alumno.IU_Texto && alumno.IU_Audio || alumno.IU_Texto && alumno.IU_Pictograma || alumno.IU_Audio && alumno.IU_Pictograma ? 2 : alumno.IU_Texto || alumno.IU_Audio || alumno.IU_Pictograma ? 1 : 0) && (
                  <img src={paso.imagen} alt={`Paso ${pasoIndex + 1}`} className="w-full h-auto object-contain mb-4 rounded-lg" />
                )}
                {alumno.IU_Video && paso.video && currentMedia === mediaCount - 1 && (
                  <video controls className="w-full h-auto object-contain rounded-lg mb-4">
                    <source src={paso.video} type="video/mp4" />
                    Tu navegador no soporta el elemento de video.
                  </video>
                )}
              </CardContent>
              {mediaCount > 1 && (
                <div className="flex justify-between mt-4">
                  <Button onClick={() => prevMedia(pasoIndex)} className="bg-blue-500 hover:bg-blue-600 text-white">
                    <ChevronLeft className="h-6 w-6" />
                  </Button>
                  <Button onClick={() => nextMedia(pasoIndex)} className="bg-blue-500 hover:bg-blue-600 text-white">
                    <ChevronRight className="h-6 w-6" />
                  </Button>
                </div>
              )}
            </Card>
          )
        })}
      </div>
    )
  }

  const handleCompletion = async () => {
    if (tarea) {
      const { error } = await supabase
        .from('Tarea_Pasos')
        .update({ completada: true })
        .eq('identificador', tarea.identificador)

      if (error) {
        console.error('Error updating tarea:', error)
        setError('Error al marcar la tarea como completada')
      } else {
        confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 }
        })
        setTimeout(() => router.push('/menu-calendario-agenda'), 3000)
      }
    }
  }

  if (error) {
    return <div className="h-screen flex items-center justify-center text-2xl text-red-600">{error}</div>
  }

  if (!alumno || !tarea || pasos.length === 0) {
    return <div className="h-screen flex items-center justify-center text-2xl">Cargando...</div>
  }

  if (showCompletionPage) {
    return (
      <div className="h-screen bg-gradient-to-br from-blue-100 via-purple-100 to-pink-100 flex items-center justify-center">
        <Button
          onClick={handleCompletion}
          className="bg-green-500 hover:bg-green-600 text-white text-6xl py-24 px-12 rounded-3xl"
        >
          ¡Toca aquí para terminar la tarea!
        </Button>
      </div>
    )
  }

  return (
    <div className="font-escolar h-screen bg-gradient-to-br from-blue-100 via-purple-100 to-pink-100 flex flex-col p-4">
      <Button 
        onClick={() => router.push('/menu-calendario-agenda')} 
        className="self-start mb-4 bg-yellow-400 hover:bg-yellow-500 text-gray-800 text-2xl py-3 px-6"
      >
        <ArrowLeft className="mr-2 h-6 w-6" />
        Volver al Inicio
      </Button>
      <main className="flex-grow flex items-center justify-center">
        <Button 
          onClick={prevStep} 
          disabled={currentStep === 0}
          className="bg-purple-500 hover:bg-purple-600 text-white text-4xl py-12 px-8 rounded-full mr-4"
        >
          <ArrowLeft className="h-20 w-20" />
        </Button>
        <Card className="w-full max-w-6xl bg-white/80 backdrop-blur-md shadow-lg">
          <CardHeader>
            <CardTitle className="text-4xl font-bold text-center text-gray-900">{tarea.nombre}</CardTitle>
            <p className="text-2xl text-center text-gray-700">{tarea.descripcion}</p>
          </CardHeader>
          <CardContent className="h-[calc(100vh-20rem)]">
            {renderPasoContent()}
            <div className="mt-4 text-center">
              <span className="text-3xl font-bold">
                Página {currentStep + 1} de {Math.ceil(pasos.length / alumno.numero_pasos)}
              </span>
            </div>
          </CardContent>
        </Card>
        <Button 
          onClick={nextStep} 
          disabled={currentStep === Math.ceil(pasos.length / alumno.numero_pasos) - 1 && showCompletionPage}
          className="bg-purple-500 hover:bg-purple-600 text-white text-4xl py-12 px-8 rounded-full ml-4"
        >
          <ArrowRight className="h-20 w-20" />
        </Button>
      </main>
    </div>
  )
}