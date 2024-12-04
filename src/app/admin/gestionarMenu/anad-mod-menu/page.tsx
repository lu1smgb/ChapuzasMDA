'use client'

import { useState, useEffect } from 'react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ArrowLeft, Loader2 } from 'lucide-react'
import { createClient } from '@supabase/supabase-js'
import { useRouter, useSearchParams } from 'next/navigation'
import { Alert, AlertDescription } from "@/components/ui/alert"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseAnonKey);

/**
 * Este código implementa un formulario para añadir o modificar menús.
 *
 * - La interfaz `Menu` define la estructura de un menú con `id`, `nombre` y `url_imagen`.
 * - El componente `MenuForm` gestiona los datos del menú, la previsualización de imágenes, y el envío al servidor.
 */

interface Menu {
  id: number;
  nombre: string;
  url_imagen: string;
}

export default function MenuForm() {
  const [menu, setMenu] = useState<Menu | null>(null); // Almacena los datos del menú actual
  const [name, setName] = useState(''); // Almacena el nombre del menú ingresado
  const [image, setImage] = useState<File | null>(null); // Archivo de imagen seleccionado
  const [imagePreview, setImagePreview] = useState(''); // URL de previsualización de la imagen
  const [isLoading, setIsLoading] = useState(false); // Estado de carga al guardar el menú
  const [error, setError] = useState(''); // Almacena mensajes de error
  const [success, setSuccess] = useState(''); // Almacena mensajes de éxito

  const router = useRouter(); // Permite la navegación
  const searchParams = useSearchParams(); // Obtiene parámetros de la URL
  const id = searchParams.get('id'); // ID del menú si se está editando

  useEffect(() => {
    if (id) {
      fetchMenu(parseInt(id)); // Carga el menú si existe un ID en la URL
    }
  }, [id]);

  /**
   * Obtiene los datos de un menú específico desde la base de datos.
   */
  const fetchMenu = async (id: number) => {
    try {
      const { data, error } = await supabase
        .from("Menu")
        .select("*")
        .eq('id', id)
        .single();

      if (error) throw error;

      setMenu(data); // Asigna los datos del menú al estado
      setName(data.nombre); // Establece el nombre en el formulario
      setImagePreview(data.url_imagen); // Muestra la imagen actual del menú
    } catch (error) {
      console.error("Error al obtener el menú:", error);
      setError('Error al cargar los datos del menú.');
    }
  };

  /**
   * Maneja la selección de archivos y valida el formato de la imagen.
   */
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const fileType = file.type;
      if (fileType === 'image/jpeg' || fileType === 'image/png' || fileType === 'image/jpg') {
        setImage(file); // Almacena el archivo de imagen
        setImagePreview(URL.createObjectURL(file)); // Genera una URL temporal para previsualización
      } else {
        setError('Por favor, seleccione una imagen en formato JPG, JPEG o PNG.');
      }
    }
  };

  /**
   * Envía los datos del formulario para añadir o modificar un menú.
   */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    setSuccess('');

    if (!name) {
      setError('Debe llenar el nombre del menú.');
      setIsLoading(false);
      return;
    }

    try {
      let imageUrl = menu?.url_imagen || ''; // URL de la imagen actual o vacía

      if (image) {
        // Sube la imagen al almacenamiento y obtiene su URL pública
        const fileExt = image.name.split('.').pop();
        const fileName = `${Math.random()}.${fileExt}`;
        const filePath = `menus/${fileName}`;

        const { error: uploadError } = await supabase.storage
          .from('ImagenesPrueba')
          .upload(filePath, image);

        if (uploadError) throw uploadError;

        const { data: { publicUrl } } = supabase.storage
          .from('ImagenesPrueba')
          .getPublicUrl(filePath);

        imageUrl = publicUrl; // Asigna la URL pública al menú
      }

      if (menu) {
        // Actualiza un menú existente
        const { error } = await supabase
          .from('Menu')
          .update({
            nombre: name,
            url_imagen: imageUrl
          })
          .eq('id', menu.id);

        if (error) throw error;
        setSuccess('Menú modificado correctamente.');
      } else {
        // Crea un nuevo menú
        const { error } = await supabase
          .from("Menu")
          .insert({
            nombre: name,
            url_imagen: imageUrl,
          });

        if (error) throw error;
        setSuccess('Menú añadido correctamente.');
      }

      setTimeout(() => {
        router.push('.'); // Navega de vuelta a la lista de menús
      }, 2000);
    } catch (error) {
      console.error("Error al guardar el menú:", error);
      setError('Error al guardar el menú. Por favor, inténtelo de nuevo.');
    } finally {
      setIsLoading(false);
    }
  };


  return (
    <div className="bg-white rounded-lg shadow-lg p-4 md:p-8 w-full max-w-4xl mx-auto">
      <nav className="mb-4">
        <Button onClick={() => router.push('.')} variant="outline" className="text-base bg-yellow-400 hover:bg-yellow-500">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Volver
        </Button>
      </nav>

      <h1 className="text-2xl font-bold mb-6 text-center text-gray-900">
        {menu ? 'Modificar Menú' : 'Añadir Nuevo Menú'}
      </h1>

      {error && (
        <Alert variant="destructive" className="mb-4">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {success && (
        <Alert variant="default" className="mb-4 bg-green-100 text-green-800 border-green-300">
          <AlertDescription>{success}</AlertDescription>
        </Alert>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="nombre">Nombre del Menú</Label>
          <Input
            id="nombre"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Nombre del menú"
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="image">Imagen del Menú</Label>
          <div className="flex items-center justify-center w-full h-32 border-2 border-dashed border-gray-300 rounded-lg relative">
            {imagePreview ? (
              <img
                src={imagePreview}
                alt="Imagen del menú"
                className="h-full w-full object-cover rounded-lg"
              />
            ) : (
              <div className="text-center text-gray-500">
                <svg
                  className="mx-auto h-12 w-12 text-gray-400"
                  stroke="currentColor"
                  fill="none"
                  viewBox="0 0 48 48"
                  aria-hidden="true"
                >
                  <path
                    d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                    strokeWidth={2}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
                <p>Arrastra una imagen o haz clic para seleccionar una imagen (JPG, JPEG, PNG)</p>
              </div>
            )}
            <Input
              id="image"
              name="image"
              type="file"
              accept="image/jpeg,image/png,image/jpg"
              onChange={handleFileChange}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            />
          </div>
        </div>
        <Button type="submit" className="w-full bg-green-600 hover:bg-green-700 text-white" disabled={isLoading}>
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              {menu ? 'Guardando cambios...' : 'Añadiendo menú...'}
            </>
          ) : (
            menu ? 'Guardar Cambios' : 'Añadir Menú'
          )}
        </Button>
      </form>
    </div>
  )
}


