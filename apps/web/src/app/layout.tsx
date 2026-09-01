import type { Metadata } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://pullpilot.ai"),
  title: {
    default: "PullPilot | AI PR Reviewer | Beautiful Code by Default",
    template: "%s | PullPilot AI",
  },
  description:
    "Automated AI code review for GitHub and GitLab pull requests. Catch timing attacks, N+1 query bottlenecks, and memory leaks with 1-click inline mergeable patches.",
  keywords: [
    "AI PR reviewer",
    "CodeRabbit alternative",
    "automated code review",
    "GitHub PR review bot",
    "AI code auditor",
    "Claude 5 code review",
    "ChatGPT 5.6 PR reviewer",
    "Gemini 3.0 Pro code review",
    "AST security scanner",
    "pull request automation",
    "GitLab AI code review",
  ],
  authors: [{ name: "PullPilot Team", url: "https://pullpilot.ai" }],
  creator: "PullPilot",
  publisher: "PullPilot",
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://pullpilot.ai",
    siteName: "PullPilot AI PR Reviewer",
    title: "PullPilot | AI PR Reviewer | Beautiful Code by Default",
    description:
      "Automated AI code review on every pull request with Claude 5, ChatGPT 5.6, and Gemini 3.0 Pro. Catch timing attacks, N+1 bottlenecks, and memory leaks.",
    images: [
      {
        url: "/icon.svg",
        width: 512,
        height: 512,
        alt: "PullPilot AI PR Reviewer Logo",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "PullPilot | AI PR Reviewer | Beautiful Code by Default",
    description:
      "Automated AI code review on every pull request with Claude 5, ChatGPT 5.6 & Gemini 3.0 Pro.",
    images: ["/icon.svg"],
    creator: "@pullpilot",
  },
  alternates: {
    canonical: "https://pullpilot.ai",
  },
  icons: {
    icon: [
      { url: "/icon.svg", type: "image/svg+xml" },
      { url: "/favicon.svg", type: "image/svg+xml" },
    ],
    apple: [{ url: "/icon.svg", type: "image/svg+xml" }],
  },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "SoftwareApplication",
      name: "PullPilot",
      applicationCategory: "DeveloperApplication",
      operatingSystem: "Cloud, Linux, Docker, macOS, Windows",
      url: "https://pullpilot.ai",
      offers: {
        "@type": "Offer",
        price: "0",
        priceCurrency: "USD",
      },
      description:
        "AI-powered code review bot that automatically scans pull request diffs for security vulnerabilities, performance regressions, and architectural bugs.",
      featureList: [
        "Multi-model AI switching (Claude 5, ChatGPT 5.6, Gemini 3.0 Pro, Grok 4)",
        "Zero code retention ephemeral RAM processing",
        "1-click inline GitHub mergeable patches",
        "Declarative .aipr.yml repository configuration",
        "GNU AGPL-3.0 auditable open core",
      ],
    },
    {
      "@type": "Organization",
      name: "PullPilot",
      url: "https://pullpilot.ai",
      logo: "https://pullpilot.ai/icon.svg",
      sameAs: [
        "https://github.com/muhammadshehzaib/ai-pr-reviewer",
        "https://twitter.com/pullpilot",
      ],
    },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable} ${jetbrainsMono.variable}`}>
      <head>
        <link rel="icon" type="image/svg+xml" href="/icon.svg" />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
