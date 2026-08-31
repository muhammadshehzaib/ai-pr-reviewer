import Link from 'next/link';
import { Cpu, ArrowLeft, ShieldCheck } from 'lucide-react';

export const metadata = {
  title: 'Privacy Policy — Aeon AI PR Reviewer',
  description: 'Learn how Aeon handles your repository code, API keys, and privacy with zero AI training on user code.',
};

export default function PrivacyPage() {
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
          <ShieldCheck size={18} />
          <span className="section-label" style={{ color: 'var(--accent)' }}>Privacy & Data Governance</span>
        </div>

        <h1 style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>Privacy Policy</h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '2.5rem' }}>
          Last updated: September 1, 2026 • Effective immediately
        </p>

        <div className="legal-prose">
          <h2>1. Core Commitment: Zero AI Model Training</h2>
          <p>
            At Aeon, we treat your source code as strictly confidential. <strong>Your source code, diffs, pull request metadata, and repository contents are NEVER used to train, retrain, or fine-tune public or proprietary AI models.</strong>
          </p>
          <p>
            Code diffs are processed strictly in RAM during review execution and are purged immediately after the review comments are posted to your GitHub pull request.
          </p>

          <h2>2. Information We Collect</h2>
          <p>To provide automated code reviews and manage your GitHub App installation, we collect:</p>
          <ul>
            <li><strong>GitHub Account Information:</strong> GitHub User ID, username, email address, and avatar URL provided via OAuth authorization.</li>
            <li><strong>Repository Metadata:</strong> Repository IDs, full names, and public/private status of repositories you explicitly grant access to.</li>
            <li><strong>Usage Metrics:</strong> Monthly counts of processed pull requests to enforce billing quotas.</li>
            <li><strong>Encrypted API Keys (Optional):</strong> If you bring your own AI provider keys, they are encrypted at rest with AES-256-GCM and scrypt before storage.</li>
          </ul>

          <h2>3. Security Architecture & Encryption</h2>
          <p>
            We adhere to rigorous security standards to protect your credentials and data:
          </p>
          <ul>
            <li><strong>AES-256-GCM Encryption:</strong> All sensitive API keys in the Vault are encrypted with uniquely salted keys.</li>
            <li><strong>Short-Lived Installation Tokens:</strong> GitHub App tokens are generated on-demand with a maximum lifetime of 60 minutes.</li>
            <li><strong>HTTPS/TLS 1.3:</strong> All communications between GitHub, our API servers, and AI providers are encrypted in transit.</li>
          </ul>

          <h2>4. Third-Party AI Sub-Processors</h2>
          <p>
            When a code review is requested, code diffs are transmitted securely to enterprise AI inference APIs (e.g. Google Gemini, Anthropic Claude, OpenAI, or xAI) strictly for inference. All sub-processors adhere to commercial zero-data-retention APIs where customer data is not retained for training.
          </p>

          <h2>5. Data Retention & Deletion</h2>
          <p>
            You can revoke access to Aeon at any time by uninstalling the GitHub App from your GitHub account or disconnecting individual repositories. Upon account deletion, all associated repository records, encrypted keys, and job history are permanently purged from our databases.
          </p>

          <h2>6. Contact Us</h2>
          <p>
            If you have questions regarding this Privacy Policy or your data, please contact our data protection team at:
            <br />
            <strong>Email:</strong> <a href="mailto:support@shehzaib.com" style={{ color: 'var(--accent)' }}>support@shehzaib.com</a>
          </p>
        </div>
      </main>
    </div>
  );
}
