'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Cpu, Github, ShieldCheck, Activity, Key } from 'lucide-react';
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
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', marginBottom: '2rem' }}>
          <Cpu size={40} color="#00f2fe" />
          <h1 style={{ fontSize: '2.25rem' }}>
            AEON <span style={{ color: 'var(--text-muted)', fontWeight: 400 }}>AI</span>
          </h1>
        </div>

        <h2 style={{ fontSize: '2rem', marginBottom: '1rem', lineHeight: 1.2 }}>
          AI-powered code reviews,<br />on every pull request.
        </h2>
        <p style={{ color: 'var(--text-muted)', marginBottom: '2.5rem', fontSize: '1.05rem' }}>
          Connect your GitHub repos. Drop in an API key for OpenAI, Gemini, Claude, or Grok.
          Every PR gets an inline review automatically.
        </p>

        <a href={`${BACKEND_URL}/api/auth/github`} className="btn-primary" style={{ fontSize: '1rem' }}>
          <Github size={20} /> Continue with GitHub
        </a>

        <div style={{ marginTop: '4rem', display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem' }}>
          <FeatureCard Icon={ShieldCheck} title="Encrypted vault" body="Your API key is AES-256 encrypted at rest." />
          <FeatureCard Icon={Activity} title="Realtime stream" body="Watch each review run live on the dashboard." />
          <FeatureCard Icon={Key} title="Pick your model" body="OpenAI, Gemini, Claude, or Grok — your choice." />
        </div>
      </div>
    </main>
  );
}

function FeatureCard({ Icon, title, body }: { Icon: typeof Activity; title: string; body: string }) {
  return (
    <div className="glass-card" style={{ textAlign: 'left' }}>
      <Icon size={20} color="#00f2fe" style={{ marginBottom: '0.75rem' }} />
      <div style={{ fontWeight: 600, marginBottom: '0.25rem' }}>{title}</div>
      <div style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>{body}</div>
    </div>
  );
}
