'use client';

import { ShieldCheck, Zap, Lock, Bug, Cpu, CheckCircle2, ArrowRight } from 'lucide-react';

interface AuditCardProps {
  category: string;
  badgeColor: string;
  badgeBg: string;
  title: string;
  repo: string;
  pr: string;
  icon: typeof ShieldCheck;
  diffBefore: string;
  diffAfter: string;
  botComment: string;
}

const SHOWCASE_ITEMS: AuditCardProps[] = [
  {
    category: 'CRITICAL • SECURITY',
    badgeColor: '#dc2626',
    badgeBg: '#fef2f2',
    title: 'Timing Attack on HMAC Token',
    repo: 'acme/auth-service',
    pr: '#142',
    icon: ShieldCheck,
    diffBefore: '- return expected === given;',
    diffAfter: '+ return crypto.timingSafeEqual(exp, giv);',
    botComment: 'Standard comparison leaks string length via early return. Use timingSafeEqual to prevent side-channel attacks.',
  },
  {
    category: 'HIGH • PERFORMANCE',
    badgeColor: '#d97706',
    badgeBg: '#fffbeb',
    title: 'N+1 Database Query Cascade',
    repo: 'shopify-app/checkout',
    pr: '#89',
    icon: Zap,
    diffBefore: '- return repos.map(r => getCommits(r.id));',
    diffAfter: '+ return db.commits.findMany({ whereIn });',
    botComment: 'Async calls inside map() spawn 100+ separate round-trips. Batch fetch via single whereIn query.',
  },
  {
    category: 'CRITICAL • MEMORY',
    badgeColor: '#dc2626',
    badgeBg: '#fef2f2',
    title: 'Unbounded Event Listener Leak',
    repo: 'stream/websocket-gateway',
    pr: '#314',
    icon: Bug,
    diffBefore: '- socket.on("data", handleChunk);',
    diffAfter: '+ socket.once("data", handleChunk);',
    botComment: 'Missing cleanup on client disconnect retains circular closure in V8 heap, causing OOM crash under load.',
  },
  {
    category: 'HIGH • TYPE SAFETY',
    badgeColor: '#2563eb',
    badgeBg: '#eff6ff',
    title: 'Silent Null Pointer Exception',
    repo: 'stripe/payment-router',
    pr: '#402',
    icon: Lock,
    diffBefore: '- const balance = account.wallet.balance;',
    diffAfter: '+ const balance = account.wallet?.balance ?? 0;',
    botComment: 'Optional wallet object is unpopulated on guest checkouts. Optional chaining prevents fatal runtime crash.',
  },
  {
    category: 'CRITICAL • INJECTION',
    badgeColor: '#dc2626',
    badgeBg: '#fef2f2',
    title: 'Raw SQL Interpolation Risk',
    repo: 'enterprise/billing-api',
    pr: '#771',
    icon: ShieldCheck,
    diffBefore: '- db.raw(`SELECT * FROM users WHERE id=${id}`);',
    diffAfter: '+ db.raw("SELECT * FROM users WHERE id=?", [id]);',
    botComment: 'Unsanitized user ID in raw SQL query creates high-severity SQL injection vector. Parameterized binding applied.',
  },
  {
    category: 'MEDIUM • ARCHITECTURE',
    badgeColor: '#7c3aed',
    badgeBg: '#f5f3ff',
    title: 'Missing Idempotency Key',
    repo: 'fintech/ledger-worker',
    pr: '#512',
    icon: Zap,
    diffBefore: '- await chargeCustomer(order.amount);',
    diffAfter: '+ await chargeCustomer(order.amount, { key: order.id });',
    botComment: 'Network retry on webhook timeout will double-charge customer without unique idempotency token.',
  },
];

export function MarqueeShowcase() {
  return (
    <section style={{ position: 'relative', width: '100%', overflow: 'hidden', padding: '3rem 0 4rem' }}>
      <div className="marquee-container">
        <div className="marquee-track">
          {/* First set */}
          {SHOWCASE_ITEMS.map((item, idx) => (
            <ShowcaseCard key={`item-a-${idx}`} item={item} />
          ))}
          {/* Duplicate set for infinite loop */}
          {SHOWCASE_ITEMS.map((item, idx) => (
            <ShowcaseCard key={`item-b-${idx}`} item={item} />
          ))}
        </div>
      </div>
    </section>
  );
}

function ShowcaseCard({ item }: { item: AuditCardProps }) {
  const Icon = item.icon;
  return (
    <div className="marquee-card">
      {/* Card Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
        <span
          style={{
            fontSize: '0.7rem',
            fontWeight: 700,
            padding: '2px 8px',
            borderRadius: 9999,
            color: item.badgeColor,
            background: item.badgeBg,
            letterSpacing: '0.04em',
          }}
        >
          {item.category}
        </span>
        <span className="mono" style={{ fontSize: '0.72rem', color: '#94a3b8' }}>
          {item.pr}
        </span>
      </div>

      {/* Title & Repo */}
      <h3
        style={{
          fontSize: '0.98rem',
          fontWeight: 700,
          color: '#0f172a',
          marginBottom: '0.25rem',
          lineHeight: 1.3,
        }}
      >
        {item.title}
      </h3>
      <div className="mono" style={{ fontSize: '0.75rem', color: '#64748b', marginBottom: '0.85rem' }}>
        {item.repo}
      </div>

      {/* Mini Code Diff Window */}
      <div
        style={{
          background: '#090d16',
          borderRadius: 10,
          padding: '0.75rem',
          marginBottom: '0.85rem',
          fontSize: '0.75rem',
          fontFamily: 'var(--font-jetbrains), monospace',
          overflow: 'hidden',
        }}
      >
        <div style={{ color: '#f87171', background: 'rgba(239, 68, 68, 0.1)', padding: '2px 4px', borderRadius: 4, marginBottom: 4, wordBreak: 'break-all' }}>
          {item.diffBefore}
        </div>
        <div style={{ color: '#34d399', background: 'rgba(16, 185, 129, 0.1)', padding: '2px 4px', borderRadius: 4, wordBreak: 'break-all' }}>
          {item.diffAfter}
        </div>
      </div>

      {/* AI Bot Insight Footer */}
      <div
        style={{
          marginTop: 'auto',
          display: 'flex',
          gap: '0.6rem',
          alignItems: 'flex-start',
          background: '#f8fafc',
          padding: '0.65rem 0.75rem',
          borderRadius: 8,
          border: '1px solid rgba(0,0,0,0.04)',
        }}
      >
        <div
          style={{
            width: 20,
            height: 20,
            borderRadius: '50%',
            background: 'linear-gradient(135deg, #007fff 0%, #1211ff 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#fff',
            flexShrink: 0,
            marginTop: 2,
          }}
        >
          <Cpu size={12} />
        </div>
        <p
          style={{
            fontSize: '0.76rem',
            color: '#475569',
            lineHeight: 1.4,
            margin: 0,
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
          }}
        >
          {item.botComment}
        </p>
      </div>
    </div>
  );
}
