/** Título revelado palavra por palavra (o texto completo fica no aria-label). */

export type Word = { t: string; cls: string; d: string };

/** Igual ao W() do design: divide em palavras e calcula o atraso de cada uma. */
export function splitWords(text: string, cls = "w", offset = 0, base = 0, step = 0.05): Word[] {
  return text.split(" ").map((t, i) => ({ t, cls, d: (base + (offset + i) * step).toFixed(3) + "s" }));
}

export function Words({ words }: { words: Word[] }) {
  return words.map((w, i) => (
    <span key={i} className={w.cls} aria-hidden="true">
      <span style={{ animationDelay: w.d }}>{w.t}</span>
    </span>
  ));
}

type Props = { as?: "h1" | "h2"; text: string; className?: string; base?: number; step?: number };

export default function SplitWords({ as: Tag = "h2", text, className = "h2 split", base = 0, step = 0.05 }: Props) {
  return (
    <Tag className={className} aria-label={text}>
      <Words words={splitWords(text, "w", 0, base, step)} />
    </Tag>
  );
}
