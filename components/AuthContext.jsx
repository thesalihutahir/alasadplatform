// components/AuthContext.jsx
"use client";

import React, { createContext, useContext, useEffect, useState } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { auth, db } from '@/lib/firebase'; // Assuming your firebase is in '@/lib/firebase'
import { doc, getDoc } from 'firebase/firestore'; // For fetching custom role

// 1. Create the Context
const AuthContext = createContext({
  user: null, // Firebase user object
  isAdmin: false, // Custom role flag
  loading: true, // Loading state
  // Add other useful functions like login/logout if needed
});

// 2. Custom Hook to use the Auth Context
export const useAuth = () => useContext(AuthContext);

// 3. Provider Component
export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);

  // Function to check and set the user's custom role
  const checkUserRole = async (firebaseUser) => {
    if (firebaseUser) {
      try {
        // Option A (Simple Role Check via Firestore)
        // Check a 'users' collection in Firestore for a 'role: admin' field
        const userDocRef = doc(db, 'users', firebaseUser.uid);
        const userDoc = await getDoc(userDocRef);

        if (userDoc.exists() && userDoc.data().role === 'admin') {
          setIsAdmin(true);
        } else {
          setIsAdmin(false);
        }

        /*
        // OPTION B (More Secure: Use Firebase Custom Claims)
        // If you set up Cloud Functions to write custom claims:
        const token = await firebaseUser.getIdTokenResult();
        setIsAdmin(token.claims.admin === true);
        */

      } catch (error) {
        console.error("Error checking user role:", error);
        setIsAdmin(false);
      }
    } else {
      setIsAdmin(false);
    }
  };

  useEffect(() => {
    // This is the core Firebase listener
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setUser(firebaseUser);
      setLoading(true); // Set loading to true while checking role
      await checkUserRole(firebaseUser);
      setLoading(false);
    });

    // Cleanup subscription on unmount
    return () => unsubscribe();
  }, []);

  const value = {
    user,
    isAdmin,
    loading,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
