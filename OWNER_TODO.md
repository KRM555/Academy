# Noor & Bayan Academy — Owner Action Items (`OWNER_TODO.md`)

This checklist collects every item requiring authentic data, business confirmation, or operational setup from the academy owner. Per security and truth-in-advertising standards, fabricated placeholders have been removed or silenced.

---

## 1. Secrets & Production Configuration (P0 Security)
- [ ] **Generate `JWT_SECRET`**:
  Run `openssl rand -base64 32` and set `JWT_SECRET` in the environment / Cloud Run secret manager.
- [ ] **Generate `ENCRYPTION_KEY`**:
  Run `openssl rand -hex 32` and set `ENCRYPTION_KEY` for AES-256-GCM encryption of sensitive financial records (teacher IBANs).
- [ ] **Set Initial Admin Account**:
  Generate an initial bcrypt password hash:
  ```bash
  node -e "console.log(require('bcryptjs').hashSync('YOUR_ACTUAL_PASSWORD', 12))"
  ```
  Set `ADMIN_EMAIL` and `ADMIN_PASSWORD_HASH` in the environment.
- [ ] **Create/Manage Staff Users**:
  Use the CLI tool `npm run user:create` (or `node scripts/manage-users.js`) to provision or reset admin and teacher accounts with bcrypt hashing.

---

## 2. Database & Persistent Storage (P0 Security)
- [ ] **Provision PostgreSQL Instance**:
  Cloud Run containers have ephemeral filesystems. Modules must store users, courses, students, inquiries, and payouts in PostgreSQL.
- [ ] **Set `DATABASE_URL`**:
  Configure `DATABASE_URL` (e.g. `postgres://user:password@cloudsql-instance:5432/noor_bayan`).
  *Note:* In local development when `DATABASE_URL` is empty, the application runs on a local fallback repository with console warnings. In `production`, boot strictly fails fast if `DATABASE_URL` is not provided.

---

## 3. Contact Information & Identity
- [ ] **Confirm Official WhatsApp Number**:
  Update `siteConfig.ts` with the academy's verified WhatsApp business number (replacing placeholder `+966500000000`).
- [ ] **Confirm Official Phone Number**:
  Set the real telephone number for parent inquiries.
- [ ] **Confirm Official Emails**:
  Consolidate onto a single verified domain email (e.g. `support@noor-bayan.com` and `info@noor-bayan.com`).
- [ ] **Configure Transactional Email Service**:
  To deliver `/api/contact/submit` inquiries directly to the academy inbox, set up an SMTP or API key (e.g., Resend, Postmark, SendGrid). Until configured, incoming inquiries are securely stored in the database for admin viewing.

---

## 4. Course Offerings & Instructor Credentials
- [ ] **Verify Course Instructors & Qualifications**:
  Confirm real scholar/teacher names, Ijazah credentials, and bios. Unverified names like "الشيخ عبد الرحمن الغامدي" have been removed from public marketing to avoid deceptive claims.
- [ ] **Confirm Course Pricing & Billing Terms**:
  Explicitly specify whether fees are per month, per course level, or per 4-week cycle. Converted currencies are labelled "تقريبي / approximate" and billed in Saudi Riyals (SAR).

---

## 5. Authentic Testimonials & Social Proof
- [ ] **Provide Consented Parent Reviews**:
  Fabricated student reviews and fictitious rating claims ("+1,840 reviews", "99.2% satisfaction") have been removed. Provide real reviews from parents with written consent to publish. The reviews section is hidden until real entries are added.

---

## 6. Student Progress & Sample Showcase
- [ ] **Sample Progress Showcase**:
  The demo child progress showcase has been clearly marked as a sample demonstration (**نموذج استرشادي توضيحي**) so prospective parents understand it is an illustrative preview of the student portal, rather than a real minor's private record or real certificate.

---

## 7. Media & Photography
- [ ] **Replace AI-generated Imagery of Children**:
  Synthetic depictions of children have been moved to illustrations or marked. Provide authentic photography of live online sessions, or authorized illustrative graphics with parental model releases.

---

## 8. Legal Policies (PDPL / Privacy / Terms)
- [ ] **Legal Review of Privacy Policy & Terms of Service**:
  The draft documents in `LegalPages.tsx` have been updated to truthfully describe actual data handling (session cookies, student progress tracking, parent contact inquiries) without claiming unsubstantiated international compliance certifications. A qualified legal counsel in Saudi Arabia should review them prior to full commercial rollout.
- [ ] **Data Deletion Process**:
  Confirm the support email address where parents can request complete deletion of their child's records.
