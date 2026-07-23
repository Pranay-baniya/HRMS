"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { supabase } from "../lib/supabaseClient";

const links = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/employees", label: "Employees" },
  { href: "/projects", label: "Projects" },
  { href: "/attendance", label: "Attendance" },
  { href: "/leaves", label: "Leaves" },
  { href: "/payroll", label: "Payroll" },
];

export default function Sidebar({ profile }) {
  const pathname = usePathname();
  const router = useRouter();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/");
  };

  return (
    <aside className="w-64 bg-white border-r border-gray-100 h-screen sticky top-0 flex flex-col justify-between">
      <div>
        <div className="px-6 py-6 border-b border-gray-100">
          <p className="text-lg font-bold text-brand">Inseed HRMS</p>
          <p className="text-xs text-gray-400 mt-1">Inseed Tech Pvt. Ltd.</p>
        </div>
        <nav className="px-3 py-4 space-y-1">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`block px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                pathname === link.href
                  ? "bg-brand text-white"
                  : "text-gray-600 hover:bg-brand/5 hover:text-brand"
              }`}
            >
              {link.label}
            </Link>
          ))}
        </nav>
      </div>
      <div className="px-6 py-4 border-t border-gray-100">
        {profile && (
          <div className="mb-3">
            <p className="text-sm font-medium text-gray-800">{profile.name}</p>
            <p className="text-xs text-gray-400 capitalize">{profile.role?.replace("_", " ")}</p>
          </div>
        )}
        <button
          onClick={handleLogout}
          className="text-xs text-gray-400 hover:text-red-500 transition-colors"
        >
          Sign out
        </button>
      </div>
    </aside>
  );
}
