"use client";

import { useState } from "react";
import { auth } from "@/lib/firebase";
import { createUserWithEmailAndPassword, getIdToken } from "firebase/auth";
import { useRouter } from "next/navigation";

export default function SignupPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState("");
  const [done, setDone] = useState(false);

  const handleSignup = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMsg("");

    try {
      // Create Firebase account
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );

      const user = userCredential.user;

      // Generate ID token
      const token = await getIdToken(user, true);

      // Call API route that assigns admin claim
      const response = await fetch("/api/setAdmin", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ token })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to assign admin role");
      }

      setMsg("Admin account created successfully");
      setDone(true);

      // Short delay, then redirect
      setTimeout(() => {
        router.push("/admin/dashboard");
      }, 1200);
    } catch (error) {
      // More readable Firebase error
      const clean = error.message.replace("Firebase:", "").trim();
      setMsg(clean);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: 40 }}>
      <h2>Create Admin Account</h2>

      <form onSubmit={handleSignup}>
        <input
          type="email"
          placeholder="Email"
          value={email}
          disabled={done}
          onChange={(e) => setEmail(e.target.value)}
          required
        />

        <input
          type="password"
          placeholder="Password"
          value={password}
          disabled={done}
          onChange={(e) => setPassword(e.target.value)}
          required
        />

        <button disabled={loading || done}>
          {loading ? "Creating..." : done ? "Done" : "Sign Up"}
        </button>
      </form>

      <p style={{ marginTop: 15 }}>{msg}</p>
    </div>
  );
}