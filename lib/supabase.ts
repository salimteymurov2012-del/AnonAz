import { createClient } from "@supabase/supabase-js";

const supabaseUrl = "https://caamqguxqnxnrxswszer.supabase.co";
const supabaseKey = "sb_publishable_QCCe0hD3XVVGwT9qk79O1A_TyeSXl65";

export const supabase = createClient(supabaseUrl, supabaseKey);
