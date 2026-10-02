import { useState, useEffect } from 'react';
import NetworkScene from '../NetworkScene';
import { useThemeColor } from '../context/useTheme';

const SEQUENCE = [
  { type: 'cmd', text: '$ whoami' },
  { type: 'out', text: 'nur_wachid — senior software engineer' },
  { type: 'cmd', text: '$ what_do_you_build?' },
  { type: 'out', text: 'systems that make things work.' },
  { type: 'cmd', text: '$ show --architecture' },
  { type: 'out', text: 'rendering network graph...' },
];

function useTypewriter(lines: typeof SEQUENCE, speed = 32) {
  const [displayed, setDisplayed] = useState<{ type: string; text: string; done: boolean }[]>([]);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let i = 0, charIdx = 0;
    let current: typeof displayed = [];
    let rafId: number, lastTime = 0;

    const tick = (ts: number) => {
      if (ts - lastTime < speed) { rafId = requestAnimationFrame(tick); return; }
      lastTime = ts;
      if (i >= lines.length) { setReady(true); return; }
      const line = lines[i];
      if (charIdx === 0) current = [...current, { type: line.type, text: '', done: false }];
      if (charIdx < line.text.length) {
        current = current.map((l, idx) =>
          idx === current.length - 1 ? { ...l, text: line.text.slice(0, charIdx + 1) } : l
        );
        charIdx++;
      } else {
        current = current.map((l, idx) =>
          idx === current.length - 1 ? { ...l, done: true } : l
        );
        i++; charIdx = 0;
      }
      setDisplayed([...current]);
      rafId = requestAnimationFrame(tick);
    };

    const t = setTimeout(() => { rafId = requestAnimationFrame(tick); }, 700);
    return () => { clearTimeout(t); cancelAnimationFrame(rafId); };
  }, []);

  return { displayed, ready };
}

export default function Hero() {
  const { displayed, ready } = useTypewriter(SEQUENCE, 32);
  const colors = useThemeColor();
  const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const isMobile = window.innerWidth < 768;

  return (
    <section
      id="hero"
      className="relative min-h-screen flex flex-col justify-end overflow-hidden"
      aria-label="Introduction"
    >
      {/* 3D network */}
      {!prefersReduced && (
        <div className="absolute inset-0 z-0 opacity-60">
          <NetworkScene reduced={isMobile} />
        </div>
      )}

      {/* Subtle radial vignette */}
      <div
        className="absolute inset-0 z-10 pointer-events-none"
        style={{
          background: `radial-gradient(ellipse 100% 80% at 60% 40%, transparent 20%, ${colors.bg}66 55%, ${colors.bg}dd 80%, ${colors.bg} 100%)`,
        }}
      />
      {/* Left fade */}
      <div
        className="absolute inset-0 z-10 pointer-events-none"
        style={{ background: `linear-gradient(to right, ${colors.bg} 30%, transparent 70%)` }}
      />
      {/* Bottom fade */}
      <div
        className="absolute bottom-0 left-0 right-0 h-48 z-10 pointer-events-none"
        style={{ background: `linear-gradient(to bottom, transparent, ${colors.bg})` }}
      />

      {/* Content — bottom-aligned, editorial */}
      <div className="relative z-20 px-8 md:px-16 lg:px-24 pb-20 md:pb-32 max-w-7xl">
        {/* Terminal — minimal, no OS chrome */}
        <div
          className="mb-14 inline-block"
          role="log"
          aria-label="Terminal"
          aria-live="polite"
        >
          <div
            className="border px-6 py-5"
            style={{ borderColor: colors.border, background: colors.surface }}
          >
            <div className="flex flex-col gap-1 min-h-[5rem] font-mono text-[0.8125rem] leading-[1.8]">
              {displayed.map((line, i) => (
                <div key={i} style={{ color: line.type === 'cmd' ? colors.system : colors.textSecondary }}>
                  {line.text}
                  {!line.done && i === displayed.length - 1 && (
                    <span
                      className="inline-block w-[0.5ch] h-[1em] ml-[0.1ch] align-text-bottom animate-pulse"
                      style={{ background: colors.system }}
                      aria-hidden="true"
                    />
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Main headline — large, editorial */}
        <div
          className="transition-all duration-1000"
          style={{ opacity: ready ? 1 : 0, transform: ready ? 'none' : 'translateY(20px)' }}
        >
          <h1
            className="font-extrabold leading-[0.95] mb-8 font-display tracking-[-0.03em]"
            style={{
              fontSize: 'clamp(3.5rem, 9vw, 7.5rem)',
              color: colors.text,
            }}
          >
            I don't just
            <br />
            write code.
            <br />
            <span style={{ color: colors.textSecondary }}>I build systems.</span>
          </h1>

          <div className="flex items-end gap-16">
            <p
              className="max-w-xs text-lg leading-relaxed font-body font-light"
              style={{ color: colors.muted }}
            >
              Distributed systems, backend architecture, AI-assisted engineering.
            </p>

            <button
              onClick={() => document.getElementById('curiosity')?.scrollIntoView({ behavior: 'smooth' })}
              className="flex-shrink-0 flex items-center gap-3 group transition-all duration-300"
              style={{ color: colors.textSecondary }}
            >
              <span
                className="text-xs tracking-[0.15em] uppercase transition-colors group-hover:text-current font-display"
              >
                Explore the journey
              </span>
              <span
                className="text-sm transition-all duration-300 group-hover:translate-x-1 group-hover:text-current"
              >
                →
              </span>
            </button>
          </div>
        </div>
      </div>

      {/* Scroll line */}
      <div
        className="absolute right-8 md:right-16 bottom-8 z-20 flex flex-col items-center gap-3"
        aria-hidden="true"
      >
        <div
          className="w-px h-16"
          style={{ background: `linear-gradient(to bottom, transparent, ${colors.border})` }}
        />
        <span
          className="text-[9px] tracking-[0.3em] uppercase font-display [writing-mode:vertical-lr]"
          style={{ color: colors.muted }}
        >
          scroll
        </span>
      </div>
    </section>
  );
}
