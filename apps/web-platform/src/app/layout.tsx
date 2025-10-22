import type { Metadata } from 'next';
import { Inter, Plus_Jakarta_Sans } from 'next/font/google';
import { Providers } from './providers';
import './globals.css';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});

const plusJakarta = Plus_Jakarta_Sans({
  subsets: ['latin'],
  variable: '--font-plus-jakarta',
  display: 'swap',
});

export const metadata: Metadata = {
  title: {
    default: 'DryJets - On-Demand Dry Cleaning & Laundry Services',
    template: '%s | DryJets',
  },
  description:
    'Premium dry cleaning and laundry services delivered to your door. Book pickup, track your order in real-time, and get your clothes back fresh and clean.',
  keywords: [
    'dry cleaning',
    'laundry service',
    'on-demand cleaning',
    'pickup delivery',
    'professional dry cleaning',
  ],
  authors: [{ name: 'DryJets' }],
  creator: 'DryJets',
  publisher: 'DryJets',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL(process.env.NEXTAUTH_URL || 'https://dryjets.com'),
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://dryjets.com',
    siteName: 'DryJets',
    title: 'DryJets - On-Demand Dry Cleaning & Laundry Services',
    description:
      'Premium dry cleaning and laundry services delivered to your door.',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'DryJets - Premium Dry Cleaning Services',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'DryJets - On-Demand Dry Cleaning & Laundry Services',
    description:
      'Premium dry cleaning and laundry services delivered to your door.',
    images: ['/twitter-image.png'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  icons: {
    icon: '/favicon.ico',
    shortcut: '/favicon-16x16.png',
    apple: '/apple-touch-icon.png',
  },
  manifest: '/site.webmanifest',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.variable} ${plusJakarta.variable} font-sans antialiased`}>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
