'use client'

import { useState, useEffect } from 'react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ArrowLeft } from "lucide-react"
import Link from 'next/link'
import { supabase } from '@/lib/supabase'

interface Material {
    nombre: string;
    descripcion: string;
}

export default function ModificarMaterial() {
    const [materiales, setMateriales] = useState<Material[]>([])
    const [selectedMaterial, setSelectedMaterial] = useState<Material | null>(null)
    const [nuevoNombre, setNuevoNombre] = useState('')
    const [nuevaDescripcion, setNuevaDescripcion] = useState('')
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState('')
    const [successMessage, setSuccessMessage] = useState('')

    useEffect(() => {
        const fetchMateriales = async () => {
            setIsLoading(true)
            setError('')
            try {
                const { data, error } = await supabase
                    .from('Material')
                    .select('nombre, descripcion')

                if (error) throw error

                setMateriales(data)
            } catch (error) {
                console.error('Error fetching materials:', error)
                setError('Error al cargar los datos del material. Por favor, recargue la página.')
            } finally {
                setIsLoading(false)
            }
        }

        fetchMateriales()
    }, [])

    const handleMaterialChange = (materialNombre: string) => {
        const material = materiales.find(m => m.nombre === materialNombre)
        setSelectedMaterial(material || null)
        if (material) {
            setNuevoNombre(material.nombre)
            setNuevaDescripcion(material.descripcion)
        }
        setSuccessMessage('')
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!selectedMaterial) {
            setError('Debe seleccionar un material.')
            return
        }

        if (nuevoNombre.trim() === '') {
            setError('El nombre no puede ser una cadena vacía.')
            return
        }

        setIsLoading(true)
        setError('')
        setSuccessMessage('')

        const updates: Partial<Material> = {}
        if (nuevoNombre !== selectedMaterial.nombre) {
            updates.nombre = nuevoNombre
        }
        if (nuevaDescripcion !== selectedMaterial.descripcion) {
            updates.descripcion = nuevaDescripcion
        }

        if (Object.keys(updates).length === 0) {
            setError('No se han realizado cambios.')
            setIsLoading(false)
            return
        }

        try {
            const { data, error } = await supabase
                .from('Material')
                .update(updates)
                .eq('nombre', selectedMaterial.nombre)
                .select()

            if (error) throw error

            if (data && data.length > 0) {
                const updatedMaterial = data[0] as Material
                setSelectedMaterial(updatedMaterial)
                setNuevoNombre(updatedMaterial.nombre)
                setNuevaDescripcion(updatedMaterial.descripcion)

                setMateriales(materiales.map(m => m.nombre === updatedMaterial.nombre ? updatedMaterial : m))
                setSuccessMessage('Material actualizado con éxito')

                setNuevoNombre('');
                setNuevaDescripcion('');
                
            }
        } catch (error) {
            console.error('Error updating material:', error)
            setError('Error al actualizar el material. Por favor, intente de nuevo.')
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <div className="min-h-screen bg-white md:bg-gradient-to-br md:from-blue-100 md:via-purple-100 md:to-pink-100 flex items-center justify-center p-4">
            <main className="bg-white rounded-lg shadow-lg p-4 md:p-8 w-full md:max-w-2xl">
                <h1 className="text-2xl md:text-3xl font-bold mb-6 text-center text-gray-900">Modificar Material</h1>
                <nav className="mb-8">
                    <Link href="/admin/gestionarMaterial" passHref>
                        <Button variant="outline" className="w-full text-base md:text-lg bg-yellow-400 hover:bg-yellow-500" aria-label="Volver a gestionar material">
                            <ArrowLeft className="mr-2 h-4 w-4 md:h-5 md:w-5" aria-hidden="true" />
                            Atrás
                        </Button>
                    </Link>
                </nav>
                {error && <p className="text-red-500 text-center mb-4" role="alert">{error}</p>}
                {successMessage && <p className="text-green-500 text-center mb-4" role="status">{successMessage}</p>}
                <form onSubmit={handleSubmit} className="space-y-6 md:space-y-8">
                    <div className="space-y-2 md:space-y-3">
                        <Label htmlFor="material" className="text-base md:text-lg font-medium text-gray-900">
                            Seleccionar Material
                        </Label>
                        <Select 
                            onValueChange={handleMaterialChange}
                            disabled={isLoading}
                        >
                            <SelectTrigger id="material" className="text-base md:text-lg">
                                <SelectValue placeholder="Seleccione un material" />
                            </SelectTrigger>
                            <SelectContent>
                                {materiales.map((material) => (
                                    <SelectItem key={material.nombre} value={material.nombre} className="text-base md:text-lg">
                                        {material.nombre}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="space-y-2 md:space-y-3">
                        <Label htmlFor="nuevoNombre" className="text-base md:text-lg font-medium text-gray-900">
                            Nuevo Nombre del Material
                        </Label>
                        <Input
                            id="nuevoNombre"
                            value={nuevoNombre}
                            onChange={(e) => setNuevoNombre(e.target.value)}
                            className="text-base md:text-lg"
                            placeholder="Ingrese el nuevo nombre del material"
                            aria-required="true"
                        />
                    </div>
                    <div className="space-y-2 md:space-y-3">
                        <Label htmlFor="nuevaDescripcion" className="text-base md:text-lg font-medium text-gray-900">
                            Nueva Descripción del Material
                        </Label>
                        <Input
                            id="nuevaDescripcion"
                            value={nuevaDescripcion}
                            onChange={(e) => setNuevaDescripcion(e.target.value)}
                            className="text-base md:text-lg"
                            placeholder="Ingrese la nueva descripción del material"
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
