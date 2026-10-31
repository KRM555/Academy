// Centralized site configuration module.
// Contact channels are fed from environment variables when available.
// If a contact channel is not explicitly configured, it evaluates to null so the UI can safely omit it.

export interface SiteConfig {
  academyNameAr: string;
  academyNameEn: string;
  supportEmail: string;
  contactEmail: string;
  whatsappNumber: string | null;
  phoneNumber: string | null;
  facebookUrl: string | null;
  billingCurrency: 'SAR';
  trialClassMode: 'online_zoom';
}

export const siteConfig: SiteConfig = {
  academyNameAr: 'أكاديمية نور وبيان التعليمية',
  academyNameEn: 'Noor & Bayan Academy',
  supportEmail: process.env.SUPPORT_EMAIL || 'support@noor-bayan.com',
  contactEmail: process.env.CONTACT_EMAIL || 'info@noor-bayan.com',
  // Unset by default to prevent rendering fake placeholders.
  // The owner must configure real numbers in .env or OWNER_TODO.md
  whatsappNumber: process.env.VITE_WHATSAPP_NUMBER || process.env.WHATSAPP_NUMBER || null,
  phoneNumber: process.env.VITE_PHONE_NUMBER || process.env.PHONE_NUMBER || null,
  facebookUrl: process.env.VITE_FACEBOOK_URL || null,
  billingCurrency: 'SAR',
  trialClassMode: 'online_zoom',
};

export function getWhatsAppUrl(customText?: string): string | null {
  const num = siteConfig.whatsappNumber;
  if (!num) return null;
  const cleanNumber = num.replace(/[^0-9]/g, '');
  if (!cleanNumber) return null;
  const textParam = customText ? `?text=${encodeURIComponent(customText)}` : '';
  return `https://wa.me/${cleanNumber}${textParam}`;
}

