'use client'

import { useState } from 'react'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { PlusSquare, Edit, Trash2, ArrowLeft } from "lucide-react"
import Link from 'next/link'

export default function GestionMenu() {
  const [hoveredCard, setHoveredCard] = useState<string | null>(null)

  const menuItems = [
    { 
      title: 'Añadir Menú', 
      description: 'Agregar un nuevo menú al sistema', 
      icon: PlusSquare, 
      link: './gestionarMenu/anadir',
      color: 'bg-green-500 hover:bg-green-600'
    },
    { 
      title: 'Modificar Menú', 
      description: 'Editar información de menús existentes', 
      icon: Edit, 
      link: './gestionarMenu/modificar',
      color: 'bg-blue-500 hover:bg-blue-600'
    },
    { 
      title: 'Eliminar Menú', 
      description: 'Remover menús del sistema', 
      icon: Trash2, 
      link: './gestionarMenu/eliminar',
      color: 'bg-red-500 hover:bg-red-600'
    },
  ]

  return (
    <div className="min-h-screen bg-white md:bg-gradient-to-br md:from-blue-100 md:via-purple-100 md:to-pink-100 flex items-center justify-center p-4">
      <main className="bg-white rounded-lg shadow-lg p-4 md:p-8 w-full md:max-w-2xl">
        <h1 className="text-2xl md:text-3xl font-bold mb-6 text-center text-gray-900">Gestión de Menú</h1>
        <nav className="mb-8">
          <Link href="/admin" passHref>
            <Button variant="outline" className="w-full text-base md:text-lg bg-yellow-400 hover:bg-yellow-500" aria-label="Volver a administración">
              <ArrowLeft className="mr-2 h-4 w-4 md:h-5 md:w-5" aria-hidden="true" />
              Atrás
            </Button>
          </Link>
        </nav>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {menuItems.map((item, index) => (
            <Card 
              key={index}
              className={`${item.color} text-white ${hoveredCard === item.title ? 'shadow-xl' : ''}`}
              onMouseEnter={() => setHoveredCard(item.title)}
              onMouseLeave={() => setHoveredCard(null)}
            >
              <Link href={item.link} passHref>
                <CardHeader className="flex items-center p-4 md:p-6 cursor-pointer">
                  <item.icon className="h-8 w-8 mr-4" aria-hidden="true" />
                  <div>
                    <CardTitle className="text-lg md:text-xl font-bold">{item.title}</CardTitle>
                    <CardDescription className="text-sm md:text-base text-white">
                      {item.description}
                    </CardDescription>
                  </div>
                </CardHeader>
              </Link>
            </Card>
          ))}
        </div>
      </main>
    </div>
  )
}
