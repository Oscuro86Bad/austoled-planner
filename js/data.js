/* ============================================================
   AUSTOLED PLANNER MOBILE — database modelli LED
   Dati tecnici dei cabinet: dimensioni (m), risoluzione (px),
   peso (kg) e pezzi per cassa.
   ============================================================ */
"use strict";

const MODELS = {
  "4.8 EST-NOVA":              { w: 0.5, h: 1,   pxW: 104, pxH: 208, weight: 14,   tilesPerCase: 6 },
  "3.9 giallo-NOVA":           { w: 0.5, h: 0.5, pxW: 128, pxH: 128, weight: 7.5,  tilesPerCase: 6 },
  "3.9 Trasparent-NOVA":       { w: 1,   h: 0.5, pxW: 256, pxH: 64,  weight: 11.5, tilesPerCase: 6 },
  "3.9 -Linsn A":              { w: 0.5, h: 0.5, pxW: 128, pxH: 128, weight: 7.5,  tilesPerCase: 6 },
  "3.9 -Linsn A1":             { w: 0.5, h: 0.5, pxW: 128, pxH: 128, weight: 7.5,  tilesPerCase: 6 },
  "3.9 -Linsn B":              { w: 0.5, h: 0.5, pxW: 128, pxH: 128, weight: 7.5,  tilesPerCase: 6 },
  "3.9 SIV -Linsn 50 INT":     { w: 0.5, h: 0.5, pxW: 128, pxH: 128, weight: 7.6,  tilesPerCase: 6 },
  "3.9 SIV -Linsn 100 INT":    { w: 0.5, h: 1,   pxW: 128, pxH: 256, weight: 13.8, tilesPerCase: 6 },
  "3.9 SIV -NOVA 50 EST":      { w: 0.5, h: 0.5, pxW: 128, pxH: 128, weight: 7.8,  tilesPerCase: 6 },
  "3.9 SIV -NOVA 100 EST":     { w: 0.5, h: 1,   pxW: 128, pxH: 256, weight: 14.2, tilesPerCase: 6 },
  "2.9 CHIP-NOVA":             { w: 0.5, h: 0.5, pxW: 168, pxH: 168, weight: 7.7,  tilesPerCase: 8 },
  "2.9 UC-NOVA":               { w: 0.5, h: 0.5, pxW: 168, pxH: 168, weight: 7.5,  tilesPerCase: 6 },
  "2.9 50 est":                { w: 0.5, h: 0.5, pxW: 168, pxH: 168, weight: 7.8,  tilesPerCase: 8 },
  "2.9 100 est":               { w: 0.5, h: 1,   pxW: 168, pxH: 336, weight: 13.4, tilesPerCase: 6 },
  "2.8 Rosso-NOVA":            { w: 0.5, h: 0.5, pxW: 176, pxH: 176, weight: 8,    tilesPerCase: 6 },
  "2.8 Verde -NOVA":           { w: 0.5, h: 0.5, pxW: 176, pxH: 176, weight: 14,   tilesPerCase: 6 },
  "2.6 FLEX-NOVA":             { w: 0.5, h: 0.5, pxW: 192, pxH: 192, weight: 6.5,  tilesPerCase: 8 },
  "P2.6 DAHUA":                { w: 0.5, h: 0.5, pxW: 192, pxH: 192, weight: 7.5,  tilesPerCase: 8 },
  "P2.6 DAHUA 50":             { w: 0.5, h: 0.5, pxW: 192, pxH: 192, weight: 7.5,  tilesPerCase: 8 },
  "P2.6 DAHUA 100":            { w: 0.5, h: 1,   pxW: 192, pxH: 384, weight: 14,   tilesPerCase: 6 },
  "P2.6 DAHUA CUBE":           { w: 0.5, h: 0.5, pxW: 192, pxH: 192, weight: 7.5,  tilesPerCase: 8 },
  "2.3 Poly-COLORLIGHT":       { w: 0.5, h: 0.5, pxW: 210, pxH: 210, weight: 7.5,  tilesPerCase: 8 },
  "1.9-NOVA":                  { w: 0.5, h: 0.5, pxW: 256, pxH: 256, weight: 7.7,  tilesPerCase: 8 },
  "Custom":                    { w: 0.5, h: 0.5, pxW: 128, pxH: 128, weight: 7.5,  tilesPerCase: 6 }
};

/* Modelli misti: combinano cabinet 50×50 e 50×100. */
const MIXED_MODELS = {
  "3.9 SIV -Linsn MISTO (50+100)": {
    a: "3.9 SIV -Linsn 50 INT",
    b: "3.9 SIV -Linsn 100 INT",
    labelA: "50×50",
    labelB: "50×100"
  },
  "3.9 SIV -NOVA MISTO (50+100)": {
    a: "3.9 SIV -NOVA 50 EST",
    b: "3.9 SIV -NOVA 100 EST",
    labelA: "50×50",
    labelB: "50×100"
  },
  "P2.6 DAHUA MISTO (50+100)": {
    a: "P2.6 DAHUA 50",
    b: "P2.6 DAHUA 100",
    labelA: "50×50",
    labelB: "50×100"
  },
  "2.6 DAHUA MISTO (50+100)": {
    a: "P2.6 DAHUA 50",
    b: "P2.6 DAHUA 100",
    labelA: "50×50",
    labelB: "50×100"
  }
};

const CUBE_MODELS = ["P2.6 DAHUA CUBE", "DAHUA CUBE"];

/* Modelli con connettore PowerCON TRUE1 (avviso sicurezza). */
function isP26(name) {
  return /2\.6/.test(name || "");
}

/* Etichetta commerciale: antepone "P" se manca. */
function modelLabel(name) {
  if (!name) return "—";
  if (name === "Custom") return "Custom";
  return /^P/.test(name) ? name : "P" + name;
}

/* Restituisce i dati cabinet del modello attivo. */
function modelTile(name, customTile) {
  if (name === "Custom" && customTile) return customTile;
  if (isMixedModel(name)) return MODELS[MIXED_MODELS[name].a] || MODELS["2.9 CHIP-NOVA"];
  return MODELS[name] || MODELS["2.9 CHIP-NOVA"];
}

function isMixedModel(name) {
  return Object.prototype.hasOwnProperty.call(MIXED_MODELS, name);
}

function isCubeModel(name) {
  return CUBE_MODELS.indexOf(name) !== -1;
}

/* Modelli raggruppati per passo, per il selettore mobile. */
const MODEL_GROUPS = [
  { label: "Passo 4.8", items: ["4.8 EST-NOVA"] },
  {
    label: "Passo 3.9",
    items: [
      "3.9 giallo-NOVA",
      "3.9 Trasparent-NOVA",
      "3.9 -Linsn A",
      "3.9 -Linsn A1",
      "3.9 -Linsn B",
      "3.9 SIV -Linsn 50 INT",
      "3.9 SIV -Linsn 100 INT",
      "3.9 SIV -Linsn MISTO (50+100)",
      "3.9 SIV -NOVA 50 EST",
      "3.9 SIV -NOVA 100 EST",
      "3.9 SIV -NOVA MISTO (50+100)"
    ]
  },
  {
    label: "Passo 2.9 / 2.8",
    items: [
      "2.9 CHIP-NOVA",
      "2.9 UC-NOVA",
      "2.9 50 est",
      "2.9 100 est",
      "2.8 Rosso-NOVA",
      "2.8 Verde -NOVA"
    ]
  },
  {
    label: "Passo 2.6",
    items: [
      "2.6 FLEX-NOVA",
      "P2.6 DAHUA",
      "P2.6 DAHUA MISTO (50+100)",
      "P2.6 DAHUA CUBE"
    ]
  },
  {
    label: "Passo 2.3 / 1.9",
    items: ["2.3 Poly-COLORLIGHT", "1.9-NOVA"]
  },
  { label: "Personalizzato", items: ["Custom"] }
];

/* Preset rapidi di dimensione (larghezza × altezza in metri). */
const SIZE_PRESETS = [
  { w: 2, h: 2, label: "2 × 2" },
  { w: 3, h: 2, label: "3 × 2" },
  { w: 4, h: 3, label: "4 × 3" },
  { w: 5, h: 3, label: "5 × 3" },
  { w: 6, h: 3, label: "6 × 3" },
  { w: 8, h: 4.5, label: "8 × 4,5" }
];

/* Preset canvas di output. */
const CANVAS_PRESETS = {
  fhd:       { width: 1920, height: 1080, label: "Full HD" },
  "4k":      { width: 3840, height: 2160, label: "4K UHD" },
  ultrawide: { width: 3840, height: 1080, label: "UltraWide" },
  "8k":      { width: 7680, height: 4320, label: "8K" },
  custom:    { width: 1920, height: 1080, label: "Custom" }
};

/* Campi del dettaglio struttura / appendimento. */
const STRUCTURE_FIELDS = [
  { key: "truss200", label: "Travi 200", short: "200" },
  { key: "truss150", label: "Travi 150", short: "150" },
  { key: "truss100", label: "Travi 100", short: "100" },
  { key: "truss300", label: "Travi 300", short: "300" },
  { key: "feet", label: "Gambe / piedi", short: "Gambe" },
  { key: "fakeFeet", label: "Piedi finti", short: "Finti" },
  { key: "junctions", label: "Giunzioni", short: "Giunz." },
  { key: "aliscaff", label: "Aliscaff", short: "Aliscaff" },
  { key: "doubleAliscaff", label: "Doppio aliscaff", short: "Doppio" },
  { key: "ballast", label: "Zavorre", short: "Zavorre" },
  { key: "spacers", label: "Distanziatori", short: "Distanz." },
  { key: "lBrackets", label: "Piastre L", short: "Piastre L" },
  { key: "plinths", label: "Piedini", short: "Piedini" },
  { key: "boltsM8", label: "Bulloni M8", short: "M8" },
  { key: "boltsM10", label: "Bulloni M10", short: "M10" }
];

const HANGING_FIELDS = [
  { key: "flyBar", label: "Fly bar", short: "Fly bar" },
  { key: "flyBarAliscaf", label: "Fly bar Aliscaf", short: "FB Aliscaf" },
  { key: "flyBarEyebolt", label: "Fly bar golfare", short: "FB Golfare" },
  { key: "brackets", label: "Staffe fly bar", short: "Staffe FB" },
  { key: "reinforcement", label: "Staffe rinforzo", short: "Rinforzi" },
  { key: "spanset1", label: "Spanset 1 m", short: "Spanset 1" },
  { key: "spanset15", label: "Spanset 1,5 m", short: "Spanset 1,5" },
  { key: "trussPlates", label: "Piastre truss", short: "Piastre" },
  { key: "shackles", label: "Grillette", short: "Grillette" },
  { key: "omega", label: "Omega", short: "Omega" }
];
