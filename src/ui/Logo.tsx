import { COR } from '../core/cores';

const hex = (n: number) => '#' + n.toString(16).padStart(6, '0');

/**
 * Logo: silhueta de um bastião com ameias e bandeira, na mesma linguagem do ícone do app.
 * Desenhada em SVG, então escala sem perder nitidez.
 */
export function Logo({ tamanho = 96 }: { tamanho?: number }) {
  const cor = hex(COR.acento);
  const ouro = hex(COR.ui);
  const pedra = '#3a3350';
  // ameias laterais: 4 de cada lado da torre central
  const ameias = [0, 1, 2, 3].map((i) => i);
  return (
    <svg width={tamanho} height={tamanho * 0.75} viewBox="0 0 160 120" aria-hidden="true" style={{ display: 'block', margin: '0 auto', filter: `drop-shadow(0 0 14px ${cor}88)` }}>
      {/* muralha */}
      <rect x="14" y="58" width="132" height="54" fill={pedra} />
      {ameias.map((i) => (
        <rect key={`l${i}`} x={14 + i * 14} y="46" width="8" height="12" fill={pedra} />
      ))}
      {ameias.map((i) => (
        <rect key={`r${i}`} x={96 + i * 14} y="46" width="8" height="12" fill={pedra} />
      ))}
      {/* torre central, mais alta */}
      <rect x="62" y="18" width="36" height="94" fill={pedra} />
      <rect x="58" y="14" width="10" height="10" fill={pedra} />
      <rect x="75" y="14" width="10" height="10" fill={pedra} />
      <rect x="92" y="14" width="10" height="10" fill={pedra} />
      {/* portão */}
      <path d="M76 112 V92 a4 4 0 0 1 8 0 V112 z" fill="#0c0a1d" />
      {/* bandeira */}
      <rect x="79" y="-2" width="2.5" height="18" fill={ouro} />
      <path d="M81.5 -2 L100 3 L81.5 9 z" fill={cor} />
      {/* brasa na base */}
      <rect x="14" y="110" width="132" height="2" fill={cor} opacity="0.8" />
    </svg>
  );
}
