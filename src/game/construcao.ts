import type { Vec } from '../core/vec';
import type { Mapa } from './data/mapas';
import type { Mundo, Torre } from './estado';
import { TORRES } from './data/torres';

/** Cada torre do mesmo tipo já construída encarece a próxima (anti-spam). */
export const ESCALA_CUSTO = 0.12;
export function custoTorre(m: Mundo, defId: string): number {
  const n = m.torres.filter((t) => t.defId === defId).length;
  return Math.round((TORRES[defId].custo * (1 + ESCALA_CUSTO * n)) / 5) * 5;
}

const RAIO_TORRE = 16;

function distSegmento(p: Vec, a: Vec, b: Vec): number {
  const dx = b.x - a.x;
  const dy = b.y - a.y;
  const t = Math.max(0, Math.min(1, ((p.x - a.x) * dx + (p.y - a.y) * dy) / (dx * dx + dy * dy)));
  return Math.hypot(p.x - (a.x + t * dx), p.y - (a.y + t * dy));
}

export function posicaoValida(m: Mundo, mapa: Mapa, pos: Vec): boolean {
  const margem = 20;
  if (pos.x < margem || pos.y < margem || pos.x > mapa.largura - margem || pos.y > mapa.altura - margem) return false;
  const wp = mapa.waypoints;
  for (let i = 0; i < wp.length - 1; i++) {
    if (distSegmento(pos, wp[i], wp[i + 1]) < mapa.larguraTrilha / 2 + RAIO_TORRE) return false;
  }
  for (const t of m.torres) {
    if (Math.hypot(t.pos.x - pos.x, t.pos.y - pos.y) < RAIO_TORRE * 2) return false;
  }
  return true;
}

export function torreEm(m: Mundo, pos: Vec): Torre | null {
  for (const t of m.torres) {
    if (Math.abs(t.pos.x - pos.x) <= 16 && Math.abs(t.pos.y - pos.y) <= 16) return t;
  }
  return null;
}
