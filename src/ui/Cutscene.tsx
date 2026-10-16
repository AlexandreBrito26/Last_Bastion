import { useEffect } from 'react';
import type { CSSProperties } from 'react';
import { audio } from '../core/audio';
import { COR } from '../core/cores';
import type { Cena } from '../game/cenas';

const hex = (n: number) => '#' + n.toString(16).padStart(6, '0');

const botao = (primario = false): CSSProperties => ({
  background: primario ? `linear-gradient(180deg, ${hex(COR.acento)}, #e07a2a)` : 'linear-gradient(180deg,#3d2f66,#221a3d)',
  color: primario ? '#0c0a1d' : hex(COR.ui),
  border: 'none',
  borderRadius: 6,
  padding: '8px 16px',
  font: '600 14px system-ui, sans-serif',
  cursor: 'pointer',
});

/**
 * Reprodução de uma cutscene. Cada painel fica na tela pelo tempo dele; depois passa sozinho.
 * Enter/Espaço avança, Esc pula. `passo` e `onPasso` deixam o estado com quem chama (jogo ou diário).
 */
export function CenaPlayer({
  cena, passo, onPasso, onFim, teclado = false,
}: {
  cena: Cena;
  passo: number;
  onPasso: (n: number) => void;
  onFim: () => void;
  teclado?: boolean;
}) {
  const painel = cena.paineis[passo];
  const ultimo = passo + 1 >= cena.paineis.length;
  const avancar = () => (ultimo ? onFim() : onPasso(passo + 1));

  // painel passa sozinho quando o tempo dele acaba
  useEffect(() => {
    if (!painel) return;
    const id = window.setTimeout(() => (passo + 1 >= cena.paineis.length ? onFim() : onPasso(passo + 1)), painel.segundos * 1000);
    return () => window.clearTimeout(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [passo, cena]);

  useEffect(() => {
    if (!teclado) return;
    const h = (e: KeyboardEvent) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        if (passo + 1 >= cena.paineis.length) onFim();
        else onPasso(passo + 1);
      } else if (e.key === 'Escape') {
        onFim();
      }
    };
    window.addEventListener('keydown', h);
    return () => window.removeEventListener('keydown', h);
  }, [teclado, passo, cena, onPasso, onFim]);

  if (!painel) return null;
  const cor = hex(painel.cor);
  return (
    <div
      className="cena-player"
      onClick={() => { audio.tocar('clique'); avancar(); }}
      style={{
      position: 'absolute', inset: 0, zIndex: 5, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 18, padding: 24,
      background: `radial-gradient(ellipse at 50% 40%, ${cor}, #0c0a1df2 70%)`, transition: 'background 1.2s ease', pointerEvents: 'auto',
    }}>
      <div style={{ position: 'absolute', top: 14, left: 0, right: 0, textAlign: 'center', font: '700 13px system-ui, sans-serif', letterSpacing: 3, color: hex(COR.acento) }}>
        {cena.titulo.toUpperCase()}
      </div>
      <p key={passo} className="cena-texto" style={{ maxWidth: 580, margin: 0, font: '500 20px Georgia, serif', lineHeight: 1.65, textAlign: 'center', color: hex(COR.ui), animation: 'lb-subir .6s both', textShadow: '0 2px 12px #000' }}>
        {painel.texto}
      </p>
      <div style={{ font: '600 12px system-ui, sans-serif', opacity: 0.6 }}>{passo + 1} / {cena.paineis.length}</div>
      <div style={{ width: 'min(420px, 80%)', height: 3, background: '#3d2f66', borderRadius: 2, overflow: 'hidden' }}>
        <div key={`barra-${passo}`} style={{ height: '100%', background: hex(COR.acento), animation: `lb-barra ${painel.segundos}s linear both` }} />
      </div>
      <div style={{ display: 'flex', gap: 10, marginTop: 6 }}>
        <button className="hud-btn" style={botao()} onClick={(e) => { e.stopPropagation(); audio.tocar('clique'); onFim(); }}>Pular cutscene</button>
        <button className="hud-btn" style={botao(true)} onClick={(e) => { e.stopPropagation(); audio.tocar('clique'); avancar(); }}>
          {ultimo ? 'Começar ▶' : 'Continuar ▶'}
        </button>
      </div>
    </div>
  );
}
