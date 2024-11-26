'use client'

import { useState, useEffect } from 'react'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import * as z from 'zod'
import { Button } from '@/components/ui/button'
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { createClient } from '@supabase/supabase-js'
import { useRouter, useSearchParams } from 'next/navigation'
import { Alert, AlertDescription } from "@/components/ui/alert"
import { ArrowLeft, Loader2 } from 'lucide-react'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseAnonKey);

const tiposTarea = [
  { value: 'Tarea_Juego', label: 'Tarea_Juego' },
  { value: 'Tarea_Menu', label: 'Tarea_Menu' },
  { value: 'Tarea_Material', label: 'Tarea_Material' },
  { value: 'Tarea_Pasos', label: 'Tarea_Pasos' },
]

const formSchema = z.object({
  tipo_tarea: z.string(),
  fecha_inicio: z.string(),
  fecha_fin: z.string(),
  nombre: z.string().min(2, {
    message: 'El nombre debe tener al menos 2 caracteres.',
  }),
  descripcion: z.string(),
  id_alumno: z.string({
    required_error: "Debes seleccionar un alumno",
  }),
  // Campos específicos
  enlace: z.string().optional(),
  nombres_materiales: z.string().optional(),
  cantidades_materiales: z.string().optional(),
  aula_destino: z.string().optional(),
  id_profesor: z.string().optional(),
}).refine(data => {
  const inicio = new Date(data.fecha_inicio);
  const fin = new Date(data.fecha_fin);
  return fin >= inicio;
}, {
  message: "La fecha de fin debe ser igual o posterior a la fecha de inicio",
  path: ["fecha_fin"],
});

export default function FormularioTarea() {
  const [alumnos, setAlumnos] = useState<{ identificador: string; nombre: string }[]>([])
  const [profesores, setProfesores] = useState<{ identificador: string; nombre: string }[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const router = useRouter()
  const searchParams = useSearchParams()
  const taskId = searchParams.get('id')
  const taskType = searchParams.get('tipo')

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      tipo_tarea: taskType || '',
      fecha_inicio: '',
      fecha_fin: '',
      nombre: '',
      descripcion: '',
      id_alumno: '',
    },
  })

  useEffect(() => {
    fetchAlumnos()
    fetchProfesores()
    if (taskId && taskType) {
      fetchTaskData(taskId, taskType)
    }
  }, [taskId, taskType])

  const fetchAlumnos = async () => {
    try {
      const { data, error } = await supabase
        .from('Alumno')
        .select('identificador, nombre')

      if (error) throw error

      setAlumnos(data || [])
    } catch (error) {
      console.error('Error al obtener los alumnos:', error)
      setErrorMessage('Error al cargar la lista de alumnos.')
    }
  }

  const fetchProfesores = async () => {
    try {
      const { data, error } = await supabase
        .from('Profesor')
        .select('identificador, nombre')

      if (error) throw error

      setProfesores(data || [])
    } catch (error) {
      console.error('Error al obtener los profesores:', error)
      setErrorMessage('Error al cargar la lista de profesores.')
    }
  }

  const fetchTaskData = async (id: string, tipo: string) => {
    try {
      const { data, error } = await supabase
        .from(tipo)
        .select('*')
        .eq('identificador', id)
        .single()

      if (error) throw error

      if (data) {
        form.reset({
          tipo_tarea: tipo,
          fecha_inicio: new Date(data.fecha_inicio).toISOString().slice(0, 19),
          fecha_fin: new Date(data.fecha_fin).toISOString().slice(0, 19),
          nombre: data.nombre,
          descripcion: data.descripcion,
          id_alumno: data.id_alumno ? data.id_alumno.toString() : undefined,
          enlace: data.enlace,
          nombres_materiales: data.nombres_materiales,
          cantidades_materiales: data.cantidades_materiales,
          aula_destino: data.aula_destino ? data.aula_destino.toString() : undefined,
          id_profesor: data.id_profesor ? data.id_profesor.toString() : undefined,
        })
      }
    } catch (error) {
      console.error('Error al obtener los datos de la tarea:', error)
      setErrorMessage('Error al cargar los datos de la tarea.')
    }
  }

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true)
    setErrorMessage(null)
    setSuccessMessage(null)

    try {
      const taskData = {
        ...values,
        fecha_inicio: new Date(values.fecha_inicio).toISOString(),
        fecha_fin: new Date(values.fecha_fin).toISOString(),
        id_alumno: values.id_alumno ? parseInt(values.id_alumno) : undefined,
        aula_destino: values.aula_destino ? parseInt(values.aula_destino) : undefined,
        id_profesor: values.id_profesor ? parseInt(values.id_profesor) : undefined,
      }

      let error;
      if (taskId) {
        const { error: updateError } = await supabase
          .from('Tarea_Menu')
          .update(taskData)
          .eq('identificador', taskId)
        error = updateError
      } else {
        const { error: insertError } = await supabase
          .from('Tarea_Menu')
          .insert(taskData)
        error = insertError
      }

      if (error) throw error

      setSuccessMessage(taskId ? 'Tarea actualizada correctamente.' : 'Tarea creada correctamente.')
      setTimeout(() => {
        router.push('.')
      }, 2000)
    } catch (error) {
      console.error('Error al guardar la tarea:', error)
      setErrorMessage('Error al guardar la tarea. Por favor, inténtelo de nuevo.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="bg-white rounded-lg shadow-lg p-4 md:p-8 w-full max-w-4xl mx-auto">
      <nav className="mb-4">
        <Button onClick={() => router.back()} variant="outline" className="text-base bg-yellow-400 hover:bg-yellow-500">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Volver
        </Button>
      </nav>

      <h1 className="text-2xl font-bold mb-6 text-center text-gray-900">
        {taskId ? 'Modificar Tarea' : 'Añadir Nueva Tarea'}
      </h1>

      {errorMessage && (
        <Alert variant="destructive" className="mb-4">
          <AlertDescription>{errorMessage}</AlertDescription>
        </Alert>
      )}

      {successMessage && (
        <Alert variant="default" className="mb-4 bg-green-100 text-green-800 border-green-300">
          <AlertDescription>{successMessage}</AlertDescription>
        </Alert>
      )}

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="tipo_tarea"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tipo de Tarea</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecciona un tipo de tarea" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {tiposTarea.map((tipo) => (
                        <SelectItem key={tipo.value} value={tipo.value}>
                          {tipo.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="nombre"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nombre</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="fecha_inicio"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Fecha y Hora de Inicio</FormLabel>
                  <FormControl>
                    <Input type="datetime-local" step="1" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="fecha_fin"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Fecha y Hora de Fin</FormLabel>
                  <FormControl>
                    <Input type="datetime-local" step="1" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="descripcion"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Descripción</FormLabel>
                  <FormControl>
                    <Textarea {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="id_alumno"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Alumno</FormLabel>
                  <Select
                    onValueChange={(value) => field.onChange(value)}
                    value={field.value}
                    defaultValue=""
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecciona un alumno" />
                    </SelectTrigger>
                    <SelectContent>
                      {alumnos.map((alumno) => (
                        <SelectItem
                          key={alumno.identificador}
                          value={alumno.identificador.toString()}
                        >
                          {alumno.nombre}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

          </div>

          {form.watch('tipo_tarea') === 'Tarea_Juego' && (
            <FormField
              control={form.control}
              name="enlace"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Enlace</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          )}

          {form.watch('tipo_tarea') === 'Tarea_Material' && (
            <>
              <FormField
                control={form.control}
                name="nombres_materiales"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nombres de Materiales</FormLabel>
                    <FormControl>
                      <Textarea {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="cantidades_materiales"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Cantidades de Materiales</FormLabel>
                    <FormControl>
                      <Textarea {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="aula_destino"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Aula Destino</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
             <FormField
              control={form.control}
              name="id_profesor"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Profesor</FormLabel>
                  <Select
                    onValueChange={(value) => field.onChange(value)}
                    value={field.value}
                    defaultValue=""
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecciona un profesor" />
                    </SelectTrigger>
                    <SelectContent>
                      {profesores.map((profesor) => (
                        <SelectItem
                          key={profesor.identificador}
                          value={profesor.identificador.toString()}
                        >
                          {profesor.nombre}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            </>
          )}

<Button type="submit" className="w-full bg-green-600 hover:bg-green-700 text-white" disabled={isLoading}>
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                {taskId ? 'Actualizando tarea...' : 'Añadiendo tarea...'}
              </>
            ) : (
              taskId ? 'Actualizar Tarea' : 'Añadir Tarea'
            )}
          </Button>
        </form>
      </Form>
    </div>
  )
}