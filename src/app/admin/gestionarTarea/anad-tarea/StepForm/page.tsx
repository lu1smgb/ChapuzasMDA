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
  const [uploading, setUploading] = useState(false)
  const [expanded, setExpanded] = useState(true)

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>, field: string) => {
    const file = event.target.files?.[0]
    if (!file) return

    setUploading(true)

    try {
      let bucket: string
      let folder: string

      switch (field) {
        case 'imagen':
          bucket = 'ImagenesPrueba'
          folder = 'img_pasos'
          break
        case 'audio':
          bucket = 'ImagenesPrueba'
          folder = 'audio_pasos'
          break
        case 'video':
          bucket = 'ImagenesPrueba'
          folder = 'video_pasos'
          break
        case 'pictograma':
          bucket = 'ImagenesPrueba'
          folder = 'picto_pasos'
          break
        default:
          throw new Error('Invalid field')
      }

      const { data, error } = await supabase.storage
        .from(bucket)
        .upload(`${folder}/${file.name}`, file)

      if (error) throw error

      const { data: { publicUrl } } = supabase.storage
        .from(bucket)
        .getPublicUrl(`${folder}/${file.name}`)

      form.setValue(`pasos.${index}.${field}`, publicUrl)
    } catch (error) {
      console.error('Error uploading file:', error)
    } finally {
      setUploading(false)
    }
  }

  const toggleExpansion = () => {
    setExpanded(!expanded)
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">Paso {index + 1}</h3>
        <Button type="button" variant="ghost" onClick={toggleExpansion}>
          {expanded ? <ChevronUp /> : <ChevronDown />}
        </Button>
      </div>
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

