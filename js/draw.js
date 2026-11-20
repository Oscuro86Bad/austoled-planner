/* ============================================================
   AUSTOLED PLANNER MOBILE — disegni tecnici SVG
   ============================================================ */
"use strict";

function esc(value) {
  return String(value == null ? "" : value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

/* ---------- Prospetto frontale in scala ---------- */
function prospettoSVG(state, calc) {
  const d = calc.dimensions;
  const realW = Math.max(0.1, d.realW);
  const realH = Math.max(0.1, d.realH);
  const ground = Math.max(0, calc.ground);
  const totalH = ground + realH;

  const S = Math.min(
    560 / Math.max(realW, 1),
    420 / Math.max(totalH, 1),
    150
  );

  const mLeft = 160;
  const mRight = 150;
  const mTop = 58;
  const mBottom = 102;

  const sw = realW * S;
  const sh = realH * S;
  const humanH = 1.75 * S;
  const topExtra = Math.max(0, humanH - totalH * S);

  const x0 = mLeft;
  const y0 = mTop + topExtra;
  const yBottom = y0 + sh;
  const yGround = y0 + totalH * S;
  const W = mLeft + sw + mRight;
  const H = y0 + totalH * S + mBottom;

  const ink = "#0f172a";
  const muted = "#475569";
  const line = "#64748b";
  const accent = "#2563eb";
  const light = "#dbeafe";

  const out = [];
  out.push(`<svg xmlns="http://www.w3.org/2000/svg" width="${Math.round(W)}" height="${Math.round(H)}" viewBox="0 0 ${W.toFixed(1)} ${H.toFixed(1)}" role="img" aria-label="Prospetto LED wall ${fmtM(realW)} per ${fmtM(realH)}">`);
  out.push(`<defs>
    <linearGradient id="ledFill" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="#eff6ff"/>
      <stop offset="1" stop-color="#bfdbfe"/>
    </linearGradient>
    <marker id="arr" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6.5" markerHeight="6.5" orient="auto-start-reverse">
      <path d="M0,0 L10,5 L0,10 z" fill="${ink}"/>
    </marker>
    <pattern id="hatch" width="14" height="14" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
      <line x1="0" y1="0" x2="0" y2="14" stroke="#cbd5e1" stroke-width="2"/>
    </pattern>
  </defs>`);

  out.push(`<rect x="0" y="0" width="${W}" height="${H}" fill="#ffffff"/>`);

  /* Intestazione tecnica */
  out.push(`<text x="22" y="24" font-family="Segoe UI, Arial, sans-serif" font-size="12" font-weight="700" letter-spacing="2" fill="#94a3b8">PROSPETTO IN SCALA</text>`);
  out.push(`<text x="${W - 22}" y="24" text-anchor="end" font-family="Segoe UI, Arial, sans-serif" font-size="12" font-weight="700" fill="#94a3b8">${esc(calc.label)}</text>`);

  /* Terreno */
  out.push(`<rect x="18" y="${yGround}" width="${W - 36}" height="16" fill="url(#hatch)" opacity="0.55"/>`);
  out.push(`<line x1="18" y1="${yGround}" x2="${W - 18}" y2="${yGround}" stroke="${line}" stroke-width="2.5"/>`);

  /* Gambe / struttura */
  const legCount = Math.max(2, calc.structure.feet || 2);
  if (ground > 0.02) {
    for (let i = 0; i < legCount; i++) {
      const lx = x0 + (sw * (i + 0.5)) / legCount;
      out.push(`<line x1="${lx.toFixed(1)}" y1="${yBottom.toFixed(1)}" x2="${lx.toFixed(1)}" y2="${yGround.toFixed(1)}" stroke="${ink}" stroke-width="7" stroke-linecap="round"/>`);
      out.push(`<rect x="${(lx - 20).toFixed(1)}" y="${(yGround - 4).toFixed(1)}" width="40" height="8" rx="2" fill="${ink}"/>`);
    }
    /* Traversa orizzontale tra le gambe */
    if (legCount > 1) {
      const first = x0 + (sw * 0.5) / legCount;
      const last = x0 + (sw * (legCount - 0.5)) / legCount;
      const braceY = yGround - (yGround - yBottom) * 0.35;
      out.push(`<line x1="${first.toFixed(1)}" y1="${braceY.toFixed(1)}" x2="${last.toFixed(1)}" y2="${braceY.toFixed(1)}" stroke="${muted}" stroke-width="3" opacity="0.55"/>`);
    }
  }

  /* Schermo LED */
  out.push(`<rect x="${x0}" y="${y0}" width="${sw}" height="${sh}" fill="url(#ledFill)" stroke="${ink}" stroke-width="4"/>`);

  /* Griglia moduli */
  const maxLines = 90;
  const cols = Math.max(1, d.cols);
  const rows = Math.max(1, d.rows);
  const stepX = d.tileW * S;
  const stepY = d.tileH * S;
  if (cols <= maxLines) {
    for (let i = 1; i < cols; i++) {
      const gx = x0 + i * stepX;
      out.push(`<line x1="${gx.toFixed(1)}" y1="${y0}" x2="${gx.toFixed(1)}" y2="${yBottom}" stroke="${line}" stroke-width="1" opacity="0.55"/>`);
    }
  }
  if (rows <= maxLines) {
    if (calc.mixed && calc.mixedInfo) {
      const m = calc.mixedInfo;
      let cursor = yBottom;
      for (let i = 0; i < m.rows50; i++) {
        cursor -= m.tile50.h * S;
        if (i < m.rows50 - 1) {
          out.push(`<line x1="${x0}" y1="${cursor.toFixed(1)}" x2="${x0 + sw}" y2="${cursor.toFixed(1)}" stroke="${line}" stroke-width="1" opacity="0.55"/>`);
        }
      }
      if (m.rows50 > 0 && m.rows100 > 0) {
        out.push(`<line x1="${x0}" y1="${cursor.toFixed(1)}" x2="${x0 + sw}" y2="${cursor.toFixed(1)}" stroke="${accent}" stroke-width="2" stroke-dasharray="6 4" opacity="0.8"/>`);
      }
      for (let i = 0; i < m.rows100; i++) {
        cursor -= m.tile100.h * S;
        if (i < m.rows100 - 1) {
          out.push(`<line x1="${x0}" y1="${cursor.toFixed(1)}" x2="${x0 + sw}" y2="${cursor.toFixed(1)}" stroke="${line}" stroke-width="1" opacity="0.55"/>`);
        }
      }
    } else {
      for (let i = 1; i < rows; i++) {
        const gy = yBottom - i * stepY;
        out.push(`<line x1="${x0}" y1="${gy.toFixed(1)}" x2="${x0 + sw}" y2="${gy.toFixed(1)}" stroke="${line}" stroke-width="1" opacity="0.55"/>`);
      }
    }
  }

  /* Etichetta risoluzione dentro lo schermo */
  if (sw > 120 && sh > 54) {
    const label = `${d.resW} × ${d.resH} px`;
    const tw = label.length * 8.4 + 18;
    out.push(`<rect x="${(x0 + sw / 2 - tw / 2).toFixed(1)}" y="${(yBottom - 30).toFixed(1)}" width="${tw.toFixed(1)}" height="22" rx="11" fill="#ffffff" opacity="0.82"/>`);
    out.push(`<text x="${(x0 + sw / 2).toFixed(1)}" y="${(yBottom - 14).toFixed(1)}" text-anchor="middle" font-family="Segoe UI, Arial, sans-serif" font-size="13" font-weight="800" fill="${accent}">${label}</text>`);
  }

  /* Figura umana di riferimento */
  const hx = 58;
  const headR = Math.max(4, 0.105 * S);
  const headY = yGround - 1.66 * S;
  const shoulderY = yGround - 1.47 * S;
  const hipY = yGround - 0.86 * S;
  out.push(`<g stroke="#94a3b8" stroke-linecap="round" fill="none">`);
  out.push(`<circle cx="${hx}" cy="${headY.toFixed(1)}" r="${headR.toFixed(1)}" fill="#e2e8f0" stroke="#64748b" stroke-width="2"/>`);
  out.push(`<line x1="${hx}" y1="${(headY + headR).toFixed(1)}" x2="${hx}" y2="${hipY.toFixed(1)}" stroke-width="${Math.max(7, 0.15 * S).toFixed(1)}"/>`);
  out.push(`<line x1="${hx}" y1="${shoulderY.toFixed(1)}" x2="${(hx - 0.16 * S).toFixed(1)}" y2="${(yGround - 1.0 * S).toFixed(1)}" stroke-width="${Math.max(4, 0.075 * S).toFixed(1)}"/>`);
  out.push(`<line x1="${hx}" y1="${shoulderY.toFixed(1)}" x2="${(hx + 0.16 * S).toFixed(1)}" y2="${(yGround - 1.0 * S).toFixed(1)}" stroke-width="${Math.max(4, 0.075 * S).toFixed(1)}"/>`);
  out.push(`<line x1="${hx}" y1="${hipY.toFixed(1)}" x2="${(hx - 0.11 * S).toFixed(1)}" y2="${yGround}" stroke-width="${Math.max(5, 0.085 * S).toFixed(1)}"/>`);
  out.push(`<line x1="${hx}" y1="${hipY.toFixed(1)}" x2="${(hx + 0.11 * S).toFixed(1)}" y2="${yGround}" stroke-width="${Math.max(5, 0.085 * S).toFixed(1)}"/>`);
  out.push(`</g>`);
  out.push(`<text x="${hx}" y="${(yGround + 18).toFixed(1)}" text-anchor="middle" font-family="Segoe UI, Arial, sans-serif" font-size="13" font-weight="700" fill="${muted}">1,75 m</text>`);

  /* Quota totale */
  const qx = x0 - 26;
  out.push(`<line x1="${qx}" y1="${y0}" x2="${qx}" y2="${yGround}" stroke="${ink}" stroke-width="1.6" marker-start="url(#arr)" marker-end="url(#arr)"/>`);
  out.push(`<line x1="${qx}" y1="${y0}" x2="${x0}" y2="${y0}" stroke="${ink}" stroke-width="1" stroke-dasharray="4 3" opacity="0.6"/>`);
  out.push(`<line x1="${qx}" y1="${yGround}" x2="${x0}" y2="${yGround}" stroke="${ink}" stroke-width="1" stroke-dasharray="4 3" opacity="0.6"/>`);
  out.push(`<text x="${x0}" y="${(y0 - 14).toFixed(1)}" font-family="Segoe UI, Arial, sans-serif" font-size="17" font-weight="800" fill="${ink}">QUOTA TOTALE <tspan fill="${accent}">${fmtM(totalH)}</tspan></text>`);

  /* H LED */
  const dx = x0 + sw + 28;
  out.push(`<line x1="${dx}" y1="${y0}" x2="${dx}" y2="${yBottom}" stroke="${ink}" stroke-width="1.6" marker-start="url(#arr)" marker-end="url(#arr)"/>`);
  out.push(`<line x1="${x0 + sw}" y1="${y0}" x2="${dx}" y2="${y0}" stroke="${ink}" stroke-width="1" stroke-dasharray="4 3" opacity="0.6"/>`);
  out.push(`<line x1="${x0 + sw}" y1="${yBottom}" x2="${dx}" y2="${yBottom}" stroke="${ink}" stroke-width="1" stroke-dasharray="4 3" opacity="0.6"/>`);
  const midLed = (y0 + yBottom) / 2;
  out.push(`<text x="${(dx + 12).toFixed(1)}" y="${(midLed - 4).toFixed(1)}" font-family="Segoe UI, Arial, sans-serif" font-size="13" font-weight="700" fill="${muted}">H LED</text>`);
  out.push(`<text x="${(dx + 12).toFixed(1)}" y="${(midLed + 16).toFixed(1)}" font-family="Segoe UI, Arial, sans-serif" font-size="18" font-weight="900" fill="${ink}">${fmtM(realH)}</text>`);

  /* H terra */
  if (ground > 0.02) {
    const tx = x0 - 26;
    out.push(`<line x1="${tx}" y1="${yBottom}" x2="${tx}" y2="${yGround}" stroke="${accent}" stroke-width="1.8" marker-start="url(#arr)" marker-end="url(#arr)"/>`);
    out.push(`<text x="${(tx - 12).toFixed(1)}" y="${((yBottom + yGround) / 2 - 3).toFixed(1)}" text-anchor="end" font-family="Segoe UI, Arial, sans-serif" font-size="12" font-weight="700" fill="${muted}">H TERRA</text>`);
    out.push(`<text x="${(tx - 12).toFixed(1)}" y="${((yBottom + yGround) / 2 + 15).toFixed(1)}" text-anchor="end" font-family="Segoe UI, Arial, sans-serif" font-size="16" font-weight="900" fill="${accent}">${fmtM(ground)}</text>`);
  } else {
    out.push(`<rect x="${x0}" y="${(yGround - 24).toFixed(1)}" width="112" height="19" rx="9.5" fill="#eff6ff" stroke="${accent}" stroke-width="1"/>`);
    out.push(`<text x="${(x0 + 56).toFixed(1)}" y="${(yGround - 10).toFixed(1)}" text-anchor="middle" font-family="Segoe UI, Arial, sans-serif" font-size="11" font-weight="800" fill="${accent}">A TERRA ±0,00</text>`);
  }

  /* Larghezza */
  const wy = yGround + 52;
  out.push(`<line x1="${x0}" y1="${wy}" x2="${x0 + sw}" y2="${wy}" stroke="${ink}" stroke-width="1.6" marker-start="url(#arr)" marker-end="url(#arr)"/>`);
  out.push(`<line x1="${x0}" y1="${yBottom}" x2="${x0}" y2="${(wy + 8).toFixed(1)}" stroke="${ink}" stroke-width="1" stroke-dasharray="4 3" opacity="0.45"/>`);
  out.push(`<line x1="${x0 + sw}" y1="${yBottom}" x2="${x0 + sw}" y2="${(wy + 8).toFixed(1)}" stroke="${ink}" stroke-width="1" stroke-dasharray="4 3" opacity="0.45"/>`);
  out.push(`<text x="${(x0 + sw / 2).toFixed(1)}" y="${(wy + 20).toFixed(1)}" text-anchor="middle" font-family="Segoe UI, Arial, sans-serif" font-size="12" font-weight="700" fill="${muted}">LARGHEZZA ${cols} MODULI</text>`);
  out.push(`<text x="${(x0 + sw / 2).toFixed(1)}" y="${(wy + 39).toFixed(1)}" text-anchor="middle" font-family="Segoe UI, Arial, sans-serif" font-size="17" font-weight="900" fill="${ink}">${fmtM(realW)}</text>`);

  /* Footer tecnico */
  out.push(`<text x="${W - 22}" y="${(H - 12).toFixed(1)}" text-anchor="end" font-family="Segoe UI, Arial, sans-serif" font-size="10" font-weight="700" letter-spacing="1" fill="#cbd5e1">AUSTOLED PLANNER</text>`);

  out.push(`</svg>`);
  return out.join("\n");
}

/* ---------- Griglia moduli per la sintesi ---------- */
function gridSVG(calc) {
  const d = calc.dimensions;
  const cols = Math.max(1, d.cols);
  const rows = Math.max(1, d.rows);
  const unit = 10;
  const W = cols * unit;
  const H = rows * unit;
  const gap = 0.9;
  const out = [];

  out.push(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" preserveAspectRatio="xMidYMid meet" role="img" aria-label="Griglia ${cols} colonne per ${rows} righe">`);

  let cubeLeft = calc.cubeInfo ? calc.cubeInfo.active : 0;

  if (calc.mixed && calc.mixedInfo) {
    const m = calc.mixedInfo;
    /* Righe 50×50 in basso */
    for (let r = 0; r < m.rows50; r++) {
      for (let c = 0; c < cols; c++) {
        const x = c * unit + gap;
        const y = H - (r + 1) * unit + gap;
        out.push(`<rect x="${x.toFixed(2)}" y="${y.toFixed(2)}" width="${(unit - gap * 2).toFixed(2)}" height="${(unit - gap * 2).toFixed(2)}" rx="1.2" fill="#3b82f6" fill-opacity="0.22" stroke="#2563eb" stroke-opacity="0.65" stroke-width="0.35"/>`);
      }
    }
    /* Righe 50×100 in alto */
    for (let r = 0; r < m.rows100; r++) {
      for (let c = 0; c < cols; c++) {
        const x = c * unit + gap;
        const y = H - (m.rows50 + r + 2) * unit + gap;
        out.push(`<rect x="${x.toFixed(2)}" y="${y.toFixed(2)}" width="${(unit - gap * 2).toFixed(2)}" height="${(unit * 2 - gap * 2).toFixed(2)}" rx="1.2" fill="#10b981" fill-opacity="0.18" stroke="#059669" stroke-opacity="0.6" stroke-width="0.35"/>`);
      }
    }
  } else {
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        const isCube = cubeLeft > 0;
        if (isCube) cubeLeft--;
        const x = c * unit + gap;
        const y = r * unit + gap;
        const fill = isCube ? "#f59e0b" : "#3b82f6";
        const fillOpacity = isCube ? 0.55 : 0.2;
        const stroke = isCube ? "#d97706" : "#2563eb";
        out.push(`<rect x="${x.toFixed(2)}" y="${y.toFixed(2)}" width="${(unit - gap * 2).toFixed(2)}" height="${(unit - gap * 2).toFixed(2)}" rx="1.2" fill="${fill}" fill-opacity="${fillOpacity}" stroke="${stroke}" stroke-opacity="0.7" stroke-width="0.35"/>`);
      }
    }
  }

  out.push(`<rect x="0.3" y="0.3" width="${(W - 0.6).toFixed(2)}" height="${(H - 0.6).toFixed(2)}" fill="none" stroke="#0f172a" stroke-width="0.7"/>`);
  out.push(`</svg>`);
  return out.join("\n");
}
