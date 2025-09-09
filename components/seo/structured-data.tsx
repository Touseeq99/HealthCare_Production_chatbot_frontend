import { Metadata } from 'next'

interface StructuredDataProps {
  title: string
  description: string
  url: string
  siteName: string
  locale: string
  type?: string
}

export function generateStructuredData({
  title,
  description,
  url,
  siteName,
  locale = 'en_US',
  type = 'website',
}: StructuredDataProps) {
  const structuredData = {
    '@context': 'https://schema.org',
    '@type': type,
    name: title,
    description,
    url,
    publisher: {
      '@type': 'Organization',
      name: siteName,
      logo: {
        '@type': 'ImageObject',
        url: 'https://metamedmd.com/MetamedMDlogo.png',
      },
    },
    inLanguage: locale,
  }

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
    />
  )
}
