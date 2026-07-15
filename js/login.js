"use strict";

document.addEventListener("DOMContentLoaded", inicializarLogin);

async function inicializarLogin() {
  const form = document.getElementById("login-form");
  const emailInput = document.getElementById("email");
  const passwordInput = document.getElementById("password");
  const submitButton = document.getElementById("login-submit");
  const message = document.getElementById("login-message");
  const togglePassword = document.getElementById("toggle-password");

  if (!window.toscanaSupabase) {
    console.error(
      "window.toscanaSupabase no está disponible."
    );

    if (message) {
      mostrarMensaje(
        message,
        "No se pudo iniciar la conexión con el servidor.",
        "error"
      );
    }

    if (submitButton) {
      submitButton.disabled = true;
    }

    return;
  }

  if (
    !form ||
    !emailInput ||
    !passwordInput ||
    !submitButton ||
    !message ||
    !togglePassword
  ) {
    console.error(
      "La estructura del formulario está incompleta."
    );
    return;
  }

  togglePassword.addEventListener("click", () => {
    const estaOculta = passwordInput.type === "password";

    passwordInput.type = estaOculta
      ? "text"
      : "password";

    togglePassword.textContent = estaOculta
      ? "Ocultar"
      : "Mostrar";

    togglePassword.setAttribute(
      "aria-label",
      estaOculta
        ? "Ocultar contraseña"
        : "Mostrar contraseña"
    );
  });

  form.addEventListener("submit", async event => {
    event.preventDefault();

    limpiarMensaje(message);

    const email = emailInput.value.trim().toLowerCase();
    const password = passwordInput.value;

    if (!email || !password) {
      mostrarMensaje(
        message,
        "Debes ingresar correo y contraseña.",
        "error"
      );
      return;
    }

    bloquearFormulario(submitButton, true);

    try {
      const { data, error } =
        await window.toscanaSupabase.auth.signInWithPassword({
          email,
          password
        });

      if (error) {
        throw error;
      }

      if (!data.user || !data.session) {
        throw new Error(
          "No fue posible establecer la sesión."
        );
      }

      const perfil = await obtenerPerfilActivo(data.user.id);

      if (!perfil.activo) {
        await window.toscanaSupabase.auth.signOut();

        throw new Error(
          "La cuenta se encuentra deshabilitada."
        );
      }

      mostrarMensaje(
        message,
        "Acceso correcto. Redirigiendo…",
        "success"
      );

      redirigirSegunRol(perfil.rol);
    } catch (error) {
      console.error("Error de autenticación:", error);

      mostrarMensaje(
        message,
        traducirErrorLogin(error),
        "error"
      );

      bloquearFormulario(submitButton, false);
    }
  });

  await redirigirSiYaExisteSesion();
}

async function obtenerPerfilActivo(usuarioId) {
  const { data, error } = await window.toscanaSupabase
    .from("perfiles")
    .select("id, nombre_completo, rol, activo")
    .eq("id", usuarioId)
    .single();

  if (error) {
    throw new Error(
      "No fue posible recuperar el perfil del usuario."
    );
  }

  if (!data) {
    throw new Error(
      "La cuenta no tiene un perfil asociado."
    );
  }

  return data;
}

async function redirigirSiYaExisteSesion() {
  try {
    const { data, error } =
      await window.toscanaSupabase.auth.getSession();

    if (error || !data.session?.user) {
      return;
    }

    const perfil = await obtenerPerfilActivo(
      data.session.user.id
    );

    if (!perfil.activo) {
      await window.toscanaSupabase.auth.signOut();
      return;
    }

    redirigirSegunRol(perfil.rol);
  } catch (error) {
    console.warn(
      "No se pudo restaurar la sesión:",
      error
    );
  }
}

function redirigirSegunRol(rol) {
  const rutas = {
    administrador: "./panel.html",
    caja: "./panel.html",
    cocina: "./panel.html",
    mesero: "./panel.html"
  };

  const destino = rutas[rol];

  if (!destino) {
    throw new Error(
      "El usuario no tiene un rol reconocido."
    );
  }

  window.location.replace(destino);
}

function mostrarMensaje(elemento, texto, tipo) {
  elemento.textContent = texto;
  elemento.className = `login-message ${tipo}`;
  elemento.hidden = false;
}

function limpiarMensaje(elemento) {
  elemento.textContent = "";
  elemento.className = "login-message";
  elemento.hidden = true;
}

function bloquearFormulario(boton, bloqueado) {
  boton.disabled = bloqueado;
  boton.textContent = bloqueado
    ? "Validando…"
    : "Iniciar sesión";
}

function traducirErrorLogin(error) {
  const mensaje = String(
    error?.message || ""
  ).toLowerCase();

  if (
    mensaje.includes("invalid login credentials") ||
    mensaje.includes("invalid credentials")
  ) {
    return "Correo o contraseña incorrectos.";
  }

  if (mensaje.includes("email not confirmed")) {
    return "El correo todavía no ha sido confirmado.";
  }

  if (mensaje.includes("failed to fetch")) {
    return "No fue posible conectarse con el servidor.";
  }

  return error?.message ||
    "No fue posible iniciar sesión.";
}
