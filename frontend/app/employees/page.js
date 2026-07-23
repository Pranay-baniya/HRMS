"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import PageShell from "../../components/PageShell";
import { api } from "../../lib/api";

const emptyForm = {
  name: "",
  email: "",
  supabaseUserId: "",
  phone: "",
  role: "employee",
  department: "Development",
  designation: "",
  employmentType: "full_time",
  joiningDate: "",
  baseSalary: 0,
};

export default function EmployeesPage() {
  const [employees, setEmployees] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  const loadEmployees = async () => {
    setLoading(true);
    try {
      const data = await api.get("/employees");
      setEmployees(data);
    } catch (err) {
      console.error(err);
    }
    setLoading(false);
  };

  useEffect(() => {
    loadEmployees();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    try {
      await api.post("/employees", form);
      setForm(emptyForm);
      setShowForm(false);
      loadEmployees();
    } catch (err) {
      setError(err.message);
    }
  };

  const handleDeactivate = async (id) => {
    if (!confirm("Deactivate this employee?")) return;
    await api.del(`/employees/${id}`);
    loadEmployees();
  };

  return (
    <PageShell
      title="Employees"
      action={
        <button className="btn-primary" onClick={() => setShowForm((s) => !s)}>
          {showForm ? "Cancel" : "Add Employee"}
        </button>
      }
    >
      {showForm && (
        <form onSubmit={handleSubmit} className="card mb-6 grid grid-cols-2 gap-4">
          <input
            className="input"
            placeholder="Full name"
            required
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
          />
          <input
            className="input"
            placeholder="Email"
            type="email"
            required
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
          />
          <input
            className="input"
            placeholder="Supabase User ID (from Supabase auth dashboard)"
            required
            value={form.supabaseUserId}
            onChange={(e) => setForm({ ...form, supabaseUserId: e.target.value })}
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
            required
            value={form.joiningDate}
            onChange={(e) => setForm({ ...form, joiningDate: e.target.value })}
          />
          <input
            className="input"
            type="number"
            placeholder="Base salary (NPR)"
            value={form.baseSalary}
            onChange={(e) => setForm({ ...form, baseSalary: Number(e.target.value) })}
          />

          {error && <p className="text-xs text-red-500 col-span-2">{error}</p>}

          <button type="submit" className="btn-primary col-span-2">
            Save Employee
          </button>
        </form>
      )}

      <div className="card p-0 overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="table-header">Name</th>
              <th className="table-header">Department</th>
              <th className="table-header">Role</th>
              <th className="table-header">Type</th>
              <th className="table-header">Status</th>
              <th className="table-header"></th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td className="table-cell" colSpan={6}>
                  Loading...
                </td>
              </tr>
            ) : employees.length === 0 ? (
              <tr>
                <td className="table-cell" colSpan={6}>
                  No employees yet.
                </td>
              </tr>
            ) : (
              employees.map((emp) => (
                <tr key={emp._id}>
                  <td className="table-cell">
                    <Link href={`/employees/${emp._id}`} className="group">
                      <p className="font-medium text-gray-800 group-hover:text-brand">{emp.name}</p>
                      <p className="text-xs text-gray-400">{emp.email}</p>
                    </Link>
                  </td>
                  <td className="table-cell">{emp.department}</td>
                  <td className="table-cell capitalize">{emp.role?.replace("_", " ")}</td>
                  <td className="table-cell capitalize">{emp.employmentType?.replace("_", " ")}</td>
                  <td className="table-cell">
                    <span
                      className={`text-xs px-2 py-1 rounded-full ${
                        emp.status === "active"
                          ? "bg-green-50 text-green-600"
                          : "bg-gray-100 text-gray-400"
                      }`}
                    >
                      {emp.status}
                    </span>
                  </td>
                  <td className="table-cell">
                    {emp.status === "active" && (
                      <button
                        className="text-xs text-red-500 hover:underline"
                        onClick={() => handleDeactivate(emp._id)}
                      >
                        Deactivate
                      </button>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </PageShell>
  );
}
