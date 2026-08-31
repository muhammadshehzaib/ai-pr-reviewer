'use client';

import { useEffect, useState } from 'react';
import io from 'socket.io-client';
import { motion, AnimatePresence } from 'framer-motion';
import { Terminal, Activity, CheckCircle2, AlertCircle } from 'lucide-react';
import { Sidebar } from '../../components/Sidebar';
import { UsageMeter } from '../../components/UsageMeter';
import { useAuth } from '../../lib/useAuth';
import { BACKEND_URL } from '../../lib/api';

interface ActivityLog {
  id: string;
  jobId: string;
  message: string;
  status: string;
  timestamp: Date;
}

export default function DashboardPage() {
  const { user, loading: authLoading } = useAuth();
  const [logs, setLogs] = useState<ActivityLog[]>([]);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    if (!user) return;
    const socket = io(BACKEND_URL, { withCredentials: true });

    socket.on('connect', () => setIsConnected(true));
    socket.on('disconnect', () => setIsConnected(false));

    socket.on('dashboard:activity', (data) => {
      const newEntry: ActivityLog = {
        id: Math.random().toString(36).slice(2, 11),
        jobId: data.jobId,
        message: data.message,
        status: data.status,
        timestamp: new Date(),
      };
      setLogs((prev) => [newEntry, ...prev].slice(0, 20));
    });

    return () => {
      socket.disconnect();
    };
  }, [user]);

  if (authLoading || !user) {
    return <div style={{ padding: '3rem', color: 'var(--text-secondary)' }}>Loading…</div>;
  }

  return (
    <div className="dashboard-grid">
      <Sidebar user={user} isConnected={isConnected} />

      <main className="main-content">
        <header style={{ marginBottom: '1.75rem' }}>
          <h1 className="page-title">Activity</h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem' }}>
            Live review runs and usage quotas across your connected repositories.
          </p>
        </header>

        <UsageMeter />

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: '2rem' }}>
          <div>
            <div style={{ marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-secondary)' }}>
              <Terminal size={16} strokeWidth={2} />
              <span className="section-label" style={{ marginBottom: 0 }}>Live feed</span>
            </div>

            <div className="glass-card" style={{ minHeight: '500px', padding: '1rem' }}>
              {logs.length === 0 && (
                <div style={{ textAlign: 'center', padding: '4rem', color: 'var(--text-secondary)' }}>
                  <Activity size={20} strokeWidth={2} style={{ opacity: 0.25, marginBottom: '1rem' }} />
                  <p>No activity yet — reviews stream here in real time.</p>
                </div>
              )}

              <AnimatePresence initial={false}>
                {logs.map((log) => (
                  <motion.div
                    key={log.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0 }}
                    className="feed-item"
                    style={{
                      borderLeftColor:
                        log.status === 'COMPLETED'
                          ? 'var(--success)'
                          : log.status === 'FAILED'
                          ? 'var(--danger)'
                          : 'var(--accent)',
                    }}
                  >
                    <div
                      className="mono"
                      style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px', color: 'var(--text-secondary)', fontSize: '0.75rem' }}
                    >
                      <span>Job #{log.jobId.slice(0, 8)}</span>
                      <span>{log.timestamp.toLocaleTimeString()}</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      {log.status === 'COMPLETED' ? (
                        <CheckCircle2 size={16} strokeWidth={2} color="var(--success)" />
                      ) : (
                        <Activity size={16} strokeWidth={2} />
                      )}
                      <span
                        style={{
                          color: log.status === 'COMPLETED' ? 'var(--success)' : 'var(--text-primary)',
                        }}
                      >
                        {log.message}
                      </span>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <div className="glass-card">
              <div className="section-label" style={{ marginBottom: '0.75rem' }}>Live updates</div>
              <div style={{ fontSize: '1.75rem', fontWeight: 600 }}>{logs.length}</div>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>events this session</p>
            </div>

            <div className="glass-card">
              <AlertCircle size={18} strokeWidth={2} style={{ marginBottom: '0.75rem' }} />
              <h3 className="card-title">Trigger a review</h3>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', margin: '0.5rem 0 1rem' }}>
                Pick a connected repository and start a review.
              </p>
              <a href="/repositories" className="btn-secondary" style={{ display: 'inline-flex', textDecoration: 'none' }}>
                Go to repositories
              </a>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
