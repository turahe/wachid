import { useEffect, useRef, useState } from 'react';
import { useThemeColor } from '../context/useTheme';

const PRINCIPLES = [
  {
    headline: 'Good software hides complexity.',
    body: 'The mark of a well-designed system is that it feels simple to use — not because it is simple, but because the complexity is organized, named, and contained. Users shouldn\'t think about retry logic, connection pooling, or cache invalidation. Those are engineering problems.',
    index: '01',
  },
  {
    headline: 'Great engineering controls it.',
    body: 'Controlling complexity means knowing where it lives, what it costs, and how it fails. An engineer who can\'t articulate the failure modes of their system hasn\'t finished designing it.',
    index: '02',
  },
  {
    headline: 'Technology changes. Problems remain.',
    body: 'The frameworks, clouds, and languages change on a 3–5 year cycle. The problems don\'t: latency, reliability, data consistency, team coordination. The engineers who understand problems outlast the engineers who know frameworks.',
    index: '03',
  },
  {
    headline: 'The bottleneck is rarely what you think.',
    body: 'The first answer is almost never the right one. Profile before optimizing. Measure before scaling. The bug you\'re chasing is usually two layers up from where you\'re looking.',
    index: '04',
  },
  {
    headline: 'Systems outlive their authors.',
    body: 'Code you write today will be read, maintained, and extended by people who weren\'t in the room when you made the decisions. Write for them. The test of good code is not whether you understand it — it\'s whether they will.',
    index: '05',
  },
];

export default function Philosophy() {
  const ref = useRef<HTMLElement>(null);
  const [visible, setVisible] = useState(false);
  const colors = useThemeColor();

  useEffect(() => {
    const obs = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) setVisible(true); },
      { threshold: 0.1 }
    );
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, []);

  return (
    <section
      id="philosophy"
      ref={ref}
      className="relative min-h-screen flex flex-col justify-center py-32 overflow-hidden bg-token-bg border-t-token"
      aria-labelledby="philosophy-heading"
    >
      <div className="max-w-7xl mx-auto px-8 md:px-16 w-full">
        <p className="eyebrow mb-6">
          08 — Engineering Philosophy
        </p>
        <h2
          id="philosophy-heading"
          className="font-display font-extrabold leading-[0.95] text-token mb-20 tracking-[-0.03em]"
          style={{
            fontSize: 'clamp(2.5rem, 5vw, 4.5rem)',
          }}
        >
          What I believe
          <br />
          about software.
        </h2>

        <div className="flex flex-col border-t border-token">
          {PRINCIPLES.map((p, i) => (
            <article
              key={p.index}
              className="grid md:grid-cols-[64px_1fr_1fr] gap-0 border-b border-token transition-all duration-700 group"
              style={{
                opacity: visible ? 1 : 0,
                transform: visible ? 'none' : 'translateY(12px)',
                transitionDelay: `${i * 0.1}s`,
              }}
            >
              {/* Number */}
              <div className="pt-8 hidden md:flex items-start">
                <span className="text-xs font-mono" style={{ color: colors.border }}>
                  {p.index}
                </span>
              </div>

              {/* Headline */}
              <div
                className="py-8 md:pr-12 border-r border-token"
              >
                <h3
                  className="font-bold leading-snug transition-colors duration-300 font-display text-token tracking-[-0.02em]"
                  style={{
                    fontSize: 'clamp(1.1rem, 2vw, 1.5rem)',
                  }}
                >
                  {p.headline}
                </h3>
              </div>

              {/* Body */}
              <div className="py-8 md:pl-12">
                <p
                  className="text-sm leading-relaxed font-body text-token-muted font-light max-w-[36rem]"
                >
                  {p.body}
                </p>
              </div>
            </article>
          ))}
        </div>
      </div>

      {/* Background text */}
      <div
        className="absolute bottom-0 right-0 pointer-events-none select-none overflow-hidden"
        aria-hidden="true"
      >
        <p
          className="font-black uppercase font-display text-token opacity-[0.02] leading-[0.85] tracking-[-0.04em]"
          style={{
            fontSize: 'clamp(6rem, 18vw, 18rem)',
          }}
        >
          THINK
          <br />
          BUILD
        </p>
      </div>
    </section>
  );
}
