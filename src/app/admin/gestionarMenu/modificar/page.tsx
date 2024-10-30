'use client'

import { useState, useEffect } from 'react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ArrowLeft } from "lucide-react"
import Link from 'next/link'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

const supabase = createClient(supabaseUrl, supabaseAnonKey);

interface MenuItem {
  id: number;
  nombre: string;
  url_imagen: string;
}

export default function EditarMenu() {
  const [menuItems, setMenuItems] = useState<MenuItem[]>([])
  const [selectedMenuItem, setSelectedMenuItem] = useState<MenuItem | null>(null)
  const [nuevoNombre, setNuevoNombre] = useState('')
  const [nuevaUrlImagen, setNuevaUrlImagen] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [successMessage, setSuccessMessage] = useState('')

  useEffect(() => {
    const fetchMenuItems = async () => {
      setIsLoading(true)
      setError('')
      try {
        const { data, error } = await supabase
          .from('Menu')
          .select('id, nombre, url_imagen')

        if (error) throw error
        setMenuItems(data || [])
      } catch (error) {
        console.error('Error fetching menu items:', error)
        setError('Error al cargar los datos del menú. Por favor, recargue la página.')
      } finally {
        setIsLoading(false)
      }
    }

    fetchMenuItems()
  }, [])

  const handleMenuItemChange = (menuItemId: string) => {
    const menuItem = menuItems.find(m => m.id.toString() === menuItemId)
    setSelectedMenuItem(menuItem || null)
    if (menuItem) {
      setNuevoNombre(menuItem.nombre)
      setNuevaUrlImagen(menuItem.url_imagen)
    }
    setSuccessMessage('')
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedMenuItem) {
      setError('Debe seleccionar un ítem de menú.')
      return
    }

    if (nuevoNombre.trim() === '') {
      setError('El nombre no puede ser una cadena vacía.')
      return
    }

    setIsLoading(true)
    setError('')
    setSuccessMessage('')

    const updates: Partial<MenuItem> = {}
    if (nuevoNombre !== selectedMenuItem.nombre) {
      updates.nombre = nuevoNombre
    }
    if (nuevaUrlImagen !== selectedMenuItem.url_imagen) {
      updates.url_imagen = nuevaUrlImagen
    }

    if (Object.keys(updates).length === 0) {
      setError('No se han realizado cambios.')
      setIsLoading(false)
      return
    }

    try {
      const { data, error } = await supabase
        .from('Menu')
        .update(updates)
        .eq('id', selectedMenuItem.id)
        .select()

      if (error) throw error

      if (data && data.length > 0) {
        const updatedMenuItem = data[0] as MenuItem
        setSelectedMenuItem(updatedMenuItem)
        setNuevoNombre(updatedMenuItem.nombre)
        setNuevaUrlImagen(updatedMenuItem.url_imagen)

        setMenuItems(menuItems.map(m => m.id === updatedMenuItem.id ? updatedMenuItem : m))
        setSuccessMessage('Ítem de menú actualizado con éxito')
      }
    } catch (error) {
      console.error('Error updating menu item:', error)
      setError('Error al actualizar el ítem de menú. Por favor, intente de nuevo.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-white md:bg-gradient-to-br md:from-blue-100 md:via-purple-100 md:to-pink-100 flex items-center justify-center p-4">
      <main className="bg-white rounded-lg shadow-lg p-4 md:p-8 w-full md:max-w-2xl">
        <h1 className="text-2xl md:text-3xl font-bold mb-6 text-center text-gray-900">Editar Menú</h1>
        <nav className="mb-8">
          <Link href="/admin/gestionarMenu" passHref>
            <Button variant="outline" className="w-full text-base md:text-lg bg-yellow-400 hover:bg-yellow-500" aria-label="Volver a gestionar menú">
              <ArrowLeft className="mr-2 h-4 w-4 md:h-5 md:w-5" aria-hidden="true" />
              Atrás
            </Button>
          </Link>
        </nav>
        {error && <p className="text-red-500 text-center mb-4" role="alert">{error}</p>}
        {successMessage && <p className="text-green-500 text-center mb-4" role="status">{successMessage}</p>}
        <form onSubmit={handleSubmit} className="space-y-6 md:space-y-8">
          <div className="space-y-2 md:space-y-3">
            <Label htmlFor="menuItem" className="text-base md:text-lg font-medium text-gray-900">
              Seleccionar Ítem de Menú
            </Label>
            <Select 
              onValueChange={handleMenuItemChange}
              disabled={isLoading}
            >
              <SelectTrigger id="menuItem" className="text-base md:text-lg">
                <SelectValue placeholder="Seleccione un menú" />
              </SelectTrigger>
              <SelectContent>
                {menuItems.map((menuItem) => (
                  <SelectItem key={menuItem.id} value={menuItem.id.toString()} className="text-base md:text-lg">
                    {menuItem.nombre}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2 md:space-y-3">
            <Label htmlFor="nuevoNombre" className="text-base md:text-lg font-medium text-gray-900">
              Nuevo Nombre del Ítem
            </Label>
            <Input
              id="nuevoNombre"
              value={nuevoNombre}
              onChange={(e) => setNuevoNombre(e.target.value)}
              className="text-base md:text-lg"
              placeholder="Ingrese el nuevo nombre del ítem"
              aria-required="true"
            />
          </div>
          <div className="space-y-2 md:space-y-3">
            <Label htmlFor="nuevaUrlImagen" className="text-base md:text-lg font-medium text-gray-900">
              Nueva URL de Imagen
            </Label>
            <Input
              id="nuevaUrlImagen"
              value={nuevaUrlImagen}
              onChange={(e) => setNuevaUrlImagen(e.target.value)}
              className="text-base md:text-lg"
              placeholder="Ingrese la nueva URL de imagen (opcional)"
            />
          </div>
          <Button
            type="submit"
            className="w-full bg-green-500 hover:bg-green-600 text-base md:text-lg"
            disabled={isLoading}
            aria-label="Guardar cambios"
          >
            {isLoading ? 'Guardando...' : 'Guardar Cambios'}
          </Button>
        </form>
      </main>
    </div>
  )
}
