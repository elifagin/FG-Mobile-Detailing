import type { Metadata } from 'next'
import { Inter, Sora } from 'next/font/google'
import './globals.css'
import Navbar from '@/components/navbar'

const inter = Inter({ 
  subsets: ['latin'],
  variable: '--font-body',
  display: 'swap'
})

const sora = Sora({ 
  subsets: ['latin'],
  variable: '--font-heading',
  display: 'swap'
})

export const metadata: Metadata = {
  metadataBase: new URL('https://detail-lab.store'),
  title: 'Detail Lab - Professional Mobile Auto Detailing in Connecticut',
  description: 'Professional mobile auto detailing services across Connecticut. We come to you with pro-grade equipment. Serving Greater Hartford Area with exterior, interior, and full detailing packages.',
  keywords: 'auto detailing, mobile detailing, car wash, Connecticut, Hartford, professional car care, vehicle detailing',
  authors: [{ name: 'Detail Lab' }],
  creator: 'Detail Lab',
  openGraph: {
    title: 'Detail Lab - Professional Mobile Auto Detailing in Connecticut',
    description: 'Professional mobile auto detailing services across Connecticut. We come to you with pro-grade equipment.',
    url: 'https://detail-lab.store',
    siteName: 'Detail Lab',
    locale: 'en_US',
    type: 'website',
    images: [
      {
        url: '/images/logo.png',
        width: 1200,
        height: 630,
        alt: 'Detail Lab Logo',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Detail Lab - Professional Mobile Auto Detailing in Connecticut',
    description: 'Professional mobile auto detailing services across Connecticut. We come to you with pro-grade equipment.',
    images: ['/images/logo.png'],
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
  verification: {
    google: '',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'LocalBusiness',
    name: 'Detail Lab',
    description: 'Professional mobile auto detailing services across Connecticut',
    url: 'https://detail-lab.store',
    telephone: '(860) 560-6294',
    email: 'efagin19@gmail.com',
    areaServed: {
      '@type': 'Place',
      name: 'Greater Hartford Area, Connecticut'
    },
    serviceType: 'Mobile Auto Detailing',
    priceRange: '$75-$300',
    address: {
      '@type': 'PostalAddress',
      addressRegion: 'Connecticut',
      addressCountry: 'US'
    },
    geo: {
      '@type': 'GeoCoordinates',
      latitude: 41.7658,
      longitude: -72.6734
    },
    openingHours: 'Mo-Su 08:00-18:00',
    image: 'https://detail-lab.store/images/logo.png',
    logo: 'https://detail-lab.store/images/logo.png'
  }

  return (
    <html lang="en" className={`${inter.variable} ${sora.variable}`}>
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body className="antialiased">
        <Navbar />
        <main>
          {children}
        </main>
      </body>
    </html>
  )
}