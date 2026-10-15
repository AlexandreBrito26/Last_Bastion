/**
 * Skins: trocam só cores (a lógica não muda).
 * - `cores`: cor de cada torre, pelo id; o que não estiver listado usa a cor padrão.
 * - `inimigos`: cor base de cada inimigo, pelo id (chefes continuam com o efeito de dano).
 * - `bastiao`: cor do brilho que marca o fim da trilha.
 */
export interface Skin {
  id: string;
  nome: string;
  desc: string;
  /** preço em moedas (0 = já vem liberada) */
  preco: number;
  cores: Record<string, number>;
  inimigos?: Record<string, number>;
  bastiao?: number;
  /** cor do projétil comum (tiros de dano simples) */
  projetil?: number;
  /** formato do projétil comum: bola (padrão), losango ou estrela */
  projetilForma?: 'bola' | 'losango' | 'estrela';
}

export const SKINS: Skin[] = [
  { id: 'padrao', nome: 'Padrão', desc: 'As cores originais.', preco: 0, cores: {} },
  {
    id: 'ouro', nome: 'Ouro', desc: 'Torres banhadas a ouro.', preco: 150,
    cores: { arqueiro: 0xffd166, canhao: 0xe9a23b, gelo: 0xfff3c4, tesla: 0xffe066, alquimista: 0xf4c542, totem: 0xfff5b0, morteiro: 0xc8891c, ballista: 0xd4a017, cristal: 0xffe89a },
    inimigos: { basico: 0xb8860b, rapido: 0xcd853f, tanque: 0x8b6914, enxame: 0xdaa520, voador: 0xe9b44c, curandeiro: 0xfff0b3, espectro: 0xc9a227, sapador: 0x9a6b1f },
    bastiao: 0xffd166,
    projetil: 0xfff3b0, projetilForma: 'losango',
  },
  {
    id: 'sombra', nome: 'Sombra', desc: 'Pedra escura e runas roxas.', preco: 200,
    cores: { arqueiro: 0x5b3a7a, canhao: 0x2b2d42, gelo: 0x8d99ae, tesla: 0x7b2cbf, alquimista: 0x3c096c, totem: 0x9d4edd, morteiro: 0x3d3d56, ballista: 0x4a4e69, cristal: 0x9d4edd },
    inimigos: { basico: 0x4a4e69, rapido: 0x6c5b7b, tanque: 0x22223b, enxame: 0x7b2cbf, voador: 0x5a189a, curandeiro: 0x9d8fb8, espectro: 0x3c096c, sapador: 0x2b2d42 },
    bastiao: 0x7b2cbf,
    projetil: 0xc77dff, projetilForma: 'bola',
  },
  {
    id: 'neon', nome: 'Neon', desc: 'Cores vivas e brilhantes.', preco: 250,
    cores: { arqueiro: 0x00f5d4, canhao: 0xf15bb5, gelo: 0x00bbf9, tesla: 0xfee440, alquimista: 0x9bf6ff, totem: 0xff006e, morteiro: 0x8ac926, ballista: 0xfb5607, cristal: 0xf72585 },
    inimigos: { basico: 0xf15bb5, rapido: 0xfee440, tanque: 0x9b5de5, enxame: 0x00f5d4, voador: 0xff006e, curandeiro: 0x8ac926, espectro: 0x00bbf9, sapador: 0xfb5607 },
    bastiao: 0x00f5d4,
    projetil: 0x00f5d4, projetilForma: 'estrela',
  },
  {
    id: 'gelo', nome: 'Geada', desc: 'Gelo azulado e cristais brancos.', preco: 220,
    cores: { arqueiro: 0xbde0fe, canhao: 0x5e8bb0, gelo: 0xe0fbfc, tesla: 0x48cae4, alquimista: 0x90e0ef, totem: 0xcaf0f8, morteiro: 0x3a6ea5, ballista: 0xadd8e6, cristal: 0x7ec8e3 },
    inimigos: { basico: 0x8ecae6, rapido: 0xa8dadc, tanque: 0x457b9d, enxame: 0x90e0ef, voador: 0xcaf0f8, curandeiro: 0xe0fbfc, espectro: 0x5e60ce, sapador: 0x1d3557 },
    bastiao: 0x90e0ef,
    projetil: 0xe0fbfc, projetilForma: 'losango',
  },
  {
    id: 'floresta', nome: 'Floresta', desc: 'Madeira, musgo e folhagem viva.', preco: 180,
    cores: { arqueiro: 0x6b8e23, canhao: 0x8b5a2b, gelo: 0xb5e48c, tesla: 0x95d5b2, alquimista: 0x52b788, totem: 0x40916c, morteiro: 0x6f4e37, ballista: 0xa0522d, cristal: 0x74c69d },
    inimigos: { basico: 0x6b705c, rapido: 0x8ab17d, tanque: 0x3a5a40, enxame: 0x95d5b2, voador: 0xb7e4c7, curandeiro: 0xd8f3dc, espectro: 0x52796f, sapador: 0x7f5539 },
    bastiao: 0x95d5b2,
    projetil: 0xc9e4ca, projetilForma: 'bola',
  },
  {
    id: 'brasa', nome: 'Brasa', desc: 'Ferro quente, fogo e lava.', preco: 240,
    cores: { arqueiro: 0xff7b00, canhao: 0x6d2e0f, gelo: 0xffb703, tesla: 0xff4d00, alquimista: 0xd62828, totem: 0xffba08, morteiro: 0x3e1f0d, ballista: 0xe85d04, cristal: 0xff9e00 },
    inimigos: { basico: 0x9d0208, rapido: 0xe85d04, tanque: 0x370617, enxame: 0xffba08, voador: 0xf48c06, curandeiro: 0xffd60a, espectro: 0x6a040f, sapador: 0x540b0e },
    bastiao: 0xff4d00,
    projetil: 0xffb703, projetilForma: 'estrela',
  },
];

export const CHAVE_SKIN = 'last-bastion:skin';

export const CHAVE_COMPRADAS = 'last-bastion:skins-compradas';

/** Ids das skins que o jogador tem. A Padrão é sempre liberada. */
export function lerCompradas(): string[] {
  try {
    const bruto = JSON.parse(localStorage.getItem(CHAVE_COMPRADAS) ?? '[]') as unknown;
    const lista = Array.isArray(bruto) ? bruto.filter((x): x is string => typeof x === 'string') : [];
    return Array.from(new Set(['padrao', ...lista]));
  } catch {
    return ['padrao'];
  }
}

export function gravarCompradas(ids: string[]): void {
  try {
    localStorage.setItem(CHAVE_COMPRADAS, JSON.stringify(ids.filter((id) => id !== 'padrao')));
  } catch {
    /* sem armazenamento: ignora */
  }
}

export function lerSkin(): string {
  try {
    const id = localStorage.getItem(CHAVE_SKIN);
    return id && lerCompradas().includes(id) && SKINS.some((s) => s.id === id) ? id : 'padrao';
  } catch {
    return 'padrao';
  }
}

export function gravarSkin(id: string): void {
  try {
    localStorage.setItem(CHAVE_SKIN, id);
  } catch {
    /* sem armazenamento: ignora */
  }
}

const skinDe = (skinId: string): Skin | undefined => SKINS.find((s) => s.id === skinId);

/** Cor de uma torre com a skin atual. Sem skin definida, devolve a cor original. */
export function corTorre(defId: string, cor: number, skinId: string): number {
  return skinDe(skinId)?.cores[defId] ?? cor;
}

/** Cor base de um inimigo com a skin atual. */
export function corInimigo(defId: string, cor: number, skinId: string): number {
  return skinDe(skinId)?.inimigos?.[defId] ?? cor;
}

/** Cor do projétil comum com a skin atual (padrão: dourado). */
export function corProjetil(cor: number, skinId: string): number {
  return skinDe(skinId)?.projetil ?? cor;
}

/** Formato do projétil comum com a skin atual. */
export function formaProjetil(skinId: string): 'bola' | 'losango' | 'estrela' {
  return skinDe(skinId)?.projetilForma ?? 'bola';
}

/** Cor do brilho do bastião (fim da trilha) com a skin atual. */
export function corBastiao(cor: number, skinId: string): number {
  return skinDe(skinId)?.bastiao ?? cor;
}
