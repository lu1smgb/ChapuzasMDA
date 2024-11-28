'use client'

import { useState, useEffect } from 'react'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm, useFieldArray } from 'react-hook-form'
import * as z from 'zod'
import { Button } from '@/components/ui/button'
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { createClient } from '@supabase/supabase-js'
import { useRouter, useSearchParams } from 'next/navigation'
import { Alert, AlertDescription } from "@/components/ui/alert"
import { ArrowLeft, Loader2, Search, Plus, Trash } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import StepForm from './StepForm/page'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"

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
  fecha_inicio: z.string().nonempty('La fecha de inicio es obligatoria'),
  fecha_fin: z.string().nonempty('La fecha de fin es obligatoria'),
  nombre: z.string().min(2, {
    message: 'El nombre debe tener al menos 2 caracteres.',
  }),
  descripcion: z.string().optional(),
  id_alumno: z.string().optional(),
  // Campos específicos para Tarea_Material
  nombres_materiales: z.string().optional(),
  cantidades_materiales: z.string().optional(),
  aula_destino: z.string().optional(),
  id_profesor: z.string().optional(),
  // Campos para otros tipos de tareas se mantienen
  enlace: z.string().optional(),
  pasos: z.array(z.object({
    texto: z.string().optional(),
    imagen: z.string().optional(),
    audio: z.string().optional(),
    video: z.string().optional(),
    pictograma: z.string().optional(),
  })).optional(),
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
  const [filteredAlumnos, setFilteredAlumnos] = useState<{ identificador: string; nombre: string }[]>([])
  const [filteredProfesores, setFilteredProfesores] = useState<{ identificador: string; nombre: string }[]>([])
  const [alumnoSearch, setAlumnoSearch] = useState('')
  const [profesorSearch, setProfesorSearch] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const router = useRouter()
  const searchParams = useSearchParams()
  const [taskId, setTaskId] = useState<string | null | number>(searchParams.get('id'));
  const taskType = searchParams.get('tipo')
  const [stepToDelete, setStepToDelete] = useState<number | null>(null)

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      tipo_tarea: taskType || '',
      fecha_inicio: '',
      fecha_fin: '',
      nombre: '',
      descripcion: '',
      id_alumno: '',
      // Nuevos campos para Tarea_Material
      nombres_materiales: '',
      cantidades_materiales: '',
      aula_destino: '',
      id_profesor: '',
      pasos: [],
    },
  })

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "pasos",
  });

  useEffect(() => {
    fetchAlumnos()
    fetchProfesores()
    if (searchParams.get('id') && taskType) {
      fetchTaskData(searchParams.get('id')!, taskType);
    }
  }, [taskType, searchParams]);

  useEffect(() => {
    setFilteredAlumnos(
      alumnos.filter(alumno =>
        alumno.nombre.toLowerCase().includes(alumnoSearch.toLowerCase())
      )
    )
  }, [alumnos, alumnoSearch])

  useEffect(() => {
    setFilteredProfesores(
      profesores.filter(profesor =>
        profesor.nombre.toLowerCase().includes(profesorSearch.toLowerCase())
      )
    )
  }, [profesores, profesorSearch])

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

  const fetchTaskData = async (id: string | null, tipo: string) => {
    if (id === null) {
      console.error('ID de tarea no proporcionado');
      setErrorMessage('Error al cargar los datos de la tarea: ID no proporcionado');
      return;
    }

    try {
      const { data: taskData, error: taskError } = await supabase
        .from(tipo)
        .select('*')
        .eq('identificador', id)
        .single()

      if (taskError) throw taskError

      if (taskData) {
        const { data: stepsData, error: stepsError } = await supabase
          .from('Pasos')
          .select('*')
          .eq('id_tarea', id)
          .order('identificador', { ascending: true })

        if (stepsError) throw stepsError

        form.reset({
          ...taskData,
          tipo_tarea: tipo,
          fecha_inicio: new Date(taskData.fecha_inicio).toISOString().slice(0, 19),
          fecha_fin: new Date(taskData.fecha_fin).toISOString().slice(0, 19),
          id_alumno: taskData.id_alumno ? taskData.id_alumno.toString() : undefined,
          aula_destino: taskData.aula_destino ? taskData.aula_destino.toString() : undefined,
          id_profesor: taskData.id_profesor ? taskData.id_profesor.toString() : undefined,
          pasos: stepsData || [],
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
        id_alumno: values.id_alumno ? parseInt(values.id_alumno) : null,
        id_profesor: values.id_profesor ? parseInt(values.id_profesor) : null,
        aula_destino: values.aula_destino ? parseInt(values.aula_destino) : null,
      }

      let newTaskId: string | number | null = taskId;
      const { error } = newTaskId
        ? await supabase.from(values.tipo_tarea).update(taskData).eq('identificador', newTaskId)
        : await supabase.from(values.tipo_tarea).insert(taskData);

      if (error) throw error;

      // Handle steps for Tarea_Pasos (unchanged)
      if (values.tipo_tarea === 'Tarea_Pasos') {
        if (values.pasos && values.pasos.length > 0) {
          const stepsWithTaskId = values.pasos.map(step => ({
            ...step,
            id_tarea: newTaskId
          }));

          if (newTaskId) {
            // Delete existing steps
            await supabase.from('Pasos').delete().eq('id_tarea', newTaskId);
          }

          // Insert new steps
          const { error: stepsError } = await supabase.from('Pasos').insert(stepsWithTaskId);
          if (stepsError) throw stepsError;
        }
      }

      setSuccessMessage(newTaskId ? 'Tarea actualizada correctamente.' : 'Tarea creada correctamente.')
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
        {searchParams.get('id') ? 'Modificar Tarea' : 'Añadir Nueva Tarea'}
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
                  <Select onValueChange={field.onChange} value={field.value} disabled={!!searchParams.get('id')}>
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
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <Input
                        placeholder="Buscar alumno..."
                        value={alumnoSearch}
                        onChange={(e) => setAlumnoSearch(e.target.value)}
                        className="flex-grow"
                      />
                      <Search className="w-5 h-5 text-gray-400" />
                    </div>
                    <Select
                      onValueChange={(value) => field.onChange(value)}
                      value={field.value}
                      defaultValue=""
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Selecciona un alumno" />
                      </SelectTrigger>
                      <SelectContent>
                        {filteredAlumnos.map((alumno) => (
                          <SelectItem
                            key={alumno.identificador}
                            value={alumno.identificador.toString()}
                          >
                            {alumno.nombre}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
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

          {form.watch('tipo_tarea') === 'Tarea_Menu' && (
            <></>
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
            </>
          )}

          {form.watch('tipo_tarea') === 'Tarea_Pasos' && (
            <div className="space-y-4">
              <h2 className="text-xl font-semibold">Pasos de la Tarea</h2>
              {fields.map((field, index) => (
                <Card key={field.id}>
                  <CardHeader>
                    <CardTitle className="flex justify-between items-center">
                      <span>Paso {index + 1}</span>
                      <Button
                        type="button"
                        variant="destructive"
                        size="sm"
                        onClick={() => setStepToDelete(index)}
                      >
                        <Trash className="h-4 w-4" />
                      </Button>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <StepForm form={form} index={index} />
                  </CardContent>
                </Card>
              ))}
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => append({ texto: '', imagen: '', audio: '', video: '', pictograma: '' })}
              >
                <Plus className="h-4 w-4 mr-2" />
                Agregar Paso
              </Button>

              <AlertDialog open={stepToDelete !== null} onOpenChange={() => setStepToDelete(null)}>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
                    <AlertDialogDescription>
                      Esta acción no se puede deshacer. Esto eliminará permanentemente el paso de la tarea.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancelar</AlertDialogCancel>
                    <AlertDialogAction onClick={() => {
                      if (stepToDelete !== null) {
                        remove(stepToDelete)
                        setStepToDelete(null)
                      }
                    }}>
                      Eliminar
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          )}

          <Button type="submit" className="w-full bg-green-600 hover:bg-green-700 text-white" disabled={isLoading}>
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                {searchParams.get('id') ? 'Actualizando tarea...' : 'Añadiendo tarea...'}
              </>
            ) : (
              searchParams.get('id') ? 'Actualizar Tarea' : 'Añadir Tarea'
            )}
          </Button>
        </form>
      </Form>
    </div>
  )
}

