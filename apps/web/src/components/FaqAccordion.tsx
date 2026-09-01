'use client';

import { useState } from 'react';
import { ChevronDown, HelpCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface Faq {
  q: string;
  a: string;
}

const FAQS: Faq[] = [
  {
    q: 'How does Aeon review pull requests?',
    a: 'When you open or update a PR, GitHub sends a secure webhook to Aeon. Our backend analyzes the AST and changed diff lines, evaluates your .aipr.yml rules, and posts actionable inline comments with one-click patches directly on the modified lines in GitHub.',
  },
  {
    q: 'Is my proprietary code stored or used to train AI models?',
    a: 'No, absolutely not. Code diffs are held in volatile RAM only for the duration of the review execution and are purged immediately. We never train, fine-tune, or retain any customer code.',
  },
  {
    q: 'How do I ignore certain files like generated lockfiles or dist directories?',
    a: 'Add a `.aipr.yml` file to the root of your repository with an ignore list:\n\n```yaml\nignore:\n  - "dist/**"\n  - "package-lock.json"\n  - "*.min.js"\n```',
  },
  {
    q: 'Can I bring my own OpenAI, Anthropic Claude, or Gemini API keys?',
    a: 'Yes! Navigate to the API Key Vault in your dashboard, select your preferred provider, and paste your API key. Keys are encrypted at rest using AES-256-GCM.',
  },
  {
    q: 'What is included in the Free tier?',
    a: 'The Free tier gives you unlimited reviews on all public open-source repositories and up to 50 reviews per month on private repositories, with zero watermarks or credit cards required.',
  },
  {
    q: 'How does billing through GitHub Marketplace work?',
    a: 'All paid plans are billed directly through GitHub Marketplace with automated tax handling, team seat pooling, and 1-click cancellation via your GitHub account settings.',
  },
];

export function FaqAccordion() {
  const [openIdx, setOpenIdx] = useState<number | null>(0);

  const toggle = (idx: number) => {
    setOpenIdx(openIdx === idx ? null : idx);
  };

  return (
    <section id="faq" style={{ maxWidth: 840, margin: '0 auto', padding: '4rem 1.5rem 6rem' }}>
      {/* Header */}
      <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
        <div className="badge-social-dark" style={{ marginBottom: '1rem' }}>
          <HelpCircle size={14} color="#2563eb" />
          <span>Got Questions?</span>
        </div>
        <h2 style={{ fontSize: 'clamp(2rem, 3.5vw, 2.75rem)', marginBottom: '0.75rem' }}>
          Frequently Asked Questions
        </h2>
        <p style={{ color: '#64748b', fontSize: '1.05rem', maxWidth: 540, margin: '0 auto' }}>
          Everything you need to know about Aeon AI PR Reviewer and GitHub App integration.
        </p>
      </div>

      {/* Accordion List */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
        {FAQS.map((faq, idx) => {
          const isOpen = openIdx === idx;
          return (
            <div key={idx} className="faq-item">
              <button
                onClick={() => toggle(idx)}
                className="faq-question-btn"
                aria-expanded={isOpen}
              >
                <span>{faq.q}</span>
                <ChevronDown
                  size={18}
                  style={{
                    color: '#64748b',
                    transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)',
                    transition: 'transform 0.2s ease',
                    flexShrink: 0,
                    marginLeft: '1rem',
                  }}
                />
              </button>

              <AnimatePresence initial={false}>
                {isOpen && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.2, ease: 'easeInOut' }}
                  >
                    <div className="faq-answer">
                      <div style={{ whiteSpace: 'pre-line' }}>{faq.a}</div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          );
        })}
      </div>
    </section>
  );
}
