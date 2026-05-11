'use client';

import { useEffect, useState } from 'react';
import { GitBranch, Plus, Trash2, Play, ExternalLink } from 'lucide-react';
import { Sidebar } from '../../components/Sidebar';
import { useAuth } from '../../lib/useAuth';
import { api } from '../../lib/api';

interface Repository {
  id: string;
  githubRepoId: string;
  fullName: string;
  webhookId: string | null;
  isActive: boolean;
  createdAt: string;
}

export default function RepositoriesPage() {
  const { user, loading: authLoading } = useAuth();
  const [repos, setRepos] = useState<Repository[]>([]);
  const [fullName, setFullName] = useState('');
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<{ kind: 'ok' | 'err'; text: string } | null>(null);
  const [triggerOpen, setTriggerOpen] = useState<string | null>(null);
  const [prNumber, setPrNumber] = useState('');

  async function refresh() {
    try {
      const res = await api<{ repositories: Repository[] }>('/api/repositories');
      setRepos(res.repositories);
    } catch {
      // ignore
    }
  }

  useEffect(() => {
    if (user) refresh();
  }, [user]);

  async function add(e: React.FormEvent) {
    e.preventDefault();
    if (!fullName.includes('/')) {
      setMessage({ kind: 'err', text: 'Use the form "owner/repo".' });
      return;
    }
    setBusy(true);
    setMessage(null);
    try {
      await api('/api/repositories', {
        method: 'POST',
        body: JSON.stringify({ fullName: fullName.trim() }),
      });
      setFullName('');
      setMessage({ kind: 'ok', text: 'Repo connected. Webhook installed on GitHub.' });
      await refresh();
    } catch (err) {
      setMessage({ kind: 'err', text: (err as { error?: string }).error || 'Failed to connect.' });
    } finally {
      setBusy(false);
    }
  }

  async function disconnect(id: string, name: string) {
    if (!confirm(`Disconnect ${name}? The webhook will be removed from GitHub.`)) return;
    setBusy(true);
    setMessage(null);
    try {
      await api(`/api/repositories/${id}`, { method: 'DELETE' });
      setMessage({ kind: 'ok', text: `Disconnected ${name}.` });
      await refresh();
    } catch (err) {
      setMessage({ kind: 'err', text: (err as { error?: string }).error || 'Failed to disconnect.' });
    } finally {
      setBusy(false);
    }
  }

  async function triggerAudit(repoId: string) {
    if (!prNumber.trim()) {
      setMessage({ kind: 'err', text: 'Enter a PR number.' });
      return;
    }
    setBusy(true);
    setMessage(null);
    try {
      const res = await api<{ jobId: string }>(`/api/repositories/${repoId}/analyze`, {
        method: 'POST',
        body: JSON.stringify({ pullNumber: Number(prNumber) }),
      });
      setMessage({ kind: 'ok', text: `Queued job ${res.jobId.slice(0, 8)}. Watch the dashboard for progress.` });
      setTriggerOpen(null);
      setPrNumber('');
    } catch (err) {
      setMessage({ kind: 'err', text: (err as { error?: string }).error || 'Failed to queue.' });
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
      <main className="main-content" style={{ maxWidth: 900 }}>
        <header style={{ marginBottom: '2.5rem' }}>
          <h1 style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>Repositories</h1>
          <p style={{ color: 'var(--text-muted)' }}>
            Connect a repo to install the webhook. Reviews then run automatically on every pull request and push.
          </p>
        </header>

        <form onSubmit={add} className="glass-card" style={{ marginBottom: '2rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
            <Plus size={20} color="#00f2fe" />
            <h3>Connect a repository</h3>
          </div>

          <div style={{ display: 'flex', gap: '0.75rem' }}>
            <input
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="owner/repo  e.g. vercel/next.js"
              className="text-input"
              style={{ flex: 1 }}
            />
            <button type="submit" disabled={busy} className="btn-primary">
              <Plus size={16} /> {busy ? 'Connecting…' : 'Connect'}
            </button>
          </div>
        </form>

        {message && (
          <div className={message.kind === 'ok' ? 'flash flash-ok' : 'flash flash-err'} style={{ marginBottom: '1.5rem' }}>
            {message.text}
          </div>
        )}

        <h3 style={{ marginBottom: '1rem' }}>Connected ({repos.filter((r) => r.isActive).length})</h3>

        {repos.length === 0 ? (
          <div className="glass-card" style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
            <GitBranch size={40} style={{ opacity: 0.3, marginBottom: '1rem' }} />
            <p>No repositories connected yet.</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {repos.map((r) => (
              <div key={r.id} className="glass-card" style={{ opacity: r.isActive ? 1 : 0.5 }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', minWidth: 0 }}>
                    <GitBranch size={20} color="#00f2fe" />
                    <div style={{ minWidth: 0 }}>
                      <div style={{ fontWeight: 600, fontFamily: 'JetBrains Mono, monospace' }}>{r.fullName}</div>
                      <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                        {r.isActive ? `Active · webhook ${r.webhookId}` : 'Inactive'} · Added {new Date(r.createdAt).toLocaleDateString()}
                      </div>
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <a
                      href={`https://github.com/${r.fullName}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn-secondary"
                      title="View on GitHub"
                    >
                      <ExternalLink size={14} />
                    </a>
                    {r.isActive && (
                      <>
                        <button onClick={() => setTriggerOpen(triggerOpen === r.id ? null : r.id)} className="btn-secondary">
                          <Play size={14} /> Audit
                        </button>
                        <button onClick={() => disconnect(r.id, r.fullName)} disabled={busy} className="btn-secondary">
                          <Trash2 size={14} />
                        </button>
                      </>
                    )}
                  </div>
                </div>

                {triggerOpen === r.id && (
                  <div style={{ marginTop: '1rem', paddingTop: '1rem', borderTop: '1px solid var(--border-subtle)', display: 'flex', gap: '0.5rem' }}>
                    <input
                      type="number"
                      value={prNumber}
                      onChange={(e) => setPrNumber(e.target.value)}
                      placeholder="Pull request number"
                      className="text-input"
                      style={{ flex: 1 }}
                    />
                    <button onClick={() => triggerAudit(r.id)} disabled={busy} className="btn-primary">
                      Queue audit
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
