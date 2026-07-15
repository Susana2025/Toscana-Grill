"use strict";

validarConfiguracionSupabase();

if (
  typeof window.supabase === "undefined" ||
  typeof window.supabase.createClient !== "function"
) {
  throw new Error(
    "La biblioteca de Supabase no se cargó correctamente."
  );
}

const supabaseClient = window.supabase.createClient(
  TOSCANA_SUPABASE_CONFIG.url,
  TOSCANA_SUPABASE_CONFIG.publishableKey,
  {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true
    }
  }
);

window.toscanaSupabase = supabaseClient;
