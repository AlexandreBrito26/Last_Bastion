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
    cores: { arqueiro: 0xffd166, canhao: 0xe9a23b, gelo: 0xfff3c4, tesla: 0xffe066, alquimista: 0xf4c542, totem: 0xfff5b0, morteiro: 0xc8891c },
    inimigos: { basico: 0xb8860b, rapido: 0xcd853f, tanque: 0x8b6914, enxame: 0xdaa520, voador: 0xe9b44c, curandeiro: 0xfff0b3, espectro: 0xc9a227, sapador: 0x9a6b1f },
    bastiao: 0xffd166,
    projetil: 0xfff3b0, projetilForma: 'losango',
  },
  {
    id: 'sombra', nome: 'Sombra', desc: 'Pedra escura e runas roxas.', preco: 200,
    cores: { arqueiro: 0x5b3a7a, canhao: 0x2b2d42, gelo: 0x8d99ae, tesla: 0x7b2cbf, alquimista: 0x3c096c, totem: 0x9d4edd, morteiro: 0x3d3d56 },
    inimigos: { basico: 0x4a4e69, rapido: 0x6c5b7b, tanque: 0x22223b, enxame: 0x7b2cbf, voador: 0x5a189a, curandeiro: 0x9d8fb8, espectro: 0x3c096c, sapador: 0x2b2d42 },
    bastiao: 0x7b2cbf,
    projetil: 0xc77dff, projetilForma: 'bola',
  },
  {
    id: 'neon', nome: 'Neon', desc: 'Cores vivas e brilhantes.', preco: 250,
    cores: { arqueiro: 0x00f5d4, canhao: 0xf15bb5, gelo: 0x00bbf9, tesla: 0xfee440, alquimista: 0x9bf6ff, totem: 0xff006e, morteiro: 0x8ac926 },
    inimigos: { basico: 0xf15bb5, rapido: 0xfee440, tanque: 0x9b5de5, enxame: 0x00f5d4, voador: 0xff006e, curandeiro: 0x8ac926, espectro: 0x00bbf9, sapador: 0xfb5607 },
    bastiao: 0x00f5d4,
    projetil: 0x00f5d4, projetilForma: 'estrela',
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
