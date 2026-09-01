'use client';

import { Star, MessageSquare, ShieldCheck, Heart } from 'lucide-react';

interface Testimonial {
  name: string;
  role: string;
  avatarText: string;
  avatarBg: string;
  stars: number;
  comment: string;
  highlight: string;
}

const TESTIMONIALS: Testimonial[] = [
  {
    name: 'Sarah Chen',
    role: 'Staff Infrastructure Engineer @ CloudScale',
    avatarText: 'SC',
    avatarBg: '#3b82f6',
    stars: 5,
    highlight: 'Saved us from an auth timing attack on week 1',
    comment:
      'Aeon caught an HMAC comparison timing vulnerability in our auth proxy that two senior engineers completely missed during manual review. It literally paid for itself 100x on the first day.',
  },
  {
    name: 'Marcus Vance',
    role: 'Founder & Solo Developer @ ShipFast',
    avatarText: 'MV',
    avatarBg: '#8b5cf6',
    stars: 5,
    highlight: 'Like having a 24/7 staff engineer reviewing my code',
    comment:
      'As a solo founder, shipping without a second set of eyes used to terrify me. Aeon catches my async leaks and missing null checks instantly before I push to production.',
  },
  {
    name: 'David Kim',
    role: 'VP of Engineering @ LedgerFlow',
    avatarText: 'DK',
    avatarBg: '#10b981',
    stars: 5,
    highlight: 'Zero latency and zero noise in pull requests',
    comment:
      'The .aipr.yml configuration makes it effortless to filter out noisy test files. The review comments are high-signal, respectful, and include copy-pasteable patches.',
  },
];

export function TestimonialsSection() {
  return (
    <section style={{ maxWidth: 1140, margin: '0 auto', padding: '4rem 1.5rem 6rem' }}>
      {/* Header */}
      <div style={{ textAlign: 'center', marginBottom: '3.5rem' }}>
        <div className="badge-social-dark" style={{ marginBottom: '1rem' }}>
          <Heart size={14} color="#ef4444" />
          <span>Wall of Developer Love</span>
        </div>
        <h2 style={{ fontSize: 'clamp(2rem, 3.5vw, 2.75rem)', marginBottom: '0.75rem' }}>
          Loved by Engineering Teams Worldwide
        </h2>
        <p style={{ color: '#64748b', fontSize: '1.05rem', maxWidth: 600, margin: '0 auto' }}>
          See how teams use Aeon to ship higher quality code with zero review friction.
        </p>
      </div>

      {/* Grid */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
          gap: '1.5rem',
        }}
      >
        {TESTIMONIALS.map((t, idx) => (
          <div
            key={idx}
            className="glass-card"
            style={{
              padding: '1.75rem',
              borderRadius: 18,
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
            }}
          >
            <div>
              {/* Stars */}
              <div style={{ display: 'flex', gap: '2px', marginBottom: '1rem' }}>
                {[...Array(t.stars)].map((_, i) => (
                  <Star key={i} size={16} fill="#ffc531" color="#ffc531" />
                ))}
              </div>

              {/* Highlight */}
              <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#0f172a', marginBottom: '0.5rem' }}>
                &ldquo;{t.highlight}&rdquo;
              </h3>

              {/* Comment */}
              <p style={{ color: '#475569', fontSize: '0.92rem', lineHeight: 1.6, marginBottom: '1.5rem' }}>
                {t.comment}
              </p>
            </div>

            {/* Author Info */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', borderTop: '1px solid rgba(0,0,0,0.05)', paddingTop: '1rem' }}>
              <div
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: '50%',
                  background: t.avatarBg,
                  color: '#ffffff',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: 700,
                  fontSize: '0.85rem',
                }}
              >
                {t.avatarText}
              </div>
              <div>
                <div style={{ fontWeight: 600, fontSize: '0.9rem', color: '#0f172a' }}>{t.name}</div>
                <div style={{ fontSize: '0.78rem', color: '#64748b' }}>{t.role}</div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
