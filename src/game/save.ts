/**
 * Backup do progresso sem nuvem: exporta tudo o que começa com `last-bastion:` para um arquivo `.json`
 * com versão e checksum (FNV-1a de 32 bits), e importa esse arquivo de volta.
 */
const PREFIXO = 'last-bastion:';
const APP = 'last-bastion';
export const VERSAO_SAVE = 2;

function checksum(texto: string): string {
  let h = 0x811c9dc5;
  for (let i = 0; i < texto.length; i++) {
    h ^= texto.charCodeAt(i);
    h = Math.imul(h, 0x01000193) >>> 0;
  }
  return h.toString(16).padStart(8, '0');
}

/** Dados em ordem alfabética de chave, para o checksum ser estável. */
function ordenados(dados: Record<string, string>): string {
  return JSON.stringify(Object.keys(dados).sort().map((k) => [k, dados[k]]));
}

export function exportarSave(): string {
  const dados: Record<string, string> = {};
  try {
    for (let i = 0; i < localStorage.length; i++) {
      const k = localStorage.key(i);
      if (k && k.startsWith(PREFIXO)) dados[k] = localStorage.getItem(k) ?? '';
    }
  } catch {
    /* sem armazenamento: exporta vazio */
  }
  const corpo = ordenados(dados);
  return JSON.stringify({ app: APP, versao: VERSAO_SAVE, criadoEm: new Date().toISOString(), checksum: checksum(corpo), dados }, null, 2);
}

/** Valida e aplica um save. Devolve null se deu certo, ou o motivo do erro. */
export function importarSave(texto: string): string | null {
  let obj: unknown;
  try {
    obj = JSON.parse(texto);
  } catch {
    return 'Arquivo inválido (não é um JSON).';
  }
  if (!obj || typeof obj !== 'object') return 'Arquivo inválido.';
  const o = obj as { app?: unknown; versao?: unknown; checksum?: unknown; dados?: unknown };
  if (o.app !== APP) return 'Este arquivo não é um save do Last Bastion.';
  if (typeof o.versao !== 'number' || o.versao > VERSAO_SAVE) return 'Save de uma versão mais nova do jogo.';
  if (!o.dados || typeof o.dados !== 'object') return 'Save sem dados.';
  const dados: Record<string, string> = {};
  for (const [k, v] of Object.entries(o.dados as Record<string, unknown>)) {
    if (!k.startsWith(PREFIXO) || typeof v !== 'string') return 'Save com dados inválidos.';
    dados[k] = v;
  }
  if (checksum(ordenados(dados)) !== o.checksum) return 'Save corrompido (checksum não confere).';
  try {
    for (let i = localStorage.length - 1; i >= 0; i--) {
      const k = localStorage.key(i);
      if (k && k.startsWith(PREFIXO)) localStorage.removeItem(k);
    }
    for (const [k, v] of Object.entries(dados)) localStorage.setItem(k, v);
  } catch {
    return 'Não foi possível gravar o save neste navegador.';
  }
  return null;
}
