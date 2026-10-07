import { ONDAS } from './data/ondas';
import { criarMundo } from './estado';
import { limparFeedback } from './feedback';
import { ref } from './ref';
import { useUI } from '../store/ui';

/** Zera mundo, HUD e efeitos para começar uma partida nova. */
export function novaPartida(): void {
  const ui = useUI.getState();
  ui.reiniciar();
  ui.definirOnda(1, ONDAS.length);
  ref.mundo = criarMundo();
  limparFeedback();
}
