import { audio } from '../core/audio';
import { COR } from '../core/cores';
import { ouvir, type EventoJogo } from '../core/eventos';
import type { Vec } from '../core/vec';
import { useUI } from '../store/ui';

export interface Particula {
  x: number;
  y: number;
  vx: number;
  vy: number;
  ttl: number;
  ttlMax: number;
  cor: number;
  tam: number;
  atrito: number; // fração da velocidade mantida por segundo
  grav: number;
  forma: 'quad' | 'circ' | 'anel';
  fim: number; // multiplicador de tamanho no fim da vida (anel cresce)
}

export interface Flutuante {
  x: number;
  y: number;
  ttl: number;
  ttlMax: number;
  texto: string;
  cor: number;
}

const MAX_PARTICULAS = 700;
const MAX_FLUTUANTES = 20;

/** Estado de feedback visual: partículas, textos flutuantes e tremor de tela. */
export const fx = {
  particulas: [] as Particula[],
  flutuantes: [] as Flutuante[],
  tremor: 0,
};

const rnd = (a: number, b: number) => a + Math.random() * (b - a);

function emitirParticula(p: Partial<Particula> & Pick<Particula, 'x' | 'y' | 'cor'>): void {
  if (fx.particulas.length >= MAX_PARTICULAS) return;
  const ttl = p.ttl ?? 0.5;
  fx.particulas.push({ vx: 0, vy: 0, tam: 3, atrito: 0.05, grav: 0, forma: 'quad', fim: 0, ...p, ttl, ttlMax: ttl });
}

function explodir(pos: Vec, n: number, cor: number, vel: number, tam = 3, ttl = 0.5, grav = 120): void {
  for (let i = 0; i < n; i++) {
    const a = Math.random() * Math.PI * 2;
    const v = rnd(vel * 0.3, vel);
    emitirParticula({ x: pos.x, y: pos.y, vx: Math.cos(a) * v, vy: Math.sin(a) * v, cor, tam: rnd(tam * 0.6, tam * 1.4), ttl: rnd(ttl * 0.6, ttl), grav });
  }
}

function anel(pos: Vec, raio: number, cor: number, ttl = 0.35): void {
  emitirParticula({ x: pos.x, y: pos.y, cor, tam: raio * 0.25, fim: 4, ttl, forma: 'anel', atrito: 1 });
}

function flutuante(pos: Vec, texto: string, cor: number): void {
  if (fx.flutuantes.length >= MAX_FLUTUANTES) return;
  fx.flutuantes.push({ x: pos.x + rnd(-6, 6), y: pos.y - 10, ttl: 0.9, ttlMax: 0.9, texto, cor });
}

const tremer = (n: number) => { fx.tremor = Math.min(14, Math.max(fx.tremor, n)); };

function tratar(e: EventoJogo): void {
  const ui = useUI.getState();
  switch (e.t) {
    case 'tiro': {
      audio.tocar('tiro_' + e.torre, rnd(-0.06, 0.06));
      const a = Math.atan2(e.para.y - e.de.y, e.para.x - e.de.x);
      const cor = e.torre === 'gelo' ? 0xcaf0f8 : e.torre === 'tesla' ? 0xd0a0ff : e.torre === 'canhao' ? 0xf8961e : COR.ouro;
      const n = e.torre === 'canhao' ? 6 : 3;
      for (let i = 0; i < n; i++) {
        const d = a + rnd(-0.35, 0.35);
        const v = rnd(60, 150);
        emitirParticula({ x: e.de.x + Math.cos(a) * 14, y: e.de.y + Math.sin(a) * 14, vx: Math.cos(d) * v, vy: Math.sin(d) * v, cor, tam: rnd(1.5, 3), ttl: rnd(0.12, 0.25) });
      }
      if (e.torre === 'canhao') tremer(0.8);
      break;
    }
    case 'acerto':
      audio.tocar('acerto', rnd(-0.2, 0.2));
      explodir(e.pos, 4, e.cor, 90, 2, 0.25, 0);
      break;
    case 'impacto':
      audio.tocar('explosao');
      explodir(e.pos, 16, e.cor, 170, 3.5, 0.5, 80);
      explodir(e.pos, 8, 0xffd60a, 110, 2.5, 0.35, 40);
      anel(e.pos, e.area, e.cor);
      tremer(1.8);
      break;
    case 'morte': {
      const grande = e.chefe;
      audio.tocar(grande ? 'morte_chefe' : 'morte', rnd(-0.1, 0.1) + (11 - e.raio) * 0.03);
      explodir(e.pos, grande ? 70 : 10 + Math.round(e.raio / 2), e.cor, grande ? 280 : 130, grande ? 5 : 3, grande ? 1 : 0.55);
      explodir(e.pos, grande ? 20 : 3, 0xffffff, grande ? 200 : 90, 2, 0.3, 0);
      flutuante(e.pos, '+' + e.ouro, COR.ouro);
      if (grande) {
        anel(e.pos, 100, COR.inimigoElite, 0.7);
        tremer(12);
      }
      break;
    }
    case 'vazou':
      audio.tocar('vazou');
      explodir(e.pos, 22, COR.dano, 210, 4, 0.7, 0);
      anel(e.pos, 30, COR.dano, 0.5);
      tremer(5 + e.dano);
      ui.registrarDano();
      break;
    case 'construir':
      audio.tocar('construir');
      anel(e.pos, 30, e.cor, 0.35);
      for (let i = 0; i < 12; i++) emitirParticula({ x: e.pos.x + rnd(-14, 14), y: e.pos.y + 14, vx: rnd(-40, 40), vy: rnd(-70, -20), cor: 0xc9a66b, tam: rnd(2, 4), ttl: rnd(0.3, 0.55), grav: 160 });
      break;
    case 'melhorar':
      audio.tocar('melhorar');
      anel(e.pos, 36, COR.ouro, 0.5);
      for (let i = 0; i < 14; i++) emitirParticula({ x: e.pos.x + rnd(-14, 14), y: e.pos.y + rnd(0, 14), vx: rnd(-15, 15), vy: rnd(-110, -40), cor: i % 2 ? COR.ouro : e.cor, tam: rnd(2, 3.5), ttl: rnd(0.5, 0.9), grav: -20 });
      break;
    case 'vender':
      audio.tocar('vender');
      explodir(e.pos, 10, COR.ouro, 120, 3, 0.6, 200);
      flutuante(e.pos, '+' + e.ouro, COR.ouro);
      break;
    case 'onda':
      audio.tocar(e.chefe ? 'onda_chefe' : 'onda');
      ui.mostrarAviso(e.chefe ? `Onda ${e.numero} — O CHEFE CHEGOU!` : `Onda ${e.numero}`, e.chefe);
      if (e.chefe) tremer(6);
      break;
    case 'faseChefe':
      audio.tocar('fase_chefe');
      anel(e.pos, 90, COR.inimigoElite, 0.6);
      explodir(e.pos, 30, COR.inimigoElite, 220, 4, 0.7);
      tremer(9);
      break;
    case 'vitoria':
      audio.tocar('vitoria');
      for (let i = 0; i < 90; i++) {
        const cores = [COR.ouro, COR.torreFria, COR.vida, COR.inimigo, COR.torreArcana];
        emitirParticula({ x: rnd(80, 880), y: rnd(-20, 40), vx: rnd(-40, 40), vy: rnd(60, 200), cor: cores[i % cores.length], tam: rnd(3, 5), ttl: rnd(1.2, 2.2), grav: 40, atrito: 0.6 });
      }
      break;
    case 'derrota':
      audio.tocar('derrota');
      tremer(8);
      break;
    case 'erro':
      audio.tocar('erro');
      break;
    case 'clique':
      audio.tocar('clique');
      break;
  }
}

/** Avança partículas e textos com o relógio do jogo (respeita pausa e velocidade). */
export function atualizarFeedback(dt: number): void {
  for (const p of fx.particulas) {
    p.ttl -= dt;
    p.vx *= Math.pow(p.atrito, dt);
    p.vy *= Math.pow(p.atrito, dt);
    p.vy += p.grav * dt;
    p.x += p.vx * dt;
    p.y += p.vy * dt;
  }
  fx.particulas = fx.particulas.filter((p) => p.ttl > 0);
  for (const f of fx.flutuantes) {
    f.ttl -= dt;
    f.y -= 34 * dt;
  }
  fx.flutuantes = fx.flutuantes.filter((f) => f.ttl > 0);
  fx.tremor = Math.max(0, fx.tremor - dt * 28);
}

export function limparFeedback(): void {
  fx.particulas = [];
  fx.flutuantes = [];
  fx.tremor = 0;
}

/** Liga eventos -> feedback e sincroniza o áudio com as configurações da UI. */
export function iniciarFeedback(): void {
  ouvir(tratar);
  let ultima = '';
  const sincronizar = () => {
    const s = useUI.getState();
    const chave = `${s.volSfx}|${s.volMusica}|${s.mudo}`;
    if (chave !== ultima) {
      ultima = chave;
      audio.aplicar(s.volSfx, s.volMusica, s.mudo);
    }
    audio.intensidade = s.tela === 'jogo' && s.fase === 'onda' ? 1 : 0.2;
  };
  useUI.subscribe(sincronizar);
  sincronizar();
  const destravar = () => audio.destravar();
  window.addEventListener('pointerdown', destravar);
  window.addEventListener('keydown', destravar);
}
