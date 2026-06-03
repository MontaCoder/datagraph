import type { Metadata, Viewport } from 'next';
import { Archivo, Geist, Geist_Mono } from 'next/font/google';
import './globals.css';
import { Toaster } from 'sonner';
import { UserLimitsProvider } from '@/hooks/UserLimitsContext';
import { APP_NAME, APP_URL } from '@/lib/utils';
import PlausibleProvider from 'next-plausible';
import { ThemeProvider } from '@/components/theme-provider';

const archivo = Archivo({
  variable: '--font-display',
  subsets: ['latin'],
  weight: ['400', '500', '600', '700', '800', '900'],
  style: ['normal', 'italic'],
});

const geistSans = Geist({
  variable: '--font-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-mono',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  metadataBase: new URL(APP_URL),
  title: `${APP_NAME} — A precision instrument for your spreadsheets`,
  description:
    'Upload a CSV. Ask in plain language. Receive code, charts, and the answer — plotted, sandboxed, and reproducible. The data instrument for your spreadsheets.',
  alternates: {
    canonical: '/',
  },
  openGraph: {
    type: 'website',
    url: APP_URL,
    title: `${APP_NAME} — A precision instrument for your spreadsheets`,
    description:
      'Upload a CSV. Ask in plain language. Receive code, charts, and the answer — plotted, sandboxed, and reproducible.',
    images: [
      {
        url: `${APP_URL}/og.jpg`,
        width: 1200,
        height: 630,
        alt: `${APP_NAME}`,
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    images: [`${APP_URL}/og.jpg`],
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: [
    { media: '(prefers-color-scheme: dark)', color: '#08090c' },
    { media: '(prefers-color-scheme: light)', color: '#eceee5' },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang='en' suppressHydrationWarning>
      <head>
        {process.env.NEXT_PUBLIC_PLAUSIBLE_DOMAIN && (
          <PlausibleProvider
            src='https://plausible.io/js/script.js'
            scriptProps={
              {
                'data-domain': process.env.NEXT_PUBLIC_PLAUSIBLE_DOMAIN,
              } as unknown as React.ComponentProps<
                typeof PlausibleProvider
              >['scriptProps']
            }
          />
        )}
        {/* Pre-hydration theme script — set the class before paint to
            avoid a flash. Falls back to dark when storage is empty. */}
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var t=localStorage.getItem('datagraph-theme')||'dark';document.documentElement.classList.add(t);}catch(e){document.documentElement.classList.add('dark');}})();`,
          }}
        />
      </head>
      <body
        className={`${archivo.variable} ${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <ThemeProvider>
          <UserLimitsProvider>
            {children}
            <Toaster
              position='bottom-right'
              toastOptions={{
                style: {
                  background: 'var(--surface)',
                  color: 'var(--bone)',
                  border: '1px solid var(--rule)',
                  fontFamily: 'var(--font-sans)',
                  borderRadius: '4px',
                },
              }}
            />
          </UserLimitsProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
