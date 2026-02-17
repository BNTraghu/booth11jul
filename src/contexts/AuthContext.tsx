import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { supabase } from '../lib/supabase';
import { User, UserRole } from '../types';

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  hasRole: (roles: UserRole[]) => boolean;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const isInitialLoadRef = useRef(true);

  const PROFILE_FETCH_TIMEOUT_MS = 4000;

  const fetchUserProfile = async (email: string): Promise<User | null> => {
    const fetchPromise = (async () => {
      try {
        console.log(`[Auth] Fetching profile for: ${email}`);
        const { data: profile, error } = await supabase
          .from('users')
          .select('*')
          .eq('email', email)
          .single();

        if (error) {
          console.warn('[Auth] Profile error:', error.message, error.code);
          return null;
        }
        if (!profile) return null;
        console.log('[Auth] Profile loaded for:', email);
        return {
          id: profile.id,
          email: profile.email,
          name: profile.name,
          role: profile.role as UserRole,
          city: profile.city,
          phone: profile.phone,
          status: profile.status as 'active' | 'inactive',
          created_at: profile.created_at,
          last_login: profile.last_login,
          updated_at: profile.updated_at
        } as User;
      } catch (err: any) {
        console.warn('[Auth] Profile fetch failed:', err?.message ?? err);
        return null;
      }
    })();

    const timeoutPromise = new Promise<User | null>((_, reject) =>
      setTimeout(() => reject(new Error('timeout')), PROFILE_FETCH_TIMEOUT_MS)
    );

    try {
      return await Promise.race([fetchPromise, timeoutPromise]);
    } catch (err: any) {
      if (err?.message === 'timeout') {
        console.warn('[Auth] Profile fetch timed out, using fallback');
      }
      return null;
    }
  };

  useEffect(() => {
    let cancelled = false;
    const timer = setTimeout(() => {
      if (!cancelled) setIsLoading(false);
    }, 8000);

    // Run initial session check so after full-page redirect we have user and stop loading quickly
    const initSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (cancelled) return;
      if (session?.user) {
        const profile = await fetchUserProfile(session.user.email!);
        if (cancelled) return;
        if (profile) {
          setUser(profile);
        } else {
          setUser({
            id: session.user.id,
            email: session.user.email!,
            name: (session.user.user_metadata?.name as string) || session.user.email!.split('@')[0],
            role: 'admin',
            city: null,
            phone: null,
            status: 'active',
            created_at: session.user.created_at ?? new Date().toISOString(),
            last_login: null,
            updated_at: new Date().toISOString()
          } as User);
        }
      }
      if (isInitialLoadRef.current) {
        isInitialLoadRef.current = false;
        setIsLoading(false);
        clearTimeout(timer);
      }
    };
    initSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (cancelled) return;
      if (session?.user) {
        const profile = await fetchUserProfile(session.user.email!);
        if (cancelled) return;
        setUser(profile ?? {
          id: session.user.id,
          email: session.user.email!,
          name: (session.user.user_metadata?.name as string) || session.user.email!.split('@')[0],
          role: 'admin',
          city: null,
          phone: null,
          status: 'active',
          created_at: session.user.created_at ?? new Date().toISOString(),
          last_login: null,
          updated_at: new Date().toISOString()
        } as User);
      } else {
        setUser(null);
      }
      if (isInitialLoadRef.current) {
        isInitialLoadRef.current = false;
        setIsLoading(false);
        clearTimeout(timer);
      }
    });

    return () => {
      cancelled = true;
      subscription.unsubscribe();
      clearTimeout(timer);
    };
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;

    if (!data?.user) return false;

    // Fetch profile from public.users (uses session set by signIn above)
    let profile = await fetchUserProfile(data.user.email!);
    if (!profile) {
      // Fallback: build minimal user from auth so dashboard still shows if public.users read fails (e.g. RLS)
      profile = {
        id: data.user.id,
        email: data.user.email!,
        name: (data.user.user_metadata?.name as string) || data.user.email!.split('@')[0],
        role: 'admin',
        city: null,
        phone: null,
        status: 'active',
        created_at: data.user.created_at ?? new Date().toISOString(),
        last_login: null,
        updated_at: new Date().toISOString()
      } as User;
      console.warn('[Auth] Using fallback user from auth (public.users profile not found)');
    }
    setUser(profile);

    // Update last_login in background; don't block
    supabase
      .from('users')
      .update({ last_login: new Date().toISOString() })
      .eq('email', email)
      .then(() => {})
      .catch(() => {});

    return true;
  };

  const logout = async () => {
    await supabase.auth.signOut();
    setUser(null);
  };

  const hasRole = (roles: UserRole[]): boolean => {
    return user ? roles.includes(user.role) : false;
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, hasRole, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
};
