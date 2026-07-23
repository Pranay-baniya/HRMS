"use client";

import Sidebar from "./Sidebar";
import { useAuth } from "../lib/useAuth";

export default function PageShell({ children, title, action }) {
  const { profile, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen text-gray-400 text-sm">
        Loading...
      </div>
    );
  }

  return (
    <div className="flex">
      <Sidebar profile={profile} />
      <main className="flex-1 p-8">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-semibold text-gray-800">{title}</h1>
          {action}
        </div>
        {children}
      </main>
    </div>
  );
}
