"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { 
    onAuthStateChanged, 
    signInWithEmailAndPassword, 
    signOut,
    updateProfile 
} from "firebase/auth";
import { doc, getDoc } from "firebase/firestore"; // New imports
import { auth, db } from "@/lib/firebase"; 
import { useRouter } from "next/navigation";

const AuthContext = createContext({});

export const useAuth = () => useContext(AuthContext);

export const AuthContextProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    // Listener: Detects login/logout & extracts profile data + ROLE
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        let role = 'admin'; // Default role if not defined in DB

        try {
            // Fetch the user's role from the 'users' collection
            const userDocRef = doc(db, "users", currentUser.uid);
            const userDocSnap = await getDoc(userDocRef);
            
            if (userDocSnap.exists()) {
                const data = userDocSnap.data();
                role = data.role || 'admin';
            }
        } catch (error) {
            console.error("Error fetching user role:", error);
        }

        setUser({
          uid: currentUser.uid,
          email: currentUser.email,
          displayName: currentUser.displayName || "Admin User",
          photoURL: currentUser.photoURL || null,
          role: role, // Now available globally
        });
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // Login Function
  const login = (email, password) => {
    return signInWithEmailAndPassword(auth, email, password);
  };

  // Logout Function
  const logout = async () => {
    await signOut(auth);
    setUser(null);
    router.push("/admin/login");
  };

  // Update Profile Function
  const updateUserProfile = async (data) => {
    if (auth.currentUser) {
        await updateProfile(auth.currentUser, {
            displayName: data.displayName,
            photoURL: data.photoURL
        });
        setUser((prev) => ({
            ...prev,
            displayName: data.displayName,
            photoURL: data.photoURL
        }));
    }
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, updateUserProfile, loading }}>
      {children}
    </AuthContext.Provider>
  );
};