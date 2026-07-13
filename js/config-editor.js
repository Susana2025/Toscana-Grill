(() => {
"use strict";

const DAY_NAMES = {
  monday: "Lunes",
  tuesday: "Martes",
  wednesday: "Miércoles",
  thursday: "Jueves",
  friday: "Viernes",
  saturday: "Sábado",
  sunday: "Domingo"
};

const STORAGE_KEY = "toscana_config_override";
let config = null;

const elements = {
  whatsappNumber: document.getElementById("whatsappNumber"),
  disposableFeePerItem: document.getElementById("disposableFeePerItem"),
  deliveryFee: document.getElementById("deliveryFee"),
  maxQuantityPerItem: document.getElementById("maxQuantityPerItem"),
  days: document.getElementById("days"),
  downloadConfig: document.getElementById("downloadConfig"),
  saveLocalConfig: document.getElementById("saveLocalConfig"),
  clearLocalConfig: document.getElementById("clearLocalConfig"),
  status: document.getElementById("status")
};

function setStatus(message, isError = false) {
  elements.status.textContent = message;
  elements.status.classList.toggle("error", isError);
}

function validateTime(value) {
  return /^([01]\d|2[0-3]):[0-5]\d$/.test(value);
}

function normalizeConfig(source) {
  if (!source || typeof source !== "object") throw new Error("Configuración inválida.");
  if (!source.businessHours || typeof source.businessHours !== "object") {
    throw new Error("No existe la sección businessHours.");
  }
  return structuredClone(source);
}

function buildScheduleRows() {
  elements.days.replaceChildren();

  for (const [key, label] of Object.entries(DAY_NAMES)) {
    const schedule = config.businessHours[key] || {
      enabled: false,
      opens: "17:00",
      closes: "22:00"
    };

    const row = document.createElement("div");
    row.className = "day-row";

    const toggleLabel = document.createElement("label");
    toggleLabel.className = "day-toggle";

    const checkbox = document.createElement("input");
    checkbox.type = "checkbox";
    checkbox.id = `${key}-enabled`;
    checkbox.checked = Boolean(schedule.enabled);

    const dayText = document.createElement("span");
    dayText.textContent = label;
    toggleLabel.append(checkbox, dayText);

    const openLabel = document.createElement("label");
    openLabel.textContent = "Apertura";
    const openInput = document.createElement("input");
    openInput.type = "time";
    openInput.id = `${key}-opens`;
    openInput.value = schedule.opens || "17:00";
    openLabel.appendChild(openInput);

    const closeLabel = document.createElement("label");
    closeLabel.textContent = "Cierre";
    const closeInput = document.createElement("input");
    closeInput.type = "time";
    closeInput.id = `${key}-closes`;
    closeInput.value = schedule.closes || "22:00";
    closeLabel.appendChild(closeInput);

    const syncDisabledState = () => {
      openInput.disabled = !checkbox.checked;
      closeInput.disabled = !checkbox.checked;
      row.classList.toggle("disabled-day", !checkbox.checked);
    };

    checkbox.addEventListener("change", syncDisabledState);
    syncDisabledState();

    row.append(toggleLabel, openLabel, closeLabel);
    elements.days.appendChild(row);
  }
}

function populateGeneralFields() {
  elements.whatsappNumber.value = config.whatsappNumber || "";
  elements.disposableFeePerItem.value = Number(config.disposableFeePerItem ?? 0.50).toFixed(2);
  elements.deliveryFee.value = Number(config.deliveryFee ?? 2.00).toFixed(2);
  elements.maxQuantityPerItem.value = Number(config.maxQuantityPerItem ?? 20);
}

function readFormConfig() {
  const updated = structuredClone(config);

  updated.whatsappNumber = elements.whatsappNumber.value.trim();
  updated.disposableFeePerItem = Number(elements.disposableFeePerItem.value);
  updated.deliveryFee = Number(elements.deliveryFee.value);
  updated.maxQuantityPerItem = Math.trunc(Number(elements.maxQuantityPerItem.value));

  if (!/^\d{8,15}$/.test(updated.whatsappNumber)) {
    throw new Error("El número de WhatsApp debe contener entre 8 y 15 dígitos.");
  }
  if (!Number.isFinite(updated.disposableFeePerItem) || updated.disposableFeePerItem < 0) {
    throw new Error("El valor de desechables no es válido.");
  }
  if (!Number.isFinite(updated.deliveryFee) || updated.deliveryFee < 0) {
    throw new Error("El valor de delivery no es válido.");
  }
  if (!Number.isInteger(updated.maxQuantityPerItem) || updated.maxQuantityPerItem < 1) {
    throw new Error("La cantidad máxima por producto no es válida.");
  }

  for (const key of Object.keys(DAY_NAMES)) {
    const enabled = document.getElementById(`${key}-enabled`).checked;
    const opens = document.getElementById(`${key}-opens`).value;
    const closes = document.getElementById(`${key}-closes`).value;

    if (enabled && (!validateTime(opens) || !validateTime(closes))) {
      throw new Error(`Revisa el horario de ${DAY_NAMES[key]}.`);
    }
    if (enabled && opens >= closes) {
      throw new Error(`En ${DAY_NAMES[key]}, la hora de apertura debe ser anterior al cierre.`);
    }

    updated.businessHours[key] = { enabled, opens, closes };
  }

  return updated;
}

async function loadConfig() {
  const stored = localStorage.getItem(STORAGE_KEY);
  if (stored) {
    try {
      config = normalizeConfig(JSON.parse(stored));
      setStatus("Se cargó la configuración guardada en este navegador.");
      return;
    } catch {
      localStorage.removeItem(STORAGE_KEY);
    }
  }

  const url = new URL("../data/config.json", window.location.href);
  const response = await fetch(url, { cache: "no-store" });
  if (!response.ok) throw new Error(`No se pudo cargar config.json (HTTP ${response.status}).`);
  config = normalizeConfig(await response.json());
}

function downloadConfig() {
  try {
    const updated = readFormConfig();
    const blob = new Blob([JSON.stringify(updated, null, 2)], {
      type: "application/json;charset=utf-8"
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "config.json";
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
    setStatus("Archivo descargado. Reemplaza data/config.json en GitHub para aplicar el cambio a todos.");
  } catch (error) {
    setStatus(error.message, true);
  }
}

function saveLocalConfig() {
  try {
    const updated = readFormConfig();
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    config = updated;
    setStatus("Horario guardado en este navegador. La página principal usará estos cambios al recargar.");
  } catch (error) {
    setStatus(error.message, true);
  }
}

function clearLocalConfig() {
  localStorage.removeItem(STORAGE_KEY);
  setStatus("Configuración local eliminada. Al recargar se usará data/config.json.");
}

async function init() {
  try {
    await loadConfig();
    populateGeneralFields();
    buildScheduleRows();

    elements.downloadConfig.addEventListener("click", downloadConfig);
    elements.saveLocalConfig.addEventListener("click", saveLocalConfig);
    elements.clearLocalConfig.addEventListener("click", clearLocalConfig);
  } catch (error) {
    console.error(error);
    setStatus(
      "No se pudo cargar la configuración. Abre esta página desde GitHub Pages o desde un servidor local.",
      true
    );
  }
}

document.addEventListener("DOMContentLoaded", init);
})();