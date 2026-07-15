"use strict";

const TOSCANA_SUPABASE_CONFIG = Object.freeze({

    url: "https://kqxpxmzjtxukszjmwbxv.supabase.co",

    publishableKey:
        "sb_publishable_xxxxxxxxxxxxxxxxxxxxxxxxx"

});

function validarConfiguracionSupabase() {

    const { url, publishableKey } =
        TOSCANA_SUPABASE_CONFIG;

    if (!url || !publishableKey) {

        throw new Error(
            "Configuración de Supabase incompleta."
        );

    }

    if (!url.startsWith("https://")) {

        throw new Error(
            "La URL de Supabase no es válida."
        );

    }

}
