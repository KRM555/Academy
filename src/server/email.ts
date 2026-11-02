import nodemailer from 'nodemailer';

interface PasswordResetEmailOptions {
  to: string;
  userName?: string;
  resetLink: string;
  expiresInMinutes: number;
}

/**
 * Creates a transporter depending on environment configuration.
 * If SMTP credentials are provided, connects to real SMTP server.
 * Otherwise, falls back to a clean secure logger to output the reset link.
 */
function createEmailTransporter() {
  const host = process.env.SMTP_HOST;
  const port = parseInt(process.env.SMTP_PORT || '587', 10);
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;

  if (host && user && pass) {
    return nodemailer.createTransport({
      host,
      port,
      secure: port === 465,
      auth: { user, pass },
    });
  }

  return null;
}

export async function sendPasswordResetEmail(options: PasswordResetEmailOptions): Promise<{ success: boolean; simulated: boolean }> {
  const { to, userName, resetLink, expiresInMinutes } = options;
  const from = process.env.MAIL_FROM || 'أكاديمية نور وبيان <no-reply@noor-bayan.com>';
  const recipientName = userName || 'عضو الأكاديمية الكريم';

  const subject = 'رابط إعادة تعيين كلمة المرور | أكاديمية نور وبيان';
  const htmlContent = `
<!DOCTYPE html>
<html dir="rtl" lang="ar">
<head>
  <meta charset="utf-8">
  <title>إعادة تعيين كلمة المرور</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f8fafc; color: #1e293b; padding: 24px; margin: 0; }
    .container { max-width: 580px; margin: 0 auto; background: #ffffff; border-radius: 12px; overflow: hidden; border: 1px solid #e2e8f0; }
    .header { background: #0f766e; color: #ffffff; padding: 24px; text-align: center; }
    .header h1 { margin: 0; font-size: 22px; font-weight: bold; }
    .content { padding: 32px 24px; line-height: 1.7; }
    .btn-container { text-align: center; margin: 30px 0; }
    .btn { background: #0f766e; color: #ffffff !important; padding: 14px 28px; border-radius: 8px; text-decoration: none; font-weight: 600; display: inline-block; font-size: 16px; }
    .alt-link { background: #f1f5f9; padding: 12px; border-radius: 6px; word-break: break-all; font-family: monospace; font-size: 13px; color: #475569; }
    .footer { padding: 20px 24px; background: #f8fafc; text-align: center; font-size: 13px; color: #64748b; border-top: 1px solid #e2e8f0; }
    .badge { display: inline-block; background: #fef3c7; color: #92400e; padding: 4px 10px; border-radius: 9999px; font-size: 12px; font-weight: 600; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>أكاديمية نور وبيان</h1>
      <p style="margin: 4px 0 0 0; opacity: 0.9; font-size: 14px;">بوابة الإدارة وهيئة التدريس</p>
    </div>
    <div class="content">
      <p>السلام عليكم ورحمة الله وبركاته، <strong>${recipientName}</strong></p>
      <p>لقد تلقينا طلباً لإعادة تعيين كلمة المرور الخاصة بحسابك في أكاديمية نور وبيان.</p>
      <p>يرجى النقر على الزر أدناه لاختيار كلمة مرور جديدة قوية وآمنة:</p>
      
      <div class="btn-container">
        <a href="${resetLink}" class="btn">إعادة تعيين كلمة المرور</a>
      </div>

      <p><span class="badge">تنبيه أمني:</span> هذا الرابط صالح لمدة <strong>${expiresInMinutes} دقيقة</strong> فقط، ويمكن استخدامه لمرة واحدة.</p>
      
      <p style="margin-top: 24px; font-size: 14px; color: #475569;">
        إذا واجهت صعوبة في النقر على الزر، يمكنك نسخ الرابط التالي ولصقه في المتصفح مباشرة:
      </p>
      <div class="alt-link">${resetLink}</div>

      <p style="margin-top: 24px; font-size: 13px; color: #64748b;">
        إذا لم تقم بطلب إعادة تعيين كلمة المرور بنفسك، يرجى تجاهل هذه الرسالة؛ سيبقى حسابك آمناً تماماً ولن يتم إجراء أي تغيير.
      </p>
    </div>
    <div class="footer">
      <p style="margin: 0;">أكاديمية نور وبيان التعليمية — تعليم القرآن واللغة العربية والقيم</p>
      <p style="margin: 4px 0 0 0; font-size: 12px;">رسالة آلية مرسلة بنظام الأمان والمصادقة</p>
    </div>
  </div>
</body>
</html>
  `.trim();

  const textContent = `
أكاديمية نور وبيان - إعادة تعيين كلمة المرور
---------------------------------------------
السلام عليكم ورحمة الله، ${recipientName}

لقد تلقينا طلباً لإعادة تعيين كلمة المرور لحسابك في منصة أكاديمية نور وبيان.

لإعادة تعيين كلمة المرور، يرجى زيارة الرابط التالي:
${resetLink}

ملاحظة أمنية: هذا الرابط صالح لمدة ${expiresInMinutes} دقيقة فقط ويصلح للاستخدام لمرة واحدة فقط.
إذا لم تكن أنت من طلب ذلك، يمكنك تجاهل هذا البريد ولن يطرأ أي تغيير على حسابك.
  `.trim();

  const transporter = createEmailTransporter();
  if (transporter) {
    try {
      await transporter.sendMail({
        from,
        to,
        subject,
        text: textContent,
        html: htmlContent,
      });
      console.log(`[Email] Password reset email sent to: ${to}`);
      return { success: true, simulated: false };
    } catch (err) {
      console.error(`[Email ERROR] Failed to send email to ${to}:`, err);
      // Fallback to simulated log in case of SMTP connection error
    }
  }

  // Fallback: Secure local log for development and audit testing
  console.log(`\n======================================================`);
  console.log(`[EMAIL DISPATCH SIMULATOR] To: ${to}`);
  console.log(`[Subject] ${subject}`);
  console.log(`[Reset Link] ${resetLink}`);
  console.log(`[Expires In] ${expiresInMinutes} minutes`);
  console.log(`======================================================\n`);

  return { success: true, simulated: true };
}
