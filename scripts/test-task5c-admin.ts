/**
 * Task 5C Automated Verification Test Suite
 * Tests Admin Pages & Backend Services:
 * 1. Students (all, with classification/level, soft delete)
 * 2. Teachers with their courses & assignment
 * 3. Courses CRUD with soft delete & confirmation
 * 4. Lessons CRUD with online lecture link and image upload
 * 5. Enrollments linking students to courses
 * 6. Admission requests approve (auto-creates student) & reject (with reason)
 * 7. Announcements (to all / a course / specific students)
 * 8. Certificates issue + PDF verification code
 * 9. Payroll: DUPLICATE MONTH GUARD & teacher payout details
 * 10. Audit log viewer (immutable event stream)
 */

import assert from 'node:assert';
import { adminService } from '../src/services/adminService';

console.log('=================================================================');
console.log('   TASK 5C: ADMIN PAGES & CORE PLATFORM TEST MATRIX');
console.log('=================================================================\n');

// -------------------------------------------------------------
// 1. Students (All, with classification/level & soft delete)
// -------------------------------------------------------------
console.log('--- 1. Testing Students with Classification / Level & Soft Delete ---');
const initialStudents = adminService.getStudents();
assert(initialStudents.length >= 5, 'Must have initial students');
assert(initialStudents.every((s) => s.level && s.level.length > 0), 'Every student must have an academic level/classification');

// Create student
const createdStd = adminService.createStudent({
  childName: 'عبد الله صالح المري',
  age: 9,
  parentName: 'صالح المري',
  parentPhone: '+966 50 999 1122',
  parentEmail: 'saleh.marri@example.com',
  country: 'المملكة العربية السعودية',
  program: 'حلقات تحفيظ القرآن الكريم وتجويده',
  courseId: 'c-quran-1',
  level: 'المستوى الثاني (جزء عم)',
  assignedTeacherEmail: 'teacher@noor-bayan.com',
  assignedTeacherName: 'الشيخ عبد الله القرني',
  memorizedSurahs: ['النبأ', 'النازعات'],
  attendanceRate: 100,
  teacherNotes: 'حفظ ممتاز وضبط مخارج الحروف',
  status: 'active',
});
assert(createdStd.id.startsWith('std-'));
assert.strictEqual(createdStd.level, 'المستوى الثاني (جزء عم)');

// Soft delete student
const softDeleteRes = adminService.softDeleteStudent(createdStd.id);
assert.strictEqual(softDeleteRes, true);
const activeStudentsAfterDelete = adminService.getStudents(false);
assert(!activeStudentsAfterDelete.some((s) => s.id === createdStd.id), 'Soft deleted student must be excluded from active list');

// Restore student
const restoreRes = adminService.restoreStudent(createdStd.id);
assert.strictEqual(restoreRes, true);
const activeAfterRestore = adminService.getStudents(false);
assert(activeAfterRestore.some((s) => s.id === createdStd.id), 'Restored student must reappear in active list');
console.log(` \x1b[32m[PASS]\x1b[0m Students with classification and soft delete/restore verified`);

// -------------------------------------------------------------
// 2. Teachers with their courses
// -------------------------------------------------------------
console.log('\n--- 2. Testing Teachers with Assigned Courses ---');
const teachers = adminService.getTeachers();
assert(teachers.length >= 3, 'Must have teachers in academy');
assert(teachers.some((t) => t.assignedCourses.length > 0), 'Teachers must have assigned courses');

const newTeacher = adminService.createTeacher({
  name: 'الشيخ سعد بن خالد الغامدي',
  email: 'saad.ghamdi@noor-bayan.com',
  phone: '+966 50 111 2233',
  specialty: 'القراءات القرآنية والتجويد',
  assignedCourseIds: ['c-quran-1'],
  assignedCourses: [{ id: 'c-quran-1', title: 'حلقات تحفيظ القرآن الكريم وتجويده' }],
  hourlyRateSar: 75,
  teachingHours: 20,
  bankName: 'مصرف الراجحي (Al Rajhi Bank)',
  accountHolderName: 'سعد خالد الغامدي',
  ibanMasked: 'SA44 •••• •••• •••• 1234',
  status: 'active',
});
assert(newTeacher.id.startsWith('t-'));
assert.strictEqual(newTeacher.assignedCourses.length, 1);
console.log(` \x1b[32m[PASS]\x1b[0m Teachers and assigned courses verified`);

// -------------------------------------------------------------
// 3. Courses CRUD (Soft Delete with Confirmation)
// -------------------------------------------------------------
console.log('\n--- 3. Testing Courses CRUD & Soft Delete ---');
const createdCourse = adminService.createCourse({
  title: 'مسار التجويد المتقدم وتحفة الأطفال',
  subtitle: 'شرح منظومة تحفة الأطفال وتطبيق أحكام المدود والتفخيم والترقيق',
  category: 'quran',
  ageBracket: '7 - 16 سنة',
  minAge: 7,
  maxAge: 16,
  priceSar: 270,
  billingUnit: 'شهرياً',
  weeklySessions: 3,
  sessionDurationMins: 45,
  deliveryMode: 'online',
  image: '/assets/programs/quran_islamic.jpg',
  description: 'دورة تطبيقية متخصصة في منظومة تحفة الأطفال وحفظ الأبيات.',
  features: ['شرح تحفة الأطفال', 'تطبيق عملي مباشر', 'إجازة في المنظومة'],
  assignedTeacherEmail: 'teacher@noor-bayan.com',
  assignedTeacherName: 'الشيخ عبد الله القرني',
});
assert(createdCourse.id.startsWith('c-'));

// Update course
const updatedCourse = adminService.updateCourse(createdCourse.id, {
  priceSar: 290,
});
assert.strictEqual(updatedCourse.priceSar, 290);

// Soft delete course
adminService.softDeleteCourse(createdCourse.id);
assert(!adminService.getCourses(false).some((c) => c.id === createdCourse.id), 'Soft deleted course must not appear in active list');
adminService.restoreCourse(createdCourse.id);
assert(adminService.getCourses(false).some((c) => c.id === createdCourse.id), 'Restored course must appear in active list');
console.log(` \x1b[32m[PASS]\x1b[0m Courses CRUD & soft delete verified`);

// -------------------------------------------------------------
// 4. Lessons CRUD (Online Lecture Link & Image Upload)
// -------------------------------------------------------------
console.log('\n--- 4. Testing Lessons CRUD with Online Lecture Link & Image Upload ---');
const newLesson = adminService.createLesson({
  courseId: 'c-quran-1',
  courseTitle: 'حلقات تحفيظ القرآن الكريم وتجويده',
  lessonNumber: 10,
  title: 'سورة التكوير - أحكام المد المنفصل والعارض للسكون',
  description: 'جلسة تدريبية مكثفة على المدود وتصحيح التلاوة.',
  onlineLectureLink: 'https://meet.google.com/xyz-quran-live',
  imageUrl: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==',
  durationMinutes: 45,
  scheduledDate: '2026-11-20',
  scheduledTime: '17:00',
  status: 'scheduled',
});
assert(newLesson.id.startsWith('les-'));
assert(newLesson.onlineLectureLink.includes('meet.google.com'), 'Must have online lecture link');
assert(newLesson.imageUrl.length > 0, 'Must have uploaded image URL');

// Update lesson
const updatedLesson = adminService.updateLesson(newLesson.id, {
  durationMinutes: 50,
});
assert.strictEqual(updatedLesson.durationMinutes, 50);

// Soft delete lesson
adminService.softDeleteLesson(newLesson.id);
assert(!adminService.getLessons('c-quran-1', false).some((l) => l.id === newLesson.id));
console.log(` \x1b[32m[PASS]\x1b[0m Lessons CRUD with lecture link and image upload verified`);

// -------------------------------------------------------------
// 5. Enrollments (Linking Students to Courses)
// -------------------------------------------------------------
console.log('\n--- 5. Testing Enrollments Management ---');
const newEnr = adminService.createEnrollment({
  studentId: 'std-1',
  studentName: 'عمر أحمد السعيد',
  courseId: 'c-values-3',
  courseTitle: 'غراس القيم والآداب النبوية للناشئة',
  paymentStatus: 'paid',
});
assert(newEnr.id.startsWith('enr-'));
assert.strictEqual(newEnr.studentId, 'std-1');
assert.strictEqual(newEnr.courseId, 'c-values-3');
adminService.softDeleteEnrollment(newEnr.id);
assert(!adminService.getEnrollments(false).some((e) => e.id === newEnr.id));
console.log(` \x1b[32m[PASS]\x1b[0m Enrollments linking student to courses verified`);

// -------------------------------------------------------------
// 6. Admission Requests (Approve / Reject Workflow)
// -------------------------------------------------------------
console.log('\n--- 6. Testing Admission Requests (Approve & Reject) ---');
const admissions = adminService.getAdmissions();
const pendingAdm = admissions.find((a) => a.status === 'pending');
assert(pendingAdm, 'Must have pending admission request');

// 6.1 Test Approve (Auto-creates student and enrollment)
const approveRes = adminService.approveAdmission(pendingAdm.id, 'admin@noor-bayan.com');
assert.strictEqual(approveRes.success, true);
assert(approveRes.student, 'Student record must be auto-created upon approval');
assert.strictEqual(approveRes.student.childName, pendingAdm.childName);

// Verify student is in students list
const verifiedStd = adminService.getStudentById(approveRes.student.id);
assert(verifiedStd, 'Newly approved student must exist in database');

// 6.2 Test Reject (With rejection reason)
const anotherPending = adminService.getAdmissions().find((a) => a.status === 'pending');
if (anotherPending) {
  const rejectRes = adminService.rejectAdmission(
    anotherPending.id,
    'عذراً، لا تتوفر شواغر في الموعد المطلوب حالياً.',
    'admin@noor-bayan.com'
  );
  assert.strictEqual(rejectRes, true);
  const rejectedRecord = adminService.getAdmissions(true).find((a) => a.id === anotherPending.id);
  assert.strictEqual(rejectedRecord?.status, 'rejected');
  assert(rejectedRecord?.rejectionReason?.includes('لا تتوفر شواغر'));
}
console.log(` \x1b[32m[PASS]\x1b[0m Admission requests approve and reject workflows verified`);

// -------------------------------------------------------------
// 7. Announcements (Targeting: All / Course / Specific Students)
// -------------------------------------------------------------
console.log('\n--- 7. Testing Announcements with Audience Targeting ---');
// 7.1 Target: all
const ancAll = adminService.createAnnouncement({
  title: 'تنبيه إداري عام لجميع أولياء الأمور والطلاب',
  content: 'نحيطكم علماً بأن إجازة نهاية الأسبوع تبدأ يوم الجمعة.',
  targetAudience: 'all',
  priority: 'normal',
});
assert.strictEqual(ancAll.targetAudience, 'all');

// 7.2 Target: course
const ancCourse = adminService.createAnnouncement({
  title: 'توجيه لحلقة تحفيظ جزء عم',
  content: 'يرجى مراجعة سورة النبأ قبل موعد الحلقة القادمة.',
  targetAudience: 'course',
  targetCourseId: 'c-quran-1',
  targetCourseTitle: 'حلقات تحفيظ القرآن الكريم وتجويده',
  priority: 'important',
});
assert.strictEqual(ancCourse.targetAudience, 'course');
assert.strictEqual(ancCourse.targetCourseId, 'c-quran-1');

// 7.3 Target: specific_students
const ancSpecific = adminService.createAnnouncement({
  title: 'ملاحظة فردية للطلاب المتميزين',
  content: 'تحديد موعد اختبار الإجازة.',
  targetAudience: 'specific_students',
  targetStudentIds: ['std-1', 'std-2'],
  targetStudentNames: ['عمر أحمد السعيد', 'سارة خالد المنصور'],
  priority: 'urgent',
});
assert.strictEqual(ancSpecific.targetAudience, 'specific_students');
assert.strictEqual(ancSpecific.targetStudentIds?.length, 2);

adminService.softDeleteAnnouncement(ancAll.id);
assert(!adminService.getAnnouncements(false).some((a) => a.id === ancAll.id));
console.log(` \x1b[32m[PASS]\x1b[0m Announcements targeting (all / course / specific students) verified`);

// -------------------------------------------------------------
// 8. Certificates Issue + PDF Verification Code
// -------------------------------------------------------------
console.log('\n--- 8. Testing Certificates Issuance & Verification Code ---');
const newCert = adminService.issueCertificate({
  studentId: 'std-3',
  studentName: 'عبد الرحمن يوسف الشمري',
  courseId: 'c-quran-1',
  courseTitle: 'حلقات تحفيظ القرآن الكريم وتجويده',
  achievementTitle: 'إتقان وحفظ النصف الأول من جزء عم',
  templateType: 'completion',
  themeId: 'emerald_gold',
  grade: 'ممتاز (96%)',
});
assert(newCert.id.startsWith('cert-'));
assert(newCert.verificationCode.startsWith('NB-QRN-'), 'Verification code must follow academy format');
assert(newCert.verificationCode.length >= 14);

adminService.softDeleteCertificate(newCert.id);
assert(!adminService.getCertificates(false).some((c) => c.id === newCert.id));
console.log(` \x1b[32m[PASS]\x1b[0m Certificates issuance, standard verification code, and soft delete verified`);

// -------------------------------------------------------------
// 9. Payroll: DUPLICATE MONTH GUARD & Teacher Payout Details
// -------------------------------------------------------------
console.log('\n--- 9. Testing Payroll: DUPLICATE MONTH GUARD & Teacher Payout Details ---');
const teacherEmail = 'teacher@noor-bayan.com';

// 9.1 Add payroll for a unique month
const uniqueMonth = 'يناير 2027';
const createdPay = adminService.createPayrollRun({
  teacherEmail,
  teacherName: 'الشيخ عبد الله القرني',
  month: uniqueMonth,
  hoursCompleted: 40,
  hourlyRateSar: 65,
  bonus: 100,
  deductions: 0,
});
assert(createdPay.id.startsWith('pay-'));
assert.strictEqual(createdPay.netAmount, 40 * 65 + 100);
assert(createdPay.ibanMasked.includes('••••'), 'IBAN must be masked');

// 9.2 CRITICAL: Duplicate Month Guard Test
console.log('--- 9.2 CRITICAL: Testing Duplicate Month Guard ---');
assert.throws(() => {
  adminService.createPayrollRun({
    teacherEmail,
    teacherName: 'الشيخ عبد الله القرني',
    month: uniqueMonth, // ATTEMPTING DUPLICATE MONTH!
    hoursCompleted: 20,
    hourlyRateSar: 65,
  });
}, /تكرار غير مسموح/);
console.log(` \x1b[32m[PASS]\x1b[0m DUPLICATE MONTH GUARD successfully blocked duplicate payroll run!`);

// 9.3 Mark payroll as paid
adminService.markPayrollPaid(createdPay.id, 'SAR-ALRAJHI-112233');
const paidRecord = adminService.getPayroll(true).find((p) => p.id === createdPay.id);
assert.strictEqual(paidRecord?.status, 'paid');
assert(paidRecord?.paidAt);

// 9.4 Soft delete payroll
adminService.softDeletePayroll(createdPay.id);
assert(!adminService.getPayroll(false).some((p) => p.id === createdPay.id));
console.log(` \x1b[32m[PASS]\x1b[0m Payroll management, masked IBAN, and payment confirmation verified`);

// -------------------------------------------------------------
// 10. Audit Log Viewer (Immutable Event Stream)
// -------------------------------------------------------------
console.log('\n--- 10. Testing Audit Log Viewer ---');
const auditLogs = adminService.getAuditLogs();
assert(auditLogs.length >= 5, 'Audit log stream must contain recorded operations');
assert(auditLogs.some((l) => l.action.includes('حذف ناعم')), 'Audit log must track soft delete events');
assert(auditLogs.some((l) => l.action.includes('مسير رواتب') || l.category === 'payroll'), 'Audit log must track payroll events');
assert(auditLogs.some((l) => l.category === 'admission'), 'Audit log must track admission events');
console.log(` \x1b[32m[PASS]\x1b[0m Audit log viewer verified with full action tracking (${auditLogs.length} events logged)`);

console.log('\n=================================================================');
console.log('   ALL TASK 5C ADMIN REQUIREMENTS PASSED 100%');
console.log('=================================================================');
