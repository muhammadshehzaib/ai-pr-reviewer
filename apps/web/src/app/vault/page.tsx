'use client';

import { useEffect, useState } from 'react';
import { Key, ShieldCheck, Trash2, Save } from 'lucide-react';
import { Sidebar } from '../../components/Sidebar';
import { useAuth } from '../../lib/useAuth';
import { api } from '../../lib/api';

type Provider = 'GEMINI' | 'OPENAI' | 'CLAUDE' | 'GROK';

interface VaultRecord {
  provider: Provider;
  updatedAt: string;
}

const PROVIDERS: { value: Provider; label: string; hint: string }[] = [
  { value: 'OPENAI', label: 'OpenAI', hint: 'GPT-4o' },
  { value: 'GEMINI', label: 'Google Gemini', hint: 'gemini-1.5-pro' },
  { value: 'CLAUDE', label: 'Anthropic Claude', hint: 'claude-sonnet-4-6' },
  { value: 'GROK', label: 'xAI Grok', hint: 'grok-2-1212' },
];

export default function VaultPage() {
  const { user, loading: authLoading } = useAuth();
  const [vault, setVault] = useState<VaultRecord | null>(null);
  const [provider, setProvider] = useState<Provider>('OPENAI');
  const [apiKey, setApiKey] = useState('');
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<{ kind: 'ok' | 'err'; text: string } | null>(null);

  useEffect(() => {
    if (!user) return;
    api<{ vault: VaultRecord | null }>('/api/vault')
      .then((res) => {
        setVault(res.vault);
        if (res.vault) setProvider(res.vault.provider);
      })
      .catch(() => {});
  }, [user]);

  async function save(e: React.FormEvent) {
    e.preventDefault();
    if (!apiKey.trim()) {
      setMessage({ kind: 'err', text: 'API key is required.' });
      return;
    }
    setBusy(true);
    setMessage(null);
    try {
      const res = await api<{ vault: VaultRecord }>('/api/vault', {
        method: 'PUT',
        body: JSON.stringify({ provider, apiKey: apiKey.trim() }),
      });
      setVault(res.vault);
      setApiKey('');
      setMessage({ kind: 'ok', text: 'Key saved. It is encrypted at rest.' });
    } catch (err) {
      setMessage({ kind: 'err', text: (err as { error?: string }).error || 'Failed to save.' });
    } finally {
      setBusy(false);
    }
  }

  async function remove() {
    if (!confirm('Delete the saved API key? Reviews will stop running until you save a new one.')) return;
    setBusy(true);
    setMessage(null);
    try {
      await api('/api/vault', { method: 'DELETE' });
      setVault(null);
      setMessage({ kind: 'ok', text: 'Key removed.' });
    } catch (err) {
      setMessage({ kind: 'err', text: (err as { error?: string }).error || 'Failed to delete.' });
    } finally {
      setBusy(false);
    }
  }

  if (authLoading || !user) {
    return <div style={{ padding: '3rem', color: 'var(--text-muted)' }}>Loading…</div>;
  }

  return (
    <div className="dashboard-grid">
      <Sidebar user={user} />
      <main className="main-content" style={{ maxWidth: 720 }}>
        <header style={{ marginBottom: '2.5rem' }}>
          <h1 style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>API Key Vault</h1>
          <p style={{ color: 'var(--text-muted)' }}>
            Your AI provider key is encrypted with AES-256-GCM before being stored. It only exists in
            plaintext briefly in memory while a review is running.
          </p>
        </header>

        {vault && (
          <div className="glass-card" style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <ShieldCheck size={28} color="var(--success-glow)" />
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 600 }}>Active provider: {vault.provider}</div>
              <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                Last updated {new Date(vault.updatedAt).toLocaleString()}
              </div>
            </div>
            <button onClick={remove} disabled={busy} className="btn-secondary">
              <Trash2 size={14} /> Delete
            </button>
          </div>
        )}

        <form onSubmit={save} className="glass-card" style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Key size={20} color="#00f2fe" />
            <h3>{vault ? 'Update key' : 'Add your first key'}</h3>
          </div>

          <label className="field">
            <span className="field-label">AI Provider</span>
            <div className="provider-grid">
              {PROVIDERS.map((p) => (
                <button
                  key={p.value}
                  type="button"
                  onClick={() => setProvider(p.value)}
                  className="provider-chip"
                  data-active={provider === p.value ? 'true' : 'false'}
                >
                  <span style={{ fontWeight: 600 }}>{p.label}</span>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{p.hint}</span>
                </button>
              ))}
            </div>
          </label>

          <label className="field">
            <span className="field-label">API Key</span>
            <input
              type="password"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              placeholder={vault ? 'Paste a new key to replace the saved one' : 'sk-...'}
              className="text-input"
              autoComplete="off"
            />
          </label>

          {message && (
            <div className={message.kind === 'ok' ? 'flash flash-ok' : 'flash flash-err'}>
              {message.text}
            </div>
          )}

          <div>
            <button type="submit" disabled={busy} className="btn-primary">
              <Save size={16} /> {busy ? 'Saving…' : vault ? 'Update key' : 'Save key'}
            </button>
          </div>
        </form>
      </main>
    </div>
  );
}
