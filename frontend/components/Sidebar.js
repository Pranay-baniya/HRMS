"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { supabase } from "../lib/supabaseClient";
import { api } from "../lib/api";

// roles: undefined = everyone; otherwise the roles allowed to see the link.
const SECTIONS = [
  {
    title: null,
    links: [
      { href: "/dashboard", label: "Dashboard" },
      { href: "/notifications", label: "Notifications", badge: "notifications" },
    ],
  },
  {
    title: "People",
    links: [
      { href: "/employees", label: "Employees" },
      { href: "/onboarding", label: "Onboarding" },
      { href: "/performance", label: "Performance" },
      { href: "/documents", label: "Documents" },
      { href: "/recruitment", label: "Recruitment", roles: ["admin", "HR"] },
    ],
  },
  {
    title: "Work",
    links: [
      { href: "/projects", label: "Projects" },
      { href: "/tasks", label: "Tasks" },
      { href: "/attendance", label: "Attendance" },
      { href: "/leaves", label: "Leaves" },
    ],
  },
  {
    title: "Admin",
    links: [
      { href: "/payroll", label: "Payroll" },
      { href: "/reports", label: "Reports", roles: ["admin", "HR"] },
      { href: "/settings", label: "Settings" },
    ],
  },
];

export default function Sidebar({ profile }) {
  const pathname = usePathname();
  const router = useRouter();
  const [unread, setUnread] = useState(0);

  useEffect(() => {
    let active = true;
    const loadUnread = () =>
      api
        .get("/notifications/me")
        .then((d) => active && setUnread(d.unread))
        .catch(() => {});
    loadUnread();
    const interval = setInterval(loadUnread, 60000);
    return () => {
      active = false;
      clearInterval(interval);
    };
  }, [pathname]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/");
  };

  const canSee = (link) => !link.roles || link.roles.includes(profile?.role);

  return (
    <aside className="w-64 bg-white border-r border-gray-100 h-screen sticky top-0 flex flex-col justify-between overflow-y-auto">
      <div>
        <div className="px-6 py-6 border-b border-gray-100">
          <p className="text-lg font-bold text-brand">Inseed HRMS</p>
          <p className="text-xs text-gray-400 mt-1">Inseed Tech Pvt. Ltd.</p>
        </div>
        <nav className="px-3 py-4 space-y-4">
          {SECTIONS.map((section, i) => {
            const links = section.links.filter(canSee);
            if (links.length === 0) return null;
            return (
              <div key={i}>
                {section.title && (
                  <p className="px-3 mb-1 text-[10px] font-semibold uppercase tracking-wider text-gray-300">
                    {section.title}
                  </p>
                )}
                <div className="space-y-1">
                  {links.map((link) => (
                    <Link
                      key={link.href}
                      href={link.href}
                      className={`flex items-center justify-between px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                        pathname === link.href
                          ? "bg-brand text-white"
                          : "text-gray-600 hover:bg-brand/5 hover:text-brand"
                      }`}
                    >
                      <span>{link.label}</span>
                      {link.badge === "notifications" && unread > 0 && (
                        <span className="text-[10px] bg-red-500 text-white rounded-full px-1.5 py-0.5 min-w-[18px] text-center">
                          {unread}
                        </span>
                      )}
                    </Link>
                  ))}
                </div>
              </div>
            );
          })}
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
