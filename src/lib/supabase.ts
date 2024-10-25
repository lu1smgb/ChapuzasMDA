 import { createClient } from "@supabase/supabase-js";


// // Create a single supabase client for interacting with your database AS USER
 export const supabase = createClient(
     process.env.NEXT_PUBLIC_SUPABASE_URL!,
     process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
 );



// Create a single supabase client for interacting with your database AS ADMIN
// export const supabaseAdmin = createClient(
//     process.env.SUPABASE_URL!,
//     process.env.SUPABASE_SERVICE_ROLE_KEY!,
// )





