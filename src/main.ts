import { createElement } from 'react';
import { createRoot } from 'react-dom/client';
import { audio } from './core/audio';
import { LoopFixo } from './core/loop';
import { chamarOnda, construir, habPronta, usarCongelar, usarEscudo, usarMeteoro } from './game/acoes';
import { torreEm } from './game/construcao';
import { MAPA_1 } from './game/data/mapas';
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

  // Ajusta o jogo (16:9) à janela, sem distorcer.
  const ajustar = () => {
    const proporcao = MAPA_1.largura / MAPA_1.altura;
    const w = window.innerWidth;
    const h = window.innerHeight;
    const largura = Math.min(w, h * proporcao);
    host.style.width = `${Math.floor(largura)}px`;
    host.style.height = `${Math.floor(largura / proporcao)}px`;
    document.documentElement.classList.toggle('compacto', h < 520 || w < 760);
    giro.style.display = h > w && w < 700 ? 'flex' : 'none';
  };

  // Aviso para girar o aparelho em modo retrato.
  const giro = document.createElement('div');
  giro.style.cssText = 'position:fixed;inset:0;z-index:10;display:none;flex-direction:column;align-items:center;justify-content:center;gap:16px;background:#0c0a1d;color:#f6ecd9;font:700 18px system-ui,sans-serif;text-align:center;padding:24px';
  giro.innerHTML = '<div style="font-size:56px">&#x21BB;</div><div>Gire o aparelho para jogar na horizontal</div>';
  document.body.appendChild(giro);

  // Tela cheia (onde houver suporte) no primeiro toque.
  const telaCheia = () => {
    const el = document.documentElement;
    if (!document.fullscreenElement && el.requestFullscreen && window.matchMedia('(pointer: coarse)').matches) {
      el.requestFullscreen({ navigationUI: 'hide' }).catch(() => {});
    }
  };
  window.addEventListener('pointerdown', () => { audio.destravar(); telaCheia(); }, { once: true });
  window.addEventListener('resize', ajustar);
  window.addEventListener('orientationchange', ajustar);
  document.addEventListener('visibilitychange', () => {
    if (document.hidden && useUI.getState().tela === 'jogo' && !useUI.getState().pausado) useUI.getState().alternarPausa();
  });

  ref.mapa = MAPA_1;
  novaPartida();
  iniciarFeedback();
  const render = new Renderizador();
  await render.iniciar(host, ref.mapa);
  ajustar();

  const ui = document.createElement('div');
  ui.style.cssText = 'position:absolute;inset:0;pointer-events:none';
  host.appendChild(ui);
  createRoot(ui).render(createElement(App));

  const canvas = render.app.canvas;
  // No toque, a prévia fica acima do dedo para não ser coberta por ele.
  const DEDO = 44;
  const ponto = (e: PointerEvent) => {
    const r = canvas.getBoundingClientRect();
    const x = ((e.clientX - r.left) * ref.mapa.largura) / r.width;
    let y = ((e.clientY - r.top) * ref.mapa.altura) / r.height;
    const us = useUI.getState();
    if (e.pointerType !== 'mouse' && (us.construirId || us.habilidade)) y -= DEDO;
    return { x, y };
  };
  const vibrar = (ms: number | number[]) => { try { navigator.vibrate?.(ms); } catch { /* sem suporte */ } };
  let arrastando = false;
  canvas.addEventListener('pointermove', (e) => {
    if (e.pointerType !== 'mouse' && !arrastando) return;
    entrada.mouse = ponto(e);
  });
  canvas.addEventListener('pointerup', () => { arrastando = false; });
  canvas.addEventListener('pointercancel', () => { arrastando = false; });
  canvas.addEventListener('pointerleave', (e) => { if (e.pointerType === 'mouse') entrada.mouse = null; });
  canvas.addEventListener('contextmenu', (e) => e.preventDefault());
  canvas.addEventListener('pointerdown', (e) => {
    const s = useUI.getState();
    if (s.tela !== 'jogo') return;
    if (e.button === 2) { s.definirConstruir(null); return; }
    const p = ponto(e);
    if (s.habilidade === 'meteoro' && !s.construirId) {
      if (e.pointerType === 'mouse') { if (usarMeteoro(p)) vibrar(40); return; }
      canvas.setPointerCapture(e.pointerId);
      arrastando = true;
      entrada.mouse = p;
      s.definirPreviaToque(true);
      return;
    }
    if (s.construirId) {
      if (e.pointerType === 'mouse') { if (construir(s.construirId, p)) vibrar(0); return; }
      // Toque: arraste para posicionar a prévia; confirme com o botão da tela.
      canvas.setPointerCapture(e.pointerId);
      arrastando = true;
      entrada.mouse = p;
      s.definirPreviaToque(true);
      return;
    }
    const alvo = torreEm(ref.mundo, p);
    if (alvo) audio.tocar('clique');
    s.selecionarTorre(alvo?.id ?? null);
  });
  useUI.subscribe((st, ant) => {
    if (st.construirId !== ant.construirId || st.habilidade !== ant.habilidade) entrada.mouse = null;
    if (st.pulsoDano !== ant.pulsoDano) vibrar([60, 40, 60]);
    if (st.tela === 'jogo' && ant.tela !== 'jogo') void travarTela();
  });

  // Mantém a tela acesa durante o jogo.
  let lock: { release: () => Promise<void> } | null = null;
  async function travarTela(): Promise<void> {
    try {
      const wl = (navigator as unknown as { wakeLock?: { request: (t: 'screen') => Promise<{ release: () => Promise<void> }> } }).wakeLock;
      if (wl && !lock) lock = await wl.request('screen');
    } catch { lock = null; }
  }
  document.addEventListener('visibilitychange', () => { if (!document.hidden) { lock = null; if (useUI.getState().tela === 'jogo') void travarTela(); } });

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
    } else if (k === 'q') {
      if (s.habilidade) s.definirHabilidade(null);
      else if (habPronta('meteoro')) s.definirHabilidade('meteoro');
    } else if (k === 'w') {
      if (usarCongelar()) vibrar(30);
    } else if (k === 'e') {
      if (usarEscudo()) vibrar(30);
    } else if (k === 'enter') {
      chamarOnda();
    } else if (k >= '1' && k <= '9') {
      const ids = Object.keys(TORRES);
      const id = ids[Number(k) - 1];
      if (id) s.definirConstruir(s.construirId === id ? null : id);
    } else if (k === 'escape') {
      if (s.habilidade) s.definirHabilidade(null);
      else if (s.construirId || s.selecionadaId !== null) s.definirConstruir(null);
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
