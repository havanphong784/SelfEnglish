import React, { useState, useEffect } from 'react';
import { auth } from '../config/firebase';
import { browserLocalPersistence, onAuthStateChanged, setPersistence } from 'firebase/auth';
import { AuthContext } from './authState';

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setPersistence(auth, browserLocalPersistence).catch((error) => {
      console.error('Unable to set auth persistence:', error);
    });

    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
      setLoading(false);

      if (!user) {
        localStorage.removeItem('user');
      }
    });
    return unsubscribe;
  }, []);

  const value = {
    currentUser,
    loading,
    isAuthenticated: Boolean(currentUser),
  };

  if (loading) {
    return (
      <div className="flex h-screen w-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-storybook-green border-t-primary"></div>
      </div>
    );
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
