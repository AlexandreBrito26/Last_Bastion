import { createElement } from 'react';
import { createRoot } from 'react-dom/client';
import { audio } from './core/audio';
import { LoopFixo } from './core/loop';
import { chamarOnda, construir } from './game/acoes';
import { torreEm } from './game/construcao';
import { MAPA_1 } from './game/data/mapas';
import { ONDAS } from './game/data/ondas';
import { TORRES } from './game/data/torres';
import { atualizarFeedback, iniciarFeedback } from './game/feedback';
import { novaPartida } from './game/partida';
import { entrada, ref } from './game/ref';
import { limpar, sistemaChefes, sistemaMovimento, sistemaOndas, sistemaProjeteis, sistemaStatus, sistemaTorres } from './game/systems/sistemas';
import { Renderizador } from './render/renderizador';
import { useUI } from './store/ui';
import { App } from './ui/App';

async function main(): Promise<void> {
  const raiz = document.getElementById('app')!;
  const host = document.createElement('div');
  host.style.position = 'relative';
  raiz.appendChild(host);

  ref.mapa = MAPA_1;
  novaPartida();
  iniciarFeedback();
  const render = new Renderizador();
  await render.iniciar(host, ref.mapa);

  const ui = document.createElement('div');
  ui.style.cssText = 'position:absolute;inset:0;pointer-events:none';
  host.appendChild(ui);
  createRoot(ui).render(createElement(App));
  useUI.getState().definirOnda(1, ONDAS.length);

  const canvas = render.app.canvas;
  const ponto = (e: PointerEvent) => {
    const r = canvas.getBoundingClientRect();
    return { x: ((e.clientX - r.left) * ref.mapa.largura) / r.width, y: ((e.clientY - r.top) * ref.mapa.altura) / r.height };
  };
  canvas.addEventListener('pointermove', (e) => { entrada.mouse = ponto(e); });
  canvas.addEventListener('pointerleave', () => { entrada.mouse = null; });
  canvas.addEventListener('contextmenu', (e) => e.preventDefault());
  canvas.addEventListener('pointerdown', (e) => {
    const s = useUI.getState();
    if (s.tela !== 'jogo') return;
    if (e.button === 2) { s.definirConstruir(null); return; }
    const p = ponto(e);
    if (s.construirId) { construir(s.construirId, p); return; }
    const alvo = torreEm(ref.mundo, p);
    if (alvo) audio.tocar('clique');
    s.selecionarTorre(alvo?.id ?? null);
  });

  window.addEventListener('keydown', (ev) => {
    const k = ev.key.toLowerCase();
    const s = useUI.getState();
    if (k === 'm') {
      s.alternarMudo();
      return;
    }
    if (s.tela !== 'jogo') return;
    if (k === 'r') {
      novaPartida();
    } else if (k === 'enter') {
      chamarOnda();
    } else if (k >= '1' && k <= '9') {
      const ids = Object.keys(TORRES);
      const id = ids[Number(k) - 1];
      if (id) s.definirConstruir(s.construirId === id ? null : id);
    } else if (k === 'escape') {
      if (s.construirId || s.selecionadaId !== null) s.definirConstruir(null);
      else s.definirTela('menu');
    } else if (k === ' ') {
      ev.preventDefault();
      s.alternarPausa();
    }
  });

  const loop = new LoopFixo(
    (dt) => {
      if (useUI.getState().tela !== 'jogo') return;
      atualizarFeedback(dt);
      const m = ref.mundo;
      if (m.fase === 'vitoria' || m.fase === 'derrota') return;
      m.tempo += dt;
      sistemaOndas(m, ref.mapa, dt);
      sistemaStatus(m, dt);
      sistemaMovimento(m, ref.mapa, dt);
      sistemaChefes(m, ref.mapa);
      sistemaTorres(m, dt);
      sistemaProjeteis(m, dt);
      limpar(m);
    },
    () => render.desenhar(ref.mundo),
  );
  const sincronizar = () => {
    const s = useUI.getState();
    loop.velocidade = s.velocidade;
    loop.pausado = s.pausado;
  };
  useUI.subscribe(sincronizar);
  sincronizar();
  loop.iniciar();
}

void main();
