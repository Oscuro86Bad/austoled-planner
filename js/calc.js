/* ============================================================
   AUSTOLED PLANNER MOBILE — motore di calcolo
   ============================================================ */
"use strict";

const STORAGE_KEY = "austoled-planner-mobile-v1";
const MAX_TILES_PER_PORT = 40; // 8 bit / 60 Hz

/* ---------- Formattazione italiana ---------- */
function fmtNum(value, decimals = 0) {
  const n = Number.isFinite(value) ? value : 0;
  return n.toLocaleString("it-IT", {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals
  });
}

function fmtM(value, decimals = 2) {
  return fmtNum(value, decimals) + " m";
}

function fmtPx(value) {
  return fmtNum(Math.round(value || 0), 0) + " px";
}

function fmtKg(value) {
  return fmtNum(value, value < 100 ? 1 : 0) + " kg";
}

function fmtKW(value) {
  return fmtNum(value, 2) + " kW";
}

function fmtPct(value) {
  return fmtNum(value * 100, 0) + "%";
}

function gcd(a, b) {
  a = Math.abs(Math.round(a));
  b = Math.abs(Math.round(b));
  while (b) {
    const t = b;
    b = a % b;
    a = t;
  }
  return a || 1;
}

function ratioLabel(w, h) {
  if (!w || !h) return "—";
  const g = gcd(w, h);
  const rw = Math.round(w / g);
  const rh = Math.round(h / g);
  const dec = (w / h).toFixed(2).replace(".", ",");
  return `${rw}:${rh} (${dec})`;
}

function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}

/* ---------- Stato iniziale ---------- */
function defaultStructure() {
  return {
    truss200: 0, truss150: 0, truss100: 0, truss300: 0,
    feet: 2, fakeFeet: 0, junctions: 0,
    aliscaff: 0, doubleAliscaff: 0,
    ballast: 0, spacers: 0, lBrackets: 0, plinths: 0,
    boltsM8: 0, boltsM10: 0
  };
}

function defaultHanging() {
  return {
    flyBar: 0, flyBarAliscaf: 0, flyBarEyebolt: 0,
    brackets: 0, reinforcement: 0,
    spanset1: 0, spanset15: 0,
    trussPlates: 0, shackles: 0, omega: 0
  };
}

function defaultState() {
  return {
    theme: "light",
    customerName: "",
    pixelPitch: "3.9 giallo-NOVA",
    width: 4,
    height: 3,
    groundClearance: 1,
    powerPerTile: 150,
    useStructure: false,
    useHanging: false,
    userSpareTiles: 0,
    signalLines: 0,
    notes: "",
    scalerInfo: "",
    powerNotes: "",
    cee16: 0,
    civile: 0,
    canvas: { preset: "fhd", width: 1920, height: 1080, offsetX: null, offsetY: null },
    customTile: { w: 0.5, h: 0.5, pxW: 128, pxH: 128, weight: 7.5, tilesPerCase: 6 },
    tile50Count: 0,
    tile50Spare: 0,
    tile100Count: 0,
    tile100Spare: 0,
    cubeCount: 0,
    cubeSpare: 0,
    structure: defaultStructure(),
    hanging: defaultHanging()
  };
}

/* Unisce lo stato salvato con i default (compatibilità versioni). */
function normalizeState(raw) {
  const base = defaultState();
  if (!raw || typeof raw !== "object") return base;
  const s = Object.assign(base, raw);
  s.canvas = Object.assign(defaultState().canvas, raw.canvas || {});
  s.customTile = Object.assign(defaultState().customTile, raw.customTile || {});
  s.structure = Object.assign(defaultStructure(), raw.structure || {});
  s.hanging = Object.assign(defaultHanging(), raw.hanging || {});
  s.width = Number(s.width) || 0;
  s.height = Number(s.height) || 0;
  s.groundClearance = Number.isFinite(Number(s.groundClearance)) ? Number(s.groundClearance) : 1;
  s.powerPerTile = Number(s.powerPerTile) || 0;
  s.userSpareTiles = Math.max(0, Number(s.userSpareTiles) || 0);
  return s;
}

/* ---------- Calcolo principale ---------- */
function compute(state) {
  const name = state.pixelPitch;
  const mixed = isMixedModel(name);
  const cube = isCubeModel(name);
  const tile = modelTile(name, state.customTile);

  const width = Math.max(0, Number(state.width) || 0);
  const height = Math.max(0, Number(state.height) || 0);

  let cols = 0, rows = 0;
  let realW = 0, realH = 0;
  let resW = 0, resH = 0;
  let active = 0, spare = 0, total = 0;
  let cases = 0, emptySpaces = 0, tilesPerCase = tile.tilesPerCase || 6;
  let totalWeight = 0;
  let mixedInfo = null;
  let cubeInfo = null;

  if (mixed) {
    const mix = MIXED_MODELS[name];
    const tA = modelTile(mix.a, null);
    const tB = modelTile(mix.b, null);
    const t50 = Math.max(0, Number(state.tile50Count) || 0);
    const t100 = Math.max(0, Number(state.tile100Count) || 0);
    const s50 = Math.max(0, Number(state.tile50Spare) || 0);
    const s100 = Math.max(0, Number(state.tile100Spare) || 0);

    cols = Math.max(1, Math.ceil(width / tA.w));
    const rows50 = Math.ceil(t50 / cols);
    const rows100 = Math.ceil(t100 / cols);

    rows = rows50 + rows100;
    realW = cols * tA.w;
    realH = rows50 * tA.h + rows100 * tB.h;
    resW = cols * tA.pxW;
    resH = rows50 * tA.pxH + rows100 * tB.pxH;

    active = t50 + t100;
    spare = s50 + s100;
    total = active + spare;

    const cases50 = Math.ceil((t50 + s50) / tA.tilesPerCase);
    const cases100 = Math.ceil((t100 + s100) / tB.tilesPerCase);
    cases = cases50 + cases100;
    emptySpaces =
      (cases50 * tA.tilesPerCase - (t50 + s50)) +
      (cases100 * tB.tilesPerCase - (t100 + s100));
    totalWeight = (t50 + s50) * tA.weight + (t100 + s100) * tB.weight;
    tilesPerCase = tA.tilesPerCase;

    mixedInfo = {
      t50, t100, s50, s100, rows50, rows100,
      tile50: tA, tile100: tB,
      cases50, cases100,
      labelA: mix.labelA, labelB: mix.labelB
    };
  } else {
    cols = Math.max(1, Math.ceil(width / tile.w));
    rows = Math.max(1, Math.ceil(height / tile.h));
    realW = cols * tile.w;
    realH = rows * tile.h;
    resW = cols * tile.pxW;
    resH = rows * tile.pxH;
    active = cols * rows;

    if (cube) {
      const cubeActive = clamp(Math.round(Number(state.cubeCount) || 0), 0, active);
      const cubeSpare = Math.max(0, Math.round(Number(state.cubeSpare) || 0));
      const cubeTotal = cubeActive + cubeSpare;
      const stdActive = active - cubeActive;
      const stdTotal = stdActive + Math.max(0, Number(state.userSpareTiles) || 0);

      const cubeCases = Math.ceil(cubeTotal / 8);
      const stdCases = Math.ceil(stdTotal / tile.tilesPerCase);
      cases = cubeCases + stdCases;
      emptySpaces =
        (cubeCases * 8 - cubeTotal) +
        (stdCases * tile.tilesPerCase - stdTotal);
      spare = Math.max(0, Number(state.userSpareTiles) || 0) + cubeSpare;
      total = cubeTotal + stdTotal;
      totalWeight = total * tile.weight;
      cubeInfo = {
        active: cubeActive, spare: cubeSpare, total: cubeTotal,
        cases: cubeCases, standardActive: stdActive,
        standardSpare: Math.max(0, Number(state.userSpareTiles) || 0),
        standardCases: stdCases, perCase: 8
      };
    } else {
      spare = Math.max(0, Number(state.userSpareTiles) || 0);
      total = active + spare;
      cases = Math.ceil(total / tile.tilesPerCase);
      emptySpaces = cases * tile.tilesPerCase - total;
      totalWeight = total * tile.weight;
    }
  }

  const powerW = active * (Number(state.powerPerTile) || 0);
  const powerKW = powerW / 1000;
  const amps230 = powerW / 230;
  const amps400 = powerW / (400 * Math.sqrt(3));
  const ceeSuggested = Math.max(1, Math.ceil(amps230 / 16));
  const ports = active > 0 ? Math.ceil(active / MAX_TILES_PER_PORT) : 0;

  const ground = Number.isFinite(Number(state.groundClearance)) ? Number(state.groundClearance) : 0;
  const totalHeight = ground + realH;

  const area = Math.max(0.01, realW * realH);
  const weightPerM2 = totalWeight / area;

  const canvasCfg = state.canvas || { width: 1920, height: 1080 };
  const cw = Math.max(1, Number(canvasCfg.width) || 1920);
  const ch = Math.max(1, Number(canvasCfg.height) || 1080);
  const defaultX = Math.round((cw - resW) / 2);
  const defaultY = Math.round((ch - resH) / 2);
  const offsetX = canvasCfg.offsetX === null || canvasCfg.offsetX === undefined
    ? defaultX : Math.round(Number(canvasCfg.offsetX) || 0);
  const offsetY = canvasCfg.offsetY === null || canvasCfg.offsetY === undefined
    ? defaultY : Math.round(Number(canvasCfg.offsetY) || 0);

  const barX = cw - resW;
  const barY = ch - resH;

  const canvas = {
    width: cw,
    height: ch,
    offsetX,
    offsetY,
    defaultX,
    defaultY,
    barX,
    barY,
    barLeft: Math.max(0, offsetX),
    barRight: Math.max(0, cw - (offsetX + resW)),
    barTop: Math.max(0, offsetY),
    barBottom: Math.max(0, ch - (offsetY + resH)),
    cropX: Math.max(0, -barX),
    cropY: Math.max(0, -barY),
    fill: (resW * resH) / (cw * ch),
    native: offsetX === defaultX && offsetY === defaultY
  };

  const suggestedScaler = resW > 3840 || resH > 2160
    ? `Processor 4K+ / ${Math.max(1, ports)} uscite`
    : resW > 1920 || resH > 1080
      ? `1× processor 4K (${Math.max(1, ports)} uscite)`
      : `1× scaler Full HD (${Math.max(1, ports)} uscite)`;

  const st = state.structure || defaultStructure();
  const totalBolts = ((Number(st.junctions) || 0) + (Number(st.feet) || 0)) * 4;

  const warnings = [];
  if (!width || !height) {
    warnings.push({ level: "danger", text: "Inserisci larghezza e altezza per avviare il calcolo." });
  }
  if (active === 0) {
    warnings.push({ level: "danger", text: "Nessuna tile attiva: controlla le quantità della configurazione mista." });
  }
  if (isP26(name)) {
    warnings.push({ level: "danger", text: "Modelli P2.6: usare partenze PowerCON TRUE1 CEE/Civili. I PowerCON standard non sono compatibili." });
  }
  if (amps230 > 16) {
    warnings.push({ level: "warn", text: `Assorbimento ${fmtNum(amps230, 1)} A: servono almeno ${ceeSuggested} linee CEE 16A.` });
  }
  if (ports > 1) {
    warnings.push({ level: "info", text: `${active} tile attive: ${ports} porte di uscita (max ${MAX_TILES_PER_PORT} tile/porta a 8 bit – 60 Hz).` });
  }
  if (ground > 0 && ground < 0.5) {
    warnings.push({ level: "warn", text: "Altezza da terra sotto 0,5 m: verifica zoccolo, stabilità e visibilità." });
  }
  if (totalWeight > 500) {
    warnings.push({ level: "warn", text: `Peso ${fmtKg(totalWeight)}: verifica portata, struttura e carichi sospesi.` });
  }
  if (resW > 3840 || resH > 2160) {
    warnings.push({ level: "info", text: "Risoluzione oltre 4K: serve processing adeguato e più uscite video." });
  }
  if (state.useHanging) {
    warnings.push({ level: "info", text: "Configurazione appesa: verifica fly bar, spanset, grillette e portata." });
  }
  if (state.useStructure && (Number(st.feet) || 0) < 2) {
    warnings.push({ level: "warn", text: "Struttura attiva con meno di 2 gambe: verifica il sostegno." });
  }
  if (cw < resW || ch < resH) {
    warnings.push({ level: "warn", text: "Il canvas è più piccolo della risoluzione LED: l’immagine verrà croppata." });
  }

  return {
    name,
    label: modelLabel(name),
    tile,
    mixed,
    cube,
    mixedInfo,
    cubeInfo,
    dimensions: {
      cols, rows, realW, realH, resW, resH,
      tileW: tile.w, tileH: tile.h, tileResW: tile.pxW, tileResH: tile.pxH,
      aspect: ratioLabel(resW, resH),
      aspectValue: resH ? resW / resH : 0
    },
    tiles: {
      active, spare, total, cases, emptySpaces, tilesPerCase,
      totalWeight, weightPerTile: tile.weight, weightPerM2
    },
    power: { perTile: Number(state.powerPerTile) || 0, totalW: powerW, totalKW: powerKW, amps230, amps400, ceeSuggested, ports },
    ground,
    totalHeight,
    area,
    canvas,
    suggestedScaler,
    structure: {
      totalBolts,
      feet: Number(st.feet) || 0,
      junctions: Number(st.junctions) || 0
    },
    warnings
  };
}

/* ---------- Riepilogo testuale condivisibile ---------- */
function summaryText(state, calc) {
  const d = calc.dimensions;
  const t = calc.tiles;
  const p = calc.power;
  const date = new Date().toLocaleDateString("it-IT");

  const lines = [];
  lines.push("AUSTOLED PLANNER — RIEPILOGO TECNICO");
  lines.push("------------------------------------");
  lines.push(`Cliente / evento: ${state.customerName || "N/A"}`);
  lines.push(`Data: ${date}`);
  lines.push("");
  lines.push(`MODELLO: ${calc.label}`);
  if (calc.mixed && calc.mixedInfo) {
    const m = calc.mixedInfo;
    lines.push(`Cabinet 50×50: ${fmtNum(m.tile50.w * 100)}×${fmtNum(m.tile50.h * 100)} cm · ${m.tile50.pxW}×${m.tile50.pxH} px · ${fmtNum(m.tile50.weight, 1)} kg`);
    lines.push(`Cabinet 50×100: ${fmtNum(m.tile100.w * 100)}×${fmtNum(m.tile100.h * 100)} cm · ${m.tile100.pxW}×${m.tile100.pxH} px · ${fmtNum(m.tile100.weight, 1)} kg`);
  } else {
    lines.push(`Cabinet: ${fmtNum(d.tileW * 100)}×${fmtNum(d.tileH * 100)} cm · ${d.tileResW}×${d.tileResH} px · ${fmtNum(t.weightPerTile, 1)} kg`);
  }
  lines.push(`Dimensioni: ${fmtM(d.realW)} × ${fmtM(d.realH)} (${d.cols} col × ${d.rows} righe)`);
  lines.push(`Risoluzione: ${d.resW} × ${d.resH} px · ${d.aspect}`);
  lines.push(`H terra: ${fmtM(calc.ground)} · Quota totale: ${fmtM(calc.totalHeight)}`);
  lines.push("");
  lines.push("MATERIALE VIDEO");
  lines.push(`Tile attive: ${t.active}`);
  lines.push(`Scorte: ${t.spare}`);
  lines.push(`Totale tile: ${t.total}`);
  lines.push(`Bauli: ${t.cases} (${t.tilesPerCase} pz/cassa)`);
  lines.push(`Peso LED wall: ${fmtKg(t.totalWeight)}`);
  lines.push(`Consumo: ${fmtKW(p.totalKW)} · ${fmtNum(p.amps230, 1)} A (230 V)`);
  lines.push(`Uscite video: ${p.ports} (max ${MAX_TILES_PER_PORT} tile/porta)`);
  lines.push("");

  if (calc.mixed && calc.mixedInfo) {
    const m = calc.mixedInfo;
    lines.push("CONFIGURAZIONE MISTA");
    lines.push(`Tile 50×50: ${m.t50} + ${m.s50} scorta`);
    lines.push(`Tile 50×100: ${m.t100} + ${m.s100} scorta`);
    lines.push(`Bauli: ${m.cases50} (50×50) + ${m.cases100} (50×100)`);
    lines.push("");
  }

  if (calc.cube && calc.cubeInfo && calc.cubeInfo.active > 0) {
    const c = calc.cubeInfo;
    lines.push("TILE CUBE");
    lines.push(`Cube: ${c.active} + ${c.spare} scorta · ${c.cases} bauli da 8`);
    lines.push(`Standard: ${c.standardActive} + ${c.standardSpare} scorta · ${c.standardCases} bauli`);
    lines.push("");
  }

  lines.push("ALIMENTAZIONE");
  lines.push(`Consumo totale: ${fmtKW(p.totalKW)}`);
  lines.push(`Assorbimento: ${fmtNum(p.amps230, 1)} A (230 V) · ${fmtNum(p.amps400, 1)} A (400 V trifase)`);
  lines.push(`P.CON CEE 16A: ${state.cee16}`);
  lines.push(`P.CON Civile: ${state.civile}`);
  if (state.powerNotes) lines.push(`Note: ${state.powerNotes}`);
  lines.push("");

  if (calc.suggestedScaler || state.scalerInfo) {
    lines.push("SCALER / SENDER");
    lines.push(state.scalerInfo || calc.suggestedScaler);
    lines.push("");
  }

  if (state.useStructure) {
    lines.push("STRUTTURA");
    lines.push(`Gambe: ${calc.structure.feet} · Giunzioni: ${calc.structure.junctions}`);
    lines.push(`Bulloni M8/M10: ${calc.structure.totalBolts}`);
    lines.push("");
  }

  if (state.useHanging) {
    lines.push("APPENDIMENTO");
    lines.push("Verificare fly bar, spanset, grillette e portata.");
    lines.push("");
  }

  lines.push(`CANVAS: ${calc.canvas.width} × ${calc.canvas.height} px`);
  lines.push(`LED nel canvas: ${d.resW} × ${d.resH} px · offset X ${calc.canvas.offsetX} / Y ${calc.canvas.offsetY}`);
  lines.push("");

  if (state.notes) {
    lines.push("NOTE");
    lines.push(state.notes);
    lines.push("");
  }

  lines.push("Generato con AUSTOLED PLANNER MOBILE");
  return lines.join("\n");
}
