-- ============================================================================
-- Noor & Bayan Academy — RLS Policy Test Suite
-- File: supabase/tests/rls_tests.sql
-- Description: Comprehensive verification of Row Level Security (RLS) policies.
--              Includes at least one ALLOWED and one DENIED test per role per table.
-- ============================================================================

BEGIN;

-- Setup test reporting structure
CREATE TEMP TABLE test_results (
  test_id text PRIMARY KEY,
  table_name text NOT NULL,
  role_tested text NOT NULL,
  expected_outcome text NOT NULL, -- 'ALLOWED' or 'DENIED'
  actual_outcome text NOT NULL,   -- 'ALLOWED' or 'DENIED'
  status text NOT NULL            -- 'PASS' or 'FAIL'
);

CREATE OR REPLACE FUNCTION record_test(
  p_id text,
  p_table text,
  p_role text,
  p_expected text,
  p_actual text
) RETURNS void LANGUAGE plpgsql AS $$
BEGIN
  INSERT INTO test_results (test_id, table_name, role_tested, expected_outcome, actual_outcome, status)
  VALUES (p_id, p_table, p_role, p_expected, p_actual, CASE WHEN p_expected = p_actual THEN 'PASS' ELSE 'FAIL' END);
END;
$$;

-- ============================================================================
-- 0. TEST FIXTURES SETUP (Executed with superuser / service_role)
-- ============================================================================

-- Fixed Test UUIDs
DO $$
DECLARE
  uid_admin uuid := '00000000-0000-0000-0000-000000000001';
  uid_teacher1 uuid := '00000000-0000-0000-0000-000000000002';
  uid_teacher2 uuid := '00000000-0000-0000-0000-000000000003';
  uid_student1 uuid := '00000000-0000-0000-0000-000000000004';
  uid_student2 uuid := '00000000-0000-0000-0000-000000000005';
  uid_inactive uuid := '00000000-0000-0000-0000-000000000006';

  course1_id uuid := '10000000-0000-0000-0000-000000000001';
  course2_id uuid := '10000000-0000-0000-0000-000000000002';
  lesson1_id uuid := '20000000-0000-0000-0000-000000000001';
  lesson2_id uuid := '20000000-0000-0000-0000-000000000002';
BEGIN
  -- Insert into auth.users (dummy auth records)
  INSERT INTO auth.users (id, email)
  VALUES 
    (uid_admin, 'admin@noor-bayan.com'),
    (uid_teacher1, 'teacher1@noor-bayan.com'),
    (uid_teacher2, 'teacher2@noor-bayan.com'),
    (uid_student1, 'student1@noor-bayan.com'),
    (uid_student2, 'student2@noor-bayan.com'),
    (uid_inactive, 'inactive@noor-bayan.com')
  ON CONFLICT (id) DO NOTHING;

  -- Insert corresponding profiles
  INSERT INTO public.profiles (id, email, full_name, role, is_active)
  VALUES
    (uid_admin, 'admin@noor-bayan.com', 'Admin User', 'admin', true),
    (uid_teacher1, 'teacher1@noor-bayan.com', 'Teacher One', 'teacher', true),
    (uid_teacher2, 'teacher2@noor-bayan.com', 'Teacher Two', 'teacher', true),
    (uid_student1, 'student1@noor-bayan.com', 'Student One', 'student', true),
    (uid_student2, 'student2@noor-bayan.com', 'Student Two', 'student', true),
    (uid_inactive, 'inactive@noor-bayan.com', 'Inactive User', 'admin', false)
  ON CONFLICT (id) DO UPDATE SET is_active = EXCLUDED.is_active;

  -- Insert Courses (Teacher 1 teaches Course 1, Teacher 2 teaches Course 2)
  INSERT INTO public.courses (id, title, teacher_id, category, price, is_active)
  VALUES
    (course1_id, 'Tajweed Track 1', uid_teacher1, 'Quran', 250.00, true),
    (course2_id, 'Arabic Noor Bayan', uid_teacher2, 'Arabic', 300.00, true)
  ON CONFLICT (id) DO NOTHING;

  -- Insert Enrollments (Student 1 is enrolled in Course 1 taught by Teacher 1; Student 2 in Course 2)
  INSERT INTO public.enrollments (student_id, course_id, status)
  VALUES
    (uid_student1, course1_id, 'active'),
    (uid_student2, course2_id, 'active')
  ON CONFLICT (student_id, course_id) DO NOTHING;

  -- Insert Lessons (Lesson 1 is targeted to Course 1; Lesson 2 is targeted to Course 2)
  INSERT INTO public.lessons (id, course_id, title, target_type, created_by)
  VALUES
    (lesson1_id, course1_id, 'Tajweed Lesson 1', 'course', uid_teacher1),
    (lesson2_id, course2_id, 'Noor Bayan Lesson 1', 'course', uid_teacher2)
  ON CONFLICT (id) DO NOTHING;
END $$;

-- Helper to simulate specific authenticated role
CREATE OR REPLACE PROCEDURE as_user(p_uid text)
LANGUAGE plpgsql AS $$
BEGIN
  IF p_uid IS NULL THEN
    PERFORM set_config('role', 'anon', true);
    PERFORM set_config('request.jwt.claims', '', true);
  ELSE
    PERFORM set_config('role', 'authenticated', true);
    PERFORM set_config('request.jwt.claims', json_build_object('sub', p_uid, 'role', 'authenticated')::text, true);
  END IF;
END;
$$;

-- ============================================================================
-- 1. TESTS: PROFILES TABLE
-- ============================================================================
DO $$
DECLARE
  v_count integer;
  uid_admin text := '00000000-0000-0000-0000-000000000001';
  uid_teacher1 text := '00000000-0000-0000-0000-000000000002';
  uid_student1 text := '00000000-0000-0000-0000-000000000004';
  uid_student2 text := '00000000-0000-0000-0000-000000000005';
BEGIN
  -- 1.1 ANON: SELECT profiles (Must be DENIED - returns 0 rows)
  CALL as_user(null);
  SELECT count(*) INTO v_count FROM public.profiles;
  PERFORM record_test('profiles_anon_read', 'profiles', 'anon', 'DENIED', CASE WHEN v_count = 0 THEN 'DENIED' ELSE 'ALLOWED' END);

  -- 1.2 STUDENT: Read own profile (ALLOWED)
  CALL as_user(uid_student1);
  SELECT count(*) INTO v_count FROM public.profiles WHERE id = uid_student1::uuid;
  PERFORM record_test('profiles_student_read_own', 'profiles', 'student', 'ALLOWED', CASE WHEN v_count = 1 THEN 'ALLOWED' ELSE 'DENIED' END);

  -- 1.3 STUDENT: Read other unassigned student profile (DENIED)
  CALL as_user(uid_student1);
  SELECT count(*) INTO v_count FROM public.profiles WHERE id = uid_student2::uuid;
  PERFORM record_test('profiles_student_read_other', 'profiles', 'student', 'DENIED', CASE WHEN v_count = 0 THEN 'DENIED' ELSE 'ALLOWED' END);

  -- 1.4 TEACHER: Read assigned student profile (ALLOWED)
  CALL as_user(uid_teacher1);
  SELECT count(*) INTO v_count FROM public.profiles WHERE id = uid_student1::uuid;
  PERFORM record_test('profiles_teacher_read_assigned', 'profiles', 'teacher', 'ALLOWED', CASE WHEN v_count = 1 THEN 'ALLOWED' ELSE 'DENIED' END);

  -- 1.5 TEACHER: Read unassigned student profile (DENIED)
  CALL as_user(uid_teacher1);
  SELECT count(*) INTO v_count FROM public.profiles WHERE id = uid_student2::uuid;
  PERFORM record_test('profiles_teacher_read_unassigned', 'profiles', 'teacher', 'DENIED', CASE WHEN v_count = 0 THEN 'DENIED' ELSE 'ALLOWED' END);

  -- 1.6 ADMIN: Read all profiles (ALLOWED)
  CALL as_user(uid_admin);
  SELECT count(*) INTO v_count FROM public.profiles;
  PERFORM record_test('profiles_admin_read_all', 'profiles', 'admin', 'ALLOWED', CASE WHEN v_count >= 5 THEN 'ALLOWED' ELSE 'DENIED' END);

  -- 1.7 ADMIN: Attempt changing OWN role (DENIED by trigger)
  CALL as_user(uid_admin);
  BEGIN
    UPDATE public.profiles SET role = 'teacher' WHERE id = uid_admin::uuid;
    PERFORM record_test('profiles_admin_change_own_role', 'profiles', 'admin', 'DENIED', 'ALLOWED');
  EXCEPTION WHEN OTHERS THEN
    PERFORM record_test('profiles_admin_change_own_role', 'profiles', 'admin', 'DENIED', 'DENIED');
  END;

  -- 1.8 TEACHER: Attempt changing student role (DENIED)
  CALL as_user(uid_teacher1);
  BEGIN
    UPDATE public.profiles SET role = 'admin' WHERE id = uid_student1::uuid;
    PERFORM record_test('profiles_teacher_change_student_role', 'profiles', 'teacher', 'DENIED', 'ALLOWED');
  EXCEPTION WHEN OTHERS THEN
    PERFORM record_test('profiles_teacher_change_student_role', 'profiles', 'teacher', 'DENIED', 'DENIED');
  END;
END $$;

-- ============================================================================
-- 2. TESTS: COURSES TABLE
-- ============================================================================
DO $$
DECLARE
  v_count integer;
  uid_admin text := '00000000-0000-0000-0000-000000000001';
  uid_teacher1 text := '00000000-0000-0000-0000-000000000002';
  uid_teacher2 text := '00000000-0000-0000-0000-000000000003';
  course1_id uuid := '10000000-0000-0000-0000-000000000001';
  course2_id uuid := '10000000-0000-0000-0000-000000000002';
BEGIN
  -- 2.1 PUBLIC/ANON: Read active courses (ALLOWED)
  CALL as_user(null);
  SELECT count(*) INTO v_count FROM public.courses WHERE is_active = true;
  PERFORM record_test('courses_anon_read_active', 'courses', 'anon', 'ALLOWED', CASE WHEN v_count >= 2 THEN 'ALLOWED' ELSE 'DENIED' END);

  -- 2.2 ANON: Insert course (DENIED)
  CALL as_user(null);
  BEGIN
    INSERT INTO public.courses (title, category, price) VALUES ('Unauthorized Course', 'General', 100);
    PERFORM record_test('courses_anon_insert', 'courses', 'anon', 'DENIED', 'ALLOWED');
  EXCEPTION WHEN OTHERS THEN
    PERFORM record_test('courses_anon_insert', 'courses', 'anon', 'DENIED', 'DENIED');
  END;

  -- 2.3 TEACHER: Update own assigned course (ALLOWED)
  CALL as_user(uid_teacher1);
  UPDATE public.courses SET description = 'Updated by Teacher 1' WHERE id = course1_id;
  GET DIAGNOSTICS v_count = ROW_COUNT;
  PERFORM record_test('courses_teacher_update_assigned', 'courses', 'teacher', 'ALLOWED', CASE WHEN v_count = 1 THEN 'ALLOWED' ELSE 'DENIED' END);

  -- 2.4 TEACHER: Update other teacher's course (DENIED)
  CALL as_user(uid_teacher1);
  UPDATE public.courses SET description = 'Malicious update' WHERE id = course2_id;
  GET DIAGNOSTICS v_count = ROW_COUNT;
  PERFORM record_test('courses_teacher_update_unassigned', 'courses', 'teacher', 'DENIED', CASE WHEN v_count = 0 THEN 'DENIED' ELSE 'ALLOWED' END);

  -- 2.5 CHECK CONSTRAINT: Insert negative price (DENIED on check constraint)
  CALL as_user(uid_admin);
  BEGIN
    INSERT INTO public.courses (title, category, price) VALUES ('Negative Price Course', 'Test', -50.00);
    PERFORM record_test('courses_negative_price_check', 'courses', 'admin', 'DENIED', 'ALLOWED');
  EXCEPTION WHEN OTHERS THEN
    PERFORM record_test('courses_negative_price_check', 'courses', 'admin', 'DENIED', 'DENIED');
  END;
END $$;

-- ============================================================================
-- 3. TESTS: ENROLLMENTS TABLE
-- ============================================================================
DO $$
DECLARE
  v_count integer;
  uid_admin text := '00000000-0000-0000-0000-000000000001';
  uid_teacher1 text := '00000000-0000-0000-0000-000000000002';
  uid_student1 text := '00000000-0000-0000-0000-000000000004';
  uid_student2 text := '00000000-0000-0000-0000-000000000005';
  course1_id uuid := '10000000-0000-0000-0000-000000000001';
  course2_id uuid := '10000000-0000-0000-0000-000000000002';
BEGIN
  -- 3.1 STUDENT: View own enrollment (ALLOWED)
  CALL as_user(uid_student1);
  SELECT count(*) INTO v_count FROM public.enrollments WHERE student_id = uid_student1::uuid;
  PERFORM record_test('enrollments_student_read_own', 'enrollments', 'student', 'ALLOWED', CASE WHEN v_count = 1 THEN 'ALLOWED' ELSE 'DENIED' END);

  -- 3.2 STUDENT: View other student's enrollment (DENIED)
  CALL as_user(uid_student1);
  SELECT count(*) INTO v_count FROM public.enrollments WHERE student_id = uid_student2::uuid;
  PERFORM record_test('enrollments_student_read_other', 'enrollments', 'student', 'DENIED', CASE WHEN v_count = 0 THEN 'DENIED' ELSE 'ALLOWED' END);

  -- 3.3 TEACHER: View enrollments in assigned courses (ALLOWED)
  CALL as_user(uid_teacher1);
  SELECT count(*) INTO v_count FROM public.enrollments WHERE course_id = course1_id;
  PERFORM record_test('enrollments_teacher_read_assigned', 'enrollments', 'teacher', 'ALLOWED', CASE WHEN v_count = 1 THEN 'ALLOWED' ELSE 'DENIED' END);

  -- 3.4 TEACHER: View enrollments in other courses (DENIED)
  CALL as_user(uid_teacher1);
  SELECT count(*) INTO v_count FROM public.enrollments WHERE course_id = course2_id;
  PERFORM record_test('enrollments_teacher_read_unassigned', 'enrollments', 'teacher', 'DENIED', CASE WHEN v_count = 0 THEN 'DENIED' ELSE 'ALLOWED' END);

  -- 3.5 TEACHER: Update meeting link for enrolled student in assigned course (ALLOWED)
  CALL as_user(uid_teacher1);
  UPDATE public.enrollments SET meeting_link = 'https://meet.google.com/xyz-test' WHERE course_id = course1_id AND student_id = uid_student1::uuid;
  GET DIAGNOSTICS v_count = ROW_COUNT;
  PERFORM record_test('enrollments_teacher_update_meeting_link', 'enrollments', 'teacher', 'ALLOWED', CASE WHEN v_count = 1 THEN 'ALLOWED' ELSE 'DENIED' END);
END $$;

-- ============================================================================
-- 4. TESTS: LESSONS TABLE (Targeted Visibility)
-- ============================================================================
DO $$
DECLARE
  v_count integer;
  uid_admin text := '00000000-0000-0000-0000-000000000001';
  uid_teacher1 text := '00000000-0000-0000-0000-000000000002';
  uid_student1 text := '00000000-0000-0000-0000-000000000004';
  lesson1_id uuid := '20000000-0000-0000-0000-000000000001';
  lesson2_id uuid := '20000000-0000-0000-0000-000000000002';
BEGIN
  -- 4.1 STUDENT 1: Read lesson targeted to Course 1 (enrolled) (ALLOWED)
  CALL as_user(uid_student1);
  SELECT count(*) INTO v_count FROM public.lessons WHERE id = lesson1_id;
  PERFORM record_test('lessons_student_read_enrolled_target', 'lessons', 'student', 'ALLOWED', CASE WHEN v_count = 1 THEN 'ALLOWED' ELSE 'DENIED' END);

  -- 4.2 STUDENT 1: Read lesson targeted to Course 2 (not enrolled) (DENIED)
  CALL as_user(uid_student1);
  SELECT count(*) INTO v_count FROM public.lessons WHERE id = lesson2_id;
  PERFORM record_test('lessons_student_read_unenrolled_target', 'lessons', 'student', 'DENIED', CASE WHEN v_count = 0 THEN 'DENIED' ELSE 'ALLOWED' END);

  -- 4.3 STUDENT: Attempt creating a lesson (DENIED)
  CALL as_user(uid_student1);
  BEGIN
    INSERT INTO public.lessons (title, target_type) VALUES ('Student Created Lesson', 'all');
    PERFORM record_test('lessons_student_insert', 'lessons', 'student', 'DENIED', 'ALLOWED');
  EXCEPTION WHEN OTHERS THEN
    PERFORM record_test('lessons_student_insert', 'lessons', 'student', 'DENIED', 'DENIED');
  END;

  -- 4.4 TEACHER 1: Create lesson in assigned Course 1 (ALLOWED)
  CALL as_user(uid_teacher1);
  INSERT INTO public.lessons (course_id, title, target_type, created_by)
  VALUES ('10000000-0000-0000-0000-000000000001', 'Tajweed Practice 2', 'course', uid_teacher1::uuid);
  PERFORM record_test('lessons_teacher_create_assigned', 'lessons', 'teacher', 'ALLOWED', 'ALLOWED');

  -- 4.5 TEACHER 1: Attempt creating lesson in unassigned Course 2 (DENIED)
  CALL as_user(uid_teacher1);
  BEGIN
    INSERT INTO public.lessons (course_id, title, target_type, created_by)
    VALUES ('10000000-0000-0000-0000-000000000002', 'Unauthorized Lesson', 'course', uid_teacher1::uuid);
    PERFORM record_test('lessons_teacher_create_unassigned', 'lessons', 'teacher', 'DENIED', 'ALLOWED');
  EXCEPTION WHEN OTHERS THEN
    PERFORM record_test('lessons_teacher_create_unassigned', 'lessons', 'teacher', 'DENIED', 'DENIED');
  END;
END $$;

-- ============================================================================
-- 5. TESTS: EVALUATIONS TABLE (Grades & Assessments)
-- ============================================================================
DO $$
DECLARE
  v_count integer;
  uid_admin text := '00000000-0000-0000-0000-000000000001';
  uid_teacher1 text := '00000000-0000-0000-0000-000000000002';
  uid_student1 text := '00000000-0000-0000-0000-000000000004';
  uid_student2 text := '00000000-0000-0000-0000-000000000005';
  course1_id uuid := '10000000-0000-0000-0000-000000000001';
  course2_id uuid := '10000000-0000-0000-0000-000000000002';
  eval_id uuid;
BEGIN
  -- 5.1 TEACHER 1: Insert evaluation for assigned student (ALLOWED)
  CALL as_user(uid_teacher1);
  INSERT INTO public.evaluations (student_id, course_id, teacher_id, title, score, max_score)
  VALUES (uid_student1::uuid, course1_id, uid_teacher1::uuid, 'Makharij Evaluation', 95, 100)
  RETURNING id INTO eval_id;
  PERFORM record_test('evaluations_teacher_insert_assigned', 'evaluations', 'teacher', 'ALLOWED', 'ALLOWED');

  -- 5.2 TEACHER 1: Attempt inserting evaluation for unassigned student (DENIED)
  CALL as_user(uid_teacher1);
  BEGIN
    INSERT INTO public.evaluations (student_id, course_id, teacher_id, title, score, max_score)
    VALUES (uid_student2::uuid, course2_id, uid_teacher1::uuid, 'Unauthorized Eval', 80, 100);
    PERFORM record_test('evaluations_teacher_insert_unassigned', 'evaluations', 'teacher', 'DENIED', 'ALLOWED');
  EXCEPTION WHEN OTHERS THEN
    PERFORM record_test('evaluations_teacher_insert_unassigned', 'evaluations', 'teacher', 'DENIED', 'DENIED');
  END;

  -- 5.3 STUDENT 1: Read own evaluation (ALLOWED)
  CALL as_user(uid_student1);
  SELECT count(*) INTO v_count FROM public.evaluations WHERE id = eval_id;
  PERFORM record_test('evaluations_student_read_own', 'evaluations', 'student', 'ALLOWED', CASE WHEN v_count = 1 THEN 'ALLOWED' ELSE 'DENIED' END);

  -- 5.4 STUDENT 1: Attempt modifying evaluation (DENIED - read-only for students!)
  CALL as_user(uid_student1);
  BEGIN
    UPDATE public.evaluations SET score = 100 WHERE id = eval_id;
    GET DIAGNOSTICS v_count = ROW_COUNT;
    PERFORM record_test('evaluations_student_update_denied', 'evaluations', 'student', 'DENIED', CASE WHEN v_count = 0 THEN 'DENIED' ELSE 'ALLOWED' END);
  EXCEPTION WHEN OTHERS THEN
    PERFORM record_test('evaluations_student_update_denied', 'evaluations', 'student', 'DENIED', 'DENIED');
  END;

  -- 5.5 ANON: Read evaluations (DENIED)
  CALL as_user(null);
  SELECT count(*) INTO v_count FROM public.evaluations;
  PERFORM record_test('evaluations_anon_read', 'evaluations', 'anon', 'DENIED', CASE WHEN v_count = 0 THEN 'DENIED' ELSE 'ALLOWED' END);
END $$;

-- ============================================================================
-- 6. TESTS: EXAMS, RECITATIONS & ATTENDANCE
-- ============================================================================
DO $$
DECLARE
  v_count integer;
  uid_admin text := '00000000-0000-0000-0000-000000000001';
  uid_teacher1 text := '00000000-0000-0000-0000-000000000002';
  uid_student1 text := '00000000-0000-0000-0000-000000000004';
  uid_student2 text := '00000000-0000-0000-0000-000000000005';
  course1_id uuid := '10000000-0000-0000-0000-000000000001';
  rec_id uuid;
  att_id uuid;
BEGIN
  -- 6.1 TEACHER 1: Insert recitation log for assigned student (ALLOWED)
  CALL as_user(uid_teacher1);
  INSERT INTO public.recitations (student_id, course_id, teacher_id, surah_name, from_ayah, to_ayah, grade)
  VALUES (uid_student1::uuid, course1_id, uid_teacher1::uuid, 'Al-Baqarah', 1, 15, 'excellent')
  RETURNING id INTO rec_id;
  PERFORM record_test('recitations_teacher_insert_assigned', 'recitations', 'teacher', 'ALLOWED', 'ALLOWED');

  -- 6.2 TEACHER 1: Attempt inserting recitation for unassigned student (DENIED)
  CALL as_user(uid_teacher1);
  BEGIN
    INSERT INTO public.recitations (student_id, course_id, teacher_id, surah_name, from_ayah, to_ayah, grade)
    VALUES (uid_student2::uuid, '10000000-0000-0000-0000-000000000002'::uuid, uid_teacher1::uuid, 'An-Nas', 1, 6, 'good');
    PERFORM record_test('recitations_teacher_insert_unassigned', 'recitations', 'teacher', 'DENIED', 'ALLOWED');
  EXCEPTION WHEN OTHERS THEN
    PERFORM record_test('recitations_teacher_insert_unassigned', 'recitations', 'teacher', 'DENIED', 'DENIED');
  END;

  -- 6.3 TEACHER 1: Mark attendance for assigned student (ALLOWED)
  CALL as_user(uid_teacher1);
  INSERT INTO public.attendance (student_id, course_id, teacher_id, status)
  VALUES (uid_student1::uuid, course1_id, uid_teacher1::uuid, 'present')
  RETURNING id INTO att_id;
  PERFORM record_test('attendance_teacher_insert_assigned', 'attendance', 'teacher', 'ALLOWED', 'ALLOWED');

  -- 6.4 STUDENT 1: Attempt modifying attendance (DENIED)
  CALL as_user(uid_student1);
  BEGIN
    UPDATE public.attendance SET status = 'present' WHERE id = att_id;
    GET DIAGNOSTICS v_count = ROW_COUNT;
    PERFORM record_test('attendance_student_modify_denied', 'attendance', 'student', 'DENIED', CASE WHEN v_count = 0 THEN 'DENIED' ELSE 'ALLOWED' END);
  EXCEPTION WHEN OTHERS THEN
    PERFORM record_test('attendance_student_modify_denied', 'attendance', 'student', 'DENIED', 'DENIED');
  END;
END $$;

-- ============================================================================
-- 7. TESTS: TEACHER PAYOUT DETAILS & PAYROLL
-- ============================================================================
DO $$
DECLARE
  v_count integer;
  uid_admin text := '00000000-0000-0000-0000-000000000001';
  uid_teacher1 text := '00000000-0000-0000-0000-000000000002';
  uid_teacher2 text := '00000000-0000-0000-0000-000000000003';
  uid_student1 text := '00000000-0000-0000-0000-000000000004';
BEGIN
  -- 7.1 TEACHER 1: Insert own payout details (IBAN only, no cards) (ALLOWED)
  CALL as_user(uid_teacher1);
  INSERT INTO public.teacher_payout_details (teacher_id, account_holder_name, bank_name, iban)
  VALUES (uid_teacher1::uuid, 'Teacher One Name', 'Al-Rajhi Bank', 'SA0380000000608010167519');
  PERFORM record_test('payout_details_teacher_insert_own', 'teacher_payout_details', 'teacher', 'ALLOWED', 'ALLOWED');

  -- 7.2 TEACHER 2: Read Teacher 1 payout details (DENIED)
  CALL as_user(uid_teacher2);
  SELECT count(*) INTO v_count FROM public.teacher_payout_details WHERE teacher_id = uid_teacher1::uuid;
  PERFORM record_test('payout_details_teacher_read_other', 'teacher_payout_details', 'teacher', 'DENIED', CASE WHEN v_count = 0 THEN 'DENIED' ELSE 'ALLOWED' END);

  -- 7.3 STUDENT: Read payout details (DENIED)
  CALL as_user(uid_student1);
  SELECT count(*) INTO v_count FROM public.teacher_payout_details;
  PERFORM record_test('payout_details_student_read', 'teacher_payout_details', 'student', 'DENIED', CASE WHEN v_count = 0 THEN 'DENIED' ELSE 'ALLOWED' END);

  -- 7.4 ADMIN: Manage Payroll (ALLOWED)
  CALL as_user(uid_admin);
  INSERT INTO public.payroll (teacher_id, month, amount, bonus, deductions)
  VALUES (uid_teacher1::uuid, '2026-11', 4500.00, 300.00, 0.00);
  PERFORM record_test('payroll_admin_insert', 'payroll', 'admin', 'ALLOWED', 'ALLOWED');

  -- 7.5 CHECK CONSTRAINT: Payroll unique(teacher_id, month) (DENIED on duplicate)
  CALL as_user(uid_admin);
  BEGIN
    INSERT INTO public.payroll (teacher_id, month, amount)
    VALUES (uid_teacher1::uuid, '2026-11', 4500.00);
    PERFORM record_test('payroll_duplicate_month_unique', 'payroll', 'admin', 'DENIED', 'ALLOWED');
  EXCEPTION WHEN OTHERS THEN
    PERFORM record_test('payroll_duplicate_month_unique', 'payroll', 'admin', 'DENIED', 'DENIED');
  END;

  -- 7.6 TEACHER 1: Read own payroll (ALLOWED)
  CALL as_user(uid_teacher1);
  SELECT count(*) INTO v_count FROM public.payroll WHERE teacher_id = uid_teacher1::uuid;
  PERFORM record_test('payroll_teacher_read_own', 'payroll', 'teacher', 'ALLOWED', CASE WHEN v_count = 1 THEN 'ALLOWED' ELSE 'DENIED' END);

  -- 7.7 TEACHER 1: Attempt modifying payroll (DENIED)
  CALL as_user(uid_teacher1);
  BEGIN
    UPDATE public.payroll SET amount = 99999 WHERE teacher_id = uid_teacher1::uuid;
    GET DIAGNOSTICS v_count = ROW_COUNT;
    PERFORM record_test('payroll_teacher_modify_denied', 'payroll', 'teacher', 'DENIED', CASE WHEN v_count = 0 THEN 'DENIED' ELSE 'ALLOWED' END);
  EXCEPTION WHEN OTHERS THEN
    PERFORM record_test('payroll_teacher_modify_denied', 'payroll', 'teacher', 'DENIED', 'DENIED');
  END;
END $$;

-- ============================================================================
-- 8. TESTS: ADMISSION REQUESTS & AUDIT LOGS
-- ============================================================================
DO $$
DECLARE
  v_count integer;
  uid_admin text := '00000000-0000-0000-0000-000000000001';
  uid_student1 text := '00000000-0000-0000-0000-000000000004';
  req_id uuid;
  log_id uuid;
BEGIN
  -- 8.1 PUBLIC/ANON: Insert admission request (ALLOWED, status forced to 'new')
  CALL as_user(null);
  INSERT INTO public.admission_requests (child_name, child_age, parent_name, parent_phone, program_of_interest, status)
  VALUES ('Yousef Ahmad', 8, 'Ahmad Ali', '+966501234567', 'Quran Memorization', 'enrolled')
  RETURNING id INTO req_id;
  PERFORM record_test('admission_anon_insert', 'admission_requests', 'anon', 'ALLOWED', 'ALLOWED');

  -- 8.2 Verify status was forced to 'new' regardless of input
  SELECT count(*) INTO v_count FROM public.admission_requests WHERE id = req_id AND status = 'new';
  PERFORM record_test('admission_status_forced_to_new', 'admission_requests', 'anon', 'ALLOWED', CASE WHEN v_count = 1 THEN 'ALLOWED' ELSE 'DENIED' END);

  -- 8.3 ANON: Attempt reading admission requests (DENIED)
  CALL as_user(null);
  SELECT count(*) INTO v_count FROM public.admission_requests;
  PERFORM record_test('admission_anon_read_denied', 'admission_requests', 'anon', 'DENIED', CASE WHEN v_count = 0 THEN 'DENIED' ELSE 'ALLOWED' END);

  -- 8.4 ADMIN: Read admission requests (ALLOWED)
  CALL as_user(uid_admin);
  SELECT count(*) INTO v_count FROM public.admission_requests;
  PERFORM record_test('admission_admin_read', 'admission_requests', 'admin', 'ALLOWED', CASE WHEN v_count >= 1 THEN 'ALLOWED' ELSE 'DENIED' END);

  -- 8.5 AUDIT LOGS: Trigger verification (written automatically on payroll/payout/role change)
  SELECT id INTO log_id FROM public.audit_logs LIMIT 1;
  PERFORM record_test('audit_logs_trigger_written', 'audit_logs', 'system', 'ALLOWED', CASE WHEN log_id IS NOT NULL THEN 'ALLOWED' ELSE 'DENIED' END);

  -- 8.6 ADMIN: Attempt updating audit log (DENIED - append-only!)
  CALL as_user(uid_admin);
  BEGIN
    UPDATE public.audit_logs SET operation = 'DELETE' WHERE id = log_id;
    GET DIAGNOSTICS v_count = ROW_COUNT;
    PERFORM record_test('audit_logs_update_denied_append_only', 'audit_logs', 'admin', 'DENIED', CASE WHEN v_count = 0 THEN 'DENIED' ELSE 'ALLOWED' END);
  EXCEPTION WHEN OTHERS THEN
    PERFORM record_test('audit_logs_update_denied_append_only', 'audit_logs', 'admin', 'DENIED', 'DENIED');
  END;

  -- 8.7 STUDENT: Read audit logs (DENIED)
  CALL as_user(uid_student1);
  SELECT count(*) INTO v_count FROM public.audit_logs;
  PERFORM record_test('audit_logs_student_read_denied', 'audit_logs', 'student', 'DENIED', CASE WHEN v_count = 0 THEN 'DENIED' ELSE 'ALLOWED' END);
END $$;

-- ============================================================================
-- 9. OUTPUT TEST SUMMARY REPORT
-- ============================================================================
SELECT 
  table_name,
  role_tested,
  test_id,
  expected_outcome,
  actual_outcome,
  status
FROM test_results
ORDER BY table_name, role_tested;

-- Display total failures if any
SELECT 
  count(*) as total_tests,
  count(*) FILTER (WHERE status = 'PASS') as passed,
  count(*) FILTER (WHERE status = 'FAIL') as failed
FROM test_results;

ROLLBACK; -- Always rollback changes so test runs leave no dirty fixtures
