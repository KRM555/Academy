import React from 'react';
import { Helmet } from 'react-helmet-async';
import { useLocation } from 'react-router-dom';
import { Language } from '../data/translations';
import { ROUTE_SEO, NOT_FOUND_SEO, RouteSeoData } from '../config/seoConfig';

interface PageSeoProps {
  currentLanguage?: Language;
  customData?: Partial<RouteSeoData>;
}

export const PageSeo: React.FC<PageSeoProps> = ({
  currentLanguage = 'ar',
  customData,
}) => {
  const location = useLocation();
  const path = location.pathname;

  // Retrieve base config for current route or fallback
  const routeConfig = ROUTE_SEO[path] || ROUTE_SEO[path.replace(/\/$/, '')];
  const defaultMeta = routeConfig ? routeConfig[currentLanguage] : NOT_FOUND_SEO[currentLanguage];

  const meta: RouteSeoData = {
    ...defaultMeta,
    ...customData,
  };

  // Determine current origin and canonical URL
  const origin =
    typeof window !== 'undefined' && window.location.origin
      ? window.location.origin
      : 'https://academy.com';

  const cleanPath = path === '/' ? '' : path.replace(/\/+$/, '');
  const canonicalUrl = `${origin}${cleanPath || '/'}`;

  // Image URL resolution
  const relativeImage = meta.image || '/images/hero_learning.jpg';
  const absoluteImageUrl = relativeImage.startsWith('http')
    ? relativeImage
    : `${origin}${relativeImage}`;

  const siteName =
    currentLanguage === 'ar'
      ? 'أكاديمية نور وبيان التعليمية للأطفال'
      : 'Noor & Bayan Academy for Kids';

  const locale = currentLanguage === 'ar' ? 'ar_SA' : 'en_US';

  return (
    <Helmet>
      {/* HTML Language & Direction Attributes */}
      <html lang={currentLanguage} dir={currentLanguage === 'ar' ? 'rtl' : 'ltr'} />

      {/* Primary Page Title & Description */}
      <title>{meta.title}</title>
      <meta name="description" content={meta.description} />

      {/* Canonical URL */}
      <link rel="canonical" href={canonicalUrl} />

      {/* OpenGraph Protocol Tags */}
      <meta property="og:site_name" content={siteName} />
      <meta property="og:type" content="website" />
      <meta property="og:title" content={meta.ogTitle || meta.title} />
      <meta property="og:description" content={meta.ogDescription || meta.description} />
      <meta property="og:url" content={canonicalUrl} />
      <meta property="og:image" content={absoluteImageUrl} />
      <meta property="og:locale" content={locale} />

      {/* Twitter Cards */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={meta.ogTitle || meta.title} />
      <meta name="twitter:description" content={meta.ogDescription || meta.description} />
      <meta name="twitter:image" content={absoluteImageUrl} />

      {/* Search Engine Robots Indexing Directive */}
      {meta.noindex ? (
        <meta name="robots" content="noindex, nofollow" />
      ) : (
        <meta name="robots" content="index, follow, max-snippet:-1, max-image-preview:large, max-video-preview:-1" />
      )}

      {/* Structured Data (Schema.org JSON-LD) */}
      {meta.structuredData && (
        <script type="application/ld+json">
          {JSON.stringify(meta.structuredData)}
        </script>
      )}
    </Helmet>
  );
};
