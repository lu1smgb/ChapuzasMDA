'use client'

import { useState } from 'react'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { UserPlus, UserCog, UserMinus, ArrowLeft } from "lucide-react"
import Link from 'next/link'

export default function GestionAlumnos() {
  const [hoveredCard, setHoveredCard] = useState<string | null>(null)

  const menuItems = [
    { 
      title: 'Añadir Alumno', 
      description: 'Agregar un nuevo alumno al sistema', 
      icon: UserPlus, 
      link: './gestionarAlumno/anadir',
      color: 'bg-green-500 hover:bg-green-600'
    },
    { 
      title: 'Modificar Alumno', 
      description: 'Editar información de alumnos existentes', 
      icon: UserCog, 
      link: './gestionarAlumno/modificar',
      color: 'bg-blue-500 hover:bg-blue-600'
    },
    { 
      title: 'Eliminar Alumno', 
      description: 'Remover alumnos del sistema', 
      icon: UserMinus, 
      link: './gestionarAlumno/eliminar',
      color: 'bg-red-500 hover:bg-red-600'
    },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-100 via-purple-100 to-pink-100 flex items-center justify-center p-4">
      <main className="bg-white/80 backdrop-blur-md rounded-lg shadow-lg p-6 w-full max-w-4xl">
        <h1 className="text-4xl font-bold mb-8 text-center text-gray-900">Gestión de Alumnos</h1>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {menuItems.map((item, index) => (
            <Link href={item.link} key={index} className="block">
              <Card 
                className={`transition-all duration-300 ease-in-out transform hover:scale-105 ${
                  hoveredCard === item.title ? 'shadow-lg' : 'shadow'
                } ${item.color} text-white`}
                onMouseEnter={() => setHoveredCard(item.title)}
                onMouseLeave={() => setHoveredCard(null)}
              >
                <CardHeader>
                  <CardTitle className="flex items-center text-xl">
                    <item.icon className="mr-2 h-6 w-6" />
                    {item.title}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-white/90">{item.description}</CardDescription>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
        <Link href="/admin">
          <Button 
            variant="outline" 
            className="mt-8 w-full text-lg bg-gray-500 hover:bg-gray-600 text-white"
            aria-label="Volver atrás"
          >
            <ArrowLeft className="mr-2 h-5 w-5" aria-hidden="true" />
            Volver Atrás
          </Button>
        </Link>
      </main>
    </div>
  )
}