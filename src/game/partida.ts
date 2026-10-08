import { gerarOndas } from './data/ondas';
import { mapaPorId, type Mapa } from './data/mapas';
import { criarMundo } from './estado';
import { limparFeedback } from './feedback';
import { ref } from './ref';
import { useUI } from '../store/ui';

/** Modo desafio: mais inimigos e vida, menos ouro e vidas. Aplicado sobre a fase original (nunca acumula). */
export function aplicarDesafio(m: Mapa): Mapa {
  return {
    ...m,
    qtdMult: m.qtdMult * 1.35,
    vidaMult: m.vidaMult * 1.3,
    ouroInicial: Math.round(m.ouroInicial * 0.85),
    vidas: Math.max(10, m.vidas - 5),
  };
}

/** Zera mundo, HUD e efeitos para começar uma partida nova (opcionalmente em outra fase). */
export function novaPartida(mapa?: Mapa): void {
  const ui = useUI.getState();
  const base = mapa ?? mapaPorId(ref.mapa ? ref.mapa.id : ui.mapaId);
  const m = ui.desafio ? aplicarDesafio(base) : base;
  ref.mapa = m;
  ref.ondas = gerarOndas(m);
  ui.reiniciar(m.id, m.ouroInicial, m.vidas);
  ui.definirOnda(1, ref.ondas.length);
  ref.mundo = criarMundo();
  limparFeedback();
}
