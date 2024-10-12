'use client'

import React, { useState } from 'react'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Utensils, Plus, Minus } from 'lucide-react'

type Menu = {
  id: number
  name: string
  image: string
  count: number
}

const initialMenus: Menu[] = [
  { id: 1, name: "Menú Basal", image: "/placeholder.svg?height=100&width=100", count: 0 },
  { id: 2, name: "Menú Celiaco", image: "/placeholder.svg?height=100&width=100", count: 0 },
  { id: 3, name: "Menú Sin Lactosa", image: "/placeholder.svg?height=100&width=100", count: 0 },
]

export default function MenuPage() {
  const [menus, setMenus] = useState<Menu[]>(initialMenus)

  const updateCount = (id: number, increment: boolean) => {
    setMenus(menus.map(menu => 
      menu.id === id ? { ...menu, count: Math.max(0, menu.count + (increment ? 1 : -1)) } : menu
    ))
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-200 to-green-200 p-4 flex flex-col items-center justify-center">
      <h1 className="text-4xl font-bold text-blue-600 mb-4">Selección de Menú</h1>
      <div className="w-full max-w-4xl grid grid-cols-1 md:grid-cols-3 gap-8">
        {menus.map((menu) => (
          <Card key={menu.id} className="bg-white rounded-3xl shadow-lg overflow-hidden transition-all duration-300 ease-in-out transform hover:scale-105">
            <CardHeader className="bg-yellow-400 p-4">
              <CardTitle className="text-2xl font-bold text-blue-800 text-center">{menu.name}</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col items-center p-6">
              <img 
                src={menu.image} 
                alt={`Imagen de ${menu.name}`} 
                className="w-32 h-32 object-cover mb-4 rounded-full border-4 border-pink-400"
              />
              <p className="text-xl font-semibold mb-4 text-blue-600">Seleccionados: {menu.count}</p>
              <div className="flex space-x-4">
                <Button 
                  onClick={() => updateCount(menu.id, false)}
                  aria-label={`Quitar una selección de ${menu.name}`}
                  className="bg-red-400 hover:bg-red-500 text-white text-xl font-bold py-3 px-6 rounded-full shadow-md transition-all duration-300 ease-in-out transform hover:scale-105 flex items-center"
                  disabled={menu.count === 0}
                >
                  <Minus className="w-6 h-6" />
                </Button>
                <Button 
                  onClick={() => updateCount(menu.id, true)}
                  aria-label={`Añadir una selección de ${menu.name}`}
                  className="bg-green-400 hover:bg-green-500 text-white text-xl font-bold py-3 px-6 rounded-full shadow-md transition-all duration-300 ease-in-out transform hover:scale-105 flex items-center"
                >
                  <Plus className="w-6 h-6" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}