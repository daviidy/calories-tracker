'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { User, GoogleAuthProvider, signInWithPopup, signOut } from '@firebase/auth';
import { auth } from '@/lib/firebase/config';
import { useRouter } from 'next/navigation';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signInWithGoogle: () => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  signInWithGoogle: async () => {},
  logout: async () => {},
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (user) => {
      setUser(user);
      setLoading(false);

      if (user) {
        try {
          const idToken = await user.getIdToken();
          const response = await fetch('/api/auth/session', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ idToken }),
          });

          if (response.ok) {
            router.push('/dashboard');
          } else {
            const errorData = await response.json();
            console.error('Failed to create session:', {
              status: response.status,
              statusText: response.statusText,
              error: errorData
            });
          }
        } catch (error) {
          console.error('Error in session creation:', error);
        }
      }
    });

    return () => unsubscribe();
  }, [router]);

  const signInWithGoogle = async () => {
    try {
      const provider = new GoogleAuthProvider();
      await signInWithPopup(auth, provider);
    } catch (error) {
      console.error('Error signing in with Google:', error);
      throw error;
    }
  };

  const logout = async () => {
    try {
      await signOut(auth);
      await fetch('/api/auth/logout', {
        method: 'POST',
      });
      router.push('/login');
    } catch (error) {
      console.error('Error signing out:', error);
      throw error;
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, signInWithGoogle, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
} 