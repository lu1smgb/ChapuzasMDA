'use client'
import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { ArrowLeft, Clock } from 'lucide-react'
import { supabase } from "@/lib/supabase";

// Inicializa el cliente de Supabase
//const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!)

import {Table, TableHeader, TableColumn, TableBody, TableRow, TableCell, getKeyValue} from '@nextui-org/table';

const rows = [
  {
    order: "1",
    menu_name: "CARNE",
    image: "/images/menu/carne.png",
  },
  {
    order: "2",
    menu_name: "SIN CARNE",
    image: "/images/menu/sin_carne.png",
  },
  {
    order: "3",
    menu_name: "YOGUR",
    image: "/images/menu/yogur.png",
  },
  {
    order: "4",
    menu_name: "LENTEJAS",
    image: "/images/menu/lentejas.png",
  },
];

const columns = [
  {
    key: "menu_name",
    label: "MENU",
  },
  {
    key: "image",
    label: "IMG",
  },
  {
    key: "a",
    label: "A",
  },
  {
    key: "b",
    label: "B",
  },
  {
    key: "c",
    label: "C",
  },
  {
    key: "d",
    label: "D",
  },
  {
    key: "e",
    label: "E",
  },
  {
    key: "f",
    label: "F",
  },
  {
    key: "g",
    label: "G",
  },
  {
    key: "h",
    label: "H",
  },
  {
    key: "i",
    label: "I",
  },
  {
    key: "j",
    label: "J",
  },
];

export default function App() {
  const router = useRouter()

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-200 to-green-200 p-4">  
      <Button  // Botón para volver al menú de calendario y agenda
        onClick={() => router.push('/menu-calendario-agenda')} 
        className="mb-10 bg-yellow-400 hover:bg-yellow-500 text-blue-800 text-lg py-3 px-6 w-full h-20 flex items-center justify-center"
      >
        <ArrowLeft className="mr-1 h-10 w-10" /> ATRÁS
      </Button>

      <Card className="p-6 bg-white rounded-3xl shadow-lg w-full h-full mx-1">
        <Table aria-label="Tabla de menús y aulas">
          <TableHeader columns={columns}>
            {(column) => <TableColumn key={column.key}>{column.label}</TableColumn>}
          </TableHeader>
          <TableBody items={rows}>
            {(item) => (
              <TableRow key={item.order}>
                {(columnKey) => <TableCell>{getKeyValue(item, columnKey)}</TableCell>}
              </TableRow>
            )}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
}