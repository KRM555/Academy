/**
 * Task 5B Automated Verification Test Suite
 * Tests Teacher Pages:
 * - My courses scoping
 * - My students scoping (only those in my courses)
 * - URL tamper protection (verifies teacher CANNOT see another course's students by changing URL)
 * - Exam results entry
 * - Quran recitation entry
 * - Periodic evaluation entry
 * - Attendance marking
 * - Payroll history
 * - Payout details form & IBAN masking
 */

import assert from 'node:assert';
import { teacherService, maskIbanString } from '../src/services/teacherService';

console.log('=================================================================');
console.log('   TASK 5B: TEACHER PAGES & SECURITY ISOLATION TEST MATRIX');
console.log('=================================================================\n');

const teacherEmail = 'teacher@noor-bayan.com';

// -------------------------------------------------------------
// 1. My Courses Scoping
// -------------------------------------------------------------
console.log('--- 1. Testing Teacher Courses Scoping ---');
const courses = teacherService.getMyCourses(teacherEmail);
assert(courses.length >= 3, 'Teacher must have their assigned courses');
const courseIds = courses.map((c) => c.id);
assert(courseIds.includes('c-quran-1'), 'Must include Quran course');
assert(courseIds.includes('c-arabic-2'), 'Must include Arabic foundation course');
assert(courseIds.includes('c-values-3'), 'Must include Islamic values course');
assert(!courseIds.includes('c-math-4'), 'Must NOT include foreign course c-math-4');
console.log(` \x1b[32m[PASS]\x1b[0m Teacher courses correctly scoped (${courses.length} courses, foreign course excluded)`);

// -------------------------------------------------------------
// 2. My Students Scoping & URL Parameter Security Verification
// -------------------------------------------------------------
console.log('\n--- 2. Testing My Students Scoping & URL Security Verification ---');
// 2.1 Default: All my students
const allMyStudentsResult = teacherService.getMyStudents(teacherEmail);
assert.strictEqual(allMyStudentsResult.authorized, true);
assert(allMyStudentsResult.students.length >= 5, 'Teacher must have their assigned students');
const studentIds = allMyStudentsResult.students.map((s) => s.id);
assert(studentIds.includes('std-1'), 'Must include student 1');
assert(studentIds.includes('std-2'), 'Must include student 2');
assert(!studentIds.includes('std-foreign-1'), 'Must NOT include foreign student 1');
assert(!studentIds.includes('std-foreign-2'), 'Must NOT include foreign student 2');
console.log(` \x1b[32m[PASS]\x1b[0m My students properly retrieved without leaking foreign students`);

// 2.2 Legitimate URL course filter: ?courseId=c-quran-1
const validCourseResult = teacherService.getMyStudents(teacherEmail, 'c-quran-1');
assert.strictEqual(validCourseResult.authorized, true);
assert(validCourseResult.students.every((s) => s.courseId === 'c-quran-1'), 'All filtered students must belong to c-quran-1');
console.log(` \x1b[32m[PASS]\x1b[0m Valid course filter ?courseId=c-quran-1 accepted (${validCourseResult.students.length} students)`);

// 2.3 CRITICAL: URL Tampering Simulation: ?courseId=c-math-4 (Foreign course belonging to another teacher)
console.log('\n--- 2.3 CRITICAL: URL Tamper Simulation (?courseId=c-math-4) ---');
const isTamperAllowed = teacherService.isCourseAssignedToTeacher('c-math-4', teacherEmail);
assert.strictEqual(isTamperAllowed, false, 'Teacher must not own foreign course c-math-4');

const tamperedResult = teacherService.getMyStudents(teacherEmail, 'c-math-4');
assert.strictEqual(tamperedResult.authorized, false, 'Tampered URL course must be BLOCKED');
assert.strictEqual(tamperedResult.students.length, 0, 'Zero students must be returned for tampered course');
assert(tamperedResult.error && tamperedResult.error.includes('تم رفض الوصول'), 'Error message must clearly state access denied');
console.log(` \x1b[32m[PASS]\x1b[0m URL Tampering blocked! Foreign course students completely protected.`);

// 2.4 Arbitrary fake courseId parameter: ?courseId=invalid-random-course-id
const invalidCourseResult = teacherService.getMyStudents(teacherEmail, 'invalid-random-course-id');
assert.strictEqual(invalidCourseResult.authorized, false);
assert.strictEqual(invalidCourseResult.students.length, 0);
console.log(` \x1b[32m[PASS]\x1b[0m Arbitrary invalid courseId in URL safely rejected`);

// -------------------------------------------------------------
// 3. Recitation Entry Verification
// -------------------------------------------------------------
console.log('\n--- 3. Testing Quran Recitation Entry ---');
const newRec = teacherService.recordRecitation({
  studentId: 'std-1',
  courseId: 'c-quran-1',
  surahName: 'الفاتحة',
  fromAyah: 1,
  toAyah: 7,
  grade: 'excellent',
  mistakesCount: 0,
  notes: 'تلاوة متقنة باهرة',
  recitationDate: '2026-11-12',
  teacherEmail,
});
assert(newRec.id.startsWith('rec-'), 'Recitation ID created');
assert.strictEqual(newRec.studentId, 'std-1');
assert.strictEqual(newRec.surahName, 'الفاتحة');
assert.strictEqual(newRec.grade, 'excellent');
console.log(` \x1b[32m[PASS]\x1b[0m Recitation recorded successfully for student std-1`);

// Foreign student recitation attempt must throw
assert.throws(() => {
  teacherService.recordRecitation({
    studentId: 'std-foreign-1',
    courseId: 'c-math-4',
    surahName: 'الفاتحة',
    fromAyah: 1,
    toAyah: 7,
    grade: 'excellent',
    mistakesCount: 0,
    notes: 'attempt',
    recitationDate: '2026-11-12',
    teacherEmail,
  });
}, /غير مصرح لك برصد تسميع لطالب غير مسجل في دوراتك/);
console.log(` \x1b[32m[PASS]\x1b[0m Recitation recording rejected for unauthorized student`);

// -------------------------------------------------------------
// 4. Evaluation Entry Verification
// -------------------------------------------------------------
console.log('\n--- 4. Testing Evaluation Entry ---');
const newEval = teacherService.recordEvaluation({
  studentId: 'std-2',
  courseId: 'c-arabic-2',
  title: 'تقييم هجاء الكلمات الثلاثية',
  score: 98,
  maxScore: 100,
  notes: 'ممتاز في قراءة الحركات القصيرة',
  evaluationDate: '2026-11-12',
  teacherEmail,
});
assert(newEval.id.startsWith('eval-'));
assert.strictEqual(newEval.score, 98);
console.log(` \x1b[32m[PASS]\x1b[0m Evaluation recorded successfully`);

// Foreign student evaluation attempt must throw
assert.throws(() => {
  teacherService.recordEvaluation({
    studentId: 'std-foreign-1',
    courseId: 'c-math-4',
    title: 'test',
    score: 90,
    notes: 'attempt',
    evaluationDate: '2026-11-12',
    teacherEmail,
  });
}, /غير مصرح لك برصد تقييم لطالب غير مسجل في دوراتك/);
console.log(` \x1b[32m[PASS]\x1b[0m Evaluation recording rejected for unauthorized student`);

// -------------------------------------------------------------
// 5. Exam Results Entry Verification
// -------------------------------------------------------------
console.log('\n--- 5. Testing Exam Results Entry ---');
const newExam = teacherService.recordExam({
  studentId: 'std-3',
  courseId: 'c-quran-1',
  examTitle: 'اختبار النصف الأول من جزء عم',
  examType: 'oral',
  score: 98,
  maxScore: 100,
  feedback: 'أداء متميز وتثبيت ممتاز للآيات',
  examDate: '2026-11-12',
  teacherEmail,
});
assert(newExam.id.startsWith('ex-'));
assert.strictEqual(newExam.score, 98);
console.log(` \x1b[32m[PASS]\x1b[0m Exam result recorded successfully`);

// -------------------------------------------------------------
// 6. Attendance Entry Verification
// -------------------------------------------------------------
console.log('\n--- 6. Testing Attendance Entry ---');
const attRecords = teacherService.recordAttendance(
  'c-quran-1',
  '2026-11-12',
  [
    { studentId: 'std-1', status: 'present', notes: 'حاضر مبكراً' },
    { studentId: 'std-3', status: 'present', notes: 'حاضر' },
    { studentId: 'std-4', status: 'late', notes: 'تأخر 5 دقائق' },
  ],
  teacherEmail
);
assert.strictEqual(attRecords.length, 3);
assert.strictEqual(attRecords[0].status, 'present');
assert.strictEqual(attRecords[2].status, 'late');
console.log(` \x1b[32m[PASS]\x1b[0m Attendance session records marked and verified`);

// Attendance attempt on unauthorized course must throw
assert.throws(() => {
  teacherService.recordAttendance('c-math-4', '2026-11-12', [], teacherEmail);
}, /غير مصرح لك بتسجيل حضور جلسة مسار تعليمي غير مسند إليك/);
console.log(` \x1b[32m[PASS]\x1b[0m Attendance marking rejected for unauthorized course`);

// -------------------------------------------------------------
// 7. Payroll History Verification
// -------------------------------------------------------------
console.log('\n--- 7. Testing Payroll History ---');
const payroll = teacherService.getPayrollHistory(teacherEmail);
assert(payroll.length >= 2, 'Payroll history must contain records');
assert(payroll.some((p) => p.status === 'paid'), 'Must have paid records');
assert(payroll.some((p) => p.status === 'pending'), 'Must have pending records');
for (const p of payroll) {
  assert(p.hoursCompleted > 0);
  assert(p.hourlyRateSar > 0);
  assert(p.netAmount > 0);
}
console.log(` \x1b[32m[PASS]\x1b[0m Payroll history verified (${payroll.length} monthly runs)`);

// -------------------------------------------------------------
// 8. Payout Details Form & IBAN Masking Verification
// -------------------------------------------------------------
console.log('\n--- 8. Testing Payout Details Form & IBAN Masking ---');
const rawIban = 'SA0380000000608010167890';
const masked = maskIbanString(rawIban);
assert.strictEqual(masked, 'SA03 •••• •••• •••• 7890', 'IBAN must be masked with first 4 and last 4 characters');
assert(!masked.includes('6080101'), 'Masked IBAN must NOT leak middle digits');

const saveResult = await teacherService.savePayoutDetails(teacherEmail, {
  accountHolderName: 'الشيخ عبد الله القرني',
  bankName: 'مصرف الراجحي (Al Rajhi Bank)',
  iban: rawIban,
});
assert.strictEqual(saveResult.success, true);
assert.strictEqual(saveResult.maskedIban, 'SA03 •••• •••• •••• 7890');

const storedDetails = teacherService.getPayoutDetails(teacherEmail);
assert.strictEqual(storedDetails.accountHolderName, 'الشيخ عبد الله القرني');
assert.strictEqual(storedDetails.bankName, 'مصرف الراجحي (Al Rajhi Bank)');
assert.strictEqual(storedDetails.ibanMasked, 'SA03 •••• •••• •••• 7890');
console.log(` \x1b[32m[PASS]\x1b[0m Payout details form and IBAN masking verified with zero plain text leaks`);

console.log('\n=================================================================');
console.log('   ALL TASK 5B TEACHER REQUIREMENTS PASSED 100%');
console.log('=================================================================');
