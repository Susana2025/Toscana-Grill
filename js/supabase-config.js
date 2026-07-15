"use strict";

/*
 * Configuración pública de Supabase.
 *
 * Esta información será visible en GitHub Pages.
 * Solamente debe utilizarse la Publishable Key o la antigua anon key.
 *
 * Nunca colocar aquí:
 * - service_role
 * - secret key
 * - contraseña de la base de datos
 */

const TOSCANA_SUPABASE_CONFIG = Object.freeze({
  url: "https://kxqpxmzjtxukszjwmbxv.supabase.co/rest/v1/",
  publishableKey: "sb_publishable_X-BblX3Y2hCxsIecbHbwAw_ns1Ksjq6"
});

function validarConfiguracionSupabase() {
  const { url, publishableKey } = TOSCANA_SUPABASE_CONFIG;

  if (
    !url ||
    !publishableKey ||
    url.includes("https://kxqpxmzjtxukszjwmbxv.supabase.co/rest/v1/") ||
    publishableKey.includes("sb_publishable_X-BblX3Y2hCxsIecbHbwAw_ns1Ksjq6")
  ) {
    throw new Error(
      "La conexión con Supabase aún no ha sido configurada."
    );
  }

  if (!url.startsWith("https://")) {
    throw new Error("La URL de Supabase no es válida.");
  }
}
