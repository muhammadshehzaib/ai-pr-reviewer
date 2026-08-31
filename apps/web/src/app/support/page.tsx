import Link from 'next/link';
import { Cpu, ArrowLeft, HelpCircle, Mail, MessageSquare, BookOpen, ExternalLink } from 'lucide-react';

export const metadata = {
  title: 'Support & FAQs — Aeon AI PR Reviewer',
  description: 'Get help with Aeon GitHub App installation, .aipr.yml configuration, billing, and troubleshooting.',
};

const FAQS = [
  {
    q: 'How does Aeon review my pull requests?',
    a: 'When you open or update a PR, GitHub sends a webhook event to Aeon. Our backend analyzes the diff, applies your custom .aipr.yml rules, and posts inline suggestions directly to the modified lines of code on GitHub.',
  },
  {
    q: 'Is my proprietary code stored or used to train AI models?',
    a: 'No. Code diffs are held in memory only while the review is processing and then purged immediately. We never train or fine-tune models on your repository contents.',
  },
  {
    q: 'How do I ignore certain files (like lockfiles or dist/)?',
    a: 'Add a .aipr.yml or .github/.aipr.yml file to the root of your repository with an ignore list, e.g.:\n\nignore:\n  - "dist/**"\n  - "package-lock.json"\n  - "*.min.js"',
  },
  {
    q: 'What is included in the Free Plan?',
    a: 'The Free Plan includes unlimited automated reviews on public open-source repositories and up to 50 reviews per month on private repositories.',
  },
  {
    q: 'How do I upgrade or cancel my subscription?',
    a: 'All paid subscriptions are managed through GitHub Marketplace. You can upgrade, downgrade, or cancel at any time from your GitHub account settings.',
  },
  {
    q: 'Can I use my own OpenAI, Gemini, or Claude API key?',
    a: 'Yes! Navigate to the API Key Vault on your dashboard, enter your API key, and select your preferred provider. Your key is stored with AES-256-GCM encryption.',
  },
];

export default function SupportPage() {
  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <header className="landing-nav">
        <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
          <Cpu size={20} strokeWidth={2.25} color="var(--accent)" />
          <span style={{ fontWeight: 700, fontSize: '1.05rem' }}>Aeon</span>
        </Link>
        <Link href="/" className="btn-secondary" style={{ fontSize: '0.85rem', display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
          <ArrowLeft size={14} /> Back to Home
        </Link>
      </header>

      <main className="legal-container">
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', color: 'var(--accent)', marginBottom: '1rem' }}>
          <HelpCircle size={18} />
          <span className="section-label" style={{ color: 'var(--accent)' }}>Help & Documentation</span>
        </div>

        <h1 style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>Support Center</h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', marginBottom: '3rem' }}>
          Need assistance or have questions about Aeon? We are here to help.
        </p>

        {/* Contact Channels */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.25rem', marginBottom: '4rem' }}>
          <div className="glass-card">
            <Mail size={20} color="var(--accent)" style={{ marginBottom: '0.75rem' }} />
            <h3 className="card-title" style={{ marginBottom: '0.25rem' }}>Email Support</h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginBottom: '1rem' }}>
              Direct email support with our engineering team.
            </p>
            <a href="mailto:support@shehzaib.com" className="btn-secondary" style={{ fontSize: '0.8rem', display: 'inline-block' }}>
              support@shehzaib.com
            </a>
          </div>

          <div className="glass-card">
            <MessageSquare size={20} color="var(--accent)" style={{ marginBottom: '0.75rem' }} />
            <h3 className="card-title" style={{ marginBottom: '0.25rem' }}>GitHub Issues</h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginBottom: '1rem' }}>
              Report bugs or request features on GitHub.
            </p>
            <a
              href="https://github.com/muhammadshehzaib/ai-pr-reviewer/issues"
              target="_blank"
              rel="noreferrer"
              className="btn-secondary"
              style={{ fontSize: '0.8rem', display: 'inline-flex', alignItems: 'center', gap: '4px' }}
            >
              Open an Issue <ExternalLink size={12} />
            </a>
          </div>

          <div className="glass-card">
            <BookOpen size={20} color="var(--accent)" style={{ marginBottom: '0.75rem' }} />
            <h3 className="card-title" style={{ marginBottom: '0.25rem' }}>Repository Guide</h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginBottom: '1rem' }}>
              Configuration recipes and sample .aipr.yml.
            </p>
            <a
              href="https://github.com/muhammadshehzaib/ai-pr-reviewer#readme"
              target="_blank"
              rel="noreferrer"
              className="btn-secondary"
              style={{ fontSize: '0.8rem', display: 'inline-flex', alignItems: 'center', gap: '4px' }}
            >
              Read Docs <ExternalLink size={12} />
            </a>
          </div>
        </div>

        {/* FAQs */}
        <div>
          <h2 style={{ fontSize: '1.75rem', marginBottom: '1.5rem' }}>Frequently Asked Questions</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {FAQS.map((faq, idx) => (
              <div key={idx} className="glass-card" style={{ padding: '1.5rem' }}>
                <h3 style={{ fontSize: '1.05rem', fontWeight: 600, marginBottom: '0.5rem', color: 'var(--text-primary)' }}>
                  {faq.q}
                </h3>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', whiteSpace: 'pre-line', lineHeight: 1.6 }}>
                  {faq.a}
                </p>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
