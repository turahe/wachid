import { useEffect, useRef, useState } from 'react';
import { useThemeColor } from '../context/useTheme';

const QUESTIONS = [
  { text: 'How does it work?', x: 15, y: 12, delay: 0 },
  { text: 'Why is it slow?', x: 62, y: 8, delay: 0.25 },
  { text: 'Where does the data go?', x: 32, y: 52, delay: 0.5 },
  { text: 'What happens when it fails?', x: 68, y: 42, delay: 0.75 },
  { text: 'How can it be simpler?', x: 10, y: 68, delay: 1.0 },
  { text: 'Who depends on this?', x: 52, y: 72, delay: 1.25 },
  { text: 'What does 10× look like?', x: 78, y: 22, delay: 1.5 },
  { text: 'Can it self-heal?', x: 40, y: 22, delay: 1.75 },
];

export default function Curiosity() {
  const ref = useRef<HTMLElement>(null);
  const [visible, setVisible] = useState(false);
  const [converged, setConverged] = useState(false);
  const colors = useThemeColor();

  useEffect(() => {
    const obs = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) setVisible(true); },
      { threshold: 0.2 }
    );
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, []);

  useEffect(() => {
    if (!visible) return;
    const t = setTimeout(() => setConverged(true), 3200);
    return () => clearTimeout(t);
  }, [visible]);

  return (
    <section
      id="curiosity"
      ref={ref}
      className="relative min-h-screen flex flex-col justify-center overflow-hidden py-32 bg-token-bg border-t-token transition-theme"
      aria-labelledby="curiosity-heading"
    >
      {/* Subtle dot grid */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage: `radial-gradient(circle, ${colors.border} 1px, transparent 1px)`,
          backgroundSize: '40px 40px',
          opacity: 0.5,
        }}
        aria-hidden="true"
      />

      <div className="relative z-10 max-w-7xl mx-auto px-8 md:px-16 w-full">
        {/* Chapter marker */}
        <p className="eyebrow mb-6">
          01 — Curiosity
        </p>

        <h2
          id="curiosity-heading"
          className="display-heading text-token mb-16"
        >
          Everything starts
          <br />
          <span className="text-token-muted">with a question.</span>
        </h2>

        {/* Floating questions field */}
        <div
          className="relative w-full h-[clamp(280px,45vh,440px)]"
          aria-hidden="true"
        >
          {QUESTIONS.map((q, i) => (
            <div
              key={i}
              className="absolute transition-all"
              style={{
                left: converged ? '50%' : `${q.x}%`,
                top: converged ? '50%' : `${q.y}%`,
                transform: 'translate(-50%, -50%)',
                opacity: visible ? (converged ? 0 : 1) : 0,
                transitionDuration: converged ? '1s' : '0.7s',
                transitionDelay: converged ? `${i * 0.05}s` : `${q.delay}s`,
                transitionTimingFunction: 'cubic-bezier(0.4, 0, 0.2, 1)',
              }}
            >
              <span
                className="whitespace-nowrap px-3 py-1.5 text-xs tracking-wide border font-mono text-token-secondary border-token bg-token-surface transition-theme text-[0.7rem]"
              >
                {q.text}
              </span>
            </div>
          ))}

          <div
            className="absolute inset-0 flex items-center justify-center transition-all duration-800"
            style={{ opacity: converged ? 1 : 0, transitionDelay: '0.6s' }}
          >
            <p
              className="font-display font-extrabold text-center text-token text-[clamp(1.75rem,4vw,3rem)] leading-none tracking-[-0.025em]"
            >
              Questions become systems.
            </p>
          </div>
        </div>

        <p className="body-copy max-w-lg text-lg mt-16">
          Engineering begins with genuine curiosity — not about what to build, but about
          how things actually work and why they break.
        </p>
      </div>
    </section>
  );
}
