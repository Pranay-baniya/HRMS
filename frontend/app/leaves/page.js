"use client";

import { useEffect, useState } from "react";
import PageShell from "../../components/PageShell";
import { api } from "../../lib/api";
import { useAuth } from "../../lib/useAuth";

const emptyForm = { type: "casual", startDate: "", endDate: "", reason: "" };

export default function LeavesPage() {
  const { profile } = useAuth();
  const [myLeaves, setMyLeaves] = useState([]);
  const [pendingLeaves, setPendingLeaves] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [error, setError] = useState("");

  const isManager = profile?.role === "admin" || profile?.role === "HR";

  const loadMine = async () => {
    try {
      const data = await api.get("/leaves/me");
      setMyLeaves(data);
    } catch (err) {
      console.error(err);
    }
  };

  const loadPending = async () => {
    if (!isManager) return;
    try {
      const data = await api.get("/leaves?status=pending");
      setPendingLeaves(data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    loadMine();
    loadPending();
  }, [profile]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    try {
      await api.post("/leaves", form);
      setForm(emptyForm);
      setShowForm(false);
      loadMine();
    } catch (err) {
      setError(err.message);
    }
  };

  const handleReview = async (id, status) => {
    try {
      await api.put(`/leaves/${id}/review`, { status });
      loadPending();
    } catch (err) {
      console.error(err);
    }
  };

  const statusBadge = (status) => {
    const styles = {
      pending: "bg-yellow-50 text-yellow-600",
      approved: "bg-green-50 text-green-600",
      rejected: "bg-red-50 text-red-500",
    };
    return `text-xs px-2 py-1 rounded-full ${styles[status]}`;
  };

  return (
    <PageShell
      title="Leaves"
      action={
        <button className="btn-primary" onClick={() => setShowForm((s) => !s)}>
          {showForm ? "Cancel" : "Request Leave"}
        </button>
      }
    >
      {showForm && (
        <form onSubmit={handleSubmit} className="card mb-6 grid grid-cols-2 gap-4">
          <select
            className="input"
            value={form.type}
            onChange={(e) => setForm({ ...form, type: e.target.value })}
          >
            {["sick", "casual", "unpaid", "annual"].map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>
          <div />
          <input
            className="input"
            type="date"
            required
            value={form.startDate}
            onChange={(e) => setForm({ ...form, startDate: e.target.value })}
          />
          <input
            className="input"
            type="date"
            required
            value={form.endDate}
            onChange={(e) => setForm({ ...form, endDate: e.target.value })}
          />
          <textarea
            className="input col-span-2"
            placeholder="Reason"
            value={form.reason}
            onChange={(e) => setForm({ ...form, reason: e.target.value })}
          />

          {error && <p className="text-xs text-red-500 col-span-2">{error}</p>}

          <button type="submit" className="btn-primary col-span-2">
            Submit Request
          </button>
        </form>
      )}

      {isManager && (
        <>
          <h2 className="text-sm font-semibold text-gray-500 mb-2">Pending Approvals</h2>
          <div className="card p-0 overflow-hidden mb-8">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="table-header">Employee</th>
                  <th className="table-header">Type</th>
                  <th className="table-header">Dates</th>
                  <th className="table-header">Reason</th>
                  <th className="table-header"></th>
                </tr>
              </thead>
              <tbody>
                {pendingLeaves.length === 0 ? (
                  <tr>
                    <td className="table-cell" colSpan={5}>
                      Nothing pending.
                    </td>
                  </tr>
                ) : (
                  pendingLeaves.map((l) => (
                    <tr key={l._id}>
                      <td className="table-cell">{l.employee?.name}</td>
                      <td className="table-cell capitalize">{l.type}</td>
                      <td className="table-cell">
                        {new Date(l.startDate).toLocaleDateString()} -{" "}
                        {new Date(l.endDate).toLocaleDateString()}
                      </td>
                      <td className="table-cell">{l.reason}</td>
                      <td className="table-cell space-x-2">
                        <button
                          className="text-xs text-green-600 hover:underline"
                          onClick={() => handleReview(l._id, "approved")}
                        >
                          Approve
                        </button>
                        <button
                          className="text-xs text-red-500 hover:underline"
                          onClick={() => handleReview(l._id, "rejected")}
                        >
                          Reject
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </>
      )}

      <h2 className="text-sm font-semibold text-gray-500 mb-2">My Leave Requests</h2>
      <div className="card p-0 overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="table-header">Type</th>
              <th className="table-header">Dates</th>
              <th className="table-header">Status</th>
            </tr>
          </thead>
          <tbody>
            {myLeaves.length === 0 ? (
              <tr>
                <td className="table-cell" colSpan={3}>
                  No leave requests yet.
                </td>
              </tr>
            ) : (
              myLeaves.map((l) => (
                <tr key={l._id}>
                  <td className="table-cell capitalize">{l.type}</td>
                  <td className="table-cell">
                    {new Date(l.startDate).toLocaleDateString()} -{" "}
                    {new Date(l.endDate).toLocaleDateString()}
                  </td>
                  <td className="table-cell">
                    <span className={statusBadge(l.status)}>{l.status}</span>
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
