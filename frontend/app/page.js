"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "../lib/supabaseClient";

const DEV_BYPASS_AUTH = process.env.NEXT_PUBLIC_DEV_BYPASS_AUTH === "true";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    const { error } = await supabase.auth.signInWithPassword({ email, password });

    setLoading(false);

    if (error) {
      setError(error.message);
      return;
    }

    router.push("/dashboard");
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-brand/5 to-brand-mint/10">
      <div className="card w-full max-w-sm">
        <div className="text-center mb-6">
          <h1 className="text-xl font-bold text-brand">Inseed HRMS</h1>
          <p className="text-sm text-gray-400 mt-1">Sign in to your account</p>
        </div>

        {DEV_BYPASS_AUTH && (
          <button
            type="button"
            onClick={() => router.push("/dashboard")}
            className="btn-primary w-full mb-4 bg-amber-500 hover:bg-amber-600"
          >
            Skip login (dev mode)
          </button>
        )}

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="text-xs font-medium text-gray-500">Email</label>
            <input
              type="email"
              required
              className="input mt-1"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@inseed.dev"
            />
          </div>
          <div>
            <label className="text-xs font-medium text-gray-500">Password</label>
            <input
              type="password"
              required
              className="input mt-1"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
            />
          </div>

          {error && <p className="text-xs text-red-500">{error}</p>}

          <button type="submit" disabled={loading} className="btn-primary w-full">
            {loading ? "Signing in..." : "Sign in"}
          </button>
        </form>

        <p className="text-center text-xs text-gray-400 mt-4">
          Don&apos;t have an account?{" "}
          <a href="/signup" className="text-brand font-medium">
            Sign up
          </a>
        </p>
      </div>
    </div>
  );
}
