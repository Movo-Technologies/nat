import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import './globals.css';
import { AnalyticsEvents } from '@/components/analytics-events';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  metadataBase: new URL('https://nat-early-access.temiadebayo1.chatgpt.site'),
  alternates: { canonical: '/' },
  robots: { index: false, follow: false },
  icons: { icon: '/favicon.svg' },
  openGraph: {
    title: 'Your website knows the answer. Now it can say it.',
    description:
      'Meet Nat: an AI customer engagement layer for websites. Join early access.',
    type: 'website',
    images: [
      {
        url: '/og.png',
        width: 1730,
        height: 909,
        alt: 'Nat — Your website knows the answer. Now it can say it. Private beta.',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Your website knows the answer. Now it can say it.',
    description:
      'Meet Nat: an AI customer engagement layer for websites. Join early access.',
    images: ['/og.png'],
  },
  title: 'Nat — AI customer engagement for websites',
  description:
    'Nat learns your website, answers visitor questions, takes messages and routes conversations to the right people. Join the private beta.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <a className="skip-link" href="#main">
          Skip to content
        </a>
        {children}
        <AnalyticsEvents />
      </body>
    </html>
  );
}
