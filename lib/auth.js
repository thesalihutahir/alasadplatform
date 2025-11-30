import { auth } from "./firebase";
import {
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
} from "firebase/auth";

// --- Admin Authentication Functions ---

/**
 * Signs in an admin user with email and password.
 * @param {string} email - The admin's email.
 * @param {string} password - The admin's password.
 * @returns {Promise<UserCredential>}
 */
export const signInAdmin = async (email, password) => {
  try {
    const userCredential = await signInWithEmailAndPassword(
      auth,
      email,
      password
    );
    return userCredential;
  } catch (error) {
    console.error("Error signing in admin:", error.message);
    throw error; // Re-throw for UI to handle
  }
};

/**
 * Signs out the current user.
 * @returns {Promise<void>}
 */
export const signOutUser = async () => {
  try {
    await signOut(auth);
  } catch (error) {
    console.error("Error signing out user:", error.message);
    throw error;
  }
};

/**
 * Attaches a listener for auth state changes.
 * @param {function(User | null): void} callback - Function to call on auth state change.
 * @returns {function(): void} - Unsubscribe function.
 */
export const subscribeToAuthChanges = (callback) => {
  return onAuthStateChanged(auth, callback);
};

/**
 * Checks if the current user is an admin.
 * This is a client-side check and should always be paired with server-side validation for critical operations.
 * @param {User | null} user - The current Firebase User object.
 * @returns {Promise<boolean>}
 */
export const isAdmin = async (user) => {
  if (!user) return false;
  try {
    // Implement custom claims for robust admin check
    // For now, we'll use a simple placeholder, but in a real app,
    // you'd set a custom claim like 'admin: true' on the user via Cloud Functions
    // and check it here: const idTokenResult = await user.getIdTokenResult();
    // return idTokenResult.claims.admin === true;

    // For initial development, you might just check by email or uid if known,
    // but this is NOT secure for production.
    // Example (for dev ONLY): if (user.email === "admin@example.com") return true;

    // The most secure way involves custom claims, which require Cloud Functions.
    // For now, we'll assume a user is admin if they've successfully signed in via signInAdmin,
    // but remember this needs backend enforcement for real security.
    return true; // Placeholder, refine with actual custom claims later
  } catch (error) {
    console.error("Error checking admin status:", error.message);
    return false;
  }
};
