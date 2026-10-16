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
  /** preço (0 = já vem liberada). Na moeda indicada em `moeda`. */
  preco: number;
  /** moeda do preço: dourada (padrão) ou verde (premium) */
  moeda?: 'ouro' | 'verde' | 'rubi';
  /** itens que podem comprar este tema (ex.: 'torre:arqueiro'). Ausente = todos. */
  itens?: string[];
  /** bônus em % para a torre que estiver com este tema equipado. */
  buff?: { dano?: number; cadencia?: number };
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
    cores: { arqueiro: 0xffd166, canhao: 0xe9a23b, gelo: 0xfff3c4, tesla: 0xffe066, alquimista: 0xf4c542, totem: 0xfff5b0, morteiro: 0xc8891c, ballista: 0xd4a017, cristal: 0xffe89a, lanca: 0xffd60a, runica: 0xe8c547, arcabuz: 0xb8860b, foguete: 0xd4a017 },
    inimigos: { basico: 0xb8860b, rapido: 0xcd853f, tanque: 0x8b6914, enxame: 0xdaa520, voador: 0xe9b44c, curandeiro: 0xfff0b3, espectro: 0xc9a227, sapador: 0x9a6b1f },
    bastiao: 0xffd166,
    projetil: 0xfff3b0, projetilForma: 'losango',
  },
  {
    id: 'sombra', nome: 'Sombra', desc: 'Pedra escura e runas roxas.', preco: 200,
    cores: { arqueiro: 0x5b3a7a, canhao: 0x2b2d42, gelo: 0x8d99ae, tesla: 0x7b2cbf, alquimista: 0x3c096c, totem: 0x9d4edd, morteiro: 0x3d3d56, ballista: 0x4a4e69, cristal: 0x9d4edd, lanca: 0x5a189a, runica: 0x4a2c6e, arcabuz: 0x1b1b2f, foguete: 0x6a1b9a },
    inimigos: { basico: 0x4a4e69, rapido: 0x6c5b7b, tanque: 0x22223b, enxame: 0x7b2cbf, voador: 0x5a189a, curandeiro: 0x9d8fb8, espectro: 0x3c096c, sapador: 0x2b2d42 },
    bastiao: 0x7b2cbf,
    projetil: 0xc77dff, projetilForma: 'bola',
  },
  {
    id: 'neon', nome: 'Neon', desc: 'Cores vivas e brilhantes.', preco: 250,
    cores: { arqueiro: 0x00f5d4, canhao: 0xf15bb5, gelo: 0x00bbf9, tesla: 0xfee440, alquimista: 0x9bf6ff, totem: 0xff006e, morteiro: 0x8ac926, ballista: 0xfb5607, cristal: 0xf72585, lanca: 0xfee440, runica: 0x00ff9c, arcabuz: 0xf5f5f5, foguete: 0xff4081 },
    inimigos: { basico: 0xf15bb5, rapido: 0xfee440, tanque: 0x9b5de5, enxame: 0x00f5d4, voador: 0xff006e, curandeiro: 0x8ac926, espectro: 0x00bbf9, sapador: 0xfb5607 },
    bastiao: 0x00f5d4,
    projetil: 0x00f5d4, projetilForma: 'estrela',
  },
  {
    id: 'gelo', nome: 'Geada', desc: 'Gelo azulado e cristais brancos.', preco: 220,
    cores: { arqueiro: 0xbde0fe, canhao: 0x5e8bb0, gelo: 0xe0fbfc, tesla: 0x48cae4, alquimista: 0x90e0ef, totem: 0xcaf0f8, morteiro: 0x3a6ea5, ballista: 0xadd8e6, cristal: 0x7ec8e3, lanca: 0xfff3b0, runica: 0x9be7ff, arcabuz: 0x457b9d, foguete: 0x2a9d8f },
    inimigos: { basico: 0x8ecae6, rapido: 0xa8dadc, tanque: 0x457b9d, enxame: 0x90e0ef, voador: 0xcaf0f8, curandeiro: 0xe0fbfc, espectro: 0x5e60ce, sapador: 0x1d3557 },
    bastiao: 0x90e0ef,
    projetil: 0xe0fbfc, projetilForma: 'losango',
  },
  {
    id: 'floresta', nome: 'Floresta', desc: 'Madeira, musgo e folhagem viva.', preco: 180,
    cores: { arqueiro: 0x6b8e23, canhao: 0x8b5a2b, gelo: 0xb5e48c, tesla: 0x95d5b2, alquimista: 0x52b788, totem: 0x40916c, morteiro: 0x6f4e37, ballista: 0xa0522d, cristal: 0x74c69d, lanca: 0xe9c46a, runica: 0x80b918, arcabuz: 0x3a5a40, foguete: 0x9c4a1a },
    inimigos: { basico: 0x6b705c, rapido: 0x8ab17d, tanque: 0x3a5a40, enxame: 0x95d5b2, voador: 0xb7e4c7, curandeiro: 0xd8f3dc, espectro: 0x52796f, sapador: 0x7f5539 },
    bastiao: 0x95d5b2,
    projetil: 0xc9e4ca, projetilForma: 'bola',
  },
  {
    id: 'brasa', nome: 'Brasa', desc: 'Ferro quente, fogo e lava.', preco: 240,
    cores: { arqueiro: 0xff7b00, canhao: 0x6d2e0f, gelo: 0xffb703, tesla: 0xff4d00, alquimista: 0xd62828, totem: 0xffba08, morteiro: 0x3e1f0d, ballista: 0xe85d04, cristal: 0xff9e00, lanca: 0xffea00, runica: 0xff6b35, arcabuz: 0x3e1f0d, foguete: 0xff3d00 },
    inimigos: { basico: 0x9d0208, rapido: 0xe85d04, tanque: 0x370617, enxame: 0xffba08, voador: 0xf48c06, curandeiro: 0xffd60a, espectro: 0x6a040f, sapador: 0x540b0e },
    bastiao: 0xff4d00,
    projetil: 0xffb703, projetilForma: 'estrela',
  },
  {
    id: 'crepusculo', nome: 'Crepúsculo', desc: 'Céu roxo ao entardecer, com luz solar e brumas.', preco: 260,
    cores: { arqueiro: 0x7209b7, canhao: 0x3a0ca3, gelo: 0xb5a6ff, tesla: 0xf72585, alquimista: 0x4cc9f0, totem: 0xff9e6d, morteiro: 0x560bad, ballista: 0x480ca8, cristal: 0xc77dff, lanca: 0xff8fab, runica: 0x9ef01a, arcabuz: 0xc8b6ff, foguete: 0xff7f50 },
    inimigos: { basico: 0x6a4c93, rapido: 0xf15bb5, tanque: 0x2d1e5f, enxame: 0xff9e6d, voador: 0xc77dff, curandeiro: 0xffd6a5, espectro: 0x4361ee, sapador: 0x7209b7, escudeiro: 0xa98bd9, corvo: 0x240046, ogro: 0x5a2a6e },
    bastiao: 0xff8fab,
    projetil: 0xffc8dd, projetilForma: 'losango',
  },
  {
    id: 'oceano', nome: 'Oceano', desc: 'Pedra azul-marinho com corais e brilho de água.', preco: 200,
    cores: { arqueiro: 0x0077b6, canhao: 0x023e8a, gelo: 0x90e0ef, tesla: 0x00b4d8, alquimista: 0x48cae4, totem: 0xf4a261, morteiro: 0x03045e, ballista: 0x0096c7, cristal: 0x5fd0e6, lanca: 0xffd166, runica: 0x2ec4b6, arcabuz: 0x14213d, foguete: 0xff6b6b },
    inimigos: { basico: 0x0a9396, rapido: 0x94d2bd, tanque: 0x005f73, enxame: 0x48cae4, voador: 0xf4a261, curandeiro: 0xe9d8a6, espectro: 0x3a86ff, sapador: 0x001219, escudeiro: 0x577590, corvo: 0x14213d, ogro: 0x335c67 },
    bastiao: 0x48cae4,
    projetil: 0xcaf0f8, projetilForma: 'bola',
  },
  {
    id: 'pergaminho', nome: 'Pergaminho', desc: 'Tons de sépia, como um mapa antigo.', preco: 180,
    cores: { arqueiro: 0xc8a165, canhao: 0x7f5539, gelo: 0xe6ccb2, tesla: 0xb08968, alquimista: 0x9c6644, totem: 0xddb892, morteiro: 0x5c4033, ballista: 0x8c6239, cristal: 0xd4a373, lanca: 0xe9c46a, runica: 0xa3b18a, arcabuz: 0x4a3728, foguete: 0xbc6c25 },
    inimigos: { basico: 0x6f4e37, rapido: 0x9c6644, tanque: 0x3e2723, enxame: 0xa98467, voador: 0xc2a878, curandeiro: 0xf0e6d2, espectro: 0x7f6a4f, sapador: 0x4a3728, escudeiro: 0x8d7b68, corvo: 0x2f2a24, ogro: 0x5c4033 },
    bastiao: 0xbc6c25,
    projetil: 0xf4e3c3, projetilForma: 'losango',
  },
  {
    id: 'aurora', nome: 'Aurora', desc: 'Luzes verdes e roxas do céu polar.', preco: 280,
    cores: { arqueiro: 0x64ffda, canhao: 0x7b2ff7, gelo: 0xa7f3d0, tesla: 0xc084fc, alquimista: 0x34d399, totem: 0xf0abfc, morteiro: 0x4c1d95, ballista: 0x2dd4bf, cristal: 0xa78bfa, lanca: 0xfef08a, runica: 0x86efac, arcabuz: 0x312e81, foguete: 0xf472b6 },
    inimigos: { basico: 0x6d28d9, rapido: 0x2dd4bf, tanque: 0x3b0764, enxame: 0x86efac, voador: 0xc084fc, curandeiro: 0xd9f99d, espectro: 0x67e8f9, sapador: 0x581c87, escudeiro: 0x7c3aed, corvo: 0x1e1b4b, ogro: 0x4c1d95 },
    bastiao: 0x64ffda,
    projetil: 0xa7f3d0, projetilForma: 'estrela',
  },
  {
    id: 'esmeralda', nome: 'Esmeralda', desc: 'Skin premium: cristal verde e ouro antigo. Só com moeda verde.', preco: 100, moeda: 'verde',
    cores: { arqueiro: 0x2ecc71, canhao: 0x145a32, gelo: 0xa9dfbf, tesla: 0x58d68d, alquimista: 0x1abc9c, totem: 0xf1c40f, morteiro: 0x0b5345, ballista: 0x229954, cristal: 0x52be80, lanca: 0xf7dc6f, runica: 0x82e0aa, arcabuz: 0x1d8348, foguete: 0x27ae60 },
    inimigos: { basico: 0x196f3d, rapido: 0x58d68d, tanque: 0x0e4d2a, enxame: 0x2ecc71, voador: 0xf4d03f, curandeiro: 0xd5f5e3, espectro: 0x16a085, sapador: 0x0b3d2e, escudeiro: 0x1e8449, corvo: 0x0b2e1f, ogro: 0x145a32 },
    bastiao: 0x2ecc71,
    projetil: 0xa9f5c0, projetilForma: 'estrela',
  },
  {
    id: 'rubi', nome: 'Rubi', desc: 'Vermelho profundo, como joia de sangue.', preco: 250, moeda: 'verde',
    cores: { arqueiro: 12653087, canhao: 7864320, gelo: 16741775, tesla: 15087942, alquimista: 10289672, totem: 16757697, morteiro: 6947855, ballista: 14034984, cristal: 16731501, lanca: 16748451, runica: 12195867, arcabuz: 5836066, foguete: 16735370 },
    inimigos: { basico: 10289672, rapido: 15087942, tanque: 3606039, enxame: 16741775, voador: 16757697, curandeiro: 16766688, espectro: 6947855, sapador: 8392495, escudeiro: 13178954, corvo: 5836066, ogro: 8330525 },
    bastiao: 0xe63946,
    projetil: 0xffccd5, projetilForma: 'losango',
  },
  {
    id: 'safira', nome: 'Safira', desc: 'Azul-cobalto com brilho de gelo antigo.', preco: 350, moeda: 'verde',
    cores: { arqueiro: 1920728, canhao: 1981066, gelo: 9684477, tesla: 3900150, alquimista: 1982639, totem: 12573694, morteiro: 1516884, ballista: 2450411, cristal: 6333946, lanca: 8246268, runica: 959977, arcabuz: 805486, foguete: 3718648 },
    inimigos: { basico: 1982639, rapido: 3900150, tanque: 988970, enxame: 6333946, voador: 12573694, curandeiro: 14412542, espectro: 1981066, sapador: 3359061, escudeiro: 165063, corvo: 805486, ogro: 1976635 },
    bastiao: 0x3b82f6,
    projetil: 0xdbeafe, projetilForma: 'estrela',
  },
  {
    id: 'diamante', nome: 'Diamante', desc: 'Cristal branco-azulado que reflete toda a luz.', preco: 500, moeda: 'verde',
    cores: { arqueiro: 16317180, canhao: 13358561, gelo: 14742270, tesla: 12248829, alquimista: 15857145, totem: 16777215, morteiro: 9741240, ballista: 14412542, cristal: 10875900, lanca: 14870768, runica: 13095678, arcabuz: 6583435, foguete: 15792639 },
    inimigos: { basico: 13358561, rapido: 14870768, tanque: 4674921, enxame: 12248829, voador: 16317180, curandeiro: 16777215, espectro: 9741240, sapador: 6583435, escudeiro: 14412542, corvo: 3359061, ogro: 14742270 },
    bastiao: 0xffffff,
    projetil: 0xffffff, projetilForma: 'bola',
  },
  {
    id: 'radiant-1', nome: 'Radiant I', desc: 'Luz solar dourada. Torre equipada: +10% de dano.', preco: 120, moeda: 'verde',
    buff: { dano: 10 },
    cores: { arqueiro: 0xffe066, canhao: 0xffb703, gelo: 0xfff3b0, tesla: 0xffd60a, alquimista: 0xffc300, totem: 0xfff1a8, morteiro: 0xe09f3e, ballista: 0xffca3a, cristal: 0xffe8a1, lanca: 0xffee58, runica: 0xffd166, arcabuz: 0xf6bd60, foguete: 0xffa62b },
    bastiao: 0xffd60a, projetil: 0xfff7c2, projetilForma: 'estrela',
  },
  {
    id: 'radiant-2', nome: 'Radiant II', desc: 'Brilho celeste. Torre equipada: +15% de dano e +5% de cadência.', preco: 200, moeda: 'verde',
    buff: { dano: 15, cadencia: 5 },
    cores: { arqueiro: 0x7df9ff, canhao: 0x3a86ff, gelo: 0xe0f7ff, tesla: 0x00e5ff, alquimista: 0x4cc9f0, totem: 0xbff7ff, morteiro: 0x1e6fd9, ballista: 0x48cae4, cristal: 0x90e0ef, lanca: 0xa0f0ff, runica: 0x5ee7ff, arcabuz: 0x2b59c3, foguete: 0x00b4d8 },
    bastiao: 0x7df9ff, projetil: 0xe0fbff, projetilForma: 'estrela',
  },
  {
    id: 'radiant-3', nome: 'Radiant III', desc: 'Fogo rosado. Torre equipada: +20% de dano e +10% de cadência.', preco: 300, moeda: 'verde',
    buff: { dano: 20, cadencia: 10 },
    cores: { arqueiro: 0xff5fa2, canhao: 0xd81b60, gelo: 0xff9ec4, tesla: 0xff3cac, alquimista: 0xff6bd6, totem: 0xffb3e6, morteiro: 0x8e1b5c, ballista: 0xff2e63, cristal: 0xff7eb6, lanca: 0xff8fd0, runica: 0xf72585, arcabuz: 0xa4184e, foguete: 0xff006e },
    bastiao: 0xff3cac, projetil: 0xffd1ec, projetilForma: 'estrela',
  },
  {
    id: 'rubi-arqueiro', nome: 'Rubi Arqueiro', desc: 'Arqueiro de vermelho profundo.', preco: 10, moeda: 'rubi',
    itens: ['torre:arqueiro'], cores: { arqueiro: 0xc1121f },
  },
  {
    id: 'rubi-canhao', nome: 'Rubi Canhão', desc: 'Canhão de ferro vermelho.', preco: 15, moeda: 'rubi',
    itens: ['torre:canhao'], cores: { canhao: 0x9d0208 },
  },
  {
    id: 'rubi-gelo', nome: 'Rubi Gelo', desc: 'Gelo com brilho de rubi.', preco: 20, moeda: 'rubi',
    itens: ['torre:gelo'], cores: { gelo: 0xff758f },
  },
  {
    id: 'jade', nome: 'Jade', desc: 'Pedra verde polida. Torre equipada: +12% de dano e +4% de cadência.', preco: 260, moeda: 'verde',
    buff: { dano: 12, cadencia: 4 },
    cores: { arqueiro: 0x3ddc97, canhao: 0x1b998b, gelo: 0xb8f2e6, tesla: 0x00c49a, alquimista: 0x2ec4b6, totem: 0xcbf3f0, morteiro: 0x0e6b5c, ballista: 0x20a39e, cristal: 0x5fd9b0, lanca: 0x9ff5d0, runica: 0x40e0a0, arcabuz: 0x0b4f45, foguete: 0x3ddc84 },
  },
  {
    id: 'musgo', nome: 'Musgo Eterno', desc: 'Verde antigo com brilho de raízes. Torre equipada: +25% de dano e +8% de cadência.', preco: 400, moeda: 'verde',
    buff: { dano: 25, cadencia: 8 },
    cores: { arqueiro: 0x6a994e, canhao: 0x386641, gelo: 0xa7c957, tesla: 0x90be6d, alquimista: 0x4f772d, totem: 0xf2e8cf, morteiro: 0x2d4a22, ballista: 0x6b9080, cristal: 0x80b918, lanca: 0xd4e157, runica: 0x9ccc65, arcabuz: 0x1b4332, foguete: 0x55a630 },
  },
  {
    id: 'cobre', nome: 'Cobre', desc: 'Metal envelhecido, com reflexos de cobre.', preco: 170,
    cores: { arqueiro: 0xb87333, canhao: 0xa0522d, gelo: 0xd9a07a, tesla: 0xc77b30, alquimista: 0xe0a060, totem: 0xf2c7a0, morteiro: 0x7a4a20, ballista: 0xb5651d, cristal: 0xe8a87c, lanca: 0xd2691e, runica: 0xc0703a, arcabuz: 0x5c3317, foguete: 0xcd7f32 },
  },
  {
    id: 'noite-estelar', nome: 'Noite Estelar', desc: 'Azul-meia-noite com brilho de estrelas.', preco: 240,
    cores: { arqueiro: 0x1d2d50, canhao: 0x0b132b, gelo: 0x5bc0be, tesla: 0x3a506b, alquimista: 0x6fffe9, totem: 0xc5d5e4, morteiro: 0x1c2541, ballista: 0x3a506b, cristal: 0xa9d6e5, lanca: 0xe0fbfc, runica: 0x5e60ce, arcabuz: 0x0b132b, foguete: 0xffd166 },
  },
  {
    id: 'coral', nome: 'Coral', desc: 'Rosa-coral como recife ao entardecer.', preco: 210,
    cores: { arqueiro: 0xff6f61, canhao: 0xe4572e, gelo: 0xffb4a2, tesla: 0xff8c69, alquimista: 0xffa69e, totem: 0xffe5d9, morteiro: 0xc9184a, ballista: 0xf25c54, cristal: 0xff9b85, lanca: 0xffd6a5, runica: 0xff7d7d, arcabuz: 0x8d2f1f, foguete: 0xffbe0b },
  },
  {
    id: 'lirio', nome: 'Lírio Noturno', desc: 'Pétalas roxas e prata. Só com moeda verde.', preco: 320, moeda: 'verde',
    cores: { relampago: 0xb388ff, catapulta: 0xc7b8ea, arqueiro: 0x9d7bd8 },
    bastiao: 0x7e57c2, projetil: 0xe1d5ff, projetilForma: 'losango',
  },
  {
    id: 'ferrugem', nome: 'Ferrugem', desc: 'Metal corroído pelo tempo. Só com moeda vermelha, para Catapulta e Canhão.', preco: 16, moeda: 'rubi',
    itens: ['torre:catapulta', 'torre:canhao'],
    cores: { catapulta: 0xb5562b, canhao: 0x8c3b1e },
  },
];

export const CHAVE_SKIN = 'last-bastion:skin';

export const CHAVE_COMPRADAS = 'last-bastion:skins-compradas';

/** Skin escolhida para cada torre (id da torre -> id da skin). Ausente = usa a skin geral. */
export const CHAVE_SKIN_TORRES = 'last-bastion:skin-torres';

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

/** Lê as skins por torre. Ignora ids de torre desconhecidos e skins inexistentes. */
export function lerSkinTorres(): Record<string, string> {
  try {
    const bruto = JSON.parse(localStorage.getItem(CHAVE_SKIN_TORRES) ?? '{}') as unknown;
    if (!bruto || typeof bruto !== 'object' || Array.isArray(bruto)) return {};
    const out: Record<string, string> = {};
    for (const [torre, skin] of Object.entries(bruto as Record<string, unknown>)) {
      if (typeof skin === 'string' && SKINS.some((k) => k.id === skin)) out[torre] = skin;
    }
    return out;
  } catch {
    return {};
  }
}

export function gravarSkinTorres(mapa: Record<string, string>): void {
  try {
    localStorage.setItem(CHAVE_SKIN_TORRES, JSON.stringify(mapa));
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

// ---------- skins por item (estilo catálogo) ----------
// Cada item (torre, inimigo, projétil ou bastião) escolhe a sua skin entre as que o jogador possui.
// Uma skin é um "tema" de SKINS: o item pega a cor dele dentro do tema escolhido.

import { TORRES } from './torres';
import { INIMIGOS } from './inimigos';

export type GrupoItem = 'Torres' | 'Inimigos' | 'Efeitos';
export interface ItemSkin {
  key: string;
  nome: string;
  grupo: GrupoItem;
}

/** Todos os itens que podem ter skin própria, na ordem em que aparecem na Loja. */
export const ITENS_SKIN: ItemSkin[] = [
  ...Object.values(TORRES).map((d) => ({ key: `torre:${d.id}`, nome: d.nome, grupo: 'Torres' as const })),
  ...Object.values(INIMIGOS).map((d) => ({ key: `inimigo:${d.id}`, nome: d.nome, grupo: 'Inimigos' as const })),
  { key: 'projetil', nome: 'Projétil', grupo: 'Efeitos' },
  { key: 'bastiao', nome: 'Bastião', grupo: 'Efeitos' },
];

export const CHAVE_ESCOLHAS = 'last-bastion:escolhas';
export const CHAVE_POSSUIDAS = 'last-bastion:possuidas';

const temaDe = (id: string): Skin | undefined => SKINS.find((k) => k.id === id);

/** Cor que um item tem dentro de um tema. Sem cor definida no tema, usa `fallback`. */
export function corDoItem(key: string, temaId: string, fallback: number): number {
  const t = temaDe(temaId);
  if (!t) return fallback;
  if (key.startsWith('torre:')) return t.cores[key.slice(6)] ?? fallback;
  if (key.startsWith('inimigo:')) return t.inimigos?.[key.slice(8)] ?? fallback;
  if (key === 'bastiao') return t.bastiao ?? fallback;
  if (key === 'projetil') return t.projetil ?? fallback;
  return fallback;
}

/** Cor atual de um item, pela escolha do jogador. */
export function corEscolhida(key: string, escolhas: Record<string, string>, fallback: number): number {
  return corDoItem(key, escolhas[key] ?? 'padrao', fallback);
}

/** Formato do projétil no tema escolhido para o item "projetil". */
export function formaEscolhida(escolhas: Record<string, string>): 'bola' | 'losango' | 'estrela' {
  return temaDe(escolhas.projetil ?? 'padrao')?.projetilForma ?? 'bola';
}

/** Preço de um item num tema: o preço do tema, na moeda do tema. 'padrao' é grátis. */
export function precoDoItem(temaId: string): { preco: number; moeda: 'ouro' | 'verde' | 'rubi' } {
  const t = temaDe(temaId);
  return { preco: t?.preco ?? 0, moeda: t?.moeda ?? 'ouro' };
}

/** Bônus (em %) que a torre ganha pela skin equipada nela. */
export function buffDaTorre(defId: string, escolhas: Record<string, string>): { dano: number; cadencia: number } {
  const t = temaDe(escolhas[`torre:${defId}`] ?? 'padrao');
  return { dano: t?.buff?.dano ?? 0, cadencia: t?.buff?.cadencia ?? 0 };
}

/** Se o tema pode ser comprado/equipado naquele item (respeita a lista `itens`). */
export function podeNoItem(temaId: string, key: string): boolean {
  const t = temaDe(temaId);
  return !t?.itens || t.itens.includes(key);
}

export const chaveItemTema = (key: string, temaId: string): string => `${key}|${temaId}`;

export function lerEscolhas(): Record<string, string> {
  try {
    const bruto = localStorage.getItem(CHAVE_ESCOLHAS);
    if (bruto === null) return migrarEscolhasLegadas();
    const obj = JSON.parse(bruto) as unknown;
    if (!obj || typeof obj !== 'object' || Array.isArray(obj)) return {};
    const out: Record<string, string> = {};
    for (const [k, v] of Object.entries(obj as Record<string, unknown>)) {
      if (typeof v === 'string' && temaDe(v)) out[k] = v;
    }
    return out;
  } catch {
    return {};
  }
}

export function gravarEscolhas(e: Record<string, string>): void {
  try {
    localStorage.setItem(CHAVE_ESCOLHAS, JSON.stringify(e));
  } catch {
    /* ignora */
  }
}

export function lerPossuidas(): string[] {
  try {
    const bruto = localStorage.getItem(CHAVE_POSSUIDAS);
    if (bruto === null) return migrarPossuidasLegadas();
    const arr = JSON.parse(bruto) as unknown;
    return Array.isArray(arr) ? arr.filter((x): x is string => typeof x === 'string') : [];
  } catch {
    return [];
  }
}

export function gravarPossuidas(p: string[]): void {
  try {
    localStorage.setItem(CHAVE_POSSUIDAS, JSON.stringify(Array.from(new Set(p))));
  } catch {
    /* ignora */
  }
}

/** Migração: saves antigos tinham uma skin geral e skins por torre. Viram escolhas por item. */
function migrarEscolhasLegadas(): Record<string, string> {
  const out: Record<string, string> = {};
  try {
    const geral = localStorage.getItem(CHAVE_SKIN);
    if (geral && temaDe(geral)) for (const it of ITENS_SKIN) out[it.key] = geral;
    const torres = JSON.parse(localStorage.getItem(CHAVE_SKIN_TORRES) ?? '{}') as Record<string, unknown>;
    for (const [id, tema] of Object.entries(torres)) if (typeof tema === 'string' && temaDe(tema)) out[`torre:${id}`] = tema;
  } catch {
    /* ignora */
  }
  return out;
}

/** Migração: skins compradas viram posse em todos os itens. */
function migrarPossuidasLegadas(): string[] {
  const out: string[] = [];
  try {
    const compradas = JSON.parse(localStorage.getItem(CHAVE_COMPRADAS) ?? '[]') as unknown;
    if (Array.isArray(compradas)) {
      for (const tema of compradas) {
        if (typeof tema !== 'string' || !temaDe(tema)) continue;
        for (const it of ITENS_SKIN) out.push(chaveItemTema(it.key, tema));
      }
    }
  } catch {
    /* ignora */
  }
  return out;
}
