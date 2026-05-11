'use client';

import { useEffect, useState } from 'react';
import { History, GitPullRequest, GitCommit, CheckCircle2, XCircle, Loader2, ChevronRight } from 'lucide-react';
import { Sidebar } from '../../components/Sidebar';
import { useAuth } from '../../lib/useAuth';
import { api } from '../../lib/api';

type EventType = 'PULL_REQUEST' | 'PUSH';
type JobStatus = 'QUEUED' | 'RUNNING' | 'COMPLETED' | 'FAILED';

interface JobSummary {
  id: string;
  eventType: EventType;
  referenceId: string;
  status: JobStatus;
  createdAt: string;
  updatedAt: string;
  findingCount: number;
  repository: { id: string; fullName: string };
}

interface AiSuggestion {
  filePath: string;
  lineNumber: number;
  agentType: 'SECURITY' | 'PERFORMANCE' | 'ARCHITECTURE';
  issue: string;
  suggestion: string;
  priority: 'HIGH' | 'MEDIUM' | 'LOW';
}

interface JobDetail extends JobSummary {
  results: AiSuggestion[] | null;
}

const STATUS_COLORS: Record<JobStatus, string> = {
  QUEUED: 'var(--text-muted)',
  RUNNING: 'var(--accent-neon)',
  COMPLETED: 'var(--success-glow)',
  FAILED: '#ff5470',
};

const PRIORITY_COLORS = {
  HIGH: '#ff5470',
  MEDIUM: '#ffb454',
  LOW: 'var(--accent-neon)',
};

export default function HistoryPage() {
  const { user, loading: authLoading } = useAuth();
  const [jobs, setJobs] = useState<JobSummary[]>([]);
  const [selected, setSelected] = useState<JobDetail | null>(null);
  const [loadingList, setLoadingList] = useState(true);
  const [loadingDetail, setLoadingDetail] = useState(false);

  useEffect(() => {
    if (!user) return;
    api<{ jobs: JobSummary[] }>('/api/jobs?limit=50')
      .then((res) => setJobs(res.jobs))
      .catch(() => {})
      .finally(() => setLoadingList(false));
  }, [user]);

  async function openJob(id: string) {
    setLoadingDetail(true);
    try {
      const res = await api<{ job: JobDetail & { results: unknown } }>(`/api/jobs/${id}`);
      const results = Array.isArray(res.job.results) ? (res.job.results as AiSuggestion[]) : null;
      setSelected({ ...res.job, results });
    } catch {
      // ignore
    } finally {
      setLoadingDetail(false);
    }
  }

  if (authLoading || !user) {
    return <div style={{ padding: '3rem', color: 'var(--text-muted)' }}>Loading…</div>;
  }

  return (
    <div className="dashboard-grid">
      <Sidebar user={user} />
      <main className="main-content">
        <header style={{ marginBottom: '2rem' }}>
          <h1 style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>Review History</h1>
          <p style={{ color: 'var(--text-muted)' }}>The last 50 analyses across all your connected repos.</p>
        </header>

        <div style={{ display: 'grid', gridTemplateColumns: '380px 1fr', gap: '2rem', alignItems: 'start' }}>
          <div>
            {loadingList ? (
              <div className="glass-card" style={{ padding: '2rem', color: 'var(--text-muted)' }}>Loading…</div>
            ) : jobs.length === 0 ? (
              <div className="glass-card" style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
                <History size={40} style={{ opacity: 0.3, marginBottom: '1rem' }} />
                <p>No reviews yet. Connect a repo and push some code.</p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                {jobs.map((job) => (
                  <button
                    key={job.id}
                    onClick={() => openJob(job.id)}
                    className="glass-card history-row"
                    data-active={selected?.id === job.id ? 'true' : 'false'}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                      <StatusIcon status={job.status} />
                      <div style={{ flex: 1, minWidth: 0, textAlign: 'left' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '2px' }}>
                          {job.eventType === 'PULL_REQUEST' ? <GitPullRequest size={14} /> : <GitCommit size={14} />}
                          <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '0.85rem' }}>
                            {job.repository.fullName}
                            {job.eventType === 'PULL_REQUEST' ? ` #${job.referenceId}` : ` @ ${job.referenceId.slice(0, 7)}`}
                          </span>
                        </div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                          {new Date(job.createdAt).toLocaleString()} · {job.findingCount} findings
                        </div>
                      </div>
                      <ChevronRight size={14} style={{ opacity: 0.4 }} />
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>

          <div>
            {!selected ? (
              <div className="glass-card" style={{ textAlign: 'center', padding: '4rem', color: 'var(--text-muted)' }}>
                <History size={40} style={{ opacity: 0.3, marginBottom: '1rem' }} />
                <p>Select a review to see findings.</p>
              </div>
            ) : loadingDetail ? (
              <div className="glass-card" style={{ padding: '2rem', color: 'var(--text-muted)' }}>Loading…</div>
            ) : (
              <JobDetailView job={selected} />
            )}
          </div>
        </div>
      </main>
    </div>
  );
}

function StatusIcon({ status }: { status: JobStatus }) {
  const color = STATUS_COLORS[status];
  if (status === 'COMPLETED') return <CheckCircle2 size={18} color={color} />;
  if (status === 'FAILED') return <XCircle size={18} color={color} />;
  if (status === 'RUNNING') return <Loader2 size={18} color={color} className="spin" />;
  return <div style={{ width: 8, height: 8, borderRadius: 4, background: color, marginLeft: 5, marginRight: 5 }} />;
}

function JobDetailView({ job }: { job: JobDetail }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      <div className="glass-card">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            {job.eventType === 'PULL_REQUEST' ? <GitPullRequest size={18} /> : <GitCommit size={18} />}
            <h3 style={{ fontSize: '1.1rem' }}>
              {job.repository.fullName}
              {job.eventType === 'PULL_REQUEST' ? ` · PR #${job.referenceId}` : ` · ${job.referenceId.slice(0, 7)}`}
            </h3>
          </div>
          <span style={{ color: STATUS_COLORS[job.status], fontWeight: 600, fontSize: '0.85rem' }}>{job.status}</span>
        </div>
        <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
          Created {new Date(job.createdAt).toLocaleString()} · {job.findingCount} findings
        </div>
      </div>

      {!job.results || job.results.length === 0 ? (
        <div className="glass-card" style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>
          {job.status === 'COMPLETED' ? '✨ No issues found' : 'No findings recorded.'}
        </div>
      ) : (
        job.results.map((s, i) => (
          <div key={i} className="glass-card">
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
              <span
                style={{
                  fontSize: '0.7rem',
                  fontWeight: 700,
                  padding: '2px 8px',
                  borderRadius: 4,
                  background: PRIORITY_COLORS[s.priority],
                  color: '#000',
                }}
              >
                {s.priority}
              </span>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{s.agentType}</span>
              <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '0.8rem', marginLeft: 'auto' }}>
                {s.filePath}:{s.lineNumber}
              </span>
            </div>
            <div style={{ fontWeight: 600, marginBottom: '0.5rem' }}>{s.issue}</div>
            <pre
              style={{
                background: 'rgba(0,0,0,0.4)',
                padding: '0.75rem',
                borderRadius: 8,
                fontSize: '0.8rem',
                fontFamily: 'JetBrains Mono, monospace',
                whiteSpace: 'pre-wrap',
                wordBreak: 'break-word',
              }}
            >
              {s.suggestion}
            </pre>
          </div>
        ))
      )}
    </div>
  );
}
