'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Cpu,
  GitBranch,
  ShieldCheck,
  Activity,
  Key,
  Sliders,
  CheckCircle2,
  Lock,
  ArrowRight,
  ExternalLink,
  Sparkles,
  Zap,
} from 'lucide-react';
import { BACKEND_URL } from '../lib/api';
import { useAuth } from '../lib/useAuth';

export default function HomePage() {
  const router = useRouter();
  const { user, loading } = useAuth(false);
  const [activeTab, setActiveTab] = useState<'security' | 'performance'>('security');

  useEffect(() => {
    if (!loading && user) router.replace('/dashboard');
  }, [loading, user, router]);

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      {/* Sticky Top Navigation */}
      <header className="landing-nav">
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
          <Cpu size={20} strokeWidth={2.25} color="var(--accent)" />
          <span style={{ fontWeight: 700, fontSize: '1.05rem', letterSpacing: '-0.02em' }}>Aeon</span>
        </div>

        <nav style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', fontSize: '0.9rem' }}>
          <a href="#how-it-works" style={{ color: 'var(--text-secondary)' }}>How it Works</a>
          <a href="#features" style={{ color: 'var(--text-secondary)' }}>Features</a>
          <a href="#pricing" style={{ color: 'var(--text-secondary)' }}>Pricing</a>
          <Link href="/support" style={{ color: 'var(--text-secondary)' }}>Support</Link>
          <a
            href={`${BACKEND_URL}/api/auth/github`}
            className="btn-primary"
            style={{ fontSize: '0.85rem', padding: '0.45rem 1rem' }}
          >
            <GitBranch size={15} /> Sign In
          </a>
        </nav>
      </header>

      {/* Hero Section */}
      <main style={{ flex: 1 }}>
        <section style={{ maxWidth: 1080, margin: '0 auto', padding: '5rem 1.5rem 4rem', textAlign: 'center' }}>
          <div className="badge-pill">
            <Sparkles size={14} />
            <span>Multi-Tenant GitHub App • Free for Open Source & Indie Devs</span>
          </div>

          <h1
            style={{
              fontSize: 'clamp(2.5rem, 5.5vw, 4.25rem)',
              fontWeight: 800,
              letterSpacing: '-0.04em',
              lineHeight: 1.1,
              marginBottom: '1.5rem',
              maxWidth: 850,
              margin: '0 auto 1.5rem',
            }}
          >
            Automated AI Code Reviews on Every Pull Request
          </h1>

          <p
            style={{
              color: 'var(--text-secondary)',
              fontSize: 'clamp(1rem, 2vw, 1.2rem)',
              maxWidth: 620,
              margin: '0 auto 2.5rem',
              lineHeight: 1.6,
            }}
          >
            Catch critical vulnerabilities, memory leaks, and architectural flaws in seconds.
            Get instant inline comments posted directly to your GitHub PRs.
          </p>

          <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem', flexWrap: 'wrap' }}>
            <a
              href={`${BACKEND_URL}/api/auth/github`}
              className="btn-primary"
              style={{ fontSize: '0.95rem', padding: '0.75rem 1.75rem' }}
            >
              <GitBranch size={18} /> Install GitHub App
            </a>
            <a
              href="#demo"
              className="btn-secondary"
              style={{ fontSize: '0.95rem', padding: '0.75rem 1.5rem' }}
            >
              See Live Review Demo
            </a>
          </div>

          <div style={{ marginTop: '2rem', display: 'flex', justifyContent: 'center', gap: '2rem', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
            <span>✓ Unlimited Public Repos</span>
            <span>✓ 50 Free Private Reviews/Mo</span>
            <span>✓ Zero AI Training on Your Code</span>
          </div>
        </section>

        {/* Interactive Code Diff Demo Widget */}
        <section id="demo" style={{ maxWidth: 960, margin: '0 auto 6rem', padding: '0 1.5rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
            <span className="section-label">Live GitHub PR Preview</span>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <button
                onClick={() => setActiveTab('security')}
                className="btn-secondary"
                style={{
                  fontSize: '0.75rem',
                  padding: '0.3rem 0.75rem',
                  borderColor: activeTab === 'security' ? 'var(--accent)' : 'var(--border)',
                }}
              >
                Security Audit
              </button>
              <button
                onClick={() => setActiveTab('performance')}
                className="btn-secondary"
                style={{
                  fontSize: '0.75rem',
                  padding: '0.3rem 0.75rem',
                  borderColor: activeTab === 'performance' ? 'var(--accent)' : 'var(--border)',
                }}
              >
                Performance Audit
              </button>
            </div>
          </div>

          <div className="diff-preview-box">
            <div className="diff-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <span className="mono" style={{ color: 'var(--text-primary)', fontWeight: 600 }}>
                  {activeTab === 'security' ? 'src/services/auth.service.ts' : 'src/services/query.service.ts'}
                </span>
                <span style={{ color: 'var(--text-secondary)', fontSize: '0.75rem' }}>PR #42 — Add token verification</span>
              </div>
              <span className="badge" style={{ background: 'rgba(0, 153, 255, 0.15)', color: 'var(--accent)' }}>
                Aeon Bot Active
              </span>
            </div>

            {activeTab === 'security' ? (
              <div style={{ padding: '0.5rem 0' }}>
                <div className="diff-line"><span className="diff-line-num">24</span><span>  function verifySignature(expected: string, given: string) &#123;</span></div>
                <div className="diff-line diff-deleted"><span className="diff-line-num">25</span><span>-   return expected === given;</span></div>
                <div className="diff-line diff-added"><span className="diff-line-num">25</span><span>+   return Buffer.from(expected).equals(Buffer.from(given));</span></div>
                <div className="diff-line"><span className="diff-line-num">26</span><span>  &#125;</span></div>

                {/* Inline Bot Comment */}
                <div className="ai-review-comment">
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <Cpu size={15} color="var(--accent)" />
                      <strong style={{ fontSize: '0.85rem' }}>aeon-bot[bot]</strong>
                      <span className="badge" style={{ background: 'rgba(229, 72, 77, 0.2)', color: '#ff8588' }}>
                        CRITICAL • SECURITY
                      </span>
                    </div>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>reviewed 2s ago</span>
                  </div>

                  <p style={{ fontSize: '0.85rem', color: 'var(--text-primary)', marginBottom: '0.5rem' }}>
                    <strong>Timing Attack Vulnerability:</strong> Standard string equality or <code>Buffer.equals</code> terminates early on mismatch, allowing timing attacks against HMAC tokens.
                  </p>

                  <div className="mono" style={{ background: '#0a0b0e', padding: '0.5rem 0.75rem', borderRadius: '6px', fontSize: '0.78rem', color: '#55e6ab' }}>
                    + return crypto.timingSafeEqual(Buffer.from(expected), Buffer.from(given));
                  </div>
                </div>
              </div>
            ) : (
              <div style={{ padding: '0.5rem 0' }}>
                <div className="diff-line"><span className="diff-line-num">88</span><span>  async function fetchUserRepos(userId: string) &#123;</span></div>
                <div className="diff-line diff-added"><span className="diff-line-num">89</span><span>+   const repos = await prisma.repository.findMany(&#123; where: &#123; userId &#125; &#125;);</span></div>
                <div className="diff-line diff-added"><span className="diff-line-num">90</span><span>+   return repos.map(r =&gt; fetchAllCommits(r.id)); // N+1 Query</span></div>
                <div className="diff-line"><span className="diff-line-num">91</span><span>  &#125;</span></div>

                <div className="ai-review-comment">
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <Cpu size={15} color="var(--accent)" />
                      <strong style={{ fontSize: '0.85rem' }}>aeon-bot[bot]</strong>
                      <span className="badge" style={{ background: 'rgba(240, 177, 0, 0.2)', color: '#ffcd38' }}>
                        HIGH • PERFORMANCE
                      </span>
                    </div>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>reviewed just now</span>
                  </div>

                  <p style={{ fontSize: '0.85rem', color: 'var(--text-primary)', marginBottom: '0.5rem' }}>
                    <strong>N+1 Query Bottleneck:</strong> Executing async fetches inside <code>Array.map()</code> generates separate queries per repository. Batch retrieve commits using <code>include</code> or <code>whereIn</code>.
                  </p>
                </div>
              </div>
            )}
          </div>
        </section>

        {/* 3-Step Setup Section */}
        <section id="how-it-works" style={{ maxWidth: 1040, margin: '0 auto 6rem', padding: '0 1.5rem', textAlign: 'center' }}>
          <span className="section-label">Frictionless Workflow</span>
          <h2 style={{ fontSize: '2rem', marginTop: '0.5rem', marginBottom: '3rem' }}>
            Set Up in 60 Seconds
          </h2>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem' }}>
            <div className="glass-card" style={{ textAlign: 'left' }}>
              <div style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--accent)', marginBottom: '0.5rem' }}>01</div>
              <h3 className="card-title" style={{ marginBottom: '0.5rem' }}>Install the GitHub App</h3>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                Authorize the app with 1 click. Select personal repositories or entire company organizations.
              </p>
            </div>

            <div className="glass-card" style={{ textAlign: 'left' }}>
              <div style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--accent)', marginBottom: '0.5rem' }}>02</div>
              <h3 className="card-title" style={{ marginBottom: '0.5rem' }}>Configure Rules (.aipr.yml)</h3>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                Add an optional <code>.aipr.yml</code> file to ignore test files, lockfiles, or enforce team guidelines.
              </p>
            </div>

            <div className="glass-card" style={{ textAlign: 'left' }}>
              <div style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--accent)', marginBottom: '0.5rem' }}>03</div>
              <h3 className="card-title" style={{ marginBottom: '0.5rem' }}>Open a PR & Get Reviews</h3>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                Every pull request receives structured inline code reviews and discussion summaries within seconds.
              </p>
            </div>
          </div>
        </section>

        {/* Feature Grid */}
        <section id="features" style={{ maxWidth: 1040, margin: '0 auto 6rem', padding: '0 1.5rem', textAlign: 'center' }}>
          <span className="section-label">Enterprise-Grade Architecture</span>
          <h2 style={{ fontSize: '2rem', marginTop: '0.5rem', marginBottom: '3rem' }}>
            Engineered for High-Velocity Teams
          </h2>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem' }}>
            <FeatureBlock
              Icon={Key}
              title="Multi-Model Flexibility"
              description="Choose between Google Gemini, Anthropic Claude, OpenAI, or xAI Grok with effortless model switching."
            />
            <FeatureBlock
              Icon={ShieldCheck}
              title="AES-256 Encrypted Vault"
              description="User API keys are encrypted at rest with scrypt + AES-256-GCM. Plaintext keys only exist in RAM during job execution."
            />
            <FeatureBlock
              Icon={Sliders}
              title=".aipr.yml Repository Config"
              description="Fine-tune severity thresholds (low, medium, high, critical) and exclude generated files (dist/**, lockfiles)."
            />
            <FeatureBlock
              Icon={Activity}
              title="Real-Time Socket Streaming"
              description="Watch review execution live on your personal dashboard with BullMQ background queue telemetry."
            />
            <FeatureBlock
              Icon={Lock}
              title="Zero AI Model Training"
              description="Your proprietary code is never used to train or fine-tune public AI models. Guaranteed."
            />
            <FeatureBlock
              Icon={Zap}
              title="100% AGPL-3.0 Open Core"
              description="Auditable, transparent, and built on modern Next.js, Express, and PostgreSQL."
            />
          </div>
        </section>

        {/* Pricing Section */}
        <section id="pricing" style={{ maxWidth: 1040, margin: '0 auto 6rem', padding: '0 1.5rem', textAlign: 'center' }}>
          <span className="section-label">Transparent Pricing</span>
          <h2 style={{ fontSize: '2rem', marginTop: '0.5rem', marginBottom: '1rem' }}>
            Simple, Developer-Friendly Plans
          </h2>
          <p style={{ color: 'var(--text-secondary)', maxWidth: 500, margin: '0 auto 3rem' }}>
            Billed directly through GitHub Marketplace with automated tax handling and cancellation.
          </p>

          <div className="pricing-grid">
            {/* Free Plan */}
            <div className="pricing-card">
              <h3 style={{ fontSize: '1.25rem', marginBottom: '0.5rem' }}>Free Plan</h3>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginBottom: '1.5rem' }}>
                For open-source projects and solo side-project developers.
              </p>
              <div style={{ fontSize: '2.5rem', fontWeight: 800, marginBottom: '1.5rem' }}>
                $0 <span style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', fontWeight: 400 }}>/ forever</span>
              </div>

              <a href={`${BACKEND_URL}/api/auth/github`} className="btn-secondary" style={{ textAlign: 'center', marginBottom: '2rem' }}>
                Get Started Free
              </a>

              <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.75rem', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                <li style={{ display: 'flex', gap: '0.5rem' }}><CheckCircle2 size={16} color="var(--success)" /> Unlimited Public Repo Reviews</li>
                <li style={{ display: 'flex', gap: '0.5rem' }}><CheckCircle2 size={16} color="var(--success)" /> 50 Private Reviews / month</li>
                <li style={{ display: 'flex', gap: '0.5rem' }}><CheckCircle2 size={16} color="var(--success)" /> .aipr.yml Configuration</li>
                <li style={{ display: 'flex', gap: '0.5rem' }}><CheckCircle2 size={16} color="var(--success)" /> Standard Review Speed</li>
              </ul>
            </div>

            {/* Indie Plan */}
            <div className="pricing-card pricing-card-featured">
              <div style={{ position: 'absolute', top: -12, right: 20, background: 'var(--accent)', color: '#fff', fontSize: '0.72rem', fontWeight: 700, padding: '0.2rem 0.6rem', borderRadius: '9999px' }}>
                POPULAR
              </div>
              <h3 style={{ fontSize: '1.25rem', marginBottom: '0.5rem' }}>Indie Plan</h3>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginBottom: '1.5rem' }}>
                For professional solo devs who want unlimited reviews.
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
                <li style={{ display: 'flex', gap: '0.5rem' }}><CheckCircle2 size={16} color="var(--accent)" /> Priority Background Queue</li>
                <li style={{ display: 'flex', gap: '0.5rem' }}><CheckCircle2 size={16} color="var(--accent)" /> Multi-Model AI Engine</li>
              </ul>
            </div>

            {/* Team Plan */}
            <div className="pricing-card">
              <h3 style={{ fontSize: '1.25rem', marginBottom: '0.5rem' }}>Team Plan</h3>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginBottom: '1.5rem' }}>
                For software teams and engineering organizations.
              </p>
              <div style={{ fontSize: '2.5rem', fontWeight: 800, marginBottom: '1.5rem' }}>
                $12 <span style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', fontWeight: 400 }}>/ user / mo</span>
              </div>

              <a href="https://github.com/marketplace/ai-pr-reviewer" target="_blank" rel="noreferrer" className="btn-secondary" style={{ textAlign: 'center', marginBottom: '2rem' }}>
                Upgrade Organization
              </a>

              <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.75rem', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                <li style={{ display: 'flex', gap: '0.5rem' }}><CheckCircle2 size={16} color="var(--success)" /> Everything in Indie Plan</li>
                <li style={{ display: 'flex', gap: '0.5rem' }}><CheckCircle2 size={16} color="var(--success)" /> Org-Wide App Installation</li>
                <li style={{ display: 'flex', gap: '0.5rem' }}><CheckCircle2 size={16} color="var(--success)" /> Seat Pooling & Shared Invoicing</li>
                <li style={{ display: 'flex', gap: '0.5rem' }}><CheckCircle2 size={16} color="var(--success)" /> Priority Execution Fleet</li>
              </ul>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="landing-footer">
        <div style={{ maxWidth: 1040, margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Cpu size={16} color="var(--accent)" />
            <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>Aeon AI PR Reviewer</span>
          </div>

          <div style={{ display: 'flex', gap: '1.5rem' }}>
            <Link href="/pricing" style={{ color: 'var(--text-secondary)' }}>Pricing</Link>
            <Link href="/privacy" style={{ color: 'var(--text-secondary)' }}>Privacy Policy</Link>
            <Link href="/terms" style={{ color: 'var(--text-secondary)' }}>Terms of Service</Link>
            <Link href="/support" style={{ color: 'var(--text-secondary)' }}>Support & FAQ</Link>
            <a
              href="https://github.com/muhammadshehzaib/ai-pr-reviewer"
              target="_blank"
              rel="noreferrer"
              style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', color: 'var(--text-secondary)' }}
            >
              GitHub <ExternalLink size={12} />
            </a>
          </div>
        </div>

        <div style={{ maxWidth: 1040, margin: '1.5rem auto 0', textAlign: 'center', fontSize: '0.8rem', color: 'rgba(255, 255, 255, 0.3)' }}>
          Licensed under GNU AGPL-3.0. Built for developers worldwide.
        </div>
      </footer>
    </div>
  );
}

function FeatureBlock({
  Icon,
  title,
  description,
}: {
  Icon: typeof Activity;
  title: string;
  description: string;
}) {
  return (
    <div className="glass-card" style={{ textAlign: 'left' }}>
      <Icon size={20} strokeWidth={2} color="var(--accent)" style={{ marginBottom: '1rem' }} />
      <h3 className="card-title" style={{ marginBottom: '0.5rem' }}>{title}</h3>
      <p style={{ color: 'var(--text-secondary)', fontSize: '0.88rem', lineHeight: 1.6 }}>{description}</p>
    </div>
  );
}
