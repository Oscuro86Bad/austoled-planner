/* ============================================================
   AUSTOLED PLANNER MOBILE — eventi, rendering e avvio
   ============================================================ */
"use strict";

/* ---------- Rendering ---------- */
function tabHTML() {
  switch (activeTab) {
    case "sintesi": return sintesiHTML();
    case "vista": return vistaHTML();
    case "materiali": return materialiHTML();
    case "export": return exportHTML();
    default: return setupHTML();
  }
}

function applyTheme() {
  document.documentElement.dataset.theme = state.theme === "dark" ? "dark" : "light";
}

function updateMetaTheme() {
  const meta = document.querySelector('meta[name="theme-color"]');
  if (meta) meta.setAttribute("content", state.theme === "dark" ? "#060b16" : "#e8eef6");
}

function render(options) {
  const opts = options || {};
  const openIds = Array.prototype.map.call(document.querySelectorAll("details[open]"), function (item) {
    return item.id;
  }).filter(Boolean);
  const scrollY = window.scrollY;

  calc = compute(state);
  applyTheme();

  const app = document.getElementById("app");
  if (!app) return;
  app.innerHTML = `<div class="app-shell">
    ${topbarHTML()}
    <main class="view" id="view">${tabHTML()}</main>
    ${tabbarHTML()}
  </div>`;

  openIds.forEach(function (id) {
    const item = document.getElementById(id);
    if (item) item.open = true;
  });

  if (opts.scrollTop) window.scrollTo(0, 0);
  else window.scrollTo(0, scrollY);

  document.title = "AUSTOLED PLANNER — " + calc.label;
  updateMetaTheme();

  if (activeTab === "vista" && vistaMode === "canvas") initStage();
}

function updateLive() {
  calc = compute(state);
  const strip = document.getElementById("live-strip");
  if (strip) strip.innerHTML = liveStripHTML();
  const dims = document.querySelector('[data-live="dims"]');
  if (dims) {
    dims.textContent = fmtM(calc.dimensions.realW) + " × " + fmtM(calc.dimensions.realH) +
      " · " + calc.dimensions.cols + " × " + calc.dimensions.rows + " moduli";
  }
}

/* ---------- Azioni di stato ---------- */
function doStep(button) {
  const path = button.dataset.step;
  const delta = Number(button.dataset.delta) || 0;
  let min = Number(button.dataset.min);
  let max = Number(button.dataset.max);
  if (!Number.isFinite(min)) min = 0;
  if (!Number.isFinite(max)) max = 9999;
  if (path === "cubeCount") max = calc.dimensions.cols * calc.dimensions.rows;

  const current = Number(getPath(state, path)) || 0;
  const next = roundValue(clamp(current + delta, min, max));
  if (next === current) return;

  pushHistory();
  setPath(state, path, next);
  calc = compute(state);
  saveState();
  render();
  haptic();
}

function doToggle(path) {
  pushHistory();
  const next = !getPath(state, path);
  setPath(state, path, next);
  if (path === "useStructure" && next && (Number(state.structure.feet) || 0) < 1) {
    state.structure.feet = 2;
  }
  calc = compute(state);
  saveState();
  render();
  haptic();
}

function changeModel(value) {
  pushHistory();
  state.pixelPitch = value;

  if (isMixedModel(value)) {
    const mixed = MIXED_MODELS[value];
    const tileA = modelTile(mixed.a, null);
    const cols = Math.max(1, Math.ceil(state.width / tileA.w));
    const rows = Math.max(1, Math.ceil(state.height / tileA.h));
    if (!state.tile50Count && !state.tile100Count) {
      state.tile50Count = cols * rows;
      state.tile100Count = 0;
    }
  }

  if (value === "Custom" && !state.customTile) {
    state.customTile = defaultState().customTile;
  }

  state.canvas.offsetX = null;
  state.canvas.offsetY = null;
  calc = compute(state);
  saveState();
  render();
  haptic();
}

function changeCanvasPreset(value) {
  pushHistory();
  state.canvas.preset = value;
  const preset = CANVAS_PRESETS[value];
  if (value !== "custom" && preset) {
    state.canvas.width = preset.width;
    state.canvas.height = preset.height;
  }
  state.canvas.offsetX = null;
  state.canvas.offsetY = null;
  calc = compute(state);
  saveState();
  render();
  haptic();
}

function applySizePreset(width, height) {
  pushHistory();
  state.width = width;
  state.height = height;
  state.canvas.offsetX = null;
  state.canvas.offsetY = null;
  calc = compute(state);
  saveState();
  render();
  haptic();
}

function parseHeightFromName(name) {
  const match = String(name || "").match(/\bH\s*([0-9]+(?:[.,][0-9]+)?)\s*(?:MT|M|METRI)?\b/i);
  if (!match || !match[1]) return null;
  const value = parseFloat(match[1].replace(",", "."));
  if (!Number.isFinite(value) || value < 0 || value > 30) return null;
  return value;
}

function undo() {
  if (!undoStack.length) {
    toast("Niente da annullare", "info");
    return;
  }
  redoStack.push(snapshot());
  state = normalizeState(JSON.parse(undoStack.pop()));
  calc = compute(state);
  saveState();
  render();
  toast("Annullato");
}

function redo() {
  if (!redoStack.length) {
    toast("Niente da ripetere", "info");
    return;
  }
  undoStack.push(snapshot());
  state = normalizeState(JSON.parse(redoStack.pop()));
  calc = compute(state);
  saveState();
  render();
  toast("Ripetuto");
}

function resetProject() {
  if (!window.confirm("Azzerare tutti i parametri del progetto?")) return;
  const theme = state.theme;
  pushHistory();
  state = defaultState();
  state.theme = theme;
  calc = compute(state);
  saveState();
  render({ scrollTop: true });
  toast("Progetto azzerato");
}

async function copyLink() {
  updateHash();
  await copyText(location.href, "Link configurazione copiato");
}

function doAction(action) {
  switch (action) {
    case "theme":
      state.theme = state.theme === "dark" ? "light" : "dark";
      saveState();
      applyTheme();
      render();
      haptic();
      break;
    case "undo": undo(); break;
    case "redo": redo(); break;
    case "reset": resetProject(); break;
    case "center-canvas":
      pushHistory();
      state.canvas.offsetX = null;
      state.canvas.offsetY = null;
      calc = compute(state);
      saveState();
      render();
      toast("Canvas centrato");
      break;
    case "share-summary": shareSummary(); break;
    case "copy-summary": copyText(summaryText(state, calc), "Riepilogo copiato"); break;
    case "copy-link": copyLink(); break;
    case "export-txt": exportTxt(); break;
    case "export-jpeg": exportJpeg(); break;
    case "print": printDoc(); break;
    case "install": installApp(); break;
    default: break;
  }
}

/* ---------- Eventi ---------- */
document.addEventListener("click", function (event) {
  const tab = event.target.closest("[data-tab]");
  if (tab) {
    activeTab = tab.dataset.tab;
    render({ scrollTop: true });
    haptic();
    return;
  }

  const vista = event.target.closest("[data-vista]");
  if (vista) {
    vistaMode = vista.dataset.vista;
    render();
    haptic();
    return;
  }

  const step = event.target.closest("[data-step]");
  if (step) {
    doStep(step);
    return;
  }

  const toggle = event.target.closest("[data-toggle]");
  if (toggle) {
    doToggle(toggle.dataset.toggle);
    return;
  }

  const size = event.target.closest("[data-size-w]");
  if (size) {
    applySizePreset(Number(size.dataset.sizeW), Number(size.dataset.sizeH));
    return;
  }

  const action = event.target.closest("[data-action]");
  if (action) {
    doAction(action.dataset.action);
  }
});

document.addEventListener("input", function (event) {
  const target = event.target;

  if (target.matches("[data-num]")) {
    if (target.value === "") return;
    const path = target.dataset.num;
    const min = target.min !== "" ? Number(target.min) : 0;
    const max = target.max !== "" ? Number(target.max) : 9999;
    let value = parseNum(target.value);
    value = path === "cubeCount"
      ? clamp(value, min, calc.dimensions.cols * calc.dimensions.rows)
      : clamp(value, min, max);
    setPath(state, path, roundValue(value));
    calc = compute(state);
    updateLive();
    saveState();
    return;
  }

  if (target.matches("[data-text]")) {
    const path = target.dataset.text;
    setPath(state, path, target.value);
    if (path === "customerName") {
      const height = parseHeightFromName(target.value);
      if (height != null) {
        state.groundClearance = height;
        const ground = document.querySelector('[data-num="groundClearance"]');
        if (ground) ground.value = height;
      }
    }
    calc = compute(state);
    updateLive();
    saveState();
  }
});

document.addEventListener("change", function (event) {
  const target = event.target;

  const select = target.closest("[data-select]");
  if (select) {
    const field = select.dataset.select;
    if (field === "pixelPitch") changeModel(select.value);
    else if (field === "canvasPreset") changeCanvasPreset(select.value);
    return;
  }

  if (target.matches("[data-num]")) {
    commitFocusedHistory();
    const path = target.dataset.num;
    const min = target.min !== "" ? Number(target.min) : 0;
    const max = target.max !== "" ? Number(target.max) : 9999;
    let value = parseNum(target.value);
    value = path === "cubeCount"
      ? clamp(value, min, calc.dimensions.cols * calc.dimensions.rows)
      : clamp(value, min, max);
    setPath(state, path, roundValue(value));
    calc = compute(state);
    saveState();
    render();
    return;
  }

  if (target.matches("[data-text]")) {
    commitFocusedHistory();
    setPath(state, target.dataset.text, target.value);
    if (target.dataset.text === "customerName") {
      const height = parseHeightFromName(target.value);
      if (height != null) state.groundClearance = height;
    }
    calc = compute(state);
    saveState();
    render();
  }
});

document.addEventListener("focusin", function (event) {
  if (event.target.matches("input, textarea")) {
    focusSnapshot = snapshot();
  }
});

document.addEventListener("focusout", function (event) {
  if (event.target.matches("input, textarea")) {
    if (focusSnapshot && focusSnapshot !== snapshot()) {
      undoStack.push(focusSnapshot);
      if (undoStack.length > 40) undoStack.shift();
      redoStack = [];
    }
    focusSnapshot = null;
  }
});

/* ---------- PWA ---------- */
function setupPWA() {
  if ("serviceWorker" in navigator && /^https?:$/.test(location.protocol)) {
    window.addEventListener("load", function () {
      navigator.serviceWorker.register("./sw.js").catch(function () { /* offline non disponibile */ });
    });
  }

  window.addEventListener("beforeinstallprompt", function (event) {
    event.preventDefault();
    deferredPrompt = event;
  });

  window.addEventListener("appinstalled", function () {
    deferredPrompt = null;
    toast("App installata");
    render();
  });
}

/* ---------- Avvio ---------- */
function init() {
  state = loadState();
  calc = compute(state);
  applyTheme();
  render();
  setupPWA();

  window.addEventListener("hashchange", function () {
    const fromHash = decodeHashState();
    if (fromHash) {
      state = normalizeState(fromHash);
      calc = compute(state);
      saveState();
      render({ scrollTop: true });
    }
  });

  document.addEventListener("visibilitychange", function () {
    if (document.visibilityState === "hidden") {
      try { localStorage.setItem(STORAGE_KEY, JSON.stringify(state)); } catch (err) { /* ignorato */ }
    }
  });
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", init);
} else {
  init();
}
