'use client'

import { useState, useEffect } from 'react'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowLeft, ArrowRight, UserCircle, LogIn } from "lucide-react"
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { createClient } from '@supabase/supabase-js'

// Inicializa el cliente de Supabase
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!)

type Alumno = {
  id: string;
  nombre_apellido: string;
  tipo_login: 'PIN' | 'CONTRASEÑA' | 'IMAGEN';
}

export default function ListaAlumnos() {
  const [alumnos, setAlumnos] = useState<Alumno[]>([])
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')
  const router = useRouter()

  const alumnosPorPagina = 3

  useEffect(() => {
    fetchAlumnos()
  }, [currentPage])

  const fetchAlumnos = async () => {
    setIsLoading(true)
    setError('')
    try {
      const { data, error, count } = await supabase
        .from('Alumno')
        .select('id, nombre_apellido, tipo_login', { count: 'exact' })
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
    // Guardar el alumnoId en localStorage antes de la redirección
    localStorage.setItem('alumnoId', alumno.id)
    
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
    <div className="min-h-screen bg-gradient-to-br from-blue-100 via-purple-100 to-pink-100 flex flex-col p-8">
      <div className="flex justify-between items-start mb-8">
        <Link href="/" passHref>
          <Button variant="outline" className="bg-yellow-400 hover:bg-yellow-500 text-gray-800 text-xl py-6 px-8">
            <ArrowLeft className="mr-2 h-6 w-6" />
            Volver al Inicio
          </Button>
        </Link>
        <Link href="/login/formulario" passHref>
          <Button className="bg-green-500 hover:bg-green-600 text-white text-xl py-6 px-8">
            <LogIn className="mr-2 h-6 w-6" />
            Iniciar Sesión Admin/Profesor
          </Button>
        </Link>
      </div>
      <main className="flex-grow flex flex-col items-center justify-center">
        <div className="bg-white/80 backdrop-blur-md rounded-lg shadow-lg p-8 w-full max-w-6xl">
          <h1 className="text-5xl font-bold mb-12 text-center text-gray-900">Selecciona tu Perfil</h1>
          {error && <p className="text-red-500 text-center mb-6 text-xl">{error}</p>}
          {isLoading ? (
            <p className="text-center text-2xl">Cargando alumnos...</p>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-8">
                {alumnos.map((alumno) => (
                  <Card 
                    key={alumno.id} 
                    className="bg-blue-500 text-white transition-all duration-300 ease-in-out transform hover:scale-105 cursor-pointer"
                    onClick={() => handleAlumnoClick(alumno)}
                  >
                    <CardHeader>
                      <CardTitle className="flex items-center text-3xl">
                        <UserCircle className="mr-4 h-12 w-12" />
                        {alumno.nombre_apellido}
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-xl mt-4">Tipo de login: {alumno.tipo_login}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>
              <div className="flex justify-between items-center mt-8">
                <Button 
                  onClick={prevPage} 
                  disabled={currentPage === 1}
                  className="bg-purple-500 hover:bg-purple-600 text-white text-xl py-4 px-6"
                >
                  <ArrowLeft className="mr-2 h-6 w-6" />
                  Anterior
                </Button>
                <span className="text-gray-700 text-2xl">
                  Página {currentPage} de {totalPages}
                </span>
                <Button 
                  onClick={nextPage} 
                  disabled={currentPage === totalPages}
                  className="bg-purple-500 hover:bg-purple-600 text-white text-xl py-4 px-6"
                >
                  Siguiente
                  <ArrowRight className="ml-2 h-6 w-6" />
                </Button>
              </div>
            </>
          )}
        </div>
      </main>
    </div>
  )
}