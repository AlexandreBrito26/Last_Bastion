import { useEffect, useRef, useState } from 'react';
import type { CSSProperties } from 'react';
import { audio } from '../core/audio';
import { COR } from '../core/cores';
import { MAPAS, type Mapa } from '../game/data/mapas';
import { gerarOndas } from '../game/data/ondas';
import { TEMAS } from '../render/arte';
import { TORRES } from '../game/data/torres';
import { INIMIGOS } from '../game/data/inimigos';
import { ITENS_SKIN, SKINS, corDoItem, precoDoItem, type GrupoItem, type Skin, podeNoItem } from '../game/data/skins';
import { Logo } from './Logo';
import { FundoMenu } from './FundoMenu';
import { NIVEIS } from '../core/qualidade';
import { novaPartida } from '../game/partida';
import { chaveFase, useUI } from '../store/ui';
import { CUSTO_MELHORIA, NIVEL_MAX, TIPOS_MELHORIA, type TipoMelhoria, EFEITO_INICIAL, EFEITO_VITORIA, CHANCE_DROP_NIVEL, BONUS_QTD_DROP_NIVEL } from '../game/data/economia';
import { desafiosDoDia, diaHoje, lerDesafios, progressoDe } from '../game/data/economia';
import { CONSUMIVEIS, CUSTO_MELHORIA_MOEDA, EFEITO_DESCONTO_MOEDA, EFEITO_ECONOMIA, EFEITO_OURO_MOEDA, EFEITO_VIDAS_MOEDA, TIPOS_MELHORIA_MOEDA, type TipoConsumivel, type TipoMelhoriaMoeda } from '../game/data/economia';
import { exportarSave, importarSave } from '../game/save';
import { desenharPreviaItem } from './previaItem';
import { CenaPlayer } from './Cutscene';
import { cenaDe, fasesComCena } from '../game/cenas';

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

type Painel = null | 'como' | 'sobre' | 'opcoes' | 'fases' | 'loja' | 'diario';

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
    useUI.getState().iniciarIntro(m.id);
  };
  return (
    <div style={{ width: 'min(860px, 94%)', maxHeight: '88vh', overflowY: 'auto', padding: '4px 6px 60px', boxSizing: 'border-box', display: 'flex', flexDirection: 'column', gap: 12, alignItems: 'center', animation: 'lb-entrar .25s both' }}>
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
              style={{ flex: '1 1 220px', maxWidth: 270, padding: 8, textAlign: 'left', border: '1px solid #3d2f66', borderRadius: 12, background: '#0c0a1d', color: liberada ? hex(COR.ui) : '#8a8aa0', cursor: liberada ? 'pointer' : 'not-allowed', position: 'relative' }}
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
function Controle({ rotulo, valor, onChange }: { rotulo: string; valor: number; onChange: (v: number) => void }) {
  return (
    <label style={{ display: 'flex', flexDirection: 'column', gap: 4, font: '600 13px system-ui, sans-serif' }}>
      <span style={{ display: 'flex', justifyContent: 'space-between' }}>{rotulo}<span style={{ opacity: 0.7 }}>{Math.round(valor * 100)}%</span></span>
      <input className="lb-range" type="range" min={0} max={1} step={0.05} value={valor} onChange={(e) => onChange(Number(e.target.value))} onPointerUp={() => audio.tocar('clique')} />
    </label>
  );
}

const ROTULO_MELHORIA: Record<TipoMelhoria, { nome: string; efeito: (n: number) => string }> = {
  inicial: { nome: 'Bônus inicial', efeito: (n) => `+${EFEITO_INICIAL[n]} 💚 na primeira vez que cada fase é iniciada` },
  vitoria: { nome: 'Bônus de vitória', efeito: (n) => `+${EFEITO_VITORIA[n]} 💚 ao vencer uma fase` },
  economia: { nome: 'Economia de construção', efeito: (n) => `-${Math.round(EFEITO_ECONOMIA[n] * 100)}% no custo de construir torres` },
  drop: { nome: 'Drop de inimigos', efeito: (n) => `${Math.round(CHANCE_DROP_NIVEL[n] * 100)}% de chance por inimigo, +${BONUS_QTD_DROP_NIVEL[n]} moedas` },
};

function MelhoriasVerde() {
  const s = useUI();
  const [aviso, setAviso] = useState<string | null>(null);
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8, padding: 12, borderRadius: 10, background: '#120e26', border: '1px solid #3d2f66' }}>
      <div style={{ font: '700 15px system-ui, sans-serif', color: '#2ecc71' }}>Melhorias da moeda verde</div>
      {TIPOS_MELHORIA.map((t) => {
        const nivel = s.melhorias[t];
        const maximo = nivel >= NIVEL_MAX;
        const custo = maximo ? 0 : CUSTO_MELHORIA[nivel];
        const pode = !maximo && s.verdes >= custo;
        return (
          <div key={t} style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 8 }}>
              <span style={{ font: '600 13px system-ui, sans-serif' }}>{ROTULO_MELHORIA[t].nome} <span style={{ opacity: 0.6 }}>nível {nivel}/{NIVEL_MAX}</span></span>
              {maximo ? (
                <span style={{ font: '600 12px system-ui, sans-serif', color: '#2ecc71' }}>Máximo</span>
              ) : (
                <button className="lb-btn" disabled={!pode} style={{ ...botaoMenu(pode), padding: '4px 12px', fontSize: 12, opacity: pode ? 1 : 0.5 }}
                  onClick={() => { if (s.comprarMelhoria(t)) { audio.tocar('clique'); setAviso(null); } else { audio.tocar('erro'); setAviso(`Faltam ${custo - s.verdes} 💚.`); } }}>
                  Melhorar · 💚 {custo}
                </button>
              )}
            </div>
            <div style={{ font: '400 12px system-ui, sans-serif', opacity: 0.75 }}>
              {ROTULO_MELHORIA[t].efeito(nivel)}{!maximo && <> → {ROTULO_MELHORIA[t].efeito(nivel + 1)}</>}
            </div>
          </div>
        );
      })}
      {aviso && <div style={{ font: '600 12px system-ui, sans-serif', color: hex(COR.dano) }}>{aviso}</div>}
    </div>
  );
}

const ROTULO_MOEDA: Record<TipoMelhoriaMoeda, { nome: string; efeito: (n: number) => string }> = {
  vidas: { nome: 'Vidas iniciais', efeito: (n) => `+${EFEITO_VIDAS_MOEDA[n]} vida no início de cada fase` },
  ouro: { nome: 'Ouro inicial', efeito: (n) => `+${EFEITO_OURO_MOEDA[n]} de ouro no início de cada fase` },
  desconto: { nome: 'Desconto em melhorias', efeito: (n) => `${Math.round(EFEITO_DESCONTO_MOEDA[n] * 100)}% de desconto nos upgrades de torre` },
};

function MelhoriasMoeda() {
  const s = useUI();
  const [aviso, setAviso] = useState<string | null>(null);
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8, padding: 12, borderRadius: 10, background: '#120e26', border: '1px solid #3d2f66' }}>
      <div style={{ font: '700 15px system-ui, sans-serif', color: hex(COR.ouro) }}>Melhorias permanentes</div>
      {TIPOS_MELHORIA_MOEDA.map((t) => {
        const nivel = s.melhoriasMoeda[t];
        const maximo = nivel >= NIVEL_MAX;
        const custo = maximo ? 0 : CUSTO_MELHORIA_MOEDA[nivel];
        const pode = !maximo && s.moedas >= custo;
        return (
          <div key={t} style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 8 }}>
              <span style={{ font: '600 13px system-ui, sans-serif' }}>{ROTULO_MOEDA[t].nome} <span style={{ opacity: 0.6 }}>nível {nivel}/{NIVEL_MAX}</span></span>
              {maximo ? (
                <span style={{ font: '600 12px system-ui, sans-serif', color: hex(COR.ouro) }}>Máximo</span>
              ) : (
                <button className="lb-btn" disabled={!pode} style={{ ...botaoMenu(pode), padding: '4px 12px', fontSize: 12, opacity: pode ? 1 : 0.5 }}
                  onClick={() => { if (s.comprarMelhoriaMoeda(t)) { audio.tocar('clique'); setAviso(null); } else { audio.tocar('erro'); setAviso(`Faltam ${custo - s.moedas} 🪙.`); } }}>
                  Melhorar · 🪙 {custo}
                </button>
              )}
            </div>
            <div style={{ font: '400 12px system-ui, sans-serif', opacity: 0.75 }}>
              {ROTULO_MOEDA[t].efeito(nivel)}{!maximo && <> → {ROTULO_MOEDA[t].efeito(nivel + 1)}</>}
            </div>
          </div>
        );
      })}
      <div style={{ font: '700 14px system-ui, sans-serif', marginTop: 4 }}>Consumíveis <span style={{ font: '400 12px system-ui, sans-serif', opacity: 0.7 }}>(usados no início da próxima fase)</span></div>
      {(Object.keys(CONSUMIVEIS) as TipoConsumivel[]).map((c) => {
        const pode = s.moedas >= CONSUMIVEIS[c].preco;
        return (
          <div key={c} style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 8 }}>
              <span style={{ font: '600 13px system-ui, sans-serif' }}>{CONSUMIVEIS[c].nome} <span style={{ opacity: 0.6 }}>tem {s.consumiveis[c]}</span></span>
              <button className="lb-btn" disabled={!pode} style={{ ...botaoMenu(pode), padding: '4px 12px', fontSize: 12, opacity: pode ? 1 : 0.5 }}
                onClick={() => { if (s.comprarConsumivel(c)) { audio.tocar('clique'); setAviso(null); } else { audio.tocar('erro'); setAviso(`Faltam ${CONSUMIVEIS[c].preco - s.moedas} 🪙.`); } }}>
                Comprar · 🪙 {CONSUMIVEIS[c].preco}
              </button>
            </div>
            <div style={{ font: '400 12px system-ui, sans-serif', opacity: 0.75 }}>{CONSUMIVEIS[c].desc}</div>
          </div>
        );
      })}
      {aviso && <div style={{ font: '600 12px system-ui, sans-serif', color: hex(COR.dano) }}>{aviso}</div>}
    </div>
  );
}

function DesafiosDia() {
  const s = useUI();
  const [aviso, setAviso] = useState<string | null>(null);
  const dia = diaHoje();
  const sorteados = desafiosDoDia(dia);
  const estado = s.desafios.dia === dia ? s.desafios : lerDesafios(dia);
  const txt = (r: { moedas?: number; verdes?: number; rubis?: number }) =>
    [r.moedas ? `🪙 ${r.moedas}` : '', r.verdes ? `💚 ${r.verdes}` : '', r.rubis ? `🔴 ${r.rubis}` : ''].filter(Boolean).join(' · ');
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8, padding: 12, borderRadius: 10, background: '#120e26', border: '1px solid #3d2f66' }}>
      <div style={{ font: '700 15px system-ui, sans-serif', color: hex(COR.acento) }}>Desafios de hoje</div>
      {sorteados.map((d) => {
        const p = progressoDe(estado, d.id);
        const feito = p >= d.meta;
        const resgatado = !!estado.resgatados[d.id];
        return (
          <div key={d.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 8 }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <span style={{ font: '600 13px system-ui, sans-serif' }}>{d.nome}</span>
              <span style={{ font: '400 12px system-ui, sans-serif', opacity: 0.75 }}>{Math.min(p, d.meta)}/{d.meta} · recompensa {txt(d.recompensa)}</span>
            </div>
            {resgatado ? (
              <span style={{ font: '600 12px system-ui, sans-serif', color: '#2ecc71' }}>Resgatado</span>
            ) : (
              <button className="lb-btn" disabled={!feito} style={{ ...botaoMenu(feito), padding: '4px 12px', fontSize: 12, opacity: feito ? 1 : 0.5 }}
                onClick={() => { if (s.resgatarDesafio(d.id)) { audio.tocar('clique'); setAviso(null); } else { audio.tocar('erro'); } }}>
                Resgatar
              </button>
            )}
          </div>
        );
      })}
      {aviso && <div style={{ font: '600 12px system-ui, sans-serif', color: hex(COR.dano) }}>{aviso}</div>}
    </div>
  );
}

function TorresBloqueadas() {
  const s = useUI();
  const [aviso, setAviso] = useState<string | null>(null);
  const bloqueadas = Object.values(TORRES).filter((d) => d.desbloqueio && !s.torresLiberadas[d.id]);
  const liberadas = Object.values(TORRES).filter((d) => d.desbloqueio && s.torresLiberadas[d.id]);
  const simbolo = (m: 'moedas' | 'verde') => (m === 'verde' ? '💚' : '🪙');
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8, padding: 12, borderRadius: 10, background: '#120e26', border: '1px solid #3d2f66' }}>
      <div style={{ font: '700 15px system-ui, sans-serif', color: '#2ecc71' }}>Torres para liberar</div>
      {bloqueadas.map((d) => {
        const { moeda, preco } = d.desbloqueio!;
        const saldo = moeda === 'verde' ? s.verdes : s.moedas;
        const pode = saldo >= preco;
        return (
          <div key={d.id} style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 8 }}>
              <span style={{ font: '600 13px system-ui, sans-serif' }}>{d.nome}</span>
              <button className="lb-btn" disabled={!pode} style={{ ...botaoMenu(pode), padding: '4px 12px', fontSize: 12, opacity: pode ? 1 : 0.5 }}
                onClick={() => { if (s.desbloquearTorre(d.id)) { audio.tocar('clique'); setAviso(null); } else { audio.tocar('erro'); setAviso(`Faltam ${preco - saldo} ${simbolo(moeda)}.`); } }}>
                Liberar · {simbolo(moeda)} {preco}
              </button>
            </div>
            <div style={{ font: '400 12px system-ui, sans-serif', opacity: 0.75 }}>{d.desc}</div>
          </div>
        );
      })}
      {liberadas.length > 0 && (
        <div style={{ font: '400 12px system-ui, sans-serif', color: '#2ecc71' }}>Liberadas: {liberadas.map((d) => d.nome).join(', ')}</div>
      )}
      {aviso && <div style={{ font: '600 12px system-ui, sans-serif', color: hex(COR.dano) }}>{aviso}</div>}
    </div>
  );
}

function BackupSave() {
  const [msg, setMsg] = useState<string | null>(null);
  const exportar = () => {
    audio.tocar('clique');
    const blob = new Blob([exportarSave()], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `last-bastion-save-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
    setMsg('Save exportado. Guarde o arquivo em local seguro.');
  };
  const importar = async (arquivo: File) => {
    const erro = importarSave(await arquivo.text());
    if (erro) {
      audio.tocar('erro');
      setMsg(erro);
    } else {
      setMsg('Save importado. Recarregando...');
      setTimeout(() => window.location.reload(), 600);
    }
  };
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      <div style={{ font: '600 13px system-ui, sans-serif', opacity: 0.85 }}>Backup do progresso</div>
      <div style={{ font: '400 12px system-ui, sans-serif', opacity: 0.7 }}>Exporte seu save para um arquivo e importe em outro aparelho. Nada é enviado para a nuvem.</div>
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
        <button className="lb-btn" style={{ ...botaoMenu(), padding: '6px 16px', fontSize: 13 }} onClick={exportar}>Exportar save</button>
        <label className="lb-btn" style={{ ...botaoMenu(), padding: '6px 16px', fontSize: 13, cursor: 'pointer' }}>
          Importar save
          <input type="file" accept="application/json,.json" style={{ display: 'none' }} onChange={(e) => { const f = e.target.files?.[0]; if (f) void importar(f); }} />
        </label>
      </div>
      {msg && <div style={{ font: '600 12px system-ui, sans-serif', color: hex(COR.acento) }}>{msg}</div>}
    </div>
  );
}

function corBaseItem(key: string): number {
  if (key.startsWith('torre:')) return TORRES[key.slice(6)]?.cor ?? COR.ouro;
  if (key.startsWith('inimigo:')) return INIMIGOS[key.slice(8)]?.cor ?? COR.ouro;
  if (key === 'bastiao') return COR.dano;
  return COR.ouro;
}

const GRUPOS_LOJA: GrupoItem[] = ['Torres', 'Inimigos', 'Efeitos'];

function PreviaItemCanvas({ chave, tema, corBase }: { chave: string; tema: string; corBase: number }) {
  const ref = useRef<HTMLCanvasElement | null>(null);
  const escolhas = useUI((st) => st.escolhas);
  useEffect(() => {
    const canvas = ref.current;
    const ctx = canvas?.getContext('2d');
    if (!canvas || !ctx) return;
    const dpr = window.devicePixelRatio || 1;
    const w = canvas.clientWidth || 260;
    const h = canvas.clientHeight || 140;
    canvas.width = Math.round(w * dpr);
    canvas.height = Math.round(h * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    const reduzir = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
    let raf = 0;
    const inicio = performance.now();
    const quadro = (agora: number) => {
      const t = reduzir ? 0 : (agora - inicio) / 1000;
      desenharPreviaItem(ctx, w, h, t, { chave, tema, corBase, escolhas });
      raf = requestAnimationFrame(quadro);
    };
    raf = requestAnimationFrame(quadro);
    return () => cancelAnimationFrame(raf);
  }, [chave, tema, corBase, escolhas]);
  return <canvas ref={ref} style={{ width: '100%', height: 140, borderRadius: 8, border: '1px solid #3d2f66' }} />;
}

function Diario({ fechar }: { fechar: () => void }) {
  const s = useUI();
  const [aberta, setAberta] = useState<string | null>(null);
  const [reviendo, setReviendo] = useState<string | null>(null);
  const [passo, setPasso] = useState(0);
  const cenaRever = reviendo ? cenaDe(reviendo) : null;
  return (
    <div className="menu-info" style={{ width: 640, maxWidth: '96%', maxHeight: '86vh', overflowY: 'auto', background: '#0c0a1dee', border: '1px solid #3d2f66', borderRadius: 10, padding: 18, display: 'flex', flexDirection: 'column', gap: 12, animation: 'lb-entrar .25s both' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
        <div style={{ font: '700 20px system-ui, sans-serif', color: hex(COR.acento) }}>Diário</div>
        <div style={{ font: '600 13px system-ui, sans-serif', opacity: 0.7 }}>{s.vistas.length} / {fasesComCena().length} cutscenes</div>
      </div>
      <div style={{ font: '400 13px system-ui, sans-serif', opacity: 0.8 }}>
        A história de cada fase fica aqui depois que você vê a cutscene, mesmo que tenha pulado.
      </div>
      {fasesComCena().map((id) => {
        const cena = cenaDe(id);
        const mapa = MAPAS.find((m) => m.id === id);
        if (!cena || !mapa) return null;
        const vista = s.vistas.includes(id);
        const expandida = aberta === id;
        return (
          <div key={id} style={{ display: 'flex', flexDirection: 'column', gap: 8, padding: 12, borderRadius: 10, background: '#120e26', border: '1px solid #3d2f66' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 8 }}>
              <span style={{ font: '600 14px system-ui, sans-serif' }}>{vista ? cena.titulo : '???'} <span style={{ opacity: 0.55, fontWeight: 400, fontSize: 12 }}>· {mapa.nome}</span></span>
              {vista ? (
                <button className="lb-btn" style={{ ...botaoMenu(), padding: '4px 12px', fontSize: 12 }} onClick={() => { audio.tocar('clique'); setAberta(expandida ? null : id); }}>
                  {expandida ? 'Fechar' : 'Ler'}
                </button>
              ) : (
                <span style={{ font: '400 12px system-ui, sans-serif', opacity: 0.6 }}>🔒 bloqueada</span>
              )}
            </div>
            {!vista && <div style={{ font: '400 12px system-ui, sans-serif', opacity: 0.6 }}>Veja a cutscene desta fase para desbloquear.</div>}
            {vista && expandida && (
              <>
                {cena.paineis.map((p, i) => (
                  <p key={i} style={{ margin: 0, font: '400 14px/1.55 Georgia, serif', color: hex(COR.ui), opacity: 0.9 }}>{p.texto}</p>
                ))}
                <button className="lb-btn" style={{ ...botaoMenu(true), padding: '6px 16px', fontSize: 13, alignSelf: 'flex-start' }}
                  onClick={() => { audio.tocar('clique'); setPasso(0); setReviendo(id); }}>▶ Rever cutscene</button>
              </>
            )}
          </div>
        );
      })}
      <button className="lb-btn" style={{ ...botaoMenu(), alignSelf: 'flex-end', padding: '6px 16px', fontSize: 13 }} onClick={() => { audio.tocar('clique'); fechar(); }}>Fechar</button>
      {cenaRever && reviendo && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 50, background: '#000' }}>
          <div style={{ position: 'relative', width: '100%', height: '100%' }}>
            <CenaPlayer cena={cenaRever} passo={passo} onPasso={setPasso} onFim={() => setReviendo(null)} teclado />
          </div>
        </div>
      )}
    </div>
  );
}

const estiloCartao: CSSProperties = { display: 'flex', flexDirection: 'column', gap: 8, padding: 12, borderRadius: 10, background: '#120e26', border: '1px solid #3d2f66' };
const estiloSeg = (ativo: boolean): CSSProperties => ({
  flex: '1 1 0', minHeight: 40, padding: '6px 10px', fontSize: 13, fontWeight: 600, borderRadius: 8, cursor: 'pointer', color: '#fff',
  border: `1px solid ${ativo ? hex(COR.acento) : '#3d2f66'}`, background: ativo ? '#3d2f66' : '#1a1433', opacity: ativo ? 1 : 0.75,
});

function Saldo({ icone, valor, cor }: { icone: string; valor: number; cor: string }) {
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '4px 12px', borderRadius: 999, background: '#1a1433', border: `1px solid ${cor}`, color: cor, font: '700 14px system-ui, sans-serif' }}>
      {icone} {valor}
    </span>
  );
}

type AbaLoja = 'skins' | 'melhorias' | 'torres' | 'desafios';
const ABAS_LOJA: [AbaLoja, string][] = [['skins', 'Skins'], ['melhorias', 'Melhorias'], ['torres', 'Torres'], ['desafios', 'Desafios']];

/** Miniatura do item em canvas 2D (um quadro estático, para não pesar com muitos itens na grade). */
function Miniatura({ chave, tema, corBase }: { chave: string; tema: string; corBase: number }) {
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const c = ref.current;
    const ctx = c?.getContext('2d');
    if (!c || !ctx) return;
    desenharPreviaItem(ctx, c.width, c.height, 0, { chave, tema, corBase, escolhas: useUI.getState().escolhas });
  }, [chave, tema, corBase]);
  return <canvas ref={ref} width={80} height={60} aria-hidden style={{ width: 40, height: 30, borderRadius: 5, flexShrink: 0, border: '1px solid #000', background: '#0c0a1d' }} />;
}

function Loja({ fechar }: { fechar: () => void }) {
  const s = useUI();
  const [grupo, setGrupo] = useState<GrupoItem>('Torres');
  const [chave, setChave] = useState<string>('torre:arqueiro');
  const [aba, setAba] = useState<AbaLoja>('skins');
  const [aviso, setAviso] = useState<string | null>(null);
  const [menuAberto, setMenuAberto] = useState(false);
  const itens = ITENS_SKIN.filter((i) => i.grupo === grupo);
  // Seções da loja: cada grupo de skin e as demais abas, todas no menu hambúrguer.
  const SECOES: { id: string; rotulo: string; ativo: boolean; abrir: () => void }[] = [
    ...GRUPOS_LOJA.map((g) => ({
      id: `skin-${g}`, rotulo: `Skins · ${g}`, ativo: aba === 'skins' && grupo === g,
      abrir: () => { setAba('skins'); setGrupo(g); setChave(ITENS_SKIN.find((i) => i.grupo === g)!.key); },
    })),
    ...ABAS_LOJA.filter(([id]) => id !== 'skins').map(([id, rotulo]) => ({ id, rotulo, ativo: aba === id, abrir: () => setAba(id) })),
  ];
  const nomeSecao = SECOES.find((x) => x.ativo)?.rotulo ?? 'Skins';
  const item = ITENS_SKIN.find((i) => i.key === chave) ?? itens[0];
  const atual = s.escolhas[item.key] ?? 'padrao';
  const [temaPrev, setTemaPrev] = useState<string>(atual);
  const temaMostrado = temaPrev;
  const simboloMoeda = (m: 'ouro' | 'verde' | 'rubi') => (m === 'verde' ? '💚' : m === 'rubi' ? '🔴' : '🪙');

  const abrirTema = (tema: Skin) => {
    if (s.possui(item.key, tema.id)) {
      s.equipar(item.key, tema.id);
      audio.tocar('clique');
      setAviso(null);
      return;
    }
    if (s.comprarItem(item.key, tema.id)) {
      audio.tocar('clique');
      setAviso(`${item.nome}: ${tema.nome} comprada e equipada.`);
    } else {
      audio.tocar('erro');
      const { preco, moeda } = precoDoItem(tema.id);
      const falta = preco - (moeda === 'verde' ? s.verdes : moeda === 'rubi' ? s.rubis : s.moedas);
      setAviso(`Faltam ${falta} ${simboloMoeda(moeda)} para ${tema.nome}.`);
    }
  };

  const nomeDoTema = (id: string) => SKINS.find((k) => k.id === id)?.nome ?? 'Padrão';

  return (
    <div className="menu-info" style={{ width: 640, maxWidth: '96%', background: '#0c0a1df2', border: '1px solid #3d2f66', borderRadius: 12, padding: 16, display: 'flex', flexDirection: 'column', gap: 12, boxSizing: 'border-box', animation: 'lb-entrar .25s both' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 8 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <button className="lb-btn" aria-label="Menu da loja" aria-expanded={menuAberto}
            onClick={() => { audio.tocar('clique'); setMenuAberto((v) => !v); }}
            style={{ ...botaoMenu(menuAberto), width: 44, minHeight: 40, padding: '4px 0', fontSize: 18, flexShrink: 0, textAlign: 'center' }}>☰</button>
          <div style={{ font: '700 20px system-ui, sans-serif', color: hex(COR.acento) }}>
            Loja <span style={{ font: '600 13px system-ui, sans-serif', opacity: 0.75 }}>· {nomeSecao}</span>
          </div>
        </div>
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
          <Saldo icone="🪙" valor={s.moedas} cor={hex(COR.ouro)} />
          <Saldo icone="💚" valor={s.verdes} cor="#2ecc71" />
          <Saldo icone="🔴" valor={s.rubis} cor="#e63946" />
        </div>
      </div>

      <div style={{ position: 'relative', height: 0 }}>
        {menuAberto && (
          <div role="menu" style={{ position: 'absolute', top: 6, left: 0, zIndex: 5, width: 240, maxHeight: '70vh', overflowY: 'auto', background: '#1a1433', border: '1px solid #3d2f66', borderRadius: 10, padding: 6, display: 'flex', flexDirection: 'column', gap: 4, boxShadow: '0 10px 28px #000c' }}>
            {SECOES.map((sec) => (
              <button key={sec.id} role="menuitem" className="lb-btn" onClick={() => { audio.tocar('clique'); sec.abrir(); setMenuAberto(false); setAviso(null); }}
                style={{ ...estiloSeg(sec.ativo), textAlign: 'left', minHeight: 40, fontSize: 13 }}>{sec.rotulo}</button>
            ))}
          </div>
        )}
      </div>

      {aba === 'skins' && (<>
        <div style={{ display: 'flex', flexWrap: 'nowrap', gap: 6, overflowX: 'auto', paddingBottom: 4 }}>
          {itens.map((it) => {
            const sel = it.key === item.key;
            return (
              <button key={it.key} className="lb-btn" onClick={() => { audio.tocar('clique'); setChave(it.key); setTemaPrev(s.escolhas[it.key] ?? 'padrao'); setAviso(null); }}
                style={{ display: 'flex', alignItems: 'center', gap: 8, minHeight: 36, padding: '6px 10px', borderRadius: 8, flexShrink: 0, cursor: 'pointer', font: '600 13px system-ui, sans-serif', color: '#fff',
                  background: sel ? '#3d2f66' : '#1a1433', border: `1px solid ${sel ? hex(COR.acento) : '#3d2f66'}` }}>
                <Miniatura chave={it.key} tema={s.escolhas[it.key] ?? 'padrao'} corBase={corBaseItem(it.key)} />
                {it.nome}
              </button>
            );
          })}
        </div>

        <div style={estiloCartao}>
          <PreviaItemCanvas key={`${item.key}|${temaMostrado}`} chave={item.key} tema={temaMostrado} corBase={corBaseItem(item.key)} />
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', flexWrap: 'wrap', gap: 6 }}>
            <div style={{ font: '700 16px system-ui, sans-serif' }}>{item.nome}</div>
            <div style={{ font: '400 12px system-ui, sans-serif', opacity: 0.75 }}>
              Equipada: {nomeDoTema(atual)} · Prévia: {nomeDoTema(temaMostrado)}
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', flexWrap: 'nowrap', gap: 6, overflowX: 'auto', paddingBottom: 4 }}>
          {SKINS.filter((tema) => podeNoItem(tema.id, item.key)).map((tema) => {
            const tem = s.possui(item.key, tema.id);
            const equipada = atual === tema.id;
            const previa = temaMostrado === tema.id;
            const { preco, moeda } = precoDoItem(tema.id);
            const cor = corDoItem(item.key, tema.id, corBaseItem(item.key));
            const saldo = moeda === 'verde' ? s.verdes : moeda === 'rubi' ? s.rubis : s.moedas;
            const pode = tem || saldo >= preco;
            const rotuloBotao = tem ? 'Equipar' : tema.preco === 0 ? 'Grátis' : `${simboloMoeda(moeda)} ${preco}`;
            return (
              <div key={tema.id} title={tema.desc} onClick={() => { audio.tocar('clique'); setTemaPrev(tema.id); }}
                style={{ cursor: 'pointer', display: 'flex', flexDirection: 'column', gap: 6, padding: 8, borderRadius: 10, background: '#1a1433', flex: '0 0 128px',
                  border: `2px solid ${equipada ? hex(COR.acento) : previa ? hex(COR.ouro) : '#3d2f66'}` }}>
                <div style={{ height: 30, borderRadius: 6, background: hex(cor), border: '1px solid #000' }} />
                <div style={{ font: '700 13px system-ui, sans-serif' }}>{tema.nome}</div>
                <div style={{ font: '400 11px/1.3 system-ui, sans-serif', opacity: 0.7, minHeight: 28 }}>{tema.desc}</div>
                {equipada ? (
                  <span style={{ font: '700 12px system-ui, sans-serif', color: hex(COR.acento), textAlign: 'center', minHeight: 36, lineHeight: '36px' }}>Equipada</span>
                ) : (
                  <button className="lb-btn" disabled={!pode} onClick={(e) => { e.stopPropagation(); abrirTema(tema); }}
                    style={{ ...botaoMenu(pode), minHeight: 36, padding: '4px 12px', fontSize: 13, opacity: pode ? 1 : 0.5 }}>
                    {rotuloBotao}
                  </button>
                )}
              </div>
            );
          })}
        </div>
      </>)}

      {aba === 'melhorias' && (<>
        <MelhoriasVerde />
        <MelhoriasMoeda />
        <div style={{ ...estiloCartao, borderColor: '#e63946' }}>
          <div style={{ font: '700 15px system-ui, sans-serif', color: '#e63946' }}>Evolução Celestial (Arqueiro)</div>
          <div style={{ font: '400 12px/1.4 system-ui, sans-serif', opacity: 0.75 }}>
            Desbloqueie com 🔴 e depois aplique em cada Arqueiro durante a partida (400 🪙). Dá +150% de dano, +40% de cadência e +25% de alcance.
          </div>
          {s.celestialLiberada ? (
            <span style={{ font: '600 12px system-ui, sans-serif', color: '#9ff6ff' }}>Desbloqueada</span>
          ) : (
            <button className="lb-btn" disabled={s.rubis < 10} onClick={() => { if (s.desbloquearCelestial()) audio.tocar('clique'); else audio.tocar('erro'); }}
              style={{ ...botaoMenu(s.rubis >= 10), minHeight: 36, padding: '4px 12px', fontSize: 13, alignSelf: 'flex-start', opacity: s.rubis >= 10 ? 1 : 0.5 }}>
              Desbloquear · 🔴 10
            </button>
          )}
        </div>
      </>)}

      {aba === 'torres' && <TorresBloqueadas />}
      {aba === 'desafios' && <DesafiosDia />}

      {aviso && <div style={{ font: '600 13px system-ui, sans-serif', color: hex(COR.acento), textAlign: 'center' }}>{aviso}</div>}
      <button className="lb-btn" style={{ ...botaoMenu(), alignSelf: 'flex-end', padding: '6px 16px', fontSize: 14, minHeight: 40 }} onClick={() => { audio.tocar('clique'); fechar(); }}>Fechar</button>
    </div>
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
      <div style={{ font: '600 13px system-ui, sans-serif', opacity: 0.85 }}>Efeitos visuais</div>
      <div style={{ display: 'flex', gap: 8 }}>
        {NIVEIS.map((n) => (
          <button key={n.id} className="lb-btn menu-btn" onClick={() => { audio.tocar('clique'); s.definirEfeitos(n.id); }}
            style={{ ...botaoMenu(), padding: '8px 14px', opacity: s.efeitos === n.id ? 1 : 0.6, outline: s.efeitos === n.id ? `2px solid ${hex(COR.acento)}` : 'none' }}>
            {n.rotulo}
          </button>
        ))}
      </div>
      <div style={{ font: '400 12px system-ui, sans-serif', opacity: 0.7 }}>Use Baixo em aparelhos mais fracos ou para economizar bateria.</div>
      <div style={{ font: '600 13px system-ui, sans-serif', opacity: 0.85 }}>Tema geral</div>
      <div style={{ font: '400 12px system-ui, sans-serif', opacity: 0.7 }}>Aplica um tema a todos os itens que você possui. Para escolher item por item, use a Loja.</div>
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
        {SKINS.filter((k) => k.id === 'padrao' || ITENS_SKIN.some((it) => s.possui(it.key, k.id))).map((k) => (
          <button key={k.id} className="lb-btn" title={k.desc} onClick={() => { audio.tocar('clique'); s.equiparTudo(k.id); }}
            style={{ padding: '6px 12px', borderRadius: 6, cursor: 'pointer', font: '600 13px system-ui, sans-serif', color: '#fff', background: '#1a1433', border: '1px solid #3d2f66' }}>
            {k.nome}
          </button>
        ))}
      </div>
      <BackupSave />
    </>
  );
}

function PainelInfo({ tipo, fechar }: { tipo: Exclude<Painel, null | 'fases'>; fechar: () => void }) {
  return (
    <div className="menu-info" style={{ width: 640, maxWidth: '96%', background: '#0c0a1dee', border: `1px solid #3d2f66`, borderRadius: 10, padding: 18, display: 'flex', flexDirection: 'column', gap: 10, animation: 'lb-entrar .25s both' }}>
      {tipo === 'como' ? (
        <>
          <div style={{ font: '700 20px system-ui, sans-serif', color: hex(COR.acento) }}>Como jogar</div>
          <div style={{ font: '400 14px/1.55 system-ui, sans-serif' }}>
            Construa torres ao lado da trilha para impedir que os inimigos cheguem ao fim. Cada inimigo morto rende ouro; cada um que passa custa vidas. Sobreviva a todas as ondas de cada fase — vença para liberar a próxima e ganhar até 3 estrelas.
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 4, font: '400 13px system-ui, sans-serif' }}>
            {Object.values(TORRES).filter((d) => !d.desbloqueio || useUI.getState().torresLiberadas[d.id]).map((d, i) => (
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
      <FundoMenu />
      <div style={{ position: 'relative', height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 28 }} className="menu-col">
        <div style={{ textAlign: 'center', animation: 'lb-flutuar 4s ease-in-out infinite' }}>
          <div className="menu-logo"><Logo tamanho={96} /></div>
          <div className="menu-titulo" style={{ font: '800 58px system-ui, sans-serif', letterSpacing: 8, background: `linear-gradient(180deg, ${hex(COR.ui)}, ${hex(COR.acento)})`, WebkitBackgroundClip: 'text', backgroundClip: 'text', color: 'transparent', filter: `drop-shadow(0 0 18px ${hex(COR.acento)}66)`, marginTop: 6 }}>
            LAST BASTION
          </div>
          <div style={{ width: 120, height: 2, margin: '6px auto 0', background: `linear-gradient(90deg, transparent, ${hex(COR.acento)}, transparent)` }} />
          <div className="menu-sub" style={{ font: '500 14px system-ui, sans-serif', letterSpacing: 6, opacity: 0.75, marginTop: 6 }}>DEFENDA O ÚLTIMO REDUTO</div>
        </div>

        {painel === 'fases' ? (
          <Fases fechar={() => setPainel(null)} />
        ) : painel === 'loja' ? (
          <Loja fechar={() => setPainel(null)} />
        ) : painel === 'diario' ? (
          <Diario fechar={() => setPainel(null)} />
        ) : painel ? (
          <PainelInfo tipo={painel as Exclude<Painel, null | 'fases'>} fechar={() => setPainel(null)} />
        ) : (
          <div className="menu-col" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10, animation: 'lb-entrar .3s both' }}>
            <button className="lb-btn menu-btn" style={{ ...botaoMenu(true), width: 280, textAlign: 'center', fontSize: 19 }} onClick={() => { audio.destravar(); audio.tocar('clique'); jogar(); }}>
              ▶  {emAndamento ? `Continuar (onda ${s.onda}/${s.totalOndas})` : 'Jogar'}
            </button>
            {emAndamento && (
              <button className="lb-btn menu-btn" style={{ background: 'none', border: 'none', color: hex(COR.ui), opacity: 0.7, font: '600 13px system-ui, sans-serif', cursor: 'pointer', padding: 2 }} onClick={() => { audio.tocar('clique'); novoJogo(); }}>
                ↻ começar um jogo novo
              </button>
            )}
            <div className="menu-grade" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, width: 280, marginTop: 4 }}>
              <button className="lb-btn menu-btn" style={{ ...botaoMenu(), width: '100%' }} onClick={() => { audio.tocar('clique'); setPainel('loja'); }}>🛒  Loja <span style={{ opacity: 0.7, fontSize: 13 }}>· 🪙 {s.moedas}</span></button>
              <button className="lb-btn menu-btn" style={{ ...botaoMenu(), width: '100%' }} onClick={() => { audio.tocar('clique'); setPainel('diario'); }}>📖  Diário</button>
              <button className="lb-btn menu-btn" style={{ ...botaoMenu(), width: '100%' }} onClick={() => { audio.tocar('clique'); setPainel('opcoes'); }}>♪  Opções</button>
              <button className="lb-btn menu-btn" style={{ ...botaoMenu(), width: '100%' }} onClick={() => { audio.tocar('clique'); setPainel('como'); }}>?  Como jogar</button>
              <button className="lb-btn menu-btn" style={{ ...botaoMenu(), width: '100%' }} onClick={() => { audio.tocar('clique'); setPainel('sobre'); }}>i  Sobre</button>
            </div>
          </div>
        )}

        <div className="menu-rodape" style={{ position: 'absolute', bottom: 12, font: '400 12px system-ui, sans-serif', opacity: 0.55 }}>Enter para jogar · v0.1.0</div>
      </div>
    </div>
  );
}
