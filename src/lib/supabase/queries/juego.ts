import { createClient } from "../server";

export async function getGameList() {

    const client = createClient();
    const { error, data } = await client.from('Juego').select('*');

    if (error) {
        console.error("Error obtaining game list: ", error.message)
        throw new Error(error.message);
    }

    return data;

}