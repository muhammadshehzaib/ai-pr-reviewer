import Link from 'next/link';
import { Cpu, ArrowLeft, FileText } from 'lucide-react';

export const metadata = {
  title: 'Terms of Service — Aeon AI PR Reviewer',
  description: 'Terms and conditions governing the use of Aeon AI PR Reviewer service and GitHub App.',
};

export default function TermsPage() {
  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: '#ffffff' }}>
      {/* Floating Header */}
      <header className="nav-pill-wrapper">
        <nav className="nav-pill-container" style={{ position: 'relative' }}>
          <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', textDecoration: 'none' }}>
            <div
              style={{
                width: 28,
                height: 28,
                borderRadius: 8,
                background: 'linear-gradient(135deg, #007fff 0%, #1211ff 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#ffffff',
              }}
            >
              <Cpu size={16} strokeWidth={2.5} />
            </div>
            <span style={{ fontSize: '0.82rem', fontWeight: 700, letterSpacing: '0.14em', textTransform: 'uppercase', color: '#0f172a' }}>
              aeon.ai
            </span>
          </Link>
          <Link href="/" className="btn-secondary-pill" style={{ fontSize: '0.84rem', padding: '0.45rem 1rem' }}>
            <ArrowLeft size={14} /> Back to Home
          </Link>
        </nav>
      </header>

      <main className="legal-container">
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', color: '#2563eb', marginBottom: '1rem' }}>
          <FileText size={18} />
          <span className="section-label" style={{ color: '#2563eb' }}>Terms & Conditions</span>
        </div>

        <h1 style={{ fontSize: '2.5rem', marginBottom: '0.5rem', color: '#0f172a' }}>Terms of Service</h1>
        <p style={{ color: '#64748b', fontSize: '0.92rem', marginBottom: '2.5rem' }}>
          Last updated: September 1, 2026 • Effective immediately
        </p>

        <div className="legal-prose">
          <h2>1. Agreement to Terms</h2>
          <p>
            By installing the Aeon GitHub App or using the website, you agree to be bound by these Terms of Service. If you do not agree with any part of these terms, you must uninstall the GitHub App and discontinue use of the service.
          </p>

          <h2>2. Software Licensing (GNU AGPL-3.0)</h2>
          <p>
            The underlying code and application of Aeon is licensed under the <strong>GNU Affero General Public License v3.0 (AGPL-3.0)</strong>. You are free to inspect, modify, and host your own instance of the application provided you comply with all AGPL-3.0 provisions.
          </p>

          <h2>3. Free Tier & Subscription Billing</h2>
          <p>
            Aeon offers both free and paid tiers:
          </p>
          <ul>
            <li><strong>Free Tier:</strong> Includes unlimited reviews on public open-source repositories and up to 50 reviews per calendar month on private repositories.</li>
            <li><strong>Paid Plans (Indie / Team):</strong> Subscriptions are purchased and billed directly through <strong>GitHub Marketplace</strong>. GitHub acts as the merchant of record for all billing, tax collection, and recurring invoicing.</li>
            <li><strong>Cancellation:</strong> You may cancel or downgrade your subscription at any time via your GitHub account settings. Cancellations take effect at the end of the current billing cycle.</li>
          </ul>

          <h2>4. Acceptable Use Policy</h2>
          <p>You agree not to use the service to:</p>
          <ul>
            <li>Violate any local, national, or international laws or regulations.</li>
            <li>Attempt to reverse-engineer, exploit, or overwhelm the review queue infrastructure.</li>
            <li>Submit malicious code payloads designed to compromise backend review workers.</li>
          </ul>

          <h2>5. Limitation of Liability</h2>
          <p>
            Aeon provides automated code review suggestions for informational purposes. While we strive for high accuracy, automated suggestions do not constitute a guarantee against security vulnerabilities or software bugs. You remain solely responsible for validating and testing code prior to production deployment.
          </p>
        </div>
      </main>
    </div>
  );
}
