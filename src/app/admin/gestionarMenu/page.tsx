'use client'

import { useState, useEffect } from 'react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ArrowLeft, Search, Pencil, Trash2 } from 'lucide-react'
import { createClient } from '@supabase/supabase-js'
import { useRouter } from 'next/navigation'
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

interface Menu {
  id: number;             // Identificador único del menú.
  nombre: string;         // Nombre del menú.
  url_imagen: string;     // URL de la imagen asociada al menú.
}

export default function MenuList() {
  // Estados del componente
  const [menus, setMenus] = useState<Menu[]>([]); // Almacena la lista de menús obtenidos.
  const [filterName, setFilterName] = useState(''); // Cadena de texto para filtrar menús por nombre.
  const [deleteMenu, setDeleteMenu] = useState<Menu | null>(null); // Menú seleccionado para eliminar.
  const router = useRouter(); // Permite la navegación entre páginas.

  // Efecto que se ejecuta al cargar el componente para obtener la lista inicial de menús.
  useEffect(() => {
    fetchMenus(); // Llama a la función que obtiene los menús de la base de datos.
  }, []);

  // Función para obtener la lista de menús desde Supabase.
  const fetchMenus = async () => {
    try {
      const { data, error } = await supabase
        .from("Menu") // Selecciona la tabla "Menu".
        .select("*"); // Obtiene todos los registros de la tabla.

      if (error) throw error; // Si ocurre un error, lo lanza para ser capturado.

      setMenus(data as Menu[]); // Actualiza el estado con la lista de menús obtenida.
    } catch (error) {
      console.error("Error al obtener los menús:", error); // Muestra el error en consola.
    }
  };

  // Función que establece el menú a eliminar.
  const handleDeleteMenu = async (menu: Menu) => {
    setDeleteMenu(menu); // Guarda el menú seleccionado en el estado.
  };

  // Función que confirma y elimina el menú seleccionado.
  const confirmDeleteMenu = async () => {
    if (deleteMenu) { // Solo procede si hay un menú seleccionado para eliminar.
      try {
        const { error } = await supabase
          .from('Menu') // Selecciona la tabla "Menu".
          .delete()     // Ejecuta la operación de borrado.
          .eq('id', deleteMenu.id); // Filtra por el identificador del menú seleccionado.

        if (error) throw error; // Si ocurre un error, lo lanza para ser capturado.

        fetchMenus(); // Actualiza la lista de menús después de eliminar.
      } catch (error) {
        console.error("Error al eliminar el menú:", error); // Muestra el error en consola.
      }
    }
    setDeleteMenu(null); // Limpia el estado del menú seleccionado.
  };

  // Filtro para buscar menús por nombre.
  const filteredMenus = menus.filter(menu => 
    menu.nombre.toLowerCase().includes(filterName.toLowerCase()) // Filtra los menús cuyo nombre incluye el texto de búsqueda, ignorando mayúsculas/minúsculas.
  );


  return (
    <div className="bg-white rounded-lg shadow-lg p-4 md:p-8 w-full max-w-4xl mx-auto">
      <nav className="mb-4">
        <Button onClick={() => router.push('.')} variant="outline" className="text-base bg-yellow-400 hover:bg-yellow-500">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Volver
        </Button>
      </nav>

      <h1 className="text-2xl font-bold mb-6 text-center text-gray-900">Listado de Menús</h1>

      <div className="flex space-x-2 mb-4">
        <div className="flex-1 relative">
          <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            value={filterName}
            onChange={(e) => setFilterName(e.target.value)}
            className="pl-8"
            placeholder="Buscar por nombre"
          />
        </div>
      </div>

      <div className="overflow-y-auto border border-gray-200 rounded-md mb-4" style={{ height: "300px" }}>
        <ul className="divide-y divide-gray-200">
          {filteredMenus.map((menu) => (
            <li key={menu.id} className="py-2 px-4 hover:bg-gray-50">
              <div className="flex justify-between items-center">
                <div className="flex items-center">
                  <img src={menu.url_imagen} alt={menu.nombre} className="w-10 h-10 rounded-full mr-3" />
                  <p className="font-medium">{menu.nombre}</p>
                </div>
                <div className="flex space-x-2">
                  <Button 
                    onClick={() => router.push(`./gestionarMenu/anad-mod-menu?id=${menu.id}`)}
                    variant="outline" 
                    size="sm" 
                    className="bg-blue-500 hover:bg-blue-600 text-white"
                  >
                    <Pencil className="h-4 w-4 mr-2" />
                    Modificar
                  </Button>
                  <Button 
                    onClick={() => handleDeleteMenu(menu)} 
                    variant="outline" 
                    size="sm" 
                    className="bg-red-500 hover:bg-red-600 text-white"
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Eliminar
                  </Button>
                </div>
              </div>
            </li>
          ))}
        </ul>
      </div>

      <Button onClick={() => router.push('./gestionarMenu/anad-mod-menu')} className="w-full bg-green-600 hover:bg-green-700 text-white">
        Añadir nuevo menú
      </Button>

      <AlertDialog open={deleteMenu !== null} onOpenChange={() => setDeleteMenu(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar eliminación</AlertDialogTitle>
            <AlertDialogDescription>
              ¿Estás seguro de que quieres eliminar el menú {deleteMenu?.nombre}? Esta acción no se puede deshacer.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDeleteMenu} className="bg-red-500 hover:bg-red-600 text-white">
              Aceptar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}

