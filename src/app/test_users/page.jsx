import { createClient } from "@/utils/supabase/server";

// localhost:3000/test_users
export default async function Users() {
    const client = createClient();
    const response = await client.from('Usuario_test').select();
    return <pre>{JSON.stringify(response, null, 2)}</pre>
}