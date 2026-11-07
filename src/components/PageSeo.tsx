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
  const normalizedPath = path === '/' ? '/' : path.replace(/\/+$/, '');
  const routeConfig =
    ROUTE_SEO[normalizedPath] ||
    ROUTE_SEO[normalizedPath.toLowerCase()] ||
    (normalizedPath === '/dashboard' || normalizedPath === '/admin' || normalizedPath === '/login'
      ? ROUTE_SEO['/portal']
      : undefined);

  const defaultMeta = routeConfig ? routeConfig[currentLanguage] : NOT_FOUND_SEO[currentLanguage];

  const meta: RouteSeoData = {
    ...defaultMeta,
    ...customData,
  };

  // Determine current origin and canonical URL
  const origin =
    typeof window !== 'undefined' && window.location.origin
      ? window.location.origin
      : 'https://ais-pre-vq2cw5v7tz36zv77mkeex6-47880477325.europe-west2.run.app';

  const canonicalUrl = `${origin}${normalizedPath === '/' ? '' : normalizedPath}`;

  // Image URL resolution
  const relativeImage = meta.image || '/assets/aistudio/ad68bb5e-10ee-41b7-a098-9c5cc3c8235a_9effd3bc.jpg';
  const absoluteImageUrl = relativeImage.startsWith('http')
    ? relativeImage
    : `${origin}${relativeImage}`;

  // Determine MIME type
  const imageType =
    meta.imageType ||
    (relativeImage.endsWith('.png')
      ? 'image/png'
      : relativeImage.endsWith('.webp')
      ? 'image/webp'
      : 'image/jpeg');

  const imageAlt =
    meta.imageAlt ||
    meta.ogTitle ||
    meta.title ||
    (currentLanguage === 'ar'
      ? 'أكاديمية نور وبيان التعليمية للأطفال'
      : 'Noor & Bayan Academy for Kids');

  const siteName =
    currentLanguage === 'ar'
      ? 'أكاديمية نور وبيان التعليمية للأطفال'
      : 'Noor & Bayan Academy for Kids';

  const locale = currentLanguage === 'ar' ? 'ar_SA' : 'en_US';
  const alternateLocale = currentLanguage === 'ar' ? 'en_US' : 'ar_SA';

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
      <meta property="og:locale" content={locale} />
      <meta property="og:locale:alternate" content={alternateLocale} />

      {/* Dynamic OpenGraph Image Tags for Social Sharing */}
      <meta property="og:image" content={absoluteImageUrl} />
      <meta property="og:image:secure_url" content={absoluteImageUrl} />
      <meta property="og:image:type" content={imageType} />
      <meta property="og:image:width" content={String(meta.imageWidth || 1200)} />
      <meta property="og:image:height" content={String(meta.imageHeight || 630)} />
      <meta property="og:image:alt" content={imageAlt} />

      {/* Twitter / X Social Cards */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={meta.ogTitle || meta.title} />
      <meta name="twitter:description" content={meta.ogDescription || meta.description} />
      <meta name="twitter:image" content={absoluteImageUrl} />
      <meta name="twitter:image:alt" content={imageAlt} />
      <meta name="twitter:image:width" content={String(meta.imageWidth || 1200)} />
      <meta name="twitter:image:height" content={String(meta.imageHeight || 630)} />

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
