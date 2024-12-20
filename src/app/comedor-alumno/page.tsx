'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowLeft, ArrowRight, FileDown } from 'lucide-react'
import { jsPDF } from 'jspdf'
import { createClient } from '@supabase/supabase-js'
import confetti from 'canvas-confetti'
import { NotificationModal } from '@/components/ui/NotificationModal'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Estructuras para rerpesentar los distintos objetos
type Classroom = {
  identificador: string;
  aula: string;
  nombre: string;
  imagen_perfil: string;
}

type MenuItem = {
  id: number;
  nombre: string;
  url_imagen: string;
}

type OrderItem = {
  menuItem: MenuItem;
  quantity: number;
}

type ClassroomOrder = {
  classroom: Classroom;
  orderItems: OrderItem[];
}

// Imágenes de manos
const quantityImages: string[] = [
  '/images/comedor/0.png?height=100&width=100&text=0',
  '/images/comedor/1.png?height=100&width=100&text=1',
  '/images/comedor/2.png?height=100&width=100&text=2',
  '/images/comedor/3.png?height=100&width=100&text=3',
  '/images/comedor/4.png?height=100&width=100&text=4',
  '/images/comedor/5.png?height=100&width=100&text=5',
  '/images/comedor/6.png?height=100&width=100&text=6',
  '/images/comedor/7.png?height=100&width=100&text=7',
  '/images/comedor/8.png?height=100&width=100&text=8',
  '/images/comedor/9.png?height=100&width=100&text=9',
  '/images/comedor/10.png?height=100&width=100&text=10',
]


export default function FoodOrder() {
  const [step, setStep] = useState<'classroom' | 'menu' | 'quantity'>('classroom')
  const [classrooms, setClassrooms] = useState<Classroom[]>([])
  const [menuItems, setMenuItems] = useState<MenuItem[]>([])
  const [classroomOrders, setClassroomOrders] = useState<ClassroomOrder[]>([])
  const [selectedClassroom, setSelectedClassroom] = useState<Classroom | null>(null)
  const [selectedMenuItem, setSelectedMenuItem] = useState<MenuItem | null>(null)
  const [currentIndex, setCurrentIndex] = useState(0)
  const [quantity, setQuantity] = useState(1)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()
  const [showSuccessModal, setShowSuccessModal] = useState(false)
  const [showWarningModal, setShowWarningModal] = useState(false)
  const [actividadCompletada, setActividadCompletada] = useState(false)

  useEffect(() => {
    fetchClassrooms()
    fetchMenuItems()
  }, [])

  // Recibir clases y menús
  const fetchClassrooms = async () => {    
    try {
      const { data, error } = await supabase
        .from('Profesor')
        .select('*')
      
      if (error) throw error

      setClassrooms(data)
    } catch (error) {
      console.error('Error fetching classrooms:', error)
      setError('Failed to load classrooms')
    } finally {
      setIsLoading(false)
    }
  }

  const fetchMenuItems = async () => {
    try {
      const { data, error } = await supabase
        .from('Menu')
        .select('*')
      
      if (error) throw error

      setMenuItems(data)
    } catch (error) {
      console.error('Error fetching menu items:', error)
      setError('Failed to load menu items')
    } finally {
      setIsLoading(false)
    }
  }

  // Handlers para navegación
  const handleNext = () => {
    switch (step) {
      case 'classroom':
        setCurrentIndex((prevIndex) => (prevIndex + 1) % classrooms.length)
        break
      case 'menu':
        setCurrentIndex((prevIndex) => (prevIndex + 1) % menuItems.length)
        break
      case 'quantity':
        setQuantity((prevQuantity) => Math.min(prevQuantity + 1, 10))
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
        if (selectedClassroom && selectedMenuItem) {
          setClassroomOrders(prevOrders => {
            const classroomIndex = prevOrders.findIndex(order => order.classroom.identificador === selectedClassroom.identificador)
            const newOrderItem = { menuItem: selectedMenuItem, quantity }

            if (classroomIndex > -1) {
              const updatedOrderItems = [...prevOrders[classroomIndex].orderItems]
              const existingItemIndex = updatedOrderItems.findIndex(item => item.menuItem.id === selectedMenuItem.id)

              if (existingItemIndex > -1) {
                updatedOrderItems[existingItemIndex] = newOrderItem
              } else {
                updatedOrderItems.push(newOrderItem)
              }

              return prevOrders.map((order, index) => 
                index === classroomIndex ? { ...order, orderItems: updatedOrderItems } : order
              )
            } else {
              return [...prevOrders, { classroom: selectedClassroom, orderItems: [newOrderItem] }]
            }
          })
        }
        setStep('menu')
        break
    }
  }

  const handleCompletion = async () => {
    const taskId = localStorage.getItem('tareaId');

    if (!taskId) {
      console.error('No se encontró el identificador del alumno.');
      return;
    }
        
    const { error } = await supabase
      .from('Tarea_Menu')
      .update({ completada: true })
      .eq('identificador', taskId)
        
    if (error) {
      console.error('Error updating tarea:', error)
      setError('Error al marcar la tarea como completada')
    } else {
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 }
    })
      setActividadCompletada(true)
      setShowSuccessModal(true)
      setTimeout(() => router.push('/menu-calendario-agenda'), 6000)
    }
  }

  const getCurrentQuantity = (classroomId: string, menuItemId: number) => {
    const classroomOrder = classroomOrders.find(order => order.classroom.identificador === classroomId)
    if (!classroomOrder) return 0
    const orderItem = classroomOrder.orderItems.find(item => item.menuItem.id === menuItemId)
    return orderItem ? orderItem.quantity : 0
  }

  const getTotalMenuItems = (classroomId: string) => {
    const classroomOrder = classroomOrders.find(order => order.classroom.identificador === classroomId)
    if (!classroomOrder) return 0
    return classroomOrder.orderItems.reduce((total, item) => total + item.quantity, 0)
  }

  // Generador de PDF
  const generatePDF = () => {
    const doc = new jsPDF()
    
    doc.setFontSize(20)
    doc.text('Food Order', 105, 15, { align: 'center' })
    
    let yOffset = 30

    classroomOrders.forEach((classroomOrder, index) => {
      doc.setFontSize(16)
      doc.text(`Classroom: ${classroomOrder.classroom.aula}`, 20, yOffset)
      doc.text(`Teacher: ${classroomOrder.classroom.nombre}`, 20, yOffset + 10)
      
      yOffset += 30

      doc.setFontSize(14)
      classroomOrder.orderItems.forEach((item, itemIndex) => {
        doc.text(`${item.menuItem.nombre}: ${item.quantity}`, 30, yOffset + (itemIndex * 10))
      })

      yOffset += classroomOrder.orderItems.length * 10 + 20
    })
    
    doc.save('food-order.pdf')
  }

  const botonTerminar = () => {
    generatePDF();
    handleCompletion();
  }

  // Renderizar contenido de cada paso y la página
  const renderStepContent = () => {
    if (isLoading) return <p className="font-escolar text-center">Loading...</p>
    if (error) return <p className="font-escolar text-center text-red-500">{error}</p>

    switch (step) {
      case 'classroom':
        if (classrooms.length === 0) return <p className="font-escolar">No classrooms available</p>
        const classroom = classrooms[currentIndex]
        const totalMenuItems = getTotalMenuItems(classroom.identificador)
        return (
          <div className="text-center font-escolar">
            <h2 className="text-4xl font-bold mb-4">Selecciona aula</h2>
            <div className="flex items-center justify-center space-x-4">
              <div>
                <Image src={classroom.imagen_perfil} alt={classroom.aula} width={200} height={200} className="mx-auto mb-4 rounded-full" />
                <p className="text-4xl font-bold">{classroom.aula}</p>
                <p className="text-2xl mt-2">Profesor: {classroom.nombre}</p>
              </div>
              {totalMenuItems > 0 && (
                <div className="text-center">
                  <Image 
                    src={quantityImages[Math.min(totalMenuItems, 10)]}
                    alt={`Total menu items: ${totalMenuItems}`} 
                    width={200} 
                    height={200} 
                    className="mx-auto mb-2" 
                  />
                  <p className="text-2xl font-bold">Total: {totalMenuItems}</p>
                </div>
              )}
            </div>
            {classroomOrders.find(order => order.classroom.identificador === classroom.identificador) && (
              <div className="mt-4">
                <h3 className="text-xl font-bold">Pedido:</h3>
                {classroomOrders.find(order => order.classroom.identificador === classroom.identificador)?.orderItems.map((item, index) => (
                  <p key={index}>{item.menuItem.nombre}: {item.quantity}</p>
                ))}
              </div>
            )}
          </div>
        )
      case 'menu':
        if (menuItems.length === 0) return <p className="font-escolar">No menu items available</p>
        const menuItem = menuItems[currentIndex]
        const currentQuantity = selectedClassroom ? getCurrentQuantity(selectedClassroom.identificador, menuItem.id) : 0
        return (
          <div className="text-center font-escolar">
            <h2 className="text-4xl font-bold mb-4">Selecciona menús</h2>
            <div className="flex items-center justify-center space-x-4">
              <div>
                <Image src={menuItem.url_imagen} alt={menuItem.nombre} width={200} height={200} className="rounded-lg" />
                <p className="text-4xl font-bold mt-2">{menuItem.nombre}</p>
              </div>
              {currentQuantity > 0 && (
                <div className="text-center">
                  <Image 
                    src={quantityImages[currentQuantity]}
                    alt={`Quantity: ${currentQuantity}`} 
                    width={200} 
                    height={200} 
                    className="mx-auto mb-2" 
                  />
                  <p className="text-2xl font-bold">Cantidad: {currentQuantity}</p>
                </div>
              )}
            </div>
          </div>
        )
      case 'quantity':
        return (
          <div className="text-center font-escolar">
            <h2 className="text-4xl font-bold mb-4">Selecciona cantidad</h2>
            <Image 
              src={quantityImages[quantity]}
              alt={`Quantity: ${quantity}`} 
              width={200} 
              height={200} 
              className="mx-auto mb-4" 
            />
            <p className="text-4xl font-bold">{quantity}</p>
          </div>
        )
    }
  }

  return (
    <div className="h-screen bg-gradient-to-br from-blue-100 via-purple-100 to-pink-100 flex flex-col p-4 font-escolar">
      <div className="flex justify-between items-center mb-4">
        <Button 
          onClick={() => {
            if (step === 'menu' || step === 'quantity') {
              setStep('classroom')
              setCurrentIndex(classrooms.findIndex(c => c.identificador === selectedClassroom?.identificador))
            } else {
              router.push('/menu-calendario-agenda')
            }
          }} 
          className="bg-yellow-400 hover:bg-yellow-500 text-gray-800 text-2xl py-3 px-6"
        >
          <ArrowLeft className="mr-2 h-6 w-6" />
          {step === 'menu' || step === 'quantity' ? 'Volver a aulas' : 'Volver'}
        </Button>
        {step === 'classroom' && (
          <Button
            onClick={botonTerminar}
            className="bg-blue-500 hover:bg-blue-600 text-white text-xl py-2 px-4 rounded-full"
          >
            <FileDown className="mr-2 h-6 w-6" />
            Terminar
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
          </CardHeader>
          <CardContent className="h-[calc(100vh-20rem)] flex flex-col justify-center">
            {renderStepContent()}
            <Button
              onClick={handleSelect}
              className="mt-8 bg-green-500 hover:bg-green-600 text-white text-4xl py-6 px-8 rounded-full self-center"
            >
              {step === 'quantity' ? '✓ Aceptar' : ' ✓ Seleccionar'}
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
