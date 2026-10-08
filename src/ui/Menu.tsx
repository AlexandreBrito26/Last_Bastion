import { useEffect, useState } from 'react';
import type { CSSProperties } from 'react';
import { audio } from '../core/audio';
import { COR } from '../core/cores';
import { MAPA_1, MAPAS, type Mapa } from '../game/data/mapas';
import { gerarOndas } from '../game/data/ondas';
import { TEMAS } from '../render/arte';
import { TORRES } from '../game/data/torres';
import { novaPartida } from '../game/partida';
import { chaveFase, useUI } from '../store/ui';

const hex = (n: number) => '#' + n.toString(16).padStart(6, '0');


const botaoMenu = (primario = false): CSSProperties => ({
  width: 280,
  padding: '12px 18px',
  textAlign: 'left',
  font: '700 17px system-ui, sans-serif',
  letterSpacing: 1,
  border: `1px solid ${primario ? hex(COR.acento) : '#3d2f66'}`,
  borderRadius: 8,
  background: primario ? '#ffb34733' : '#221a3dcc',
  color: hex(COR.ui),
  cursor: 'pointer',
});

type Painel = null | 'como' | 'sobre' | 'opcoes' | 'fases';

const COR_OBST: Record<string, string> = { arvore: '#2f8a46', pinheiro: '#1f5d4a', rocha: '#8d949a', lago: '#2f8fb5', lava: '#ff6a10', cristal: '#6fd6f0' };

function Previa({ mapa }: { mapa: Mapa }) {
  const t = TEMAS[mapa.tema];
  const pts = mapa.waypoints.map((p) => `${p.x},${p.y}`).join(' ');
  const id = `lb-prev-${mapa.id}`;
  return (
    <svg viewBox={`0 0 ${mapa.largura} ${mapa.altura}`} style={{ width: '100%', display: 'block', borderRadius: 8 }}>
      <defs>
        <linearGradient id={id} x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor={t.base1} /><stop offset="1" stopColor={t.base2} /></linearGradient>
      </defs>
      <rect width="100%" height="100%" fill={`url(#${id})`} />
      <polyline points={pts} fill="none" stroke={t.borda} strokeWidth={mapa.larguraTrilha + 10} strokeLinejoin="round" strokeLinecap="round" />
      <polyline points={pts} fill="none" stroke={t.trilha} strokeWidth={mapa.larguraTrilha} strokeLinejoin="round" strokeLinecap="round" />
      {mapa.obstaculos.map((o, i) => <circle key={i} cx={o.x} cy={o.y} r={o.r} fill={COR_OBST[o.tipo]} opacity=".9" />)}
    </svg>
  );
}

function Fases({ fechar }: { fechar: () => void }) {
  const s = useUI();
  const iniciar = (m: Mapa) => {
    audio.destravar();
    audio.tocar('clique');
    novaPartida(m);
    useUI.getState().definirTela('jogo');
  };
  return (
    <div style={{ width: 'min(860px, 94%)', display: 'flex', flexDirection: 'column', gap: 12, alignItems: 'center', animation: 'lb-entrar .25s both' }}>
      <div style={{ font: '700 20px system-ui, sans-serif', color: hex(COR.acento) }}>Escolha a fase</div>
      <button className="lb-btn" onClick={() => { audio.tocar('clique'); s.definirDesafio(!s.desafio); }} title="Inimigos +35%, vida +30%, ouro -15%, 5 vidas a menos" style={{ ...botaoMenu(s.desafio), width: 'auto', textAlign: 'center', padding: '6px 16px', fontSize: 14 }}>
        {s.desafio ? '⚔ Modo Desafio: ligado' : 'Modo Desafio: desligado'}
      </button>
      <div className="fase-desc" style={{ font: '400 12px system-ui, sans-serif', opacity: 0.7, marginTop: -6 }}>
        {s.desafio ? 'Inimigos +35% · vida +30% · ouro -15% · 5 vidas a menos. Progresso separado.' : 'Ative para um desafio com progresso próprio.'}
      </div>
      <div style={{ display: 'flex', gap: 12, width: '100%', justifyContent: 'center', flexWrap: 'wrap' }}>
        {MAPAS.map((m, i) => {
          const prog = (id: string) => s.progresso[chaveFase(id, s.desafio)] ?? 0;
          const liberada = (i === 0 || prog(MAPAS[i - 1].id) > 0) && (!s.desafio || (s.progresso[m.id] ?? 0) > 0);
          const est = prog(m.id);
          return (
            <button
              key={m.id}
              disabled={!liberada}
              className="lb-btn fase-card"
              onClick={() => iniciar(m)}
              style={{ flex: '1 1 220px', maxWidth: 270, padding: 8, textAlign: 'left', border: '1px solid #3d2f66', borderRadius: 12, background: '#0c0a1ddd', color: hex(COR.ui), cursor: liberada ? 'pointer' : 'not-allowed', opacity: liberada ? 1 : 0.5, position: 'relative' }}
            >
              <Previa mapa={m} />
              {!liberada && <div style={{ position: 'absolute', top: 8, left: 8, right: 8, aspectRatio: '16/9', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#000a', borderRadius: 8, font: '700 28px system-ui' }}>🔒</div>}
              <div style={{ font: '700 15px system-ui, sans-serif', marginTop: 8 }}>{m.nome}</div>
              <div className="fase-desc" style={{ font: '400 12px/1.4 system-ui, sans-serif', opacity: 0.75, minHeight: 34 }}>{m.desc}</div>
              <div style={{ display: 'flex', justifyContent: 'space-between', font: '600 12px system-ui, sans-serif', marginTop: 4 }}>
                <span>{gerarOndas(m).length} ondas{m.chefes > 1 ? ` · ${m.chefes} chefes` : ''}</span>
                <span style={{ color: hex(COR.ouro), letterSpacing: 2 }}>{[1, 2, 3].map((n) => (n <= est ? '★' : '☆')).join('')}</span>
              </div>
            </button>
          );
        })}
      </div>
      <button className="lb-btn menu-btn" style={{ ...botaoMenu(), width: 'auto', textAlign: 'center' }} onClick={() => { audio.tocar('clique'); fechar(); }}>Voltar</button>
    </div>
  );
}

/** Fundo animado: a trilha do mapa com inimigos andando e torres decorativas. */
function Fundo() {
  const pts = MAPA_1.waypoints.map((p) => `${p.x},${p.y}`).join(' ');
  const caminho = 'M ' + MAPA_1.waypoints.map((p) => `${p.x} ${p.y}`).join(' L ');
  const torres = [
    { x: 150, y: 230, c: COR.acento },
    { x: 330, y: 300, c: COR.ouro },
    { x: 600, y: 270, c: COR.torreArcana },
    { x: 650, y: 80, c: COR.acento },
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
      <rect width="100%" height="100%" fill="#0c0a1d" opacity=".35" />
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
      <div style={{ font: '700 20px system-ui, sans-serif', color: hex(COR.acento) }}>Opções</div>
      <Controle rotulo="Efeitos sonoros" valor={s.volSfx} onChange={(v) => s.definirVolumes(v, s.volMusica)} />
      <Controle rotulo="Música" valor={s.volMusica} onChange={(v) => s.definirVolumes(s.volSfx, v)} />
      <label style={{ display: 'flex', gap: 8, alignItems: 'center', font: '600 13px system-ui, sans-serif', cursor: 'pointer' }}>
        <input type="checkbox" checked={s.mudo} onChange={s.alternarMudo} style={{ accentColor: hex(COR.acento) }} /> Mudo (tecla M)
      </label>
    </>
  );
}

function PainelInfo({ tipo, fechar }: { tipo: Exclude<Painel, null | 'fases'>; fechar: () => void }) {
  return (
    <div className="menu-info" style={{ width: 460, maxWidth: '90%', background: '#0c0a1dee', border: `1px solid #3d2f66`, borderRadius: 10, padding: 18, display: 'flex', flexDirection: 'column', gap: 10, animation: 'lb-entrar .25s both' }}>
      {tipo === 'como' ? (
        <>
          <div style={{ font: '700 20px system-ui, sans-serif', color: hex(COR.acento) }}>Como jogar</div>
          <div style={{ font: '400 14px/1.55 system-ui, sans-serif' }}>
            Construa torres ao lado da trilha para impedir que os inimigos cheguem ao fim. Cada inimigo morto rende ouro; cada um que passa custa vidas. Sobreviva a todas as ondas de cada fase — vença para liberar a próxima e ganhar até 3 estrelas.
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 4, font: '400 13px system-ui, sans-serif' }}>
            {Object.values(TORRES).map((d, i) => (
              <div key={d.id}>
                <b style={{ color: hex(COR.ouro) }}>{i + 1}. {d.nome}</b> ({d.custo}) — {d.desc}
              </div>
            ))}
          </div>
          <div style={{ font: '400 13px/1.6 system-ui, sans-serif', opacity: 0.85 }}>
            <b>Habilidades:</b> ☄ <b>Meteoro</b> (Q) causa dano enorme numa área; ❄ <b>Congelar</b> (W) paralisa todos os inimigos por instantes. Ambas têm recarga.<br /><b>Celular:</b> toque numa torre da loja, toque no mapa para posicionar e toque de novo para confirmar. Toque numa torre para melhorar ou vender.<br /><b>Teclado:</b> 1–4 escolhem torre · Esc cancela · Espaço pausa · Enter chama a onda · M som · R reinicia
          </div>
        </>
      ) : tipo === 'opcoes' ? (
        <Opcoes />
      ) : (
        <>
          <div style={{ font: '700 20px system-ui, sans-serif', color: hex(COR.acento) }}>Sobre</div>
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

  const novoJogo = () => setPainel('fases');
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
          <div className="menu-titulo" style={{ font: '800 64px system-ui, sans-serif', letterSpacing: 8, background: `linear-gradient(180deg, ${hex(COR.ui)}, ${hex(COR.acento)})`, WebkitBackgroundClip: 'text', backgroundClip: 'text', color: 'transparent', filter: `drop-shadow(0 0 18px ${hex(COR.acento)}66)` }}>
            LAST BASTION
          </div>
          <div className="menu-sub" style={{ font: '500 15px system-ui, sans-serif', letterSpacing: 6, opacity: 0.75, marginTop: 4 }}>DEFENDA O ÚLTIMO REDUTO</div>
        </div>

        {painel === 'fases' ? (
          <Fases fechar={() => setPainel(null)} />
        ) : painel ? (
          <PainelInfo tipo={painel as Exclude<Painel, null | 'fases'>} fechar={() => setPainel(null)} />
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
