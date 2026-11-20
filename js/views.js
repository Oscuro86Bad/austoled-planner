/* ============================================================
   AUSTOLED PLANNER MOBILE — viste Vista, Materiali, Export
   e azioni di condivisione / esportazione.
   ============================================================ */
"use strict";

/* ---------- Vista ---------- */
function vistaHTML() {
  const d = calc.dimensions;
  const c = calc.canvas;

  const tabs = segmented([
    { value: "prospetto", label: "Prospetto", icon: "eye" },
    { value: "canvas", label: "Canvas", icon: "monitor" }
  ], vistaMode, "data-vista");

  if (vistaMode === "canvas") {
    return `<div class="stack">
      ${tabs}
      ${canvasViewHTML(d, c)}
    </div>`;
  }

  return `<div class="stack">
    ${tabs}
    ${card("Prospetto", "eye", `
      <div class="drawing">${prospettoSVG(state, calc)}</div>
      <div class="row-actions row-actions--wrap">
        <button class="btn btn--ghost btn--sm" type="button" data-action="export-jpeg">${icon("image", 15)} Salva JPEG</button>
        <button class="btn btn--ghost btn--sm" type="button" data-action="print">${icon("printer", 15)} Stampa / PDF</button>
      </div>
      <div class="metrics metrics--compact metrics--4">
        ${metric("H terra", fmtM(calc.ground), "", "ruler")}
        ${metric("H LED", fmtM(d.realH), "", "ruler")}
        ${metric("Quota totale", fmtM(calc.totalHeight), "", "ruler")}
        ${metric("Larghezza", fmtM(d.realW), "", "ruler")}
      </div>
    `, `<span class="badge badge--blue">${esc(calc.label)}</span>`)}
    ${detailsCard("det-drawing", "Dettagli disegno", "ruler", `
      <div class="rows">
        ${row("Modello", esc(calc.label))}
        ${row("Griglia", `${d.cols} col × ${d.rows} righe`)}
        ${row("Dimensioni reali", `${fmtM(d.realW)} × ${fmtM(d.realH)}`)}
        ${row("Risoluzione", `${d.resW} × ${d.resH} px`)}
        ${row("Gambe disegnate", String(Math.max(2, calc.structure.feet || 2)))}
        ${row("Riferimento umano", "1,75 m")}
        ${row("Scala grafica", "automatica")}
      </div>
    `)}
  </div>`;
}

function canvasViewHTML(d, c) {
  const left = (c.offsetX / c.width) * 100;
  const top = (c.offsetY / c.height) * 100;
  const width = (d.resW / c.width) * 100;
  const height = (d.resH / c.height) * 100;
  const ratio = (c.height / c.width) * 100;
  const barX = c.barX >= 0 ? `+${c.barX} px` : `−${c.cropX} px crop`;
  const barY = c.barY >= 0 ? `+${c.barY} px` : `−${c.cropY} px crop`;

  return `${card("Canvas di output", "monitor", `
    <label class="field">
      <span class="field__label">Preset canvas</span>
      <div class="select-wrap">
        <select class="input select" data-select="canvasPreset" aria-label="Preset canvas">
          ${Object.keys(CANVAS_PRESETS).map(function (key) {
            const preset = CANVAS_PRESETS[key];
            return `<option value="${key}"${state.canvas.preset === key ? " selected" : ""}>${preset.label}${key !== "custom" ? ` · ${preset.width}×${preset.height}` : ""}</option>`;
          }).join("")}
        </select>
        <span class="select-chev">${icon("chevron", 18)}</span>
      </div>
    </label>
    ${state.canvas.preset === "custom" ? `<div class="stack-sm">
      ${counter("Larghezza canvas", "canvas.width", state.canvas.width, 10, 320, 16384, "px")}
      ${counter("Altezza canvas", "canvas.height", state.canvas.height, 10, 180, 16384, "px")}
    </div>` : ""}
    <div class="stage" id="stage" style="--stage-ratio:${ratio}%">
      <div class="stage-led" id="stage-led" style="left:${left}%;top:${top}%;width:${width}%;height:${height}%;--cols:${d.cols};--rows:${d.rows}">
        <span class="stage-led__label">${d.resW} × ${d.resH} px</span>
      </div>
      <span class="stage-canvas-label">CANVAS ${c.width} × ${c.height}</span>
    </div>
    <div class="inline-note">${icon("target", 14)} Trascina il rettangolo LED per posizionarlo sul canvas. Mapping 1:1, senza riscalatura.</div>
    <div class="row-actions">
      <button class="btn btn--soft btn--block" type="button" data-action="center-canvas">${icon("target", 16)} Centra sul canvas</button>
    </div>
  `, `<span class="badge">${c.width} × ${c.height}</span>`)}

  ${card("Misure mapping", "ruler", `
    <div class="metrics metrics--compact">
      ${metric("Area LED", `${d.resW} × ${d.resH}`, "px", "monitor", "accent")}
      ${metric("Neri orizzontali", barX, "", "ruler")}
      ${metric("Neri verticali", barY, "", "ruler")}
      ${metric("Riempimento", fmtPct(c.fill), "", "grid")}
    </div>
    <div class="rows">
      ${row("Offset X", `<span id="offset-x">${c.offsetX} px</span>`)}
      ${row("Offset Y", `<span id="offset-y">${c.offsetY} px</span>`)}
      ${row("Offset centrato", `${c.defaultX} / ${c.defaultY} px`)}
      ${row("Stato", c.native ? "centrato" : "spostato manualmente")}
    </div>
  `)}
  ${c.barX < 0 || c.barY < 0 ? note("warn", "Il canvas è più piccolo del LED: parte dell’immagine viene croppata. Scegli un canvas più grande o riduci le dimensioni.") : ""}`;
}

/* ---------- Vista Materiali ---------- */
function miniCounter(label, field, value) {
  return `<div class="mini">
    <span class="mini__label">${esc(label)}</span>
    <div class="mini__controls">
      <button class="mini__btn" type="button" data-step="${field}" data-delta="-1" data-min="0" data-max="999" aria-label="Diminuisci ${esc(label)}">${icon("minus", 13)}</button>
      <input class="mini__value" type="number" data-num="${field}" value="${Number(value) || 0}" min="0" max="999" step="1" inputmode="numeric" aria-label="${esc(label)}">
      <button class="mini__btn" type="button" data-step="${field}" data-delta="1" data-min="0" data-max="999" aria-label="Aumenta ${esc(label)}">${icon("plus", 13)}</button>
    </div>
  </div>`;
}

function materialiHTML() {
  const t = calc.tiles;
  const p = calc.power;
  const d = calc.dimensions;

  let spareControls = "";
  if (calc.mixed && calc.mixedInfo) {
    const m = calc.mixedInfo;
    spareControls = `<div class="panel panel--mixed">
      <div class="panel__head">${icon("layers", 16)} Configurazione mista</div>
      ${counter("Tile 50×50 attive", "tile50Count", state.tile50Count, 1, 0, 9999, "")}
      ${counter("Scorta 50×50", "tile50Spare", state.tile50Spare, 1, 0, 9999, "")}
      ${counter("Tile 50×100 attive", "tile100Count", state.tile100Count, 1, 0, 9999, "")}
      ${counter("Scorta 50×100", "tile100Spare", state.tile100Spare, 1, 0, 9999, "")}
      <div class="rows">
        ${row("Bauli 50×50", String(m ? m.cases50 : 0))}
        ${row("Bauli 50×100", String(m ? m.cases100 : 0))}
      </div>
    </div>`;
  } else if (calc.cube) {
    spareControls = `<div class="panel">
      <div class="panel__head">${icon("layers", 16)} Tile Cube</div>
      ${counter("Tile Cube attive", "cubeCount", state.cubeCount, 1, 0, t.active, "pz")}
      ${counter("Scorta Cube", "cubeSpare", state.cubeSpare, 1, 0, 999, "pz")}
      ${counter("Scorte standard", "userSpareTiles", state.userSpareTiles, 1, 0, 9999, "pz")}
      <div class="rows">
        ${row("Cube", `${calc.cubeInfo ? calc.cubeInfo.active : 0} + ${calc.cubeInfo ? calc.cubeInfo.spare : 0} scorta`)}
        ${row("Standard", `${calc.cubeInfo ? calc.cubeInfo.standardActive : 0} + ${calc.cubeInfo ? calc.cubeInfo.standardSpare : 0} scorta`)}
      </div>
    </div>`;
  } else {
    spareControls = counter("Tile di scorta extra", "userSpareTiles", state.userSpareTiles, 1, 0, 9999, "pz", "Aggiunte al totale e ai bauli");
  }

  const video = card("Materiale video", "box", `
    <div class="metrics metrics--compact">
      ${metric("Tile attive", String(t.active), "pz", "grid", "accent")}
      ${metric("Bauli", String(t.cases), "pz", "box")}
    </div>
    ${spareControls}
    <div class="rows">
      ${row("Tile attive", String(t.active))}
      ${row("Scorte", String(t.spare))}
      ${row("Totale tile", String(t.total))}
      ${row("Bauli", `${t.cases} × ${t.tilesPerCase} pz`)}
      ${row("Spazi vuoti", String(t.emptySpaces))}
      ${row("Peso per tile", calc.mixed && calc.mixedInfo ? `${fmtKg(t.weightPerTile)} / ${fmtKg(calc.mixedInfo.tile100.weight)}` : fmtKg(t.weightPerTile))}
      ${row("Peso totale LED", fmtKg(t.totalWeight))}
      ${row("Consumo", fmtKW(p.totalKW))}
    </div>
  `, `<span class="badge badge--blue">${esc(calc.label)}</span>`);

  const power = card("Alimentazione", "cable", `
    <div class="metrics metrics--compact">
      ${metric("Consumo", fmtNum(p.totalKW, 2), "kW", "zap", "accent")}
      ${metric("230 V", fmtNum(p.amps230, 1), "A", "cable")}
      ${metric("400 V trifase", fmtNum(p.amps400, 1), "A", "cable")}
      ${metric("Linee CEE 16A", String(p.ceeSuggested), "consigliate", "layers")}
    </div>
    ${counter("P.CON CEE 16A", "cee16", state.cee16, 1, 0, 99, "")}
    ${counter("P.CON Civile", "civile", state.civile, 1, 0, 99, "")}
    ${fieldArea("Note alimentazione", "powerNotes", state.powerNotes, "Es. 2× CEE 16A + 1× civile, cavi 25 m…")}
    <div class="stack-sm">${isP26(state.pixelPitch) ? note("danger", "Modelli P2.6: usare PowerCON TRUE1 CEE/Civili. I PowerCON standard non sono compatibili.") : note("info", "Suggerimento: una linea CEE 16A regge circa 3,6 kW. Distribuisci il carico su più linee.")}</div>
  `);

  const scaler = card("Scaler / sender", "layers", `
    <div class="stack-sm">${note("info", calc.suggestedScaler)}</div>
    ${fieldText("Configurazione scelta", "scalerInfo", state.scalerInfo, "Es. 1× NovaStar MCTRL4K + 2× A8s")}
    <div class="rows">
      ${row("Porte di uscita", `${p.ports} porte`)}
      ${row("Max tile per porta", `${MAX_TILES_PER_PORT} tile (8 bit · 60 Hz)`)}
      ${row("Risoluzione LED", `${d.resW} × ${d.resH} px`)}
      ${row("Canvas", `${calc.canvas.width} × ${calc.canvas.height} px`)}
    </div>
  `);

  const cases = card("Bauli e spedizione", "box", `
    <div class="big-number">${t.cases}<span>bauli</span></div>
    <div class="rows">
      ${row("Pezzi per cassa", String(t.tilesPerCase))}
      ${row("Capienza bauli", `${t.total + t.emptySpaces} pz`)}
      ${row("Spazi vuoti", String(t.emptySpaces))}
      ${row("Peso LED wall", fmtKg(t.totalWeight))}
      ${row("Peso per m²", `${fmtNum(t.weightPerM2, 1)} kg/m²`)}
    </div>
  `);

  const structure = state.useStructure
    ? detailsCard("det-structure", "Materiale struttura", "structure", `
        <div class="mini-grid">${STRUCTURE_FIELDS.map(function (field) {
          return miniCounter(field.label, "structure." + field.key, state.structure[field.key]);
        }).join("")}</div>
        <div class="rows">
          ${row("Gambe", String(calc.structure.feet))}
          ${row("Giunzioni", String(calc.structure.junctions))}
          ${row("Bulloni M8/M10", String(calc.structure.totalBolts))}
        </div>
      `, true)
    : card("Struttura", "structure", `
        ${note("info", "Struttura disattivata. Attivala in Setup per il dettaglio del materiale.")}
        <div class="row-actions"><button class="btn btn--soft btn--block" type="button" data-tab="setup">${icon("arrow", 16)} Vai a Setup</button></div>
      `);

  const hanging = state.useHanging
    ? detailsCard("det-hanging", "Materiale appendimento", "layers", `
        <div class="mini-grid">${HANGING_FIELDS.map(function (field) {
          return miniCounter(field.label, "hanging." + field.key, state.hanging[field.key]);
        }).join("")}</div>
        <div class="stack-sm">${note("warn", "Verifica sempre portata, fly bar, spanset e grillette prima del montaggio.")}</div>
      `, true)
    : "";

  return `<div class="stack">
    ${video}
    ${power}
    ${scaler}
    ${cases}
    ${structure}
    ${hanging}
  </div>`;
}

/* ---------- Vista Export ---------- */
function exportHTML() {
  const installed = isStandalone();
  const preview = summaryText(state, calc);

  const share = card("Condividi", "share", `
    <button class="btn btn--primary btn--block" type="button" data-action="share-summary">${icon("share", 18)} Condividi riepilogo</button>
    <div class="btn-grid">
      <button class="btn btn--ghost" type="button" data-action="copy-summary">${icon("copy", 17)} Copia testo</button>
      <button class="btn btn--ghost" type="button" data-action="copy-link">${icon("link", 17)} Copia link</button>
    </div>
    <div class="inline-note">Il link contiene tutti i parametri: chi lo apre vede la stessa configurazione.</div>
  `);

  const docs = card("Documenti", "file", `
    <div class="btn-grid">
      <button class="btn btn--ghost" type="button" data-action="export-txt">${icon("file", 17)} Lista .txt</button>
      <button class="btn btn--ghost" type="button" data-action="export-jpeg">${icon("image", 17)} Prospetto JPEG</button>
    </div>
    <button class="btn btn--soft btn--block" type="button" data-action="print">${icon("printer", 18)} Stampa / salva PDF</button>
    <div class="inline-note">Sul telefono “Stampa” apre anche “Salva come PDF”.</div>
  `);

  const app = card("App", "install", `
    <button class="btn ${installed ? "btn--soft" : "btn--primary"} btn--block" type="button" data-action="install"${installed ? " disabled" : ""}>${icon(installed ? "check" : "install", 18)} ${installed ? "App installata" : "Installa sul telefono"}</button>
    <div class="rows">
      ${row("Versione", `v${APP_VERSION}`)}
      ${row("Modalità", installed ? "standalone" : "browser")}
      ${row("Offline", "disponibile dopo il primo avvio")}
      ${row("Salvataggio", "automatico sul dispositivo")}
    </div>
    <div class="inline-note">Aggiungi alla schermata Home per usarla a tutto schermo, anche senza rete.</div>
  `);

  const previewCard = card("Anteprima riepilogo", "file", `
    <pre class="summary-preview">${esc(preview)}</pre>
  `);

  return `<div class="stack">
    ${share}
    ${docs}
    ${previewCard}
    ${app}
  </div>`;
}

/* ---------- Azioni: condivisione, export, stampa ---------- */
function isStandalone() {
  return window.matchMedia("(display-mode: standalone)").matches || window.navigator.standalone === true;
}

function projectSlug() {
  const base = (state.customerName || calc.label || "ledwall")
    .toLowerCase()
    .normalize("NFD").replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 40);
  return base || "ledwall";
}

function toast(message, type) {
  const el = document.getElementById("toast");
  if (!el) return;
  el.textContent = message;
  el.className = "toast toast--" + (type || "ok") + " show";
  clearTimeout(toastTimer);
  toastTimer = setTimeout(function () {
    el.className = "toast toast--" + (type || "ok");
  }, 2800);
}

function haptic() {
  if (navigator.vibrate) {
    try { navigator.vibrate(6); } catch (err) { /* ignorato */ }
  }
}

function downloadBlob(filename, blob) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.rel = "noopener";
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(function () { URL.revokeObjectURL(url); }, 5000);
}

async function copyText(text, okMessage) {
  try {
    await navigator.clipboard.writeText(text);
    toast(okMessage || "Copiato");
  } catch (err) {
    const area = document.createElement("textarea");
    area.value = text;
    area.style.position = "fixed";
    area.style.opacity = "0";
    document.body.appendChild(area);
    area.select();
    try { document.execCommand("copy"); toast(okMessage || "Copiato"); }
    catch (e) { toast("Copia non disponibile", "warn"); }
    area.remove();
  }
}

async function shareSummary() {
  const text = summaryText(state, calc);
  if (navigator.share) {
    try {
      await navigator.share({ title: "AUSTOLED PLANNER", text: text });
      return;
    } catch (err) {
      if (err && err.name === "AbortError") return;
    }
  }
  await copyText(text, "Riepilogo copiato");
}

async function shareLink() {
  updateHash();
  const url = location.href;
  if (navigator.share) {
    try {
      await navigator.share({ title: "AUSTOLED PLANNER", text: "Configurazione LED wall", url: url });
      return;
    } catch (err) {
      if (err && err.name === "AbortError") return;
    }
  }
  await copyText(url, "Link configurazione copiato");
}

function exportTxt() {
  const text = summaryText(state, calc);
  const blob = new Blob([text], { type: "text/plain;charset=utf-8" });
  downloadBlob("austoled-" + projectSlug() + ".txt", blob);
  toast("Lista .txt esportata");
}

function exportJpeg() {
  const svg = prospettoSVG(state, calc);
  const svgBlob = new Blob([svg], { type: "image/svg+xml;charset=utf-8" });
  const url = URL.createObjectURL(svgBlob);
  const img = new Image();

  img.onload = async function () {
    try {
      const pad = 46;
      const width = 1240;
      const headerH = 132;
      const footerH = 74;
      const svgW = width - pad * 2;
      const svgH = svgW * (img.height / img.width);
      const height = headerH + svgH + footerH;
      const scale = 2;

      const canvas = document.createElement("canvas");
      canvas.width = width * scale;
      canvas.height = height * scale;
      const ctx = canvas.getContext("2d");
      ctx.scale(scale, scale);

      ctx.fillStyle = "#ffffff";
      ctx.fillRect(0, 0, width, height);

      ctx.fillStyle = "#0f172a";
      ctx.font = "900 30px 'Segoe UI', Arial, sans-serif";
      ctx.fillText("AUSTOLED PLANNER", pad, 54);
      ctx.fillStyle = "#2563eb";
      ctx.fillRect(pad, 68, 62, 4);
      ctx.fillStyle = "#64748b";
      ctx.font = "700 13px 'Segoe UI', Arial, sans-serif";
      ctx.fillText("PROSPETTO TECNICO IN SCALA", pad, 92);

      ctx.textAlign = "right";
      ctx.fillStyle = "#0f172a";
      ctx.font = "800 14px 'Segoe UI', Arial, sans-serif";
      ctx.fillText(state.customerName || "N/A", width - pad, 50);
      ctx.fillStyle = "#64748b";
      ctx.font = "600 12px 'Segoe UI', Arial, sans-serif";
      ctx.fillText(new Date().toLocaleDateString("it-IT"), width - pad, 70);
      ctx.textAlign = "left";

      ctx.strokeStyle = "#e2e8f0";
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(pad, headerH - 22);
      ctx.lineTo(width - pad, headerH - 22);
      ctx.stroke();

      ctx.drawImage(img, pad, headerH, svgW, svgH);

      ctx.fillStyle = "#64748b";
      ctx.font = "600 12px 'Segoe UI', Arial, sans-serif";
      ctx.fillText(
        `${calc.label} · ${fmtM(calc.dimensions.realW)} × ${fmtM(calc.dimensions.realH)} · ${calc.dimensions.resW} × ${calc.dimensions.resH} px · ${fmtKW(calc.power.totalKW)}`,
        pad,
        height - 36
      );
      ctx.fillStyle = "#94a3b8";
      ctx.font = "700 10px 'Segoe UI', Arial, sans-serif";
      ctx.fillText("GENERATO CON AUSTOLED PLANNER MOBILE", pad, height - 18);

      const filename = "austoled-" + projectSlug() + ".jpg";
      canvas.toBlob(async function (blob) {
        if (!blob) { toast("Export JPEG non riuscito", "danger"); return; }
        const file = new File([blob], filename, { type: "image/jpeg" });
        if (navigator.canShare && navigator.canShare({ files: [file] })) {
          try {
            await navigator.share({ files: [file], title: "Prospetto LED" });
            return;
          } catch (err) {
            if (err && err.name === "AbortError") return;
          }
        }
        downloadBlob(filename, blob);
        toast("Prospetto JPEG esportato");
      }, "image/jpeg", 0.92);
    } catch (err) {
      toast("Export JPEG non riuscito", "danger");
    } finally {
      URL.revokeObjectURL(url);
    }
  };

  img.onerror = function () {
    URL.revokeObjectURL(url);
    toast("Disegno non disponibile", "danger");
  };

  img.src = url;
}

function printDoc() {
  const root = document.getElementById("print-root");
  if (!root) return;
  root.innerHTML = `<div class="print-page">
    <div class="print-head">
      <div>
        <h1>AUSTOLED PLANNER</h1>
        <p>RIEPILOGO TECNICO · ${esc(calc.label)}</p>
      </div>
      <div class="print-head__right">
        <strong>${esc(state.customerName || "N/A")}</strong>
        <span>${new Date().toLocaleDateString("it-IT")}</span>
      </div>
    </div>
    <div class="print-drawing">${prospettoSVG(state, calc)}</div>
    <pre class="print-summary">${esc(summaryText(state, calc))}</pre>
  </div>`;
  setTimeout(function () { window.print(); }, 150);
}

async function installApp() {
  if (isStandalone()) {
    toast("L’app è già installata");
    return;
  }
  if (deferredPrompt) {
    deferredPrompt.prompt();
    try {
      const choice = await deferredPrompt.userChoice;
      if (choice && choice.outcome === "accepted") toast("Installazione avviata");
    } catch (err) { /* ignorato */ }
    deferredPrompt = null;
    return;
  }
  toast("Apri il menu del browser e scegli “Aggiungi alla schermata Home”.", "info");
}

/* ---------- Canvas: trascinamento LED ---------- */
function initStage() {
  const stage = document.getElementById("stage");
  const led = document.getElementById("stage-led");
  if (!stage || !led) return;

  let drag = null;
  let before = null;

  led.addEventListener("pointerdown", function (event) {
    event.preventDefault();
    if (led.setPointerCapture) {
      try { led.setPointerCapture(event.pointerId); } catch (err) { /* ignorato */ }
    }
    drag = {
      x: event.clientX,
      y: event.clientY,
      ox: calc.canvas.offsetX,
      oy: calc.canvas.offsetY
    };
    before = snapshot();
    stage.classList.add("is-dragging");
  });

  led.addEventListener("pointermove", function (event) {
    if (!drag) return;
    const rect = stage.getBoundingClientRect();
    if (!rect.width || !rect.height) return;
    const dx = (event.clientX - drag.x) * calc.canvas.width / rect.width;
    const dy = (event.clientY - drag.y) * calc.canvas.height / rect.height;
    const minX = 40 - calc.dimensions.resW;
    const minY = 40 - calc.dimensions.resH;
    const maxX = calc.canvas.width - 40;
    const maxY = calc.canvas.height - 40;
    state.canvas.offsetX = Math.round(clamp(drag.ox + dx, minX, maxX));
    state.canvas.offsetY = Math.round(clamp(drag.oy + dy, minY, maxY));
    calc = compute(state);
    led.style.left = (calc.canvas.offsetX / calc.canvas.width) * 100 + "%";
    led.style.top = (calc.canvas.offsetY / calc.canvas.height) * 100 + "%";
    const ox = document.getElementById("offset-x");
    const oy = document.getElementById("offset-y");
    if (ox) ox.textContent = calc.canvas.offsetX + " px";
    if (oy) oy.textContent = calc.canvas.offsetY + " px";
  });

  function endDrag() {
    if (!drag) return;
    drag = null;
    stage.classList.remove("is-dragging");
    if (before && before !== snapshot()) {
      undoStack.push(before);
      if (undoStack.length > 40) undoStack.shift();
      redoStack = [];
    }
    before = null;
    saveState();
    render();
  }

  led.addEventListener("pointerup", endDrag);
  led.addEventListener("pointercancel", endDrag);
  led.addEventListener("lostpointercapture", endDrag);
}
