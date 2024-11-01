import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function POST(request: Request) {
  const { fullName, password } = await request.json();

  if (!fullName || !password) {
    return NextResponse.json({ success: false, message: 'Nombre y contraseña son requeridos' }, { status: 400 });
  }

  const { data, error } = await supabase
    .from('Administrador')
    .select('*')
    .eq('nombre_apellidos', fullName)
    .eq('contraseña', password)
    .single();

  if (error || !data) {
    return NextResponse.json({ success: false, message: 'Credenciales incorrectas' }, { status: 401 });
  }

  return NextResponse.json({ success: true });
}