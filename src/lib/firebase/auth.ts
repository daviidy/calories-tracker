'use client';

import { auth } from '@/lib/firebase/config';
import { GoogleAuthProvider, signInWithPopup } from '@firebase/auth';

const googleProvider = new GoogleAuthProvider();

export const signInWithGoogle = async () => {
  try {
    const result = await signInWithPopup(auth, googleProvider);
    const idToken = await result.user.getIdToken();
    
    const response = await fetch('/api/auth/session', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token: idToken }),
      credentials: 'include', // Important for cookies
    });

    if (!response.ok) {
      throw new Error('Failed to create session');
    }

    return result.user;
  } catch (error) {
    console.error('Error signing in with Google:', error);
    throw error;
  }
};

export const handleSignOut = async () => {
  try {
    await auth.signOut();
    // Call server action to remove cookie
    await fetch('/api/auth/session', { method: 'DELETE' });
  } catch (error) {
    console.error('Error signing out:', error);
    throw error;
  }
}; 