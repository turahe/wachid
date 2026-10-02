import { useEffect, useRef, useState } from 'react';
import { useThemeColor } from '../context/useTheme';

interface Metric {
  label: string;
  normal: number;
  crisis: number;
  resolved: number;
  format: (v: number) => string;
  bad: 'high' | 'low';
}

const METRICS: Metric[] = [
  { label: 'API Latency', normal: 48, crisis: 2340, resolved: 52, format: (v) => `${Math.round(v)}ms`, bad: 'high' },
  { label: 'Memory Usage', normal: 34, crisis: 94, resolved: 41, format: (v) => `${Math.round(v)}%`, bad: 'high' },
  { label: 'Queue Depth', normal: 1.2, crisis: 847, resolved: 2.1, format: (v) => v >= 10 ? `${Math.round(v)}k` : `${v.toFixed(1)}k`, bad: 'high' },
  { label: 'DB Connections', normal: 24, crisis: 498, resolved: 31, format: (v) => `${Math.round(v)}/500`, bad: 'high' },
  { label: 'Error Rate', normal: 0.02, crisis: 18.4, resolved: 0.04, format: (v) => `${v.toFixed(2)}%`, bad: 'high' },
  { label: 'Throughput', normal: 4200, crisis: 280, resolved: 3900, format: (v) => `${Math.round(v)} rps`, bad: 'low' },
];

type Phase = 'normal' | 'crisis' | 'resolved';

function lerp(a: number, b: number, t: number) { return a + (b - a) * t; }

function MetricCard({ metric, phase }: { metric: Metric; phase: Phase }) {
  const [current, setCurrent] = useState(metric.normal);
  const colors = useThemeColor();

  useEffect(() => {
    const target = phase === 'normal' ? metric.normal : phase === 'crisis' ? metric.crisis : metric.resolved;
    const start = current;
    const duration = phase === 'crisis' ? 1400 : 900;
    const t0 = performance.now();

    const tick = (now: number) => {
      const t = Math.min(1, (now - t0) / duration);
      const eased = t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;
      setCurrent(lerp(start, target, eased));
      if (t < 1) requestAnimationFrame(tick);
    };
    const id = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(id);
  }, [phase]);

  const isCritical = phase === 'crisis';
  const isResolved = phase === 'resolved';
  const color = isCritical ? '#EF4444' : isResolved ? '#22C55E' : '#00C8E8';
  const barPct = metric.bad === 'high'
    ? (current / metric.crisis) * 100
    : 100 - (current / metric.normal) * 100;

  return (
    <div
      className="p-6 border transition-all duration-500"
      style={{
        background: isCritical ? '#110808' : colors.surface,
        borderColor: isCritical ? '#EF444433' : isResolved ? '#22C55E33' : colors.border,
        transition: 'background-color 0.3s ease, border-color 0.3s ease',
      }}
    >
      <div className="flex items-center justify-between mb-4">
        <span
          className="text-xs tracking-[0.1em] uppercase"
          style={{ fontFamily: 'Bricolage Grotesque, sans-serif', color: colors.muted }}
        >
          {metric.label}
        </span>
        {isCritical && (
          <span
            className="text-[9px] tracking-widest px-2 py-0.5 animate-pulse"
            style={{ fontFamily: 'Bricolage Grotesque, sans-serif', color: '#EF4444', background: '#EF444411', border: '1px solid #EF444433' }}
          >
            ALERT
          </span>
        )}
        {isResolved && (
          <span
            className="text-[9px] tracking-widest px-2 py-0.5"
            style={{ fontFamily: 'Bricolage Grotesque, sans-serif', color: '#22C55E', background: '#22C55E11', border: '1px solid #22C55E33' }}
          >
            OK
          </span>
        )}
      </div>
      <div
        className="text-3xl font-bold mb-4 tabular-nums"
        style={{ fontFamily: 'JetBrains Mono, monospace', color, letterSpacing: '-0.02em' }}
      >
        {metric.format(current)}
      </div>
      <div className="w-full h-px" style={{ background: colors.elevated }}>
        <div
          className="h-full transition-all duration-300"
          style={{ width: `${Math.min(100, Math.max(0, barPct))}%`, background: color }}
        />
      </div>
    </div>
  );
}

export default function Problems() {
  const ref = useRef<HTMLElement>(null);
  const [phase, setPhase] = useState<Phase>('normal');
  const [started, setStarted] = useState(false);
  const colors = useThemeColor();

  useEffect(() => {
    const obs = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting && !started) setStarted(true); },
      { threshold: 0.25 }
    );
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, [started]);

  useEffect(() => {
    if (!started) return;
    const t1 = setTimeout(() => setPhase('crisis'), 800);
    const t2 = setTimeout(() => setPhase('resolved'), 5200);
    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, [started]);

  const phaseColors: Record<Phase, string> = { normal: '#00C8E8', crisis: '#EF4444', resolved: '#22C55E' };
  const phaseLabels: Record<Phase, string> = {
    normal: 'System stable — all metrics nominal',
    crisis: 'Production incident — cascading failure detected',
    resolved: 'Architecture responded — system recovered in 4m 12s',
  };

  return (
    <section
      id="problems"
      ref={ref}
      className="relative min-h-screen flex flex-col justify-center py-32"
      style={{ background: colors.bg, borderTop: `1px solid ${colors.border}` }}
      aria-labelledby="problems-heading"
    >
      <div className="max-w-7xl mx-auto px-8 md:px-16 w-full">
        <p
          className="text-xs tracking-[0.2em] uppercase mb-6"
          style={{ color: colors.muted, fontFamily: 'Bricolage Grotesque, sans-serif' }}
        >
          03 — Problems
        </p>
        <h2
          id="problems-heading"
          className="font-extrabold leading-[0.95] mb-6"
          style={{
            fontFamily: 'Bricolage Grotesque, sans-serif',
            fontSize: 'clamp(2.5rem, 5vw, 4.5rem)',
            letterSpacing: '-0.03em',
            color: colors.text,
          }}
        >
          Production
          <br />
          changes everything.
        </h2>

        <div className="flex items-center gap-3 mb-12">
          <div
            className="w-1.5 h-1.5 rounded-full flex-shrink-0"
            style={{ background: phaseColors[phase], animation: phase === 'crisis' ? 'pulse 1s infinite' : 'none', transition: 'background-color 0.3s ease' }}
          />
          <p
            className="text-sm tracking-wide transition-colors duration-700"
            style={{ fontFamily: 'JetBrains Mono, monospace', color: phaseColors[phase], fontSize: '0.75rem' }}
          >
            {phaseLabels[phase]}
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-px mb-12" style={{ background: colors.elevated }}>
          {METRICS.map((m) => (
            <MetricCard key={m.label} metric={m} phase={phase} />
          ))}
        </div>

        <div
          className="border-l-2 pl-6 py-1 transition-all duration-1000"
          style={{ borderColor: phase === 'resolved' ? '#22C55E' : colors.border, opacity: phase === 'resolved' ? 1 : 0.2 }}
        >
          <p
            className="text-xs tracking-[0.15em] uppercase mb-2 font-medium"
            style={{ fontFamily: 'Bricolage Grotesque, sans-serif', color: '#22C55E' }}
          >
            Architecture response
          </p>
          <p className="text-sm leading-relaxed" style={{ color: colors.muted, fontFamily: 'Inter, sans-serif' }}>
            Circuit breakers tripped. Queue consumers scaled to 24 instances. Read replicas absorbed DB load.
            Cache warmed. Post-mortem scheduled.
          </p>
        </div>
      </div>
    </section>
  );
}
