'use client';

import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ArrowLeft } from "lucide-react";
import Link from 'next/link';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseAnonKey);

interface Alumno {
  id: number;
  nombre_apellido: string;
}

export default function EliminarAlumno() {
  const [alumnos, setAlumnos] = useState<Alumno[]>([]);
  const [selectedAlumnoId, setSelectedAlumnoId] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  useEffect(() => {
    const fetchAlumnos = async () => {
      setIsLoading(true);
      setError('');
      try {
        const { data, error } = await supabase
          .from('Alumno')
          .select('id, nombre_apellido')
          .order('nombre_apellido', { ascending: true });

        if (error) throw error;
        setAlumnos(data || []);
      } catch (error) {
        console.error('Error fetching alumnos:', error);
        setError('Error al cargar los alumnos. Por favor, recargue la página.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchAlumnos();
  }, []);

  const handleAlumnoChange = (alumnoId: string) => {
    setSelectedAlumnoId(alumnoId);
    setSuccessMessage('');
    setError('');
  };

  const handleDelete = async () => {
    if (!selectedAlumnoId) {
      setError('Debe seleccionar un alumno para eliminar.');
      return;
    }

    setIsLoading(true);
    setError('');
    setSuccessMessage('');

    try {
      const { error } = await supabase
        .from('Alumno')
        .delete()
        .eq('id', selectedAlumnoId);

      if (error) throw error;

      setAlumnos(alumnos.filter(alumno => alumno.id.toString() !== selectedAlumnoId));
      setSuccessMessage('Alumno eliminado con éxito');
      setSelectedAlumnoId('');
    } catch (error) {
      console.error('Error deleting student:', error);
      setError('Error al eliminar el alumno. Por favor, intente de nuevo.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white md:bg-gradient-to-br md:from-blue-100 md:via-purple-100 md:to-pink-100 flex items-center justify-center p-4">
      <main className="bg-white rounded-lg shadow-lg p-4 md:p-8 w-full md:max-w-2xl">
        <h1 className="text-2xl md:text-3xl font-bold mb-6 text-center text-gray-900">Eliminar Alumno</h1>
        <nav className="mb-8">
          <Link href="/admin/gestionarAlumno" passHref>
            <Button variant="outline" className="w-full text-base md:text-lg bg-yellow-400 hover:bg-yellow-500" aria-label="Volver a gestionar alumnos">
              <ArrowLeft className="mr-2 h-4 w-4 md:h-5 md:w-5" aria-hidden="true" />
              Atrás
            </Button>
          </Link>
        </nav>
        {error && <p className="text-red-500 text-center mb-4" role="alert">{error}</p>}
        {successMessage && <p className="text-green-500 text-center mb-4" role="status">{successMessage}</p>}
        <div className="space-y-6 md:space-y-8">
          <div className="space-y-2 md:space-y-3">
            <Label htmlFor="alumno" className="text-base md:text-lg font-medium text-gray-900">
              Seleccionar Alumno
            </Label>
            <Select 
              value={selectedAlumnoId}
              onValueChange={handleAlumnoChange}
              disabled={isLoading}
            >
              <SelectTrigger id="alumno" className="text-base md:text-lg">
                <SelectValue placeholder="Seleccione un alumno para eliminar" />
              </SelectTrigger>
              <SelectContent>
                {alumnos.map((alumno) => (
                  <SelectItem key={alumno.id} value={alumno.id.toString()} className="text-base md:text-lg">
                    {alumno.nombre_apellido}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <Button 
            onClick={handleDelete}
            className="w-full text-base md:text-lg bg-red-600 hover:bg-red-700 text-white"
            aria-label="Eliminar alumno seleccionado"
            disabled={isLoading || !selectedAlumnoId}
          >
            {isLoading ? 'Eliminando...' : 'Eliminar Alumno'}
          </Button>
        </div>
      </main>
    </div>
  );
}
