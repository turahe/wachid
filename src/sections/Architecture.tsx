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
      className="relative min-h-screen flex flex-col justify-center py-32 bg-token-bg border-t-token transition-theme"
      aria-labelledby="arch-heading"
    >
      <div className="max-w-7xl mx-auto px-8 md:px-16 w-full">
        <p className="eyebrow mb-6">
          04 — Architecture
        </p>
        <h2
          id="arch-heading"
          className="section-heading text-token mb-6"
        >
          Architecture is
          <br />
          controlled complexity.
        </h2>
        <p className="body-copy text-base mb-12 max-w-xl">
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
                    className="cursor-pointer"
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
            className="border border-token bg-token-surface transition-theme min-h-[320px]"
          >
            {selected ? (
              <>
                <div
                  className="px-6 py-4 border-b border-token flex items-center justify-between"
                >
                  <span
                    className="font-display text-xs tracking-[0.15em] uppercase font-semibold"
                    style={{ color: selected.color }}
                  >
                    {selected.label}
                  </span>
                  <button
                    onClick={() => setSelected(null)}
                    className="text-token-muted text-xs transition-colors hover:text-token"
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
                      <p className="eyebrow-tight mb-2">
                        {label}
                      </p>
                      <p className="body-copy text-sm">
                        {value}
                      </p>
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <div className="flex items-center justify-center h-full min-h-[320px]">
                <p
                  className="font-display text-xs tracking-[0.2em] text-center"
                  style={{ color: colors.border }}
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
