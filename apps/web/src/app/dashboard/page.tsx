'use client';

import { useEffect, useState } from 'react';
import io, { Socket } from 'socket.io-client';
import { motion, AnimatePresence } from 'framer-motion';
import { Terminal, Activity, CheckCircle2, AlertCircle, Cpu, ShieldAlert } from 'lucide-react';

interface ActivityLog {
  id: string;
  jobId: string;
  message: string;
  status: string;
  timestamp: Date;
}

export default function DashboardPage() {
  const [logs, setLogs] = useState<ActivityLog[]>([]);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    // Hardcoded localhost connection for development demonstration
    const socket = io('http://localhost:4000');

    socket.on('connect', () => {
      setIsConnected(true);
      console.log('🔌 WebSocket Link Established');
    });

    socket.on('disconnect', () => setIsConnected(false));

    // Listening for universal dynamic stream
    socket.on('dashboard:activity', (data) => {
      const newEntry: ActivityLog = {
        id: Math.random().toString(36).substr(2, 9),
        jobId: data.jobId,
        message: data.message,
        status: data.status,
        timestamp: new Date(),
      };

      setLogs((prev) => [newEntry, ...prev].slice(0, 10)); // Keep last 10 items
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  return (
    <div className="dashboard-grid">
      {/* Futuristic Sidebar Menu */}
      <aside className="sidebar">
        <div style={{ marginBottom: '3rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Cpu size={32} color="#00f2fe" />
          <h2 style={{ fontSize: '1.5rem' }}>AEON <span style={{ color: 'var(--text-muted)', fontWeight: 400 }}>AI</span></h2>
        </div>

        <nav style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <a href="#" style={{ color: 'var(--accent-neon)', fontWeight: 600, display: 'flex', gap: '10px' }}>
            <Activity size={20} /> Dashboard
          </a>
          <a href="#" style={{ opacity: 0.6, display: 'flex', gap: '10px' }}>
            <ShieldAlert size={20} /> Security Audit
          </a>
        </nav>

        <div style={{ marginTop: 'auto', padding: '1rem', background: 'rgba(0,0,0,0.3)', borderRadius: '8px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.85rem' }}>
            <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: isConnected ? 'var(--success-glow)' : 'red' }}></div>
            {isConnected ? 'System Connected' : 'Offline'}
          </div>
        </div>
      </aside>

      {/* Primary Operations Theater */}
      <main className="main-content">
        <header style={{ marginBottom: '3rem' }}>
          <h1 style={{ fontSize: '3rem', marginBottom: '0.5rem' }}>Operations Feed</h1>
          <p style={{ color: 'var(--text-muted)' }}>Streaming real-time code analysis engines across global clusters.</p>
        </header>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 350px', gap: '2rem' }}>
          {/* Left Column: Live Stream */}
          <div>
            <div style={{ marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '10px' }}>
              <Terminal size={24} />
              <h3>Live Log Stream</h3>
            </div>

            <div className="glass-card" style={{ minHeight: '500px', padding: '1rem' }}>
              {logs.length === 0 && (
                <div style={{ textAlign: 'center', padding: '4rem', color: 'var(--text-muted)' }}>
                  <Activity size={48} style={{ opacity: 0.3, marginBottom: '1rem' }} />
                  <p>Awaiting inbound repository signals...</p>
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
                      borderLeftColor: log.status === 'COMPLETED' ? 'var(--success-glow)' : 'var(--accent-neon)'
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px', opacity: 0.5, fontSize: '0.75rem' }}>
                      <span>Job #{log.jobId.substr(0,8)}</span>
                      <span>{log.timestamp.toLocaleTimeString()}</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                       {log.status === 'COMPLETED' ? <CheckCircle2 size={16} color="var(--success-glow)" /> : <Activity size={16} />}
                       <span style={{ color: log.status === 'COMPLETED' ? 'var(--success-glow)' : '#fff' }}>
                          {log.message}
                       </span>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          </div>

          {/* Right Column: Metrics */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
            <div className="glass-card">
              <h4 style={{ marginBottom: '1rem', opacity: 0.7 }}>Scanning Active</h4>
              <div style={{ fontSize: '2.5rem', fontWeight: 800 }}>05</div>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Active Concurrency Threads</p>
            </div>

            <div className="glass-card" style={{ background: 'linear-gradient(145deg, rgba(112,0,255,0.1), transparent)' }}>
              <AlertCircle size={32} color="var(--accent-purple)" style={{ marginBottom: '1rem' }} />
              <h4>Trigger Test Analysis</h4>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', margin: '0.5rem 0 1.5rem' }}>Manually invoke the pipeline trigger for demonstration.</p>
              <button className="btn-primary" style={{ width: '100%' }}>Initiate Audit</button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
