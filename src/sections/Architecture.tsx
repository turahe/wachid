import { useState } from 'react';
import { useThemeColor } from '../context/useTheme';

interface ArchNode {
  id: string;
  label: string;
  x: number;
  y: number;
  color: string;
  responsibility: string;
  tradeoffs: string;
  failureModes: string;
  tech: string;
}

const NODES: ArchNode[] = [
  {
    id: 'client', label: 'Client', x: 310, y: 32, color: '#00C8E8',
    responsibility: 'Presents UI and handles user interaction. Communicates exclusively through the API Gateway.',
    tradeoffs: 'SSR vs CSR. Hydration cost vs SEO. Bundle size vs capability.',
    failureModes: 'Network failure, stale cache, JS error boundary miss.',
    tech: 'React 19, Vite, TanStack Query',
  },
  {
    id: 'gateway', label: 'API Gateway', x: 310, y: 128, color: '#00C8E8',
    responsibility: 'Single entry point. Handles auth verification, rate limiting, routing, and request logging.',
    tradeoffs: 'Adds latency but eliminates direct service coupling. Centralizes cross-cutting concerns.',
    failureModes: 'SPOF risk. Mitigated by multiple instances behind a load balancer.',
    tech: 'Kong / AWS API Gateway, JWT, Redis rate-limit',
  },
  {
    id: 'service', label: 'Core Service', x: 310, y: 240, color: '#8B5CF6',
    responsibility: 'Owns domain logic. Coordinates reads from cache, writes to database, and emits events to the queue.',
    tradeoffs: 'Monolith for simplicity vs microservices for independent scaling.',
    failureModes: 'Unhandled exception propagation, missing circuit breaker, thundering herd on cache miss.',
    tech: 'Node.js, TypeScript, Fastify',
  },
  {
    id: 'cache', label: 'Cache', x: 140, y: 352, color: '#F59E0B',
    responsibility: 'Serves hot data with sub-millisecond reads. Reduces database load by 80% under normal conditions.',
    tradeoffs: 'Stale data risk. Write-through vs cache-aside. Eviction policy selection.',
    failureModes: 'Cache stampede on miss, eviction under memory pressure, replication lag.',
    tech: 'Redis 7 (clustered), LRU eviction, 24h TTL',
  },
  {
    id: 'queue', label: 'Queue', x: 480, y: 352, color: '#F59E0B',
    responsibility: 'Decouples producers from consumers. Buffers spikes and enables async processing.',
    tradeoffs: 'Eventual consistency. At-least-once delivery requires idempotent consumers.',
    failureModes: 'Queue depth unbounded growth, consumer lag, duplicate message processing.',
    tech: 'AWS SQS, dead-letter queue, visibility timeout 30s',
  },
  {
    id: 'db', label: 'Database', x: 140, y: 464, color: '#00C8E8',
    responsibility: 'Source of truth. Handles ACID transactions, relational integrity, and durable persistence.',
    tradeoffs: 'Read replicas for scaling reads. Connection pooling to prevent saturation.',
    failureModes: 'Connection pool exhaustion, slow query lock contention, replica lag.',
    tech: 'PostgreSQL 16, RDS Multi-AZ, PgBouncer',
  },
  {
    id: 'worker', label: 'Worker', x: 480, y: 464, color: '#8B5CF6',
    responsibility: 'Processes async jobs from the queue. Handles email, webhooks, report generation, and batch tasks.',
    tradeoffs: 'Horizontal scaling. Idempotency keys for safe retries. Exponential backoff.',
    failureModes: 'Infinite retry loop, resource leak on long-running tasks, DLQ overflow.',
    tech: 'Node.js worker pool, Bull, AWS ECS Fargate',
  },
];

const EDGES: [string, string][] = [
  ['client', 'gateway'], ['gateway', 'service'],
  ['service', 'cache'], ['service', 'queue'], ['service', 'db'],
  ['cache', 'db'], ['queue', 'worker'],
];

const W = 620, H = 560;
function getNode(id: string) { return NODES.find((n) => n.id === id)!; }

export default function Architecture() {
  const [selected, setSelected] = useState<ArchNode | null>(null);
  const colors = useThemeColor();

  return (
    <section
      id="architecture"
      className="relative min-h-screen flex flex-col justify-center py-32"
      style={{ background: colors.bg, borderTop: `1px solid ${colors.border}` }}
      aria-labelledby="arch-heading"
    >
      <div className="max-w-7xl mx-auto px-8 md:px-16 w-full">
        <p className="text-xs tracking-[0.2em] uppercase mb-6" style={{ color: colors.muted, fontFamily: 'Bricolage Grotesque, sans-serif' }}>
          04 — Architecture
        </p>
        <h2
          id="arch-heading"
          className="font-extrabold leading-[0.95] mb-6"
          style={{
            fontFamily: 'Bricolage Grotesque, sans-serif',
            fontSize: 'clamp(2.5rem, 5vw, 4.5rem)',
            letterSpacing: '-0.03em',
            color: colors.text,
          }}
        >
          Architecture is
          <br />
          controlled complexity.
        </h2>
        <p className="text-base mb-12" style={{ color: colors.muted, fontFamily: 'Inter, sans-serif', maxWidth: '36rem' }}>
          Select any node to inspect its responsibility, tradeoffs, and failure modes.
        </p>

        <div className="grid lg:grid-cols-2 gap-12 items-start">
          {/* Graph */}
          <div className="overflow-x-auto">
            <svg
              viewBox={`0 0 ${W} ${H}`}
              width="100%"
              className="max-w-[620px]"
              role="img"
              aria-label="System architecture diagram"
            >
              {EDGES.map(([a, b]) => {
                const na = getNode(a), nb = getNode(b);
                const isActive = selected?.id === a || selected?.id === b;
                return (
                  <line
                    key={`${a}-${b}`}
                    x1={na.x} y1={na.y + 18} x2={nb.x} y2={nb.y + 18}
                    stroke={isActive ? colors.system : colors.border}
                    strokeWidth={isActive ? 1 : 1}
                    strokeDasharray={isActive ? '3 3' : undefined}
                    opacity={isActive ? 0.7 : 0.6}
                  />
                );
              })}

              {NODES.map((node) => {
                const isSel = selected?.id === node.id;
                return (
                  <g
                    key={node.id}
                    transform={`translate(${node.x - 56}, ${node.y})`}
                    style={{ cursor: 'pointer' }}
                    onClick={() => setSelected(isSel ? null : node)}
                    role="button"
                    tabIndex={0}
                    aria-label={`${node.label}`}
                    aria-pressed={isSel}
                    data-cursor="arch-node"
                    onKeyDown={(e) => e.key === 'Enter' && setSelected(isSel ? null : node)}
                  >
                    <rect
                      width={112} height={36} rx={1}
                      fill={isSel ? node.color + '18' : colors.surface}
                      stroke={isSel ? node.color : colors.border}
                      strokeWidth={1}
                    />
                    <text
                      x={56} y={22}
                      textAnchor="middle"
                      fill={isSel ? node.color : colors.textSecondary}
                      fontSize={10}
                      fontFamily="Bricolage Grotesque, sans-serif"
                      letterSpacing={0.5}
                      fontWeight={isSel ? 600 : 400}
                    >
                      {node.label.toUpperCase()}
                    </text>
                  </g>
                );
              })}
            </svg>
          </div>

          {/* Inspector */}
          <div
            className="border min-h-[320px]"
            style={{ borderColor: colors.border, background: colors.surface, transition: 'background-color 0.3s ease, border-color 0.3s ease' }}
          >
            {selected ? (
              <>
                <div
                  className="px-6 py-4 border-b flex items-center justify-between"
                  style={{ borderColor: colors.border }}
                >
                  <span
                    className="text-xs tracking-[0.15em] uppercase font-semibold"
                    style={{ fontFamily: 'Bricolage Grotesque, sans-serif', color: selected.color }}
                  >
                    {selected.label}
                  </span>
                  <button
                    onClick={() => setSelected(null)}
                    className="text-xs transition-colors hover:text-[#F5F5F5]"
                    style={{ color: colors.muted }}
                    aria-label="Close inspector"
                  >
                    ✕
                  </button>
                </div>
                <div className="px-6 py-6 flex flex-col gap-6">
                  {[
                    { label: 'Responsibility', value: selected.responsibility },
                    { label: 'Tradeoffs', value: selected.tradeoffs },
                    { label: 'Failure Modes', value: selected.failureModes },
                    { label: 'Implementation', value: selected.tech },
                  ].map(({ label, value }) => (
                    <div key={label}>
                      <p
                        className="text-[10px] tracking-[0.15em] uppercase mb-2"
                        style={{ fontFamily: 'Bricolage Grotesque, sans-serif', color: colors.muted }}
                      >
                        {label}
                      </p>
                      <p className="text-sm leading-relaxed" style={{ color: colors.textSecondary, fontFamily: 'Inter, sans-serif' }}>
                        {value}
                      </p>
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <div className="flex items-center justify-center h-full min-h-[320px]">
                <p
                  className="text-xs tracking-[0.2em] text-center"
                  style={{ fontFamily: 'Bricolage Grotesque, sans-serif', color: colors.border }}
                >
                  SELECT A NODE
                  <br />
                  TO INSPECT
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
