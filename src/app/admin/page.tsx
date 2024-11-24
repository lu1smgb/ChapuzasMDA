'use client'

import { useState, useEffect } from 'react'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { UserPlus, UserCog, UserMinus, BookOpen, ClipboardList, Send, Gamepad2, PartyPopper, Utensils, Paperclip } from "lucide-react"
import Link from 'next/link'

// Función que obtiene el nombre del administrador
const getAdminName = () => {
  return localStorage.getItem('adminName') || '';
};

export default function AdminDashboard() {
  const [hoveredCard, setHoveredCard] = useState<string | null>(null)
  const [adminName, setAdminName] = useState<string>('');

  useEffect(() => {
    // Obtener el nombre del administrador cuando el componente se monta
    const name = getAdminName();
    setAdminName(name);
  }, []);

  const menuItems = [
    { 
      title: 'Administrar Alumno', 
      description: 'Añadir, modificar y eliminar alumnos', 
      icon: UserPlus, 
      link: '/admin/gestionarAlumno',
      color: 'bg-blue-500 hover:bg-blue-600'
    },
    { 
      title: 'Administrar Profesor', 
      description: 'Añadir, modificar y eliminar profesores', 
      icon: UserCog, 
      link: '/admin/gestionarProfesor',
      color: 'bg-cyan-700 hover:bg-cyan-800'
    },
    { 
      title: 'Administrar Tareas', 
      description: 'Diseñar y crear nuevas tareas', 
      icon: ClipboardList, 
      link: '/admin/gestionarTarea',
      color: 'bg-orange-500 hover:bg-orange-600'
    },
    { 
      title: 'Asignar Tareas', 
      description: 'Asignar tareas a alumnos', 
      icon: Send, 
      link: '/admin/asignar-tarea',
      color: 'bg-amber-700 hover:bg-amber-800'
    },
    { 
      title: 'Administrar Menú', 
      description: 'Añadir, modificar y eliminar menús', 
      icon: Utensils, 
      link: '/admin/gestionarMenu',
      color: 'bg-green-500 hover:bg-green-600'
    },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-100 via-purple-100 to-pink-100 flex flex-col p-4">
      <div className="flex justify-between items-start p-4">
        <div className="flex items-center space-x-2">
          <h1 className="text-3xl font-bold">¡Bienvenido/a, {adminName}!</h1>
          <PartyPopper className="h-6 w-6 text-yellow-500" />
        </div>
        <Button 
          variant="outline" 
          className="text-lg bg-red-500 hover:bg-red-600 text-white"
          aria-label="Cerrar sesión"
          onClick={() => window.location.href = '/login'}
        >
          <UserMinus className="mr-2 h-5 w-5" aria-hidden="true" />
          Cerrar Sesión
        </Button>
      </div>
      <main className="flex-grow flex flex-col items-center justify-center">
        <div className="bg-white/80 backdrop-blur-md rounded-lg shadow-lg p-6 w-full max-w-5xl">
          <h1 className="text-4xl font-bold mb-8 text-center text-gray-900">Panel de Administración</h1>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {menuItems.map((item, index) => (
              <Link href={item.link} key={index} className="block">
                <Card 
                  className={`transition-all duration-300 ease-in-out transform hover:scale-105 ${
                    hoveredCard === item.title ? 'shadow-lg' : 'shadow'
                  } ${item.color} text-white min-h-full flex flex-col`}
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
        </div>
      </main>
    </div>
  )}
