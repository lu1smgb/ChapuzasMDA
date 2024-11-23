/*'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowLeft, Image as ImageIcon } from "lucide-react"
import Link from 'next/link'
import { supabase } from '@/lib/supabase'

type ImageOption = {
  id: string;
  src: string;
  alt: string;
}

const imageOptions: ImageOption[] = [
  { id: '1', src: 'https://images.unsplash.com/photo-1568702846914-96b305d2aaeb?w=300&h=300&fit=crop', alt: 'Manzana roja' },
  { id: '2', src: 'https://images.unsplash.com/photo-1571771894821-ce9b6c11b08e?w=300&h=300&fit=crop', alt: 'Plátanos amarillos' },
  { id: '3', src: 'https://images.unsplash.com/photo-1568605117036-5fe5e7bab0b7?w=300&h=300&fit=crop', alt: 'Coche rojo' },
  { id: '4', src: 'https://images.unsplash.com/photo-1517849845537-4d257902454a?w=300&h=300&fit=crop', alt: 'Perro gracioso' },
  { id: '5', src: 'https://images.unsplash.com/photo-1518780664697-55e3ad937233?w=300&h=300&fit=crop', alt: 'Casa de madera' },
  { id: '6', src: 'https://images.unsplash.com/photo-1513836279014-a89f7a76ae86?w=300&h=300&fit=crop', alt: 'Árbol en el campo' },
]

export default function LoginImagen() {
  const [alumno, setAlumno] = useState<{ id: string; nombre_apellido: string; credenciales: string } | null>(null)
  const [selectedImage, setSelectedImage] = useState<string | null>(null)
  const [error, setError] = useState('')
  const [shuffledImages, setShuffledImages] = useState<ImageOption[]>([])
  const router = useRouter()

  useEffect(() => {
    const alumnoId = localStorage.getItem('alumnoId')
    if (alumnoId) {
      fetchAlumno(alumnoId)
    } else {
      router.push('/lista')
    }
  }, [])

  useEffect(() => {
    if (alumno) {
      setShuffledImages(shuffleArray([...imageOptions]))
    }
  }, [alumno])

  const fetchAlumno = async (id: string) => {
    const { data, error } = await supabase
      .from('Alumno')
      .select('id, nombre_apellido, credenciales')
      .eq('id', id)
      .single()

    if (error) {
      console.error('Error fetching alumno:', error)
      router.push('/lista')
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

  const handleImageSelect = (imageId: string) => {
    setSelectedImage(imageId)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (!selectedImage || !alumno) {
      setError('Por favor, selecciona una imagen')
      return
    }

    if (selectedImage === alumno.credenciales) {
      router.push('/home')
      localStorage.setItem('userId', alumno.id)
      localStorage.setItem('nombreUsuario', alumno.nombre_apellido)
    } else {
      setError('Imagen incorrecta. Inténtalo de nuevo.')
      setSelectedImage(null)
      setShuffledImages(shuffleArray([...imageOptions]))
    }
  }

  const renderImageOptions = () => {
    return (
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mt-6">
        {shuffledImages.map((image) => (
          <Button
            key={image.id}
            onClick={() => handleImageSelect(image.id)}
            className={`p-2 h-auto aspect-square ${
              selectedImage === image.id ? 'ring-4 ring-blue-500' : ''
            }`}
            aria-label={image.alt}
          >
            <img src={image.src} alt={image.alt} className="w-full h-full object-cover rounded-lg" />
          </Button>
        ))}
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-100 via-purple-100 to-pink-100 flex flex-col p-8">
      <Link href="/lista-alumnos" passHref>
        <Button variant="outline" className="self-start mb-8 bg-yellow-400 hover:bg-yellow-500 text-gray-800 text-xl py-6 px-8">
          <ArrowLeft className="mr-2 h-6 w-6" />
          Volver a la Lista de Alumnos
        </Button>
      </Link>
      <main className="flex-grow flex flex-col items-center justify-center">
        <Card className="w-full max-w-3xl bg-white/80 backdrop-blur-md shadow-lg">
          <CardHeader>
            <CardTitle className="text-3xl font-bold text-center text-gray-900">Login con Imagen</CardTitle>
          </CardHeader>
          <CardContent>
            {alumno ? (
              <>
                <p className="text-xl text-center mb-6">
                  Bienvenido, <strong>{alumno.nombre_apellido}</strong>
                </p>
                <p className="text-lg text-center mb-6">
                  Selecciona la imagen correcta para iniciar sesión
                </p>
                <form onSubmit={handleSubmit} className="space-y-6">
                  {renderImageOptions()}
                  {error && <p className="text-red-500 text-center mt-4">{error}</p>}
                  <Button 
                    type="submit" 
                    className="w-full bg-green-500 hover:bg-green-600 text-white text-2xl py-6 mt-6"
                    disabled={!selectedImage}
                  >
                    <ImageIcon className="mr-2 h-6 w-6" />
                    Iniciar Sesión
                  </Button>
                </form>
              </>
            ) : (
              <p className="text-center text-red-500">
                {error || 'Cargando...'}
              </p>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  )
}*/
'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowLeft, ImageIcon } from 'lucide-react'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'

type ImageOption = {
  name: string;
  src: string;
  alt: string;
}

const imageOptions: ImageOption[] = [
  { name: 'Manzana roja', src: 'https://images.unsplash.com/photo-1568702846914-96b305d2aaeb?w=300&h=300&fit=crop', alt: 'Manzana roja' },
  { name: 'Plátano amarillo', src: 'https://images.unsplash.com/photo-1571771894821-ce9b6c11b08e?w=300&h=300&fit=crop', alt: 'Plátano amarillo' },
  { name: 'Coche rojo', src: 'https://images.unsplash.com/photo-1568605117036-5fe5e7bab0b7?w=300&h=300&fit=crop', alt: 'Coche rojo' },
  { name: 'Perro gracioso', src: 'https://images.unsplash.com/photo-1517849845537-4d257902454a?w=300&h=300&fit=crop', alt: 'Perro gracioso' },
  { name: 'Casa de madera', src: 'https://images.unsplash.com/photo-1518780664697-55e3ad937233?w=300&h=300&fit=crop', alt: 'Casa de madera' },
  { name: 'Árbol en el campo', src: 'https://images.unsplash.com/photo-1513836279014-a89f7a76ae86?w=300&h=300&fit=crop', alt: 'Árbol en el campo' },
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
      setError('Número incorrecto de imágenes seleccionadas')
      return
    }

    const isCorrect = selectedImages.every((image, index) => image === requiredCredentials[index])

    if (isCorrect) {
      localStorage.setItem('userId', alumno.identificador) // Guardar el identificador del alumno en el localStorage
      localStorage.setItem('nombreUsuario', alumno.nombre) // Guardar el nombre del alumno en el localStorage
      router.push('/menu-calendario-agenda')
    } else {
      setError('Secuencia de imágenes incorrecta. Inténtalo de nuevo.')
      setSelectedImages([])
      setShuffledImages(shuffleArray([...imageOptions]))
    }
  }

  const renderImageOptions = () => {
    return (
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mt-6">
        {shuffledImages.map((image) => (
          <Button
            key={image.name}
            onClick={() => handleImageSelect(image.name)}
            className={`p-2 h-auto aspect-square ${
              selectedImages.includes(image.name) ? 'ring-4 ring-blue-500' : ''
            }`}
            aria-label={image.alt}
          >
            <img src={image.src} alt={image.alt} className="w-full h-full object-cover rounded-lg" />
          </Button>
        ))}
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-100 via-purple-100 to-pink-100 flex flex-col p-8">
      <Link href="/lista-alumnos" passHref>
        <Button variant="outline" className="self-start mb-8 bg-yellow-400 hover:bg-yellow-500 text-gray-800 text-xl py-6 px-8">
          <ArrowLeft className="mr-2 h-6 w-6" />
          Volver a la Lista de Alumnos
        </Button>
      </Link>
      <main className="flex-grow flex flex-col items-center justify-center">
        <Card className="w-full max-w-3xl bg-white/80 backdrop-blur-md shadow-lg">
          <CardHeader>
            <CardTitle className="text-3xl font-bold text-center text-gray-900">Login con Imagen</CardTitle>
          </CardHeader>
          <CardContent>
            {alumno ? (
              <>
                <p className="text-xl text-center mb-6">
                  Bienvenido, <strong>{alumno.nombre}</strong>
                </p>
                <p className="text-lg text-center mb-6">
                  Selecciona las imágenes correctas en el orden adecuado para iniciar sesión
                </p>
                <form onSubmit={handleSubmit} className="space-y-6">
                  {renderImageOptions()}
                  {error && <p className="text-red-500 text-center mt-4">{error}</p>}
                  <Button 
                    type="submit" 
                    className="w-full bg-green-500 hover:bg-green-600 text-white text-2xl py-6 mt-6"
                    disabled={selectedImages.length === 0}
                  >
                    <ImageIcon className="mr-2 h-6 w-6" />
                    Iniciar Sesión
                  </Button>
                </form>
              </>
            ) : (
              <p className="text-center text-red-500">
                {error || 'Cargando...'}
              </p>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  )
}