import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import type { UserRole } from '../../types';

interface ProtectedRouteProps {
  allowedRoles?: UserRole[];
  children: React.ReactNode;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ allowedRoles, children }) => {
  const { user, profile, role, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen bg-[#070D0B] text-slate-100 flex flex-col items-center justify-center font-['Tajawal',sans-serif]" dir="rtl">
        <div className="w-10 h-10 border-3 border-emerald-500/20 border-t-emerald-400 rounded-full animate-spin mb-4" />
        <p className="text-xs sm:text-sm font-bold text-slate-300">التحقق من جلسة الدخول والصلاحيات...</p>
      </div>
    );
  }

  // Not logged in -> Redirect to login
  if (!user || !profile || !role) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Inactive user -> Redirect to login (already handled in context, but reinforced here)
  if (profile.is_active !== true) {
    return <Navigate to="/login" replace />;
  }

  // Role not allowed for this route -> Direct URL access MUST fail
  if (allowedRoles && allowedRoles.length > 0 && !allowedRoles.includes(role)) {
    return (
      <Navigate
        to="/app/unauthorized"
        state={{ attemptedPath: location.pathname, requiredRoles: allowedRoles, currentRole: role }}
        replace
      />
    );
  }

  return <>{children}</>;
};
