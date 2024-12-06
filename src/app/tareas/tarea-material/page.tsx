'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { motion } from 'framer-motion'
import { supabase } from '@/lib/supabase'
import confetti from 'canvas-confetti'
import { NotificationModal } from '@/components/ui/NotificationModal'

// Interface para definir la estructura de una tarea.
type Material = {
  id: number
  nombre: string
  cantidad: number
  recogido: boolean
  aula: string
  id_profesor: number
}


export default function MaterialesParaClase() {
  const router = useRouter()
  const [items, setItems] = useState<Material[]>([])
  const [actividadCompletada, setActividadCompletada] = useState(false)
  const [profesorImagen, setProfesorImagen] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [showSuccessModal, setShowSuccessModal] = useState(false)
  const [showWarningModal, setShowWarningModal] = useState(false)


  useEffect(() => {
    fetchMaterials();
  }, []);


// Función para obtener los materiales del alumno desde múltiples tablas.
  const fetchMaterials = async () => {
    
    const taskId = localStorage.getItem('tareaId'); // Obtener el identificador de la tarea del alumno
    
    if (!taskId) { // Si no se encuentra el identificador de la tarea del alumno, mostrar un error.
      console.error('No se encontró el identificador del alumno.');
      return;
    }

    const { data, error } = await supabase // Obtener los materiales del alumno desde la tabla Tarea_Material
      .from('Tarea_Material')
      .select("identificador, nombres_materiales, cantidades_materiales, aula_destino, id_profesor")
      .eq('identificador', taskId)
      .single();

    if (error) {
      console.error('Error fetching materials:', error);
      return;
    }

    if (data) { // Si se obtienen los materiales del alumno, crear una estructura de datos para cada uno de ellos.
        const nombres = data.nombres_materiales.split(',').map((nombre: string) => nombre.trim());
        const cantidades = data.cantidades_materiales.split(',').map((cantidad: string) => parseInt(cantidad.trim(), 10));
        const materials: Material[] = nombres.map((nombre: string, index: number) => ({
          id: index,
          nombre,
          cantidad: cantidades[index],
          recogido: false,
          aula: data.aula_destino,
          id_profesor: data.id_profesor
        }));

      setItems(materials);
      fetchProfesorImagen(data.id_profesor);
    }
  };

  const fetchProfesorImagen = async (id_profesor: number) => { // Función para obtener la imagen del profesor del alumno
    const { data, error } = await supabase
      .from('Profesor')
      .select("imagen_perfil")
      .eq('identificador', id_profesor)
      .single();

    if (error) {
      console.error('Error fetching professor image:', error);
      return;
    }

    if (data) {
      setProfesorImagen(data.imagen_perfil);
    }
  };

  const toggleItem = (id: number) => { // Función para marcar un material como recogido o no recogido
    setItems(items.map(item => 
      item.id === id ? { ...item, recogido: !item.recogido } : item
    ))
  }

  const handleCompletar = async () => { // Función para marcar la tarea como completada
    if (items.every(item => item.recogido)) {

        // Obtener el identificador de la tarea del alumno
        const taskId = localStorage.getItem('tareaId');

        if (!taskId) {
            console.error('No se encontró el identificador del alumno.');
            return;
        }
        
        const { error } = await supabase // Actualizar la tarea en la tabla Tarea_Material
            .from('Tarea_Material')
                .update({ completada: true })
                .eq('identificador', taskId)
        
        if (error) {
            console.error('Error updating tarea:', error)
            setError('Error al marcar la tarea como completada')
        } else { // Si no se producen errores, mostrar un efecto de animación y redireccionar al siguiente paso de la tarea
            confetti({
                particleCount: 100,
                spread: 70,
                origin: { y: 0.6 }
            })
            setActividadCompletada(true)
            setShowSuccessModal(true)
            setTimeout(() => router.push('/menu-calendario-agenda'), 6000)
        }
    } else { // Si no se marcan todos los materiales como recogidos, mostrar una notificación de advertencia
        setShowWarningModal(true)
    }
  }

  // Objeto para almacenar las imagenes de los materiales
  const cantidadImagenes: { [key: number]: string } = {
    1: '/images/comedor/1.png',
    2: '/images/comedor/2.png',
    3: '/images/comedor/3.png',
    4: '/images/comedor/4.png',
    5: '/images/comedor/5.png',
    6: '/images/comedor/6.png',
    7: '/images/comedor/7.png',
    8: '/images/comedor/8.png',
    9: '/images/comedor/9.png',
    10: '/images/comedor/10.png'
  }

// Componente principal para los materiales para clase
return (
    <div className="font-escolar min-h-screen bg-gradient-to-b from-blue-200 to-green-200 p-4 flex flex-col">
        <Button
        onClick={() => router.push('/menu-calendario-agenda')}
        className="absolute top-4 left-4 bg-yellow-400 hover:bg-yellow-500 font-bold text-blue-800 text-2xl py-2 px-4 h-16 flex items-center"
          >
        <img src="/images/agenda.png" alt="Agenda" className="mr-1 h-16 w-16" /> AGENDA
          </Button>
        <h1 className="text-4xl font-bold text-center text-blue-600 mb-6 mt-4">MATERIALES PARA CLASE</h1>
        <Card className="flex-grow md:w-2/3 mx-auto bg-white rounded-3xl shadow-lg overflow-hidden relative">
            <h1 className="text-3xl font-bold text-purple-600 mb-6 mt-4 ml-10 flex items-center">
                AULA <img src="/images/clase.png" className="mr-2 ml-2 h-16 w-16" />: {items.length > 0 ? items[0].aula : ''}
            </h1>
            {profesorImagen && <div className="absolute top-4 right-4 flex items-center">
                <span className="text-3xl font-bold text-purple-600 mr-5 mt-4">PROFESOR:</span>
                <img src={profesorImagen} className="h-16 w-16 mr-10" alt="Profesor" />
            </div>}
            <CardContent className="p-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4" role="list" aria-label="Lista de materiales para recoger">
                    {items.map((item) => (
                        <motion.div
                            key={item.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            className={`p-4 rounded-xl flex items-center justify-between cursor-pointer ${item.recogido ? 'bg-purple-200': 'bg-purple-400'} md:flex-row md:items-center`}
                            onClick={() => toggleItem(item.id)}
                            whileHover={{ scale: 1.05 }}
                            style={{ height: '100px' }}
                        >
                            <Checkbox
                                checked={item.recogido}
                                className={`w-6 h-6 mr-2`}
                                onChange={() => toggleItem(item.id)}
                            />
                            <div className={`flex-grow ${item.recogido ? 'line-through text-gray-400' : ''}`}>
                                <h3 className="text-3xl font-bold md:text-2xl">{item.nombre}</h3>
                                <p className="text-2xl md:text-xl">CANTIDAD: {item.cantidad}</p>
                            </div>
                            {cantidadImagenes[item.cantidad] ? (
                                <img src={cantidadImagenes[item.cantidad]} className="w-16 h-16 ml-1 md:w-12 md:h-12" alt="Material" />
                            ) : (
                                <span className="text-7xl font-bold ml-1 mr-3">{item.cantidad}</span>
                            )}
                        </motion.div>
                    ))}
                </div>
                <div className="mt-6 text-center">
                    <Button
                        onClick={handleCompletar}
                        className="bg-green-500 hover:bg-green-600 text-white text-4xl font-bold py-8 px-6 rounded-xl"
                    >
                        COMPLETAR ACTIVIDAD
                    </Button>
                </div>
            </CardContent>
        </Card>
        <NotificationModal
        isOpen={showSuccessModal}
        onClose={() => setShowSuccessModal(false)}
        message="¡HAS COMPLETADO LA TAREA!"
        type="success"
        duration={6000}
      />
      <NotificationModal
        isOpen={showWarningModal}
        onClose={() => setShowWarningModal(false)}
        message="¡ASEGÚRATE DE RECOGER TODOS LOS MATERIALES ANTES DE TERMINAR!"
        type="warning"
        duration={6000}
      />
    </div>
);
}
