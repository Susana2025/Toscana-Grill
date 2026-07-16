"use strict";

const TOSCANA_SUPABASE_CONFIG = Object.freeze({
  url: "https://kxqpxmzjtxukszjwmbxv.supabase.co",
  publishableKey: "sb_publishable_X-BblX3Y2hCxsIecbHbwAw_ns1Ksjq6"
});

function validarConfiguracionSupabase() {
  const { url, publishableKey } = TOSCANA_SUPABASE_CONFIG;

  if (!url || !publishableKey) {
    throw new Error(
      "La configuración de Supabase está incompleta."
    );
  }

  if (!url.startsWith("https://")) {
    throw new Error(
      "La URL de Supabase no es válida."
    );
  }
}
