'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowLeft, ImageIcon } from 'lucide-react'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'
import { motion } from 'framer-motion'

type ImageOption = {
  name: string;
  src: string;
  alt: string;
}

const imageOptions: ImageOption[] = [
  { name: 'Manzana roja', src: 'https://images.unsplash.com/photo-1568702846914-96b305d2aaeb?w=300&h=300&fit=crop', alt: 'Manzana roja' },
  { name: 'Platano amarillo', src: 'https://images.unsplash.com/photo-1571771894821-ce9b6c11b08e?w=300&h=300&fit=crop', alt: 'Platano amarillo' },
  { name: 'Coche rojo', src: 'https://images.unsplash.com/photo-1568605117036-5fe5e7bab0b7?w=300&h=300&fit=crop', alt: 'Coche rojo' },
  { name: 'Perro gracioso', src: 'https://images.unsplash.com/photo-1517849845537-4d257902454a?w=300&h=300&fit=crop', alt: 'Perro gracioso' },
  { name: 'Casa de madera', src: 'https://images.unsplash.com/photo-1518780664697-55e3ad937233?w=300&h=300&fit=crop', alt: 'Casa de madera' },
  { name: 'Arbol en el campo', src: 'https://images.unsplash.com/photo-1513836279014-a89f7a76ae86?w=300&h=300&fit=crop', alt: 'Arbol en el campo' },
]

export default function LoginImagen() {
  const [alumno, setAlumno] = useState<{ identificador: string; nombre: string; credencial: string } | null>(null)
  const [selectedImages, setSelectedImages] = useState<string[]>([])
  const [error, setError] = useState('')
  const [shuffledImages, setShuffledImages] = useState<ImageOption[]>([])
  const router = useRouter()

  useEffect(() => {
    const alumnoId = localStorage.getItem('alumnoId')
    if (alumnoId) {
      fetchAlumno(alumnoId)
    } else {
      router.push('/')
    }
  }, [])

  useEffect(() => {
    if (alumno) {
      setShuffledImages(shuffleArray([...imageOptions]))
    }
  }, [alumno])

  const fetchAlumno = async (identificador: string) => {
    const { data, error } = await supabase
      .from('Alumno')
      .select('identificador, nombre, credencial')
      .eq('identificador', identificador)
      .single()

    if (error) {
      console.error('Error fetching alumno:', error)
      router.push('/lista-alumnos')
    } else if (data) {
      setAlumno(data)
    }
  }

  const shuffleArray = (array: ImageOption[]) => {
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
  }

  const handleImageSelect = (imageName: string) => {
    setSelectedImages(prev => {
      const index = prev.indexOf(imageName)
      if (index > -1) {
        return prev.filter(name => name !== imageName)
      } else {
        return [...prev, imageName]
      }
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (!alumno) {
      setError('No se ha seleccionado un alumno')
      return
    }

    const requiredCredentials = alumno.credencial.split(',').map(cred => cred.trim())

    if (selectedImages.length !== requiredCredentials.length) {
      setError('Número incorrecto de imágenes selecccionadas')
      return
    }

    const isCorrect = selectedImages.every((image, index) => image === requiredCredentials[index])

    if (isCorrect) {
      localStorage.setItem('userId', alumno.identificador)
      localStorage.setItem('nombreUsuario', alumno.nombre)
      router.push('/menu-calendario-agenda')
    } else {
      setError('Secuencia de imágenes incorrecta. Inténtalo de nuevo.')
      setSelectedImages([])
      setShuffledImages(shuffleArray([...imageOptions]))
    }
  }

  const renderImageOptions = () => {
    return (
      <div className="grid grid-cols-3 gap-4">
        {shuffledImages.map((image) => (
          <motion.div
            key={image.name}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Button
              onClick={() => handleImageSelect(image.name)}
              className={`w-full h-auto aspect-square p-1 ${
                selectedImages.includes(image.name) 
                  ? 'ring-8 ring-blue-500 scale-110 z-10' 
                  : 'hover:ring-4 hover:ring-blue-300'
              }`}
              aria-label={image.alt}
            >
              <img src={image.src} alt={image.alt} className="w-full h-full object-cover rounded-lg" />
            </Button>
          </motion.div>
        ))}
      </div>
    )
  }

  return (
    <div className="h-screen flex flex-col p-4 bg-gradient-to-br from-blue-100 via-purple-100 to-pink-100">
      <Link href="/login" passHref>
        <Button variant="outline" className="self-start mb-2 bg-yellow-400 hover:bg-yellow-500 text-gray-800 text-lg py-2 px-4">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Volver
        </Button>
      </Link>
      <main className="flex-grow flex items-center justify-center">
        <Card className="w-full max-w-4xl bg-white/80 backdrop-blur-md shadow-lg">
          <CardHeader>
            <CardTitle className="text-3xl font-bold text-center text-gray-900">Login con Imagen</CardTitle>
          </CardHeader>
          <CardContent>
            {alumno ? (
              <>
                <p className="text-xl text-center mb-4">
                  Bienvenido, <strong>{alumno.nombre}</strong>
                </p>
                <p className="text-lg text-center mb-6">
                  Selecciona las imágenes correctas en el orden adecuado para iniciar sesión
                </p>
                <form onSubmit={handleSubmit} className="space-y-6">
                  {renderImageOptions()}
                  {error && (
                    <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 my-4" role="alert">
                      <p className="text-xl font-bold">Error</p>
                      <p className="text-lg">{error}</p>
                    </div>
                  )}
                  <Button 
                    type="submit" 
                    className="w-full bg-green-500 hover:bg-green-600 text-white text-xl py-4"
                    disabled={selectedImages.length === 0}
                  >
                    <ImageIcon className="mr-2 h-6 w-6" />
                    Iniciar Sesión
                  </Button>
                </form>
              </>
            ) : (
              <p className="text-center text-red-500 text-xl">
                {error || 'Cargando...'}
              </p>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  )
}