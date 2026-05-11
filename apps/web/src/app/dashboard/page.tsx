'use client';

import { useEffect, useState } from 'react';
import io from 'socket.io-client';
import { motion, AnimatePresence } from 'framer-motion';
import { Terminal, Activity, CheckCircle2, AlertCircle } from 'lucide-react';
import { Sidebar } from '../../components/Sidebar';
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
    return <div style={{ padding: '3rem', color: 'var(--text-muted)' }}>Loading…</div>;
  }

  return (
    <div className="dashboard-grid">
      <Sidebar user={user} isConnected={isConnected} />

      <main className="main-content">
        <header style={{ marginBottom: '3rem' }}>
          <h1 style={{ fontSize: '3rem', marginBottom: '0.5rem' }}>Operations Feed</h1>
          <p style={{ color: 'var(--text-muted)' }}>
            Streaming real-time code analysis as it happens.
          </p>
        </header>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: '2rem' }}>
          <div>
            <div style={{ marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '10px' }}>
              <Terminal size={24} />
              <h3>Live Log Stream</h3>
            </div>

            <div className="glass-card" style={{ minHeight: '500px', padding: '1rem' }}>
              {logs.length === 0 && (
                <div style={{ textAlign: 'center', padding: '4rem', color: 'var(--text-muted)' }}>
                  <Activity size={48} style={{ opacity: 0.3, marginBottom: '1rem' }} />
                  <p>Awaiting inbound repository signals…</p>
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
                          ? 'var(--success-glow)'
                          : log.status === 'FAILED'
                          ? '#ff5470'
                          : 'var(--accent-neon)',
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px', opacity: 0.5, fontSize: '0.75rem' }}>
                      <span>Job #{log.jobId.slice(0, 8)}</span>
                      <span>{log.timestamp.toLocaleTimeString()}</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      {log.status === 'COMPLETED' ? (
                        <CheckCircle2 size={16} color="var(--success-glow)" />
                      ) : (
                        <Activity size={16} />
                      )}
                      <span
                        style={{
                          color: log.status === 'COMPLETED' ? 'var(--success-glow)' : '#fff',
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
              <h4 style={{ marginBottom: '0.75rem', opacity: 0.7 }}>Live updates</h4>
              <div style={{ fontSize: '2rem', fontWeight: 800 }}>{logs.length}</div>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>events this session</p>
            </div>

            <div className="glass-card" style={{ background: 'linear-gradient(145deg, rgba(112,0,255,0.1), transparent)' }}>
              <AlertCircle size={28} color="var(--accent-purple)" style={{ marginBottom: '0.75rem' }} />
              <h4>Trigger a review</h4>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', margin: '0.5rem 0 1rem' }}>
                Pick a connected repo and queue a manual audit.
              </p>
              <a href="/repositories" className="btn-primary" style={{ display: 'inline-flex', textDecoration: 'none' }}>
                Go to repositories
              </a>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
