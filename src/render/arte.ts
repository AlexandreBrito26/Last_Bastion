import type { Mapa, Obstaculo, TemaId } from '../game/data/mapas';

/** Escala da textura do chão (2 = nítida em telas de alta densidade). */
export const ESC = 2;

export interface Tema {
  base1: string;
  base2: string;
  trilha: string;
  borda: string;
  seixo: string;
  detalhe: 'grama' | 'cinza' | 'neve';
  ambiente: 'vagalume' | 'brasa' | 'neve';
  luz: number;
  grade: { sat: number; con: number; tint: number };
  vinheta: string;
}

export const TEMAS: Record<TemaId, Tema> = {
  floresta: {
    base1: '#3a6b3f', base2: '#1f4636', trilha: '#c9a66b', borda: '#6d4f2a', seixo: '#ead9ab',
    detalhe: 'grama', ambiente: 'vagalume', luz: 0xd8ff7a, grade: { sat: 1.15, con: 1.06, tint: 0xfff4e2 }, vinheta: '4,18,16',
  },
  cinzas: {
    base1: '#54403a', base2: '#2a1c20', trilha: '#9a8574', borda: '#35241f', seixo: '#c4b09c',
    detalhe: 'cinza', ambiente: 'brasa', luz: 0xff7a2a, grade: { sat: 1.12, con: 1.12, tint: 0xffe2c8 }, vinheta: '24,6,4',
  },
  gelo: {
    base1: '#d6e8f2', base2: '#8fb4cc', trilha: '#617892', borda: '#2b394d', seixo: '#a7bdd4',
    detalhe: 'neve', ambiente: 'neve', luz: 0x9fe8ff, grade: { sat: 1.05, con: 1.08, tint: 0xe6f2ff }, vinheta: '6,16,36',
  },
  pantano: {
    base1: '#2f4a44', base2: '#16262a', trilha: '#6e6a4e', borda: '#26301f', seixo: '#8fa08a',
    detalhe: 'grama', ambiente: 'vagalume', luz: 0x9dffc4, grade: { sat: 0.95, con: 1.1, tint: 0xe2fff0 }, vinheta: '6,20,24',
  },
  ruinas: {
    base1: '#8a6a45', base2: '#4a2f22', trilha: '#d8b77a', borda: '#5a3b26', seixo: '#e6d2a0',
    detalhe: 'cinza', ambiente: 'brasa', luz: 0xffb347, grade: { sat: 1.1, con: 1.1, tint: 0xfff0d0 }, vinheta: '30,16,6',
  },
};

// ---------- utilidades ----------

function mulberry32(a: number): () => number {
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const hash = (s: string): number => {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) h = Math.imul(h ^ s.charCodeAt(i), 16777619);
  return h >>> 0;
};

function criar(w: number, h: number): [HTMLCanvasElement, CanvasRenderingContext2D] {
  const c = document.createElement('canvas');
  c.width = Math.max(1, Math.round(w));
  c.height = Math.max(1, Math.round(h));
  return [c, c.getContext('2d')!];
}

/** Ruído de valor suave: grade pequena de cinzas aleatórios ampliada com interpolação. */
function ruido(w: number, h: number, celula: number, rnd: () => number): HTMLCanvasElement {
  const [pc, pctx] = criar(Math.ceil(w / celula) + 2, Math.ceil(h / celula) + 2);
  const img = pctx.createImageData(pc.width, pc.height);
  for (let i = 0; i < img.data.length; i += 4) {
    const v = Math.floor(rnd() * 255);
    img.data[i] = img.data[i + 1] = img.data[i + 2] = v;
    img.data[i + 3] = 255;
  }
  pctx.putImageData(img, 0, 0);
  const [c, ctx] = criar(w, h);
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = 'high';
  ctx.drawImage(pc, 0, 0, pc.width * celula, pc.height * celula);
  return c;
}

function camadasRuido(ctx: CanvasRenderingContext2D, w: number, h: number, rnd: () => number, camadas: [number, number][], modo: GlobalCompositeOperation): void {
  ctx.save();
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  ctx.globalCompositeOperation = modo;
  for (const [celula, alfa] of camadas) {
    ctx.globalAlpha = alfa;
    ctx.drawImage(ruido(w, h, celula, rnd), 0, 0);
  }
  ctx.restore();
}

function distSeg(px: number, py: number, ax: number, ay: number, bx: number, by: number): number {
  const dx = bx - ax;
  const dy = by - ay;
  const t = Math.max(0, Math.min(1, ((px - ax) * dx + (py - ay) * dy) / (dx * dx + dy * dy)));
  return Math.hypot(px - (ax + t * dx), py - (ay + t * dy));
}

function distTrilha(x: number, y: number, mapa: Mapa): number {
  let d = 1e9;
  const wp = mapa.waypoints;
  for (let i = 0; i < wp.length - 1; i++) d = Math.min(d, distSeg(x, y, wp[i].x, wp[i].y, wp[i + 1].x, wp[i + 1].y));
  return d;
}

function livre(x: number, y: number, mapa: Mapa, folga: number): boolean {
  if (distTrilha(x, y, mapa) < mapa.larguraTrilha / 2 + folga) return false;
  for (const o of mapa.obstaculos) if (Math.hypot(o.x - x, o.y - y) < o.r + folga) return false;
  return true;
}

function tracarTrilha(ctx: CanvasRenderingContext2D, mapa: Mapa): void {
  const wp = mapa.waypoints;
  ctx.beginPath();
  ctx.moveTo(wp[0].x, wp[0].y);
  for (let i = 1; i < wp.length; i++) ctx.lineTo(wp[i].x, wp[i].y);
}

function blob(ctx: CanvasRenderingContext2D, x: number, y: number, r: number, rnd: () => number, n = 14, irregular = 0.18): void {
  const pts: [number, number][] = [];
  for (let i = 0; i < n; i++) {
    const a = (i / n) * Math.PI * 2;
    const rr = r * (1 - irregular + rnd() * irregular * 2);
    pts.push([x + Math.cos(a) * rr, y + Math.sin(a) * rr]);
  }
  ctx.beginPath();
  for (let i = 0; i < n; i++) {
    const [ax, ay] = pts[i];
    const [bx, by] = pts[(i + 1) % n];
    const mx = (ax + bx) / 2;
    const my = (ay + by) / 2;
    if (i === 0) ctx.moveTo(mx, my);
    else ctx.quadraticCurveTo(ax, ay, mx, my);
  }
  const [fx, fy] = pts[0];
  const [sx, sy] = pts[1];
  ctx.quadraticCurveTo(fx, fy, (fx + sx) / 2, (fy + sy) / 2);
  ctx.closePath();
}

function sombra(ctx: CanvasRenderingContext2D, x: number, y: number, rx: number, ry: number, alfa = 0.35): void {
  ctx.save();
  ctx.fillStyle = `rgba(0,0,0,${alfa})`;
  ctx.beginPath();
  ctx.ellipse(x, y, rx, ry, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

// ---------- obstáculos ----------

function desenharObstaculo(ctx: CanvasRenderingContext2D, o: Obstaculo, rnd: () => number): void {
  const { x, y, r } = o;
  switch (o.tipo) {
    case 'arvore': {
      sombra(ctx, x + r * 0.35, y + r * 0.55, r * 1.1, r * 0.5);
      ctx.fillStyle = '#4a3320';
      ctx.fillRect(x - 3, y + r * 0.2, 6, r * 0.6);
      const folhas: [number, number, number][] = [[0, 0, 1], [-0.45, 0.15, 0.7], [0.45, 0.1, 0.72], [0.05, -0.4, 0.68]];
      for (const [dx, dy, k] of folhas) {
        const g = ctx.createRadialGradient(x + dx * r - r * 0.25, y + dy * r - r * 0.3, r * 0.1, x + dx * r, y + dy * r, r * k);
        g.addColorStop(0, '#8fd36a');
        g.addColorStop(0.55, '#3f9a4a');
        g.addColorStop(1, '#1b5230');
        ctx.fillStyle = g;
        ctx.beginPath();
        ctx.arc(x + dx * r, y + dy * r, r * k, 0, Math.PI * 2);
        ctx.fill();
      }
      break;
    }
    case 'pinheiro': {
      sombra(ctx, x + r * 0.4, y + r * 0.9, r * 0.9, r * 0.35);
      ctx.fillStyle = '#3b2a1e';
      ctx.fillRect(x - 2.5, y + r * 0.6, 5, r * 0.5);
      for (let i = 0; i < 3; i++) {
        const top = y - r * 1.2 + i * r * 0.55;
        const w = r * (0.55 + i * 0.32);
        const g = ctx.createLinearGradient(x - w, top, x + w, top + r);
        g.addColorStop(0, '#2d6a55');
        g.addColorStop(1, '#10362e');
        ctx.fillStyle = g;
        ctx.beginPath();
        ctx.moveTo(x, top);
        ctx.lineTo(x + w, top + r * 0.85);
        ctx.lineTo(x - w, top + r * 0.85);
        ctx.closePath();
        ctx.fill();
        ctx.fillStyle = 'rgba(255,255,255,.85)';
        ctx.beginPath();
        ctx.moveTo(x, top);
        ctx.lineTo(x + w * 0.62, top + r * 0.5);
        ctx.quadraticCurveTo(x + w * 0.1, top + r * 0.38, x - w * 0.3, top + r * 0.55);
        ctx.lineTo(x - w * 0.62, top + r * 0.5);
        ctx.closePath();
        ctx.fill();
      }
      break;
    }
    case 'rocha': {
      sombra(ctx, x + r * 0.3, y + r * 0.6, r * 1.15, r * 0.5);
      const g = ctx.createLinearGradient(x - r, y - r, x + r, y + r);
      g.addColorStop(0, '#a9b0b6');
      g.addColorStop(1, '#4b5258');
      ctx.fillStyle = g;
      blob(ctx, x, y, r, rnd, 9, 0.22);
      ctx.fill();
      ctx.strokeStyle = 'rgba(255,255,255,.35)';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.arc(x, y, r * 0.8, Math.PI * 1.1, Math.PI * 1.65);
      ctx.stroke();
      ctx.strokeStyle = 'rgba(0,0,0,.3)';
      ctx.beginPath();
      ctx.moveTo(x - r * 0.1, y - r * 0.2);
      ctx.lineTo(x + r * 0.2, y + r * 0.15);
      ctx.lineTo(x + r * 0.05, y + r * 0.5);
      ctx.stroke();
      break;
    }
    case 'lago': {
      ctx.fillStyle = 'rgba(30,70,60,.55)';
      blob(ctx, x, y + 1.5, r * 1.12, rnd, 16, 0.14);
      ctx.fill();
      const g = ctx.createRadialGradient(x - r * 0.3, y - r * 0.3, r * 0.1, x, y, r * 1.05);
      g.addColorStop(0, '#7fd4ea');
      g.addColorStop(0.6, '#2f8fb5');
      g.addColorStop(1, '#17587a');
      ctx.fillStyle = g;
      blob(ctx, x, y, r, rnd, 16, 0.14);
      ctx.fill();
      ctx.strokeStyle = 'rgba(255,255,255,.45)';
      ctx.lineWidth = 1.2;
      for (let i = 0; i < 3; i++) {
        ctx.beginPath();
        ctx.ellipse(x - r * 0.2 + i * r * 0.18, y - r * 0.15 + i * r * 0.22, r * 0.28, r * 0.07, 0, 0, Math.PI);
        ctx.stroke();
      }
      ctx.fillStyle = '#3e9a4c';
      ctx.beginPath();
      ctx.arc(x + r * 0.35, y + r * 0.3, 4, 0, Math.PI * 2);
      ctx.fill();
      break;
    }
    case 'lava': {
      ctx.fillStyle = '#140d0c';
      blob(ctx, x, y, r * 1.18, rnd, 14, 0.18);
      ctx.fill();
      const g = ctx.createRadialGradient(x, y, r * 0.05, x, y, r);
      g.addColorStop(0, '#fff2a8');
      g.addColorStop(0.35, '#ffb52e');
      g.addColorStop(0.75, '#e2400a');
      g.addColorStop(1, '#7a1405');
      ctx.fillStyle = g;
      blob(ctx, x, y, r, rnd, 14, 0.16);
      ctx.fill();
      ctx.strokeStyle = 'rgba(40,10,5,.7)';
      ctx.lineWidth = 1.6;
      for (let i = 0; i < 4; i++) {
        const a = rnd() * Math.PI * 2;
        ctx.beginPath();
        ctx.moveTo(x + Math.cos(a) * r * 0.15, y + Math.sin(a) * r * 0.15);
        ctx.lineTo(x + Math.cos(a + 0.3) * r * 0.55, y + Math.sin(a + 0.3) * r * 0.55);
        ctx.lineTo(x + Math.cos(a - 0.1) * r * 0.9, y + Math.sin(a - 0.1) * r * 0.9);
        ctx.stroke();
      }
      break;
    }
    case 'cristal': {
      sombra(ctx, x + r * 0.3, y + r * 0.7, r * 1.1, r * 0.4, 0.28);
      const cristais: [number, number, number, number][] = [[0, 0, 0.55, 1.5], [-0.65, 0.25, 0.4, 0.95], [0.6, 0.2, 0.42, 1.1], [-0.2, 0.45, 0.32, 0.7]];
      for (const [dx, dy, w, h] of cristais) {
        const cx = x + dx * r;
        const cy = y + dy * r;
        const g = ctx.createLinearGradient(cx - w * r, cy, cx + w * r, cy);
        g.addColorStop(0, '#d9fbff');
        g.addColorStop(0.5, '#6fd6f0');
        g.addColorStop(1, '#2a7fb0');
        ctx.fillStyle = g;
        ctx.beginPath();
        ctx.moveTo(cx, cy - h * r);
        ctx.lineTo(cx + w * r, cy - h * r * 0.25);
        ctx.lineTo(cx + w * r * 0.8, cy + r * 0.5);
        ctx.lineTo(cx - w * r * 0.8, cy + r * 0.5);
        ctx.lineTo(cx - w * r, cy - h * r * 0.25);
        ctx.closePath();
        ctx.fill();
        ctx.strokeStyle = 'rgba(255,255,255,.8)';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(cx, cy - h * r);
        ctx.lineTo(cx - w * r * 0.15, cy + r * 0.5);
        ctx.stroke();
      }
      break;
    }
  }
}

// ---------- detalhes do terreno ----------

function detalhes(ctx: CanvasRenderingContext2D, mapa: Mapa, tema: Tema, rnd: () => number): void {
  const n = 1100;
  for (let i = 0; i < n; i++) {
    const x = rnd() * mapa.largura;
    const y = rnd() * mapa.altura;
    if (!livre(x, y, mapa, 8)) continue;
    if (tema.detalhe === 'grama') {
      const tons = ['rgba(150,230,110,.55)', 'rgba(20,70,40,.55)', 'rgba(210,240,140,.4)'];
      ctx.strokeStyle = tons[Math.floor(rnd() * tons.length)];
      ctx.lineWidth = 1;
      ctx.beginPath();
      for (let k = -1; k <= 1; k++) {
        ctx.moveTo(x + k * 1.6, y);
        ctx.lineTo(x + k * 2.6 + (rnd() - 0.5) * 2, y - 3 - rnd() * 3);
      }
      ctx.stroke();
      if (rnd() < 0.03) {
        ctx.fillStyle = ['#fff2a8', '#ff9fc0', '#ffffff'][Math.floor(rnd() * 3)];
        ctx.beginPath();
        ctx.arc(x, y, 1.6, 0, Math.PI * 2);
        ctx.fill();
      }
    } else if (tema.detalhe === 'cinza') {
      if (rnd() < 0.55) {
        ctx.fillStyle = rnd() < 0.5 ? 'rgba(0,0,0,.28)' : 'rgba(255,200,160,.14)';
        ctx.beginPath();
        ctx.ellipse(x, y, 1.5 + rnd() * 2.5, 1 + rnd() * 1.6, rnd() * 3, 0, Math.PI * 2);
        ctx.fill();
      } else if (rnd() < 0.15) {
        ctx.strokeStyle = 'rgba(0,0,0,.35)';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(x, y);
        ctx.lineTo(x + (rnd() - 0.5) * 14, y + (rnd() - 0.5) * 14);
        ctx.lineTo(x + (rnd() - 0.5) * 22, y + (rnd() - 0.5) * 22);
        ctx.stroke();
      }
    } else {
      ctx.fillStyle = rnd() < 0.5 ? 'rgba(255,255,255,.7)' : 'rgba(110,150,190,.25)';
      ctx.beginPath();
      ctx.ellipse(x, y, 1.2 + rnd() * 3, 0.8 + rnd() * 1.4, 0, 0, Math.PI * 2);
      ctx.fill();
    }
  }
  if (tema.detalhe === 'neve') {
    ctx.fillStyle = 'rgba(255,255,255,.25)';
    for (let i = 0; i < 26; i++) {
      const x = rnd() * mapa.largura;
      const y = rnd() * mapa.altura;
      if (!livre(x, y, mapa, 30)) continue;
      ctx.beginPath();
      ctx.ellipse(x, y, 30 + rnd() * 40, 8 + rnd() * 10, rnd() * 0.5 - 0.25, 0, Math.PI * 2);
      ctx.fill();
    }
  }
}

// ---------- chão completo ----------

export function gerarChao(mapa: Mapa): HTMLCanvasElement {
  const tema = TEMAS[mapa.tema];
  const rnd = mulberry32(hash(mapa.id));
  const W = mapa.largura * ESC;
  const H = mapa.altura * ESC;
  const [canvas, ctx] = criar(W, H);

  // 1) base em degradê + ruído em várias escalas (relevo de cor)
  const g = ctx.createLinearGradient(0, 0, W, H);
  g.addColorStop(0, tema.base1);
  g.addColorStop(1, tema.base2);
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, W, H);
  camadasRuido(ctx, W, H, rnd, [[220, 0.55], [90, 0.4], [34, 0.28], [12, 0.16]], 'overlay');

  ctx.save();
  ctx.scale(ESC, ESC);

  // 2) detalhes espalhados (grama, rachaduras, neve...)
  detalhes(ctx, mapa, tema, rnd);

  // 3) trilha: sombra projetada + borda
  ctx.lineJoin = 'round';
  ctx.lineCap = 'round';
  ctx.save();
  ctx.shadowColor = 'rgba(0,0,0,.5)';
  ctx.shadowBlur = 12 * ESC;
  ctx.shadowOffsetY = 4 * ESC;
  ctx.strokeStyle = tema.borda;
  ctx.lineWidth = mapa.larguraTrilha + 10;
  tracarTrilha(ctx, mapa);
  ctx.stroke();
  ctx.restore();

  ctx.strokeStyle = tema.borda;
  ctx.lineWidth = mapa.larguraTrilha + 8;
  tracarTrilha(ctx, mapa);
  ctx.stroke();

  // 4) miolo da trilha numa camada própria: textura só dentro do caminho
  const [tc, tctx] = criar(W, H);
  tctx.scale(ESC, ESC);
  tctx.lineJoin = 'round';
  tctx.lineCap = 'round';
  tctx.strokeStyle = tema.trilha;
  tctx.lineWidth = mapa.larguraTrilha;
  tracarTrilha(tctx, mapa);
  tctx.stroke();
  tctx.setTransform(1, 0, 0, 1, 0, 0);
  camadasRuido(tctx, W, H, rnd, [[40, 0.5], [14, 0.4], [5, 0.25]], 'source-atop');
  // faixa clara central e sombra nas bordas internas
  tctx.save();
  tctx.scale(ESC, ESC);
  tctx.globalCompositeOperation = 'source-atop';
  tctx.lineJoin = 'round';
  tctx.lineCap = 'round';
  tctx.strokeStyle = 'rgba(255,255,255,.10)';
  tctx.lineWidth = mapa.larguraTrilha * 0.55;
  tracarTrilha(tctx, mapa);
  tctx.stroke();
  tctx.strokeStyle = 'rgba(0,0,0,.18)';
  tctx.lineWidth = 3;
  tctx.setLineDash([9, 13]);
  tracarTrilha(tctx, mapa);
  tctx.stroke();
  tctx.setLineDash([]);
  // seixos
  const wp = mapa.waypoints;
  for (let i = 0; i < wp.length - 1; i++) {
    const a = wp[i];
    const b = wp[i + 1];
    const len = Math.hypot(b.x - a.x, b.y - a.y);
    const nx = -(b.y - a.y) / len;
    const ny = (b.x - a.x) / len;
    const qtd = Math.floor(len / 5);
    for (let k = 0; k < qtd; k++) {
      const t = rnd();
      const off = (rnd() - 0.5) * (mapa.larguraTrilha - 8);
      const x = a.x + (b.x - a.x) * t + nx * off;
      const y = a.y + (b.y - a.y) * t + ny * off;
      const r = 0.8 + rnd() * 1.8;
      tctx.fillStyle = 'rgba(0,0,0,.25)';
      tctx.beginPath();
      tctx.ellipse(x + 0.6, y + 0.9, r, r * 0.8, 0, 0, Math.PI * 2);
      tctx.fill();
      tctx.fillStyle = tema.seixo;
      tctx.globalAlpha = 0.55 + rnd() * 0.4;
      tctx.beginPath();
      tctx.ellipse(x, y, r, r * 0.8, 0, 0, Math.PI * 2);
      tctx.fill();
      tctx.globalAlpha = 1;
    }
  }
  tctx.restore();
  ctx.save();
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  ctx.drawImage(tc, 0, 0);
  ctx.restore();

  // 5) obstáculos ordenados por y (profundidade)
  for (const o of [...mapa.obstaculos].sort((a, b) => a.y - b.y)) desenharObstaculo(ctx, o, rnd);

  ctx.restore();

  // 6) correção final de contraste suave (luz do topo-esquerda)
  const luz = ctx.createLinearGradient(0, 0, W, H);
  luz.addColorStop(0, 'rgba(255,255,255,.07)');
  luz.addColorStop(1, 'rgba(0,0,0,.14)');
  ctx.fillStyle = luz;
  ctx.fillRect(0, 0, W, H);
  return canvas;
}

export function gerarVinheta(w: number, h: number, rgb: string): HTMLCanvasElement {
  const [c, ctx] = criar(w, h);
  const g = ctx.createRadialGradient(w / 2, h / 2, Math.min(w, h) * 0.35, w / 2, h / 2, Math.hypot(w, h) * 0.58);
  g.addColorStop(0, `rgba(${rgb},0)`);
  g.addColorStop(1, `rgba(${rgb},.62)`);
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, w, h);
  return c;
}
