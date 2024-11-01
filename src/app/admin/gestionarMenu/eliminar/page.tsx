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

interface MenuItem {
  id: number;
  nombre: string;
}

export default function EliminarMenu() {
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [selectedMenuItemId, setSelectedMenuItemId] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  useEffect(() => {
    const fetchMenuItems = async () => {
      setIsLoading(true);
      setError('');
      try {
        const { data, error } = await supabase
          .from('Menu')
          .select('id, nombre')
          .order('nombre', { ascending: true });

        if (error) throw error;
        setMenuItems(data || []);
      } catch (error) {
        console.error('Error fetching menu items:', error);
        setError('Error al cargar los ítems de menú. Por favor, recargue la página.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchMenuItems();
  }, []);

  const handleMenuItemChange = (menuItemId: string) => {
    setSelectedMenuItemId(menuItemId);
    setSuccessMessage('');
    setError('');
  };

  const handleDelete = async () => {
    if (!selectedMenuItemId) {
      setError('Debe seleccionar un ítem de menú para eliminar.');
      return;
    }

    setIsLoading(true);
    setError('');
    setSuccessMessage('');

    try {
      const { error } = await supabase
        .from('Menu')
        .delete()
        .eq('id', selectedMenuItemId);

      if (error) throw error;

      setMenuItems(menuItems.filter(item => item.id.toString() !== selectedMenuItemId));
      setSuccessMessage('Ítem de menú eliminado con éxito');
      setSelectedMenuItemId('');
    } catch (error) {
      console.error('Error deleting menu item:', error);
      setError('Error al eliminar el ítem de menú. Por favor, intente de nuevo.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white md:bg-gradient-to-br md:from-blue-100 md:via-purple-100 md:to-pink-100 flex items-center justify-center p-4">
      <main className="bg-white rounded-lg shadow-lg p-4 md:p-8 w-full md:max-w-2xl">
        <h1 className="text-2xl md:text-3xl font-bold mb-6 text-center text-gray-900">Eliminar Ítem de Menú</h1>
        <nav className="mb-8">
          <Link href="/admin/gestionarMenu" passHref>
            <Button variant="outline" className="w-full text-base md:text-lg bg-yellow-400 hover:bg-yellow-500" aria-label="Volver a gestionar menú">
              <ArrowLeft className="mr-2 h-4 w-4 md:h-5 md:w-5" aria-hidden="true" />
              Atrás
            </Button>
          </Link>
        </nav>
        {error && <p className="text-red-500 text-center mb-4" role="alert">{error}</p>}
        {successMessage && <p className="text-green-500 text-center mb-4" role="status">{successMessage}</p>}
        <div className="space-y-6 md:space-y-8">
          <div className="space-y-2 md:space-y-3">
            <Label htmlFor="menuItem" className="text-base md:text-lg font-medium text-gray-900">
              Seleccionar Ítem de Menú
            </Label>
            <Select 
              value={selectedMenuItemId}
              onValueChange={handleMenuItemChange}
              disabled={isLoading}
            >
              <SelectTrigger id="menuItem" className="text-base md:text-lg">
                <SelectValue placeholder="Seleccione un ítem de menú para eliminar" />
              </SelectTrigger>
              <SelectContent>
                {menuItems.map((menuItem) => (
                  <SelectItem key={menuItem.id} value={menuItem.id.toString()} className="text-base md:text-lg">
                    {menuItem.nombre}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <Button 
            onClick={handleDelete}
            className="w-full text-base md:text-lg bg-red-600 hover:bg-red-700 text-white"
            aria-label="Eliminar ítem de menú seleccionado"
            disabled={isLoading || !selectedMenuItemId}
          >
            {isLoading ? 'Eliminando...' : 'Eliminar Ítem de Menú'}
          </Button>
        </div>
      </main>
    </div>
  );
}