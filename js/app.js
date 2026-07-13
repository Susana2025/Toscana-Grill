(() => {
"use strict";

const DEFAULT_CONFIG = {
  version: 1,
  businessName: "Toscana Grill",
  whatsappNumber: "593984005280",
  timezone: "America/Guayaquil",
  disposableFeePerItem: 0.50,
  deliveryFee: 2.00,
  maxQuantityPerItem: 20,
  rateLimitSeconds: 30,
  businessHours: {
    monday: { enabled: true, opens: "17:00", closes: "22:00" },
    tuesday: { enabled: true, opens: "17:00", closes: "22:00" },
    wednesday: { enabled: true, opens: "17:00", closes: "22:00" },
    thursday: { enabled: true, opens: "17:00", closes: "22:00" },
    friday: { enabled: true, opens: "17:00", closes: "22:00" },
    saturday: { enabled: true, opens: "17:00", closes: "22:00" },
    sunday: { enabled: false, opens: "17:00", closes: "22:00" }
  }
};

let CONFIG = DEFAULT_CONFIG;
let MENU = [];
const cart = new Map();
let activeCategory = "Todos";

const $ = id => document.getElementById(id);
const elements = {
  categoryFilters: $("categoryFilters"),
  menuGrid: $("menuGrid"),
  cartPanel: $("cartPanel"),
  cartItems: $("cartItems"),
  cartCount: $("cartCount"),
  floatingCount: $("floatingCount"),
  cartSubtotal: $("cartSubtotal"),
  disposablesTotal: $("disposablesTotal"),
  deliveryTotal: $("deliveryTotal"),
  disposablesRow: $("disposablesRow"),
  deliveryRow: $("deliveryRow"),
  cartTotal: $("cartTotal"),
  orderType: $("orderType"),
  tableFields: $("tableFields"),
  tableNumber: $("tableNumber"),
  customerName: $("customerName"),
  deliveryFields: $("deliveryFields"),
  deliveryAddress: $("deliveryAddress"),
  deliveryReference: $("deliveryReference"),
  orderNotes: $("orderNotes"),
  currentDateTime: $("currentDateTime"),
  scheduleStatus: $("scheduleStatus"),
  openCartButton: $("openCartButton"),
  floatingCartButton: $("floatingCartButton"),
  reviewOrderButton: $("reviewOrderButton"),
  newOrderButton: $("newOrderButton"),
  closeCartButton: $("closeCartButton"),
  orderReviewModal: $("orderReviewModal"),
  reviewContent: $("reviewContent"),
  closeReviewButton: $("closeReviewButton"),
  editOrderButton: $("editOrderButton"),
  confirmWhatsAppButton: $("confirmWhatsAppButton")
};

const money = value => `$${Number(value).toFixed(2)}`;

function createElement(tag, className = "", text = "") {
  const el = document.createElement(tag);
  if (className) el.className = className;
  if (text !== "") el.textContent = text;
  return el;
}

async function loadJson(path) {
  const url = new URL(path, window.location.href);
  const response = await fetch(url, { cache: "no-store" });
  if (!response.ok) throw new Error(`${path}: HTTP ${response.status}`);
  return response.json();
}

async function loadData() {
  try {
    const [fileConfig, menu] = await Promise.all([
      loadJson("data/config.json"),
      loadJson("data/menu.json")
    ]);

    let effectiveConfig = fileConfig;
    const localOverride = localStorage.getItem("toscana_config_override");
    if (localOverride) {
      try {
        effectiveConfig = JSON.parse(localOverride);
      } catch {
        localStorage.removeItem("toscana_config_override");
      }
    }

    CONFIG = { ...DEFAULT_CONFIG, ...effectiveConfig };
    MENU = Array.isArray(menu.products)
      ? menu.products.filter(item => item.enabled !== false)
      : [];
  } catch (error) {
    console.error("No se pudieron cargar los archivos JSON:", error);
    CONFIG = DEFAULT_CONFIG;
    MENU = [{"id": 1, "category": "Asados al barril", "name": "Panceta crocante al barril", "price": 5.5, "description": "Panceta crocante al barril, acompañada de papas fritas y guacamole.", "enabled": true}, {"id": 2, "category": "Asados al barril", "name": "Parrillada andina al barril", "price": 5.5, "description": "Lomo de cerdo, presa de pollo, chorizo parrillero, choclo, papas salteadas, ensalada, chimichurri y ají de la casa.", "enabled": true}, {"id": 3, "category": "Asados al barril", "name": "Lomo de res al barril", "price": 4.75, "description": "Lomo ahumado de res al barril, acompañado de arroz moro, patacones y menestra.", "enabled": true}, {"id": 4, "category": "Asados al barril", "name": "Costillas de cerdo ahumadas en salsa BBQ", "price": 5.0, "description": "Costillas de cerdo ahumadas en salsa BBQ, acompañadas de papas rústicas sazonadas, ensalada y limonada.", "enabled": true}, {"id": 5, "category": "Asados al barril", "name": "Pollo colorado al barril", "price": 5.5, "description": "¼ de pollo colorado al barril con papas salteadas, ensalada y salsa de la casa.", "enabled": true}, {"id": 6, "category": "Asados al barril", "name": "Bandeja familiar Toscana", "price": 24.0, "description": "4 filetes de pollo, 4 chuletas de cerdo, 6 chorizos, patacones para 4 personas, 4 arroces moro, 4 menestras, ensalada, chimichurri y salsas.", "enabled": true}, {"id": 7, "category": "Asados al barril", "name": "Cuy al barril", "price": 22.0, "description": "Cuy grande entero, papas criollas con salsa de maní, mote y ensalada. Porciones para 4 personas.", "enabled": true}, {"id": 8, "category": "Choripanes", "name": "Choripán clásico argentino", "price": 3.5, "description": "Chorizo al barril, pan baguette tostado, chimichurri casero, salsa criolla, cebolla caramelizada y papas fritas.", "enabled": true}, {"id": 9, "category": "Choripanes", "name": "Choripán mexicano", "price": 3.75, "description": "Chorizo al barril, pan baguette tostado, guacamole, salsa criolla picante, cebolla caramelizada y papas fritas.", "enabled": true}, {"id": 10, "category": "Choripanes", "name": "Choripán italiano Toscana", "price": 3.75, "description": "Chorizo al barril, pan baguette tostado, queso mozzarella, salsa especial de tomate con albahaca y orégano, y papas fritas.", "enabled": true}, {"id": 11, "category": "Especiales", "name": "Llapingacho barrilero", "price": 4.75, "description": "Llapingacho con carne de cerdo desmechada al barril, chorizo, huevo, aguacate y ají.", "enabled": true}, {"id": 12, "category": "Especiales", "name": "Fritada de la casa", "price": 5.0, "description": "Fritada con mote, maduros, papas criollas, tostado, encurtido y ají.", "enabled": true}, {"id": 13, "category": "Especiales", "name": "Hornado", "price": 5.25, "description": "Hornado con mote, tortilla de papa, ensalada, cuero crocante y ají.", "enabled": true}, {"id": 14, "category": "Caldos", "name": "Caldo de pata", "price": 3.5, "description": "Caldo tradicional de pata.", "enabled": true}, {"id": 15, "category": "Adicionales", "name": "Arroz moro con queso mozzarella", "price": 2.5, "description": "Porción adicional.", "enabled": true}, {"id": 16, "category": "Adicionales", "name": "Arroz blanco", "price": 1.5, "description": "Porción adicional.", "enabled": true}, {"id": 17, "category": "Adicionales", "name": "Porción de papas", "price": 1.5, "description": "Porción adicional.", "enabled": true}, {"id": 18, "category": "Adicionales", "name": "Porción de ensalada", "price": 1.25, "description": "Porción adicional.", "enabled": true}, {"id": 19, "category": "Adicionales", "name": "Menestra", "price": 1.5, "description": "Porción adicional.", "enabled": true}, {"id": 20, "category": "Adicionales", "name": "Chorizo", "price": 0.6, "description": "Unidad adicional.", "enabled": true}, {"id": 21, "category": "Adicionales", "name": "Plato de patacones", "price": 1.75, "description": "Porción adicional.", "enabled": true}, {"id": 22, "category": "Limonadas", "name": "Limonada clásica - vaso", "price": 1.0, "description": "Vaso individual.", "enabled": true}, {"id": 23, "category": "Limonadas", "name": "Limonada clásica - jarra", "price": 3.5, "description": "Jarra para compartir.", "enabled": true}, {"id": 24, "category": "Limonadas", "name": "Limonada de fresa - vaso", "price": 1.5, "description": "Vaso individual.", "enabled": true}, {"id": 25, "category": "Limonadas", "name": "Limonada de fresa - jarra", "price": 4.5, "description": "Jarra para compartir.", "enabled": true}, {"id": 26, "category": "Limonadas", "name": "Limonada de coco - vaso", "price": 1.75, "description": "Vaso individual.", "enabled": true}, {"id": 27, "category": "Limonadas", "name": "Limonada de coco - jarra", "price": 5.0, "description": "Jarra para compartir.", "enabled": true}, {"id": 28, "category": "Jugos naturales", "name": "Jugo de mora - vaso", "price": 1.5, "description": "Vaso individual.", "enabled": true}, {"id": 29, "category": "Jugos naturales", "name": "Jugo de mora - jarra", "price": 4.5, "description": "Jarra para compartir.", "enabled": true}, {"id": 30, "category": "Jugos naturales", "name": "Jugo de naranjilla - vaso", "price": 1.5, "description": "Vaso individual.", "enabled": true}, {"id": 31, "category": "Jugos naturales", "name": "Jugo de naranjilla - jarra", "price": 4.5, "description": "Jarra para compartir.", "enabled": true}, {"id": 32, "category": "Jugos naturales", "name": "Jugo de coco - vaso", "price": 1.75, "description": "Vaso individual.", "enabled": true}, {"id": 33, "category": "Jugos naturales", "name": "Jugo de coco - jarra", "price": 5.0, "description": "Jarra para compartir.", "enabled": true}, {"id": 34, "category": "Bebidas", "name": "Gaseosa personal", "price": 1.0, "description": "Presentación personal.", "enabled": true}, {"id": 35, "category": "Bebidas", "name": "Gaseosa 1 litro", "price": 2.75, "description": "Botella de 1 litro.", "enabled": true}, {"id": 36, "category": "Bebidas", "name": "Botella de agua", "price": 0.75, "description": "Agua embotellada.", "enabled": true}, {"id": 37, "category": "Bebidas", "name": "Cerveza personal", "price": 1.5, "description": "Presentación personal.", "enabled": true}];
  }
}

function sanitizeText(value, max = 250) {
  return String(value ?? "")
    .replace(/[<>{}`]/g, "")
    .replace(/[\u0000-\u001F\u007F]/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, max);
}

function renderCategories() {
  elements.categoryFilters.replaceChildren();
  const categories = ["Todos", ...new Set(MENU.map(item => item.category))];

  for (const category of categories) {
    const button = createElement("button", `filter-btn${category === activeCategory ? " active" : ""}`, category);
    button.type = "button";
    button.addEventListener("click", () => {
      activeCategory = category;
      renderCategories();
      renderMenu();
    });
    elements.categoryFilters.appendChild(button);
  }
}

function renderMenu() {
  elements.menuGrid.replaceChildren();
  const items = activeCategory === "Todos"
    ? MENU
    : MENU.filter(item => item.category === activeCategory);

  if (!items.length) {
    elements.menuGrid.appendChild(createElement("div", "cart-empty", "No hay productos disponibles."));
    return;
  }

  for (const item of items) {
    const card = createElement("article", "card");
    card.append(
      createElement("span", "category", item.category),
      createElement("h3", "", item.name),
      createElement("p", "description", item.description)
    );

    const footer = createElement("div", "card-footer");
    footer.appendChild(createElement("span", "price", money(item.price)));

    const button = createElement("button", "add-btn", "Agregar");
    button.type = "button";
    button.addEventListener("click", () => addToCart(item.id));
    footer.appendChild(button);
    card.appendChild(footer);
    elements.menuGrid.appendChild(card);
  }
}

function addToCart(id) {
  const product = MENU.find(item => item.id === id);
  if (!product) return;

  const current = cart.get(id);
  const quantity = current ? current.quantity + 1 : 1;
  if (quantity > CONFIG.maxQuantityPerItem) {
    alert(`Máximo ${CONFIG.maxQuantityPerItem} unidades por producto.`);
    return;
  }
  cart.set(id, { ...product, quantity });
  renderCart();
}

function changeQuantity(id, delta) {
  const item = cart.get(id);
  if (!item) return;
  const quantity = item.quantity + delta;

  if (quantity <= 0) cart.delete(id);
  else if (quantity <= CONFIG.maxQuantityPerItem) cart.set(id, { ...item, quantity });
  renderCart();
}

function getTotals() {
  const items = [...cart.values()];
  const count = items.reduce((sum, item) => sum + item.quantity, 0);
  const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const type = elements.orderType.value;
  const disposables = ["Para llevar", "Domicilio"].includes(type)
    ? count * CONFIG.disposableFeePerItem
    : 0;
  const delivery = type === "Domicilio" ? CONFIG.deliveryFee : 0;
  return { count, subtotal, disposables, delivery, total: subtotal + disposables + delivery };
}

function renderCart() {
  elements.cartItems.replaceChildren();
  const items = [...cart.values()];

  if (!items.length) {
    elements.cartItems.appendChild(createElement("div", "cart-empty", "Aún no has agregado productos."));
  }

  for (const item of items) {
    const box = createElement("div", "cart-item");
    const top = createElement("div", "cart-item-top");
    top.append(
      createElement("span", "", item.name),
      createElement("span", "", money(item.price * item.quantity))
    );

    const row = createElement("div", "qty-row");
    const controls = createElement("div", "qty-control");
    const minus = createElement("button", "", "−");
    minus.type = "button";
    minus.addEventListener("click", () => changeQuantity(item.id, -1));
    const qty = createElement("strong", "", String(item.quantity));
    const plus = createElement("button", "", "+");
    plus.type = "button";
    plus.addEventListener("click", () => changeQuantity(item.id, 1));
    controls.append(minus, qty, plus);

    const remove = createElement("button", "remove-btn", "Eliminar");
    remove.type = "button";
    remove.addEventListener("click", () => {
      cart.delete(item.id);
      renderCart();
    });

    row.append(controls, remove);
    box.append(top, row);
    elements.cartItems.appendChild(box);
  }

  const totals = getTotals();
  elements.cartCount.textContent = totals.count;
  elements.floatingCount.textContent = totals.count;
  elements.cartSubtotal.textContent = money(totals.subtotal);
  elements.disposablesTotal.textContent = money(totals.disposables);
  elements.deliveryTotal.textContent = money(totals.delivery);
  elements.disposablesRow.hidden = totals.disposables === 0;
  elements.deliveryRow.hidden = totals.delivery === 0;
  elements.cartTotal.textContent = money(totals.total);
}

function getTimeParts(date = new Date()) {
  return Object.fromEntries(
    new Intl.DateTimeFormat("en-US", {
      timeZone: CONFIG.timezone,
      weekday: "long",
      hour: "2-digit",
      minute: "2-digit",
      hour12: false
    }).formatToParts(date)
      .filter(part => part.type !== "literal")
      .map(part => [part.type, part.value])
  );
}

function getTodaySchedule(date = new Date()) {
  const key = String(getTimeParts(date).weekday || "").toLowerCase();
  return CONFIG.businessHours[key] || { enabled: false, opens: "00:00", closes: "00:00" };
}

function isOpen(date = new Date()) {
  const parts = getTimeParts(date);
  const schedule = getTodaySchedule(date);
  if (!schedule.enabled) return false;

  const current = Number(parts.hour) * 60 + Number(parts.minute);
  const [oh, om] = schedule.opens.split(":").map(Number);
  const [ch, cm] = schedule.closes.split(":").map(Number);
  return current >= oh * 60 + om && current < ch * 60 + cm;
}

function getStatusText(date = new Date()) {
  const parts = getTimeParts(date);
  const schedule = getTodaySchedule(date);
  const names = {
    monday: "lunes", tuesday: "martes", wednesday: "miércoles",
    thursday: "jueves", friday: "viernes", saturday: "sábado", sunday: "domingo"
  };
  const key = String(parts.weekday || "").toLowerCase();
  if (!schedule.enabled) return `Cerrado hoy (${names[key] || "hoy"})`;
  return `${isOpen(date) ? "Abierto ahora" : "Cerrado"} · ${names[key]} ${schedule.opens} a ${schedule.closes}`;
}

function getDateTime(date = new Date()) {
  return new Intl.DateTimeFormat("es-EC", {
    timeZone: CONFIG.timezone,
    dateStyle: "full",
    timeStyle: "medium"
  }).format(date);
}

function updateClock() {
  const open = isOpen();
  elements.currentDateTime.textContent = `Hora Ecuador · ${getDateTime()}`;
  elements.scheduleStatus.textContent = getStatusText();
  elements.scheduleStatus.classList.toggle("open", open);
  elements.scheduleStatus.classList.toggle("closed", !open);
}

function updateOrderFields() {
  const type = elements.orderType.value;
  const table = type === "Consumo en mesa";
  const delivery = type === "Domicilio";
  elements.tableFields.classList.toggle("visible", table);
  elements.deliveryFields.classList.toggle("visible", delivery);
  elements.tableNumber.disabled = !table;
  elements.deliveryAddress.disabled = !delivery;
  elements.deliveryReference.disabled = !delivery;
  renderCart();
}

function getOrder() {
  return {
    type: elements.orderType.value,
    table: sanitizeText(elements.tableNumber.value, 3),
    name: sanitizeText(elements.customerName.value, 60),
    address: sanitizeText(elements.deliveryAddress.value, 180),
    reference: sanitizeText(elements.deliveryReference.value, 180),
    notes: sanitizeText(elements.orderNotes.value, 250),
    items: [...cart.values()],
    totals: getTotals()
  };
}

function validateOrder(order) {
  if (!order.items.length) return "Agrega al menos un producto.";
  if (order.type === "Consumo en mesa" && !/^\d{1,3}$/.test(order.table)) return "Ingresa un número de mesa válido.";
  if (order.type === "Domicilio" && order.address.length < 8) return "Ingresa una dirección más precisa.";
  if (order.type === "Domicilio" && order.reference.length < 4) return "Ingresa una referencia.";
  if (!/^\d{8,15}$/.test(CONFIG.whatsappNumber)) return "El número de WhatsApp no está configurado correctamente.";
  if (!isOpen()) return `Toscana Grill se encuentra cerrado. ${getStatusText()}.`;
  return "";
}

function renderReview(order) {
  elements.reviewContent.replaceChildren();
  const block = createElement("div", "review-block");
  block.appendChild(createElement("h3", "", "Resumen del pedido"));

  const info = [
    ["Tipo", order.type],
    ...(order.type === "Consumo en mesa" ? [["Mesa", order.table]] : []),
    ...(order.type === "Domicilio" ? [["Dirección", order.address], ["Referencia", order.reference]] : []),
    ["Cliente", order.name || "No indicado"]
  ];
  for (const [label, value] of info) {
    const row = createElement("div", "review-row");
    row.append(createElement("span", "", label), createElement("strong", "", value));
    block.appendChild(row);
  }

  const products = createElement("div", "review-block");
  products.appendChild(createElement("h3", "", "Productos"));
  for (const item of order.items) {
    const row = createElement("div", "review-item");
    row.append(
      createElement("span", "", `${item.quantity} × ${item.name}`),
      createElement("strong", "", money(item.price * item.quantity))
    );
    products.appendChild(row);
  }

  const totals = createElement("div", "review-block");
  totals.appendChild(createElement("h3", "", "Totales"));
  const values = [
    ["Subtotal", order.totals.subtotal],
    ...(order.totals.disposables ? [["Desechables", order.totals.disposables]] : []),
    ...(order.totals.delivery ? [["Delivery", order.totals.delivery]] : []),
    ["Total", order.totals.total]
  ];
  for (const [label, value] of values) {
    const row = createElement("div", "review-row");
    row.append(createElement("span", "", label), createElement("strong", "", money(value)));
    totals.appendChild(row);
  }

  elements.reviewContent.append(block, products, totals);
}

function openReview() {
  const order = getOrder();
  const error = validateOrder(order);
  if (error) return alert(error);
  elements.cartPanel.classList.remove("open");
  renderReview(order);
  elements.orderReviewModal.hidden = false;
  document.body.classList.add("modal-open");
}

function closeReview() {
  elements.orderReviewModal.hidden = true;
  document.body.classList.remove("modal-open");
}

function nextOrderCode() {
  const now = new Date();
  const date = new Intl.DateTimeFormat("en-CA", {
    timeZone: CONFIG.timezone, year: "numeric", month: "2-digit", day: "2-digit"
  }).format(now).replaceAll("-", "");

  const key = "toscana_order_sequence";
  let state = {};
  try { state = JSON.parse(localStorage.getItem(key)) || {}; } catch {}
  const sequence = state.date === date ? Number(state.sequence || 0) + 1 : 1;
  localStorage.setItem(key, JSON.stringify({ date, sequence }));
  return `TG-${date}-${String(sequence).padStart(4, "0")}`;
}

function sendWhatsApp() {
  const order = getOrder();
  const error = validateOrder(order);
  if (error) return alert(error);

  if (order.type === "Domicilio" && !confirm("El costo base aplica dentro de la zona urbana. Fuera de esta zona puede variar.\n\n¿Deseas continuar?")) return;

  const code = nextOrderCode();
  const lines = [
    `🔥 *Pedido #${code}*`,
    "",
    `*Fecha y hora:* ${getDateTime()}`,
    `*Tipo:* ${order.type}`,
    ...(order.type === "Consumo en mesa" ? [`*Mesa:* ${order.table}`] : []),
    ...(order.type === "Domicilio" ? [`*Dirección:* ${order.address}`, `*Referencia:* ${order.reference}`] : []),
    `*Cliente:* ${order.name || "No indicado"}`,
    "",
    "*Detalle:*",
    ...order.items.map(item => `• ${item.quantity} x ${item.name} — ${money(item.price * item.quantity)}`),
    "",
    `*Subtotal:* ${money(order.totals.subtotal)}`,
    ...(order.totals.disposables ? [`*Desechables:* ${money(order.totals.disposables)}`] : []),
    ...(order.totals.delivery ? [`*Delivery:* ${money(order.totals.delivery)}`] : []),
    `*Total:* ${money(order.totals.total)}`,
    ...(order.notes ? [`*Observaciones:* ${order.notes}`] : []),
    "",
    "Por favor confirmar recepción."
  ];

  window.open(`https://wa.me/${CONFIG.whatsappNumber}?text=${encodeURIComponent(lines.join("\n"))}`, "_blank", "noopener,noreferrer");
  closeReview();

  // Limpia el pedido actual después de abrir WhatsApp.
  cart.clear();
  elements.orderType.value = "Consumo en mesa";
  elements.tableNumber.value = "";
  elements.customerName.value = "";
  elements.deliveryAddress.value = "";
  elements.deliveryReference.value = "";
  elements.orderNotes.value = "";
  updateOrderFields();
  renderCart();
}


function resetOrder() {
  const hasData =
    cart.size > 0 ||
    elements.tableNumber.value.trim() ||
    elements.customerName.value.trim() ||
    elements.deliveryAddress.value.trim() ||
    elements.deliveryReference.value.trim() ||
    elements.orderNotes.value.trim();

  if (hasData) {
    const confirmed = window.confirm(
      "Se eliminarán los productos y datos del pedido actual.\n\n¿Deseas iniciar un nuevo pedido?"
    );
    if (!confirmed) return;
  }

  cart.clear();
  elements.orderType.value = "Consumo en mesa";
  elements.tableNumber.value = "";
  elements.customerName.value = "";
  elements.deliveryAddress.value = "";
  elements.deliveryReference.value = "";
  elements.orderNotes.value = "";

  closeReview();
  updateOrderFields();
  renderCart();

  elements.cartPanel.classList.remove("open");
  window.scrollTo({ top: 0, behavior: "smooth" });
}

function bindEvents() {
  elements.orderType.addEventListener("change", updateOrderFields);
  elements.openCartButton.addEventListener("click", () => elements.cartPanel.classList.toggle("open"));
  elements.floatingCartButton.addEventListener("click", () => elements.cartPanel.classList.toggle("open"));
  elements.reviewOrderButton.addEventListener("click", openReview);
  elements.newOrderButton.addEventListener("click", resetOrder);
  elements.closeCartButton.addEventListener("click", () => elements.cartPanel.classList.remove("open"));
  elements.closeReviewButton.addEventListener("click", closeReview);
  elements.editOrderButton.addEventListener("click", closeReview);
  elements.confirmWhatsAppButton.addEventListener("click", sendWhatsApp);
  elements.orderReviewModal.addEventListener("click", event => {
    if (event.target === elements.orderReviewModal) closeReview();
  });
}

async function init() {
  await loadData();
  renderCategories();
  renderMenu();
  renderCart();
  updateOrderFields();
  updateClock();
  bindEvents();
  setInterval(updateClock, 1000);
}

document.addEventListener("DOMContentLoaded", () => {
  init().catch(error => {
    console.error("Error al iniciar Toscana Grill:", error);
    const clock = document.getElementById("currentDateTime");
    if (clock) {
      clock.textContent = new Intl.DateTimeFormat("es-EC", {
        timeZone: "America/Guayaquil",
        dateStyle: "full",
        timeStyle: "medium"
      }).format(new Date());
    }
  });
});
})();
