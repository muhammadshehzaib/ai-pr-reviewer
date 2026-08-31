import Link from 'next/link';
import { Cpu, ArrowLeft, CheckCircle2, ShieldCheck, Zap, Sparkles } from 'lucide-react';
import { BACKEND_URL } from '../../lib/api';

export const metadata = {
  title: 'Pricing — Aeon AI PR Reviewer',
  description: 'Simple, transparent pricing for Aeon AI PR Reviewer. Free forever for open-source with affordable Indie and Team tiers.',
};

export default function PricingPage() {
  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <header className="landing-nav">
        <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
          <Cpu size={20} strokeWidth={2.25} color="var(--accent)" />
          <span style={{ fontWeight: 700, fontSize: '1.05rem' }}>Aeon</span>
        </Link>
        <Link href="/" className="btn-secondary" style={{ fontSize: '0.85rem', display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
          <ArrowLeft size={14} /> Back to Home
        </Link>
      </header>

      <main style={{ maxWidth: 1040, margin: '0 auto', padding: '4rem 1.5rem 6rem', textAlign: 'center' }}>
        <div className="badge-pill">
          <Sparkles size={14} />
          <span>GitHub Marketplace Billing</span>
        </div>

        <h1 style={{ fontSize: '2.75rem', marginBottom: '0.75rem' }}>
          Predictable Pricing for Developers & Teams
        </h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '1.05rem', maxWidth: 580, margin: '0 auto 3rem' }}>
          Start free on your open-source repositories and upgrade whenever your private review volume scales.
        </p>

        <div className="pricing-grid">
          {/* Free */}
          <div className="pricing-card">
            <h3 style={{ fontSize: '1.25rem', marginBottom: '0.5rem' }}>Free Plan</h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginBottom: '1.5rem' }}>
              For open-source projects and solo developers.
            </p>
            <div style={{ fontSize: '2.5rem', fontWeight: 800, marginBottom: '1.5rem' }}>
              $0 <span style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', fontWeight: 400 }}>/ forever</span>
            </div>

            <a href={`${BACKEND_URL}/api/auth/github`} className="btn-secondary" style={{ textAlign: 'center', marginBottom: '2rem' }}>
              Start for Free
            </a>

            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.75rem', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
              <li style={{ display: 'flex', gap: '0.5rem' }}><CheckCircle2 size={16} color="var(--success)" /> Unlimited Public Repositories</li>
              <li style={{ display: 'flex', gap: '0.5rem' }}><CheckCircle2 size={16} color="var(--success)" /> 50 Private Reviews / month</li>
              <li style={{ display: 'flex', gap: '0.5rem' }}><CheckCircle2 size={16} color="var(--success)" /> .aipr.yml Configuration</li>
              <li style={{ display: 'flex', gap: '0.5rem' }}><CheckCircle2 size={16} color="var(--success)" /> Bring Your Own AI Key (Vault)</li>
            </ul>
          </div>

          {/* Indie */}
          <div className="pricing-card pricing-card-featured">
            <div style={{ position: 'absolute', top: -12, right: 20, background: 'var(--accent)', color: '#fff', fontSize: '0.72rem', fontWeight: 700, padding: '0.2rem 0.6rem', borderRadius: '9999px' }}>
              MOST POPULAR
            </div>
            <h3 style={{ fontSize: '1.25rem', marginBottom: '0.5rem' }}>Indie Plan</h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginBottom: '1.5rem' }}>
              For professional solo devs shipping private code daily.
            </p>
            <div style={{ fontSize: '2.5rem', fontWeight: 800, marginBottom: '1.5rem' }}>
              $6 <span style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', fontWeight: 400 }}>/ month</span>
            </div>

            <a href="https://github.com/marketplace/ai-pr-reviewer" target="_blank" rel="noreferrer" className="btn-primary" style={{ textAlign: 'center', marginBottom: '2rem' }}>
              Subscribe on GitHub
            </a>

            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.75rem', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
              <li style={{ display: 'flex', gap: '0.5rem' }}><CheckCircle2 size={16} color="var(--accent)" /> <strong>Unlimited</strong> Private Reviews</li>
              <li style={{ display: 'flex', gap: '0.5rem' }}><CheckCircle2 size={16} color="var(--accent)" /> Unlimited Public Reviews</li>
              <li style={{ display: 'flex', gap: '0.5rem' }}><CheckCircle2 size={16} color="var(--accent)" /> Priority Background Processing</li>
              <li style={{ display: 'flex', gap: '0.5rem' }}><CheckCircle2 size={16} color="var(--accent)" /> Multi-Model AI Engine</li>
              <li style={{ display: 'flex', gap: '0.5rem' }}><CheckCircle2 size={16} color="var(--accent)" /> Email & GitHub Support</li>
            </ul>
          </div>

          {/* Team */}
          <div className="pricing-card">
            <h3 style={{ fontSize: '1.25rem', marginBottom: '0.5rem' }}>Team Plan</h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginBottom: '1.5rem' }}>
              For organizations with multiple engineers and repositories.
            </p>
            <div style={{ fontSize: '2.5rem', fontWeight: 800, marginBottom: '1.5rem' }}>
              $12 <span style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', fontWeight: 400 }}>/ user / mo</span>
            </div>

            <a href="https://github.com/marketplace/ai-pr-reviewer" target="_blank" rel="noreferrer" className="btn-secondary" style={{ textAlign: 'center', marginBottom: '2rem' }}>
              Upgrade Organization
            </a>

            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.75rem', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
              <li style={{ display: 'flex', gap: '0.5rem' }}><CheckCircle2 size={16} color="var(--success)" /> Everything in Indie Plan</li>
              <li style={{ display: 'flex', gap: '0.5rem' }}><CheckCircle2 size={16} color="var(--success)" /> Org-Wide Installation</li>
              <li style={{ display: 'flex', gap: '0.5rem' }}><CheckCircle2 size={16} color="var(--success)" /> Shared Invoicing & Seat Pooling</li>
              <li style={{ display: 'flex', gap: '0.5rem' }}><CheckCircle2 size={16} color="var(--success)" /> Dedicated Review Queue Fleet</li>
            </ul>
          </div>
        </div>
      </main>
    </div>
  );
}
