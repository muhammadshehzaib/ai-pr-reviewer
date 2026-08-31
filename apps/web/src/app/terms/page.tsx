import Link from 'next/link';
import { Cpu, ArrowLeft, FileText } from 'lucide-react';

export const metadata = {
  title: 'Terms of Service — Aeon AI PR Reviewer',
  description: 'Terms and conditions governing the use of Aeon AI PR Reviewer service and GitHub App.',
};

export default function TermsPage() {
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
          <FileText size={18} />
          <span className="section-label" style={{ color: 'var(--accent)' }}>Terms & Conditions</span>
        </div>

        <h1 style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>Terms of Service</h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '2.5rem' }}>
          Last updated: September 1, 2026 • Effective immediately
        </p>

        <div className="legal-prose">
          <h2>1. Agreement to Terms</h2>
          <p>
            By installing the Aeon GitHub App or using the website at <code>reviewer.shehzaib.com</code>, you agree to be bound by these Terms of Service. If you do not agree with any part of these terms, you must uninstall the GitHub App and discontinue use of the service.
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

          <h2>5. Disclaimers & Limitation of Liability</h2>
          <p>
            Aeon AI PR Reviewer provides automated code suggestions powered by large language models for informational and development aid purposes. <strong>AI-generated code reviews do not guarantee bug-free or completely secure software.</strong>
          </p>
          <p>
            The service is provided on an &ldquo;AS IS&rdquo; and &ldquo;AS AVAILABLE&rdquo; basis. In no event shall Aeon or its maintainers be liable for any indirect, incidental, special, or consequential damages resulting from the use or inability to use the service.
          </p>

          <h2>6. Changes to Terms</h2>
          <p>
            We reserve the right to modify these terms at any time. Continued use of the service following any updates constitutes acceptance of the modified Terms of Service.
          </p>

          <h2>7. Contact Information</h2>
          <p>
            For questions regarding these Terms, please reach out to:
            <br />
            <strong>Email:</strong> <a href="mailto:support@shehzaib.com" style={{ color: 'var(--accent)' }}>support@shehzaib.com</a>
          </p>
        </div>
      </main>
    </div>
  );
}
