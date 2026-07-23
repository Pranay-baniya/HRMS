"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import PageShell from "../../../components/PageShell";
import { api } from "../../../lib/api";
import { useAuth } from "../../../lib/useAuth";

const CATEGORIES = ["healthtech", "fintech", "sportstech", "events", "internal_product", "other"];
const STATUSES = ["planning", "active", "on_hold", "completed"];

export default function ProjectDetailPage() {
  const { id } = useParams();
  const { profile } = useAuth();
  const [project, setProject] = useState(null);
  const [allocations, setAllocations] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [form, setForm] = useState(null);
  const [editing, setEditing] = useState(false);
  const [allocForm, setAllocForm] = useState({ employee: "", roleOnProject: "", allocationPercent: 100 });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  const isManager = profile?.role === "admin" || profile?.role === "HR";

  const load = async () => {
    setLoading(true);
    try {
      // No single-project endpoint exists; the list is the source of truth.
      const projects = await api.get("/projects");
      const p = projects.find((x) => x._id === id);
      setProject(p);
      if (p) {
        setForm({
          name: p.name ?? "",
          client: p.client ?? "",
          description: p.description ?? "",
          category: p.category ?? "other",
          status: p.status ?? "active",
          startDate: p.startDate ? p.startDate.slice(0, 10) : "",
          endDate: p.endDate ? p.endDate.slice(0, 10) : "",
        });
      }
    } catch (err) {
      setError(err.message);
    }
    try {
      setAllocations(await api.get(`/projects/${id}/allocations`));
    } catch (err) {
      console.error(err);
    }
    try {
      setTasks(await api.get(`/tasks?project=${id}`));
    } catch (err) {
      console.error(err);
    }
    const emp = await Promise.allSettled([api.get("/employees")]);
    if (emp[0].status === "fulfilled") setEmployees(emp[0].value);
    setLoading(false);
  };

  useEffect(() => {
    if (id) load();
  }, [id]);

  const handleSave = async (e) => {
    e.preventDefault();
    setError("");
    try {
      const updated = await api.put(`/projects/${id}`, form);
      setProject(updated);
      setEditing(false);
    } catch (err) {
      setError(err.message);
    }
  };

  const handleAddAllocation = async (e) => {
    e.preventDefault();
    setError("");
    try {
      await api.post("/projects/allocations", {
        ...allocForm,
        project: id,
        allocationPercent: Number(allocForm.allocationPercent),
      });
      setAllocForm({ employee: "", roleOnProject: "", allocationPercent: 100 });
      setAllocations(await api.get(`/projects/${id}/allocations`));
    } catch (err) {
      setError(err.message);
    }
  };

  const handleRemoveAllocation = async (allocId) => {
    if (!confirm("Remove this team member from the project?")) return;
    try {
      await api.del(`/projects/allocations/${allocId}`);
      setAllocations(await api.get(`/projects/${id}/allocations`));
    } catch (err) {
      console.error(err);
    }
  };

  if (loading || !project) {
    return (
      <PageShell title="Project">
        <p className="text-sm text-gray-400">{loading ? "Loading..." : error || "Not found."}</p>
        <Link href="/projects" className="text-sm text-brand hover:underline">
          ← Back to projects
        </Link>
      </PageShell>
    );
  }

  // Employees not already allocated, for the add-member dropdown
  const allocatedIds = new Set(allocations.map((a) => a.employee?._id));
  const availableEmployees = employees.filter((e) => !allocatedIds.has(e._id));

  return (
    <PageShell
      title={project.name}
      action={
        isManager && (
          <button className="btn-primary" onClick={() => setEditing((s) => !s)}>
            {editing ? "Cancel" : "Edit"}
          </button>
        )
      }
    >
      <Link href="/projects" className="text-sm text-brand hover:underline">
        ← Back to projects
      </Link>

      {editing ? (
        <form onSubmit={handleSave} className="card mt-4 grid grid-cols-2 gap-4">
          <input
            className="input"
            placeholder="Project name"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
          />
          <input
            className="input"
            placeholder="Client"
            value={form.client}
            onChange={(e) => setForm({ ...form, client: e.target.value })}
          />
          <select
            className="input"
            value={form.category}
            onChange={(e) => setForm({ ...form, category: e.target.value })}
          >
            {CATEGORIES.map((c) => (
              <option key={c} value={c}>
                {c.replace("_", " ")}
              </option>
            ))}
          </select>
          <select
            className="input"
            value={form.status}
            onChange={(e) => setForm({ ...form, status: e.target.value })}
          >
            {STATUSES.map((s) => (
              <option key={s} value={s}>
                {s.replace("_", " ")}
              </option>
            ))}
          </select>
          <input
            className="input"
            type="date"
            value={form.startDate}
            onChange={(e) => setForm({ ...form, startDate: e.target.value })}
          />
          <input
            className="input"
            type="date"
            value={form.endDate}
            onChange={(e) => setForm({ ...form, endDate: e.target.value })}
          />
          <textarea
            className="input col-span-2"
            placeholder="Description"
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
          />
          {error && <p className="text-xs text-red-500 col-span-2">{error}</p>}
          <button type="submit" className="btn-primary col-span-2">
            Save Changes
          </button>
        </form>
      ) : (
        <div className="card mt-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-gray-400">{project.client || "Internal"}</p>
              <p className="text-sm text-gray-600 mt-1 capitalize">
                {project.category?.replace("_", " ")}
              </p>
            </div>
            <span className="text-xs px-2 py-1 rounded-full bg-brand/10 text-brand capitalize">
              {project.status?.replace("_", " ")}
            </span>
          </div>
          {project.description && (
            <p className="text-sm text-gray-500 mt-4">{project.description}</p>
          )}
        </div>
      )}

      {/* Allocations */}
      <h2 className="text-sm font-semibold text-gray-500 mt-8 mb-2">Team / Allocations</h2>
      {isManager && (
        <form onSubmit={handleAddAllocation} className="card mb-4 grid grid-cols-4 gap-3">
          <select
            className="input"
            required
            value={allocForm.employee}
            onChange={(e) => setAllocForm({ ...allocForm, employee: e.target.value })}
          >
            <option value="">Select employee…</option>
            {availableEmployees.map((emp) => (
              <option key={emp._id} value={emp._id}>
                {emp.name}
              </option>
            ))}
          </select>
          <input
            className="input"
            placeholder="Role on project"
            value={allocForm.roleOnProject}
            onChange={(e) => setAllocForm({ ...allocForm, roleOnProject: e.target.value })}
          />
          <input
            className="input"
            type="number"
            min="0"
            max="100"
            placeholder="% allocation"
            value={allocForm.allocationPercent}
            onChange={(e) => setAllocForm({ ...allocForm, allocationPercent: e.target.value })}
          />
          <button type="submit" className="btn-primary">
            Add Member
          </button>
        </form>
      )}
      <div className="card p-0 overflow-hidden mb-4">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="table-header">Employee</th>
              <th className="table-header">Role</th>
              <th className="table-header">Allocation</th>
              {isManager && <th className="table-header"></th>}
            </tr>
          </thead>
          <tbody>
            {allocations.length === 0 ? (
              <tr>
                <td className="table-cell" colSpan={isManager ? 4 : 3}>
                  No one allocated yet.
                </td>
              </tr>
            ) : (
              allocations.map((a) => (
                <tr key={a._id}>
                  <td className="table-cell">
                    {a.employee?._id ? (
                      <Link
                        href={`/employees/${a.employee._id}`}
                        className="font-medium text-gray-800 hover:text-brand"
                      >
                        {a.employee?.name}
                      </Link>
                    ) : (
                      a.employee?.name
                    )}
                    <p className="text-xs text-gray-400">{a.employee?.department}</p>
                  </td>
                  <td className="table-cell">{a.roleOnProject || "—"}</td>
                  <td className="table-cell">{a.allocationPercent}%</td>
                  {isManager && (
                    <td className="table-cell">
                      <button
                        className="text-xs text-red-500 hover:underline"
                        onClick={() => handleRemoveAllocation(a._id)}
                      >
                        Remove
                      </button>
                    </td>
                  )}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Tasks */}
      <h2 className="text-sm font-semibold text-gray-500 mt-8 mb-2">Tasks</h2>
      <div className="card p-0 overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="table-header">Task</th>
              <th className="table-header">Assignee</th>
              <th className="table-header">Status</th>
              <th className="table-header">Priority</th>
            </tr>
          </thead>
          <tbody>
            {tasks.length === 0 ? (
              <tr>
                <td className="table-cell" colSpan={4}>
                  No tasks for this project.
                </td>
              </tr>
            ) : (
              tasks.map((t) => (
                <tr key={t._id}>
                  <td className="table-cell">{t.title}</td>
                  <td className="table-cell">{t.assignedTo?.name || "Unassigned"}</td>
                  <td className="table-cell capitalize">{t.status?.replace("_", " ")}</td>
                  <td className="table-cell capitalize">{t.priority}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </PageShell>
  );
}
