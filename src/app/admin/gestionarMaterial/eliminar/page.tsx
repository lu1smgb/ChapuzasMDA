'use client'

import { useState, useEffect } from 'react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import Link from 'next/link'
import { supabase } from '@/lib/supabase'

export default function EliminarMaterial() {
    const [nombre, setNombre] = useState('')
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState('')
    const [successMessage, setSuccessMessage] = useState('')
    const [materiales, setMateriales] = useState<string[]>([])

    useEffect(() => {
        const fetchMateriales = async () => {
            try {
                const { data, error } = await supabase
                    .from('Material')
                    .select('nombre')

                if (error) throw error

                setMateriales(data.map((material: { nombre: string }) => material.nombre))
            } catch (error) {
                console.error('Error fetching materials:', error)
                setError('Error al cargar los materiales. Por favor, intente de nuevo.')
            }
        }

        fetchMateriales()
    }, [])

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setIsLoading(true)
        setError('')
        setSuccessMessage('')

        if (!nombre) {
            setError('Debe proporcionar el nombre del material.')
            setIsLoading(false)
            return
        }

        try {
            console.log('Submitting form with:', { nombre })
            const { data, error } = await supabase
                .from('Material')
                .delete()
                .eq('nombre', nombre)

            if (error) throw error

            console.log('Material eliminado:', data)
            setSuccessMessage('Material eliminado con éxito')

            // Limpiar campo
            setNombre('')

        } catch (error) {
            console.error('Error deleting material:', error)
            setError('Error al eliminar el material. Por favor, intente de nuevo.')
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <div className="min-h-screen bg-white md:bg-gradient-to-br md:from-blue-100 md:via-purple-100 md:to-pink-100 flex items-center justify-center p-4">
            <main className="bg-white rounded-lg shadow-lg p-4 md:p-8 w-full md:max-w-2xl">
                <h1 className="text-2xl md:text-3xl font-bold mb-6 text-center text-gray-900">Eliminar Material</h1>
                <nav className="mb-8">
                    <Link href="/admin/gestionarMaterial" passHref>
                        <Button variant="outline" className="w-full text-base md:text-lg bg-yellow-400 hover:bg-yellow-500" aria-label="Volver al dashboard">
                            Atrás
                        </Button>
                    </Link>
                </nav>
                {error && <p className="text-red-500 text-center mb-4" role="alert">{error}</p>}
                {successMessage && <p className="text-green-500 text-center mb-4" role="status">{successMessage}</p>}
                <form onSubmit={handleSubmit} className="space-y-6 md:space-y-8">
                    <div className="space-y-2 md:space-y-3">
                        <Label htmlFor="materialId" className="text-base md:text-lg font-medium text-gray-900">
                            Nombre del Material
                        </Label>
                        <select
                            id="materialId"
                            value={nombre}
                            onChange={(e) => setNombre(e.target.value)}
                            className="text-base md:text-lg w-full p-2 border border-gray-300 rounded-md"
                            required
                            aria-required="true"
                        >
                            <option value="" disabled>Seleccione un material</option>
                            {materiales.map((material) => (
                                <option key={material} value={material}>
                                    {material}
                                </option>
                            ))}
                        </select>
                    </div>
                    <Button 
                        type="submit" 
                        className="w-full text-base md:text-lg bg-red-600 hover:bg-red-700 text-white"
                        aria-label="Eliminar material"
                        disabled={isLoading}
                    >
                        {isLoading ? 'Eliminando...' : 'Eliminar Material'}
                    </Button>
                </form>
            </main>
        </div>
    )
}
