import { useEffect, useRef, useState } from 'react';
import { useThemeColor } from '../context/useTheme';

const LAYERS = [
  {
    label: 'Function',
    code: 'async function processOrder(id: string) {\n  const order = await db.find(id);\n  return order.execute();\n}',
    description: 'A single operation in isolation. The smallest unit of intent.',
    color: '#00C8E8',
  },
  {
    label: 'Module',
    code: 'OrderService\n  ├─ processOrder()\n  ├─ validateOrder()\n  └─ notifyCustomer()',
    description: 'Related logic grouped into a coherent unit with a defined responsibility.',
    color: '#00C8E8',
  },
  {
    label: 'Service',
    code: 'OrderService  ←→  InventoryService\n                ↕\n           PaymentService',
    description: 'Services communicating over defined contracts. Boundaries become visible.',
    color: '#8B5CF6',
  },
  {
    label: 'API',
    code: 'POST /orders\nGET  /orders/:id\nPUT  /orders/:id/status\nDEL  /orders/:id',
    description: 'A surface exposed to the outside world. Every endpoint is a promise.',
    color: '#8B5CF6',
  },
  {
    label: 'Database',
    code: 'orders          order_items\n───────────     ───────────\nid (PK)    ←─── order_id (FK)\nstatus          product_id\ncreated_at      quantity',
    description: 'Persistent state that outlives the process. Schema is architecture.',
    color: '#8B5CF6',
  },
  {
    label: 'Queue',
    code: '[ order.created ] → Worker\n[ order.paid    ] → Fulfillment\n[ order.shipped ] → Notification',
    description: 'Async decoupling for resilience and throughput. Time becomes negotiable.',
    color: '#F59E0B',
  },
  {
    label: 'Infrastructure',
    code: 'Kubernetes → Pod (OrderService ×3)\n           → Pod (Worker ×8)\nTerraform  → RDS · ElastiCache · SQS',
    description: 'The environment that makes everything run. Code as configuration.',
    color: '#F59E0B',
  },
];

export default function CodeToSystem() {
  const ref = useRef<HTMLElement>(null);
  const [active, setActive] = useState(0);
  const [started, setStarted] = useState(false);
  const colors = useThemeColor();

  useEffect(() => {
    const obs = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) setStarted(true); },
      { threshold: 0.2 }
    );
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, []);

  useEffect(() => {
    if (!started) return;
    const interval = setInterval(() => setActive((l) => (l + 1) % LAYERS.length), 2400);
    return () => clearInterval(interval);
  }, [started]);

  const layer = LAYERS[active];

  return (
    <section
      id="codesystem"
      ref={ref}
      className="relative min-h-screen flex flex-col justify-center py-32 bg-token-bg border-t-token transition-theme"
      aria-labelledby="codesystem-heading"
    >
      <div className="max-w-7xl mx-auto px-8 md:px-16 w-full">
        <div className="grid lg:grid-cols-2 gap-20 items-center">

          {/* Left */}
          <div>
            <p className="eyebrow mb-6">
              02 — Code to System
            </p>
            <h2
              id="codesystem-heading"
              className="section-heading text-token mb-8"
            >
              Code is only one
              <br />
              part of the system.
            </h2>
            <p className="body-copy text-lg mb-12 max-w-md">
              Every function lives inside a stack that spans from a few lines to an entire
              cloud. Understanding that context changes every decision.
            </p>

            {/* Layer selector */}
            <div className="flex flex-col" role="tablist" aria-label="System layers">
              {LAYERS.map((l, i) => (
                <button
                  key={l.label}
                  role="tab"
                  aria-selected={i === active}
                  onClick={() => setActive(i)}
                  className="flex items-center gap-4 py-3 text-left transition-all duration-300 group border-t border-token-elevated transition-theme"
                >
                  <span
                    className="w-1 h-1 rounded-full flex-shrink-0 transition-all duration-300"
                    style={{ background: i === active ? l.color : colors.border }}
                  />
                  <span
                    className="font-display text-xs tracking-[0.1em] uppercase font-medium transition-colors duration-300"
                    style={{ color: i === active ? l.color : colors.muted }}
                  >
                    {l.label}
                  </span>
                  {i < active && (
                    <span className="text-[10px]" style={{ color: colors.border }}>✓</span>
                  )}
                </button>
              ))}
              <div className="border-t border-token-elevated" />
            </div>
          </div>

          {/* Right: code panel */}
          <div
            className="border border-token bg-token-surface transition-theme"
            role="tabpanel"
          >
            <div
              className="flex items-center justify-between px-6 py-4 border-b border-token"
            >
              <span
                className="font-display text-xs tracking-[0.15em] uppercase font-medium"
                style={{ color: layer.color }}
              >
                {layer.label}
              </span>
              <div className="flex gap-1">
                {LAYERS.map((_, i) => (
                  <span
                    key={i}
                    className="block transition-all duration-300"
                    style={{
                      width: i === active ? 16 : 4,
                      height: 2,
                      background: i === active ? layer.color : colors.border,
                      borderRadius: 1,
                    }}
                  />
                ))}
              </div>
            </div>

            <div className="p-8">
              <pre
                className="code-block text-sm leading-loose overflow-x-auto min-h-[120px]"
              >
                <code style={{ color: layer.color }}>{layer.code}</code>
              </pre>
            </div>

            <div
              className="px-8 py-5 border-t border-token"
            >
              <p className="body-copy text-sm">
                {layer.description}
              </p>
            </div>

            {/* Progress */}
            <div className="progress-track">
              <div
                className="h-full transition-all duration-300"
                style={{ width: `${((active + 1) / LAYERS.length) * 100}%`, background: layer.color }}
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
