'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Cpu, GitBranch, ShieldCheck, Activity, Key } from 'lucide-react';
import { BACKEND_URL } from '../lib/api';
import { useAuth } from '../lib/useAuth';

export default function HomePage() {
  const router = useRouter();
  const { user, loading } = useAuth(false);

  useEffect(() => {
    if (!loading && user) router.replace('/dashboard');
  }, [loading, user, router]);

  return (
    <main style={{ minHeight: '100vh', display: 'grid', placeItems: 'center', padding: '2rem' }}>
      <div style={{ maxWidth: 540, width: '100%', textAlign: 'center' }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', marginBottom: '2.5rem' }}>
          <Cpu size={18} strokeWidth={2} />
          <span style={{ fontWeight: 600, fontSize: '1rem' }}>Aeon</span>
        </div>

        <h1
          style={{
            fontSize: 'clamp(2.5rem, 6vw, 3.75rem)',
            fontWeight: 700,
            letterSpacing: '-0.045em',
            lineHeight: 1.05,
            marginBottom: '1rem',
          }}
        >
          Code reviews on every pull request
        </h1>
        <p
          style={{
            color: 'var(--text-secondary)',
            fontSize: '1.05rem',
            maxWidth: 480,
            margin: '0 auto 2.5rem',
          }}
        >
          Connect your GitHub repos, add an API key for OpenAI, Gemini, Claude, or Grok,
          and every pull request gets an inline review.
        </p>

        <a href={`${BACKEND_URL}/api/auth/github`} className="btn-primary" style={{ fontSize: '0.9rem' }}>
          <GitBranch size={16} strokeWidth={2} /> Continue with GitHub
        </a>

        <div style={{ marginTop: '4rem', display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem' }}>
          <FeatureCard Icon={ShieldCheck} title="Keys encrypted at rest" body="Your API key is AES-256 encrypted before it is stored." />
          <FeatureCard Icon={Activity} title="Live review activity" body="Follow each review as it runs on the dashboard." />
          <FeatureCard Icon={Key} title="Bring your own model" body="OpenAI, Gemini, Claude, or Grok — your choice." />
        </div>
      </div>
    </main>
  );
}

function FeatureCard({ Icon, title, body }: { Icon: typeof Activity; title: string; body: string }) {
  return (
    <div className="glass-card" style={{ textAlign: 'left' }}>
      <Icon size={18} strokeWidth={2} style={{ marginBottom: '0.75rem' }} />
      <div style={{ fontWeight: 600, fontSize: '0.9rem', marginBottom: '0.25rem' }}>{title}</div>
      <div style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>{body}</div>
    </div>
  );
}
