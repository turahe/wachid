import { useEffect, useRef, useState } from 'react';
import { useThemeColor } from '../context/useTheme';

const PILLARS = [
  {
    title: 'Security',
    items: ['Zero-trust networking', 'mTLS between services', 'Secrets rotation', 'OWASP top-10 mitigations', 'RBAC + audit log'],
    color: '#EF4444',
  },
  {
    title: 'Reliability',
    items: ['Circuit breakers', 'Retry + exponential backoff', 'Health checks + readiness probes', 'Graceful shutdown', 'Chaos testing'],
    color: '#F59E0B',
  },
  {
    title: 'Performance',
    items: ['Query optimization', 'Connection pooling', 'Cache strategy', 'CDN edge caching', 'N+1 elimination'],
    color: '#00C8E8',
  },
  {
    title: 'Observability',
    items: ['Structured logging', 'Distributed tracing', 'Error budget tracking', 'Custom dashboards', 'Alert thresholds'],
    color: '#8B5CF6',
  },
  {
    title: 'Automation',
    items: ['CI/CD pipelines', 'Infrastructure as Code', 'DB migrations', 'Canary deployments', 'Rollback triggers'],
    color: '#22C55E',
  },
];

export default function InvisibleLayer() {
  const ref = useRef<HTMLElement>(null);
  const [visible, setVisible] = useState(false);
  const [revealed, setRevealed] = useState(false);
  const colors = useThemeColor();

  useEffect(() => {
    const obs = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) setVisible(true); },
      { threshold: 0.15 }
    );
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, []);

  useEffect(() => {
    if (!visible) return;
    const t = setTimeout(() => setRevealed(true), 700);
    return () => clearTimeout(t);
  }, [visible]);

  return (
    <section
      id="invisible"
      ref={ref}
      className="relative min-h-screen flex flex-col justify-center py-32 bg-token-bg border-t-token"
      aria-labelledby="invisible-heading"
    >
      <div className="max-w-7xl mx-auto px-8 md:px-16 w-full">
        <p className="eyebrow mb-6">
          05 — The invisible layer
        </p>
        <h2
          id="invisible-heading"
          className="font-display font-extrabold leading-[0.95] text-token mb-6 tracking-[-0.03em]"
          style={{
            fontSize: 'clamp(2.5rem, 5vw, 4.5rem)',
          }}
        >
          What the user never sees —
          <br />
          but always feels.
        </h2>
        <p className="text-lg leading-relaxed mb-16 font-body text-token-muted font-light max-w-[36rem]">
          Beneath every fast page load and clean error message lives an engineering layer
          most people never think about — until it's missing.
        </p>

        {/* UI peeling reveal */}
        <div className="relative mb-16">
          <div
            className="relative w-full border flex items-center justify-center overflow-hidden transition-all duration-1000 transition-theme h-16"
            style={{
              background: revealed ? 'transparent' : colors.surface,
              borderColor: revealed ? colors.elevated : colors.border,
            }}
          >
            {/* Surface label fading out */}
            <span
              className="absolute text-sm tracking-[0.2em] uppercase font-medium transition-all duration-700 font-display text-token"
              style={{ opacity: revealed ? 0 : 1 }}
            >
              User Interface
            </span>

            {/* Infrastructure revealed */}
            <div
              className="absolute inset-0 flex items-center justify-center gap-4 px-6 flex-wrap transition-all duration-700"
              style={{ opacity: revealed ? 1 : 0 }}
              aria-hidden={!revealed}
            >
              {PILLARS.map((p, i) => (
                <span
                  key={p.title}
                  className="text-xs tracking-[0.15em] uppercase px-3 py-1 border font-medium font-display"
                  style={{
                    color: p.color,
                    borderColor: p.color + '33',
                    transitionDelay: `${i * 0.08}s`,
                  }}
                >
                  {p.title}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Pillars grid */}
        <div className="grid md:grid-cols-5 gap-px bg-token-elevated">
          {PILLARS.map((pillar, i) => (
            <div
                key={pillar.title}
                className="bg-token-bg hover:bg-token-surface px-5 py-7 transition-all duration-700 transition-theme group"
                style={{
                  opacity: visible ? 1 : 0,
                  transform: visible ? 'none' : 'translateY(16px)',
                  transitionDelay: `${i * 0.08 + 0.4}s`,
                }}
              >
              <div
                className="w-6 h-px mb-6 transition-all duration-300 group-hover:w-10"
                style={{ background: pillar.color }}
                aria-hidden="true"
              />
              <h3
                className="text-xs tracking-[0.1em] uppercase font-semibold mb-5 font-display"
                style={{ color: pillar.color }}
              >
                {pillar.title}
              </h3>
              <ul className="flex flex-col gap-2.5">
                {pillar.items.map((item) => (
                  <li
                    key={item}
                    className="text-xs leading-relaxed font-body text-token-muted"
                  >
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
