/**
 * Quranic Certificate & Poster Studio Engine
 * Handles Islamic ornamental geometry, canvas rendering, text typography, and verification codes.
 */

export type CertificateTemplateType = 'completion' | 'star_student' | 'qaidah_diploma';

export interface CertificateTheme {
  id: string;
  nameAr: string;
  nameEn: string;
  bgGradientStart: string;
  bgGradientEnd: string;
  primaryGold: string;
  secondaryGold: string;
  accentColor: string;
  textColor: string;
  subtitleColor: string;
  borderGold: string;
  sealColor: string;
}

export interface CertificateData {
  studentName: string;
  studentAge?: number;
  templateType: CertificateTemplateType;
  trackTitle: string;
  achievementTitle: string; // e.g. "حفظ وإتقان جزء عم كاملاً"
  congratulationText: string;
  quranAyah: string;
  teacherName: string;
  supervisorName: string;
  issueDate: string;
  grade: string; // e.g. "ممتاز مع مرتبة الشرف"
  verificationCode: string;
  showSeal: boolean;
  themeId: string;
}

export const CERTIFICATE_THEMES: Record<string, CertificateTheme> = {
  emerald_gold: {
    id: 'emerald_gold',
    nameAr: 'الزمردي الملكي والذهب',
    nameEn: 'Royal Emerald & Gold',
    bgGradientStart: '#FAF7F0',
    bgGradientEnd: '#F2EDE0',
    primaryGold: '#D4AF37',
    secondaryGold: '#AA7C11',
    accentColor: '#064E3B',
    textColor: '#0B291D',
    subtitleColor: '#166534',
    borderGold: '#C59B27',
    sealColor: '#B8860B',
  },
  sapphire_gold: {
    id: 'sapphire_gold',
    nameAr: 'الياقوتي الكحلي والذهب',
    nameEn: 'Sapphire Navy & Gold',
    bgGradientStart: '#F7FAFC',
    bgGradientEnd: '#EBF2F7',
    primaryGold: '#DFB15B',
    secondaryGold: '#9A7422',
    accentColor: '#0F2942',
    textColor: '#071626',
    subtitleColor: '#1E3A5F',
    borderGold: '#D4AF37',
    sealColor: '#C69214',
  },
  antique_parchment: {
    id: 'antique_parchment',
    nameAr: 'العاجي المعتق والأندلسي',
    nameEn: 'Antique Parchment & Andalusian',
    bgGradientStart: '#FFFDF9',
    bgGradientEnd: '#F5EFE6',
    primaryGold: '#C59B27',
    secondaryGold: '#8B6508',
    accentColor: '#581C87',
    textColor: '#2E1065',
    subtitleColor: '#6B21A8',
    borderGold: '#D4AF37',
    sealColor: '#A855F7',
  },
};

/**
 * Generate a deterministic & verifiable certificate serial code
 */
export function generateVerificationCode(studentName: string, date: string, achievement: string): string {
  const cleanName = (studentName || 'Student').trim().replace(/\s+/g, '');
  let hash = 0;
  const seed = `${cleanName}-${date}-${achievement}`;
  for (let i = 0; i < seed.length; i++) {
    const char = seed.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash |= 0;
  }
  const positive = Math.abs(hash);
  const hex = positive.toString(16).toUpperCase().padStart(6, '0').slice(0, 6);
  const year = new Date().getFullYear();
  return `NB-QRN-${year}-${hex}`;
}

/**
 * Draw an 8-pointed Islamic Star (Rub el Hizb)
 */
export function drawIslamicStar(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  radius: number,
  color: string,
  fill = true
) {
  const spikes = 8;
  const outerRadius = radius;
  const innerRadius = radius * 0.58;
  let rot = (Math.PI / 2) * 3;
  let x = cx;
  let y = cy;
  const step = Math.PI / spikes;

  ctx.beginPath();
  ctx.moveTo(cx, cy - outerRadius);

  for (let i = 0; i < spikes; i++) {
    x = cx + Math.cos(rot) * outerRadius;
    y = cy + Math.sin(rot) * outerRadius;
    ctx.lineTo(x, y);
    rot += step;

    x = cx + Math.cos(rot) * innerRadius;
    y = cy + Math.sin(rot) * innerRadius;
    ctx.lineTo(x, y);
    rot += step;
  }
  ctx.lineTo(cx, cy - outerRadius);
  ctx.closePath();

  if (fill) {
    ctx.fillStyle = color;
    ctx.fill();
  } else {
    ctx.strokeStyle = color;
    ctx.lineWidth = 2;
    ctx.stroke();
  }
}

/**
 * Draw Ornamental Corner Flourish
 */
export function drawOrnamentalCorner(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  size: number,
  dirX: 1 | -1,
  dirY: 1 | -1,
  goldColor: string
) {
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(dirX, dirY);

  // Outer corner arc
  ctx.strokeStyle = goldColor;
  ctx.lineWidth = 2.5;
  ctx.beginPath();
  ctx.moveTo(0, size);
  ctx.lineTo(0, 0);
  ctx.lineTo(size, 0);
  ctx.stroke();

  // Inner decorative arc
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(10, size - 8);
  ctx.lineTo(10, 10);
  ctx.lineTo(size - 8, 10);
  ctx.stroke();

  // 45-degree diagonal line
  ctx.beginPath();
  ctx.moveTo(0, 0);
  ctx.lineTo(size * 0.45, size * 0.45);
  ctx.stroke();

  // Little rosette at inner corner
  drawIslamicStar(ctx, 18, 18, 6, goldColor, true);

  ctx.restore();
}

/**
 * Render the entire certificate onto an HTML5 2D Canvas
 * Native canvas dimensions: width x height (e.g. 1400 x 950 or 2400 x 1628)
 */
export function renderCertificateToCanvas(
  canvas: HTMLCanvasElement,
  data: CertificateData,
  exportScale = 1
) {
  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  const baseW = 1400;
  const baseH = 950;
  const w = baseW * exportScale;
  const h = baseH * exportScale;

  canvas.width = w;
  canvas.height = h;

  const theme = CERTIFICATE_THEMES[data.themeId] || CERTIFICATE_THEMES.emerald_gold;

  // 1. Background Fill with subtle radial parchment gradient
  const bgGrad = ctx.createRadialGradient(w / 2, h / 2, 80 * exportScale, w / 2, h / 2, w * 0.7);
  bgGrad.addColorStop(0, theme.bgGradientStart);
  bgGrad.addColorStop(1, theme.bgGradientEnd);
  ctx.fillStyle = bgGrad;
  ctx.fillRect(0, 0, w, h);

  // Subtle background watermark pattern (repeating geometric circles)
  ctx.save();
  ctx.globalAlpha = 0.035;
  ctx.strokeStyle = theme.primaryGold;
  ctx.lineWidth = 1 * exportScale;
  for (let r = 100 * exportScale; r <= w / 2; r += 60 * exportScale) {
    ctx.beginPath();
    ctx.arc(w / 2, h / 2, r, 0, Math.PI * 2);
    ctx.stroke();
  }
  ctx.restore();

  // 2. Ornamental Multi-Tier Border Frames
  const padOuter = 32 * exportScale;
  const padInner = 48 * exportScale;
  const padDetail = 56 * exportScale;

  // Outer primary gold border
  ctx.strokeStyle = theme.borderGold;
  ctx.lineWidth = 4 * exportScale;
  ctx.strokeRect(padOuter, padOuter, w - padOuter * 2, h - padOuter * 2);

  // Secondary thin gold outline
  ctx.strokeStyle = theme.secondaryGold;
  ctx.lineWidth = 1 * exportScale;
  ctx.strokeRect(padOuter + 6 * exportScale, padOuter + 6 * exportScale, w - (padOuter + 6 * exportScale) * 2, h - (padOuter + 6 * exportScale) * 2);

  // Inner accent line
  ctx.strokeStyle = theme.accentColor;
  ctx.lineWidth = 2 * exportScale;
  ctx.strokeRect(padInner, padInner, w - padInner * 2, h - padInner * 2);

  // Dotted fine frame
  ctx.save();
  ctx.strokeStyle = theme.primaryGold;
  ctx.lineWidth = 1 * exportScale;
  ctx.setLineDash([4 * exportScale, 4 * exportScale]);
  ctx.strokeRect(padDetail, padDetail, w - padDetail * 2, h - padDetail * 2);
  ctx.restore();

  // 3. Four Ornamental Corners
  const cornerSize = 75 * exportScale;
  drawOrnamentalCorner(ctx, padDetail, padDetail, cornerSize, 1, 1, theme.primaryGold);
  drawOrnamentalCorner(ctx, w - padDetail, padDetail, cornerSize, -1, 1, theme.primaryGold);
  drawOrnamentalCorner(ctx, padDetail, h - padDetail, cornerSize, 1, -1, theme.primaryGold);
  drawOrnamentalCorner(ctx, w - padDetail, h - padDetail, cornerSize, -1, -1, theme.primaryGold);

  // 4. Top Header Calligraphy & Academy Emblem
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';

  // Centered Top Star Rosette
  drawIslamicStar(ctx, w / 2, padDetail + 15 * exportScale, 14 * exportScale, theme.primaryGold, true);

  // Decorative top wings
  ctx.strokeStyle = theme.primaryGold;
  ctx.lineWidth = 1.5 * exportScale;
  ctx.beginPath();
  ctx.moveTo(w / 2 - 30 * exportScale, padDetail + 15 * exportScale);
  ctx.lineTo(w / 2 - 120 * exportScale, padDetail + 15 * exportScale);
  ctx.moveTo(w / 2 + 30 * exportScale, padDetail + 15 * exportScale);
  ctx.lineTo(w / 2 + 120 * exportScale, padDetail + 15 * exportScale);
  ctx.stroke();

  // "بسم الله الرحمن الرحيم"
  ctx.fillStyle = theme.accentColor;
  ctx.font = `bold ${22 * exportScale}px 'Amiri', 'Traditional Arabic', 'Tajawal', serif`;
  ctx.fillText('بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ', w / 2, 115 * exportScale);

  // Academy Name & Subtitle
  ctx.fillStyle = theme.secondaryGold;
  ctx.font = `600 ${15 * exportScale}px 'Tajawal', sans-serif`;
  ctx.fillText('مَنَصَّةُ أَكَادِيمِيَّةِ نُورٍ وَبَيَانٍ التَّعْلِيمِيَّةِ لِلْقُرْآنِ الْكَرِيمِ', w / 2, 148 * exportScale);

  // 5. Main Certificate Title Banner
  let mainTitle = 'شَهَادَةُ تَقْدِيرٍ وَإِتْقَانٍ';
  if (data.templateType === 'star_student') {
    mainTitle = 'وِسَامُ بَطَلِ الأُسْبُوعِ القُرْآنِيِّ';
  } else if (data.templateType === 'qaidah_diploma') {
    mainTitle = 'إِجَازَةُ إِتْمَامِ مَسَارِ التَّأْسِيسِ القُرْآنِيِّ';
  }

  // Title Box background ribbon
  const ribbonW = 540 * exportScale;
  const ribbonH = 50 * exportScale;
  const ribbonY = 175 * exportScale;

  ctx.fillStyle = theme.accentColor;
  ctx.beginPath();
  ctx.roundRect(w / 2 - ribbonW / 2, ribbonY, ribbonW, ribbonH, 10 * exportScale);
  ctx.fill();

  ctx.strokeStyle = theme.primaryGold;
  ctx.lineWidth = 2 * exportScale;
  ctx.stroke();

  // Title Text inside ribbon
  ctx.fillStyle = '#FFFFFF';
  ctx.font = `bold ${26 * exportScale}px 'Tajawal', 'Amiri', sans-serif`;
  ctx.fillText(mainTitle, w / 2, ribbonY + ribbonH / 2);

  // Quran Ayah citation under title
  if (data.quranAyah) {
    ctx.fillStyle = theme.subtitleColor;
    ctx.font = `italic 500 ${15 * exportScale}px 'Amiri', 'Traditional Arabic', serif`;
    ctx.fillText(`﴿ ${data.quranAyah} ﴾`, w / 2, 252 * exportScale);
  }

  // 6. Presentation Text
  ctx.fillStyle = theme.textColor;
  ctx.font = `500 ${17 * exportScale}px 'Tajawal', sans-serif`;
  ctx.fillText('تَشْهَدُ إِدَارَةُ الأَكَادِيمِيَّةِ وَالهَيْئَةُ التَّعْلِيمِيَّةُ بِأَنَّ الطَّالِبَ المُمَيَّزَ:', w / 2, 298 * exportScale);

  // 7. Student Name (Hero Calligraphic Presentation)
  const studentNameY = 358 * exportScale;
  ctx.fillStyle = theme.accentColor;
  ctx.font = `bold ${38 * exportScale}px 'Amiri', 'Tajawal', sans-serif`;
  ctx.fillText(data.studentName || 'اسم الطالب الكريم', w / 2, studentNameY);

  // Decorative Golden Calligraphic Flourish Underline
  ctx.strokeStyle = theme.primaryGold;
  ctx.lineWidth = 2 * exportScale;
  ctx.beginPath();
  ctx.moveTo(w / 2 - 180 * exportScale, studentNameY + 24 * exportScale);
  ctx.lineTo(w / 2 + 180 * exportScale, studentNameY + 24 * exportScale);
  ctx.stroke();

  drawIslamicStar(ctx, w / 2, studentNameY + 24 * exportScale, 7 * exportScale, theme.primaryGold, true);

  // 8. Achievement Details Box
  const achBoxW = 980 * exportScale;
  const achBoxH = 145 * exportScale;
  const achBoxY = 415 * exportScale;

  // Background tint
  ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
  ctx.beginPath();
  ctx.roundRect(w / 2 - achBoxW / 2, achBoxY, achBoxW, achBoxH, 16 * exportScale);
  ctx.fill();

  ctx.strokeStyle = theme.primaryGold;
  ctx.lineWidth = 1.2 * exportScale;
  ctx.stroke();

  // Achievement narrative text
  ctx.fillStyle = theme.textColor;
  ctx.font = `bold ${19 * exportScale}px 'Tajawal', sans-serif`;
  ctx.fillText(`قَدْ أَتَمَّ بِنَجَاحٍ وَإِتْقَانٍ مُبَارَكٍ: ${data.achievementTitle}`, w / 2, achBoxY + 38 * exportScale);

  ctx.fillStyle = theme.subtitleColor;
  ctx.font = `500 ${16 * exportScale}px 'Tajawal', sans-serif`;
  ctx.fillText(`ضِمْنَ مَسَارِ: [ ${data.trackTitle} ] - تَقْدِيرُ النَّتِيجَةِ: [ ${data.grade} ]`, w / 2, achBoxY + 74 * exportScale);

  ctx.fillStyle = '#4B5563';
  ctx.font = `400 ${14 * exportScale}px 'Tajawal', sans-serif`;
  ctx.fillText(data.congratulationText, w / 2, achBoxY + 110 * exportScale);

  // 9. Official Gold Stamp / Seal (if enabled)
  if (data.showSeal) {
    const sealX = w / 2;
    const sealY = 645 * exportScale;
    const sealR = 52 * exportScale;

    // Outer Seal scalloped effect
    ctx.save();
    ctx.strokeStyle = theme.sealColor;
    ctx.fillStyle = '#FAF5E8';
    ctx.lineWidth = 2.5 * exportScale;
    ctx.beginPath();
    ctx.arc(sealX, sealY, sealR, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    // Inner seal circle
    ctx.setLineDash([3 * exportScale, 3 * exportScale]);
    ctx.beginPath();
    ctx.arc(sealX, sealY, sealR - 6 * exportScale, 0, Math.PI * 2);
    ctx.stroke();
    ctx.restore();

    // Seal text
    ctx.fillStyle = theme.sealColor;
    ctx.font = `bold ${10 * exportScale}px 'Tajawal', sans-serif`;
    ctx.fillText('خَتْمُ الاعْتِمَادِ الرَّسْمِيِّ', sealX, sealY - 20 * exportScale);

    drawIslamicStar(ctx, sealX, sealY, 11 * exportScale, theme.sealColor, true);

    ctx.font = `bold ${11 * exportScale}px 'Tajawal', sans-serif`;
    ctx.fillText('أَكَادِيمِيَّةُ نُورٍ وَبَيَانٍ', sealX, sealY + 22 * exportScale);
    ctx.font = `600 ${8 * exportScale}px sans-serif`;
    ctx.fillText('VERIFIED ACADEMY', sealX, sealY + 34 * exportScale);
  }

  // 10. Signatures & Bottom Authority
  const sigY = 755 * exportScale;
  const leftColX = 260 * exportScale;
  const rightColX = w - 260 * exportScale;

  // Teacher Column
  ctx.textAlign = 'center';
  ctx.fillStyle = theme.textColor;
  ctx.font = `bold ${15 * exportScale}px 'Tajawal', sans-serif`;
  ctx.fillText('مُعَلِّمُ الحَلْقَةِ المُجَازُ:', leftColX, sigY);

  ctx.fillStyle = theme.accentColor;
  ctx.font = `italic 600 ${17 * exportScale}px 'Amiri', serif`;
  ctx.fillText(data.teacherName, leftColX, sigY + 30 * exportScale);

  ctx.strokeStyle = theme.borderGold;
  ctx.lineWidth = 1 * exportScale;
  ctx.beginPath();
  ctx.moveTo(leftColX - 80 * exportScale, sigY + 45 * exportScale);
  ctx.lineTo(leftColX + 80 * exportScale, sigY + 45 * exportScale);
  ctx.stroke();

  // Supervisor Column
  ctx.fillStyle = theme.textColor;
  ctx.font = `bold ${15 * exportScale}px 'Tajawal', sans-serif`;
  ctx.fillText('المُشْرِفُ العَامُّ لِلأَكَادِيمِيَّةِ:', rightColX, sigY);

  ctx.fillStyle = theme.accentColor;
  ctx.font = `italic 600 ${17 * exportScale}px 'Amiri', serif`;
  ctx.fillText(data.supervisorName, rightColX, sigY + 30 * exportScale);

  ctx.strokeStyle = theme.borderGold;
  ctx.lineWidth = 1 * exportScale;
  ctx.beginPath();
  ctx.moveTo(rightColX - 80 * exportScale, sigY + 45 * exportScale);
  ctx.lineTo(rightColX + 80 * exportScale, sigY + 45 * exportScale);
  ctx.stroke();

  // 11. Footer Metadata & Verification Code
  const footerY = h - 68 * exportScale;
  ctx.fillStyle = '#64748B';
  ctx.font = `500 ${12 * exportScale}px 'Tajawal', monospace`;

  ctx.textAlign = 'right';
  ctx.fillText(`تَارِيخُ الإِصْدَارِ: ${data.issueDate}`, w - padDetail - 10 * exportScale, footerY);

  ctx.textAlign = 'left';
  ctx.fillText(`رَمْزُ التَّوْثِيقِ: ${data.verificationCode}`, padDetail + 10 * exportScale, footerY);

  ctx.textAlign = 'center';
  ctx.font = `400 ${11 * exportScale}px 'Tajawal', sans-serif`;
  ctx.fillText('تَصْدُرُ هَذِهِ الشَّهَادَةُ آلِيّاً عَبْرَ بَوَّابَةِ التَّعَلُّمِ الذَّكِيَّةِ لِأَكَادِيمِيَّةِ نُورٍ وَبَيَانٍ', w / 2, footerY);
}

/**
 * Trigger browser file download of high-resolution Canvas PNG
 */
export function downloadCanvasAsPng(canvas: HTMLCanvasElement, filename: string) {
  const link = document.createElement('a');
  link.download = `${filename}.png`;
  link.href = canvas.toDataURL('image/png', 1.0);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
