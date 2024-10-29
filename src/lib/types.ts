export enum TipoLogin {
  PIN = 'PIN',
  IMAGEN = 'IMAGEN',
  CONTRASENA = 'CONTRASEÑA'
}

export interface Juego {
  id: number;
  name: string;
  site_url: string;
  img_name: string;
  bg_color: string;
}

export interface Alumno {
  id: number;
  nombre_apellido: string;
  tipo_login: TipoLogin
}