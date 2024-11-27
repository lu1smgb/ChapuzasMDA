'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowLeft, ArrowRight, FileDown } from 'lucide-react'
import { jsPDF } from 'jspdf'
//import './fonts.css'

// Placeholder data (replace with Supabase fetching in the future)
const placeholderClassrooms = [
  { id: '1', name: 'Classroom A', teacher: 'Mercedes', image: '/images/comedor/mercedes.png?height=200&width=200' },
  { id: '2', name: 'Classroom B', teacher: 'Jesús', image: '/images/comedor/jesus.png?height=200&width=200' },
  { id: '3', name: 'Classroom C', teacher: 'Carlos', image: '/images/comedor/carlos.png?height=200&width=200' },
]

const placeholderMenuItems = [
  { id: '1', name: 'SIN CARNE', description: 'Menú sin carne', image: '/images/comedor/sincarne.png?height=200&width=200' },
  { id: '2', name: 'TRITURADO', description: 'Triturado', image: '/images/comedor/puré.png?height=200&width=200' },
  { id: '3', name: 'NARANJA', description: 'Naranja', image: '/images/comedor/naranja.png?height=200&width=200' },
]

type Classroom = {
  id: string;
  name: string;
  teacher: string;
  image: string;
}

type MenuItem = {
  id: string;
  name: string;
  description: string;
  image: string;
}

type OrderItem = {
  menuItem: MenuItem;
  quantity: number;
}

export default function FoodOrder() {
  const [step, setStep] = useState<'classroom' | 'menu' | 'quantity'>('classroom')
  const [classrooms, setClassrooms] = useState<Classroom[]>([])
  const [menuItems, setMenuItems] = useState<MenuItem[]>([])
  const [selectedClassroom, setSelectedClassroom] = useState<Classroom | null>(null)
  const [selectedMenuItem, setSelectedMenuItem] = useState<MenuItem | null>(null)
  const [orderItems, setOrderItems] = useState<OrderItem[]>([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [quantity, setQuantity] = useState(1)
  const router = useRouter()

  useEffect(() => {
    // Simulating data fetching (replace with Supabase queries in the future)
    setClassrooms(placeholderClassrooms)
    setMenuItems(placeholderMenuItems)
  }, [])

  const handleNext = () => {
    switch (step) {
      case 'classroom':
        setCurrentIndex((prevIndex) => (prevIndex + 1) % classrooms.length)
        break
      case 'menu':
        setCurrentIndex((prevIndex) => (prevIndex + 1) % menuItems.length)
        break
      case 'quantity':
        setQuantity((prevQuantity) => Math.min(prevQuantity + 1, 5))
        break
    }
  }

  const handlePrevious = () => {
    switch (step) {
      case 'classroom':
        setCurrentIndex((prevIndex) => (prevIndex - 1 + classrooms.length) % classrooms.length)
        break
      case 'menu':
        setCurrentIndex((prevIndex) => (prevIndex - 1 + menuItems.length) % menuItems.length)
        break
      case 'quantity':
        setQuantity((prevQuantity) => Math.max(prevQuantity - 1, 1))
        break
    }
  }

  const handleSelect = () => {
    switch (step) {
      case 'classroom':
        setSelectedClassroom(classrooms[currentIndex])
        setStep('menu')
        setCurrentIndex(0)
        break
      case 'menu':
        setSelectedMenuItem(menuItems[currentIndex])
        setStep('quantity')
        setQuantity(1)
        break
      case 'quantity':
        if (selectedMenuItem) {
          setOrderItems(prevItems => {
            const newItem = { menuItem: selectedMenuItem, quantity }
            const existingItemIndex = prevItems.findIndex(item => item.menuItem.id === selectedMenuItem.id)
            if (existingItemIndex > -1) {
              return prevItems.map((item, index) => 
                index === existingItemIndex ? newItem : item
              )
            } else {
              return [...prevItems, newItem]
            }
          })
        }
        setStep('menu')
        break
    }
  }

  const getCurrentQuantity = (menuItemId: string) => {
    const item = orderItems.find(item => item.menuItem.id === menuItemId)
    return item ? item.quantity : 0
  }

  const generatePDF = () => {
    const doc = new jsPDF()
    
    doc.setFontSize(20)
    doc.text('Food Order', 105, 15, { align: 'center' })
    
    doc.setFontSize(16)
    doc.text(`Classroom: ${selectedClassroom?.name}`, 20, 30)
    doc.text(`Teacher: ${selectedClassroom?.teacher}`, 20, 40)
    
    doc.setFontSize(14)
    orderItems.forEach((item, index) => {
      doc.text(`${item.menuItem.name}: ${item.quantity}`, 20, 60 + (index * 10))
    })
    
    doc.save('food-order.pdf')
  }

  const renderStepContent = () => {
    switch (step) {
      case 'classroom':
        if (classrooms.length === 0) return <p className="font-escolar">Loading classrooms...</p>
        const classroom = classrooms[currentIndex]
        return (
          <div className="text-center font-escolar">
            <h2 className="text-2xl font-bold mb-4">Selecciona aula</h2>
            <Image src={classroom.image} alt={classroom.name} width={200} height={200} className="mx-auto mb-4 rounded-full" />
            <p className="text-4xl font-bold">{classroom.name}</p>
            <p className="text-2xl mt-2">Teacher: {classroom.teacher}</p>
          </div>
        )
      case 'menu':
        if (menuItems.length === 0) return <p className="font-escolar">Loading menu items...</p>
        const menuItem = menuItems[currentIndex]
        const currentQuantity = getCurrentQuantity(menuItem.id)
        return (
          <div className="text-center font-escolar">
            <h2 className="text-2xl font-bold mb-4">Selecciona menú</h2>
            <div className="flex items-center justify-center space-x-4">
              <div>
                <Image src={menuItem.image} alt={menuItem.name} width={200} height={200} className="rounded-lg" />
                <p className="text-2xl font-bold mt-2">{menuItem.name}</p>
                <p className="text-xl mt-1">{menuItem.description}</p>
              </div>
              {currentQuantity > 0 && (
                <div className="text-center">
                  <Image src={`/placeholder.svg?height=100&width=100&text=Hand ${currentQuantity}`} alt={`Quantity: ${currentQuantity}`} width={100} height={100} className="mx-auto mb-2" />
                  <p className="text-2xl font-bold">Cantidad: {currentQuantity}</p>
                </div>
              )}
            </div>
          </div>
        )
      case 'quantity':
        return (
          <div className="text-center font-escolar">
            <h2 className="text-2xl font-bold mb-4">Selecciona cantidad</h2>
            <Image src={`/placeholder.svg?height=200&width=200&text=Hand ${quantity}`} alt={`Quantity: ${quantity}`} width={200} height={200} className="mx-auto mb-4" />
            <p className="text-4xl font-bold">{quantity}</p>
          </div>
        )
    }
  }

  return (
    <div className="h-screen bg-gradient-to-br from-blue-100 via-purple-100 to-pink-100 flex flex-col p-4 font-escolar">
      <div className="flex justify-between items-center mb-4">
        <Button 
          onClick={() => router.push('/home')} 
          className="bg-yellow-400 hover:bg-yellow-500 text-gray-800 text-2xl py-3 px-6"
        >
          <ArrowLeft className="mr-2 h-6 w-6" />
          Volver
        </Button>
        {step === 'menu' && (
          <Button
            onClick={generatePDF}
            className="bg-blue-500 hover:bg-blue-600 text-white text-xl py-2 px-4 rounded-full"
          >
            <FileDown className="mr-2 h-6 w-6" />
            Terminar y generar PDF
          </Button>
        )}
      </div>
      <main className="flex-grow flex items-center justify-center">
        <Button 
          onClick={handlePrevious}
          className="bg-purple-500 hover:bg-purple-600 text-white text-4xl py-12 px-8 rounded-full mr-4"
        >
          <ArrowLeft className="h-20 w-20" />
        </Button>
        <Card className="w-full max-w-6xl bg-white/80 backdrop-blur-md shadow-lg">
          <CardHeader>
            <CardTitle className="text-4xl font-bold text-center text-gray-900">Menús del comedor</CardTitle>
          </CardHeader>
          <CardContent className="h-[calc(100vh-20rem)] flex flex-col justify-center">
            {renderStepContent()}
            <Button
              onClick={handleSelect}
              className="mt-8 bg-green-500 hover:bg-green-600 text-white text-2xl py-4 px-8 rounded-full self-center"
            >
              {step === 'quantity' ? 'Confirm Quantity' : 'Select'}
            </Button>
          </CardContent>
        </Card>
        <Button 
          onClick={handleNext}
          className="bg-purple-500 hover:bg-purple-600 text-white text-4xl py-12 px-8 rounded-full ml-4"
        >
          <ArrowRight className="h-20 w-20" />
        </Button>
      </main>
    </div>
  )
}

