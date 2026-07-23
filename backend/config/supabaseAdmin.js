import { createClient } from "@supabase/supabase-js";

// Service-role client for server-side auth operations (creating users on signup).
// Never expose SUPABASE_SERVICE_ROLE_KEY to the frontend.
const supabaseAdmin = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false },
});

export default supabaseAdmin;
