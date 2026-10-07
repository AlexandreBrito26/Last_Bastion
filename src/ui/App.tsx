import { useEffect, useState } from 'react';
import type { CSSProperties } from 'react';
import { audio } from '../core/audio';
import { COR } from '../core/cores';
import { chamarOnda, construir, definirPrioridade, habPronta, habRestante, melhorar, usarCongelar, usarMeteoro, vender } from '../game/acoes';
import { custoTorre } from '../game/construcao';
import { opcoesUpgrade, PRIORIDADES, REEMBOLSO, statsTorre, TORRES } from '../game/data/torres';
import { MAPAS, mapaPorId } from '../game/data/mapas';
import { novaPartida } from '../game/partida';
import { entrada, ref } from '../game/ref';
import { useUI } from '../store/ui';
import { ESTILOS } from './estilos';
import { Menu } from './Menu';

const hex = (n: number) => '#' + n.toString(16).padStart(6, '0');

const painel: CSSProperties = {
  background: 'linear-gradient(180deg,#14303bee,#0d1d24ee)',
  backdropFilter: 'blur(6px)',
  WebkitBackdropFilter: 'blur(6px)',
  border: '1px solid #2c4b57',
  boxShadow: '0 4px 18px #0008, inset 0 1px 0 #ffffff14',
  borderRadius: 10,
  padding: 10,
  pointerEvents: 'auto',
  color: hex(COR.ui),
};

const botao = (ativo = false, desabilitado = false): CSSProperties => ({
  background: ativo ? `linear-gradient(180deg, ${hex(COR.torreFria)}, #2a9cc4)` : 'linear-gradient(180deg,#2c4f5c,#1b323b)',
  boxShadow: '0 2px 0 #0a1519, inset 0 1px 0 #ffffff22',
  color: ativo ? '#0f2027' : hex(COR.ui),
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
} as const;

function BotaoHab({ nome, ativo, onClick }: { nome: 'meteoro' | 'congelar'; ativo: boolean; onClick: () => void }) {
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
        boxShadow: pronta ? `0 0 14px ${h.cor}99, 0 2px 0 #0a1519, inset 0 1px 0 #ffffff22` : undefined,
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
  const sel = ref.mundo?.torres.find((t) => t.id === s.selecionadaId) ?? null;

  if (s.tela === 'menu') {
    return (
      <>
        <style>{ESTILOS}</style>
        <Menu />
      </>
    );
  }

  const fim = s.fase === 'vitoria' || s.fase === 'derrota';
  const sobra = Math.max(0, s.contagem - 1);

  return (
    <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', font: '600 15px system-ui, sans-serif', color: hex(COR.ui) }}>
      <style>{ESTILOS}</style>

      {/* Clarão vermelho ao perder vida */}
      {s.pulsoDano > 0 && (
        <div key={s.pulsoDano} style={{ position: 'absolute', inset: 0, boxShadow: `inset 0 0 140px 30px ${hex(COR.dano)}`, animation: 'lb-dano .55s both' }} />
      )}

      {/* Barra superior */}
      <div className="hud-topo" style={{ position: 'absolute', top: 8, left: 8, right: 8, display: 'flex', gap: 16, alignItems: 'center', textShadow: '0 1px 2px #000', animation: 'lb-descer .4s both' }}>
        <Contador rotulo="Ouro" valor={s.ouro} cor={hex(COR.ouro)} />
        <Contador rotulo="Vidas" valor={s.vidas} cor={hex(COR.vida)} animacao="lb-tremer .4s" alerta={s.vidas > 0 && s.vidas <= 5} />
        <span>Onda {s.onda}/{s.totalOndas}<span className="hud-dica" style={{ opacity: 0.55, fontWeight: 400 }}> · {mapaPorId(s.mapaId).nome}</span></span>
        {s.fase === 'pausa' && !s.pausado && (
          <button className="hud-btn" style={{ ...botao(), pointerEvents: 'auto' }} onClick={chamarOnda} title="Atalho: Enter">
            Chamar onda · {s.contagem}s{sobra > 0 ? ` (+${sobra} ouro)` : ''}
          </button>
        )}
        <span style={{ flex: 1 }} />
        <div style={{ display: 'flex', gap: 6, pointerEvents: 'auto' }}>
          <BotaoHab nome="meteoro" ativo={s.habilidade === 'meteoro'} onClick={() => { if (s.habilidade) s.definirHabilidade(null); else if (habPronta('meteoro')) { clique(); s.definirHabilidade('meteoro'); } else audio.tocar('erro'); }} />
          <BotaoHab nome="congelar" ativo={false} onClick={() => usarCongelar()} />
          {([1, 2, 3] as const).map((v) => (
            <button key={v} className="hud-btn" style={botao(s.velocidade === v)} onClick={() => { clique(); s.definirVelocidade(v); }}>{v}x</button>
          ))}
          <button className="hud-btn" style={botao(s.pausado)} onClick={() => { clique(); s.alternarPausa(); }}>{s.pausado ? 'Continuar' : 'Pausar'}</button>
          <button className="hud-btn" style={botao(s.mudo)} onClick={s.alternarMudo} title="Atalho: M">{s.mudo ? 'Som: off' : 'Som: on'}</button>
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
            textShadow: `0 0 24px ${s.aviso.chefe ? hex(COR.inimigo) : hex(COR.torreFria)}, 0 2px 4px #000`,
            animation: `lb-banner ${s.aviso.chefe ? 2.8 : 2}s both`,
          }}
        >
          {s.aviso.texto.toUpperCase()}
        </div>
      )}

      {/* Pausa */}
      {s.pausado && !fim && (
        <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#0f202755', font: '800 40px system-ui, sans-serif', letterSpacing: 8, animation: 'lb-pulsar 1.6s infinite' }}>
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
          <button className="hud-btn" style={{ ...botao(), padding: '14px 18px', fontSize: 16, minHeight: 52, background: '#5a1a2b' }} onClick={() => { clique(); s.definirConstruir(null); s.definirHabilidade(null); entrada.mouse = null; }}>✖ Cancelar</button>
        </div>
      )}

      {/* Loja */}
      <div className="hud-loja" style={{ ...painel, position: 'absolute', left: 8, bottom: 8, display: 'flex', gap: 8, alignItems: 'center', animation: 'lb-subir .4s both' }}>
        {Object.values(TORRES).map((d) => {
          const custo = custoTorre(ref.mundo, d.id);
          const semOuro = s.ouro < custo;
          return (
            <button
              key={d.id}
              className="hud-btn"
              style={botao(s.construirId === d.id, semOuro)}
              title={d.desc}
              onClick={() => { clique(); s.definirConstruir(s.construirId === d.id ? null : d.id); }}
            >
              <i style={{ display: 'inline-block', width: 8, height: 8, borderRadius: 2, background: hex(d.cor), marginRight: 6, boxShadow: `0 0 6px ${hex(d.cor)}` }} />
              {Object.keys(TORRES).indexOf(d.id) + 1}. {d.nome} · {custo}
            </button>
          );
        })}
        <span className="hud-dica" style={{ fontWeight: 400, fontSize: 12, opacity: 0.7 }}>
          {s.habilidade ? 'Mire o meteoro no mapa' : s.construirId ? 'Toque e arraste no mapa · confirme no botão' : 'Escolha uma torre para construir'}
        </span>
      </div>

      {/* Painel da torre selecionada */}
      {sel && (
        <div key={sel.id} className="hud-painel" style={{ ...painel, position: 'absolute', right: 8, bottom: 8, width: 230, display: 'flex', flexDirection: 'column', gap: 8, animation: 'lb-esq .25s both' }}>
          {(() => {
            const def = TORRES[sel.defId];
            const st = statsTorre(sel);
            const ops = opcoesUpgrade(sel);
            return (
              <>
                <div style={{ fontSize: 16 }}>
                  {def.nome} · nível {sel.nivel}
                  {sel.caminho ? ` (${def.nivel3[sel.caminho].nome})` : ''}
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
                {ops.length === 0 && <div style={{ fontWeight: 400, fontSize: 13 }}>Nível máximo</div>}
                {ops.map((o) => (
                  <button
                    key={o.chave}
                    className="hud-btn"
                    style={{ ...botao(false, s.ouro < o.up.custo), textAlign: 'left' }}
                    onClick={() => melhorar(sel.id, o.chave)}
                  >
                    {o.chave === 'N' ? 'Melhorar' : `Caminho ${o.chave}`}: {o.up.nome} · {o.up.custo}
                    <br />
                    <span style={{ fontWeight: 400, fontSize: 11 }}>{o.up.desc}</span>
                  </button>
                ))}
                <button className="hud-btn" style={{ ...botao(), background: '#5a1a2b' }} onClick={() => vender(sel.id)}>
                  Vender · +{Math.floor(sel.investido * REEMBOLSO)}
                </button>
              </>
            );
          })()}
        </div>
      )}

      {/* Fim de jogo */}
      {fim && (
        <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 10, background: '#0f2027cc', pointerEvents: 'auto', animation: 'lb-fim .5s both' }}>
          <div className="hud-fim-titulo" style={{ font: '800 54px system-ui, sans-serif', letterSpacing: 6, color: s.fase === 'vitoria' ? hex(COR.ouro) : hex(COR.dano), textShadow: '0 0 24px currentColor' }}>
            {s.fase === 'vitoria' ? 'VITÓRIA!' : 'DERROTA'}
          </div>
          <div style={{ font: '500 18px system-ui, sans-serif', opacity: 0.85 }}>
            {s.fase === 'vitoria' ? `O bastião resistiu com ${s.vidas} vidas.` : `O bastião caiu na onda ${s.onda}/${s.totalOndas}.`}
          </div>
          {s.fase === 'vitoria' && (
            <div style={{ fontSize: 40, letterSpacing: 8, color: hex(COR.ouro), textShadow: '0 0 18px currentColor' }}>
              {[1, 2, 3].map((n) => <span key={n} style={{ opacity: (s.progresso[s.mapaId] ?? 0) >= n ? 1 : 0.18, display: 'inline-block', animation: `lb-pop .5s ${n * 0.18}s both` }}>★</span>)}
            </div>
          )}
          <div style={{ display: 'flex', gap: 10, marginTop: 10, flexWrap: 'wrap', justifyContent: 'center' }}>
            {s.fase === 'vitoria' && MAPAS[MAPAS.findIndex((m) => m.id === s.mapaId) + 1] && (
              <button className="hud-btn" style={{ ...botao(true), padding: '10px 18px', fontSize: 15 }} onClick={() => { clique(); novaPartida(MAPAS[MAPAS.findIndex((m) => m.id === s.mapaId) + 1]); }}>Próxima fase ▶</button>
            )}
            <button className="hud-btn" style={{ ...botao(s.fase !== 'vitoria'), padding: '10px 18px', fontSize: 15 }} onClick={() => { clique(); novaPartida(); }}>Jogar de novo (R)</button>
            <button className="hud-btn" style={{ ...botao(), padding: '10px 18px', fontSize: 15 }} onClick={() => { clique(); s.definirTela('menu'); }}>Menu</button>
          </div>
        </div>
      )}
    </div>
  );
}
