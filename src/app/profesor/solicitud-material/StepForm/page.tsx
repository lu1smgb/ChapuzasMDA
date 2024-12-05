'use client'

import { useState } from 'react'
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { UseFormReturn } from 'react-hook-form'
import { createClient } from '@supabase/supabase-js'
import { Button } from '@/components/ui/button'
import { ChevronDown, ChevronUp } from 'lucide-react'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseAnonKey);

type StepFormProps = {
  form: UseFormReturn<any>
  index: number
}

export default function StepForm({ form, index }: StepFormProps) {
  const [uploading, setUploading] = useState(false); // Estado para indicar si se está subiendo un archivo.
  const [expanded, setExpanded] = useState(true); // Estado para controlar si el formulario está expandido o colapsado.

  // Maneja la subida de archivos a Supabase Storage.
  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>, field: string) => {
    const file = event.target.files?.[0]; // Obtiene el archivo seleccionado.
    if (!file) return; // Si no hay archivo seleccionado, salir de la función.

    setUploading(true); // Indica que la subida está en proceso.

    try {
      let bucket: string; // Nombre del bucket de almacenamiento.
      let folder: string; // Carpeta dentro del bucket donde se guardará el archivo.

      // Define el bucket y la carpeta según el tipo de archivo.
      switch (field) {
        case 'imagen':
          bucket = 'ImagenesPrueba';
          folder = 'img_pasos';
          break;
        case 'audio':
          bucket = 'ImagenesPrueba';
          folder = 'audio_pasos';
          break;
        case 'video':
          bucket = 'ImagenesPrueba';
          folder = 'video_pasos';
          break;
        case 'pictograma':
          bucket = 'ImagenesPrueba';
          folder = 'picto_pasos';
          break;
        default:
          throw new Error('Invalid field'); // Error si el campo no es válido.
      }

      // Subida del archivo a la carpeta especificada dentro del bucket.
      const { data, error } = await supabase.storage
        .from(bucket)
        .upload(`${folder}/${file.name}`, file);

      if (error) throw error; // Lanza error si la subida falla.

      // Obtiene la URL pública del archivo subido.
      const { data: { publicUrl } } = supabase.storage
        .from(bucket)
        .getPublicUrl(`${folder}/${file.name}`);

      // Actualiza el valor del campo correspondiente en el formulario con la URL pública.
      form.setValue(`pasos.${index}.${field}`, publicUrl);
    } catch (error) {
      console.error('Error uploading file:', error); // Muestra un error en caso de fallo.
    } finally {
      setUploading(false); // Marca el final del proceso de subida.
    }
  };

  // Alterna el estado expandido/colapsado del formulario.
  const toggleExpansion = () => {
    setExpanded(!expanded);
  };

  return (
    <div className="space-y-4">
      <Button type="button" variant="ghost" onClick={toggleExpansion} className="mb-2">
        {expanded ? <ChevronUp /> : <ChevronDown />}
      </Button>
      {expanded && (
        <>
          <FormField
            control={form.control}
            name={`pasos.${index}.texto`}
            render={({ field }) => (
              <FormItem>
                <FormLabel>Texto</FormLabel>
                <FormControl>
                  <Textarea {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name={`pasos.${index}.imagen`}
            render={({ field }) => (
              <FormItem>
                <FormLabel>Imagen</FormLabel>
                <FormControl>
                  <Input
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleFileUpload(e, 'imagen')}
                    disabled={uploading}
                  />
                </FormControl>
                {field.value && <img src={field.value} alt="Imagen del paso" className="mt-2 max-w-xs" />}
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name={`pasos.${index}.audio`}
            render={({ field }) => (
              <FormItem>
                <FormLabel>Audio</FormLabel>
                <FormControl>
                  <Input
                    type="file"
                    accept="audio/*"
                    onChange={(e) => handleFileUpload(e, 'audio')}
                    disabled={uploading}
                  />
                </FormControl>
                {field.value && (
                  <audio controls className="mt-2">
                    <source src={field.value} type="audio/mpeg" />
                    Your browser does not support the audio element.
                  </audio>
                )}
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name={`pasos.${index}.video`}
            render={({ field }) => (
              <FormItem>
                <FormLabel>Video</FormLabel>
                <FormControl>
                  <Input
                    type="file"
                    accept="video/*"
                    onChange={(e) => handleFileUpload(e, 'video')}
                    disabled={uploading}
                  />
                </FormControl>
                {field.value && (
                  <video controls className="mt-2 max-w-xs">
                    <source src={field.value} type="video/mp4" />
                    Your browser does not support the video tag.
                  </video>
                )}
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name={`pasos.${index}.pictograma`}
            render={({ field }) => (
              <FormItem>
                <FormLabel>Pictograma</FormLabel>
                <FormControl>
                  <Input
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleFileUpload(e, 'pictograma')}
                    disabled={uploading}
                  />
                </FormControl>
                {field.value && <img src={field.value} alt="Pictograma del paso" className="mt-2 max-w-xs" />}
                <FormMessage />
              </FormItem>
            )}
          />
        </>
      )}
    </div>
  )
}

