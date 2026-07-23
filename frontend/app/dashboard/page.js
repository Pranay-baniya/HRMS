"use client";

import { useEffect, useState } from "react";
import PageShell from "../../components/PageShell";
import { api } from "../../lib/api";
import { useAuth } from "../../lib/useAuth";

export default function DashboardPage() {
  const { profile } = useAuth();
  const isManager = profile?.role === "admin" || profile?.role === "HR";
  const [stats, setStats] = useState({
    employees: 0,
    projects: 0,
    pendingLeaves: 0,
    tasksInProgress: 0,
  });

  useEffect(() => {
    if (!profile) return;

    const load = async () => {
      try {
        const calls = [
          isManager ? api.get("/employees") : Promise.resolve([]),
          api.get("/projects"),
          isManager ? api.get("/leaves?status=pending") : Promise.resolve([]),
          api.get("/tasks?status=in_progress"),
        ];
        const [employees, projects, leaves, tasks] = await Promise.allSettled(calls);

        setStats({
          employees: employees.status === "fulfilled" ? employees.value.length : 0,
          projects: projects.status === "fulfilled" ? projects.value.length : 0,
          pendingLeaves: leaves.status === "fulfilled" ? leaves.value.length : 0,
          tasksInProgress: tasks.status === "fulfilled" ? tasks.value.length : 0,
        });
      } catch (err) {
        console.error(err);
      }
    };
    load();
  }, [profile, isManager]);

  const cards = [
    ...(isManager ? [{ label: "Total Employees", value: stats.employees }] : []),
    { label: "Active Projects", value: stats.projects },
    ...(isManager ? [{ label: "Pending Leave Requests", value: stats.pendingLeaves }] : []),
    { label: "Tasks In Progress", value: stats.tasksInProgress },
  ];

  return (
    <PageShell title="Dashboard">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {cards.map((c) => (
          <div key={c.label} className="card">
            <p className="text-xs text-gray-400 font-medium">{c.label}</p>
            <p className="text-3xl font-bold text-brand mt-2">{c.value}</p>
          </div>
        ))}
      </div>

      <div className="card mt-6">
        <p className="text-sm text-gray-500">
          Welcome to the Inseed Tech HRMS. Use the sidebar to manage employees, projects,
          attendance, leave requests, and payroll.
        </p>
      </div>
    </PageShell>
  );
}
