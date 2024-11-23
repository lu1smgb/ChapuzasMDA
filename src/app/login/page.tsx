'use client'

import { useState, useEffect } from 'react'
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { ArrowLeft, ArrowRight, LogIn } from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!)

type Alumno = {
  identificador: string;
  nombre: string;
  tipo_login: 'PIN' | 'CONTRASEÑA' | 'IMAGEN';
  imagen_perfil: string;
}

export default function ListaAlumnos() {
  const [alumnos, setAlumnos] = useState<Alumno[]>([])
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')
  const router = useRouter()

  const alumnosPorPagina = 8

  useEffect(() => {
    fetchAlumnos()
  }, [currentPage])

  const fetchAlumnos = async () => {
    setIsLoading(true)
    setError('')
    try {
      const { data, error, count } = await supabase
        .from('Alumno')
        .select('identificador, nombre, tipo_login, imagen_perfil', { count: 'exact' })
        .range((currentPage - 1) * alumnosPorPagina, currentPage * alumnosPorPagina - 1)

      if (error) throw error

      setAlumnos(data || [])
      setTotalPages(Math.ceil((count || 0) / alumnosPorPagina))
    } catch (error: unknown) {
      if (error instanceof Error) {
        setError(`Error al cargar los alumnos: ${error.message}`)
      } else {
        setError('Error al cargar los alumnos. Por favor, intente de nuevo.')
      }
      console.error('Error fetching alumnos:', (error as Error).message)
    } finally {
      setIsLoading(false)
    }
  }

  const nextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1)
    }
  }

  const prevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1)
    }
  }

  const handleAlumnoClick = (alumno: Alumno) => {
    localStorage.setItem('alumnoId', alumno.identificador)
    
    switch (alumno.tipo_login) {
      case 'PIN':
        router.push('/login/pin')
        break
      case 'CONTRASEÑA':
        router.push('/login/contrasena')
        break
      case 'IMAGEN':
        router.push('/login/imagen')
        break
      default:
        console.error('Tipo de login no reconocido')
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-100 via-purple-100 to-pink-100 flex flex-col">
      <div className="flex justify-end p-4">
        <Link href="/login/formulario" passHref>
          <Button className="bg-green-500 hover:bg-green-600 text-white text-xl py-6 px-8">
            <LogIn className="mr-2 h-6 w-6" />
            Iniciar Sesión Admin/Profesor
          </Button>
        </Link>
      </div>
      <main className="flex-grow flex items-center justify-between px-8">
        <Button 
          onClick={prevPage} 
          disabled={currentPage === 1}
          className="bg-purple-500 hover:bg-purple-600 text-white text-6xl py-32 px-12 rounded-l-full mr-8 transition-all duration-300 ease-in-out transform hover:scale-105"
          style={{
            clipPath: 'polygon(40% 0%, 100% 0%, 100% 100%, 40% 100%, 0% 50%)'
          }}
          aria-label="Página anterior"
        >
          <ArrowLeft className="h-32 w-32" />
        </Button>
        <div className="flex-grow max-w-5xl mx-auto">
          <h1 className="text-6xl font-bold mb-12 text-center text-gray-900">Selecciona tu Perfil</h1>
          {error && <p className="text-red-500 text-center mb-6 text-2xl">{error}</p>}
          {isLoading ? (
            <p className="text-center text-3xl">Cargando alumnos...</p>
          ) : (
            <>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-8">
                {alumnos.map((alumno) => (
                  <Card 
                    key={alumno.identificador} 
                    className="bg-blue-500 text-white transition-all duration-300 ease-in-out transform hover:scale-105 cursor-pointer"
                    onClick={() => handleAlumnoClick(alumno)}
                  >
                    <CardContent className="flex flex-col items-center p-6">
                      <div className="w-32 h-32 rounded-full overflow-hidden mb-4">
                        <img 
                          src={alumno.imagen_perfil || '/placeholder-avatar.png'} 
                          alt={`Foto de perfil de ${alumno.nombre}`}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <p className="text-2xl font-semibold text-center">{alumno.nombre}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>
              <div className="flex justify-center mt-8">
                <span className="text-gray-700 text-3xl">
                  Página {currentPage} de {totalPages}
                </span>
              </div>
            </>
          )}
        </div>
        <Button 
          onClick={nextPage} 
          disabled={currentPage === totalPages}
          className="bg-purple-500 hover:bg-purple-600 text-white text-6xl py-32 px-12 rounded-r-full ml-8 transition-all duration-300 ease-in-out transform hover:scale-105"
          style={{
            clipPath: 'polygon(0% 0%, 60% 0%, 100% 50%, 60% 100%, 0% 100%)'
          }}
          aria-label="Página siguiente"
        >
          <ArrowRight className="h-32 w-32" />
        </Button>
      </main>
    </div>
  )
}