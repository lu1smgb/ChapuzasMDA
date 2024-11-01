import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function POST(request: Request) {
  const { fullName, password } = await request.json();

  if (!fullName || !password) {
    return NextResponse.json({ success: false, message: 'Nombre y contraseña son requeridos' }, { status: 400 });
  }

  const { data: adminData, error: adminError } = await supabase
    .from('Administrador')
    .select('*')
    .eq('nombre_apellidos', fullName)
    .eq('contraseña', password)
    .single();

   // Consultar en la tabla Profesor si no se encuentra en Administrador
   if (adminError || !adminData) {
    const { data: profesorData, error: profesorError } = await supabase
      .from('Profesor')
      .select('*')
      .eq('nombre_apellido', fullName)
      .eq('contraseña', password)
      .single();

    if (profesorError || !profesorData) {
      return NextResponse.json({ success: false, message: 'Credenciales incorrectas' }, { status: 401 });
    }

    return NextResponse.json({ success: true, role: 'Profesor' });
  }

  return NextResponse.json({ success: true, role: 'Administrador' });
}