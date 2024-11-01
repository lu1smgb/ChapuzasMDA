'use client'

import { useState } from 'react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import Link from 'next/link'
import { supabase } from '@/lib/supabase'

export default function AñadirMaterial() {
    const [nombre, setNombre] = useState('')
    const [descripcion, setDescripcion] = useState('')
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState('')
    const [successMessage, setSuccessMessage] = useState('')

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setIsLoading(true)
        setError('')
        setSuccessMessage('')

        if (!nombre || !descripcion) {
            setError('Debe llenar todos los campos.')
            setIsLoading(false)
            return
        }

        try {
            console.log('Submitting form with:', { nombre, descripcion })
            const { data, error } = await supabase
                .from('Material')
                .insert([
                    { 
                        nombre: nombre,
                        descripcion: descripcion,
                    }
                ])

            if (error) throw error

            console.log('Material creado:', data)
            setSuccessMessage('Material creado con éxito')

            // Clear the form fields
            setNombre('')
            setDescripcion('')
        } catch (error) {
            console.error('Error creating material:', error)
            setError('Error al crear el material. Por favor, intente de nuevo.')
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <div className="min-h-screen bg-white md:bg-gradient-to-br md:from-blue-100 md:via-purple-100 md:to-pink-100 flex items-center justify-center p-4">
            <main className="bg-white rounded-lg shadow-lg p-4 md:p-8 w-full md:max-w-2xl">
                <h1 className="text-2xl md:text-3xl font-bold mb-6 text-center text-gray-900">Añadir Material</h1>
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
                        <Label htmlFor="nombre" className="text-base md:text-lg font-medium text-gray-900">
                            Nombre del Material
                        </Label>
                        <Input
                            id="nombre"
                            value={nombre}
                            onChange={(e) => setNombre(e.target.value)}
                            className="text-base md:text-lg"
                            placeholder="Ingrese el nombre del material"
                            required
                            aria-required="true"
                        />
                    </div>
                    <div className="space-y-2 md:space-y-3">
                        <Label htmlFor="descripcion" className="text-base md:text-lg font-medium text-gray-900">
                            Descripción del Material
                        </Label>
                        <Input
                            id="descripcion"
                            value={descripcion}
                            onChange={(e) => setDescripcion(e.target.value)}
                            className="text-base md:text-lg"
                            placeholder="Ingrese la descripción del material"
                            required
                            aria-required="true"
                        />
                    </div>
                    <Button 
                        type="submit" 
                        className="w-full text-base md:text-lg bg-blue-600 hover:bg-blue-700 text-white"
                        aria-label="Añadir material"
                        disabled={isLoading}
                    >
                        {isLoading ? 'Creando...' : 'Añadir Material'}
                    </Button>
                </form>
            </main>
        </div>
    )
}