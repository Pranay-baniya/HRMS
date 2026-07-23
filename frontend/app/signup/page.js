"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "../../lib/supabaseClient";
import { api } from "../../lib/api";

const DEPARTMENTS = ["Development", "QA", "Design", "Product", "Sales", "Management"];
const EMPLOYMENT_TYPES = ["full_time", "part_time", "intern", "contract"];

export default function SignupPage() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    phone: "",
    department: DEPARTMENTS[0],
    designation: "",
    employmentType: "full_time",
    joiningDate: new Date().toISOString().slice(0, 10),
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const update = (field) => (e) => setForm({ ...form, [field]: e.target.value });

  const handleSignup = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      await api.post("/auth/signup", form);

      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: form.email,
        password: form.password,
      });

      if (signInError) {
        setError(`Account created, but sign-in failed: ${signInError.message}`);
        return;
      }

      router.push("/dashboard");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-brand/5 to-brand-mint/10 py-8">
      <div className="card w-full max-w-sm">
        <div className="text-center mb-6">
          <h1 className="text-xl font-bold text-brand">Inseed HRMS</h1>
          <p className="text-sm text-gray-400 mt-1">Create your account</p>
        </div>

        <form onSubmit={handleSignup} className="space-y-4">
          <div>
            <label className="text-xs font-medium text-gray-500">Full name</label>
            <input
              type="text"
              required
              className="input mt-1"
              value={form.name}
              onChange={update("name")}
              placeholder="Jane Doe"
            />
          </div>
          <div>
            <label className="text-xs font-medium text-gray-500">Email</label>
            <input
              type="email"
              required
              className="input mt-1"
              value={form.email}
              onChange={update("email")}
              placeholder="you@inseed.dev"
            />
          </div>
          <div>
            <label className="text-xs font-medium text-gray-500">Password</label>
            <input
              type="password"
              required
              minLength={6}
              className="input mt-1"
              value={form.password}
              onChange={update("password")}
              placeholder="••••••••"
            />
          </div>
          <div>
            <label className="text-xs font-medium text-gray-500">Phone</label>
            <input
              type="tel"
              className="input mt-1"
              value={form.phone}
              onChange={update("phone")}
              placeholder="Optional"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-medium text-gray-500">Department</label>
              <select className="input mt-1" value={form.department} onChange={update("department")}>
                {DEPARTMENTS.map((d) => (
                  <option key={d} value={d}>
                    {d}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-xs font-medium text-gray-500">Employment type</label>
              <select
                className="input mt-1"
                value={form.employmentType}
                onChange={update("employmentType")}
              >
                {EMPLOYMENT_TYPES.map((t) => (
                  <option key={t} value={t}>
                    {t.replace("_", " ")}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <div>
            <label className="text-xs font-medium text-gray-500">Designation</label>
            <input
              type="text"
              className="input mt-1"
              value={form.designation}
              onChange={update("designation")}
              placeholder="Optional, e.g. React Native Developer"
            />
          </div>
          <div>
            <label className="text-xs font-medium text-gray-500">Joining date</label>
            <input
              type="date"
              required
              className="input mt-1"
              value={form.joiningDate}
              onChange={update("joiningDate")}
            />
          </div>

          {error && <p className="text-xs text-red-500">{error}</p>}

          <button type="submit" disabled={loading} className="btn-primary w-full">
            {loading ? "Creating account..." : "Sign up"}
          </button>
        </form>

        <p className="text-center text-xs text-gray-400 mt-4">
          Already have an account?{" "}
          <a href="/" className="text-brand font-medium">
            Sign in
          </a>
        </p>
      </div>
    </div>
  );
}
