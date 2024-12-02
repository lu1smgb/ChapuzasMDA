'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowLeft, ImageIcon, X } from 'lucide-react'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'
import { motion, AnimatePresence } from 'framer-motion'

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
  const [success, setSuccess] = useState('')
  const [shuffledImages, setShuffledImages] = useState<ImageOption[]>([])
  const [showAlert, setShowAlert] = useState(false)
  const [showErrorCross, setShowErrorCross] = useState(false); // Added state for error cross
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
    setShowErrorCross(false) // Oculta la cruz de error si estaba visible
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!alumno) return

    const requiredCredentials = alumno.credencial.split(',').map(cred => cred.trim())

    if (selectedImages.length !== requiredCredentials.length) {
      // No hacemos nada si la secuencia no está completa
      return
    }

    const isCorrect = selectedImages.every((image, index) => image === requiredCredentials[index])

    if (isCorrect) {
      localStorage.setItem('userId', alumno.identificador)
      localStorage.setItem('nombreUsuario', alumno.nombre)
      router.push('/menu-calendario-agenda')
    } else {
      setShowErrorCross(true)
      setTimeout(() => {
        setShowErrorCross(false)
        resetSequence()
      }, 1500)
    }
  }

  const resetSequence = () => {
    setSelectedImages([])
    setShuffledImages(shuffleArray([...imageOptions]))
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

  const renderSelectedImagesPreview = () => {
    return (
      <div className="flex justify-center mt-4 space-x-2">
        {selectedImages.map((imageName, index) => {
          const image = imageOptions.find(img => img.name === imageName)
          return (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="w-12 h-12 rounded-full overflow-hidden border-2 border-blue-500"
            >
              <img src={image?.src} alt={image?.alt} className="w-full h-full object-cover" />
            </motion.div>
          )
        })}
      </div>
    )
  }

  return (
    <div className="min-h-screen flex flex-col p-4 bg-gradient-to-br from-blue-100 via-purple-100 to-pink-100">
      <Link href="/login" passHref>
        <Button variant="outline" className="self-start mb-2 bg-yellow-400 hover:bg-yellow-500 text-gray-800 text-lg py-2 px-4">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Volver
        </Button>
      </Link>
      <main className="flex-grow flex items-center justify-center">
        <Card className="w-full max-w-4xl bg-white/80 backdrop-blur-md shadow-lg">
          <CardHeader>
            <CardTitle className="text-4xl font-bold text-center text-gray-900">Login con Imagen</CardTitle>
          </CardHeader>
          <CardContent>
            {alumno ? (
              <>
                <p className="text-2xl text-center mb-4">
                  Bienvenido, <strong>{alumno.nombre}</strong>
                </p>
                <p className="text-xl text-center mb-6">
                  Selecciona las imágenes correctas en el orden adecuado para iniciar sesión
                </p>
                <form onSubmit={handleSubmit} className="space-y-6">
                  {renderImageOptions()}
                  {renderSelectedImagesPreview()}
                  <AnimatePresence>
                    {showErrorCross && (
                      <motion.div 
                        initial={{ opacity: 0, scale: 0.5 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.5 }}
                        className="fixed inset-0 flex items-center justify-center z-50"
                      >
                        <X 
                          className="text-red-500 w-96 h-96"
                        />
                      </motion.div>
                    )}
                  </AnimatePresence>
                  <AnimatePresence>
                    {showAlert && (error || success) && (
                      <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-50"
                      >
                        <div className="bg-white p-8 rounded-lg shadow-lg max-w-md w-full">
                          <div className="flex justify-between items-center mb-4">
                            <h2 className="text-3xl font-bold">{error ? '¡Error!' : '¡Éxito!'}</h2>
                            <Button
                              onClick={() => {
                                setShowAlert(false)
                                setError('')
                                setSuccess('')
                              }}
                              variant="ghost"
                              className="text-gray-500 hover:text-gray-700"
                            >
                              <X className="h-6 w-6" />
                            </Button>
                          </div>
                          <p className={`text-2xl ${error ? 'text-red-600' : 'text-green-600'}`}>
                            {error || success}
                          </p>
                          {error && (
                            <Button
                              onClick={resetSequence}
                              className="mt-6 w-full bg-blue-500 hover:bg-blue-600 text-white text-xl py-3"
                            >
                              Intentar de nuevo
                            </Button>
                          )}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                  <Button 
                    type="submit" 
                    className="w-full bg-green-500 hover:bg-green-600 text-white text-2xl py-6"
                    disabled={alumno && selectedImages.length !== alumno.credencial.split(',').length}
                  >
                    <ImageIcon className="mr-2 h-8 w-8" />
                    Iniciar Sesión
                  </Button>
                </form>
              </>
            ) : (
              <p className="text-center text-red-500 text-2xl">
                Cargando...
              </p>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  )
}