'use client'

import { supabase } from "@/lib/supabase";
import { useState } from 'react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { ArrowLeft, Plus, Trash2 } from "lucide-react"
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useEffect } from 'react'

type Material = {
  nombre: string;
  cantidad: number;
}

export default function CrearPedidoMaterial() {
  const [nombre_tarea, setNombre] = useState('')
  const [descripcion, setDescripcion] = useState('')
  const [materiales, setMateriales] = useState<Material[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [successMessage, setSuccessMessage] = useState('')
  const router = useRouter()
  const [materialesDisponibles, setMaterialesDisponibles] = useState<string[]>([])


  useEffect(() => {
    const fetchMateriales = async () => {
      try {
        const { data, error } = await supabase
          .from('Material')
          .select('nombre')
  
        if (error) throw error
  
        setMaterialesDisponibles(data.map((material: { nombre: string }) => material.nombre))
      } catch (error: unknown) {
        console.error('Error fetching materials:', error)
      }
    }
  
    fetchMateriales()
  }, [])

  const handleAddMaterial = () => { 
    setMateriales([...materiales, { nombre: '', cantidad: 1 }])
  }

  const handleRemoveMaterial = (index: number) => {
    const newMateriales = materiales.filter((_, i) => i !== index)
    setMateriales(newMateriales)
  }

  const handleMaterialChange = (index: number, field: 'nombre' | 'cantidad', value: string | number) => {
    const newMateriales = [...materiales]
    newMateriales[index][field] = value as never
    setMateriales(newMateriales)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')
    setSuccessMessage('')

    try {
      const materialesString = materiales
        .map(m => `${m.nombre}: ${m.cantidad}`)
        .join(', ')

      const { data, error } = await supabase
        .from('Tarea')
        .insert([
          { 
            nombre_tarea, 
            descripcion: `${descripcion}\n\nMateriales:\n${materialesString}`, 
            tipo_tarea: 'MATERIAL'
          }
        ])
        .select()

      if (error) throw error

      const tareaId = data[0].id;

      const pedido = materiales.map(material => ({
        id_tarea: tareaId,
        tipo_material: material.nombre,
        cantidad: material.cantidad,
      }));
  
      const { error: pedidoError } = await supabase
        .from('PedidoMaterial')
        .insert(pedido);

      if (pedidoError) throw pedidoError
  
      //Mostrar mensaje de éxito
      console.log('Pedido creado:', data)
      setSuccessMessage('¡Pedido de material creado exitosamente!')
      
      //Limpiar formulario
      setMateriales([]);
      setDescripcion('');
      setNombre('');

    } catch (error: unknown) {
      setError('Error al crear el pedido. Por favor, intente de nuevo.')
      if (error instanceof Error) {
        console.error('Error creating order:', error.message)
      } else {
        console.error('Error creating order:', error)
      }
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-white md:bg-gradient-to-br md:from-blue-100 md:via-purple-100 md:to-pink-100 flex items-center justify-center p-4">
      <main className="bg-white rounded-lg shadow-lg p-4 md:p-8 w-full md:max-w-2xl">
        <h1 className="text-2xl md:text-3xl font-bold mb-6 text-center text-gray-900">Crear Pedido de Material</h1>
        <nav className="mb-8">
          <Link href="/admin/crear-tarea" passHref>
            <Button variant="outline" className="w-full text-base md:text-lg bg-yellow-400 hover:bg-yellow-500" aria-label="Volver al dashboard">
              <ArrowLeft className="mr-2 h-4 w-4 md:h-5 md:w-5" aria-hidden="true" />
              Volver al Dashboard
            </Button>
          </Link>
        </nav>
        {error && <p className="text-red-500 text-center mb-4">{error}</p>}
        {successMessage && <p className="text-green-500 text-center mb-4">{successMessage}</p>}
        <form onSubmit={handleSubmit} className="space-y-6 md:space-y-8">
          <div className="space-y-2 md:space-y-3">
            <Label htmlFor="nombre" className="text-base md:text-lg font-medium text-gray-900">
              Nombre del Pedido
            </Label>
            <Input
              id="nombre"
              value={nombre_tarea}
              onChange={(e) => setNombre(e.target.value)}
              className="text-base md:text-lg"
              placeholder="Ingrese el nombre del pedido"
              required
            />
          </div>
          <div className="space-y-2 md:space-y-3">
            <Label htmlFor="descripcion" className="text-base md:text-lg font-medium text-gray-900">
              Descripción
            </Label>
            <Textarea
              id="descripcion"
              value={descripcion}
              onChange={(e) => setDescripcion(e.target.value)}
              className="text-base md:text-lg"
              placeholder="Describa el pedido de material"
              rows={4}
              required
            />
          </div>
          <div className="space-y-4">
            <Label className="text-base md:text-lg font-medium text-gray-900">
              Materiales
            </Label>
            {materiales.map((material, index) => (
              <div key={index} className="flex items-center space-x-2">
                <Select
                  value={material.nombre}
                  onValueChange={(value) => handleMaterialChange(index, 'nombre', value)}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Seleccione un material" />
                  </SelectTrigger>
                  <SelectContent>
                    {materialesDisponibles.map((m) => (
                      <SelectItem key={m} value={m}>{m}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Input
                  type="number"
                  value={material.cantidad}
                  onChange={(e) => handleMaterialChange(index, 'cantidad', parseInt(e.target.value))}
                  className="w-24"
                  min={1}
                />
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  onClick={() => handleRemoveMaterial(index)}
                  aria-label="Eliminar material"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ))}
            <Button
              type="button"
              variant="outline"
              onClick={handleAddMaterial}
              className="w-full"
            >
              <Plus className="mr-2 h-4 w-4" /> Añadir Material
            </Button>
          </div>
          <Button 
            type="submit" 
            className="w-full text-base md:text-lg bg-blue-600 hover:bg-blue-700 text-white"
            aria-label="Crear pedido"
            disabled={isLoading}
          >
            {isLoading ? 'Creando...' : 'Crear pedido'}
          </Button>
        </form>
      </main>
    </div>
  )
}