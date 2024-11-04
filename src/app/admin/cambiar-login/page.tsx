"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { Alumno, TipoLogin } from "@/lib/types";
import { getAlumnos, setLoginForAlumno } from "@/lib/supabase/queries/alumnos";
import { useRouter } from "next/navigation";

export default function CambiarLogin() {
  const router = useRouter();

  const [alumnos, setAlumnos] = useState<Alumno[]>([]);
  const [alumnoSeleccionado, setAlumnoSeleccionado] = useState<Alumno>();
  const [tipoLoginSeleccionado, setTipoLoginSeleccionado] =
    useState<TipoLogin>();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setError(null);
    updateAlumnosList();
  }, []);

  const updateAlumnosList = async () => {
    try {
      const data = await getAlumnos();
      setAlumnos(data);
    } catch (error: any) {
      console.error(error);
      setError(error.message);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!alumnoSeleccionado || !tipoLoginSeleccionado) {
      setError("Por favor, selecciona un alumno y un tipo de login");
      return;
    }

    console.log(
      "Alumno:",
      alumnoSeleccionado,
      "Nuevo tipo de login:",
      tipoLoginSeleccionado
    );

    try {
      setLoginForAlumno(alumnoSeleccionado.id, tipoLoginSeleccionado).then(
        () => {
          router.push('/admin')
        }
      );
    } catch (e: any) {
      setError(
        "No se ha podido actualizar el alumno, espere unos segundos o contacte con un administrador"
      );
      return;
    }
  };

  return (
    <div className="min-h-screen bg-white md:bg-gradient-to-br md:from-blue-100 md:via-purple-100 md:to-pink-100 flex items-center justify-center p-4">
      <main className="bg-white rounded-lg shadow-lg p-4 md:p-8 w-full md:max-w-md">
        <h1 className="text-2xl md:text-3xl font-bold mb-6 text-center text-gray-900">
          Cambiar Tipo de Login
        </h1>
        <nav className="mb-8">
          <Link href="/admin" passHref>
            <Button
              variant="outline"
              className="w-full text-base md:text-lg bg-yellow-400 hover:bg-yellow-500"
              aria-label="Volver"
            >
              <ArrowLeft
                className="mr-2 h-4 w-4 md:h-5 md:w-5"
                aria-hidden="true"
              />
              Volver
            </Button>
          </Link>
        </nav>
        <form onSubmit={handleSubmit} className="space-y-6 md:space-y-8">
          <div className="space-y-2 md:space-y-3">
            <Label
              htmlFor="alumno"
              className="text-base md:text-lg font-medium text-gray-900"
            >
              Seleccionar Alumno
            </Label>
            <Select
              value={
                alumnoSeleccionado
                  ? alumnoSeleccionado.id.toString()
                  : undefined
              }
              onValueChange={(value) => {
                const alumno: Alumno | undefined = alumnos.find(
                  (alumno) => alumno.id === parseInt(value)
                );
                if (alumno != undefined) {
                  setAlumnoSeleccionado(alumno);
                }
              }}
            >
              <SelectTrigger id="alumno" className="text-base md:text-lg">
                <SelectValue placeholder="Seleccione un alumno" />
              </SelectTrigger>
              <SelectContent>
                {alumnos.map((alumno) => (
                  <SelectItem
                    key={alumno.id}
                    value={alumno.id.toString()}
                    className="text-base md:text-lg"
                  >
                    {alumno.nombre_apellido}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2 md:space-y-3">
            <Label
              htmlFor="tipoLogin"
              className="text-base md:text-lg font-medium text-gray-900"
            >
              Tipo de Login
            </Label>
            <Select
              value={tipoLoginSeleccionado}
              onValueChange={(value) => {
                setTipoLoginSeleccionado(value as TipoLogin);
                console.log(`Cambiado tipo de login a ${value}`);
              }}
            >
              <SelectTrigger id="tipoLogin" className="text-base md:text-lg">
                <SelectValue placeholder="Seleccione un tipo de login" />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(TipoLogin).map(([key, value]) => (
                  <SelectItem
                    key={key}
                    value={value}
                    className="text-base md:text-lg"
                  >
                    {value}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          {error && <p className="text-red-500 text-sm">{error}</p>}
          <Button
            type="submit"
            className="w-full text-base md:text-lg bg-blue-600 hover:bg-blue-700 text-white"
            aria-label="Aplicar cambios de tipo de login"
          >
            Aplicar Cambios
          </Button>
        </form>
      </main>
    </div>
  );
}
