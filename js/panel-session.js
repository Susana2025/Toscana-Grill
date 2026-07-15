"use strict";

document.addEventListener(
  "DOMContentLoaded",
  validarSesionPanel
);

async function validarSesionPanel() {
  const status = document.getElementById("session-status");
  const logoutButton = document.getElementById(
    "logout-button"
  );

  try {
    const { data, error } =
      await window.toscanaSupabase.auth.getSession();

    if (error || !data.session?.user) {
      redirigirALogin();
      return;
    }

    const { data: perfil, error: perfilError } =
      await window.toscanaSupabase
        .from("perfiles")
        .select("nombre_completo, rol, activo")
        .eq("id", data.session.user.id)
        .single();

    if (perfilError || !perfil?.activo) {
      await window.toscanaSupabase.auth.signOut();
      redirigirALogin();
      return;
    }

    status.textContent =
      `Sesión activa: ${perfil.nombre_completo} — ${perfil.rol}`;

    logoutButton.addEventListener("click", cerrarSesion);
  } catch (error) {
    console.error(error);
    redirigirALogin();
  }
}

async function cerrarSesion() {
  await window.toscanaSupabase.auth.signOut();
  redirigirALogin();
}

function redirigirALogin() {
  window.location.replace("./login.html");
}
