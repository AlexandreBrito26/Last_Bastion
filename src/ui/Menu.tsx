import { useEffect, useState } from 'react';
import type { CSSProperties } from 'react';
import { audio } from '../core/audio';
import { COR } from '../core/cores';
import { MAPA_1 } from '../game/data/mapas';
import { ONDAS } from '../game/data/ondas';
import { TORRES } from '../game/data/torres';
import { novaPartida } from '../game/partida';
import { useUI } from '../store/ui';

const hex = (n: number) => '#' + n.toString(16).padStart(6, '0');


const botaoMenu = (primario = false): CSSProperties => ({
  width: 280,
  padding: '12px 18px',
  textAlign: 'left',
  font: '700 17px system-ui, sans-serif',
  letterSpacing: 1,
  border: `1px solid ${primario ? hex(COR.torreFria) : '#2c4b57'}`,
  borderRadius: 8,
  background: primario ? '#4cc9f033' : '#203a43cc',
  color: hex(COR.ui),
  cursor: 'pointer',
});

type Painel = null | 'como' | 'sobre' | 'opcoes';

/** Fundo animado: a trilha do mapa com inimigos andando e torres decorativas. */
function Fundo() {
  const pts = MAPA_1.waypoints.map((p) => `${p.x},${p.y}`).join(' ');
  const caminho = 'M ' + MAPA_1.waypoints.map((p) => `${p.x} ${p.y}`).join(' L ');
  const torres = [
    { x: 150, y: 230, c: COR.torreFria },
    { x: 330, y: 300, c: COR.ouro },
    { x: 600, y: 270, c: COR.torreArcana },
    { x: 650, y: 80, c: COR.torreFria },
    { x: 850, y: 300, c: COR.ouro },
    { x: 560, y: 480, c: COR.torreArcana },
  ];
  return (
    <svg viewBox={`0 0 ${MAPA_1.largura} ${MAPA_1.altura}`} preserveAspectRatio="xMidYMid slice" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }}>
      <defs>
        <radialGradient id="lb-fundo" cx="50%" cy="45%" r="75%">
          <stop offset="0%" stopColor={hex(COR.ceuClaro)} />
          <stop offset="100%" stopColor={hex(COR.ceu)} />
        </radialGradient>
      </defs>
      <rect width="100%" height="100%" fill="url(#lb-fundo)" />
      <polyline points={pts} fill="none" stroke={hex(COR.trilhaBorda)} strokeWidth={MAPA_1.larguraTrilha + 6} strokeLinejoin="round" opacity=".35" />
      <polyline points={pts} fill="none" stroke={hex(COR.trilha)} strokeWidth={MAPA_1.larguraTrilha} strokeLinejoin="round" opacity=".28" />
      {torres.map((t, i) => (
        <g key={i} opacity=".5">
          <circle cx={t.x} cy={t.y} r="16" fill={hex(t.c)} />
          <circle cx={t.x} cy={t.y} r="70" fill="none" stroke={hex(t.c)} strokeDasharray="4 6" opacity=".4" style={{ animation: `lb-brilho ${3 + i * 0.4}s infinite` }} />
        </g>
      ))}
      {Array.from({ length: 7 }, (_, i) => (
        <circle key={i} r={i % 3 === 0 ? 11 : 8} fill={hex(i % 3 === 0 ? COR.inimigoElite : COR.inimigo)} opacity=".85">
          <animateMotion dur="26s" begin={`${-i * 3.7}s`} repeatCount="indefinite" path={caminho} />
        </circle>
      ))}
      <rect width="100%" height="100%" fill="#0f2027" opacity=".35" />
    </svg>
  );
}

function Controle({ rotulo, valor, onChange }: { rotulo: string; valor: number; onChange: (v: number) => void }) {
  return (
    <label style={{ display: 'flex', flexDirection: 'column', gap: 4, font: '600 13px system-ui, sans-serif' }}>
      <span style={{ display: 'flex', justifyContent: 'space-between' }}>{rotulo}<span style={{ opacity: 0.7 }}>{Math.round(valor * 100)}%</span></span>
      <input className="lb-range" type="range" min={0} max={1} step={0.05} value={valor} onChange={(e) => onChange(Number(e.target.value))} onPointerUp={() => audio.tocar('clique')} />
    </label>
  );
}

function Opcoes() {
  const s = useUI();
  return (
    <>
      <div style={{ font: '700 20px system-ui, sans-serif', color: hex(COR.torreFria) }}>Opções</div>
      <Controle rotulo="Efeitos sonoros" valor={s.volSfx} onChange={(v) => s.definirVolumes(v, s.volMusica)} />
      <Controle rotulo="Música" valor={s.volMusica} onChange={(v) => s.definirVolumes(s.volSfx, v)} />
      <label style={{ display: 'flex', gap: 8, alignItems: 'center', font: '600 13px system-ui, sans-serif', cursor: 'pointer' }}>
        <input type="checkbox" checked={s.mudo} onChange={s.alternarMudo} style={{ accentColor: hex(COR.torreFria) }} /> Mudo (tecla M)
      </label>
    </>
  );
}

function PainelInfo({ tipo, fechar }: { tipo: Exclude<Painel, null>; fechar: () => void }) {
  return (
    <div className="menu-info" style={{ width: 460, maxWidth: '90%', background: '#0f2027ee', border: `1px solid #2c4b57`, borderRadius: 10, padding: 18, display: 'flex', flexDirection: 'column', gap: 10, animation: 'lb-entrar .25s both' }}>
      {tipo === 'como' ? (
        <>
          <div style={{ font: '700 20px system-ui, sans-serif', color: hex(COR.torreFria) }}>Como jogar</div>
          <div style={{ font: '400 14px/1.55 system-ui, sans-serif' }}>
            Construa torres ao lado da trilha para impedir que os inimigos cheguem ao fim. Cada inimigo morto rende ouro; cada um que passa custa vidas. Sobreviva às {ONDAS.length} ondas.
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 4, font: '400 13px system-ui, sans-serif' }}>
            {Object.values(TORRES).map((d, i) => (
              <div key={d.id}>
                <b style={{ color: hex(COR.ouro) }}>{i + 1}. {d.nome}</b> ({d.custo}) — {d.desc}
              </div>
            ))}
          </div>
          <div style={{ font: '400 13px/1.6 system-ui, sans-serif', opacity: 0.85 }}>
            <b>Celular:</b> toque numa torre da loja, toque no mapa para posicionar e toque de novo para confirmar. Toque numa torre para melhorar ou vender.<br /><b>Teclado:</b> 1–4 escolhem torre · Esc cancela · Espaço pausa · Enter chama a onda · M som · R reinicia
          </div>
        </>
      ) : tipo === 'opcoes' ? (
        <Opcoes />
      ) : (
        <>
          <div style={{ font: '700 20px system-ui, sans-serif', color: hex(COR.torreFria) }}>Sobre</div>
          <div style={{ font: '400 14px/1.55 system-ui, sans-serif' }}>
            Last Bastion — um tower defense 2D feito com PixiJS, React e Zustand. Torres com caminhos de evolução, inimigos voadores, curandeiros, blindados e chefes com fases.
          </div>
        </>
      )}
      <button className="lb-btn" style={{ ...botaoMenu(), width: 'auto', textAlign: 'center' }} onClick={() => { audio.tocar('clique'); fechar(); }}>Voltar</button>
    </div>
  );
}

export function Menu() {
  const s = useUI();
  const [painel, setPainel] = useState<Painel>(null);
  const emAndamento = s.jogoIniciado && s.fase !== 'vitoria' && s.fase !== 'derrota';

  const novoJogo = () => {
    novaPartida();
    useUI.getState().definirTela('jogo');
  };
  const continuar = () => useUI.getState().definirTela('jogo');
  const jogar = emAndamento ? continuar : novoJogo;

  useEffect(() => {
    const h = (e: KeyboardEvent) => {
      if (e.key === 'Enter' && !painel) jogar();
      if (e.key === 'Escape' && painel) setPainel(null);
    };
    window.addEventListener('keydown', h);
    return () => window.removeEventListener('keydown', h);
  });

  return (
    <div style={{ position: 'absolute', inset: 0, pointerEvents: 'auto', color: hex(COR.ui), overflow: 'hidden', font: '600 15px system-ui, sans-serif' }}>
      <Fundo />
      <div style={{ position: 'relative', height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 28 }} className="menu-col">
        <div style={{ textAlign: 'center', animation: 'lb-flutuar 4s ease-in-out infinite' }}>
          <div className="menu-titulo" style={{ font: '800 64px system-ui, sans-serif', letterSpacing: 8, background: `linear-gradient(180deg, ${hex(COR.ui)}, ${hex(COR.torreFria)})`, WebkitBackgroundClip: 'text', backgroundClip: 'text', color: 'transparent', filter: `drop-shadow(0 0 18px ${hex(COR.torreFria)}66)` }}>
            LAST BASTION
          </div>
          <div className="menu-sub" style={{ font: '500 15px system-ui, sans-serif', letterSpacing: 6, opacity: 0.75, marginTop: 4 }}>DEFENDA O ÚLTIMO REDUTO</div>
        </div>

        {painel ? (
          <PainelInfo tipo={painel} fechar={() => setPainel(null)} />
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10, animation: 'lb-entrar .3s both' }}>
            <button className="lb-btn menu-btn" style={botaoMenu(true)} onClick={() => { audio.destravar(); audio.tocar('clique'); jogar(); }}>
              ▶  {emAndamento ? `Continuar (onda ${s.onda}/${s.totalOndas})` : 'Jogar'}
            </button>
            {emAndamento && <button className="lb-btn menu-btn" style={botaoMenu()} onClick={() => { audio.tocar('clique'); novoJogo(); }}>↻  Novo jogo</button>}
            <button className="lb-btn menu-btn" style={botaoMenu()} onClick={() => { audio.tocar('clique'); setPainel('como'); }}>?  Como jogar</button>
            <button className="lb-btn menu-btn" style={botaoMenu()} onClick={() => { audio.tocar('clique'); setPainel('opcoes'); }}>♪  Opções</button>
            <button className="lb-btn menu-btn" style={botaoMenu()} onClick={() => { audio.tocar('clique'); setPainel('sobre'); }}>i  Sobre</button>
          </div>
        )}

        <div className="menu-rodape" style={{ position: 'absolute', bottom: 12, font: '400 12px system-ui, sans-serif', opacity: 0.55 }}>Enter para jogar · v0.1.0</div>
      </div>
    </div>
  );
}
