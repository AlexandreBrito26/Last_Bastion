import { COR } from '../core/cores';

const hex = (n: number) => '#' + n.toString(16).padStart(6, '0');

/** Keyframes e classes compartilhadas por menu e HUD (CSS inline não faz :hover nem @keyframes). */
export const ESTILOS = `
@keyframes lb-flutuar { 0%,100% { transform: translateY(0) } 50% { transform: translateY(-6px) } }
@keyframes lb-entrar { from { opacity: 0; transform: translateY(14px) } to { opacity: 1; transform: none } }
@keyframes lb-brilho { 0%,100% { opacity: .55 } 50% { opacity: 1 } }
@keyframes lb-pop { 0% { transform: scale(1.5); filter: brightness(1.8) } 100% { transform: scale(1); filter: none } }
@keyframes lb-tremer { 0%,100% { transform: translateX(0) } 20% { transform: translateX(-5px) } 40% { transform: translateX(5px) } 60% { transform: translateX(-3px) } 80% { transform: translateX(3px) } }
@keyframes lb-barra { from { width: 0 } to { width: 100% } }
@keyframes lb-subir { from { opacity: 0; transform: translateY(24px) } to { opacity: 1; transform: none } }
@keyframes lb-esq { from { opacity: 0; transform: translateX(28px) } to { opacity: 1; transform: none } }
@keyframes lb-descer { from { opacity: 0; transform: translateY(-16px) } to { opacity: 1; transform: none } }
@keyframes lb-banner {
  0% { opacity: 0; transform: translateX(-60px) scale(.9) }
  14% { opacity: 1; transform: none }
  78% { opacity: 1; transform: none }
  100% { opacity: 0; transform: translateX(60px) scale(.95) }
}
@keyframes lb-dano { 0% { opacity: .9 } 100% { opacity: 0 } }
@keyframes lb-fim { from { opacity: 0; transform: scale(.85) } to { opacity: 1; transform: none } }
@keyframes lb-toast { 0% { opacity: 0; transform: translateY(10px) scale(.95) } 12%,78% { opacity: 1; transform: none } 100% { opacity: 0; transform: translateY(-6px) } }
@keyframes lb-raio { 0% { opacity: 0; transform: scale(.4) } 40% { opacity: 1 } 100% { opacity: .35; transform: scale(1.15) } }
@keyframes lb-pulsar { 0%,100% { opacity: .55 } 50% { opacity: 1 } }

.lb-btn { position: relative; overflow: hidden; transition: transform .12s, background .12s, color .12s, box-shadow .12s, opacity .12s; }
/* Reflexo de luz que varre o botão ao passar o ponteiro */
.lb-btn::after { content: ''; position: absolute; inset: 0; pointer-events: none; background: linear-gradient(105deg, transparent 35%, #fff6e066 50%, transparent 65%); transform: translateX(-120%); transition: transform .7s ease; }
.lb-btn:hover:not(:disabled)::after { transform: translateX(120%); }
.lb-btn:hover:not(:disabled), .lb-btn:focus-visible { transform: translateX(6px) scale(1.02); background: ${hex(COR.acento)} !important; color: ${hex(COR.ceu)} !important; box-shadow: 0 0 18px ${hex(COR.acento)}88; outline: none; }
.lb-btn:active:not(:disabled) { transform: translateX(6px) scale(.98); }

.hud-btn { transition: transform .1s, filter .1s, background .12s, box-shadow .2s; }
.hud-btn:focus-visible, .lb-btn:focus-visible { outline: 2px solid ${hex(COR.acento)}; outline-offset: 3px; }
/* Painel de vidro com filete de brasa no topo */
.hud-painel::before { content: ''; position: absolute; left: 12px; right: 12px; top: 0; height: 2px; border-radius: 2px; background: linear-gradient(90deg, transparent, ${hex(COR.acento)}aa, transparent); pointer-events: none; }

.hud-btn:hover:not(:disabled) { filter: brightness(1.25); transform: translateY(-1px); }
.hud-btn:active:not(:disabled) { transform: translateY(1px) scale(.97); }

.lb-range { accent-color: ${hex(COR.acento)}; width: 100%; cursor: pointer; }
@media (pointer: coarse) { .hud-btn:hover:not(:disabled), .lb-btn:hover:not(:disabled) { transform: none; filter: none; } }
.compacto .hud-btn { padding: 5px 8px !important; font-size: 12px !important; min-height: 32px; }
.compacto .hud-btn, .compacto .lb-btn { min-height: 40px; }
.compacto .hud-dica { display: none; }
.compacto .hud-hab-txt { font-size: 11px; }
.compacto .hud-painel { width: 190px !important; max-height: 78%; overflow-y: auto; padding: 8px !important; }
.compacto .menu-titulo { font-size: 38px !important; letter-spacing: 4px !important; }
.compacto .menu-sub { display: none; }
.compacto .menu-grade { width: 260px !important; }
.compacto .menu-grade .menu-btn { width: 100% !important; font-size: 14px !important; padding: 8px 10px !important; }
.compacto .menu-logo svg { width: 64px; height: auto; }
.compacto .menu-col { gap: 10px !important; }
.compacto .menu-btn { padding: 8px 14px !important; font-size: 15px !important; width: 240px !important; }
.compacto .fase-desc { display: none; }
.compacto .fase-card { padding: 5px !important; max-width: 200px !important; flex-basis: 150px !important; }
.lb-btn.fase-card:hover:not(:disabled) { transform: translateY(-4px) scale(1.02); }
.compacto .menu-rodape { display: none; }
.menu-info { max-height: 90vh; max-height: 90dvh; overflow-y: auto; }
.compacto .menu-info { max-height: 80%; overflow-y: auto; }
.compacto .hud-topo { gap: 8px !important; font-size: 13px; top: max(4px, env(safe-area-inset-top)) !important; left: max(6px, env(safe-area-inset-left)) !important; right: max(6px, env(safe-area-inset-right)) !important; }
.compacto .hud-loja { gap: 5px !important; padding: 6px !important; left: max(6px, env(safe-area-inset-left)) !important; bottom: max(6px, env(safe-area-inset-bottom)) !important; }
.compacto .hud-painel .hud-btn { min-height: 36px; }
.compacto .hud-fim-titulo { font-size: 36px !important; }
/* Celular na horizontal: a barra de ações rola em uma linha só, a loja mostra só o número e o custo */
.compacto .hud-acoes { flex-wrap: nowrap !important; justify-content: flex-start !important; overflow-x: auto; width: 100%; touch-action: pan-x; scrollbar-width: none; padding-bottom: 2px; }
.compacto .hud-acoes::-webkit-scrollbar { display: none; }
.compacto .hud-nome { display: none; }
/* Celular: a loja vira um botão ☰ que abre a gaveta de torres por seção */
.hud-hamb { display: none; }
.compacto .hud-hamb { display: inline-flex; min-height: 40px; }
.compacto .hud-trilho { display: none !important; }
.compacto .hud-gaveta { width: auto !important; max-height: calc(100% - 96px) !important; }
.compacto .hud-loja { right: auto !important; }
/* Painéis do menu (Loja, Opções, Diário, Como jogar): cabem na altura da tela e rolam por dentro */
.compacto .menu-info { max-height: calc(100vh - 16px) !important; max-height: calc(100dvh - 16px) !important; padding: 10px !important; gap: 8px !important; box-sizing: border-box; }
.compacto .menu-info .lb-btn { min-height: 34px; }
/* Tutorial da primeira partida: menor e sem cobrir a barra superior */
.compacto .hud-tutorial { top: auto !important; bottom: 72px !important; width: 260px !important; font-size: 12px !important; max-height: calc(100% - 175px) !important; overflow-y: auto; gap: 6px !important; }
.compacto .hud-tutorial ol { font-size: 12px !important; }
.compacto .hud-painel-torre { bottom: 72px !important; right: max(6px, env(safe-area-inset-right)) !important; max-height: calc(100% - 150px) !important; }
@media (prefers-reduced-motion: reduce) {
  * { animation-duration: .01ms !important; animation-iteration-count: 1 !important; transition-duration: .01ms !important; }
}
`;
