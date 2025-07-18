import React, { createContext, useContext, useState, useEffect } from 'react';
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
    console.warn('[useAuth] used outside of AuthProvider');
    console.trace('Stack trace for useAuth usage outside of AuthProvider');
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
 
export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
 
 
 
  /*useEffect(() => {
    // Check for existing session
    const savedUser = localStorage.getItem('user');
    if (savedUser) {
      try {
        setUser(JSON.parse(savedUser));
        setIsLoading(false);
        return;
      } catch (error) {
        localStorage.removeItem('user');
      }
    }
   
    const checkSession = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
       
        if (session?.user) {
          // Fetch user profile from our users table
          const { data: userProfile, error } = await supabase
            .from('users')
            .select('*')
            .eq('email', session.user.email)
            .single();
 
          if (userProfile && !error) {
            setUser({
              id: userProfile.id,
              email: userProfile.email,
              name: userProfile.name,
              role: userProfile.role as UserRole,
              city: userProfile.city,
              phone: userProfile.phone,
              status: userProfile.status as 'active' | 'inactive',
              created_at: userProfile.created_at,
              last_login: userProfile.last_login,
              updated_at: userProfile.updated_at
            });
          }
        }
      } catch (error) {
        console.error('Error checking session:', error);
      } finally {
        setIsLoading(false);
      }
    };
 
    checkSession();
 
    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_IN' && session?.user) {
        // Fetch user profile
        const { data: userProfile, error } = await supabase
          .from('users')
          .select('*')
          .eq('email', session.user.email)
          .single();
 
        if (userProfile && !error) {
          setUser({
            id: userProfile.id,
            email: userProfile.email,
            name: userProfile.name,
            role: userProfile.role as UserRole,
            city: userProfile.city,
            phone: userProfile.phone,
            status: userProfile.status as 'active' | 'inactive',
            created_at: userProfile.created_at,
            last_login: userProfile.last_login,
            updated_at: userProfile.updated_at
          });
        }
      } else if (event === 'SIGNED_OUT') {
        setUser(null);
      }
    });
 
    return () => subscription.unsubscribe();
  }, []);*/
 
  // Initial check for user in localStorage
 
 
  // useEffect(() => {
  //   console.log('[Auth] Checking session...');
  //   const checkSession = async () => {
  //     try {
  //       const { data: { session },error } = await supabase.auth.getSession();
 
  //       console.log('[Auth] Session data:', session);
 
  //       if (error) {
  //         console.error('Error fetching session:', error);
  //         setIsLoading(false);
  //         return;
  //       }
 
  //       if (session?.user) {
  //         const { data: userProfile, error } = await supabase
  //           .from('users')
  //           .select('*')
  //           .eq('email', session.user.email)
  //           .single();
 
  //         if (userProfile && !error) {
  //           setUser({
  //             id: userProfile.id,
  //             email: userProfile.email,
  //             name: userProfile.name,
  //             role: userProfile.role as UserRole,
  //             city: userProfile.city,
  //             phone: userProfile.phone,
  //             status: userProfile.status as 'active' | 'inactive',
  //             created_at: userProfile.created_at,
  //             last_login: userProfile.last_login,
  //             updated_at: userProfile.updated_at
  //           });
 
  //           // Optional: Save to localStorage again
  //           localStorage.setItem('user', JSON.stringify(userProfile));
  //         } else {
  //           setUser(null);
  //           localStorage.removeItem('user');
  //         }
  //       } else {
  //         setUser(null);
  //         localStorage.removeItem('user');
  //       }
  //     } catch (error) {
  //       console.error('[Auth] Exception during checkSession:', error);
  //       setUser(null);
  //     } finally {
  //       console.log('[Auth] Setting isLoading to false');
  //       setIsLoading(false);
  //     }
  //   };
 
  //   checkSession();
 
  //   const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
  //     if (event === 'SIGNED_IN' && session?.user) {
  //       const { data: userProfile, error } = await supabase
  //         .from('users')
  //         .select('*')
  //         .eq('email', session.user.email)
  //         .single();
 
  //       if (userProfile && !error) {
  //         setUser({
  //           id: userProfile.id,
  //           email: userProfile.email,
  //           name: userProfile.name,
  //           role: userProfile.role as UserRole,
  //           city: userProfile.city,
  //           phone: userProfile.phone,
  //           status: userProfile.status as 'active' | 'inactive',
  //           created_at: userProfile.created_at,
  //           last_login: userProfile.last_login,
  //           updated_at: userProfile.updated_at
  //         });
  //         localStorage.setItem('user', JSON.stringify(userProfile));
  //       }
  //     } else if (event === 'SIGNED_OUT') {
  //       setUser(null);
  //       localStorage.removeItem('user');
  //     }
  //   });
 
  //   return () => subscription.unsubscribe();
  // }, []);
  useEffect(() => {
    let isMounted = true;
 
    const checkSession = async () => {
      console.log('[Auth] Checking session...');
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
 
        if (error) {
          console.error('[Auth] Session fetch error:', error);
        }
 
        if (session?.user && isMounted) {
          const { data: userProfile, error: profileError } = await supabase
            .from('users')
            .select('*')
            .eq('email', session.user.email)
            .single();
 
          if (profileError) {
            console.error('[Auth] Profile error:', profileError);
          } else {
            setUser({
              id: userProfile.id,
              email: userProfile.email,
              name: userProfile.name,
              role: userProfile.role as UserRole,
              city: userProfile.city,
              phone: userProfile.phone,
              status: userProfile.status as 'active' | 'inactive',
              created_at: userProfile.created_at,
              last_login: userProfile.last_login,
              updated_at: userProfile.updated_at
            });
          }
        }
      } catch (err) {
        if (isMounted) {
          console.error('[Auth] Unexpected error checking session:', err);
        }
      } finally {
        if (isMounted) {
          console.log('[Auth] Setting isLoading = false');
          setIsLoading(false);
        }
      }
    };
 
    checkSession();
 
    return () => {
      isMounted = false; // Prevent state updates after unmount
    };
  }, []);
 
 
  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
 
      if (error) {
        console.error('Login error:', error);
        return false;
      }
 
      if (data.user) {
        // Update last_login timestamp
        await supabase
          .from('users')
          .update({ last_login: new Date().toISOString() })
          .eq('email', email);
 
        return true;
      }
 
      return false;
    } catch (error) {
      console.error('Login error:', error);
      return false;
    }
  };
 
  const logout = async () => {
    try {
      // Check if we're using the demo user
      const savedUser = localStorage.getItem('user');
      if (savedUser) {
        localStorage.removeItem('user');
        setUser(null);
        return;
      }
 
      await supabase.auth.signOut();
      setUser(null);
    } catch (error) {
      console.error('Logout error:', error);
    }
  };
 
  const hasRole = (roles: UserRole[]): boolean => {
    return user ? roles.includes(user.role) : false;
  };
 
  return (
    <AuthContext.Provider value={{
      user,
      login,
      logout,
      hasRole,
      isLoading
    }}>
      {children}
    </AuthContext.Provider>
  );
};