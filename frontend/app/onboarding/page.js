"use client";

import { useEffect, useState } from "react";
import PageShell from "../../components/PageShell";
import { api } from "../../lib/api";
import { useAuth } from "../../lib/useAuth";

export default function OnboardingPage() {
  const { profile } = useAuth();
  const [myTasks, setMyTasks] = useState([]);
  const [allTasks, setAllTasks] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [seedForm, setSeedForm] = useState({ employee: "", category: "onboarding" });
  const [error, setError] = useState("");

  const isManager = profile?.role === "admin" || profile?.role === "HR";

  const load = async () => {
    try {
      setMyTasks(await api.get("/onboarding/me"));
    } catch (err) {
      console.error(err);
    }
    if (isManager) {
      const [t, e] = await Promise.allSettled([api.get("/onboarding"), api.get("/employees")]);
      if (t.status === "fulfilled") setAllTasks(t.value);
      if (e.status === "fulfilled") setEmployees(e.value);
    }
  };

  useEffect(() => {
    load();
  }, [profile]);

  const toggle = async (task) => {
    try {
      await api.put(`/onboarding/${task._id}`, { completed: !task.completed });
      load();
    } catch (err) {
      alert(err.message);
    }
  };

  const seed = async (e) => {
    e.preventDefault();
    setError("");
    try {
      await api.post("/onboarding/seed", seedForm);
      setSeedForm({ employee: "", category: "onboarding" });
      load();
    } catch (err) {
      setError(err.message);
    }
  };

  // Group manager view by employee
  const byEmployee = {};
  for (const t of allTasks) {
    const key = t.employee?._id || "unknown";
    if (!byEmployee[key]) byEmployee[key] = { name: t.employee?.name || "—", tasks: [] };
    byEmployee[key].tasks.push(t);
  }

  return (
    <PageShell title="Onboarding">
      <h2 className="text-sm font-semibold text-gray-500 mb-2">My Checklist</h2>
      <div className="card mb-8">
        {myTasks.length === 0 ? (
          <p className="text-sm text-gray-400">No checklist items assigned.</p>
        ) : (
          <ul className="space-y-2">
            {myTasks.map((t) => (
              <li key={t._id} className="flex items-center gap-3">
                <input type="checkbox" checked={t.completed} onChange={() => toggle(t)} />
                <span className={`text-sm ${t.completed ? "line-through text-gray-400" : "text-gray-700"}`}>
                  {t.title}
                </span>
                <span className="text-xs text-gray-300 capitalize ml-auto">{t.category}</span>
              </li>
            ))}
          </ul>
        )}
      </div>

      {isManager && (
        <>
          <form onSubmit={seed} className="card mb-6 grid grid-cols-3 gap-4">
            <select
              className="input"
              required
              value={seedForm.employee}
              onChange={(e) => setSeedForm({ ...seedForm, employee: e.target.value })}
            >
              <option value="">Select employee…</option>
              {employees.map((emp) => (
                <option key={emp._id} value={emp._id}>
                  {emp.name}
                </option>
              ))}
            </select>
            <select
              className="input"
              value={seedForm.category}
              onChange={(e) => setSeedForm({ ...seedForm, category: e.target.value })}
            >
              <option value="onboarding">Onboarding</option>
              <option value="offboarding">Offboarding</option>
            </select>
            <button type="submit" className="btn-primary">
              Start Checklist
            </button>
            {error && <p className="text-xs text-red-500 col-span-3">{error}</p>}
          </form>

          <h2 className="text-sm font-semibold text-gray-500 mb-2">All Checklists</h2>
          <div className="space-y-4">
            {Object.keys(byEmployee).length === 0 ? (
              <p className="text-sm text-gray-400">No checklists yet.</p>
            ) : (
              Object.entries(byEmployee).map(([id, group]) => {
                const done = group.tasks.filter((t) => t.completed).length;
                return (
                  <div key={id} className="card">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-medium text-gray-800">{group.name}</h3>
                      <span className="text-xs text-gray-400">
                        {done}/{group.tasks.length} done
                      </span>
                    </div>
                    <ul className="space-y-1">
                      {group.tasks.map((t) => (
                        <li key={t._id} className="flex items-center gap-2">
                          <input type="checkbox" checked={t.completed} onChange={() => toggle(t)} />
                          <span
                            className={`text-sm ${
                              t.completed ? "line-through text-gray-400" : "text-gray-700"
                            }`}
                          >
                            {t.title}
                          </span>
                          <span className="text-xs text-gray-300 capitalize ml-auto">
                            {t.category}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>
                );
              })
            )}
          </div>
        </>
      )}
    </PageShell>
  );
}
