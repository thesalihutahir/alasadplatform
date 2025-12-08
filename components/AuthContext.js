"use client";

import React, { createContext, useContext, useEffect, useState } from 'react';
import { initializeApp } from "firebase/app";
import { 
    getAuth, 
    signInAnonymously, 
    signInWithCustomToken, 
    onAuthStateChanged,
    signOut
} from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// Get global variables (provided by the execution environment)
const appId = typeof __app_id !== 'undefined' ? __app_id : 'default-app-id';
const firebaseConfig = typeof __firebase_config !== 'undefined' ? JSON.parse(__firebase_config) : {};
const initialAuthToken = typeof __initial_auth_token !== 'undefined' ? __initial_auth_token : null;

// Initialize Firebase App
let app;
if (Object.keys(firebaseConfig).length > 0) {
    app = initializeApp(firebaseConfig);
}

// Global Firebase service instances
let auth = app ? getAuth(app) : null;
let db = app ? getFirestore(app) : null;

const AuthContext = createContext({
    isAuthenticated: false,
    userId: null,
    loading: true,
    db: null,
    auth: null,
    appId: appId,
    signOutUser: () => {}
});

export const useAuth = () => useContext(AuthContext);

export function AuthProvider({ children }) {
    const [userId, setUserId] = useState(null);
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!auth) {
            console.error("Firebase Auth service is not available.");
            setLoading(false);
            return;
        }

        // 1. Initial Authentication Logic
        const authenticate = async () => {
            try {
                if (initialAuthToken) {
                    // Use custom token if provided (standard for the Canvas environment)
                    await signInWithCustomToken(auth, initialAuthToken);
                } else {
                    // Fallback to anonymous sign-in
                    await signInAnonymously(auth);
                }
            } catch (error) {
                console.error("Firebase sign-in failed:", error);
                // Fallback: If sign-in fails, we still listen for state change
            }
        };

        authenticate();

        // 2. Auth State Change Listener (runs after initial auth)
        const unsubscribe = onAuthStateChanged(auth, (user) => {
            if (user) {
                setUserId(user.uid);
                setIsAuthenticated(true);
            } else {
                // If sign-out or initial state is null
                setUserId(null);
                setIsAuthenticated(false);
            }
            setLoading(false);
        });

        // Cleanup subscription on unmount
        return () => unsubscribe();
    }, []);

    const signOutUser = async () => {
        if (auth) {
            try {
                await signOut(auth);
                // Optionally sign in anonymously again after signing out
                await signInAnonymously(auth);
            } catch (error) {
                console.error("Error signing out:", error);
            }
        }
    };

    const value = {
        isAuthenticated,
        userId,
        loading,
        db,
        auth,
        appId,
        signOutUser
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
}
