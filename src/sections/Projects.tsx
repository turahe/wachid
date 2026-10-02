import { useState } from 'react';
import { useThemeColor } from '../context/useTheme';

interface Project {
  id: string;
  name: string;
  index: string;
  year: string;
  tagline: string;
  problem: string;
  constraints: string[];
  architecture: string;
  result: string;
  metrics: { label: string; value: string }[];
  stack: string[];
  color: string;
}

const PROJECTS: Project[] = [
  {
    id: 'task-engine',
    index: '01',
    name: 'Distributed Task Engine',
    tagline: 'From blocking jobs to 50M async tasks per day.',
    year: '2024',
    problem: 'A SaaS platform ran batch data processing jobs synchronously inside API requests. As customer data grew, these jobs started timing out and blocking the request pool — cascading failures during peak hours.',
    constraints: [
      'Zero downtime migration — existing customers could not be disrupted',
      'Exactly-once semantics for billing-critical operations',
      'Workers scale independently from the API tier',
      'Stuck jobs detected within 30 seconds',
    ],
    architecture: 'Replaced blocking calls with an event-driven queue (SQS). Idempotency-key pattern for exactly-once guarantees. Worker pool with per-job-type concurrency limits. Supervisor process detecting and rescheduling stalled jobs. ECS Fargate for horizontal scaling.',
    result: 'API p95 latency dropped from 4.2s to 48ms. System processed 50M tasks per day at peak. Zero billing errors in 14 months of production. Worker pool scaled from 2 to 64 instances during traffic spikes — without engineering intervention.',
    metrics: [
      { label: 'API Latency p95', value: '4.2s → 48ms' },
      { label: 'Daily Volume', value: '50M tasks/day' },
      { label: 'Billing Errors', value: '0 in 14mo' },
      { label: 'Scale Range', value: '2× → 64×' },
    ],
    stack: ['Node.js', 'TypeScript', 'AWS SQS', 'ECS Fargate', 'PostgreSQL', 'Redis', 'Terraform'],
    color: '#00C8E8',
  },
  {
    id: 'ai-review',
    index: '02',
    name: 'AI Code Review Agent',
    tagline: 'An LLM that understands your codebase, not just your diff.',
    year: '2024',
    problem: 'A 40-person team had an average PR review time of 3.2 days. Senior engineers were reviewing 15+ PRs weekly. Trivial issues — missing error handling, inconsistent naming — consumed the same bandwidth as complex logic bugs.',
    constraints: [
      'Must not block merges — advisory, not gating',
      'LLM context limits required smart chunking of large PRs',
      'False positive rate below 8% to maintain engineer trust',
      'Cost per review under $0.04 to scale to all PRs',
    ],
    architecture: 'GitHub App triggered on PR open/update. Retrieves diff and relevant context via semantic similarity search (embeddings over codebase). Constructs structured prompt with project conventions and prior review patterns. Routes to Claude via streaming API. Posts findings as inline PR comments with severity.',
    result: 'PR review time fell to 11 hours. Senior engineers\' load reduced 40%. False positive rate: 5.8%. Processed 2,800 PRs in the first 6 months. Engineers called it "a junior engineer that actually reads the code."',
    metrics: [
      { label: 'Review Time', value: '3.2d → 11h' },
      { label: 'Senior Load', value: '−40%' },
      { label: 'False Positives', value: '5.8%' },
      { label: 'PRs Reviewed', value: '2,800 in 6mo' },
    ],
    stack: ['TypeScript', 'GitHub API', 'Anthropic Claude', 'pgvector', 'PostgreSQL', 'Fastify', 'AWS Lambda'],
    color: '#8B5CF6',
  },
  {
    id: 'analytics',
    index: '03',
    name: 'Real-Time Analytics Pipeline',
    tagline: 'Sub-second reporting on 800M events per day.',
    year: '2023',
    problem: 'Product analytics showed data 6–12 hours stale. The batch pipeline ran nightly, produced a 90-minute unavailability window, and failed regularly on spikes — requiring manual restarts at 3 AM.',
    constraints: [
      '800M events per day with sub-second end-to-end latency',
      'Aggregations queryable within 2 seconds at any granularity',
      'Budget cap: $4,000/month for the entire data pipeline',
      'Zero on-call escalations for pipeline failures',
    ],
    architecture: 'Replaced nightly batch with Kafka event streams. Stateless processors with micro-batching. Aggregations written to ClickHouse for OLAP queries. Pre-computed materialized views for common dashboard patterns. Self-healing consumer groups with automatic partition rebalancing.',
    result: 'Data freshness went from 12 hours to under 4 seconds. Dashboard queries at 340ms p99. Pipeline cost: $2,800/month. On-call escalations: 0 in 12 months. Product team could run A/B test analysis same-day.',
    metrics: [
      { label: 'Data Freshness', value: '12h → 4s' },
      { label: 'Query p99', value: '340ms' },
      { label: 'Monthly Cost', value: '$2,800 (cap $4k)' },
      { label: 'Escalations', value: '0 in 12mo' },
    ],
    stack: ['Go', 'Kafka', 'ClickHouse', 'PostgreSQL', 'Kubernetes', 'Grafana', 'Terraform'],
    color: '#F59E0B',
  },
];

export default function Projects() {
  const [selected, setSelected] = useState<Project>(PROJECTS[0]);
  const [tab, setTab] = useState<'problem' | 'architecture' | 'result'>('problem');
  const colors = useThemeColor();

  return (
    <section
      id="projects"
      className="relative min-h-screen flex flex-col justify-center py-32"
      style={{ background: colors.bg, borderTop: `1px solid ${colors.border}` }}
      aria-labelledby="projects-heading"
    >
      <div className="max-w-7xl mx-auto px-8 md:px-16 w-full">
        <p className="text-xs tracking-[0.2em] uppercase mb-6" style={{ color: colors.muted, fontFamily: 'Bricolage Grotesque, sans-serif' }}>
          07 — Projects
        </p>
        <h2
          id="projects-heading"
          className="font-extrabold leading-[0.95] mb-16"
          style={{
            fontFamily: 'Bricolage Grotesque, sans-serif',
            fontSize: 'clamp(2.5rem, 5vw, 4.5rem)',
            letterSpacing: '-0.03em',
            color: colors.text,
          }}
        >
          Problems solved.
          <br />
          Systems built.
        </h2>

        {/* Project switcher — large editorial rows */}
        <div className="flex flex-col border-t mb-12" style={{ borderColor: colors.border }}>
          {PROJECTS.map((p) => (
            <button
              key={p.id}
              onClick={() => { setSelected(p); setTab('problem'); }}
              data-cursor="project"
              className="flex items-center gap-8 py-6 border-b text-left group transition-all duration-300"
              style={{ borderColor: colors.border }}
              aria-pressed={selected.id === p.id}
            >
              <span
                className="text-xs font-medium flex-shrink-0 transition-colors"
                style={{ fontFamily: 'JetBrains Mono, monospace', color: selected.id === p.id ? p.color : colors.muted, width: '2rem' }}
              >
                {p.index}
              </span>
              <span
                className="font-semibold text-lg md:text-2xl leading-none flex-1 transition-colors duration-300"
                style={{
                  fontFamily: 'Bricolage Grotesque, sans-serif',
                  letterSpacing: '-0.02em',
                  color: selected.id === p.id ? '#F5F5F5' : '#4A4A4A',
                }}
              >
                {p.name}
              </span>
              <span
                className="text-sm hidden md:block flex-shrink-0 transition-colors"
                style={{ color: selected.id === p.id ? colors.textSecondary : colors.border, fontFamily: 'Inter, sans-serif', maxWidth: '20rem' }}
              >
                {p.tagline}
              </span>
              <span
                className="text-xs flex-shrink-0 transition-colors"
                style={{ fontFamily: 'JetBrains Mono, monospace', color: selected.id === p.id ? p.color : colors.border }}
              >
                {p.year}
              </span>
            </button>
          ))}
        </div>

        {/* Detail panel */}
        <div className="border" style={{ borderColor: colors.border, background: colors.surface, transition: 'background-color 0.3s ease, border-color 0.3s ease' }}>
          {/* Tabs */}
          <div className="flex border-b" style={{ borderColor: colors.border }}>
            {(['problem', 'architecture', 'result'] as const).map((t) => (
              <button
                key={t}
                onClick={() => setTab(t)}
                className="px-6 py-4 text-xs tracking-[0.1em] uppercase border-r transition-all duration-200"
                style={{
                  fontFamily: 'Bricolage Grotesque, sans-serif',
                  borderColor: colors.border,
                  color: tab === t ? selected.color : colors.muted,
                  background: tab === t ? colors.bg : 'transparent',
                  borderBottom: tab === t ? `2px solid ${selected.color}` : '2px solid transparent',
                  fontWeight: tab === t ? 600 : 400,
                }}
                role="tab"
                aria-selected={tab === t}
              >
                {t}
              </button>
            ))}
          </div>

          <div className="grid md:grid-cols-3">
            {/* Main */}
            <div className="md:col-span-2 p-8 border-r" style={{ borderColor: colors.border }}>
              {tab === 'problem' && (
                <div>
                  <p className="text-[10px] tracking-widest uppercase mb-4" style={{ fontFamily: 'Bricolage Grotesque, sans-serif', color: colors.muted }}>
                    The Problem
                  </p>
                  <p className="text-sm leading-relaxed mb-8" style={{ color: colors.textSecondary, fontFamily: 'Inter, sans-serif' }}>
                    {selected.problem}
                  </p>
                  <p className="text-[10px] tracking-widest uppercase mb-4" style={{ fontFamily: 'Bricolage Grotesque, sans-serif', color: colors.muted }}>
                    Constraints
                  </p>
                  <ul className="flex flex-col gap-3">
                    {selected.constraints.map((c) => (
                      <li key={c} className="flex items-start gap-3 text-sm" style={{ color: colors.muted, fontFamily: 'Inter, sans-serif' }}>
                        <span style={{ color: selected.color, flexShrink: 0, marginTop: '2px' }}>—</span>
                        {c}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              {tab === 'architecture' && (
                <div>
                  <p className="text-[10px] tracking-widest uppercase mb-4" style={{ fontFamily: 'Bricolage Grotesque, sans-serif', color: colors.muted }}>
                    Architecture Decision
                  </p>
                  <p className="text-sm leading-relaxed" style={{ color: colors.textSecondary, fontFamily: 'Inter, sans-serif' }}>
                    {selected.architecture}
                  </p>
                </div>
              )}
              {tab === 'result' && (
                <div>
                  <p className="text-[10px] tracking-widest uppercase mb-4" style={{ fontFamily: 'Bricolage Grotesque, sans-serif', color: colors.muted }}>
                    Outcome
                  </p>
                  <p className="text-sm leading-relaxed" style={{ color: colors.textSecondary, fontFamily: 'Inter, sans-serif' }}>
                    {selected.result}
                  </p>
                </div>
              )}
            </div>

            {/* Sidebar */}
            <div className="p-8 flex flex-col gap-8">
              <div>
                <p className="text-[10px] tracking-widest uppercase mb-4" style={{ fontFamily: 'Bricolage Grotesque, sans-serif', color: colors.muted }}>
                  Impact
                </p>
                <div className="flex flex-col gap-4">
                  {selected.metrics.map((m) => (
                    <div key={m.label}>
                      <p className="text-xs mb-1" style={{ color: colors.muted, fontFamily: 'Inter, sans-serif' }}>{m.label}</p>
                      <p
                        className="text-sm font-semibold"
                        style={{ fontFamily: 'JetBrains Mono, monospace', color: selected.color, letterSpacing: '-0.01em' }}
                      >
                        {m.value}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
              <div>
                <p className="text-[10px] tracking-widest uppercase mb-4" style={{ fontFamily: 'Bricolage Grotesque, sans-serif', color: colors.muted }}>
                  Stack
                </p>
                <div className="flex flex-wrap gap-2">
                  {selected.stack.map((s) => (
                    <span
                      key={s}
                      className="text-xs px-2.5 py-1 border"
                      style={{ fontFamily: 'Inter, sans-serif', color: colors.muted, borderColor: colors.border }}
                    >
                      {s}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
