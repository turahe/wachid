import { useEffect, useRef, useState } from 'react';
import { useThemeColor } from '../context/useTheme';

const STEPS = [
  {
    id: 'requirement',
    label: 'Requirement',
    description: 'Natural-language task enters the system. Context is loaded from codebase, docs, and history.',
    artifact: '> Add rate limiting to the payment API\n  Context: 1,240 relevant tokens loaded\n  Scope: payment-service/src/routes/*.ts',
    color: '#00C8E8',
  },
  {
    id: 'context',
    label: 'Context',
    description: 'Agent reads affected code, understands existing patterns, constraints, and dependencies.',
    artifact: 'Reading: PaymentController.ts\nReading: RateLimiter.middleware.ts\nReading: redis.client.ts\nPattern: sliding-window in AuthService',
    color: '#00C8E8',
  },
  {
    id: 'architecture',
    label: 'Architecture',
    description: 'Agent proposes a solution aligned with the existing architecture — not a generic answer.',
    artifact: 'Proposed approach:\n  ① Extend existing RateLimiter middleware\n  ② payment limits: 10 req/min per userId\n  ③ Redis sliding-window (already in infra)\n  ④ 429 response with Retry-After header',
    color: '#8B5CF6',
  },
  {
    id: 'implementation',
    label: 'Implementation',
    description: 'Code generated matching the project\'s TypeScript conventions and style guide.',
    artifact: '// payment.route.ts\nrouter.post(\'/charge\',\n  rateLimiter({ key: \'payment\', max: 10 }),\n  validatePayload(ChargeSchema),\n  PaymentController.charge\n);',
    color: '#8B5CF6',
  },
  {
    id: 'test',
    label: 'Test',
    description: 'Tests generated covering success path, rate-limit breach, and edge cases.',
    artifact: "describe('payment rate limiter', () => {\n  it('allows 10 requests/min', ...)\n  it('returns 429 on 11th', ...)\n  it('resets after window', ...)\n});",
    color: '#F59E0B',
  },
  {
    id: 'observation',
    label: 'Observation',
    description: 'Agent verifies by running tests, checking types, reviewing the diff for unintended changes.',
    artifact: '✓ 3 tests passed\n✓ tsc: 0 errors\n✓ Diff: 47 lines changed\n  No unrelated files modified\n  No regressions detected',
    color: '#22C55E',
  },
  {
    id: 'iteration',
    label: 'Iteration',
    description: 'PR opened. Review feedback triggers a new cycle — not a fresh start, a continuation.',
    artifact: 'PR #2847: Add payment rate limiting\nCI: ✓ all checks passed\n— "looks good, add burst allowance for retries"',
    color: '#22C55E',
  },
];

export default function AISection() {
  const ref = useRef<HTMLElement>(null);
  const [active, setActive] = useState(0);
  const [started, setStarted] = useState(false);
  const colors = useThemeColor();

  useEffect(() => {
    const obs = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) setStarted(true); },
      { threshold: 0.15 }
    );
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, []);

  useEffect(() => {
    if (!started) return;
    const interval = setInterval(() => setActive((a) => (a + 1) % STEPS.length), 2800);
    return () => clearInterval(interval);
  }, [started]);

  const step = STEPS[active];

  return (
    <section
      id="ai"
      ref={ref}
      className="relative min-h-screen flex flex-col justify-center py-32"
      style={{ background: colors.bg, borderTop: `1px solid ${colors.border}` }}
      aria-labelledby="ai-heading"
    >
      <div className="max-w-7xl mx-auto px-8 md:px-16 w-full">
        <p className="text-xs tracking-[0.2em] uppercase mb-6" style={{ color: colors.muted, fontFamily: 'Bricolage Grotesque, sans-serif' }}>
          06 — AI Engineering
        </p>
        <h2
          id="ai-heading"
          className="font-extrabold leading-[0.95] mb-6"
          style={{
            fontFamily: 'Bricolage Grotesque, sans-serif',
            fontSize: 'clamp(2.5rem, 5vw, 4.5rem)',
            letterSpacing: '-0.03em',
            color: colors.text,
          }}
        >
          AI as a collaborator,
          <br />
          not magic.
        </h2>
        <p className="text-lg leading-relaxed mb-16" style={{ color: colors.muted, fontFamily: 'Inter, sans-serif', fontWeight: 300, maxWidth: '34rem' }}>
          AI-assisted development compresses the loop between intent and implementation —
          while keeping a human in control of every decision that matters.
        </p>

        <div className="grid lg:grid-cols-2 gap-12 items-start">
          {/* Steps */}
          <div className="flex flex-col" role="list">
            {STEPS.map((s, i) => (
              <button
                key={s.id}
                role="listitem"
                onClick={() => setActive(i)}
                className="flex items-start gap-5 py-5 text-left transition-all duration-300 border-t group"
                  style={{ borderColor: colors.elevated }}
                  aria-current={i === active}
                >
                <div className="flex flex-col items-center gap-1 mt-1.5 flex-shrink-0">
                  <div
                    className="w-1.5 h-1.5 rounded-full transition-all duration-300"
                    style={{ background: i === active ? s.color : colors.border }}
                  />
                </div>
                <div>
                  <p
                    className="text-xs tracking-[0.1em] uppercase font-semibold mb-1.5 transition-colors"
                    style={{
                      fontFamily: 'Bricolage Grotesque, sans-serif',
                      color: i === active ? s.color : colors.muted,
                    }}
                  >
                    {s.label}
                  </p>
                  <p
                    className="text-sm leading-relaxed transition-colors"
                    style={{ fontFamily: 'Inter, sans-serif', color: i === active ? colors.textSecondary : colors.border }}
                  >
                    {s.description}
                  </p>
                </div>
              </button>
            ))}
            <div className="border-t" style={{ borderColor: colors.elevated }} />
          </div>

          {/* Artifact */}
          <div className="sticky top-24 border" style={{ borderColor: colors.border, background: colors.surface, transition: 'background-color 0.3s ease, border-color 0.3s ease' }}>
            <div
              className="flex items-center gap-3 px-6 py-4 border-b"
              style={{ borderColor: colors.border }}
            >
              <div className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: step.color }} />
              <span
                className="text-[10px] tracking-[0.2em] uppercase font-medium"
                style={{ fontFamily: 'Bricolage Grotesque, sans-serif', color: step.color }}
              >
                Agent — {step.label}
              </span>
            </div>
            <div className="p-8">
              <pre
                className="text-xs leading-relaxed whitespace-pre-wrap"
                style={{ fontFamily: 'JetBrains Mono, monospace', color: colors.textSecondary, minHeight: '160px' }}
              >
                <code>{step.artifact}</code>
              </pre>
            </div>
            <div className="px-6 py-4 border-t flex gap-1" style={{ borderColor: colors.border }}>
              {STEPS.map((s, i) => (
                <div
                  key={s.id}
                  className="flex-1 h-px transition-all duration-500"
                  style={{ background: i <= active ? s.color : colors.border }}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
