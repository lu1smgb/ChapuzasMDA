import { TipoLogin } from "@/lib/types";
import { client } from "../client";

export async function getAlumnos() {

    const { data, error } = await client.from('Alumno').select('*');

    if (error) {
        console.error("Error al obtener los alumnos: ", error.message);
        throw new Error(error.message);
    }

    return data;
}

export async function setLoginForAlumno(id: number, loginType: TipoLogin) {

    const { data, error } = await client.from('Alumno').update({ tipo_login: loginType }).eq('id', id);

    if (error) {
        console.error(`Error al actualizar el login del usuario ${id} a ${loginType}: `, error.message);
        throw new Error(error.message);
    }

    return data;

}