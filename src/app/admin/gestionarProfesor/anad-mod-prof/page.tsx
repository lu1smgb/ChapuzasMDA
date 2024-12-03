'use client'

import { useState, useEffect } from 'react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ArrowLeft, Eye, EyeOff, Loader2 } from 'lucide-react'
import { createClient } from '@supabase/supabase-js'
import { useRouter, useSearchParams } from 'next/navigation'
import { Alert, AlertDescription } from "@/components/ui/alert"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseAnonKey);


interface Profesor {
  identificador: number;
  nombre: string;
  imagen_perfil: string;
  credencial: string;
  aula: string;
}

export default function TeacherForm() {
  // Estados para manejar los datos del formulario y su comportamiento.
  const [teacher, setTeacher] = useState<Profesor | null>(null); // Almacena los datos del profesor si se está editando uno existente.
  const [name, setName] = useState(''); // Nombre del profesor.
  const [password, setPassword] = useState(''); // Credencial o contraseña del profesor.
  const [aula, setAula] = useState(''); // Aula asignada al profesor.
  const [image, setImage] = useState<File | null>(null); // Archivo de imagen seleccionado.
  const [imagePreview, setImagePreview] = useState(''); // URL de previsualización de la imagen seleccionada.
  const [showPassword, setShowPassword] = useState(false); // Controla si mostrar u ocultar la contraseña.
  const [isLoading, setIsLoading] = useState(false); // Indica si se está procesando el envío del formulario.
  const [error, setError] = useState(''); // Almacena los mensajes de error.
  const [success, setSuccess] = useState(''); // Almacena los mensajes de éxito.

  const router = useRouter(); // Para manejar la navegación.
  const searchParams = useSearchParams(); // Para obtener los parámetros de búsqueda de la URL.
  const id = searchParams.get('id'); // Obtiene el ID del profesor si se está editando.

  // Efecto que se ejecuta al cargar el componente o si cambia el ID en los parámetros de la URL.
  useEffect(() => {
    if (id) {
      fetchTeacher(parseInt(id)); // Llama a la función para obtener los datos del profesor a editar.
    }
  }, [id]);

  // Obtiene los datos del profesor desde Supabase según su ID.
  const fetchTeacher = async (id: number) => {
    try {
      const { data, error } = await supabase
        .from("Profesor")
        .select("*")
        .eq('identificador', id)
        .single(); // Obtiene un solo registro.

      if (error) throw error;

      setTeacher(data); // Guarda los datos del profesor en el estado.
      setName(data.nombre); // Establece el nombre del profesor en el formulario.
      setPassword(data.credencial); // Establece la credencial del profesor en el formulario.
      setAula(data.aula); // Establece el aula del profesor en el formulario.
      setImagePreview(data.imagen_perfil); // Establece la imagen actual del profesor.
    } catch (error) {
      console.error("Error al obtener el profesor:", error); // Muestra el error en consola.
      setError('Error al cargar los datos del profesor.'); // Muestra un mensaje de error.
    }
  };

  // Maneja el cambio del archivo de imagen seleccionado.
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]; // Obtiene el archivo seleccionado.
    if (file) {
      const fileType = file.type; // Verifica el tipo de archivo.
      if (fileType === 'image/jpeg' || fileType === 'image/png' || fileType === 'image/jpg') {
        setImage(file); // Guarda el archivo en el estado.
        setImagePreview(URL.createObjectURL(file)); // Genera una URL para previsualizar la imagen.
      } else {
        setError('Por favor, seleccione una imagen en formato JPG, JPEG o PNG.'); // Muestra un error si el formato es incorrecto.
      }
    }
  };

  // Maneja el envío del formulario, ya sea para crear o actualizar un profesor.
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); // Previene el comportamiento predeterminado del formulario.
    setIsLoading(true); // Activa el estado de carga.
    setError(''); // Limpia cualquier mensaje de error previo.
    setSuccess(''); // Limpia cualquier mensaje de éxito previo.

    // Verifica que todos los campos requeridos estén completos.
    if (!name || !password || !aula) {
      setError('Debe llenar todos los campos obligatorios.');
      setIsLoading(false); // Desactiva el estado de carga.
      return;
    }

    try {
      let imageUrl = teacher?.imagen_perfil || ''; // Usa la imagen existente si no se seleccionó una nueva.

      // Si se seleccionó una nueva imagen, la sube al almacenamiento.
      if (image) {
        const fileExt = image.name.split('.').pop(); // Obtiene la extensión del archivo.
        const fileName = `${Math.random()}.${fileExt}`; // Genera un nombre único para el archivo.
        const filePath = `profesores/${fileName}`; // Define la ruta de almacenamiento.

        const { error: uploadError } = await supabase.storage
          .from('ImagenesPrueba')
          .upload(filePath, image); // Sube el archivo a Supabase.

        if (uploadError) throw uploadError;

        const { data: { publicUrl } } = supabase.storage
          .from('ImagenesPrueba')
          .getPublicUrl(filePath); // Obtiene la URL pública de la imagen.

        imageUrl = publicUrl; // Actualiza la URL de la imagen.
      }

      // Si se está editando un profesor, actualiza sus datos.
      if (teacher) {
        const { error } = await supabase
          .from('Profesor')
          .update({
            nombre: name,
            credencial: password,
            aula,
            imagen_perfil: imageUrl,
          })
          .eq('identificador', teacher.identificador);

        if (error) throw error;

        setSuccess('Profesor modificado correctamente.'); // Muestra un mensaje de éxito.
      } else {
        // Si no hay un profesor existente, crea uno nuevo.
        const { error } = await supabase
          .from("Profesor")
          .insert({
            nombre: name,
            credencial: password,
            aula: aula,
            imagen_perfil: imageUrl,
          });

        if (error) throw error;

        setSuccess('Profesor añadido correctamente.'); // Muestra un mensaje de éxito.
      }

      // Redirige a la página principal después de 2 segundos.
      setTimeout(() => {
        router.push('.');
      }, 2000);
    } catch (error) {
      console.error("Error al guardar el profesor:", error); // Muestra el error en consola.
      setError('Error al guardar el profesor. Por favor, inténtelo de nuevo.'); // Muestra un mensaje de error.
    } finally {
      setIsLoading(false); // Desactiva el estado de carga.
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
        {teacher ? 'Modificar Profesor' : 'Añadir Nuevo Profesor'}
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
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="nombre">Nombre del Profesor</Label>
            <Input
              id="nombre"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Nombre completo"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="aula">Aula</Label>
            <Input
              id="aula"
              value={aula}
              onChange={(e) => setAula(e.target.value)}
              placeholder="Ej: Aula 3"
              required
            />
          </div>
          <div className="space-y-2 col-span-2">
            <Label htmlFor="image">Imagen de Perfil</Label>
            <div className="flex items-center justify-center w-full h-32 border-2 border-dashed border-gray-300 rounded-lg relative">
              {imagePreview ? (
                <img
                  src={imagePreview}
                  alt="Imagen de perfil"
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
        </div>
        <div className="space-y-2">
          <Label htmlFor="password">Credencial</Label>
          <div className="relative">
            <Input
              id="password"
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="pr-10"
              placeholder="Credencial"
              required
            />
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="absolute right-0 top-0 h-full px-3"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </Button>
          </div>
        </div>
        <Button type="submit" className="w-full bg-green-600 hover:bg-green-700 text-white" disabled={isLoading}>
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              {teacher ? 'Guardando cambios...' : 'Añadiendo profesor...'}
            </>
          ) : (
            teacher ? 'Guardar Cambios' : 'Añadir Profesor'
          )}
        </Button>
      </form>
    </div>
  )
}

