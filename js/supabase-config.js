"use strict";

const TOSCANA_SUPABASE_CONFIG = Object.freeze({
  url: "https://udltcssfnfenbzzfmfif.supabase.co",
  publishableKey: "sb_publishable_PJPELy__TqFZPf0lVJWirQ_RbKEx2rE"
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
