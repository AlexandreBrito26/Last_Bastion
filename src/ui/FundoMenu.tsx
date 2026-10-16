import { useEffect, useRef } from 'react';
import { limitesDe } from '../core/qualidade';
import { useUI } from '../store/ui';

/**
 * Fundo do menu principal, em canvas 2D. Percorre os biomas da lore em ordem
 * (floresta, cinzas, gelo, pântano, ruínas, deserto), com transição suave e
 * uma silhueta do bastião no horizonte. Cada bioma tem sua atmosfera.
 */

type Tipo = 'vagalume' | 'brasa' | 'neve' | 'poeira';

interface Cena {
  topo: string;
  base: string;
  montes: string[]; // 3 camadas: de trás para frente
  tipo: Tipo;
  cor: string;
}

const CENAS: Cena[] = [
  { topo: '#0f2a1e', base: '#1c4a33', montes: ['#1a3d2c', '#12301f', '#0a2016'], tipo: 'vagalume', cor: '#d8ff7a' },
  { topo: '#1a0e0c', base: '#3a1d14', montes: ['#2e1812', '#21110c', '#150a07'], tipo: 'brasa', cor: '#ff7a2a' },
  { topo: '#1b2e44', base: '#3f6686', montes: ['#3a5f7e', '#2b4b66', '#1d3550'], tipo: 'neve', cor: '#e6f7ff' },
  { topo: '#0f2226', base: '#1f3d3a', montes: ['#1d3a36', '#142c28', '#0c1f1c'], tipo: 'vagalume', cor: '#9dffc4' },
  { topo: '#2a1a12', base: '#5a3824', montes: ['#4a2e1e', '#362216', '#24160d'], tipo: 'brasa', cor: '#ffb347' },
  { topo: '#3a2410', base: '#8a5a2a', montes: ['#7a4e24', '#5e3a1b', '#42280f'], tipo: 'poeira', cor: '#ffd38a' },
];

const DURACAO = 14; // s por bioma
const TRANSICAO = 3; // s de mistura entre biomas

interface Particula {
  x: number;
  y: number;
  vx: number;
  vy: number;
  r: number;
  fase: number;
  vida: number;
}

const rnd = (a: number, b: number) => a + Math.random() * (b - a);

function novaParticula(w: number, h: number, tipo: Tipo, nascer: boolean): Particula {
  const p: Particula = { x: rnd(0, w), y: rnd(0, h), vx: 0, vy: 0, r: 1, fase: rnd(0, 6.28), vida: rnd(0, 1) };
  if (tipo === 'neve') {
    p.vy = rnd(14, 34);
    p.vx = rnd(-8, 8);
    p.r = rnd(0.8, 2);
    if (!nascer) p.y = -4;
  } else if (tipo === 'brasa') {
    p.vy = -rnd(18, 45);
    p.vx = rnd(-6, 6);
    p.r = rnd(1, 2.2);
    if (!nascer) p.y = h + 4;
  } else if (tipo === 'poeira') {
    p.vx = rnd(30, 70);
    p.vy = rnd(-4, 4);
    p.r = rnd(0.6, 1.4);
    if (!nascer) p.x = -4;
  } else {
    p.vx = rnd(-10, 10);
    p.vy = rnd(-8, 8);
    p.r = rnd(1.2, 2.2);
  }
  return p;
}

export function FundoMenu() {
  const ref = useRef<HTMLCanvasElement>(null);
  const nivel = useUI((s) => s.efeitos);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const lim = limitesDe(nivel);
    const reduzir = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false;
    const nPart = nivel === 'alto' ? 90 : nivel === 'medio' ? 50 : 20;
    const velocidadeMontes = lim.tremor ? 1 : 0.35; // baixo: montanhas quase paradas
    const dpr = Math.min(window.devicePixelRatio || 1, nivel === 'alto' ? 2 : 1.5);

    let w = 0;
    let h = 0;
    let parts: Particula[] = [];
    let tipoAtual: Tipo | null = null;
    let tempo = 0;
    let deslocamento = [0, 0, 0];
    let ultimo = performance.now();
    let rafId = 0;

    const montar = () => {
      const r = canvas.getBoundingClientRect();
      w = r.width || 360;
      h = r.height || 640;
      canvas.width = Math.round(w * dpr);
      canvas.height = Math.round(h * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      tipoAtual = null;
    };

    const ajustarParticulas = (tipo: Tipo) => {
      if (tipo === tipoAtual) return;
      tipoAtual = tipo;
      parts = Array.from({ length: nPart }, () => novaParticula(w, h, tipo, true));
    };

    const desenharCamadas = (cena: Cena, alfa: number, cheio: boolean) => {
      // três cadeias de montanhas com paralaxe; a de trás é a mais alta e lenta
      const base = h * 0.62;
      cena.montes.forEach((cor, i) => {
        const yBase = base + i * h * 0.1;
        const amp = h * (0.07 - i * 0.012);
        const vel = (1 - i * 0.28) * velocidadeMontes;
        const off = deslocamento[i];
        ctx.globalAlpha = alfa;
        ctx.fillStyle = cor;
        ctx.beginPath();
        ctx.moveTo(0, h);
        for (let x = 0; x <= w + 8; x += 8) {
          const xx = x + off * vel;
          const y =
            yBase -
            amp * (0.55 + 0.45 * Math.sin(xx * 0.011 + i * 2.1)) -
            amp * 0.35 * Math.sin(xx * 0.027 + i * 1.3);
          ctx.lineTo(x, y);
        }
        ctx.lineTo(w, h);
        ctx.closePath();
        ctx.fill();
      });
      if (cheio) desenharBastiao(alfa);
      ctx.globalAlpha = 1;
    };

    const desenharBastiao = (alfa: number) => {
      // silhueta do bastião no horizonte, mesma forma da logo
      const s = h / 620;
      const x0 = w * 0.5;
      const y0 = h * 0.62 - h * 0.02;
      ctx.globalAlpha = alfa * 0.55;
      ctx.fillStyle = '#05040d';
      ctx.fillRect(x0 - 62 * s, y0 - 12 * s, 124 * s, 36 * s);
      for (let i = 0; i < 4; i++) {
        ctx.fillRect(x0 - 58 * s + i * 30 * s, y0 - 22 * s, 8 * s, 12 * s);
      }
      ctx.fillRect(x0 - 18 * s, y0 - 88 * s, 36 * s, 80 * s);
      for (let i = 0; i < 3; i++) ctx.fillRect(x0 - 22 * s + i * 16 * s, y0 - 98 * s, 9 * s, 12 * s);
      ctx.fillStyle = '#ffb347';
      ctx.globalAlpha = alfa * 0.5;
      ctx.fillRect(x0 + 1 * s, y0 - 116 * s, 1.5 * s, 22 * s);
      ctx.globalAlpha = 1;
    };

    const desenharParticulas = (cena: Cena, alfa: number) => {
      ctx.globalAlpha = alfa;
      for (const p of parts) {
        const pulso = 0.6 + 0.4 * Math.sin(tempo * 2.2 + p.fase);
        if (cena.tipo === 'neve') {
          ctx.fillStyle = cena.cor;
          ctx.globalAlpha = alfa * 0.75;
          ctx.beginPath();
          ctx.arc(p.x + Math.sin(tempo + p.fase) * 6, p.y, p.r, 0, Math.PI * 2);
          ctx.fill();
        } else if (cena.tipo === 'poeira') {
          ctx.fillStyle = cena.cor;
          ctx.globalAlpha = alfa * 0.35;
          ctx.fillRect(p.x, p.y, p.r * 6, p.r);
        } else {
          // vagalume e brasa: halo + núcleo que pulsa
          ctx.fillStyle = cena.cor;
          ctx.globalAlpha = alfa * 0.22 * pulso;
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.r * 4, 0, Math.PI * 2);
          ctx.fill();
          ctx.globalAlpha = alfa * 0.9 * pulso;
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
          ctx.fill();
        }
      }
      ctx.globalAlpha = 1;
    };

    const desenharCeu = (cena: Cena, alfa: number) => {
      const g = ctx.createLinearGradient(0, 0, 0, h);
      g.addColorStop(0, cena.topo);
      g.addColorStop(1, cena.base);
      ctx.globalAlpha = alfa;
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, w, h);
      ctx.globalAlpha = 1;
    };

    const quadro = (agora: number) => {
      // dt nunca negativo: o timestamp do rAF pode ser anterior ao performance.now() inicial
      const dt = Math.max(0, Math.min(0.05, (agora - ultimo) / 1000));
      ultimo = agora;
      if (!reduzir) tempo += dt;

      const total = CENAS.length * DURACAO;
      const t = ((tempo % total) + total) % total;
      // clamp: arredondamento de ponto flutuante na borda do ciclo podia gerar índice 6 (fora do array)
      const idx = Math.min(CENAS.length - 1, Math.floor(t / DURACAO));
      const local = t - idx * DURACAO;
      const atual = CENAS[idx];
      const anterior = CENAS[(idx + CENAS.length - 1) % CENAS.length];
      const mistura = local > DURACAO - TRANSICAO ? (local - (DURACAO - TRANSICAO)) / TRANSICAO : 0;

      ajustarParticulas(atual.tipo);

      if (!reduzir) {
        const vels = [22, 40, 60];
        deslocamento = deslocamento.map((d, i) => d + vels[i] * dt);
      }

      ctx.clearRect(0, 0, w, h);
      if (mistura > 0) {
        desenharCeu(anterior, 1);
        desenharCamadas(anterior, 1 - mistura, false);
      }
      desenharCeu(atual, mistura > 0 ? mistura : 1);
      desenharCamadas(atual, mistura > 0 ? mistura : 1, true);

      if (!reduzir) {
        const alfaPart = mistura > 0 ? mistura : 1;
        for (const p of parts) {
          p.x += p.vx * dt;
          p.y += p.vy * dt;
          if (atual.tipo === 'vagalume') {
            p.vx += Math.sin(tempo * 0.7 + p.fase) * 6 * dt;
            p.vy += Math.cos(tempo * 0.5 + p.fase) * 6 * dt;
          }
          if (p.y < -10) p.y = h + 10;
          if (p.y > h + 10) p.y = -10;
          if (p.x < -10) p.x = w + 10;
          if (p.x > w + 10) p.x = -10;
        }
        desenharParticulas(atual, alfaPart);
      } else {
        desenharParticulas(atual, 0.8);
      }
    };

    const loop = (agora: number) => {
      if (!document.hidden) quadro(agora);
      else ultimo = agora;
      rafId = requestAnimationFrame(loop);
    };

    montar();
    if (reduzir) {
      quadro(performance.now());
    } else {
      rafId = requestAnimationFrame(loop);
    }

    const aoRedimensionar = () => {
      montar();
      if (reduzir) quadro(performance.now());
    };
    window.addEventListener('resize', aoRedimensionar);

    return () => {
      cancelAnimationFrame(rafId);
      window.removeEventListener('resize', aoRedimensionar);
    };
  }, [nivel]);

  return (
    <canvas
      ref={ref}
      aria-hidden="true"
      style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', display: 'block' }}
    />
  );
}
