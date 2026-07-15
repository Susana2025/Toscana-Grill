"use strict";

(function inicializarClienteSupabase() {
  try {
    if (typeof validarConfiguracionSupabase !== "function") {
      throw new Error(
        "No se cargó supabase-config.js."
      );
    }

    validarConfiguracionSupabase();

    if (
      !window.supabase ||
      typeof window.supabase.createClient !== "function"
    ) {
      throw new Error(
        "La biblioteca de Supabase no está disponible."
      );
    }

    const cliente = window.supabase.createClient(
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

    window.toscanaSupabase = cliente;

    console.log(
      "Cliente Supabase inicializado correctamente."
    );
  } catch (error) {
    console.error(
      "Error al inicializar Supabase:",
      error
    );

    window.toscanaSupabase = null;
  }
})();
