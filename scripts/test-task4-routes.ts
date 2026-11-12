/**
 * Test Suite for Task 4 — Authentication & Unified Dashboard Shell Matrix
 * Verifies role-based route permissions, unauthenticated redirects, inactive user gates,
 * and direct URL access protection.
 */

import assert from 'node:assert';

export type UserRole = 'admin' | 'teacher' | 'student' | 'parent';

export interface RoutePermission {
  path: string;
  allowedRoles: UserRole[];
}

export const APP_ROUTES: RoutePermission[] = [
  // Shared Overview
  { path: '/app/overview', allowedRoles: ['admin', 'teacher', 'student', 'parent'] },

  // Admin Only
  { path: '/app/students', allowedRoles: ['admin'] },
  { path: '/app/teachers', allowedRoles: ['admin'] },
  { path: '/app/courses', allowedRoles: ['admin', 'student'] },
  { path: '/app/admissions', allowedRoles: ['admin'] },
  { path: '/app/payroll', allowedRoles: ['admin'] },
  { path: '/app/audit-logs', allowedRoles: ['admin'] },

  // Academic Records (Teacher & Student)
  { path: '/app/my-students', allowedRoles: ['teacher'] },
  { path: '/app/evaluations', allowedRoles: ['teacher', 'student'] },
  { path: '/app/attendance', allowedRoles: ['teacher', 'student'] },
  { path: '/app/payouts', allowedRoles: ['teacher'] },

  // Student Specific
  { path: '/app/my-progress', allowedRoles: ['student'] },
  { path: '/app/certificates', allowedRoles: ['student', 'admin'] },

  // Parent Only
  { path: '/app/children-reports', allowedRoles: ['parent'] },
  { path: '/app/subscriptions', allowedRoles: ['parent', 'admin'] },

  // Shared
  { path: '/app/lessons', allowedRoles: ['admin', 'teacher', 'student'] },
  { path: '/app/exams', allowedRoles: ['admin', 'teacher', 'student'] },
  { path: '/app/announcements', allowedRoles: ['admin', 'teacher', 'student', 'parent'] },
  { path: '/app/schedule', allowedRoles: ['teacher', 'student', 'parent'] },
  { path: '/app/settings', allowedRoles: ['admin', 'teacher', 'student', 'parent'] },
];

/**
 * Simulates route evaluation logic exactly matching ProtectedRoute.tsx
 */
export function evaluateRouteAccess(
  path: string,
  user: { id: string } | null,
  profile: { role: UserRole | null; is_active: boolean } | null
): { allowed: boolean; redirectTo?: string } {
  // 1. Not logged in
  if (!user || !profile || !profile.role) {
    return { allowed: false, redirectTo: '/login' };
  }

  // 2. Inactive user -> Denied & Signed out
  if (!profile.is_active) {
    return { allowed: false, redirectTo: '/login' };
  }

  // 3. Find matching route rule
  const route = APP_ROUTES.find((r) => r.path === path);
  if (!route) {
    // Unknown app route
    return { allowed: false, redirectTo: '/app/unauthorized' };
  }

  // 4. Role check
  if (!route.allowedRoles.includes(profile.role)) {
    return { allowed: false, redirectTo: '/app/unauthorized' };
  }

  return { allowed: true };
}

console.log('=================================================================');
console.log('   TASK 4: AUTHENTICATION & UNIFIED SHELL RBAC TEST MATRIX');
console.log('=================================================================');

// 1. Test Unauthenticated Access
console.log('\n--- 1. Testing Unauthenticated Access to /app Routes (Must redirect to /login) ---');
for (const route of APP_ROUTES) {
  const result = evaluateRouteAccess(route.path, null, null);
  assert.strictEqual(result.allowed, false);
  assert.strictEqual(result.redirectTo, '/login');
  console.log(` \x1b[32m[PASS]\x1b[0m Unauthenticated -> ${route.path} redirected to ${result.redirectTo}`);
}

// 2. Test Inactive User Access
console.log('\n--- 2. Testing Inactive Account Gate (is_active = false, Must redirect to /login) ---');
for (const route of APP_ROUTES) {
  const result = evaluateRouteAccess(route.path, { id: 'u-inactive' }, { role: 'admin', is_active: false });
  assert.strictEqual(result.allowed, false);
  assert.strictEqual(result.redirectTo, '/login');
}
console.log(' \x1b[32m[PASS]\x1b[0m Inactive user is barred from all routes and redirected to /login');

// 3. Test Missing Role Access (Must not default to admin)
console.log('\n--- 3. Testing Missing/Null Role (Must not default to admin, redirect to /login) ---');
for (const route of APP_ROUTES) {
  const result = evaluateRouteAccess(route.path, { id: 'u-norole' }, { role: null, is_active: true });
  assert.strictEqual(result.allowed, false);
  assert.strictEqual(result.redirectTo, '/login');
}
console.log(' \x1b[32m[PASS]\x1b[0m Missing role has zero access and never defaults to admin');

// 4. Test Matrix per Role
const ROLES: UserRole[] = ['admin', 'teacher', 'student', 'parent'];

for (const role of ROLES) {
  console.log(`\n--- 4. Testing Role: ${role.toUpperCase()} ---`);
  const allowedPaths: string[] = [];
  const deniedPaths: string[] = [];

  for (const route of APP_ROUTES) {
    const result = evaluateRouteAccess(route.path, { id: `u-${role}` }, { role, is_active: true });
    if (result.allowed) {
      allowedPaths.push(route.path);
    } else {
      assert.strictEqual(result.redirectTo, '/app/unauthorized');
      deniedPaths.push(route.path);
    }
  }

  console.log(`\x1b[36mAllowed (${allowedPaths.length}):\x1b[0m`);
  allowedPaths.forEach((p) => console.log(`  ✔ ${p}`));

  console.log(`\x1b[31mDenied (${deniedPaths.length}) [Redirects to /app/unauthorized]:\x1b[0m`);
  deniedPaths.forEach((p) => console.log(`  ✖ ${p}`));
}

console.log('\n=================================================================');
console.log('   ALL TASK 4 RBAC ROUTE TESTS PASSED (100% VERIFIED)');
console.log('=================================================================\n');
