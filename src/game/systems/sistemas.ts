import { registrarCalor } from '../calor';
import { dist, type Vec } from '../../core/vec';
import { INIMIGOS } from '../data/inimigos';
import { auraDe, DECAIMENTO_SALTO, DUR_QUEBRA, DUR_QUEIMA, RAIO_SALTO, statsTorre, TORRES, type Stats } from '../data/torres';
import { fatorVida, ondaInfinita, PAUSA_ENTRE_ONDAS } from '../data/ondas';
import { ref } from '../ref';
import type { Mapa } from '../data/mapas';
import type { EfeitoProj, Inimigo, Mundo, Projetil, Torre } from '../estado';
import { useUI } from '../../store/ui';
import { emitir } from '../../core/eventos';
import { COR } from '../../core/cores';

function iniciarOnda(m: Mundo): void {
  const def = ref.ondas[m.ondaIdx];
  m.fila = [];
  for (const g of def.grupos) {
    for (let i = 0; i < g.quantidade; i++) {
      m.fila.push({ defId: g.inimigo, em: (g.atraso ?? 0) + i * g.intervalo });
    }
  }
  m.fila.sort((x, y) => x.em - y.em);
  m.tempoOnda = 0;
  m.fase = 'onda';
  useUI.getState().definirOnda(m.ondaIdx + 1, ref.ondas.length);
  useUI.getState().definirFase('onda');
  emitir({ t: 'onda', numero: m.ondaIdx + 1, chefe: def.grupos.some((g) => INIMIGOS[g.inimigo].chefe) });
}

export function criarInimigo(m: Mundo, mapa: Mapa, defId: string, pos?: Vec, indiceWp?: number, progresso = 0): Inimigo {
  const def = INIMIGOS[defId];
  const p0 = pos ?? mapa.waypoints[0];
  const e: Inimigo = {
    id: m.proximoId++,
    defId: def.id,
    pos: { x: p0.x, y: p0.y },
    vida: def.vida * fatorVida(m.ondaIdx) * mapa.vidaMult,
    vidaMax: def.vida * fatorVida(m.ondaIdx) * mapa.vidaMult,
    // voador vai em linha reta até o último waypoint
    indiceWp: indiceWp ?? (def.voador ? mapa.waypoints.length - 1 : 1),
    vivo: true,
    chegou: false,
    progresso,
    lentFator: 1,
    lentTempo: 0,
    quebra: 0,
    quebraTempo: 0,
    queimaDps: 0,
    queimaTempo: 0,
    atordTempo: 0,
    curaTimer: def.cura?.intervalo ?? 0,
    fases: 0,
    flash: 0,
  };
  m.inimigos.push(e);
  return e;
}

/** Máquina de fases: pausa -> onda -> pausa ... -> vitória/derrota. */
export function sistemaOndas(m: Mundo, mapa: Mapa, dt: number): void {
  const ui = useUI.getState();
  if (m.fase === 'vitoria' || m.fase === 'derrota') return;
  if (ui.vidas <= 0) {
    m.fase = 'derrota';
    ui.definirFase('derrota');
    emitir({ t: 'derrota' });
    return;
  }

  if (m.fase === 'pausa') {
    m.temporizador -= dt;
    ui.definirFase('pausa', Math.max(0, Math.ceil(m.temporizador)));
    if (m.temporizador <= 0) iniciarOnda(m);
    return;
  }

  // fase === 'onda'
  m.tempoOnda += dt;
  while (m.fila.length > 0 && m.fila[0].em <= m.tempoOnda) {
    criarInimigo(m, mapa, m.fila.shift()!.defId);
  }
  if (m.fila.length === 0 && !m.inimigos.some((e) => e.vivo)) {
    ui.ganharOuro(ref.ondas[m.ondaIdx].bonus);
    m.ondaIdx++;
    // modo sem fim: gera a próxima onda infinita em vez de vencer
    if (ref.endless && m.ondaIdx >= ref.ondas.length) ref.ondas.push(ondaInfinita(ref.ondas.length));
    if (m.ondaIdx >= ref.ondas.length) {
      m.fase = 'vitoria';
      ui.definirFase('vitoria');
      ui.registrarVitoria();
      emitir({ t: 'vitoria' });
    } else {
      m.fase = 'pausa';
      m.temporizador = PAUSA_ENTRE_ONDAS;
    }
  }
}

// ---------- dano e efeitos ----------

export function aplicarDano(e: Inimigo, dano: number, ignoraArmadura = false): void {
  if (!e.vivo) return;
  const def = INIMIGOS[e.defId];
  let dmg = dano;
  if (!ignoraArmadura) {
    const arm = def.armadura * (e.quebraTempo > 0 ? 1 - e.quebra : 1);
    dmg = Math.max(1, dano - arm);
  }
  e.vida -= dmg;
  e.flash = 0.1;
  if (e.vida <= 0) {
    e.vivo = false;
    useUI.getState().ganharOuro(def.recompensa);
    emitir({ t: 'morte', pos: { x: e.pos.x, y: e.pos.y }, cor: def.cor, raio: def.raio, ouro: def.recompensa, chefe: !!def.chefe });
  }
}

function aplicarEfeitos(e: Inimigo, ef: EfeitoProj): void {
  const chefe = !!INIMIGOS[e.defId].chefe;
  if (ef.lentFator < 1) {
    const f = chefe ? 1 - (1 - ef.lentFator) * 0.5 : ef.lentFator;
    e.lentFator = e.lentTempo > 0 ? Math.min(e.lentFator, f) : f;
    e.lentTempo = Math.max(e.lentTempo, ef.lentDur);
  }
  if (ef.quebra > 0) {
    e.quebra = e.quebraTempo > 0 ? Math.max(e.quebra, ef.quebra) : ef.quebra;
    e.quebraTempo = DUR_QUEBRA;
  }
  if (ef.queima > 0) {
    e.queimaDps = e.queimaTempo > 0 ? Math.max(e.queimaDps, ef.queima) : ef.queima;
    e.queimaTempo = DUR_QUEIMA;
  }
  if (ef.atordoa > 0 && !chefe) e.atordTempo = Math.max(e.atordTempo, ef.atordoa);
}

const efeitoDe = (st: Stats): EfeitoProj => ({
  area: st.area, lentFator: st.lentFator, lentDur: st.lentDur, quebra: st.quebra, queima: st.queima, atordoa: st.atordoa,
});

/** Tempo dos status, queimadura, cura de curandeiros e efeitos visuais. */
export function sistemaStatus(m: Mundo, dt: number): void {
  m.escudoTempo = Math.max(0, m.escudoTempo - dt);
  for (const e of m.inimigos) {
    if (!e.vivo) continue;
    const def = INIMIGOS[e.defId];
    e.lentTempo = Math.max(0, e.lentTempo - dt);
    e.quebraTempo = Math.max(0, e.quebraTempo - dt);
    e.atordTempo = Math.max(0, e.atordTempo - dt);
    e.flash = Math.max(0, e.flash - dt);
    if (e.queimaTempo > 0) {
      e.queimaTempo -= dt;
      aplicarDano(e, e.queimaDps * dt, true);
      if (!e.vivo) continue;
    }
    if (def.cura) {
      e.curaTimer -= dt;
      if (e.curaTimer <= 0) {
        e.curaTimer = def.cura.intervalo;
        for (const o of m.inimigos) {
          if (o === e || !o.vivo || dist(o.pos, e.pos) > def.cura.raio) continue;
          o.vida = Math.min(o.vidaMax, o.vida + def.cura.quantidade);
        }
      }
    }
  }
  for (const f of m.efeitos) f.ttl -= dt;
  m.efeitos = m.efeitos.filter((f) => f.ttl > 0);
}

export function sistemaMovimento(m: Mundo, mapa: Mapa, dt: number): void {
  for (const e of m.inimigos) {
    if (!e.vivo) continue;
    const def = INIMIGOS[e.defId];
    let vel = def.velocidade;
    if (e.atordTempo > 0) vel = 0;
    else if (e.lentTempo > 0) vel *= e.lentFator;
    const total = vel * dt;
    let resta = total;
    while (resta > 0 && e.indiceWp < mapa.waypoints.length) {
      const alvo = mapa.waypoints[e.indiceWp];
      const d = dist(e.pos, alvo);
      if (d <= resta) {
        e.pos.x = alvo.x;
        e.pos.y = alvo.y;
        e.indiceWp++;
        resta -= d;
      } else {
        e.pos.x += ((alvo.x - e.pos.x) / d) * resta;
        e.pos.y += ((alvo.y - e.pos.y) / d) * resta;
        resta = 0;
      }
    }
    e.progresso += total - resta;
    registrarCalor(e.pos.x, e.pos.y, dt);
    if (e.indiceWp >= mapa.waypoints.length) {
      e.vivo = false;
      e.chegou = true;
      // escudo ativo: o inimigo chega, mas o bastião não perde vida
      if (m.escudoTempo > 0) continue;
      useUI.getState().perderVida(def.danoBase);
      emitir({ t: 'vazou', pos: { x: e.pos.x, y: e.pos.y }, dano: def.danoBase });
    }
  }
}

/** Fases de chefe: invoca capangas ao cruzar limiares de vida. */
export function sistemaChefes(m: Mundo, mapa: Mapa): void {
  for (const e of m.inimigos.slice()) {
    const fases = INIMIGOS[e.defId].chefe;
    if (!e.vivo || !fases) continue;
    while (e.fases < fases.length && e.vida / e.vidaMax <= fases[e.fases].em) {
      const { defId, qtd } = fases[e.fases].invoca;
      for (let i = 0; i < qtd; i++) {
        criarInimigo(m, mapa, defId, { x: e.pos.x + (i - qtd / 2) * 6, y: e.pos.y }, e.indiceWp, e.progresso - i * 6);
      }
      m.efeitos.push({ tipo: 'explosao', pontos: [{ x: e.pos.x, y: e.pos.y }], raio: 60, ttl: 0.4, ttlMax: 0.4, cor: 0xff9e00 });
      emitir({ t: 'faseChefe', pos: { x: e.pos.x, y: e.pos.y } });
      e.fases++;
    }
  }
}

// ---------- torres ----------

function pontuacao(t: Torre, e: Inimigo): number {
  switch (t.prioridade) {
    case 'primeiro': return e.progresso;
    case 'ultimo': return -e.progresso;
    case 'forte': return e.vida;
    case 'perto': return -dist(t.pos, e.pos);
  }
}

function disparoCadeia(m: Mundo, t: Torre, st: Stats, alvo: Inimigo): void {
  const ef = efeitoDe(st);
  const atingidos: Inimigo[] = [alvo];
  const pontos: Vec[] = [{ x: t.pos.x, y: t.pos.y }, { x: alvo.pos.x, y: alvo.pos.y }];
  let dmg = st.dano;
  aplicarDano(alvo, dmg);
  aplicarEfeitos(alvo, ef);
  let atual = alvo;
  for (let i = 0; i < st.saltos; i++) {
    let prox: Inimigo | null = null;
    let menor = RAIO_SALTO;
    for (const e of m.inimigos) {
      if (!e.vivo || atingidos.includes(e)) continue;
      const d = dist(atual.pos, e.pos);
      if (d < menor) { menor = d; prox = e; }
    }
    if (!prox) break;
    dmg *= DECAIMENTO_SALTO;
    aplicarDano(prox, dmg);
    aplicarEfeitos(prox, ef);
    atingidos.push(prox);
    pontos.push({ x: prox.pos.x, y: prox.pos.y });
    atual = prox;
  }
  m.efeitos.push({ tipo: 'arco', pontos, raio: 0, ttl: 0.12, ttlMax: 0.12, cor: TORRES[t.defId].cor });
  emitir({ t: 'tiro', torre: t.defId, de: t.pos, para: alvo.pos });
}

export function sistemaTorres(m: Mundo, dt: number): void {
  for (const t of m.torres) {
    const def = TORRES[t.defId];
    const st = statsTorre(t);
    t.idade += dt;
    t.flash = Math.max(0, t.flash - dt);
    t.melhoria = Math.max(0, t.melhoria - dt);
    if (def.suporte) continue; // torres de suporte só dão aura
    const aura = auraDe(m, t);
    st.dano *= aura.dano;
    st.cadencia *= aura.cadencia;
    t.recarga -= dt;
    if (t.recarga > 0) continue;
    let melhor: Inimigo | null = null;
    let melhorPts = -Infinity;
    for (const e of m.inimigos) {
      if (!e.vivo || dist(t.pos, e.pos) > st.alcance) continue;
      if (INIMIGOS[e.defId].voador && !def.antiAereo) continue;
      const pts = pontuacao(t, e);
      if (pts > melhorPts) { melhorPts = pts; melhor = e; }
    }
    if (!melhor) continue;
    t.recarga = 1 / st.cadencia;
    t.flash = 0.09;
    if (def.tipo === 'cadeia') {
      disparoCadeia(m, t, st, melhor);
    } else {
      m.projeteis.push({
        id: m.proximoId++,
        pos: { x: t.pos.x, y: t.pos.y },
        alvoPos: { x: melhor.pos.x, y: melhor.pos.y },
        efeito: efeitoDe(st),
        alvoId: melhor.id,
        dano: st.dano,
        velocidade: st.velProjetil,
        vivo: true,
      });
      emitir({ t: 'tiro', torre: t.defId, de: t.pos, para: melhor.pos });
    }
  }
}

function impacto(m: Mundo, p: Projetil, alvo: Inimigo | undefined): void {
  if (p.efeito.area > 0) {
    m.efeitos.push({ tipo: 'explosao', pontos: [{ x: p.alvoPos.x, y: p.alvoPos.y }], raio: p.efeito.area, ttl: 0.25, ttlMax: 0.25, cor: 0xf8961e });
    emitir({ t: 'impacto', pos: { x: p.alvoPos.x, y: p.alvoPos.y }, area: p.efeito.area, cor: 0xf8961e });
    for (const e of m.inimigos) {
      if (!e.vivo || INIMIGOS[e.defId].voador || dist(e.pos, p.alvoPos) > p.efeito.area) continue;
      aplicarDano(e, p.dano);
      aplicarEfeitos(e, p.efeito);
    }
  } else if (alvo) {
    emitir({ t: 'acerto', pos: { x: alvo.pos.x, y: alvo.pos.y }, cor: p.efeito.lentFator < 1 ? 0xcaf0f8 : COR.ouro });
    aplicarDano(alvo, p.dano);
    aplicarEfeitos(alvo, p.efeito);
  }
}

export function sistemaProjeteis(m: Mundo, dt: number): void {
  for (const p of m.projeteis) {
    if (!p.vivo) continue;
    const alvo = m.inimigos.find((e) => e.id === p.alvoId && e.vivo);
    if (alvo) {
      p.alvoPos.x = alvo.pos.x;
      p.alvoPos.y = alvo.pos.y;
    } else if (p.efeito.area <= 0) {
      p.vivo = false; // sem alvo e sem explosão: some
      continue;
    }
    const d = dist(p.pos, p.alvoPos);
    const passo = p.velocidade * dt;
    if (d <= passo) {
      impacto(m, p, alvo);
      p.vivo = false;
    } else {
      p.pos.x += ((p.alvoPos.x - p.pos.x) / d) * passo;
      p.pos.y += ((p.alvoPos.y - p.pos.y) / d) * passo;
    }
  }
}

export function limpar(m: Mundo): void {
  m.inimigos = m.inimigos.filter((e) => e.vivo);
  m.projeteis = m.projeteis.filter((p) => p.vivo);
}
