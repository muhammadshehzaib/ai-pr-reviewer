'use client';

import { Key, ShieldCheck, Sliders, Activity, Lock, Zap, CheckCircle2, Sparkles } from 'lucide-react';

const MODELS = [
  { name: 'Claude 3.7 Sonnet', provider: 'Anthropic' },
  { name: 'GPT-4.5 Preview', provider: 'OpenAI' },
  { name: 'Gemini 2.5 Pro', provider: 'Google AI' },
  { name: 'Grok 3 Beta', provider: 'xAI' },
  { name: 'DeepSeek R1', provider: 'DeepSeek' },
  { name: 'Llama 3.3 70B', provider: 'Meta' },
  { name: 'Claude 3.5 Haiku', provider: 'Fast Tier' },
  { name: 'GPT-4o Mini', provider: 'Default' },
];

export function BentoFeatures() {
  return (
    <section id="why-aeon" style={{ maxWidth: 1200, margin: '0 auto', padding: '4rem 1.5rem 6rem' }}>
      {/* Section Header */}
      <div style={{ textAlign: 'center', marginBottom: '3.5rem' }}>
        <div className="badge-social-dark" style={{ marginBottom: '1rem' }}>
          <Sparkles size={14} color="#2563eb" />
          <span>Engineered for Production</span>
        </div>
        <h2 style={{ fontSize: 'clamp(2rem, 3.5vw, 2.75rem)', marginBottom: '0.75rem' }}>
          Why Developers Choose Aeon
        </h2>
        <p style={{ color: '#64748b', fontSize: '1.05rem', maxWidth: 600, margin: '0 auto' }}>
          Stop letting critical bugs slip into main. Aeon turns noisy PR reviews into automated, precision feedback.
        </p>
      </div>

      {/* 3x2 Grid */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))',
          gap: '1.75rem',
        }}
      >
        {/* Card 1: Multi-Model (videocaptions 99+ languages style misted header) */}
        <div className="bento-card">
          <div className="bento-header-misted">
            {/* Grid of dashed badges */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(3, 1fr)',
                gap: '8px',
                padding: '1.25rem',
                opacity: 0.85,
                transform: 'scale(0.95)',
              }}
            >
              {MODELS.slice(0, 6).map((m, idx) => (
                <div
                  key={idx}
                  style={{
                    padding: '6px 10px',
                    borderRadius: 8,
                    border: '1px dashed rgba(37, 99, 235, 0.4)',
                    background: 'rgba(255, 255, 255, 0.7)',
                    backdropFilter: 'blur(4px)',
                    textAlign: 'center',
                  }}
                >
                  <div style={{ fontSize: '0.72rem', fontWeight: 700, color: '#1e3a8a' }}>{m.name}</div>
                  <div style={{ fontSize: '0.62rem', color: '#64748b' }}>{m.provider}</div>
                </div>
              ))}
            </div>

            {/* Centered Large Floating Chip */}
            <div
              style={{
                position: 'absolute',
                padding: '8px 18px',
                borderRadius: 9999,
                background: '#ffffff',
                boxShadow: '0 10px 25px -5px rgba(37, 99, 235, 0.3), 0 0 0 1px rgba(37,99,235,0.15)',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
              }}
            >
              <Key size={16} color="#2563eb" />
              <span style={{ fontSize: '0.85rem', fontWeight: 700, color: '#0f172a' }}>Multi-Model Engine</span>
            </div>
          </div>

          <div className="bento-content">
            <h3 style={{ fontSize: '1.2rem', marginBottom: '0.5rem', color: '#0f172a' }}>
              Bring Your Preferred AI Model
            </h3>
            <p style={{ color: '#64748b', fontSize: '0.92rem', lineHeight: 1.6 }}>
              Choose between Anthropic Claude 3.7, OpenAI GPT-4.5, Google Gemini 2.5, or xAI Grok. Easily switch models per repository or pull request.
            </p>
          </div>
        </div>

        {/* Card 2: AES-256 Vault */}
        <div className="bento-card">
          <div className="bento-header-misted" style={{ background: 'linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%)' }}>
            <div
              style={{
                width: 72,
                height: 72,
                borderRadius: 20,
                background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#ffffff',
                boxShadow: '0 12px 24px -6px rgba(16, 185, 129, 0.4)',
              }}
            >
              <ShieldCheck size={36} />
            </div>
            <div
              style={{
                position: 'absolute',
                bottom: 16,
                padding: '4px 12px',
                borderRadius: 9999,
                background: 'rgba(255,255,255,0.85)',
                backdropFilter: 'blur(4px)',
                border: '1px solid rgba(16, 185, 129, 0.2)',
                fontSize: '0.75rem',
                fontWeight: 600,
                color: '#065f46',
              }}
            >
              🔒 scrypt + AES-256-GCM
            </div>
          </div>

          <div className="bento-content">
            <h3 style={{ fontSize: '1.2rem', marginBottom: '0.5rem', color: '#0f172a' }}>
              Encrypted API Key Vault
            </h3>
            <p style={{ color: '#64748b', fontSize: '0.92rem', lineHeight: 1.6 }}>
              User provider keys are encrypted at rest with hardware-grade AES-256-GCM. Plaintext credentials only exist in worker RAM for the exact milliseconds of diff execution.
            </p>
          </div>
        </div>

        {/* Card 3: Repository Rules .aipr.yml */}
        <div className="bento-card">
          <div className="bento-header-dark">
            <div
              className="mono"
              style={{
                padding: '1rem',
                fontSize: '0.75rem',
                color: '#94a3b8',
                lineHeight: 1.6,
              }}
            >
              <div style={{ color: '#38bdf8' }}># .aipr.yml repository config</div>
              <div><span style={{ color: '#f43f5e' }}>severity_threshold</span>: <span style={{ color: '#34d399' }}>HIGH</span></div>
              <div><span style={{ color: '#f43f5e' }}>ignore</span>:</div>
              <div style={{ paddingLeft: '1rem', color: '#cbd5e1' }}>- <span style={{ color: '#fbbf24' }}>&quot;dist/**&quot;</span></div>
              <div style={{ paddingLeft: '1rem', color: '#cbd5e1' }}>- <span style={{ color: '#fbbf24' }}>&quot;package-lock.json&quot;</span></div>
              <div><span style={{ color: '#f43f5e' }}>strict_security</span>: <span style={{ color: '#a78bfa' }}>true</span></div>
            </div>
          </div>

          <div className="bento-content">
            <h3 style={{ fontSize: '1.2rem', marginBottom: '0.5rem', color: '#0f172a' }}>
              Declarative .aipr.yml Rules
            </h3>
            <p style={{ color: '#64748b', fontSize: '0.92rem', lineHeight: 1.6 }}>
              Commit an optional YAML config to fine-tune severity thresholds, ignore minified artifacts, or enforce custom architectural guidelines per repo.
            </p>
          </div>
        </div>

        {/* Card 4: Real-time Telemetry Feed */}
        <div className="bento-card">
          <div className="bento-header-misted" style={{ background: 'linear-gradient(135deg, #faf5ff 0%, #f3e8ff 100%)' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', width: '85%' }}>
              <div
                style={{
                  background: '#ffffff',
                  padding: '8px 12px',
                  borderRadius: 8,
                  boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  border: '1px solid rgba(147, 51, 234, 0.15)',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#10b981' }} />
                  <span className="mono" style={{ fontSize: '0.78rem', color: '#1e293b' }}>Job #a84f291 Completed</span>
                </div>
                <span style={{ fontSize: '0.7rem', color: '#10b981', fontWeight: 600 }}>0 findings</span>
              </div>
              <div
                style={{
                  background: '#ffffff',
                  padding: '8px 12px',
                  borderRadius: 8,
                  boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  border: '1px solid rgba(147, 51, 234, 0.15)',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#3b82f6' }} />
                  <span className="mono" style={{ fontSize: '0.78rem', color: '#1e293b' }}>Job #c71b044 Running</span>
                </div>
                <span style={{ fontSize: '0.7rem', color: '#3b82f6', fontWeight: 600 }}>AST parse</span>
              </div>
            </div>
          </div>

          <div className="bento-content">
            <h3 style={{ fontSize: '1.2rem', marginBottom: '0.5rem', color: '#0f172a' }}>
              Real-Time WebSocket Streaming
            </h3>
            <p style={{ color: '#64748b', fontSize: '0.92rem', lineHeight: 1.6 }}>
              Watch review execution live on your personal dashboard with BullMQ background queue telemetry and instant webhook notifications.
            </p>
          </div>
        </div>

        {/* Card 5: Zero AI Model Training */}
        <div className="bento-card">
          <div className="bento-header-misted" style={{ background: 'linear-gradient(135deg, #fff7ed 0%, #ffedd5 100%)' }}>
            <div
              style={{
                width: 68,
                height: 68,
                borderRadius: 20,
                background: 'linear-gradient(135deg, #f97316 0%, #ea580c 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#ffffff',
                boxShadow: '0 12px 24px -6px rgba(249, 115, 22, 0.35)',
              }}
            >
              <Lock size={32} />
            </div>
            <div
              style={{
                position: 'absolute',
                bottom: 16,
                padding: '4px 12px',
                borderRadius: 9999,
                background: '#ffffff',
                border: '1px solid rgba(249, 115, 22, 0.2)',
                fontSize: '0.75rem',
                fontWeight: 700,
                color: '#c2410c',
              }}
            >
              Zero Code Retention Guarantee
            </div>
          </div>

          <div className="bento-content">
            <h3 style={{ fontSize: '1.2rem', marginBottom: '0.5rem', color: '#0f172a' }}>
              Strict Privacy & Zero Training
            </h3>
            <p style={{ color: '#64748b', fontSize: '0.92rem', lineHeight: 1.6 }}>
              Your proprietary codebase is never used to train or fine-tune public AI foundation models. All diff buffers are discarded immediately after processing.
            </p>
          </div>
        </div>

        {/* Card 6: 100% AGPL-3.0 Open Core */}
        <div className="bento-card">
          <div className="bento-header-misted" style={{ background: 'linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%)' }}>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                padding: '12px 20px',
                borderRadius: 14,
                background: '#ffffff',
                boxShadow: '0 8px 20px -4px rgba(2, 132, 199, 0.15)',
                border: '1px solid rgba(2, 132, 199, 0.2)',
              }}
            >
              <Zap size={24} color="#0284c7" />
              <div>
                <div style={{ fontWeight: 700, fontSize: '0.9rem', color: '#0f172a' }}>GNU AGPL-3.0</div>
                <div style={{ fontSize: '0.75rem', color: '#64748b' }}>Fully Auditable Codebase</div>
              </div>
            </div>
          </div>

          <div className="bento-content">
            <h3 style={{ fontSize: '1.2rem', marginBottom: '0.5rem', color: '#0f172a' }}>
              Transparent Open Core
            </h3>
            <p style={{ color: '#64748b', fontSize: '0.92rem', lineHeight: 1.6 }}>
              Auditable, transparent, and built on Next.js, Express, and PostgreSQL. Deploy our managed service or self-host your private instance.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
