"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import PageShell from "../../../components/PageShell";
import { api } from "../../../lib/api";
import { useAuth } from "../../../lib/useAuth";

const EDITABLE = [
  "name",
  "email",
  "phone",
  "role",
  "department",
  "designation",
  "employmentType",
  "joiningDate",
  "baseSalary",
];

export default function EmployeeDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const { profile } = useAuth();
  const [employee, setEmployee] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [form, setForm] = useState(null);
  const [editing, setEditing] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  const isManager = profile?.role === "admin" || profile?.role === "HR";

  const load = async () => {
    setLoading(true);
    try {
      const emp = await api.get(`/employees/${id}`);
      setEmployee(emp);
      const seed = {};
      for (const f of EDITABLE) {
        seed[f] = f === "joiningDate" && emp[f] ? emp[f].slice(0, 10) : emp[f] ?? "";
      }
      setForm(seed);
    } catch (err) {
      setError(err.message);
    }
    // Tasks assigned to this employee (best-effort; readable by any authenticated user)
    try {
      const t = await api.get(`/tasks?assignedTo=${id}`);
      setTasks(t);
    } catch (err) {
      console.error(err);
    }
    setLoading(false);
  };

  useEffect(() => {
    if (id) load();
  }, [id]);

  const handleSave = async (e) => {
    e.preventDefault();
    setError("");
    try {
      const payload = { ...form, baseSalary: Number(form.baseSalary) };
      const updated = await api.put(`/employees/${id}`, payload);
      setEmployee(updated);
      setEditing(false);
    } catch (err) {
      setError(err.message);
    }
  };

  if (loading || !form) {
    return (
      <PageShell title="Employee">
        <p className="text-sm text-gray-400">Loading...</p>
      </PageShell>
    );
  }

  if (!employee) {
    return (
      <PageShell title="Employee">
        <p className="text-sm text-red-500">{error || "Not found."}</p>
        <Link href="/employees" className="text-sm text-brand hover:underline">
          ← Back to employees
        </Link>
      </PageShell>
    );
  }

  return (
    <PageShell
      title={employee.name}
      action={
        isManager && (
          <button className="btn-primary" onClick={() => setEditing((s) => !s)}>
            {editing ? "Cancel" : "Edit"}
          </button>
        )
      }
    >
      <Link href="/employees" className="text-sm text-brand hover:underline">
        ← Back to employees
      </Link>

      {editing ? (
        <form onSubmit={handleSave} className="card mt-4 grid grid-cols-2 gap-4">
          <input
            className="input"
            placeholder="Full name"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
          />
          <input
            className="input"
            placeholder="Email"
            type="email"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
          />
          <input
            className="input"
            placeholder="Phone"
            value={form.phone}
            onChange={(e) => setForm({ ...form, phone: e.target.value })}
          />
          <select
            className="input"
            value={form.role}
            onChange={(e) => setForm({ ...form, role: e.target.value })}
          >
            <option value="employee">Employee</option>
            <option value="HR">HR</option>
            <option value="admin">Admin</option>
          </select>
          <select
            className="input"
            value={form.department}
            onChange={(e) => setForm({ ...form, department: e.target.value })}
          >
            {["Development", "QA", "Design", "Product", "Sales", "Management"].map((d) => (
              <option key={d} value={d}>
                {d}
              </option>
            ))}
          </select>
          <input
            className="input"
            placeholder="Designation"
            value={form.designation}
            onChange={(e) => setForm({ ...form, designation: e.target.value })}
          />
          <select
            className="input"
            value={form.employmentType}
            onChange={(e) => setForm({ ...form, employmentType: e.target.value })}
          >
            <option value="full_time">Full time</option>
            <option value="part_time">Part time</option>
            <option value="intern">Intern</option>
            <option value="contract">Contract</option>
          </select>
          <input
            className="input"
            type="date"
            value={form.joiningDate}
            onChange={(e) => setForm({ ...form, joiningDate: e.target.value })}
          />
          <input
            className="input"
            type="number"
            placeholder="Base salary (NPR)"
            value={form.baseSalary}
            onChange={(e) => setForm({ ...form, baseSalary: e.target.value })}
          />
          {error && <p className="text-xs text-red-500 col-span-2">{error}</p>}
          <button type="submit" className="btn-primary col-span-2">
            Save Changes
          </button>
        </form>
      ) : (
        <div className="card mt-4 grid grid-cols-2 gap-y-4 gap-x-8">
          <Field label="Email" value={employee.email} />
          <Field label="Phone" value={employee.phone || "—"} />
          <Field label="Role" value={employee.role} capitalize />
          <Field label="Department" value={employee.department} />
          <Field label="Designation" value={employee.designation || "—"} />
          <Field
            label="Employment Type"
            value={employee.employmentType?.replace("_", " ")}
            capitalize
          />
          <Field
            label="Joining Date"
            value={employee.joiningDate ? new Date(employee.joiningDate).toLocaleDateString() : "—"}
          />
          <Field label="Status" value={employee.status} capitalize />
          {isManager && (
            <Field label="Base Salary" value={`NPR ${employee.baseSalary?.toLocaleString()}`} />
          )}
        </div>
      )}

      <h2 className="text-sm font-semibold text-gray-500 mt-8 mb-2">Assigned Tasks</h2>
      <div className="card p-0 overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="table-header">Task</th>
              <th className="table-header">Project</th>
              <th className="table-header">Status</th>
              <th className="table-header">Priority</th>
            </tr>
          </thead>
          <tbody>
            {tasks.length === 0 ? (
              <tr>
                <td className="table-cell" colSpan={4}>
                  No tasks assigned.
                </td>
              </tr>
            ) : (
              tasks.map((t) => (
                <tr key={t._id}>
                  <td className="table-cell">{t.title}</td>
                  <td className="table-cell">{t.project?.name || "—"}</td>
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

function Field({ label, value, capitalize }) {
  return (
    <div>
      <p className="text-xs text-gray-400">{label}</p>
      <p className={`text-sm text-gray-800 ${capitalize ? "capitalize" : ""}`}>{value}</p>
    </div>
  );
}
