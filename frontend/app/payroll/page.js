"use client";

import { useEffect, useState } from "react";
import PageShell from "../../components/PageShell";
import { api } from "../../lib/api";
import { useAuth } from "../../lib/useAuth";

const currentMonth = new Date().getMonth() + 1;
const currentYear = new Date().getFullYear();

export default function PayrollPage() {
  const { profile } = useAuth();
  const [employees, setEmployees] = useState([]);
  const [records, setRecords] = useState([]);
  const [myRecords, setMyRecords] = useState([]);
  const [form, setForm] = useState({
    employeeId: "",
    month: currentMonth,
    year: currentYear,
    deductions: 0,
    bonuses: 0,
  });
  const [error, setError] = useState("");

  const isAdmin = profile?.role === "admin";

  const load = async () => {
    try {
      const myData = await api.get("/payroll/me");
      setMyRecords(myData);
    } catch (err) {
      console.error(err);
    }

    if (!isAdmin) return;

    try {
      const [emp, pay] = await Promise.all([api.get("/employees"), api.get("/payroll")]);
      setEmployees(emp);
      setRecords(pay);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    load();
  }, [profile]);

  const handleGenerate = async (e) => {
    e.preventDefault();
    setError("");
    try {
      await api.post("/payroll/generate", form);
      load();
    } catch (err) {
      setError(err.message);
    }
  };

  const handleMarkPaid = async (id) => {
    await api.put(`/payroll/${id}/mark-paid`, {});
    load();
  };

  return (
    <PageShell title="Payroll">
      {isAdmin && (
        <form onSubmit={handleGenerate} className="card mb-6 grid grid-cols-2 gap-4">
          <select
            className="input"
            required
            value={form.employeeId}
            onChange={(e) => setForm({ ...form, employeeId: e.target.value })}
          >
            <option value="">Select employee</option>
            {employees.map((emp) => (
              <option key={emp._id} value={emp._id}>
                {emp.name}
              </option>
            ))}
          </select>
          <div className="flex gap-2">
            <input
              className="input"
              type="number"
              min="1"
              max="12"
              value={form.month}
              onChange={(e) => setForm({ ...form, month: Number(e.target.value) })}
            />
            <input
              className="input"
              type="number"
              value={form.year}
              onChange={(e) => setForm({ ...form, year: Number(e.target.value) })}
            />
          </div>
          <input
            className="input"
            type="number"
            placeholder="Deductions"
            value={form.deductions}
            onChange={(e) => setForm({ ...form, deductions: Number(e.target.value) })}
          />
          <input
            className="input"
            type="number"
            placeholder="Bonuses"
            value={form.bonuses}
            onChange={(e) => setForm({ ...form, bonuses: Number(e.target.value) })}
          />

          {error && <p className="text-xs text-red-500 col-span-2">{error}</p>}

          <button type="submit" className="btn-primary col-span-2">
            Generate Payslip
          </button>
        </form>
      )}

      {isAdmin && (
        <>
          <h2 className="text-sm font-semibold text-gray-500 mb-2">All Payroll Records</h2>
          <div className="card p-0 overflow-hidden mb-8">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="table-header">Employee</th>
                  <th className="table-header">Period</th>
                  <th className="table-header">Net Pay</th>
                  <th className="table-header">Status</th>
                  <th className="table-header"></th>
                </tr>
              </thead>
              <tbody>
                {records.length === 0 ? (
                  <tr>
                    <td className="table-cell" colSpan={5}>
                      No payroll records yet.
                    </td>
                  </tr>
                ) : (
                  records.map((r) => (
                    <tr key={r._id}>
                      <td className="table-cell">{r.employee?.name}</td>
                      <td className="table-cell">
                        {r.month}/{r.year}
                      </td>
                      <td className="table-cell">NPR {r.netPay.toLocaleString()}</td>
                      <td className="table-cell capitalize">{r.status}</td>
                      <td className="table-cell">
                        {r.status !== "paid" && (
                          <button
                            className="text-xs text-brand hover:underline"
                            onClick={() => handleMarkPaid(r._id)}
                          >
                            Mark Paid
                          </button>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </>
      )}

      <h2 className="text-sm font-semibold text-gray-500 mb-2">My Payslips</h2>
      <div className="card p-0 overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="table-header">Period</th>
              <th className="table-header">Base Salary</th>
              <th className="table-header">Net Pay</th>
              <th className="table-header">Status</th>
            </tr>
          </thead>
          <tbody>
            {myRecords.length === 0 ? (
              <tr>
                <td className="table-cell" colSpan={4}>
                  No payslips yet.
                </td>
              </tr>
            ) : (
              myRecords.map((r) => (
                <tr key={r._id}>
                  <td className="table-cell">
                    {r.month}/{r.year}
                  </td>
                  <td className="table-cell">NPR {r.baseSalary.toLocaleString()}</td>
                  <td className="table-cell">NPR {r.netPay.toLocaleString()}</td>
                  <td className="table-cell capitalize">{r.status}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </PageShell>
  );
}
