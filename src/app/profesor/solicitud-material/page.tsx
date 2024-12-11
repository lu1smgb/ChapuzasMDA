'use client'

import { useState, useEffect } from 'react'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm, useFieldArray } from 'react-hook-form'
import * as z from 'zod'
import { Button } from '@/components/ui/button'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { createClient } from '@supabase/supabase-js'
import { useRouter, useSearchParams } from 'next/navigation'
import { Alert, AlertDescription } from "@/components/ui/alert"
import { ArrowLeft, Loader2, Search, Plus, Trash, ImageIcon } from 'lucide-react'
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
} from "@/components/ui/alert-dialog"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseAnonKey);


// Esquema de validación del formulario utilizando Zod
const formSchema = z.object({
  fecha_inicio: z.string().nonempty('La fecha de inicio es obligatoria'), // Validación: la fecha de inicio no puede estar vacía
  fecha_fin: z.string().nonempty('La fecha de fin es obligatoria'), // Validación: la fecha de fin no puede estar vacía
  nombre: z.string().min(2, { 
    message: 'El nombre debe tener al menos 2 caracteres.' 
  }), // El nombre debe tener al menos 2 caracteres
  descripcion: z.string().optional(), // Descripción opcional de la tarea
  id_alumno: z.string().optional(), // ID del alumno asociado (opcional)
  // Campos específicos para tareas de tipo "Material"
  nombres_materiales: z.string().optional(),
  cantidades_materiales: z.string().optional(),
  id_profesor: z.string().optional(),
  imagen_tarea: z.string().optional(), // Imagen asociada a la tarea (opcional)
  // Campos para otros tipos de tareas
  enlace: z.string().optional(), // Enlace (opcional)
  pasos: z.array(z.object({
    texto: z.string().optional(), // Texto de un paso (opcional)
    imagen: z.string().optional(), // Imagen asociada al paso
    audio: z.string().optional(), // Archivo de audio asociado al paso
    video: z.string().optional(), // Video asociado al paso
    pictograma: z.string().optional(), // Pictograma opcional
  })).optional(),
}).refine(data => {
  // Validación personalizada: la fecha de fin debe ser igual o posterior a la de inicio
  const inicio = new Date(data.fecha_inicio);
  const fin = new Date(data.fecha_fin);
  return fin >= inicio;
}, {
  message: "La fecha de fin debe ser igual o posterior a la fecha de inicio",
  path: ["fecha_fin"], // Campo al que se aplicará el error
});

export default function FormularioTarea() {
  // Estados para manejar datos de alumnos, profesores, y otros valores del formulario
  const [alumnos, setAlumnos] = useState<{ identificador: string; nombre: string }[]>([]);
  const [profesores, setProfesores] = useState<{ identificador: string; nombre: string }[]>([]);
  const [filteredAlumnos, setFilteredAlumnos] = useState<{ identificador: string; nombre: string }[]>([]);
  const [filteredProfesores, setFilteredProfesores] = useState<{ identificador: string; nombre: string }[]>([]);
  const [alumnoSearch, setAlumnoSearch] = useState(''); // Filtro de búsqueda para alumnos
  const [profesorSearch, setProfesorSearch] = useState(''); // Filtro de búsqueda para profesores
  const [isLoading, setIsLoading] = useState(false); // Indicador de carga
  const [successMessage, setSuccessMessage] = useState<string | null>(null); // Mensaje de éxito
  const [errorMessage, setErrorMessage] = useState<string | null>(null); // Mensaje de error
  const router = useRouter(); // Para redireccionar entre páginas
  const searchParams = useSearchParams(); // Para obtener parámetros de la URL
  const [taskId, setTaskId] = useState<string | null | number>(searchParams.get('id')); // ID de la tarea actual
  const taskType = searchParams.get('tipo'); // Tipo de tarea actual
  const [stepToDelete, setStepToDelete] = useState<number | null>(null); // Paso a eliminar
  const [imagePreview, setImagePreview] = useState<string | null>(null); // Vista previa de la imagen

  const getProfessorIdAndAula = async (profName: string) => {
    const { data, error } = await supabase
      .from('Profesor')
      .select('identificador, aula')
      .eq('nombre', profName)
      .single();

    if (error) {
      console.error('Error fetching professor:', error);
      return null;
    }
    return data;
  };


  // Configuración del formulario con react-hook-form y validación con Zod
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      fecha_inicio: new Date().toISOString().slice(0, 16), // Establece la fecha y hora actual
      fecha_fin: '',
      nombre: '',
      descripcion: '',
      imagen_tarea: '',
      id_alumno: '',
      enlace: '',
      nombres_materiales: '',
      cantidades_materiales: '',
      id_profesor: '',
      pasos: [],
    },
  });

  useEffect(() => {
    // Carga inicial de datos al montar el componente
    fetchAlumnos(); // Obtener lista de alumnos
    //fetchProfesores(); // Obtener lista de profesores
  }, [taskType, searchParams]);

  useEffect(() => {
    // Actualiza la lista de alumnos filtrados según el término de búsqueda
    setFilteredAlumnos(
      alumnos.filter(alumno =>
        alumno.nombre.toLowerCase().includes(alumnoSearch.toLowerCase())
      )
    );
  }, [alumnos, alumnoSearch]);

  useEffect(() => {
    form.setValue('fecha_inicio', new Date().toISOString().slice(0, 16));
  }, []);


  // Función para obtener alumnos
  const fetchAlumnos = async () => {
    try {
      const { data, error } = await supabase
        .from('Alumno')
        .select('identificador, nombre');

      if (error) throw error;

      setAlumnos(data || []);
    } catch (error) {
      console.error('Error al obtener los alumnos:', error);
      setErrorMessage('Error al cargar la lista de alumnos.');
    }
  };

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      try {
        setIsLoading(true);
        // Generar un nombre de archivo único
        const fileExt = file.name.split('.').pop();
        const fileName = `${Date.now()}.${fileExt}`;
        const filePath = `tareas/${fileName}`;
  
        // Subir imagen a Supabase Storage
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('ImagenesPrueba')
          .upload(filePath, file);
  
        if (uploadError) throw uploadError;
  
        // Obtener la URL pública de la imagen
        const { data } = supabase.storage
          .from('ImagenesPrueba')
          .getPublicUrl(filePath);
  
        // Establecer la URL de la imagen en el formulario
        form.setValue('imagen_tarea', data.publicUrl);
        setImagePreview(data.publicUrl);
      } catch (error) {
        console.error('Error al subir la imagen:', error);
        setErrorMessage('Error al subir la imagen');
      } finally {
        setIsLoading(false);
      }
    }
  };

  useEffect(() => {
    const subscription = form.watch((value, { name }) => {
      if (name === 'imagen_tarea' && value.imagen_tarea) {
        setImagePreview(value.imagen_tarea);
      }
    });
    return () => subscription.unsubscribe();
  }, [form]);

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true);
    setErrorMessage(null);
    setSuccessMessage(null);

    try {
      const profName = localStorage.getItem('profName');
      const professorData = await getProfessorIdAndAula(profName!);

      if (!professorData) {
        throw new Error('Professor not found');
      }

      // Preparar datos de la tarea
      const taskData: any = {
        fecha_inicio: new Date(values.fecha_inicio).toISOString(),
        fecha_fin: new Date(values.fecha_fin).toISOString(),
        nombre: values.nombre,
        descripcion: values.descripcion,
        imagen_tarea: values.imagen_tarea,
        id_alumno: values.id_alumno ? parseInt(values.id_alumno) : null,
        nombres_materiales: values.nombres_materiales,
        cantidades_materiales: values.cantidades_materiales,
        aula_destino: professorData.aula,
        id_profesor: professorData.identificador
      };


      // Insertar o actualizar tarea
      const { data, error } = taskId
        ? await supabase
          .from('Tarea_Material')
          .update(taskData)
          .eq('identificador', taskId)
        : await supabase
          .from('Tarea_Material')
          .insert(taskData)
          .select('identificador');

      if (error) throw error;

      setSuccessMessage(taskId ? 'Tarea actualizada correctamente.' : 'Solicitud realizada correctamente.');
      setTimeout(() => {
        router.push('.');
      }, 2000);
    } catch (error) {
      console.error('Error al realizar la solicitud:', error);
      setErrorMessage('Error al realizar la solicitud. Por favor, inténtelo de nuevo.');
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="bg-white rounded-lg shadow-lg p-4 md:p-8 w-full max-w-4xl mx-auto">
      {/* Navegación de retorno */}
      <nav className="mb-4">
        <Button
          onClick={() => router.back()}
          variant="outline"
          className="text-base bg-yellow-400 hover:bg-yellow-500"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Volver
        </Button>
      </nav>

      {/* Título del formulario */}
      <h1 className="text-2xl font-bold mb-6 text-center text-gray-900">
        {searchParams.get('id') ? 'Modificar Tarea' : 'Solicitud de material'}
      </h1>

      {/* Mensajes de error */}
      {errorMessage && (
        <Alert variant="destructive" className="mb-4">
          <AlertDescription>{errorMessage}</AlertDescription>
        </Alert>
      )}

      {/* Mensajes de éxito */}
      {successMessage && (
        <Alert variant="default" className="mb-4 bg-green-100 text-green-800 border-green-300">
          <AlertDescription>{successMessage}</AlertDescription>
        </Alert>
      )}

      {/* Formulario principal */}
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">

            {/* Campo de Nombre */}
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

            {/* Fecha de Inicio */}
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

            {/* Fecha de Fin */}
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

            {/* Descripción */}
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
              name="imagen_tarea"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Imagen de la solicitud</FormLabel>
                  <div className="flex items-center space-x-4">
                    <Input
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="hidden"
                      id="task-image-upload"
                    />
                    <label
                      htmlFor="task-image-upload"
                      className="cursor-pointer flex items-center space-x-2 bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
                    >
                      <ImageIcon className="w-5 h-5" />
                      <span>Subir Imagen</span>
                    </label>
                    {imagePreview && (
                      <img
                        src={imagePreview}
                        alt="Vista previa"
                        className="w-24 h-24 object-cover rounded"
                      />
                    )}
                  </div>
                  <FormDescription>
                    Sube una imagen representativa para la solicitud
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Selector de Alumno */}
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

          {/* Campos específicos según el tipo de tarea */}
          {/* Tarea Material - Campos adicionales */}
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

          {/* Botón de submit */}
          <Button
            type="submit"
            className="w-full bg-green-600 hover:bg-green-700 text-white"
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                {searchParams.get('id') ? 'Actualizando tarea...' : 'Enviando solicitud...'}
              </>
            ) : (
              searchParams.get('id') ? 'Actualizar Tarea' : 'Solicitar material'
            )}
          </Button>
        </form>
      </Form>
    </div>
  )
}

