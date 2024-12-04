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
  // Estados del componente
  const [images, setImages] = useState<string[]>([]); // Lista de nombres de imágenes almacenadas.
  const [isLoading, setIsLoading] = useState(true); // Indica si hay una operación en proceso.
  const [error, setError] = useState<string | null>(null); // Mensaje de error, si ocurre.
  const [deleteImage, setDeleteImage] = useState<string | null>(null); // Imagen seleccionada para eliminar.
  const supabase = createClientComponentClient(); // Cliente de Supabase para manejar la base de datos y almacenamiento.
  const router = useRouter(); // Para redirección o navegación si es necesario.

  // Se ejecuta una vez al cargar el componente para obtener las imágenes existentes.
  useEffect(() => {
    fetchImages(); // Llama a la función para cargar imágenes.
  }, []);

  // Función para obtener la lista de imágenes almacenadas en el bucket de Supabase.
  async function fetchImages() {
    setIsLoading(true); // Activa el indicador de carga.
    setError(null); // Limpia cualquier error previo.

    const { data, error } = await supabase
      .storage
      .from('ImagenesPrueba') // Selecciona el bucket "ImagenesPrueba".
      .list('login_alumno'); // Lista los archivos en la carpeta "login_alumno".

    if (error) {
      setError('Error al cargar las imágenes'); // Establece el mensaje de error.
      console.error(error); // Muestra el error en consola.
    } else {
      setImages(data.map(file => file.name)); // Actualiza el estado con los nombres de las imágenes.
    }
    setIsLoading(false); // Finaliza el estado de carga.
  }

  // Función para subir una nueva imagen al bucket.
  async function uploadImage(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0]; // Obtiene el archivo seleccionado.
    if (!file) return; // Sale si no hay archivo.

    setIsLoading(true); // Activa el indicador de carga.
    setError(null); // Limpia cualquier error previo.

    const { error } = await supabase
      .storage
      .from('ImagenesPrueba') // Selecciona el bucket "ImagenesPrueba".
      .upload(`login_alumno/${file.name}`, file); // Sube el archivo a la carpeta "login_alumno".

    if (error) {
      setError('Error al subir la imagen'); // Establece el mensaje de error.
      console.error(error); // Muestra el error en consola.
    } else {
      fetchImages(); // Actualiza la lista de imágenes.
    }
    setIsLoading(false); // Finaliza el estado de carga.
  }

  // Función para eliminar la imagen seleccionada del bucket.
  async function confirmDeleteImage() {
    if (deleteImage) { // Solo procede si hay una imagen seleccionada.
      setIsLoading(true); // Activa el indicador de carga.
      setError(null); // Limpia cualquier error previo.

      const { error } = await supabase
        .storage
        .from('ImagenesPrueba') // Selecciona el bucket "ImagenesPrueba".
        .remove([`login_alumno/${deleteImage}`]); // Elimina la imagen seleccionada.

      if (error) {
        setError('Error al eliminar la imagen'); // Establece el mensaje de error.
        console.error(error); // Muestra el error en consola.
      } else {
        fetchImages(); // Actualiza la lista de imágenes.
      }
      setIsLoading(false); // Finaliza el estado de carga.
    }
    setDeleteImage(null); // Limpia la selección de imagen a eliminar.
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


