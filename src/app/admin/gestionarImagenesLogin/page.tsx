'use client'

import { useState, useEffect } from 'react'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Trash2, Upload, ArrowLeft } from 'lucide-react'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"

export default function GestionarImagenesLogin() {
  const [images, setImages] = useState<string[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [deleteImage, setDeleteImage] = useState<string | null>(null)
  const supabase = createClientComponentClient()
  const router = useRouter()

  useEffect(() => {
    fetchImages()
  }, [])

  async function fetchImages() {
    setIsLoading(true)
    setError(null)
    const { data, error } = await supabase
      .storage
      .from('ImagenesPrueba')
      .list('login_alumno')

    if (error) {
      setError('Error al cargar las imágenes')
      console.error(error)
    } else {
      setImages(data.map(file => file.name))
    }
    setIsLoading(false)
  }

  async function uploadImage(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0]
    if (!file) return

    setIsLoading(true)
    setError(null)

    const { error } = await supabase
      .storage
      .from('ImagenesPrueba')
      .upload(`login_alumno/${file.name}`, file)

    if (error) {
      setError('Error al subir la imagen')
      console.error(error)
    } else {
      fetchImages()
    }
    setIsLoading(false)
  }

  async function confirmDeleteImage() {
    if (deleteImage) {
      setIsLoading(true)
      setError(null)

      const { error } = await supabase
        .storage
        .from('ImagenesPrueba')
        .remove([`login_alumno/${deleteImage}`])

      if (error) {
        setError('Error al eliminar la imagen')
        console.error(error)
      } else {
        fetchImages()
      }
      setIsLoading(false)
    }
    setDeleteImage(null)
  }

  return (
    <div className="container mx-auto p-4 flex flex-col h-screen">
      <nav className="mb-4">
        <Button onClick={() => router.push('.')} variant="outline" className="text-base bg-yellow-400 hover:bg-yellow-500">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Volver
        </Button>
      </nav>

      <h1 className="text-2xl font-bold mb-4 text-center">Gestionar Imágenes de Login</h1>

      {error && <p className="text-red-500 mb-4">{error}</p>}

      {isLoading ? (
        <p>Cargando...</p>
      ) : (
        <div className="flex-grow overflow-y-auto">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {images.map((imageName) => (
              <Card key={imageName} className="overflow-hidden">
                <CardContent className="p-2">
                  <div className="relative aspect-video">
                    <Image
                      src={`${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/ImagenesPrueba/login_alumno/${imageName}`}
                      alt={imageName}
                      layout="fill"
                      objectFit="cover"
                    />
                  </div>
                  <div className="mt-2 flex justify-between items-center">
                    <p className="text-sm truncate">{imageName}</p>
                    <Button
                      variant="destructive"
                      size="icon"
                      onClick={() => setDeleteImage(imageName)}
                      disabled={isLoading}
                    >
                      <Trash2 className="h-4 w-4" />
                      <span className="sr-only">Eliminar imagen</span>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      <div className="sticky bottom-0 bg-white pt-4">
        <Button onClick={() => document.getElementById('fileInput')?.click()} className="w-full mb-4 bg-green-600 hover:bg-green-700 text-white">
          <Upload className="mr-2 h-4 w-4" />
          Añadir nueva imagen
        </Button>
        <Input
          id="fileInput"
          type="file"
          accept="image/*"
          onChange={uploadImage}
          className="hidden"
        />
      </div>

      <AlertDialog open={deleteImage !== null} onOpenChange={() => setDeleteImage(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar eliminación</AlertDialogTitle>
            <AlertDialogDescription>
              ¿Estás seguro de que quieres eliminar la imagen {deleteImage}? Esta acción no se puede deshacer.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setDeleteImage(null)}>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDeleteImage} className="bg-red-500 hover:bg-red-600 text-white">
              Aceptar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}


