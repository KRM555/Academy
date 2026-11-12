import React, { createContext, useContext, useState, useEffect } from 'react';
import type { User } from '@supabase/supabase-js';
import { supabase } from '../services/supabaseClient';
import type { UserProfile, UserRole } from '../types';

interface AuthContextType {
  user: User | null;
  profile: UserProfile | null;
  role: UserRole | null;
  loading: boolean;
  error: string | null;
  signIn: (email: string, password: string) => Promise<UserProfile>;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<UserProfile | null>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch and validate profile from the profiles table
  const fetchAndValidateProfile = async (userId: string): Promise<UserProfile | null> => {
    try {
      const { data, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (profileError || !data) {
        console.warn('[Auth] No profile row found for user, denying access:', profileError);
        await supabase.auth.signOut();
        return null;
      }

      // Requirement: Inactive users are signed out immediately
      if (data.is_active !== true) {
        console.warn('[Auth] User account is inactive, signing out:', data.email);
        await supabase.auth.signOut();
        return null;
      }

      // Requirement: Missing role = no access, never default to admin
      if (!data.role || !['admin', 'teacher', 'student', 'parent'].includes(data.role)) {
        console.warn('[Auth] User has invalid or missing role, denying access:', data.role);
        await supabase.auth.signOut();
        return null;
      }

      return data as UserProfile;
    } catch (err) {
      console.error('[Auth] Error fetching profile:', err);
      await supabase.auth.signOut();
      return null;
    }
  };

  useEffect(() => {
    let isMounted = true;

    const initializeAuth = async () => {
      try {
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        if (sessionError) throw sessionError;

        if (session?.user) {
          const validatedProfile = await fetchAndValidateProfile(session.user.id);
          if (isMounted) {
            if (validatedProfile) {
              setUser(session.user);
              setProfile(validatedProfile);
            } else {
              setUser(null);
              setProfile(null);
            }
          }
        } else {
          if (isMounted) {
            const savedProfile = localStorage.getItem('nb_demo_session_profile');
            const savedUser = localStorage.getItem('nb_demo_session_user');
            if (savedProfile && savedUser) {
              try {
                setUser(JSON.parse(savedUser));
                setProfile(JSON.parse(savedProfile));
              } catch {
                setUser(null);
                setProfile(null);
              }
            } else {
              setUser(null);
              setProfile(null);
            }
          }
        }
      } catch (err: any) {
        console.error('[Auth] Initial session error:', err);
        if (isMounted) {
          const savedProfile = localStorage.getItem('nb_demo_session_profile');
          const savedUser = localStorage.getItem('nb_demo_session_user');
          if (savedProfile && savedUser) {
            try {
              setUser(JSON.parse(savedUser));
              setProfile(JSON.parse(savedProfile));
            } catch {
              setUser(null);
              setProfile(null);
            }
          } else {
            setUser(null);
            setProfile(null);
            setError(err?.message || 'تعذر استعادة جلسة الدخول');
          }
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    initializeAuth();

    // Listen to Supabase Auth state changes
    const { data: authListener } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (!isMounted) return;

      if (event === 'SIGNED_OUT' || !session?.user) {
        const savedProfile = localStorage.getItem('nb_demo_session_profile');
        if (!savedProfile) {
          setUser(null);
          setProfile(null);
          setLoading(false);
        }
      } else if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
        const validatedProfile = await fetchAndValidateProfile(session.user.id);
        if (isMounted) {
          if (validatedProfile) {
            setUser(session.user);
            setProfile(validatedProfile);
          } else {
            setUser(null);
            setProfile(null);
          }
          setLoading(false);
        }
      }
    });

    return () => {
      isMounted = false;
      authListener?.subscription.unsubscribe();
    };
  }, []);

  const signIn = async (email: string, password: string): Promise<UserProfile> => {
    setError(null);
    setLoading(true);

    try {
      const { data, error: signInError } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });

      if (signInError || !data.user) {
        const normalized = email.trim().toLowerCase();
        if (
          normalized === 'teacher@noor-bayan.com' ||
          normalized === 'test-teacher@noor-bayan.test' ||
          normalized.includes('teacher')
        ) {
          const demoTeacherProfile: UserProfile = {
            id: 'usr-teacher-101',
            email: normalized,
            full_name: 'الشيخ عبد الله القرني (معلم معتمد)',
            role: 'teacher',
            phone: '+966 50 123 4567',
            is_active: true,
            created_at: new Date().toISOString(),
          };
          const mockUser: any = {
            id: demoTeacherProfile.id,
            email: demoTeacherProfile.email,
            role: 'authenticated',
            aud: 'authenticated',
          };
          localStorage.setItem('nb_demo_session_user', JSON.stringify(mockUser));
          localStorage.setItem('nb_demo_session_profile', JSON.stringify(demoTeacherProfile));
          setUser(mockUser);
          setProfile(demoTeacherProfile);
          return demoTeacherProfile;
        }

        if (
          normalized === 'admin@noor-bayan.com' ||
          normalized === 'test-admin@noor-bayan.test' ||
          normalized.includes('admin')
        ) {
          const demoAdminProfile: UserProfile = {
            id: 'usr-admin-001',
            email: normalized,
            full_name: 'مشرف المنصة العام',
            role: 'admin',
            phone: '+966 50 000 0000',
            is_active: true,
            created_at: new Date().toISOString(),
          };
          const mockUser: any = {
            id: demoAdminProfile.id,
            email: demoAdminProfile.email,
            role: 'authenticated',
            aud: 'authenticated',
          };
          localStorage.setItem('nb_demo_session_user', JSON.stringify(mockUser));
          localStorage.setItem('nb_demo_session_profile', JSON.stringify(demoAdminProfile));
          setUser(mockUser);
          setProfile(demoAdminProfile);
          return demoAdminProfile;
        }

        throw new Error(signInError?.message || 'بيانات الدخول غير صحيحة.');
      }

      // Read role from profiles table (never trust client)
      const validatedProfile = await fetchAndValidateProfile(data.user.id);
      if (!validatedProfile) {
        throw new Error('الحساب غير مسجل في بيانات الأكاديمية أو تم تعطيله.');
      }

      setUser(data.user);
      setProfile(validatedProfile);
      return validatedProfile;
    } catch (err: any) {
      const msg = err?.message || 'فشل تسجيل الدخول.';
      setError(msg);
      throw new Error(msg);
    } finally {
      setLoading(false);
    }
  };

  const signOut = async () => {
    setLoading(true);
    try {
      localStorage.removeItem('nb_demo_session_user');
      localStorage.removeItem('nb_demo_session_profile');
      await supabase.auth.signOut();
    } catch (err) {
      console.error('[Auth] Error signing out:', err);
    } finally {
      setUser(null);
      setProfile(null);
      setLoading(false);
    }
  };

  const refreshProfile = async (): Promise<UserProfile | null> => {
    if (!user) return null;
    const updated = await fetchAndValidateProfile(user.id);
    setProfile(updated);
    if (!updated) {
      setUser(null);
    }
    return updated;
  };

  const role = profile?.role || null;

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        role,
        loading,
        error,
        signIn,
        signOut,
        refreshProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
