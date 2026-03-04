import { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
    return {
        rules: {
            userAgent: '*',
            allow: '/',
            disallow: ['/doctor/', '/patient/', '/admin/'],
        },
        sitemap: 'https://metamedmd.com/sitemap.xml',
    }
}
