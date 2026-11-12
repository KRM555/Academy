-- ============================================================================
-- Noor & Bayan Academy — Production Schema Migration
-- File: supabase/migrations/001_init.sql
-- Description: Core tables, RLS default deny, RBAC helpers, audit triggers,
--              storage bucket definitions, and hardened constraint enforcement.
-- ============================================================================

-- 0. EXTENSIONS & PREREQUISITES
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ============================================================================
-- 1. CORE TABLES
-- ============================================================================

-- 1.1 PROFILES TABLE
-- Authoritative user record linked to auth.users
CREATE TABLE IF NOT EXISTS public.profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email text UNIQUE NOT NULL,
  full_name text NOT NULL,
  role text NOT NULL CHECK (role IN ('admin', 'teacher', 'student', 'parent')),
  phone text,
  avatar_url text,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- 1.2 COURSES TABLE
CREATE TABLE IF NOT EXISTS public.courses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text,
  teacher_id uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  category text NOT NULL,
  price numeric(10, 2) NOT NULL DEFAULT 0.00 CHECK (price >= 0),
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- 1.3 ENROLLMENTS TABLE (Students enrolled in Courses)
CREATE TABLE IF NOT EXISTS public.enrollments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  course_id uuid NOT NULL REFERENCES public.courses(id) ON DELETE CASCADE,
  status text NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'completed', 'paused', 'cancelled')),
  meeting_link text,
  enrolled_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (student_id, course_id)
);

-- 1.4 LESSONS TABLE
CREATE TABLE IF NOT EXISTS public.lessons (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  course_id uuid REFERENCES public.courses(id) ON DELETE CASCADE,
  title text NOT NULL,
  content text,
  attachment_url text,
  target_type text NOT NULL DEFAULT 'all' CHECK (target_type IN ('all', 'course', 'specific_students')),
  created_by uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- 1.5 LESSON TARGET STUDENTS (For specific_students targeted lessons)
CREATE TABLE IF NOT EXISTS public.lesson_target_students (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  lesson_id uuid NOT NULL REFERENCES public.lessons(id) ON DELETE CASCADE,
  student_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  UNIQUE (lesson_id, student_id)
);

-- 1.6 ANNOUNCEMENTS TABLE
CREATE TABLE IF NOT EXISTS public.announcements (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  content text NOT NULL,
  target_type text NOT NULL DEFAULT 'all' CHECK (target_type IN ('all', 'course', 'specific_students')),
  course_id uuid REFERENCES public.courses(id) ON DELETE CASCADE,
  created_by uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- 1.7 ANNOUNCEMENT TARGET STUDENTS (For specific_students targeted announcements)
CREATE TABLE IF NOT EXISTS public.announcement_target_students (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  announcement_id uuid NOT NULL REFERENCES public.announcements(id) ON DELETE CASCADE,
  student_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  UNIQUE (announcement_id, student_id)
);

-- 1.8 EVALUATIONS TABLE (Grades, assessments, evaluations)
CREATE TABLE IF NOT EXISTS public.evaluations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  course_id uuid NOT NULL REFERENCES public.courses(id) ON DELETE CASCADE,
  teacher_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  title text NOT NULL,
  score numeric(5, 2) CHECK (score >= 0),
  max_score numeric(5, 2) NOT NULL DEFAULT 100.00 CHECK (max_score >= 0 AND max_score >= score),
  notes text,
  evaluation_date date NOT NULL DEFAULT CURRENT_DATE,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- 1.9 EXAMS TABLE
CREATE TABLE IF NOT EXISTS public.exams (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  course_id uuid NOT NULL REFERENCES public.courses(id) ON DELETE CASCADE,
  teacher_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  exam_title text NOT NULL,
  score numeric(5, 2) CHECK (score >= 0),
  max_score numeric(5, 2) NOT NULL DEFAULT 100.00 CHECK (max_score >= 0 AND max_score >= score),
  feedback text,
  exam_date date NOT NULL DEFAULT CURRENT_DATE,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- 1.10 RECITATIONS TABLE (Quran recitation & Tajweed mastery logs)
CREATE TABLE IF NOT EXISTS public.recitations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  course_id uuid NOT NULL REFERENCES public.courses(id) ON DELETE CASCADE,
  teacher_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  surah_name text NOT NULL,
  from_ayah integer CHECK (from_ayah > 0),
  to_ayah integer CHECK (to_ayah >= from_ayah),
  grade text CHECK (grade IN ('excellent', 'very_good', 'good', 'needs_revision')),
  notes text,
  recitation_date date NOT NULL DEFAULT CURRENT_DATE,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- 1.11 ATTENDANCE TABLE
CREATE TABLE IF NOT EXISTS public.attendance (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  course_id uuid NOT NULL REFERENCES public.courses(id) ON DELETE CASCADE,
  teacher_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  session_date date NOT NULL DEFAULT CURRENT_DATE,
  status text NOT NULL CHECK (status IN ('present', 'absent', 'excused', 'late')),
  notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (student_id, course_id, session_date)
);

-- 1.12 CERTIFICATES TABLE
CREATE TABLE IF NOT EXISTS public.certificates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  course_id uuid NOT NULL REFERENCES public.courses(id) ON DELETE CASCADE,
  title text NOT NULL,
  certificate_code text UNIQUE NOT NULL,
  issue_date date NOT NULL DEFAULT CURRENT_DATE,
  certificate_url text,
  issued_by uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- 1.13 TEACHER PAYOUT DETAILS TABLE
-- Holds banking details: holder name, bank name and IBAN only. NEVER stores full card numbers or CVV!
CREATE TABLE IF NOT EXISTS public.teacher_payout_details (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  teacher_id uuid UNIQUE NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  account_holder_name text NOT NULL,
  bank_name text NOT NULL,
  iban text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- 1.14 PAYROLL TABLE
-- CHECK constraints enforce no negative values. UNIQUE(teacher_id, month) prevents duplicate payroll runs.
CREATE TABLE IF NOT EXISTS public.payroll (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  teacher_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  month text NOT NULL, -- e.g. '2026-11'
  amount numeric(10, 2) NOT NULL CHECK (amount >= 0),
  bonus numeric(10, 2) NOT NULL DEFAULT 0.00 CHECK (bonus >= 0),
  deductions numeric(10, 2) NOT NULL DEFAULT 0.00 CHECK (deductions >= 0),
  net_amount numeric(10, 2) GENERATED ALWAYS AS (amount + bonus - deductions) STORED CHECK (net_amount >= 0),
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'paid', 'cancelled')),
  paid_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (teacher_id, month)
);

-- 1.15 ADMISSION REQUESTS TABLE (Public admission form)
CREATE TABLE IF NOT EXISTS public.admission_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  child_name text NOT NULL,
  child_age integer NOT NULL CHECK (child_age >= 3 AND child_age <= 18),
  parent_name text NOT NULL,
  parent_phone text NOT NULL,
  parent_email text,
  program_of_interest text NOT NULL,
  notes text,
  status text NOT NULL DEFAULT 'new' CHECK (status IN ('new', 'contacted', 'scheduled', 'enrolled', 'rejected')),
  created_at timestamptz NOT NULL DEFAULT now()
);

-- 1.16 AUDIT LOGS TABLE
-- Append-only system log table written by triggers for payroll, payout details, roles, certificates.
CREATE TABLE IF NOT EXISTS public.audit_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  table_name text NOT NULL,
  operation text NOT NULL CHECK (operation IN ('INSERT', 'UPDATE', 'DELETE')),
  record_id text NOT NULL,
  performed_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  old_data jsonb,
  new_data jsonb,
  timestamp timestamptz NOT NULL DEFAULT now()
);

-- ============================================================================
-- 2. SECURITY DEFINER HELPER FUNCTIONS
-- ============================================================================

-- 2.1 get_my_role()
-- Reads profiles and returns null if is_active = false or user not found/unauthenticated.
CREATE OR REPLACE FUNCTION public.get_my_role()
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth
STABLE
AS $$
DECLARE
  v_role text;
  v_is_active boolean;
BEGIN
  IF auth.uid() IS NULL THEN
    RETURN NULL;
  END IF;

  SELECT role, is_active INTO v_role, v_is_active
  FROM public.profiles
  WHERE id = auth.uid();

  IF v_is_active IS NOT TRUE THEN
    RETURN NULL;
  END IF;

  RETURN v_role;
END;
$$;

-- 2.2 is_admin()
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
SET search_path = public, auth
STABLE
AS $$
  SELECT COALESCE(public.get_my_role() = 'admin', false);
$$;

-- 2.3 is_teacher_of_student(target_student_id)
-- Evaluates whether the currently authenticated teacher teaches the student in any assigned course.
CREATE OR REPLACE FUNCTION public.is_teacher_of_student(target_student_id uuid)
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
SET search_path = public, auth
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.enrollments e
    JOIN public.courses c ON c.id = e.course_id
    WHERE e.student_id = target_student_id
      AND c.teacher_id = auth.uid()
      AND public.get_my_role() = 'teacher'
  );
$$;

-- 2.4 is_enrolled_in_course(target_course_id)
-- Evaluates whether the currently authenticated student is actively enrolled in the course.
CREATE OR REPLACE FUNCTION public.is_enrolled_in_course(target_course_id uuid)
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
SET search_path = public, auth
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.enrollments e
    WHERE e.course_id = target_course_id
      AND e.student_id = auth.uid()
      AND e.status = 'active'
  );
$$;

-- ============================================================================
-- 3. TRIGGERS & INTEGRITY GUARDS
-- ============================================================================

-- 3.1 PROTECT PROFILE ROLES
-- Only admin can change profiles.role, and NOBODY (not even an admin) can change their own role.
CREATE OR REPLACE FUNCTION public.trig_protect_profile_role()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  IF NEW.role IS DISTINCT FROM OLD.role THEN
    IF NOT public.is_admin() THEN
      RAISE EXCEPTION 'Access Denied: Only an active administrator can change user roles.';
    END IF;

    IF auth.uid() = OLD.id THEN
      RAISE EXCEPTION 'Access Denied: Users are strictly forbidden from modifying their own role.';
    END IF;
  END IF;

  NEW.updated_at := now();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS tr_protect_profile_role ON public.profiles;
CREATE TRIGGER tr_protect_profile_role
BEFORE UPDATE ON public.profiles
FOR EACH ROW
EXECUTE FUNCTION public.trig_protect_profile_role();

-- 3.2 FORCE ADMISSION REQUEST STATUS TO 'new' ON INSERT
CREATE OR REPLACE FUNCTION public.trig_force_admission_status_new()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.status := 'new';
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS tr_force_admission_status ON public.admission_requests;
CREATE TRIGGER tr_force_admission_status
BEFORE INSERT ON public.admission_requests
FOR EACH ROW
EXECUTE FUNCTION public.trig_force_admission_status_new();

-- 3.3 AUDIT LOGGER TRIGGER (For payroll, payout details, roles, certificates)
CREATE OR REPLACE FUNCTION public.trig_audit_logger()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth
AS $$
DECLARE
  v_rec_id text;
  v_old jsonb := null;
  v_new jsonb := null;
BEGIN
  IF TG_OP = 'DELETE' THEN
    v_rec_id := OLD.id::text;
    v_old := to_jsonb(OLD);
  ELSIF TG_OP = 'UPDATE' THEN
    v_rec_id := NEW.id::text;
    v_old := to_jsonb(OLD);
    v_new := to_jsonb(NEW);
  ELSE -- INSERT
    v_rec_id := NEW.id::text;
    v_new := to_jsonb(NEW);
  END IF;

  -- Filter audit logging for profiles: log only when role, is_active, or email changes, or on creation
  IF TG_TABLE_NAME = 'profiles' AND TG_OP = 'UPDATE' THEN
    IF (OLD.role IS NOT DISTINCT FROM NEW.role) AND
       (OLD.is_active IS NOT DISTINCT FROM NEW.is_active) AND
       (OLD.email IS NOT DISTINCT FROM NEW.email) THEN
      RETURN NEW;
    END IF;
  END IF;

  INSERT INTO public.audit_logs (
    table_name,
    operation,
    record_id,
    performed_by,
    old_data,
    new_data,
    timestamp
  ) VALUES (
    TG_TABLE_NAME,
    TG_OP,
    v_rec_id,
    auth.uid(),
    v_old,
    v_new,
    now()
  );

  IF TG_OP = 'DELETE' THEN
    RETURN OLD;
  END IF;
  RETURN NEW;
END;
$$;

-- Attach Audit Triggers
DROP TRIGGER IF EXISTS tr_audit_payroll ON public.payroll;
CREATE TRIGGER tr_audit_payroll
AFTER INSERT OR UPDATE OR DELETE ON public.payroll
FOR EACH ROW EXECUTE FUNCTION public.trig_audit_logger();

DROP TRIGGER IF EXISTS tr_audit_payouts ON public.teacher_payout_details;
CREATE TRIGGER tr_audit_payouts
AFTER INSERT OR UPDATE OR DELETE ON public.teacher_payout_details
FOR EACH ROW EXECUTE FUNCTION public.trig_audit_logger();

DROP TRIGGER IF EXISTS tr_audit_profiles ON public.profiles;
CREATE TRIGGER tr_audit_profiles
AFTER INSERT OR UPDATE OR DELETE ON public.profiles
FOR EACH ROW EXECUTE FUNCTION public.trig_audit_logger();

DROP TRIGGER IF EXISTS tr_audit_certificates ON public.certificates;
CREATE TRIGGER tr_audit_certificates
AFTER INSERT OR UPDATE OR DELETE ON public.certificates
FOR EACH ROW EXECUTE FUNCTION public.trig_audit_logger();

-- ============================================================================
-- 4. ENABLE ROW LEVEL SECURITY (RLS) — DEFAULT DENY ON EVERY TABLE
-- ============================================================================

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.enrollments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lessons ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lesson_target_students ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.announcements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.announcement_target_students ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.evaluations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.exams ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.recitations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.attendance ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.certificates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.teacher_payout_details ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payroll ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admission_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- 5. RLS POLICIES
-- ============================================================================

-- ----------------------------------------------------------------------------
-- 5.1 PROFILES POLICIES
-- ----------------------------------------------------------------------------
-- Admin: full access
CREATE POLICY "admin_all_profiles" ON public.profiles
  FOR ALL TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- Users can read their own profile
CREATE POLICY "users_read_own_profile" ON public.profiles
  FOR SELECT TO authenticated
  USING (id = auth.uid());

-- Users can update non-role fields on their own profile
CREATE POLICY "users_update_own_profile" ON public.profiles
  FOR UPDATE TO authenticated
  USING (id = auth.uid())
  WITH CHECK (id = auth.uid());

-- Teachers can read profiles of students enrolled in their assigned courses
CREATE POLICY "teachers_read_assigned_students" ON public.profiles
  FOR SELECT TO authenticated
  USING (public.is_teacher_of_student(id));

-- ----------------------------------------------------------------------------
-- 5.2 COURSES POLICIES
-- ----------------------------------------------------------------------------
-- Public/Authenticated: read active courses
CREATE POLICY "read_active_courses" ON public.courses
  FOR SELECT TO public
  USING (is_active = true OR public.is_admin() OR (public.get_my_role() = 'teacher' AND teacher_id = auth.uid()));

-- Admin: full management on courses
CREATE POLICY "admin_all_courses" ON public.courses
  FOR ALL TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- Teachers: can update details of their own assigned course
CREATE POLICY "teachers_update_assigned_courses" ON public.courses
  FOR UPDATE TO authenticated
  USING (public.get_my_role() = 'teacher' AND teacher_id = auth.uid())
  WITH CHECK (public.get_my_role() = 'teacher' AND teacher_id = auth.uid());

-- ----------------------------------------------------------------------------
-- 5.3 ENROLLMENTS POLICIES
-- ----------------------------------------------------------------------------
-- Admin: full access
CREATE POLICY "admin_all_enrollments" ON public.enrollments
  FOR ALL TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- Students: view their own enrollments
CREATE POLICY "students_view_own_enrollments" ON public.enrollments
  FOR SELECT TO authenticated
  USING (student_id = auth.uid());

-- Teachers: view enrollments in their assigned courses
CREATE POLICY "teachers_view_course_enrollments" ON public.enrollments
  FOR SELECT TO authenticated
  USING (
    public.get_my_role() = 'teacher' AND
    course_id IN (SELECT id FROM public.courses WHERE teacher_id = auth.uid())
  );

-- Teachers: can update meeting link for their enrolled students
CREATE POLICY "teachers_update_meeting_links" ON public.enrollments
  FOR UPDATE TO authenticated
  USING (
    public.get_my_role() = 'teacher' AND
    course_id IN (SELECT id FROM public.courses WHERE teacher_id = auth.uid())
  )
  WITH CHECK (
    public.get_my_role() = 'teacher' AND
    course_id IN (SELECT id FROM public.courses WHERE teacher_id = auth.uid())
  );

-- ----------------------------------------------------------------------------
-- 5.4 LESSONS & TARGETING POLICIES
-- (Visible only to targeted students: all, course, or specific students)
-- ----------------------------------------------------------------------------
-- Admin: full access on lessons
CREATE POLICY "admin_all_lessons" ON public.lessons
  FOR ALL TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- Teachers: manage lessons for their courses
CREATE POLICY "teachers_all_assigned_lessons" ON public.lessons
  FOR ALL TO authenticated
  USING (
    public.get_my_role() = 'teacher' AND
    (created_by = auth.uid() OR course_id IN (SELECT id FROM public.courses WHERE teacher_id = auth.uid()))
  )
  WITH CHECK (
    public.get_my_role() = 'teacher' AND
    (course_id IS NULL OR course_id IN (SELECT id FROM public.courses WHERE teacher_id = auth.uid()))
  );

-- Students: read lessons targeted to them
CREATE POLICY "students_read_targeted_lessons" ON public.lessons
  FOR SELECT TO authenticated
  USING (
    public.get_my_role() = 'student' AND (
      -- Target: all active students in the platform or in the course
      (target_type = 'all' AND (course_id IS NULL OR public.is_enrolled_in_course(course_id)))
      -- Target: enrolled course students
      OR (target_type = 'course' AND course_id IS NOT NULL AND public.is_enrolled_in_course(course_id))
      -- Target: explicitly targeted student ID
      OR (target_type = 'specific_students' AND EXISTS (
        SELECT 1 FROM public.lesson_target_students lts
        WHERE lts.lesson_id = lessons.id AND lts.student_id = auth.uid()
      ))
    )
  );

-- Admin & Teachers: manage lesson_target_students
CREATE POLICY "admin_all_lesson_targets" ON public.lesson_target_students
  FOR ALL TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

CREATE POLICY "teachers_manage_lesson_targets" ON public.lesson_target_students
  FOR ALL TO authenticated
  USING (
    public.get_my_role() = 'teacher' AND
    lesson_id IN (
      SELECT l.id FROM public.lessons l
      JOIN public.courses c ON c.id = l.course_id
      WHERE c.teacher_id = auth.uid()
    )
  )
  WITH CHECK (
    public.get_my_role() = 'teacher' AND
    lesson_id IN (
      SELECT l.id FROM public.lessons l
      JOIN public.courses c ON c.id = l.course_id
      WHERE c.teacher_id = auth.uid()
    )
  );

CREATE POLICY "students_view_own_lesson_target" ON public.lesson_target_students
  FOR SELECT TO authenticated
  USING (student_id = auth.uid());

-- ----------------------------------------------------------------------------
-- 5.5 ANNOUNCEMENTS POLICIES
-- ----------------------------------------------------------------------------
CREATE POLICY "admin_all_announcements" ON public.announcements
  FOR ALL TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

CREATE POLICY "teachers_manage_announcements" ON public.announcements
  FOR ALL TO authenticated
  USING (
    public.get_my_role() = 'teacher' AND
    (created_by = auth.uid() OR course_id IN (SELECT id FROM public.courses WHERE teacher_id = auth.uid()))
  )
  WITH CHECK (
    public.get_my_role() = 'teacher' AND
    (course_id IS NULL OR course_id IN (SELECT id FROM public.courses WHERE teacher_id = auth.uid()))
  );

CREATE POLICY "students_read_targeted_announcements" ON public.announcements
  FOR SELECT TO authenticated
  USING (
    public.get_my_role() = 'student' AND (
      (target_type = 'all' AND (course_id IS NULL OR public.is_enrolled_in_course(course_id)))
      OR (target_type = 'course' AND course_id IS NOT NULL AND public.is_enrolled_in_course(course_id))
      OR (target_type = 'specific_students' AND EXISTS (
        SELECT 1 FROM public.announcement_target_students ats
        WHERE ats.announcement_id = announcements.id AND ats.student_id = auth.uid()
      ))
    )
  );

CREATE POLICY "admin_all_announcement_targets" ON public.announcement_target_students
  FOR ALL TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

CREATE POLICY "students_view_own_announcement_target" ON public.announcement_target_students
  FOR SELECT TO authenticated
  USING (student_id = auth.uid());

-- ----------------------------------------------------------------------------
-- 5.6 EVALUATIONS POLICIES (Grades & Assessments)
-- (Teachers write only for assigned students; Students read-only)
-- ----------------------------------------------------------------------------
CREATE POLICY "admin_all_evaluations" ON public.evaluations
  FOR ALL TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- Teachers: read evaluations for students in their assigned courses
CREATE POLICY "teachers_read_evaluations" ON public.evaluations
  FOR SELECT TO authenticated
  USING (
    public.get_my_role() = 'teacher' AND
    (teacher_id = auth.uid() OR public.is_teacher_of_student(student_id))
  );

-- Teachers: insert evaluations only for assigned students in courses they teach
CREATE POLICY "teachers_insert_evaluations" ON public.evaluations
  FOR INSERT TO authenticated
  WITH CHECK (
    public.get_my_role() = 'teacher' AND
    teacher_id = auth.uid() AND
    public.is_teacher_of_student(student_id) AND
    course_id IN (SELECT id FROM public.courses WHERE teacher_id = auth.uid())
  );

-- Teachers: update/delete evaluations only for assigned students in courses they teach
CREATE POLICY "teachers_update_evaluations" ON public.evaluations
  FOR UPDATE TO authenticated
  USING (
    public.get_my_role() = 'teacher' AND
    teacher_id = auth.uid() AND
    public.is_teacher_of_student(student_id)
  )
  WITH CHECK (
    public.get_my_role() = 'teacher' AND
    teacher_id = auth.uid() AND
    public.is_teacher_of_student(student_id)
  );

CREATE POLICY "teachers_delete_evaluations" ON public.evaluations
  FOR DELETE TO authenticated
  USING (
    public.get_my_role() = 'teacher' AND
    teacher_id = auth.uid() AND
    public.is_teacher_of_student(student_id)
  );

-- Students: READ-ONLY for their own evaluations
CREATE POLICY "students_read_own_evaluations" ON public.evaluations
  FOR SELECT TO authenticated
  USING (student_id = auth.uid());

-- ----------------------------------------------------------------------------
-- 5.7 EXAMS POLICIES
-- ----------------------------------------------------------------------------
CREATE POLICY "admin_all_exams" ON public.exams
  FOR ALL TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

CREATE POLICY "teachers_read_exams" ON public.exams
  FOR SELECT TO authenticated
  USING (
    public.get_my_role() = 'teacher' AND
    (teacher_id = auth.uid() OR public.is_teacher_of_student(student_id))
  );

CREATE POLICY "teachers_insert_exams" ON public.exams
  FOR INSERT TO authenticated
  WITH CHECK (
    public.get_my_role() = 'teacher' AND
    teacher_id = auth.uid() AND
    public.is_teacher_of_student(student_id) AND
    course_id IN (SELECT id FROM public.courses WHERE teacher_id = auth.uid())
  );

CREATE POLICY "teachers_update_exams" ON public.exams
  FOR UPDATE TO authenticated
  USING (
    public.get_my_role() = 'teacher' AND
    teacher_id = auth.uid() AND
    public.is_teacher_of_student(student_id)
  )
  WITH CHECK (
    public.get_my_role() = 'teacher' AND
    teacher_id = auth.uid() AND
    public.is_teacher_of_student(student_id)
  );

CREATE POLICY "teachers_delete_exams" ON public.exams
  FOR DELETE TO authenticated
  USING (
    public.get_my_role() = 'teacher' AND
    teacher_id = auth.uid() AND
    public.is_teacher_of_student(student_id)
  );

-- Students: READ-ONLY for their own exams
CREATE POLICY "students_read_own_exams" ON public.exams
  FOR SELECT TO authenticated
  USING (student_id = auth.uid());

-- ----------------------------------------------------------------------------
-- 5.8 RECITATIONS POLICIES (Quran Recitation Logs)
-- ----------------------------------------------------------------------------
CREATE POLICY "admin_all_recitations" ON public.recitations
  FOR ALL TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

CREATE POLICY "teachers_read_recitations" ON public.recitations
  FOR SELECT TO authenticated
  USING (
    public.get_my_role() = 'teacher' AND
    (teacher_id = auth.uid() OR public.is_teacher_of_student(student_id))
  );

CREATE POLICY "teachers_insert_recitations" ON public.recitations
  FOR INSERT TO authenticated
  WITH CHECK (
    public.get_my_role() = 'teacher' AND
    teacher_id = auth.uid() AND
    public.is_teacher_of_student(student_id) AND
    course_id IN (SELECT id FROM public.courses WHERE teacher_id = auth.uid())
  );

CREATE POLICY "teachers_update_recitations" ON public.recitations
  FOR UPDATE TO authenticated
  USING (
    public.get_my_role() = 'teacher' AND
    teacher_id = auth.uid() AND
    public.is_teacher_of_student(student_id)
  )
  WITH CHECK (
    public.get_my_role() = 'teacher' AND
    teacher_id = auth.uid() AND
    public.is_teacher_of_student(student_id)
  );

CREATE POLICY "teachers_delete_recitations" ON public.recitations
  FOR DELETE TO authenticated
  USING (
    public.get_my_role() = 'teacher' AND
    teacher_id = auth.uid() AND
    public.is_teacher_of_student(student_id)
  );

-- Students: READ-ONLY for their own recitations
CREATE POLICY "students_read_own_recitations" ON public.recitations
  FOR SELECT TO authenticated
  USING (student_id = auth.uid());

-- ----------------------------------------------------------------------------
-- 5.9 ATTENDANCE POLICIES
-- ----------------------------------------------------------------------------
CREATE POLICY "admin_all_attendance" ON public.attendance
  FOR ALL TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

CREATE POLICY "teachers_read_attendance" ON public.attendance
  FOR SELECT TO authenticated
  USING (
    public.get_my_role() = 'teacher' AND
    (teacher_id = auth.uid() OR public.is_teacher_of_student(student_id))
  );

CREATE POLICY "teachers_insert_attendance" ON public.attendance
  FOR INSERT TO authenticated
  WITH CHECK (
    public.get_my_role() = 'teacher' AND
    teacher_id = auth.uid() AND
    public.is_teacher_of_student(student_id) AND
    course_id IN (SELECT id FROM public.courses WHERE teacher_id = auth.uid())
  );

CREATE POLICY "teachers_update_attendance" ON public.attendance
  FOR UPDATE TO authenticated
  USING (
    public.get_my_role() = 'teacher' AND
    teacher_id = auth.uid() AND
    public.is_teacher_of_student(student_id)
  )
  WITH CHECK (
    public.get_my_role() = 'teacher' AND
    teacher_id = auth.uid() AND
    public.is_teacher_of_student(student_id)
  );

CREATE POLICY "teachers_delete_attendance" ON public.attendance
  FOR DELETE TO authenticated
  USING (
    public.get_my_role() = 'teacher' AND
    teacher_id = auth.uid() AND
    public.is_teacher_of_student(student_id)
  );

-- Students: READ-ONLY for their own attendance
CREATE POLICY "students_read_own_attendance" ON public.attendance
  FOR SELECT TO authenticated
  USING (student_id = auth.uid());

-- ----------------------------------------------------------------------------
-- 5.10 CERTIFICATES POLICIES
-- ----------------------------------------------------------------------------
CREATE POLICY "admin_all_certificates" ON public.certificates
  FOR ALL TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

CREATE POLICY "teachers_read_certificates" ON public.certificates
  FOR SELECT TO authenticated
  USING (
    public.get_my_role() = 'teacher' AND
    (issued_by = auth.uid() OR public.is_teacher_of_student(student_id))
  );

CREATE POLICY "teachers_insert_certificates" ON public.certificates
  FOR INSERT TO authenticated
  WITH CHECK (
    public.get_my_role() = 'teacher' AND
    issued_by = auth.uid() AND
    public.is_teacher_of_student(student_id)
  );

-- Students: READ-ONLY for their own certificates
CREATE POLICY "students_read_own_certificates" ON public.certificates
  FOR SELECT TO authenticated
  USING (student_id = auth.uid());

-- ----------------------------------------------------------------------------
-- 5.11 TEACHER PAYOUT DETAILS POLICIES
-- (Visible only to owning teacher and admin. No cards/CVV stored)
-- ----------------------------------------------------------------------------
CREATE POLICY "admin_all_payout_details" ON public.teacher_payout_details
  FOR ALL TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

CREATE POLICY "teachers_read_own_payout_details" ON public.teacher_payout_details
  FOR SELECT TO authenticated
  USING (public.get_my_role() = 'teacher' AND teacher_id = auth.uid());

CREATE POLICY "teachers_insert_own_payout_details" ON public.teacher_payout_details
  FOR INSERT TO authenticated
  WITH CHECK (public.get_my_role() = 'teacher' AND teacher_id = auth.uid());

CREATE POLICY "teachers_update_own_payout_details" ON public.teacher_payout_details
  FOR UPDATE TO authenticated
  USING (public.get_my_role() = 'teacher' AND teacher_id = auth.uid())
  WITH CHECK (public.get_my_role() = 'teacher' AND teacher_id = auth.uid());

-- ----------------------------------------------------------------------------
-- 5.12 PAYROLL POLICIES
-- ----------------------------------------------------------------------------
CREATE POLICY "admin_all_payroll" ON public.payroll
  FOR ALL TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

CREATE POLICY "teachers_read_own_payroll" ON public.payroll
  FOR SELECT TO authenticated
  USING (public.get_my_role() = 'teacher' AND teacher_id = auth.uid());

-- ----------------------------------------------------------------------------
-- 5.13 ADMISSION REQUESTS POLICIES (Public admission form)
-- (INSERT only for public/anon, limited columns, status forced to 'new')
-- ----------------------------------------------------------------------------
-- Public/anon and authenticated can INSERT with status forced to 'new'
CREATE POLICY "public_insert_admission_request" ON public.admission_requests
  FOR INSERT TO public
  WITH CHECK (status = 'new');

-- Admin: full management on admission requests
CREATE POLICY "admin_all_admission_requests" ON public.admission_requests
  FOR ALL TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- ----------------------------------------------------------------------------
-- 5.14 AUDIT LOGS POLICIES (Append-only)
-- ----------------------------------------------------------------------------
-- Admin: read-only access to audit logs
CREATE POLICY "admin_read_audit_logs" ON public.audit_logs
  FOR SELECT TO authenticated
  USING (public.is_admin());

-- No UPDATE or DELETE policies exist for audit_logs (append-only enforcement)

-- ============================================================================
-- 6. STORAGE BUCKETS & POLICIES (No Public Write)
-- ============================================================================

-- Create Storage Buckets
INSERT INTO storage.buckets (id, name, public)
VALUES 
  ('lesson-images', 'lesson-images', true),
  ('certificates', 'certificates', false),
  ('avatars', 'avatars', true)
ON CONFLICT (id) DO UPDATE SET public = EXCLUDED.public;

-- Enable RLS on storage.objects
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

-- 6.1 LESSON-IMAGES BUCKET POLICIES
CREATE POLICY "read_lesson_images" ON storage.objects
  FOR SELECT TO authenticated
  USING (bucket_id = 'lesson-images');

CREATE POLICY "teachers_admin_upload_lesson_images" ON storage.objects
  FOR INSERT TO authenticated
  WITH CHECK (
    bucket_id = 'lesson-images' AND
    (public.is_admin() OR public.get_my_role() = 'teacher')
  );

CREATE POLICY "teachers_admin_update_lesson_images" ON storage.objects
  FOR UPDATE TO authenticated
  USING (
    bucket_id = 'lesson-images' AND
    (public.is_admin() OR public.get_my_role() = 'teacher')
  );

CREATE POLICY "teachers_admin_delete_lesson_images" ON storage.objects
  FOR DELETE TO authenticated
  USING (
    bucket_id = 'lesson-images' AND
    (public.is_admin() OR public.get_my_role() = 'teacher')
  );

-- 6.2 CERTIFICATES BUCKET POLICIES
CREATE POLICY "read_own_certificates" ON storage.objects
  FOR SELECT TO authenticated
  USING (
    bucket_id = 'certificates' AND (
      public.is_admin() OR
      public.get_my_role() = 'teacher' OR
      (storage.foldername(name))[1] = auth.uid()::text
    )
  );

CREATE POLICY "admin_teachers_upload_certificates" ON storage.objects
  FOR INSERT TO authenticated
  WITH CHECK (
    bucket_id = 'certificates' AND
    (public.is_admin() OR public.get_my_role() = 'teacher')
  );

CREATE POLICY "admin_teachers_manage_certificates" ON storage.objects
  FOR ALL TO authenticated
  USING (
    bucket_id = 'certificates' AND
    (public.is_admin() OR public.get_my_role() = 'teacher')
  );

-- 6.3 AVATARS BUCKET POLICIES
CREATE POLICY "read_avatars" ON storage.objects
  FOR SELECT TO public
  USING (bucket_id = 'avatars');

CREATE POLICY "upload_own_avatar" ON storage.objects
  FOR INSERT TO authenticated
  WITH CHECK (
    bucket_id = 'avatars' AND
    (storage.foldername(name))[1] = auth.uid()::text
  );

CREATE POLICY "update_own_avatar" ON storage.objects
  FOR UPDATE TO authenticated
  USING (
    bucket_id = 'avatars' AND
    (storage.foldername(name))[1] = auth.uid()::text
  );

CREATE POLICY "delete_own_avatar" ON storage.objects
  FOR DELETE TO authenticated
  USING (
    bucket_id = 'avatars' AND (
      public.is_admin() OR
      (storage.foldername(name))[1] = auth.uid()::text
    )
  );
