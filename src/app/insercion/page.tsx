import { supabase } from "@/lib/supabase";

export default async function Insercion() {
    // Llama a la función de inserción aquí
    const { data, error } = await supabase
        .from("Juego")
        .insert({
            name: "VScode otrooPortatil",
            site_url: "https://www.vscodeotrooportatil.com",
            img_name: "vscodeeeport.png",
            bg_color: "bg-browwwnport-400",
        })
        .select();

    // Manejo de errores
    if (error) {
        console.error("Ha ocurrido un error al insertar el dato:", error.message);
        return (
            <div>
                <h1>Inserción en la base de datos</h1>
                <p>Error: {error.message}</p>
            </div>
        );
    }

    // Datos insertados
    return (
        <div>
            <h1>Inserción en la base de datos</h1>
            <pre>
                Datos insertados:
                {JSON.stringify(data, null, 2)}
            </pre>
        </div>
    );
}
