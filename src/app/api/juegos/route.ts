import { getGameList } from "@/lib/supabase/queries/juego";

export async function GET(request: any) {

    try {
        const games = await getGameList();
        return new Response(JSON.stringify(games, null, 2), { status: 200 });
    }
    catch (error) {
        if (error instanceof Error) {
            return new Response(JSON.stringify({error: error.message}), { status: 500 });
        }
    }


}