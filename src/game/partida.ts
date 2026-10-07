import { gerarOndas } from './data/ondas';
import { mapaPorId, type Mapa } from './data/mapas';
import { criarMundo } from './estado';
import { limparFeedback } from './feedback';
import { ref } from './ref';
import { useUI } from '../store/ui';

/** Zera mundo, HUD e efeitos para começar uma partida nova (opcionalmente em outra fase). */
export function novaPartida(mapa?: Mapa): void {
  const ui = useUI.getState();
  const m = mapa ?? (ref.mapa ? ref.mapa : mapaPorId(ui.mapaId));
  ref.mapa = m;
  ref.ondas = gerarOndas(m);
  ui.reiniciar(m.id, m.ouroInicial, m.vidas);
  ui.definirOnda(1, ref.ondas.length);
  ref.mundo = criarMundo();
  limparFeedback();
}
