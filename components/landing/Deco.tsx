/**
 * Formas decorativas estilo "Eduvance": garabatos, asteriscos, arcos punteados,
 * anillos y confeti. Usan currentColor → se pintan con text-brand / text-cta, etc.
 * Son decorativas: aria-hidden y pointer-events-none.
 */

type P = { className?: string };
const base = "pointer-events-none absolute";

/** Garabato/loop (línea curva). */
export function Squiggle({ className = "" }: P) {
  return (
    <svg viewBox="0 0 120 60" fill="none" aria-hidden className={`${base} ${className}`}>
      <path
        d="M4 38 C 18 8, 38 8, 46 30 S 78 56, 86 30 S 110 12, 116 30"
        stroke="currentColor" strokeWidth="7" strokeLinecap="round"
      />
    </svg>
  );
}

/** Espiral/onda más cerrada (las "vueltas" de las esquinas). */
export function Loops({ className = "" }: P) {
  return (
    <svg viewBox="0 0 140 90" fill="none" aria-hidden className={`${base} ${className}`}>
      <path
        d="M6 70 C 6 30, 50 30, 50 60 C 50 84, 90 84, 90 50 C 90 16, 134 22, 134 54"
        stroke="currentColor" strokeWidth="8" strokeLinecap="round"
      />
    </svg>
  );
}

/** Asterisco / destello de 4 puntas. */
export function Sparkle({ className = "" }: P) {
  return (
    <svg viewBox="0 0 100 100" fill="currentColor" aria-hidden className={`${base} ${className}`}>
      <path d="M50 3 C 54 33, 67 46, 97 50 C 67 54, 54 67, 50 97 C 46 67, 33 54, 3 50 C 33 46, 46 33, 50 3 Z" />
    </svg>
  );
}

/** Anillo (donut) hueco. */
export function Ring({ className = "" }: P) {
  return (
    <svg viewBox="0 0 100 100" fill="none" aria-hidden className={`${base} ${className}`}>
      <circle cx="50" cy="50" r="40" stroke="currentColor" strokeWidth="12" />
    </svg>
  );
}

/** Arco punteado. */
export function DottedArc({ className = "" }: P) {
  return (
    <svg viewBox="0 0 100 100" fill="none" aria-hidden className={`${base} ${className}`}>
      <circle cx="50" cy="50" r="42" stroke="currentColor" strokeWidth="6" strokeLinecap="round" strokeDasharray="1 16" />
    </svg>
  );
}

/** Confeti (puntitos sueltos). */
export function Dots({ className = "" }: P) {
  return (
    <svg viewBox="0 0 80 80" fill="currentColor" aria-hidden className={`${base} ${className}`}>
      {[[12, 14], [40, 8], [66, 22], [20, 44], [54, 40], [34, 66], [70, 58]].map(([x, y], i) => (
        <circle key={i} cx={x} cy={y} r={i % 2 ? 4 : 6} />
      ))}
    </svg>
  );
}

/** Anillo de progreso circular (para la tarjeta "98%"). */
export function ProgressRing({ value = 98, className = "" }: { value?: number; className?: string }) {
  const r = 26;
  const c = 2 * Math.PI * r;
  const off = c - (value / 100) * c;
  return (
    <svg viewBox="0 0 64 64" className={className} aria-hidden>
      <circle cx="32" cy="32" r={r} fill="none" stroke="currentColor" strokeWidth="7" className="text-ink/10" />
      <circle
        cx="32" cy="32" r={r} fill="none" stroke="currentColor" strokeWidth="7" strokeLinecap="round"
        strokeDasharray={c} strokeDashoffset={off} transform="rotate(-90 32 32)" className="text-cta"
      />
    </svg>
  );
}
