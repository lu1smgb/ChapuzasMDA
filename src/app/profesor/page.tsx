'use client'

import { LogOut, Eye, PartyPopper } from 'lucide-react';
import { Button } from "@/components/ui/button"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';

// Tipo usado en la lista de alumnos
interface Alumno {
  identificador: number;
  nombre: string;
  imagen_perfil: string;
}

export default function Profesor() {

  // Nombre del profesor
  const [nombreProfesor, setNombreProfesor] = useState<string | null>('');
  // Aula del profesor
  const [aula, setAula] = useState<string | null>('');
  // Lista de alumnos
  const [alumnos, setAlumnos] = useState<Alumno[]>([]);

  // Objeto necesario para la navegacion en la pagina
  const router = useRouter();

  // Funcion llamada cuando se cierra sesion
  const handleLogout = () => {
    console.log('LOGOUT')
    localStorage.removeItem('profName'); // Eliminar el nombre del profesor del localStorage
    router.push('/login'); // Redirigir a la página de inicio de sesión
  };

  // Obtiene el nombre del profesor en base a las cookies del navegador 
  const getNombreProfesor = () => {
    return localStorage.getItem('profName') || '';
  }

  // Obtiene el aula del profesor y la muestra en el componente correspondiente
  const mostrarAula = async () => {
    
    try {
      const _nombre = getNombreProfesor();
      const { data, error } = await supabase
        .from('Profesor')
        .select('aula')
        .eq('nombre', _nombre)
        .single()
      console.log('AULA', data, error)
      setAula(data?.aula);
    }
    catch (error) {
      console.error('AULA', error)
      setAula('ERROR');
    }

  }

  // Obtiene los datos de los alumnos del aula correspondiente y los muestra en la interfaz
  const mostrarAlumnos = async () => {
    const _nombre = getNombreProfesor();
    let _aula = '';
    try {
      const { data, error } = await supabase
        .from('Profesor')
        .select('aula')
        .eq('nombre', _nombre)
        .single()
      console.log(data, error);
      _aula = data?.aula;
    } catch (error) {
      console.error(error);
    }
    try {
      const { data, error } = await supabase
        .from('Alumno')
        .select('identificador, nombre, imagen_perfil')
        .eq('aula', _aula)
      console.log(data, error)
      setAlumnos(data as Alumno[]);
    }
    catch (error) {
      console.error(error)
    }
  }

  // Obtiene y muestra los datos necesarios
  useEffect(() => {
    setNombreProfesor(getNombreProfesor());
    mostrarAula();
    mostrarAlumnos();
  }, []);

  // Maquetado de la interfaz
  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-100 to-purple-100">
      <div className="min-h-screen p-6 flex flex-col">
        <header className="flex justify-between items-center mb-8">
          <div className="flex items-center space-x-2">
            <h1 className="text-4xl font-bold">Bienvenido, {nombreProfesor}!</h1>
            <PartyPopper className="h-6 w-6 text-yellow-500" />
          </div>
          <Button variant="destructive" size="lg" onClick={handleLogout}>
            <LogOut className="mr-2 h-5 w-5"/> Cerrar sesión
          </Button>
        </header>
        
        <div className="flex-grow flex items-center justify-center">
          <div className="w-full max-w-4xl space-y-6">
            <Card className="w-full">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-2xl font-semibold">Alumnos</CardTitle>
                <CardTitle className="text-xl font-medium text-muted-foreground">Aula {aula}</CardTitle>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[50vh] w-full pr-4">
                  <ul className="space-y-4">
                    {alumnos.map((alumno) => (
                      <li key={alumno.identificador} className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                          <img src={alumno.imagen_perfil} alt={alumno.nombre} className="w-10 h-10 rounded-full" />
                          <span className="text-lg">{alumno.nombre}</span>
                        </div>
                        <Button 
                          onClick={() => router.push(`/admin/gestionarAlumno/seguimiento-alum?id=${alumno.identificador}`)}
                          variant="outline" 
                          className="bg-yellow-500 hover:bg-yellow-600 text-white border-none">
                          <Eye className="mr-2 h-4 w-4" /> Ver seguimiento
                        </Button>
                      </li>
                    ))}
                  </ul>
                </ScrollArea>
              </CardContent>
            </Card>

            <Card className="w-full">
              <CardContent className="flex items-center justify-center py-8">
                <Button 
                  onClick={() => router.push('/profesor/solicitud-material')}
                  size="lg" 
                  className="text-xl px-8 py-6 bg-purple-600">
                  Solicitar material
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </main>
  );
}

