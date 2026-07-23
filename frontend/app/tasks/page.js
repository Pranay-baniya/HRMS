"use client";

import { useEffect, useState } from "react";
import PageShell from "../../components/PageShell";
import { api } from "../../lib/api";
import { useAuth } from "../../lib/useAuth";

const COLUMNS = [
  { key: "todo", label: "To Do" },
  { key: "in_progress", label: "In Progress" },
  { key: "qa", label: "QA" },
  { key: "done", label: "Done" },
];

const PRIORITY_STYLES = {
  low: "bg-gray-100 text-gray-500",
  medium: "bg-blue-50 text-blue-600",
  high: "bg-orange-50 text-orange-600",
  urgent: "bg-red-50 text-red-500",
};

const emptyForm = {
  title: "",
  description: "",
  project: "",
  assignedTo: "",
  priority: "medium",
  dueDate: "",
};

export default function TasksPage() {
  const { profile } = useAuth();
  const [tasks, setTasks] = useState([]);
  const [projects, setProjects] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [projectFilter, setProjectFilter] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  const isManager = profile?.role === "admin" || profile?.role === "HR";

  const loadTasks = async () => {
    setLoading(true);
    try {
      const query = projectFilter ? `?project=${projectFilter}` : "";
      const data = await api.get(`/tasks${query}`);
      setTasks(data);
    } catch (err) {
      console.error(err);
    }
    setLoading(false);
  };

  // Projects are readable by everyone; employees is manager-only, so tolerate a 403.
  const loadRefData = async () => {
    const [proj, emp] = await Promise.allSettled([api.get("/projects"), api.get("/employees")]);
    if (proj.status === "fulfilled") setProjects(proj.value);
    if (emp.status === "fulfilled") setEmployees(emp.value);
  };

  useEffect(() => {
    loadRefData();
  }, [profile]);

  useEffect(() => {
    loadTasks();
  }, [projectFilter]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    try {
      const payload = { ...form };
      if (!payload.assignedTo) delete payload.assignedTo;
      if (!payload.dueDate) delete payload.dueDate;
      await api.post("/tasks", payload);
      setForm(emptyForm);
      setShowForm(false);
      loadTasks();
    } catch (err) {
      setError(err.message);
    }
  };

  const moveTask = async (task, status) => {
    try {
      await api.put(`/tasks/${task._id}`, { status });
      loadTasks();
    } catch (err) {
      console.error(err);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm("Delete this task?")) return;
    try {
      await api.del(`/tasks/${id}`);
      loadTasks();
    } catch (err) {
      console.error(err);
    }
  };

  const projectName = (id) => projects.find((p) => p._id === id)?.name;

  return (
    <PageShell
      title="Tasks"
      action={
        isManager && (
          <button className="btn-primary" onClick={() => setShowForm((s) => !s)}>
            {showForm ? "Cancel" : "Add Task"}
          </button>
        )
      }
    >
      {showForm && isManager && (
        <form onSubmit={handleSubmit} className="card mb-6 grid grid-cols-2 gap-4">
          <input
            className="input col-span-2"
            placeholder="Task title"
            required
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
          />
          <select
            className="input"
            required
            value={form.project}
            onChange={(e) => setForm({ ...form, project: e.target.value })}
          >
            <option value="">Select project…</option>
            {projects.map((p) => (
              <option key={p._id} value={p._id}>
                {p.name}
              </option>
            ))}
          </select>
          <select
            className="input"
            value={form.assignedTo}
            onChange={(e) => setForm({ ...form, assignedTo: e.target.value })}
          >
            <option value="">Unassigned</option>
            {employees.map((emp) => (
              <option key={emp._id} value={emp._id}>
                {emp.name}
              </option>
            ))}
          </select>
          <select
            className="input"
            value={form.priority}
            onChange={(e) => setForm({ ...form, priority: e.target.value })}
          >
            {["low", "medium", "high", "urgent"].map((p) => (
              <option key={p} value={p}>
                {p}
              </option>
            ))}
          </select>
          <input
            className="input"
            type="date"
            value={form.dueDate}
            onChange={(e) => setForm({ ...form, dueDate: e.target.value })}
          />
          <textarea
            className="input col-span-2"
            placeholder="Description (optional)"
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
          />
          {error && <p className="text-xs text-red-500 col-span-2">{error}</p>}
          <button type="submit" className="btn-primary col-span-2">
            Save Task
          </button>
        </form>
      )}

      <div className="mb-4">
        <select
          className="input max-w-xs"
          value={projectFilter}
          onChange={(e) => setProjectFilter(e.target.value)}
        >
          <option value="">All projects</option>
          {projects.map((p) => (
            <option key={p._id} value={p._id}>
              {p.name}
            </option>
          ))}
        </select>
      </div>

      {loading ? (
        <p className="text-sm text-gray-400">Loading...</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {COLUMNS.map((col) => {
            const colTasks = tasks.filter((t) => t.status === col.key);
            return (
              <div key={col.key} className="bg-gray-50 rounded-xl p-3">
                <div className="flex items-center justify-between mb-3 px-1">
                  <h2 className="text-sm font-semibold text-gray-600">{col.label}</h2>
                  <span className="text-xs text-gray-400">{colTasks.length}</span>
                </div>
                <div className="space-y-3">
                  {colTasks.map((task) => (
                    <div key={task._id} className="card p-3">
                      <div className="flex items-start justify-between gap-2">
                        <p className="text-sm font-medium text-gray-800">{task.title}</p>
                        <span
                          className={`text-[10px] px-1.5 py-0.5 rounded-full whitespace-nowrap ${
                            PRIORITY_STYLES[task.priority]
                          }`}
                        >
                          {task.priority}
                        </span>
                      </div>
                      <p className="text-xs text-gray-400 mt-1">
                        {task.project?.name || projectName(task.project) || "—"}
                      </p>
                      {task.assignedTo && (
                        <p className="text-xs text-gray-500 mt-2">{task.assignedTo.name}</p>
                      )}
                      {task.dueDate && (
                        <p className="text-xs text-gray-400 mt-1">
                          Due {new Date(task.dueDate).toLocaleDateString()}
                        </p>
                      )}
                      <div className="flex items-center gap-2 mt-3">
                        <select
                          className="text-xs border border-gray-200 rounded-md px-2 py-1 flex-1"
                          value={task.status}
                          onChange={(e) => moveTask(task, e.target.value)}
                        >
                          {COLUMNS.map((c) => (
                            <option key={c.key} value={c.key}>
                              {c.label}
                            </option>
                          ))}
                        </select>
                        {isManager && (
                          <button
                            className="text-xs text-red-400 hover:text-red-500"
                            onClick={() => handleDelete(task._id)}
                            title="Delete"
                          >
                            ✕
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                  {colTasks.length === 0 && (
                    <p className="text-xs text-gray-300 px-1 py-4 text-center">No tasks</p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </PageShell>
  );
}
