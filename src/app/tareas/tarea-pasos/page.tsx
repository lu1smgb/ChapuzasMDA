'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowLeft, ArrowRight } from 'lucide-react'
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
    }
  }


  const nextStep = () => {
    if (alumno && currentStep < Math.ceil(pasos.length / alumno.numero_pasos) - 1) {
      // Si hay más pasos disponibles, avanza al siguiente paso.
      setCurrentStep(currentStep + 1);
    } else if (
      alumno &&
      currentStep === Math.ceil(pasos.length / alumno.numero_pasos) - 1 &&
      pasos.length <= (currentStep + 1) * alumno.numero_pasos
    ) {
      // Si estamos en el último conjunto de pasos y no hay más pasos por mostrar,
      // muestra la página de finalización.
      setShowCompletionPage(true);
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1)
    }
  }

  const renderPasoContent = () => {
    if (!alumno || pasos.length === 0) return null

    const startIndex = currentStep * alumno.numero_pasos
    const endIndex = Math.min(startIndex + alumno.numero_pasos, pasos.length)
    const currentPasos = pasos.slice(startIndex, endIndex)

    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 h-full">
        {currentPasos.map((paso, index) => (
          <div key={paso.identificador} className="flex flex-col justify-center">
            {alumno.IU_Texto && paso.texto && (
              <p className="text-3xl mb-6">{paso.texto}</p>
            )}
            {alumno.IU_Audio && paso.audio && (
              <audio controls className="w-full mb-6">
                <source src={paso.audio} type="audio/mpeg" />
                Tu navegador no soporta el elemento de audio.
              </audio>
            )}
            {alumno.IU_Pictograma && paso.pictograma && (
              <img src={paso.pictograma} alt={`Pictograma del paso ${startIndex + index + 1}`} className="w-full h-auto object-contain mb-6 rounded-lg" />
            )}
            {alumno.IU_Imagen && paso.imagen && (
              <img src={paso.imagen} alt={`Paso ${startIndex + index + 1}`} className="w-full h-auto object-contain mb-6 rounded-lg" />
            )}
            {alumno.IU_Video && paso.video && (
              <video controls className="w-full h-auto object-contain rounded-lg mb-6">
                <source src={paso.video} type="video/mp4" />
                Tu navegador no soporta el elemento de video.
              </video>
            )}
          </div>
        ))}
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
          ¡Has completado la tarea!
        </Button>
      </div>
    )
  }

  return (
    <div className="h-screen bg-gradient-to-br from-blue-100 via-purple-100 to-pink-100 flex flex-col p-4">
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
                Paso {currentStep + 1} de {Math.ceil(pasos.length / alumno.numero_pasos)}
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