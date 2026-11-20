/* ============================================================
   AUSTOLED PLANNER MOBILE — UI di base
   Icone, stato, persistenza, guscio dell'app e viste Setup/Sintesi.
   ============================================================ */
"use strict";

const APP_VERSION = "2.0.0";

/* ---------- Icone (SVG inline, nessuna dipendenza) ---------- */
const ICONS = {
  led: '<rect x="3" y="3" width="7" height="7" rx="1.6"/><rect x="14" y="3" width="7" height="7" rx="1.6"/><rect x="3" y="14" width="7" height="7" rx="1.6"/><rect x="14" y="14" width="7" height="7" rx="1.6"/>',
  sliders: '<line x1="21" y1="4" x2="14" y2="4"/><line x1="10" y1="4" x2="3" y2="4"/><line x1="21" y1="12" x2="12" y2="12"/><line x1="8" y1="12" x2="3" y2="12"/><line x1="21" y1="20" x2="16" y2="20"/><line x1="12" y1="20" x2="3" y2="20"/><line x1="14" y1="2" x2="14" y2="6"/><line x1="8" y1="10" x2="8" y2="14"/><line x1="16" y1="18" x2="16" y2="22"/>',
  grid: '<rect x="3" y="3" width="18" height="18" rx="2"/><path d="M3 9h18"/><path d="M3 15h18"/><path d="M9 3v18"/><path d="M15 3v18"/>',
  eye: '<path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12Z"/><circle cx="12" cy="12" r="3"/>',
  box: '<path d="m7.5 4.27 9 5.15"/><path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z"/><path d="m3.3 7 8.7 5 8.7-5"/><path d="M12 22V12"/>',
  share: '<circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><line x1="8.6" y1="10.5" x2="15.4" y2="6.5"/><line x1="8.6" y1="13.5" x2="15.4" y2="17.5"/>',
  sun: '<circle cx="12" cy="12" r="4"/><path d="M12 2v2"/><path d="M12 20v2"/><path d="m4.93 4.93 1.41 1.41"/><path d="m17.66 17.66 1.41 1.41"/><path d="M2 12h2"/><path d="M20 12h2"/><path d="m6.34 17.66-1.41 1.41"/><path d="m19.07 4.93-1.41 1.41"/>',
  moon: '<path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z"/>',
  plus: '<path d="M12 5v14"/><path d="M5 12h14"/>',
  minus: '<path d="M5 12h14"/>',
  undo: '<path d="M9 14 4 9l5-5"/><path d="M4 9h10a6 6 0 0 1 0 12h-3"/>',
  redo: '<path d="m15 14 5-5-5-5"/><path d="M20 9H10a6 6 0 0 0 0 12h3"/>',
  reset: '<path d="M3 12a9 9 0 1 0 3-6.7L3 8"/><path d="M3 3v5h5"/>',
  user: '<path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>',
  cpu: '<rect x="4" y="4" width="16" height="16" rx="2"/><rect x="9" y="9" width="6" height="6"/><path d="M9 2v2"/><path d="M15 2v2"/><path d="M9 20v2"/><path d="M15 20v2"/><path d="M2 9h2"/><path d="M2 15h2"/><path d="M20 9h2"/><path d="M20 15h2"/>',
  ruler: '<path d="M21.3 15.3a2.4 2.4 0 0 1 0 3.4l-2.6 2.6a2.4 2.4 0 0 1-3.4 0L2.7 8.7a2.41 2.41 0 0 1 0-3.4l2.6-2.6a2.41 2.41 0 0 1 3.4 0Z"/><path d="m14.5 12.5 2-2"/><path d="m11.5 9.5 2-2"/><path d="m8.5 6.5 2-2"/><path d="m17.5 15.5 2-2"/>',
  zap: '<path d="M4 14a1 1 0 0 1-.78-1.63l9.9-10.2a.5.5 0 0 1 .86.46l-1.92 6.02A1 1 0 0 0 13 10h7a1 1 0 0 1 .78 1.63l-9.9 10.2a.5.5 0 0 1-.86-.46l1.92-6.02A1 1 0 0 0 11 14z"/>',
  structure: '<path d="M4 21V8l8-5 8 5v13"/><path d="M4 12h16"/><path d="M8 21v-5h8v5"/>',
  settings: '<path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"/><circle cx="12" cy="12" r="3"/>',
  alert: '<path d="M10.3 3.9 1.8 18a2 2 0 0 0 1.7 3h17a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0Z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/>',
  info: '<circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/>',
  check: '<path d="m5 12 5 5L20 7"/>',
  monitor: '<rect x="2" y="3" width="20" height="14" rx="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/>',
  layers: '<path d="m12 2 9 5-9 5-9-5 9-5Z"/><path d="m3 12 9 5 9-5"/><path d="m3 17 9 5 9-5"/>',
  cable: '<path d="M9 2v6"/><path d="M15 2v6"/><path d="M6 8h12v3a6 6 0 0 1-12 0Z"/><path d="M12 17v5"/>',
  signal: '<path d="M2 20h.01"/><path d="M7 20v-4"/><path d="M12 20v-8"/><path d="M17 20V8"/><path d="M22 4v16"/>',
  download: '<path d="M12 3v12"/><path d="m7 10 5 5 5-5"/><path d="M5 21h14"/>',
  install: '<rect x="3" y="3" width="18" height="18" rx="4"/><path d="M12 8v8"/><path d="m8 12 4 4 4-4"/>',
  image: '<rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><path d="m21 15-5-5L5 21"/>',
  printer: '<path d="M6 9V3h12v6"/><rect x="6" y="13" width="12" height="8"/><path d="M6 17H4a2 2 0 0 1-2-2v-4a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v4a2 2 0 0 1-2 2h-2"/>',
  copy: '<rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>',
  link: '<path d="M10 13a5 5 0 0 0 7.5.5l3-3a5 5 0 0 0-7-7l-1.5 1.5"/><path d="M14 11a5 5 0 0 0-7.5-.5l-3 3a5 5 0 0 0 7 7l1.5-1.5"/>',
  file: '<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8Z"/><path d="M14 2v6h6"/><path d="M8 13h8"/><path d="M8 17h8"/>',
  chevron: '<path d="m6 9 6 6 6-6"/>',
  arrow: '<path d="M5 12h14"/><path d="m12 5 7 7-7 7"/>',
  target: '<circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="5"/><circle cx="12" cy="12" r="1.5"/>'
};

function icon(name, size) {
  const body = ICONS[name] || ICONS.info;
  const s = size || 20;
  return `<svg class="icon" width="${s}" height="${s}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${body}</svg>`;
}

/* ---------- Stato e persistenza ---------- */
let state = defaultState();
let calc = compute(state);
let activeTab = "setup";
let vistaMode = "prospetto";
let undoStack = [];
let redoStack = [];
let deferredPrompt = null;
let toastTimer = null;
let saveTimer = null;
let hashTimer = null;
let focusSnapshot = null;

function snapshot() {
  return JSON.stringify(state);
}

function b64encode(str) {
  const bytes = new TextEncoder().encode(str);
  let bin = "";
  for (let i = 0; i < bytes.length; i++) bin += String.fromCharCode(bytes[i]);
  return btoa(bin).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function b64decode(str) {
  let s = str.replace(/-/g, "+").replace(/_/g, "/");
  while (s.length % 4) s += "=";
  const bin = atob(s);
  const bytes = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
  return new TextDecoder().decode(bytes);
}

function decodeHashState() {
  const match = location.hash.match(/cfg=([^&]+)/);
  if (!match) return null;
  try {
    return JSON.parse(b64decode(match[1]));
  } catch (err) {
    return null;
  }
}

function loadState() {
  const fromHash = decodeHashState();
  if (fromHash) return normalizeState(fromHash);
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return normalizeState(JSON.parse(raw));
  } catch (err) { /* storage non disponibile */ }
  return defaultState();
}

function saveState() {
  clearTimeout(saveTimer);
  saveTimer = setTimeout(function () {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch (err) { /* modalità privata */ }
  }, 180);
  scheduleHash();
}

function scheduleHash() {
  clearTimeout(hashTimer);
  hashTimer = setTimeout(updateHash, 500);
}

function updateHash() {
  try {
    const encoded = b64encode(JSON.stringify(state));
    history.replaceState(null, "", "#cfg=" + encoded);
  } catch (err) { /* file:// o URL troppo lungo */ }
}

function getPath(obj, path) {
  return path.split(".").reduce(function (acc, key) {
    return acc == null ? undefined : acc[key];
  }, obj);
}

function setPath(obj, path, value) {
  const keys = path.split(".");
  let cur = obj;
  for (let i = 0; i < keys.length - 1; i++) {
    if (cur[keys[i]] == null || typeof cur[keys[i]] !== "object") cur[keys[i]] = {};
    cur = cur[keys[i]];
  }
  cur[keys[keys.length - 1]] = value;
}

function parseNum(value) {
  const n = parseFloat(String(value == null ? "" : value).replace(",", "."));
  return Number.isFinite(n) ? n : 0;
}

function roundValue(value) {
  return Math.round(value * 1000) / 1000;
}

function pushHistory() {
  undoStack.push(snapshot());
  if (undoStack.length > 40) undoStack.shift();
  redoStack = [];
}

function commitFocusedHistory() {
  if (focusSnapshot && focusSnapshot !== snapshot()) {
    undoStack.push(focusSnapshot);
    if (undoStack.length > 40) undoStack.shift();
    redoStack = [];
  }
  focusSnapshot = null;
}

/* ---------- Helper di rendering ---------- */
function card(title, iconName, body, badge) {
  return `<section class="card">
    <div class="card__head">
      <span class="card__icon">${icon(iconName, 18)}</span>
      <h2 class="card__title">${esc(title)}</h2>
      ${badge ? `<span class="card__badge">${badge}</span>` : ""}
    </div>
    ${body}
  </section>`;
}

function detailsCard(id, title, iconName, body, open) {
  return `<details class="card card--details" id="${id}"${open ? " open" : ""}>
    <summary>
      <span class="card__icon">${icon(iconName, 18)}</span>
      <span class="card__title">${esc(title)}</span>
      <span class="chev">${icon("chevron", 18)}</span>
    </summary>
    <div class="details-body">${body}</div>
  </details>`;
}

function metric(label, value, unit, iconName, tone) {
  return `<div class="metric${tone ? " metric--" + tone : ""}">
    ${iconName ? `<span class="metric__icon">${icon(iconName, 17)}</span>` : ""}
    <div class="metric__label">${esc(label)}</div>
    <div class="metric__value">${value}${unit ? `<span class="metric__unit"> ${esc(unit)}</span>` : ""}</div>
  </div>`;
}

function row(label, value) {
  return `<div class="row"><span class="row__label">${esc(label)}</span><span class="row__value">${value}</span></div>`;
}

function note(level, text) {
  const names = { danger: "alert", warn: "alert", info: "info", ok: "check" };
  return `<div class="note note--${level}">${icon(names[level] || "info", 17)}<span>${esc(text)}</span></div>`;
}

function counter(label, field, value, step, min, max, unit, hint) {
  const val = Number.isFinite(Number(value)) ? Number(value) : 0;
  const st = step == null ? 1 : step;
  const mn = min == null ? 0 : min;
  const mx = max == null ? 9999 : max;
  return `<div class="counter">
    <div class="counter__label">${esc(label)}${hint ? `<small>${esc(hint)}</small>` : ""}</div>
    <div class="counter__controls">
      <button class="step-btn" type="button" data-step="${field}" data-delta="${-st}" data-min="${mn}" data-max="${mx}" aria-label="Diminuisci ${esc(label)}">${icon("minus", 16)}</button>
      <div class="counter__field">
        <input class="counter__value" type="number" data-num="${field}" value="${val}" min="${mn}" max="${mx}" step="${st}" inputmode="decimal" aria-label="${esc(label)}">
        ${unit ? `<span class="counter__unit">${esc(unit)}</span>` : ""}
      </div>
      <button class="step-btn" type="button" data-step="${field}" data-delta="${st}" data-min="${mn}" data-max="${mx}" aria-label="Aumenta ${esc(label)}">${icon("plus", 16)}</button>
    </div>
  </div>`;
}

function toggleRow(label, field, active, hint) {
  return `<div class="toggle-row">
    <div class="toggle-row__text">
      <strong>${esc(label)}</strong>
      ${hint ? `<small>${esc(hint)}</small>` : ""}
    </div>
    <button class="toggle${active ? " is-on" : ""}" type="button" role="switch" aria-checked="${active ? "true" : "false"}" data-toggle="${field}" aria-label="${esc(label)}"></button>
  </div>`;
}

function fieldText(label, field, value, placeholder, hint) {
  return `<label class="field">
    <span class="field__label">${esc(label)}</span>
    <input class="input" type="text" data-text="${field}" value="${esc(value)}" placeholder="${esc(placeholder || "")}" autocomplete="off" spellcheck="false">
    ${hint ? `<span class="hint">${esc(hint)}</span>` : ""}
  </label>`;
}

function fieldArea(label, field, value, placeholder) {
  return `<label class="field">
    <span class="field__label">${esc(label)}</span>
    <textarea class="input input--area" data-text="${field}" placeholder="${esc(placeholder || "")}">${esc(value)}</textarea>
  </label>`;
}

function segmented(options, current, attribute) {
  return `<div class="segmented" role="tablist">${options.map(function (opt) {
    return `<button type="button" role="tab" aria-selected="${opt.value === current ? "true" : "false"}" class="${opt.value === current ? "is-active" : ""}" ${attribute}="${opt.value}">${icon(opt.icon, 16)} ${esc(opt.label)}</button>`;
  }).join("")}</div>`;
}

/* ---------- Guscio ---------- */
function liveStripHTML() {
  const d = calc.dimensions;
  return `<div class="livebar__item"><span>DIM</span><strong>${fmtNum(d.realW, 2)} × ${fmtNum(d.realH, 2)} m</strong></div>
  <div class="livebar__item"><span>RES</span><strong>${d.resW} × ${d.resH}</strong></div>
  <div class="livebar__item"><span>POWER</span><strong>${fmtNum(calc.power.totalKW, 2)} kW</strong></div>`;
}

function topbarHTML() {
  return `<header class="topbar">
    <div class="topbar__row">
      <div class="brand">
        <div class="brand__mark">${icon("led", 22)}</div>
        <div class="brand__text">
          <h1>AUSTOLED <span>PLANNER</span></h1>
          <p>MOBILE · v2.0</p>
        </div>
      </div>
      <div class="topbar__actions">
        <span class="version">v${APP_VERSION}</span>
        <button class="icon-btn" type="button" data-action="theme" aria-label="Cambia tema">${icon(state.theme === "dark" ? "sun" : "moon", 20)}</button>
      </div>
    </div>
    <div class="livebar" id="live-strip">${liveStripHTML()}</div>
  </header>`;
}

function tabbarHTML() {
  const tabs = [
    { id: "setup", label: "Setup", icon: "sliders" },
    { id: "sintesi", label: "Sintesi", icon: "grid" },
    { id: "vista", label: "Vista", icon: "eye" },
    { id: "materiali", label: "Materiali", icon: "box" },
    { id: "export", label: "Export", icon: "share" }
  ];
  return `<nav class="tabbar" role="tablist" aria-label="Sezioni dell'app">${tabs.map(function (tab) {
    const active = tab.id === activeTab;
    return `<button class="tab${active ? " is-active" : ""}" type="button" role="tab" aria-selected="${active ? "true" : "false"}" data-tab="${tab.id}">${icon(tab.icon, 21)}<span>${tab.label}</span></button>`;
  }).join("")}</nav>`;
}

function modelOptions() {
  return MODEL_GROUPS.map(function (group) {
    return `<optgroup label="${esc(group.label)}">${group.items.map(function (name) {
      return `<option value="${esc(name)}"${state.pixelPitch === name ? " selected" : ""}>${esc(modelLabel(name))}</option>`;
    }).join("")}</optgroup>`;
  }).join("");
}

/* ---------- Vista Setup ---------- */
function setupHTML() {
  const tile = calc.tile;
  const d = calc.dimensions;
  const isCustom = state.pixelPitch === "Custom";
  const mixed = calc.mixed;

  const customer = card("Progetto", "user", `
    ${fieldText("Cliente / evento", "customerName", state.customerName, "Es. PRADA H 1 MT DA TERRA", "Scrivi “H 2 MT” nel nome per impostare l’altezza da terra.")}
    <div class="row-actions">
      <button class="btn btn--ghost btn--sm" type="button" data-action="undo"${undoStack.length ? "" : " disabled"}>${icon("undo", 15)} Annulla</button>
      <button class="btn btn--ghost btn--sm" type="button" data-action="redo"${redoStack.length ? "" : " disabled"}>${icon("redo", 15)} Ripeti</button>
      <button class="btn btn--ghost btn--sm btn--danger" type="button" data-action="reset">${icon("reset", 15)} Reset</button>
    </div>
  `, `<span class="badge">${new Date().toLocaleDateString("it-IT", { day: "2-digit", month: "short" })}</span>`);

  const model = card("Modello LED", "cpu", `
    <label class="field">
      <span class="field__label">Modello / passo</span>
      <div class="select-wrap">
        <select class="input select" data-select="pixelPitch" aria-label="Modello LED">${modelOptions()}</select>
        <span class="select-chev">${icon("chevron", 18)}</span>
      </div>
    </label>
    <div class="specs">
      <div class="spec"><span>Cabinet</span><strong>${fmtNum(tile.w * 100)} × ${fmtNum(tile.h * 100)} cm</strong></div>
      <div class="spec"><span>Risoluzione</span><strong>${tile.pxW} × ${tile.pxH} px</strong></div>
      <div class="spec"><span>Peso</span><strong>${fmtNum(tile.weight, 1)} kg</strong></div>
      <div class="spec"><span>Pz / cassa</span><strong>${tile.tilesPerCase}</strong></div>
    </div>
    ${mixed ? mixedPanelHTML() : ""}
    ${isCustom ? customPanelHTML() : ""}
    ${isP26(state.pixelPitch) ? `<div class="stack-sm">${note("danger", "Modelli P2.6: usare partenze PowerCON TRUE1 CEE/Civili. I PowerCON standard non sono compatibili.")}</div>` : ""}
  `, `<span class="badge badge--blue">${esc(calc.label)}</span>`);

  const dims = card("Dimensioni", "ruler", `
    ${counter("Larghezza", "width", state.width, 0.5, 0.5, 100, "m")}
    ${counter("Altezza", "height", state.height, 0.5, 0.5, 100, "m")}
    ${counter("H terra (filo inferiore)", "groundClearance", state.groundClearance, 0.1, 0, 25, "m")}
    <div class="chips" aria-label="Preset dimensioni">
      ${SIZE_PRESETS.map(function (preset) {
        const active = Math.abs(state.width - preset.w) < 0.01 && Math.abs(state.height - preset.h) < 0.01;
        return `<button class="chip${active ? " is-active" : ""}" type="button" data-size-w="${preset.w}" data-size-h="${preset.h}">${preset.label}</button>`;
      }).join("")}
    </div>
    <div class="inline-note" data-live="dims">${fmtM(d.realW)} × ${fmtM(d.realH)} · ${d.cols} × ${d.rows} moduli</div>
  `, `<span class="badge">${d.cols} × ${d.rows}</span>`);

  const electric = card("Elettrico", "zap", `
    ${counter("Consumo per tile", "powerPerTile", state.powerPerTile, 10, 0, 2000, "W")}
    <div class="inline-note">Totale ${fmtKW(calc.power.totalKW)} · ${fmtNum(calc.power.amps230, 1)} A (230 V) · ${calc.power.ceeSuggested} linee CEE 16A</div>
  `, `<span class="badge">${fmtNum(calc.power.totalKW, 1)} kW</span>`);

  const structure = card("Struttura", "structure", `
    ${toggleRow("Struttura", "useStructure", state.useStructure, "Gambe e supporto a terra")}
    ${toggleRow("Appendimento", "useHanging", state.useHanging, "Fly bar e sospensione")}
    ${state.useStructure ? counter("Gambe", "structure.feet", state.structure.feet, 1, 1, 20, "") : ""}
    <div class="inline-note">${state.useStructure ? "Dettaglio materiale in Materiali." : "Nessuna struttura: il LED wall è considerato appoggiato o sospeso a cura del cliente."}</div>
  `, `<span class="badge">${state.useStructure ? "ON" : "OFF"}</span>`);

  const advanced = detailsCard("det-advanced", "Avanzate", "settings", `
    ${counter("Linee segnale", "signalLines", state.signalLines, 1, 0, 60, "")}
    ${fieldArea("Note progetto", "notes", state.notes, "Annotazioni per il montaggio, il cliente o il magazzino…")}
    <div class="inline-note">Le modifiche vengono salvate automaticamente sul telefono.</div>
  `);

  return `<div class="stack">
    ${customer}
    ${model}
    ${dims}
    ${electric}
    ${structure}
    ${advanced}
  </div>`;
}

function mixedPanelHTML() {
  const m = calc.mixedInfo;
  return `<div class="panel panel--mixed">
    <div class="panel__head">${icon("layers", 16)} Configurazione mista 50×50 + 50×100</div>
    ${counter("Tile 50×50 attive", "tile50Count", state.tile50Count, 1, 0, 9999, "")}
    ${counter("Scorta 50×50", "tile50Spare", state.tile50Spare, 1, 0, 9999, "")}
    ${counter("Tile 50×100 attive", "tile100Count", state.tile100Count, 1, 0, 9999, "")}
    ${counter("Scorta 50×100", "tile100Spare", state.tile100Spare, 1, 0, 9999, "")}
    ${m ? `<div class="rows">
      ${row("Cabinet 50×50", `${fmtNum(m.tile50.w * 100)} × ${fmtNum(m.tile50.h * 100)} cm · ${m.tile50.pxW} × ${m.tile50.pxH} px · ${fmtNum(m.tile50.weight, 1)} kg`)}
      ${row("Cabinet 50×100", `${fmtNum(m.tile100.w * 100)} × ${fmtNum(m.tile100.h * 100)} cm · ${m.tile100.pxW} × ${m.tile100.pxH} px · ${fmtNum(m.tile100.weight, 1)} kg`)}
    </div>` : ""}
    <div class="inline-note">${m ? `${calc.dimensions.cols} colonne · ${m.rows50} righe 50×50 + ${m.rows100} righe 50×100` : "Inserisci le quantità."}</div>
  </div>`;
}

function customPanelHTML() {
  return `<div class="panel">
    <div class="panel__head">${icon("settings", 16)} Cabinet personalizzato</div>
    ${counter("Larghezza cabinet", "customTile.w", state.customTile.w, 0.1, 0.1, 5, "m")}
    ${counter("Altezza cabinet", "customTile.h", state.customTile.h, 0.1, 0.1, 5, "m")}
    ${counter("Risoluzione orizzontale", "customTile.pxW", state.customTile.pxW, 8, 8, 2048, "px")}
    ${counter("Risoluzione verticale", "customTile.pxH", state.customTile.pxH, 8, 8, 2048, "px")}
    ${counter("Peso cabinet", "customTile.weight", state.customTile.weight, 0.5, 0, 100, "kg")}
    ${counter("Pezzi per cassa", "customTile.tilesPerCase", state.customTile.tilesPerCase, 1, 1, 50, "")}
  </div>`;
}

/* ---------- Vista Sintesi ---------- */
function sintesiHTML() {
  const d = calc.dimensions;
  const t = calc.tiles;
  const p = calc.power;

  const metrics = `<div class="metrics">
    ${metric("Tile attive", fmtNum(t.active), "pz", "grid", "accent")}
    ${metric("Risoluzione", `${d.resW} × ${d.resH}`, "px", "monitor")}
    ${metric("Peso LED wall", fmtNum(t.totalWeight, t.totalWeight < 100 ? 1 : 0), "kg", "box")}
    ${metric("Consumo", fmtNum(p.totalKW, 2), "kW", "zap")}
  </div>`;

  const grid = card("Griglia moduli", "grid", `
    <div class="grid-preview">${gridSVG(calc)}</div>
    ${legendHTML()}
    <div class="rows">
      ${row("Configurazione", `${d.cols} col × ${d.rows} righe`)}
      ${row("Dimensioni reali", `${fmtM(d.realW)} × ${fmtM(d.realH)}`)}
      ${row("Risoluzione totale", `${d.resW} × ${d.resH} px`)}
      ${row("Rapporto d’aspetto", d.aspect)}
      ${row("Superficie LED", `${fmtNum(d.realW * d.realH, 2)} m²`)}
    </div>
  `, `<span class="badge badge--blue">${esc(calc.label)}</span>`);

  const processing = card("Processing video", "monitor", `
    <div class="metrics metrics--compact">
      ${metric("Porte uscita", String(p.ports), "porte", "layers")}
      ${metric("Max per porta", String(MAX_TILES_PER_PORT), "tile", "grid")}
    </div>
    <div class="rows">
      ${row("Scaler / sender consigliato", esc(calc.suggestedScaler))}
      ${row("Canvas di output", `${calc.canvas.width} × ${calc.canvas.height} px`)}
      ${row("LED nel canvas", `${d.resW} × ${d.resH} px`)}
      ${row("Pixel totali", `${fmtNum(d.resW * d.resH)} px`)}
    </div>
  `);

  const warnings = calc.warnings.length
    ? `<div class="stack-sm">${calc.warnings.map(function (w) { return note(w.level, w.text); }).join("")}</div>`
    : note("ok", "Nessun avviso: configurazione nei parametri.");

  const alerts = card("Avvisi tecnici", "alert", warnings, `<span class="badge">${calc.warnings.length}</span>`);

  const totals = card("Totali rapidi", "layers", `
    <div class="rows">
      ${row("Tile attive", String(t.active))}
      ${row("Scorte", String(t.spare))}
      ${row("Totale tile", String(t.total))}
      ${row("Bauli", `${t.cases} × ${t.tilesPerCase} pz`)}
      ${row("Spazi vuoti nei bauli", String(t.emptySpaces))}
      ${row("Peso per m²", `${fmtNum(t.weightPerM2, 1)} kg/m²`)}
      ${row("Assorbimento", `${fmtNum(p.amps230, 1)} A · ${fmtNum(p.amps400, 1)} A trifase`)}
      ${row("Quota totale", fmtM(calc.totalHeight))}
    </div>
  `);

  return `<div class="stack">
    ${metrics}
    ${grid}
    ${processing}
    ${alerts}
    ${totals}
  </div>`;
}

function legendHTML() {
  if (calc.mixed) {
    return `<div class="legend"><span><i class="dot dot--blue"></i>50×50</span><span><i class="dot dot--green"></i>50×100</span><span>${calc.dimensions.cols} colonne</span></div>`;
  }
  if (calc.cube && calc.cubeInfo && calc.cubeInfo.active > 0) {
    return `<div class="legend"><span><i class="dot dot--blue"></i>Standard</span><span><i class="dot dot--amber"></i>Cube</span><span>${calc.dimensions.cols} × ${calc.dimensions.rows}</span></div>`;
  }
  return `<div class="legend"><span><i class="dot dot--blue"></i>Tile LED</span><span>${calc.dimensions.cols} × ${calc.dimensions.rows} moduli</span></div>`;
}
