import { MAPAS } from './data/mapas';
import { HISTORIA } from './historia';

/** Um painel da cutscene: texto na tela por `segundos`, com fundo na cor `cor`. */
export interface PainelCena {
  texto: string;
  segundos: number;
  cor: number;
}

/** Cutscene completa de uma fase. */
export interface Cena {
  titulo: string;
  paineis: PainelCena[];
}

/** Cutscenes escritas com ritmo próprio. Cada fase tem a sua; as demais usam o texto curto de `HISTORIA`. */
const CUTSCENES: Record<string, Cena> = {
  floresta: {
    titulo: 'O Primeiro Bastião',
    paineis: [
      { texto: 'Antes dos muros, havia só floresta. Árvores tão antigas que ninguém sabia quem as tinha plantado.', segundos: 15, cor: 0x1b3a2a },
      { texto: 'Nas margens dessa mata, os primeiros guardiões ergueram um bastião de pedra. Foi ali que a luz passou a ser guardada.', segundos: 18, cor: 0x23402f },
      { texto: 'Dizem que o bastião foi erguido em volta de um cristal chamado Chama Antiga. Enquanto ele brilhasse, a escuridão ficava do lado de fora.', segundos: 18, cor: 0x2b3b2a },
      { texto: 'Mas a luz atrai o que vive nas sombras. Batedores silenciosos começaram a surgir entre as árvores, seguindo as trilhas que levavam ao portão.', segundos: 18, cor: 0x1a2b26 },
      { texto: 'O velho guarda Aldric notou um padrão: os inimigos não atacavam ao acaso. Todos marchavam na mesma direção, como se fossem chamados.', segundos: 18, cor: 0x14231f },
      { texto: 'Antes de deixar o posto, ele gravou na pedra da porta: "Quem seguir a trilha até o fim encontrará o que a escuridão deseja."', segundos: 18, cor: 0x10201c },
      { texto: 'Agora o posto é seu. Posicione as torres ao longo da trilha e não deixe nenhum inimigo chegar ao portão.', segundos: 18, cor: 0x1b3a2a },
      { texto: 'Esta é a primeira de muitas noites de defesa. O bastião resiste. Por enquanto.', segundos: 12, cor: 0x2b1f4a },
    ],
  },
  'templo-esquecido': {
    titulo: 'O Templo Esquecido',
    paineis: [
      { texto: 'Muito antes do bastião, existiu um templo dedicado a guardar a Chama Antiga. Ninguém lembra o nome de quem o construiu.', segundos: 22, cor: 0x2a2418 },
      { texto: 'As paredes ainda trazem entalhes de guardiões de pedra, e cipós cobrem quase tudo. Os corredores se cruzam como um labirinto.', segundos: 22, cor: 0x2f2a1c },
      { texto: 'Segundo a lenda, quando a Chama foi levada ao bastião, o templo ficou vazio. Os guardiões de pedra ficaram para trás, esperando.', segundos: 22, cor: 0x231f15 },
      { texto: 'A poeira começou a cair das arcadas. Uma pedra se moveu, depois outra. Os guardiões acordam quando sentem a luz de novo.', segundos: 22, cor: 0x1c1912 },
      { texto: 'Abra caminho pelas ruínas, mas lembre: o templo não quer ser lembrado. Cada corredor que você fecha é uma memória a menos.', segundos: 22, cor: 0x2b2214 },
    ],
  },
  'pico-gelido': {
    titulo: 'O Pico Gélido',
    paineis: [
      { texto: 'Além do deserto e das ruínas, a montanha se ergue acima das nuvens. Lá em cima, a neve nunca derrete e o vento não para.', segundos: 22, cor: 0x1a2d3d },
      { texto: 'Dizem que os yetis guardam a montanha desde antes do primeiro bastião. Ninguém subiu até o topo e voltou para contar.', segundos: 22, cor: 0x203a4f },
      { texto: 'Quando a Chama Antiga foi levada, o frio desceu com ela. Os yetis acordaram e começaram a descer a trilha de gelo em grupos.', segundos: 22, cor: 0x17293a },
      { texto: 'Onde passam, o gelo fica mais grosso. As torres que não resistem ao frio racham e perdem o fôlego. Proteja-as com pedra e fogo.', segundos: 22, cor: 0x13222f },
      { texto: 'Lá no alto, algo espera. Um rugido ecoa pelas encostas, e a trilha inteira estremece.', segundos: 22, cor: 0x1c2e40 },
    ],
  },
};

/** Cena da fase, ou null se ela não existir. Fases sem cena própria usam o texto curto de HISTORIA. */
export function cenaDe(mapa: string): Cena | null {
  if (CUTSCENES[mapa]) return CUTSCENES[mapa];
  const textos = HISTORIA[mapa];
  if (!textos) return null;
  const nome = MAPAS.find((m) => m.id === mapa)?.nome ?? mapa;
  return { titulo: nome, paineis: textos.map((texto) => ({ texto, segundos: 8, cor: 0x1b1433 })) };
}

/** Fases que têm cutscene, na ordem do jogo (para o diário). */
export function fasesComCena(): string[] {
  return MAPAS.map((m) => m.id).filter((id) => cenaDe(id) !== null);
}
