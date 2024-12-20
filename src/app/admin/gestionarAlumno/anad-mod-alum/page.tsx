'use client'

import { useState, useEffect } from 'react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ArrowLeft, Eye, EyeOff, Loader2, X } from 'lucide-react'
import { createClient } from '@supabase/supabase-js'
import { useRouter, useSearchParams } from 'next/navigation'
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Checkbox } from "@/components/ui/checkbox"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseAnonKey);

interface Alumno {
  identificador: number; // Identificador único del alumno
  nombre: string; // Nombre del alumno
  imagen_perfil: string; // URL de la imagen de perfil del alumno
  credencial: string; // Credencial (contraseña o imágenes) del login del alumno
  aula: string; // Aula del alumno
  tipo_login: string; // Tipo de login (contraseña, imágenes, etc.)
  IU_Audio: boolean; // Indica si la interfaz de usuario usa audio
  IU_Video: boolean; // Indica si la interfaz de usuario usa video
  IU_Imagen: boolean; // Indica si la interfaz de usuario usa imágenes
  IU_Pictograma: boolean; // Indica si la interfaz de usuario usa pictogramas
  IU_Texto: boolean; // Indica si la interfaz de usuario usa texto
  numero_pasos: number; // Número de pasos configurados para el alumno
  numero_imagenes_login: number; // Número de imágenes necesarias para el login basado en imágenes
  imagenes_login: string; // Lista de imágenes para la interfaz de login
}

interface LoginImage {
  name: string; // Nombre del archivo de la imagen
  src: string; // URL de la imagen
  alt: string; // Descripción alternativa de la imagen
}

export default function StudentForm() {
  const [student, setStudent] = useState<Alumno | null>(null); // Alumno actual (para edición)
  const [name, setName] = useState(''); // Nombre del alumno
  const [password, setPassword] = useState(''); // Contraseña del alumno
  const [aula, setAula] = useState(''); // Aula del alumno
  const [image, setImage] = useState<File | null>(null); // Archivo de la imagen de perfil
  const [imagePreview, setImagePreview] = useState(''); // Vista previa de la imagen de perfil
  const [loginType, setLoginType] = useState(''); // Tipo de login seleccionado
  const [IU_Audio, setIU_Audio] = useState(false); // Configuración de IU con audio
  const [IU_Video, setIU_Video] = useState(false); // Configuración de IU con video
  const [IU_Imagen, setIU_Imagen] = useState(false); // Configuración de IU con imágenes
  const [IU_Pictograma, setIU_Pictograma] = useState(false); // Configuración de IU con pictogramas
  const [IU_Texto, setIU_Texto] = useState(false); // Configuración de IU con texto
  const [numeroPasos, setNumeroPasos] = useState(0); // Número de pasos
  const [showPassword, setShowPassword] = useState(false); // Mostrar/ocultar contraseña
  const [isLoading, setIsLoading] = useState(false); // Indica si la acción está en curso
  const [error, setError] = useState(''); // Mensaje de error
  const [success, setSuccess] = useState(''); // Mensaje de éxito
  const [loginImages, setLoginImages] = useState<LoginImage[]>([]); // Imágenes para el login
  const [interfaceLoginImages, setInterfaceLoginImages] = useState<LoginImage[]>([]); // Imágenes seleccionadas para la IU
  const [availableLoginImages, setAvailableLoginImages] = useState<LoginImage[]>([]); // Imágenes disponibles para el login
  const [numeroImagenesLogin, setNumeroImagenesLogin] = useState(0); // Número de imágenes necesarias para la IU de login
  const router = useRouter(); // Router para navegación
  const searchParams = useSearchParams(); // Parámetros de búsqueda
  const id = searchParams.get('id'); // ID del alumno a editar

  useEffect(() => {
    if (id) {
      fetchStudent(parseInt(id)); // Carga los datos del alumno si se proporciona un ID
    }
    fetchLoginImages(); // Carga las imágenes disponibles para login
  }, [id]);

  const fetchStudent = async (id: number) => {
    try {
      const { data, error } = await supabase
        .from("Alumno")
        .select("*")
        .eq('identificador', id)
        .single();

      if (error) throw error;

      setStudent(data); // Establece los datos del alumno
      setName(data.nombre);
      setPassword(data.credencial);
      setAula(data.aula);
      setImagePreview(data.imagen_perfil);
      setLoginType(data.tipo_login);
      setIU_Audio(data.IU_Audio);
      setIU_Video(data.IU_Video);
      setIU_Imagen(data.IU_Imagen);
      setIU_Pictograma(data.IU_Pictograma);
      setIU_Texto(data.IU_Texto);
      setNumeroPasos(data.numero_pasos);
      setNumeroImagenesLogin(data.numero_imagenes_login || 0);
      if (data.tipo_login === 'IMAGEN') {
        setLoginImages(data.credencial.split(',').map(translateImageName)); // Convierte los nombres de las imágenes
        setInterfaceLoginImages(data.imagenes_login ? data.imagenes_login.split(',').map(translateImageName) : []);
      }
    } catch (error) {
      console.error("Error al obtener el alumno:", error);
      setError('Error al cargar los datos del alumno.');
    }
  };

  const fetchLoginImages = async () => {
    try {
      const { data, error } = await supabase.storage
        .from('ImagenesPrueba')
        .list('login_alumno');

      if (error) throw error;

      const imageNames = data.map(file => translateImageName(file.name));
      setAvailableLoginImages(imageNames);
    } catch (error) {
      console.error("Error al obtener las imágenes de login:", error);
      setError('Error al cargar las imágenes de login.');
    }
  };

  const translateImageName = (filename: string): LoginImage => {
    return {
      name: filename,
      src: `${supabaseUrl}/storage/v1/object/public/ImagenesPrueba/login_alumno/${filename}`,
      alt: filename
    };
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const fileType = file.type;
      if (fileType === 'image/jpeg' || fileType === 'image/png' || fileType === 'image/jpg') {
        setImage(file); // Actualiza el archivo seleccionado
        setImagePreview(URL.createObjectURL(file)); // Genera una vista previa
      } else {
        setError('Por favor, seleccione una imagen en formato JPG, JPEG o PNG.');
      }
    }
  };

  const handleLoginImageSelect = (image: LoginImage, isInterfaceImage: boolean) => {
    if (isInterfaceImage) {
      setInterfaceLoginImages(prev => {
        const exists = prev.some(img => img.name === image.name);
        if (exists) {
          return prev.filter(img => img.name !== image.name);
        } else if (prev.length < numeroImagenesLogin) {
          return [...prev, image];
        } else {
          setError(`No se pueden seleccionar más de ${numeroImagenesLogin} imágenes para la interfaz de login.`);
          return prev;
        }
      });
    } else {
      setLoginImages(prev => {
        const exists = prev.some(img => img.name === image.name);
        if (exists) {
          return prev.filter(img => img.name !== image.name);
        } else {
          return [...prev, image];
        }
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    setSuccess('');

    if (!name || !aula || !loginType) {
      setError('Debe llenar todos los campos obligatorios.');
      setIsLoading(false);
      return;
    }

    if (loginType === 'IMAGEN' && loginImages.length === 0) {
      setError('Debe seleccionar al menos una imagen para la credencial.');
      setIsLoading(false);
      return;
    }

    if (loginType === 'IMAGEN' && interfaceLoginImages.length !== numeroImagenesLogin) {
      setError(`Debe seleccionar exactamente ${numeroImagenesLogin} imágenes para la interfaz de login.`);
      setIsLoading(false);
      return;
    }

    try {
      let imageUrl = student?.imagen_perfil || '';

      if (image) {
        const fileExt = image.name.split('.').pop();
        const fileName = `${Math.random()}.${fileExt}`;
        const filePath = `alumnos/${fileName}`;

        const { error: uploadError } = await supabase.storage
          .from('ImagenesPrueba')
          .upload(filePath, image);

        if (uploadError) throw uploadError;

        const { data: { publicUrl } } = supabase.storage
          .from('ImagenesPrueba')
          .getPublicUrl(filePath);

        imageUrl = publicUrl;
      }

      const studentData = {
        nombre: name,
        credencial: loginType === 'IMAGEN' ? loginImages.map(img => img.name).join(',') : password,
        aula,
        imagen_perfil: imageUrl,
        tipo_login: loginType,
        IU_Audio,
        IU_Video,
        IU_Imagen,
        IU_Pictograma,
        IU_Texto,
        numero_pasos: numeroPasos,
        numero_imagenes_login: numeroImagenesLogin,
        imagenes_login: interfaceLoginImages.map(img => img.name).join(',')
      };

      let operation;
      if (student) {
        // If we're editing an existing student, use update
        operation = supabase
          .from('Alumno')
          .update(studentData)
          .eq('identificador', student.identificador);
      } else {
        // If we're creating a new student, use insert
        operation = supabase
          .from('Alumno')
          .insert(studentData);
      }

      const { error: upsertError } = await operation;

      if (upsertError) throw upsertError;

      setSuccess(student ? 'Alumno modificado exitosamente.' : 'Alumno añadido exitosamente.');
      setTimeout(() => {
        router.push('.');
      }, 2000);
    } catch (error) {
      console.error("Error al guardar el alumno:", error);
      setError('Error al guardar el alumno. Inténtelo nuevamente.');
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
        {student ? 'Modificar Alumno' : 'Añadir Nuevo Alumno'}
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
            <Label htmlFor="nombre">Nombre del Alumno</Label>
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
              placeholder="Ej: Aula 2"
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
          <div className="space-y-2">
            <Label htmlFor="loginType">Tipo de Login</Label>
            <Select value={loginType} onValueChange={setLoginType}>
              <SelectTrigger>
                <SelectValue placeholder="Seleccione tipo de login" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="PIN">PIN</SelectItem>
                <SelectItem value="CONTRASEÑA">CONTRASEÑA</SelectItem>
                <SelectItem value="IMAGEN">IMAGEN</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="numeroPasos">Número de Pasos</Label>
            <Input
              id="numeroPasos"
              type="number"
              value={numeroPasos}
              onChange={(e) => setNumeroPasos(parseInt(e.target.value))}
              required
            />
          </div>
        </div>
        {loginType === 'IMAGEN' && (
          <div className="space-y-2">
            <Label htmlFor="numeroImagenesLogin">Número de Imágenes para Login</Label>
            <Input
              id="numeroImagenesLogin"
              type="number"
              value={numeroImagenesLogin}
              onChange={(e) => setNumeroImagenesLogin(parseInt(e.target.value))}
              min={1}
              required
            />
          </div>
        )}
        <div className="space-y-2">
          <Label htmlFor="password">Credencial</Label>
          {loginType === 'IMAGEN' ? (
            <div>
              <h3 className="font-semibold mb-2">Imágenes para la Credencial</h3>
              <div className="grid grid-cols-3 gap-2 mb-2">
                {loginImages.map((img, index) => (
                  <div key={index} className="relative">
                    <img
                      src={img.src}
                      alt={img.alt}
                      className="w-full h-20 object-cover rounded"
                    />
                    <button
                      type="button"
                      onClick={() => handleLoginImageSelect(img, false)}
                      className="absolute top-0 right-0 bg-red-500 text-white rounded-full p-1"
                      aria-label={`Remove ${img.name}`}
                    >
                      <X size={16} />
                    </button>
                  </div>
                ))}
              </div>
              <Select
                value=""
                onValueChange={(value) => handleLoginImageSelect(JSON.parse(value), false)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Añadir imagen de credencial" />
                </SelectTrigger>
                <SelectContent>
                  {availableLoginImages.map((img, index) => (
                    <SelectItem key={index} value={JSON.stringify(img)}>{img.name.replace(/\.[^/.]+$/, "")}</SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <h3 className="font-semibold mt-4 mb-2">Imágenes para la Interfaz de Login</h3>
              <div className="grid grid-cols-3 gap-2 mb-2">
                {interfaceLoginImages.map((img, index) => (
                  <div key={index} className="relative">
                    <img
                      src={img.src}
                      alt={img.alt}
                      className="w-full h-20 object-cover rounded"
                    />
                    <button
                      type="button"
                      onClick={() => handleLoginImageSelect(img, true)}
                      className="absolute top-0 right-0 bg-red-500 text-white rounded-full p-1"
                      aria-label={`Remove ${img.name}`}
                    >
                      <X size={16} />
                    </button>
                  </div>
                ))}
              </div>
              <Select
                value=""
                onValueChange={(value) => handleLoginImageSelect(JSON.parse(value), true)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Añadir imagen de interfaz de login" />
                </SelectTrigger>
                <SelectContent>
                  {availableLoginImages.map((img, index) => (
                    <SelectItem key={index} value={JSON.stringify(img)}>{img.name.replace(/\.[^/.]+$/, "")}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          ) : (
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="pr-10"
                placeholder={loginType === 'PIN' ? 'PIN' : 'Contraseña'}
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
          )}
        </div>
        <div className="space-y-2">
          <Label>Interfaz de Usuario</Label>
          <div className="flex flex-wrap gap-4">
            <div className="flex items-center space-x-2">
              <Checkbox id="IU_Audio" checked={IU_Audio} onCheckedChange={(checked) => setIU_Audio(checked as boolean)} />
              <Label htmlFor="IU_Audio">Audio</Label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox id="IU_Video" checked={IU_Video} onCheckedChange={(checked) => setIU_Video(checked as boolean)} />
              <Label htmlFor="IU_Video">Video</Label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox id="IU_Imagen" checked={IU_Imagen} onCheckedChange={(checked) => setIU_Imagen(checked as boolean)} />
              <Label htmlFor="IU_Imagen">Imagen</Label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox id="IU_Pictograma" checked={IU_Pictograma} onCheckedChange={(checked) => setIU_Pictograma(checked as boolean)} />
              <Label htmlFor="IU_Pictograma">Pictograma</Label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox id="IU_Texto" checked={IU_Texto} onCheckedChange={(checked) => setIU_Texto(checked as boolean)} />
              <Label htmlFor="IU_Texto">Texto</Label>
            </div>
          </div>
        </div>
        <Button type="submit" className="w-full bg-green-600 hover:bg-green-700 text-white" disabled={isLoading}>
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              {student ? 'Guardando cambios...' : 'Añadiendo alumno...'}
            </>
          ) : (
            student ? 'Guardar Cambios' : 'Añadir Alumno'
          )}
        </Button>
      </form>
    </div>
  )
}

