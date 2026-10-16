import { EFEITO_DESCONTO_MOEDA, precoUpgrade } from '../game/data/economia';
import { useEffect, useState } from 'react';
import type { CSSProperties } from 'react';
import { audio } from '../core/audio';
import { COR } from '../core/cores';
import { chamarOnda, construir, definirPrioridade, habPronta, habRestante, melhorar, NomeHab, usarCongelar, usarEscudo, usarMeteoro, vender } from '../game/acoes';
import { custoTorre } from '../game/construcao';
import { nomeTorre, opcoesUpgrade, PRIORIDADES, previewStats, REEMBOLSO, statsTorre, TORRES, type Stats } from '../game/data/torres';
import { MAPAS, mapaPorId } from '../game/data/mapas';
import { cenaDe } from '../game/cenas';
import { CenaPlayer } from './Cutscene';
import { continuarSemFim, novaPartida } from '../game/partida';
import { entrada, ref } from '../game/ref';
import { chaveFase, useUI } from '../store/ui';
import { ESTILOS } from './estilos';
import { Menu } from './Menu';
import { alternarTelaCheia } from './telaCheia';
import { alternarCalor, calorLigado } from '../game/calor';

const hex = (n: number) => '#' + n.toString(16).padStart(6, '0');

const painel: CSSProperties = {
  background: 'linear-gradient(180deg,#2a1f4cee,#140f2bee)',
  backdropFilter: 'blur(6px)',
  WebkitBackdropFilter: 'blur(6px)',
  border: '1px solid #3d2f66',
  boxShadow: '0 4px 18px #0008, inset 0 1px 0 #ffffff14',
  borderRadius: 10,
  padding: 10,
  pointerEvents: 'auto',
  color: hex(COR.ui),
};

const botao = (ativo = false, desabilitado = false): CSSProperties => ({
  background: ativo ? `linear-gradient(180deg, ${hex(COR.acento)}, #e07a2a)` : 'linear-gradient(180deg,#3d2f66,#221a3d)',
  boxShadow: '0 2px 0 #07050f, inset 0 1px 0 #ffffff22',
  color: ativo ? '#0c0a1d' : hex(COR.ui),
  border: 'none',
  borderRadius: 7,
  padding: '6px 10px',
  font: '600 13px system-ui, sans-serif',
  cursor: desabilitado ? 'not-allowed' : 'pointer',
  opacity: desabilitado ? 0.45 : 1,
});

const NOME_PRIORIDADE: Record<string, string> = {
  primeiro: 'Primeiro',
  ultimo: 'Último',
  forte: 'Mais forte',
  perto: 'Mais perto',
};

/** Valor numérico que "salta" a cada mudança (a key reinicia a animação CSS). */
function Contador({ rotulo, valor, cor, animacao = 'lb-pop .3s ease-out', alerta = false }: { rotulo: string; valor: number; cor: string; animacao?: string; alerta?: boolean }) {
  return (
    <span style={{ color: cor, animation: alerta ? 'lb-pulsar 1s infinite' : undefined }}>
      {rotulo}{' '}
      <span key={valor} style={{ display: 'inline-block', animation: animacao }}>{valor}</span>
    </span>
  );
}

const HABS = {
  meteoro: { icone: '☄', nome: 'Meteoro', tecla: 'Q', cor: '#ff7a30' },
  congelar: { icone: '❄', nome: 'Congelar', tecla: 'W', cor: '#8fe3ff' },
  escudo: { icone: '🛡', nome: 'Escudo', tecla: 'E', cor: '#ffd166' },
} as const;

/** Botão de tela cheia; acompanha o estado real do documento (também muda com Esc). */
/** Lista o que muda nas estatísticas de uma torre quando um upgrade é aplicado. */
function resumoMudanca(antes: Stats, depois: Stats): string {
  const partes: string[] = [];
  if (depois.dano !== antes.dano) partes.push(`Dano ${antes.dano.toFixed(0)}→${depois.dano.toFixed(0)}`);
  if (depois.cadencia !== antes.cadencia) partes.push(`Cadência ${antes.cadencia.toFixed(1)}→${depois.cadencia.toFixed(1)}`);
  if (depois.alcance !== antes.alcance) partes.push(`Alcance ${antes.alcance.toFixed(0)}→${depois.alcance.toFixed(0)}`);
  if (depois.area !== antes.area) partes.push(`Raio ${antes.area.toFixed(0)}→${depois.area.toFixed(0)}`);
  if (depois.queima !== antes.queima) partes.push(`Queima ${antes.queima.toFixed(0)}→${depois.queima.toFixed(0)}/s`);
  if (depois.lentFator !== antes.lentFator) partes.push(`Lentidão ${Math.round((1 - antes.lentFator) * 100)}%→${Math.round((1 - depois.lentFator) * 100)}%`);
  if (depois.quebra !== antes.quebra) partes.push(`Quebra ${Math.round(depois.quebra * 100)}%`);
  if (depois.atordoa !== antes.atordoa) partes.push(`Atordoa ${depois.atordoa.toFixed(2)}s`);
  return partes.join(' · ');
}

/** Cutscene curta de cada fase: painéis de texto com Continuar, Enter ou Espaço. Esc pula. */
function Intro() {
  const intro = useUI((s) => s.intro);
  const avancar = useUI((s) => s.avancarIntro);
  const pular = useUI((s) => s.pularIntro);
  if (!intro) return null;
  const cena = cenaDe(intro.mapa);
  if (!cena) return null;
  return <CenaPlayer cena={cena} passo={intro.passo} onPasso={() => avancar()} onFim={() => pular()} />;
}

/** Dicas da primeira partida. Some depois de "Entendi" (salvo no navegador). */
function Tutorial() {
  const chave = 'lb:tutorial-visto';
  const [visto, setVisto] = useState(() => {
    try { return localStorage.getItem(chave) === '1'; } catch { return true; }
  });
  if (visto) return null;
  const fechar = () => {
    try { localStorage.setItem(chave, '1'); } catch { /* sem armazenamento: só fecha */ }
    setVisto(true);
  };
  const passos = [
    'Escolha uma torre na barra de baixo (ou tecle 1-9) e clique no terreno para construir.',
    'Clique numa torre para ver os upgrades. U melhora e V vende a torre selecionada.',
    'Enter chama a próxima onda antes do tempo. Espaço pausa.',
    'Q usa Meteoro, W congela os inimigos e E cria um escudo que protege as vidas.',
    'As moedas: 🪙 vêm das vitórias e compra skins e melhorias. 💚 cai dos inimigos e dos desafios. 🔴 é rara: cai dos inimigos e dos Relicários Errantes.',
  ];
  return (
    <div className="hud-painel hud-tutorial" style={{ ...painel, position: 'absolute', left: 8, top: 56, width: 280, display: 'flex', flexDirection: 'column', gap: 8, animation: 'lb-descer .3s both', zIndex: 3 }}>
      <div style={{ fontSize: 15 }}>Como jogar</div>
      <ol style={{ margin: 0, paddingLeft: 18, fontWeight: 400, fontSize: 13, lineHeight: 1.5, display: 'flex', flexDirection: 'column', gap: 4 }}>
        {passos.map((p) => <li key={p}>{p}</li>)}
      </ol>
      <button className="hud-btn" style={botao(true)} onClick={fechar}>Entendi</button>
    </div>
  );
}

/** Liga e desliga o mapa de calor (tecla H). */
function BotaoCalor() {
  const [ligado, setLigado] = useState(calorLigado);
  return (
    <button
      className="hud-btn"
      style={botao(ligado)}
      onClick={() => { clique(); alternarCalor(); setLigado(calorLigado()); }}
      title={ligado ? 'Esconder mapa de calor (H)' : 'Mostrar mapa de calor (H)'}
      aria-label="Mapa de calor"
    >
      🔥
    </button>
  );
}

function BotaoTelaCheia() {
  const [cheia, setCheia] = useState(() => !!document.fullscreenElement);
  useEffect(() => {
    const aoMudar = () => setCheia(!!document.fullscreenElement);
    document.addEventListener('fullscreenchange', aoMudar);
    return () => document.removeEventListener('fullscreenchange', aoMudar);
  }, []);
  return (
    <button
      className="hud-btn"
      style={botao(cheia)}
      onClick={() => { clique(); alternarTelaCheia(); }}
      title={cheia ? 'Sair da tela cheia (F)' : 'Tela cheia (F)'}
      aria-label={cheia ? 'Sair da tela cheia' : 'Entrar em tela cheia'}
    >
      {cheia ? '⤡' : '⤢'}
    </button>
  );
}

function BotaoHab({ nome, ativo, onClick }: { nome: NomeHab; ativo: boolean; onClick: () => void }) {
  const [, setTick] = useState(0);
  useEffect(() => {
    const id = setInterval(() => setTick((n) => n + 1), 150);
    return () => clearInterval(id);
  }, []);
  const h = HABS[nome];
  const pronta = habPronta(nome);
  const resta = pronta ? 0 : Math.ceil(habRestante(nome));
  return (
    <button
      className="hud-btn"
      title={`${h.nome} (${h.tecla})`}
      onClick={onClick}
      style={{
        ...botao(ativo, false),
        minWidth: 40,
        opacity: pronta ? 1 : 0.55,
        boxShadow: pronta ? `0 0 14px ${h.cor}99, 0 2px 0 #07050f, inset 0 1px 0 #ffffff22` : undefined,
        border: `1px solid ${pronta ? h.cor : 'transparent'}`,
      }}
    >
      <span style={{ fontSize: 15 }}>{h.icone}</span> <span className="hud-hab-txt">{pronta ? h.nome : `${resta}s`}</span>
    </button>
  );
}

const clique = () => audio.tocar('clique');

export function App() {
  const s = useUI();
  const [hover, setHover] = useState<string | null>(null);
  const [aviso, setAviso] = useState<{ id: number; texto: string } | null>(null);
  const avisar = (texto: string) => {
    const id = Date.now();
    setAviso({ id, texto });
    setTimeout(() => setAviso((a) => (a?.id === id ? null : a)), 1100);
  };
  useEffect(() => { if (s.toast) avisar(s.toast.texto); }, [s.toast?.id]);
  const sel = ref.mundo?.torres.find((t) => t.id === s.selecionadaId) ?? null;
  // inimigos que ainda faltam nesta onda: na fila de nascimento ou vivos no mapa
  const restantes = ref.mundo ? ref.mundo.fila.length + ref.mundo.inimigos.filter((e) => e.vivo).length : 0;
  // ficha: sob o ponteiro (desktop) ou da torre escolhida para construir (toque)
  const idFicha = hover ?? s.construirId;

  if (s.tela === 'menu') {
    return (
      <div key="menu" style={{ position: 'absolute', inset: 0, animation: 'lb-entrar .45s both' }}>
        <style>{ESTILOS}</style>
        <Menu />
      </div>
    );
  }

  const fim = s.fase === 'vitoria' || s.fase === 'derrota';
  const sobra = Math.max(0, s.contagem - 1);

  return (
    <div key="jogo" style={{ position: 'absolute', inset: 0, pointerEvents: 'none', font: '600 15px system-ui, sans-serif', color: hex(COR.ui), animation: 'lb-entrar .45s both' }}>
      <style>{ESTILOS}</style>

      {/* Clarão vermelho ao perder vida */}
      {s.pulsoDano > 0 && (
        <div key={s.pulsoDano} style={{ position: 'absolute', inset: 0, boxShadow: `inset 0 0 140px 30px ${hex(COR.dano)}`, animation: 'lb-dano .55s both' }} />
      )}

      {/* Barra superior */}
      <div className="hud-topo" style={{ position: 'absolute', top: 8, left: 8, right: 8, display: 'flex', flexWrap: 'wrap', gap: 10, alignItems: 'center', textShadow: '0 1px 2px #000', animation: 'lb-descer .4s both' }}>
        <Contador rotulo="Ouro" valor={s.ouro} cor={hex(COR.ouro)} />
        <Contador rotulo="Vidas" valor={s.vidas} cor={hex(COR.vida)} animacao="lb-tremer .4s" alerta={s.vidas > 0 && s.vidas <= 5} />
        <span>Onda {s.onda}/{s.totalOndas}<span className="hud-dica" style={{ opacity: 0.55, fontWeight: 400 }}> · {mapaPorId(s.mapaId).nome}</span></span>
        {s.fase === 'onda' && <span title="Inimigos que ainda faltam nesta onda" style={{ opacity: 0.85 }}>Inimigos: {restantes}</span>}
        {s.fase === 'pausa' && !s.pausado && (
          <button className="hud-btn" style={{ ...botao(), pointerEvents: 'auto' }} onClick={chamarOnda} title="Atalho: Enter">
            Chamar onda · {s.contagem}s{sobra > 0 ? ` (+${sobra} ouro)` : ''}
          </button>
        )}
        <span style={{ flex: 1 }} />
        <div className="hud-acoes" style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'flex-end', gap: 6, pointerEvents: 'auto', maxWidth: '100%' }}>
          <BotaoHab nome="meteoro" ativo={s.habilidade === 'meteoro'} onClick={() => { if (s.habilidade) s.definirHabilidade(null); else if (habPronta('meteoro')) { clique(); s.definirHabilidade('meteoro'); } else audio.tocar('erro'); }} />
          <BotaoHab nome="congelar" ativo={false} onClick={() => usarCongelar()} />
          <BotaoHab nome="escudo" ativo={false} onClick={() => usarEscudo()} />
          {([1, 2, 3] as const).map((v) => (
            <button key={v} className="hud-btn" style={botao(s.velocidade === v)} onClick={() => { clique(); s.definirVelocidade(v); }}>{v}x</button>
          ))}
          <button className="hud-btn" style={botao(s.pausado)} onClick={() => { clique(); s.alternarPausa(); }}>{s.pausado ? 'Continuar' : 'Pausar'}</button>
          <BotaoCalor />
          <BotaoTelaCheia />
          <button className="hud-btn" style={botao(s.mudo)} onClick={s.alternarMudo} title={s.mudo ? 'Som desligado (M)' : 'Som ligado (M)'} aria-label={s.mudo ? 'Ativar som' : 'Desativar som'}>{s.mudo ? '🔇' : '🔊'}</button>
          <button className="hud-btn" style={botao()} onClick={() => { clique(); s.definirTela('menu'); }}>Menu</button>
        </div>
      </div>

      {/* Aviso de onda */}
      {s.aviso && (
        <div
          key={s.aviso.id}
          style={{
            position: 'absolute', left: 0, right: 0, top: '22%', textAlign: 'center',
            font: `800 ${s.aviso.chefe ? 44 : 38}px system-ui, sans-serif`, letterSpacing: 6,
            color: s.aviso.chefe ? hex(COR.inimigoElite) : hex(COR.ui),
            textShadow: `0 0 24px ${s.aviso.chefe ? hex(COR.inimigo) : hex(COR.acento)}, 0 2px 4px #000`,
            animation: `lb-banner ${s.aviso.chefe ? 2.8 : 2}s both`,
          }}
        >
          {s.aviso.texto.toUpperCase()}
        </div>
      )}

      {/* Confirmação de cancelamento */}
      {aviso && (
        <div key={aviso.id} style={{ position: 'absolute', left: '50%', top: '62%', transform: 'translateX(-50%)', padding: '6px 14px', borderRadius: 20, background: '#6b1d3add', border: `1px solid ${hex(COR.dano)}`, font: '700 13px system-ui, sans-serif', letterSpacing: 1, animation: 'lb-toast 1.1s both' }}>
          {aviso.texto}
        </div>
      )}

      {/* Pausa */}
      {s.pausado && !fim && (
        <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#0c0a1d55', font: '800 40px system-ui, sans-serif', letterSpacing: 8, animation: 'lb-pulsar 1.6s infinite' }}>
          PAUSADO
        </div>
      )}

      {/* Confirmar / cancelar construção (toque) */}
      {(s.construirId || s.habilidade) && s.previaToque && entrada.mouse && (
        <div style={{ position: 'absolute', right: 'max(10px, env(safe-area-inset-right))', top: '50%', transform: 'translateY(-50%)', display: 'flex', flexDirection: 'column', gap: 10, pointerEvents: 'auto', animation: 'lb-esq .2s both' }}>
          <button className="hud-btn" style={{ ...botao(true), padding: '14px 18px', fontSize: 16, minHeight: 52 }} onClick={() => {
            if (!entrada.mouse) return;
            if (s.habilidade === 'meteoro') { if (usarMeteoro(entrada.mouse)) entrada.mouse = null; return; }
            if (s.construirId && construir(s.construirId, entrada.mouse)) { s.definirConstruir(null); entrada.mouse = null; try { navigator.vibrate?.(25); } catch { /* */ } }
          }}>{s.habilidade ? '☄ Lançar' : '✔ Construir'}</button>
          <button className="hud-btn" style={{ ...botao(), padding: '14px 18px', fontSize: 16, minHeight: 52, background: '#6b1d3a' }} onClick={() => { clique(); avisar(s.habilidade ? 'Meteoro cancelado' : 'Construção cancelada'); s.definirConstruir(null); s.definirHabilidade(null); entrada.mouse = null; }}>✖ Cancelar</button>
        </div>
      )}

      {/* Loja */}
      <div className="hud-loja" style={{ ...painel, position: 'absolute', left: 8, bottom: 8, display: 'flex', gap: 8, alignItems: 'center', animation: 'lb-subir .4s both' }}>
        {/* Trilho com rolagem horizontal: no celular as torres cabem sem quebrar a tela */}
        <div className="hud-trilho" style={{ display: 'flex', gap: 8, alignItems: 'center', minWidth: 0, overflowX: 'auto', touchAction: 'pan-x' }}>
        {Object.values(TORRES).filter((d) => !d.desbloqueio || s.torresLiberadas[d.id]).map((d, i) => {
          const custo = custoTorre(ref.mundo, d.id);
          const semOuro = s.ouro < custo;
          return (
            <button
              key={d.id}
              className="hud-btn"
              style={{ ...botao(s.construirId === d.id, semOuro), animation: `lb-subir .4s ${i * 0.06}s both` }}
              title={d.desc}
              onPointerEnter={() => setHover(d.id)}
              onPointerLeave={() => setHover(null)}
              onFocus={() => setHover(d.id)}
              onBlur={() => setHover(null)}
              onClick={() => {
                if (semOuro && s.construirId !== d.id) {
                  audio.tocar('erro');
                  avisar(`Faltam ${custo - s.ouro} de ouro`);
                  setHover(d.id);
                  return;
                }
                clique();
                s.definirConstruir(s.construirId === d.id ? null : d.id);
              }}
            >
              <i style={{ display: 'inline-block', width: 8, height: 8, borderRadius: 2, background: hex(d.cor), marginRight: 6, boxShadow: `0 0 6px ${hex(d.cor)}` }} />
              {Object.keys(TORRES).indexOf(d.id) + 1}. <span className="hud-nome">{d.nome}</span> · {custo}
            </button>
          );
        })}
        </div>
          {/* Ficha da torre sob o ponteiro (loja) */}
        {idFicha && TORRES[idFicha] && (() => {
          const d = TORRES[idFicha];
          const custo = custoTorre(ref.mundo, d.id);
          return (
            <div key={idFicha} className="hud-painel" style={{ ...painel, position: 'absolute', left: 0, bottom: 'calc(100% + 10px)', width: 240, fontSize: 13, lineHeight: 1.5, animation: 'lb-subir .2s both', pointerEvents: 'none' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 15, marginBottom: 4 }}>
                <i style={{ width: 10, height: 10, borderRadius: 3, background: hex(d.cor), boxShadow: `0 0 8px ${hex(d.cor)}` }} />
                {d.nome} <span style={{ opacity: 0.55, fontSize: 11 }}>[{Object.keys(TORRES).indexOf(d.id) + 1}]</span>
                <span style={{ marginLeft: 'auto', color: s.ouro < custo ? hex(COR.dano) : hex(COR.ouro) }}>{custo}</span>
              </div>
              <div style={{ fontWeight: 400, opacity: 0.85, marginBottom: 6 }}>{d.desc}</div>
              <div style={{ fontWeight: 400, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2px 10px', fontSize: 12 }}>
                <span>Dano {d.dano}</span><span>Cadência {d.cadencia}/s</span>
                <span>Alcance {d.alcance}</span><span>{d.antiAereo ? 'Ar e terra' : 'Só terra'}</span>
              </div>
            </div>
          );
        })()}

        <span className="hud-dica" style={{ fontWeight: 400, fontSize: 12, opacity: 0.7 }}>
          {s.habilidade ? 'Mire o meteoro no mapa' : s.construirId ? 'Toque e arraste no mapa · confirme no botão' : 'Escolha uma torre para construir'}
        </span>
      </div>

      {s.tela === 'jogo' && <Tutorial />}
      {s.tela === 'jogo' && <Intro />}

      {/* Painel da torre selecionada */}
      {sel && (
        <div key={sel.id} className="hud-painel hud-painel-torre" style={{ ...painel, position: 'absolute', right: 8, bottom: 8, width: 230, display: 'flex', flexDirection: 'column', gap: 8, animation: 'lb-esq .25s both' }}>
          {(() => {
            const def = TORRES[sel.defId];
            const st = statsTorre(sel);
            const ops = opcoesUpgrade(sel, s.celestialLiberada);
            return (
              <>
                <div style={{ fontSize: 16 }}>
                  {nomeTorre(sel)} · nível {sel.nivel}
                  <div style={{ fontWeight: 400, fontSize: 11, opacity: 0.8 }}>{def.arvore.map((r, i) => `${r.nome} ${sel.ramos[i] ?? 0}`).join(' · ')}</div>
                </div>
                <div style={{ fontWeight: 400, fontSize: 13, lineHeight: 1.5 }}>
                  Dano {st.dano.toFixed(0)} · Cadência {st.cadencia.toFixed(1)}/s<br />
                  Alcance {st.alcance.toFixed(0)}
                  {st.area > 0 && <> · Raio {st.area.toFixed(0)}</>}
                  {def.tipo === 'cadeia' && <> · Saltos {st.saltos}</>}
                  {st.lentFator < 1 && <> · Lentidão {Math.round((1 - st.lentFator) * 100)}%</>}
                  {st.quebra > 0 && <> · Quebra {Math.round(st.quebra * 100)}%</>}
                  {st.queima > 0 && <> · Queima {st.queima.toFixed(0)}/s</>}
                  {st.atordoa > 0 && <> · Atordoa {st.atordoa.toFixed(2)}s</>}
                  <br />
                  <span style={{ opacity: 0.7 }}>{def.antiAereo ? 'Acerta terrestres e voadores' : 'Só acerta terrestres'}</span>
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
                  {PRIORIDADES.map((p) => (
                    <button key={p} className="hud-btn" style={botao(sel.prioridade === p)} onClick={() => { clique(); definirPrioridade(sel.id, p); }}>
                      {NOME_PRIORIDADE[p]}
                    </button>
                  ))}
                </div>
                {ops.length === 0 && <div style={{ fontWeight: 400, fontSize: 13 }}>Todos os ramos completos</div>}
                {ops.map((o) => (
                  <button
                    key={o.ramo}
                    className="hud-btn"
                    style={{ ...botao(false, s.ouro < precoUpgrade(o.up.custo, EFEITO_DESCONTO_MOEDA[s.melhoriasMoeda.desconto])), textAlign: 'left' }}
                    onClick={() => melhorar(sel.id, o.ramo)}
                  >
                    {o.ramo < 0 ? 'Celestial' : def.arvore[o.ramo].nome}: {o.up.nome} · {precoUpgrade(o.up.custo, EFEITO_DESCONTO_MOEDA[s.melhoriasMoeda.desconto])}
                    <br />
                    <span style={{ fontWeight: 400, fontSize: 11 }}>{o.up.desc}</span>
                    <br />
                    <span style={{ fontWeight: 400, fontSize: 11, opacity: 0.85 }}>{resumoMudanca(st, previewStats(st, o.up.mod))}</span>
                  </button>
                ))}
                <button className="hud-btn" style={{ ...botao(), background: '#6b1d3a' }} onClick={() => vender(sel.id)}>
                  Vender · +{Math.floor(sel.investido * REEMBOLSO)}
                </button>
                {ref.mundo.torres.filter((x) => x.defId === sel.defId).length > 1 && (
                  <button
                    className="hud-btn"
                    style={{ ...botao(), background: '#4a1530' }}
                    onClick={() => {
                      const iguais = ref.mundo.torres.filter((x) => x.defId === sel.defId);
                      const ganho = iguais.reduce((soma, x) => soma + Math.floor(x.investido * REEMBOLSO), 0);
                      if (!window.confirm(`Vender as ${iguais.length} torres ${def.nome} por ${ganho} de ouro?`)) return;
                      iguais.forEach((x) => vender(x.id));
                    }}
                  >
                    Vender todas as {def.nome} · +{ref.mundo.torres.filter((x) => x.defId === sel.defId).reduce((soma, x) => soma + Math.floor(x.investido * REEMBOLSO), 0)}
                  </button>
                )}
              </>
            );
          })()}
        </div>
      )}

      {/* Fim de jogo */}
      {fim && (
        <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 10, background: '#0c0a1dcc', pointerEvents: 'auto', animation: 'lb-fim .5s both' }}>
          {s.fase === 'vitoria' && <div style={{ position: 'absolute', width: 520, height: 520, borderRadius: '50%', background: `radial-gradient(circle, ${hex(COR.ouro)}55 0%, transparent 62%)`, animation: 'lb-raio 1.4s ease-out both', pointerEvents: 'none' }} />}
          <div className="hud-fim-titulo" style={{ font: '800 54px system-ui, sans-serif', letterSpacing: 6, color: s.fase === 'vitoria' ? hex(COR.ouro) : hex(COR.dano), textShadow: '0 0 24px currentColor' }}>
            {s.fase === 'vitoria' ? 'VITÓRIA!' : 'DERROTA'}
          </div>
          {s.desafio && <div style={{ font: '800 13px system-ui, sans-serif', letterSpacing: 4, color: hex(COR.dano) }}>MODO DESAFIO</div>}
          <div style={{ font: '500 18px system-ui, sans-serif', opacity: 0.85 }}>
            {s.fase === 'vitoria' ? `O bastião resistiu com ${s.vidas} vidas.` : `O bastião caiu na onda ${s.onda}/${s.totalOndas}.`}
          </div>
          <div style={{ display: 'flex', gap: 18, font: '600 13px system-ui, sans-serif', opacity: 0.7, animation: 'lb-subir .4s .3s both' }}>
            <span>Torres: {ref.mundo?.torres.length ?? 0}</span>
            <span>Ouro restante: {s.ouro}</span>
            <span>Ondas: {s.onda}/{s.totalOndas}</span>
          </div>
          {s.fase === 'vitoria' && (
            <div style={{ fontSize: 40, letterSpacing: 8, color: hex(COR.ouro), textShadow: '0 0 18px currentColor' }}>
              {[1, 2, 3].map((n) => <span key={n} style={{ opacity: (s.progresso[chaveFase(s.mapaId, s.desafio)] ?? 0) >= n ? 1 : 0.18, display: 'inline-block', animation: `lb-pop .5s ${n * 0.18}s both` }}>★</span>)}
            </div>
          )}
          {s.fase === 'vitoria' && (
            <div style={{ font: '700 15px system-ui, sans-serif', color: hex(COR.ouro), animation: 'lb-subir .4s .5s both' }}>
              +{s.ultimaRecompensa} moedas{s.ultimaVerdes > 0 ? ` · +${s.ultimaVerdes} 💚` : ''}{s.ultimaRubis > 0 ? ` · +${s.ultimaRubis} 🔴` : ''}
            </div>
          )}
          <div style={{ display: 'flex', gap: 10, marginTop: 10, flexWrap: 'wrap', justifyContent: 'center' }}>
            {s.fase === 'vitoria' && MAPAS[MAPAS.findIndex((m) => m.id === s.mapaId) + 1] && (
              <button className="hud-btn" style={{ ...botao(true), padding: '10px 18px', fontSize: 15 }} onClick={() => { clique(); const prox = MAPAS[MAPAS.findIndex((m) => m.id === s.mapaId) + 1]; novaPartida(prox); s.iniciarIntro(prox.id); }}>Próxima fase ▶</button>
            )}
            {s.fase === 'vitoria' && (
              <button className="hud-btn" style={{ ...botao(true), padding: '10px 18px', fontSize: 15 }} onClick={() => { clique(); continuarSemFim(); }}>Modo sem fim ∞</button>
            )}
            <button className="hud-btn" style={{ ...botao(s.fase !== 'vitoria'), padding: '10px 18px', fontSize: 15 }} onClick={() => { clique(); novaPartida(); }}>Jogar de novo (R)</button>
            <button className="hud-btn" style={{ ...botao(), padding: '10px 18px', fontSize: 15 }} onClick={() => { clique(); s.definirTela('menu'); }}>Menu</button>
          </div>
        </div>
      )}
    </div>
  );
}
