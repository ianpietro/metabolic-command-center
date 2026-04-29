import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = "https://wnswqifolhtglrjyvmjag.supabase.co";
const SUPABASE_ANON_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndueHdxaWZvaHRyZ2l5anZycWFnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzc0NDY4NDYsImV4cCI6MjA5MzAyMjg0Nn0.WgGZgZyCVnDnumpKSLYtaF3A5v3XOZOleoB_Wf9IK9Y";

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: { persistSession: false },
});
