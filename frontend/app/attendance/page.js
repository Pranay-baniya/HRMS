"use client";

import { useEffect, useState } from "react";
import PageShell from "../../components/PageShell";
import { api } from "../../lib/api";
import { useAuth } from "../../lib/useAuth";

export default function AttendancePage() {
  const { profile } = useAuth();
  const [myRecords, setMyRecords] = useState([]);
  const [allRecords, setAllRecords] = useState([]);
  const [error, setError] = useState("");

  const isManager = profile?.role === "admin" || profile?.role === "HR";

  const loadMine = async () => {
    try {
      const data = await api.get("/attendance/me");
      setMyRecords(data);
    } catch (err) {
      console.error(err);
    }
  };

  const loadAll = async () => {
    if (!isManager) return;
    try {
      const data = await api.get("/attendance");
      setAllRecords(data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    loadMine();
    loadAll();
  }, [profile]);

  const handleCheckIn = async () => {
    setError("");
    try {
      await api.post("/attendance/check-in", {});
      loadMine();
      loadAll();
    } catch (err) {
      setError(err.message);
    }
  };

  const handleCheckOut = async () => {
    setError("");
    try {
      await api.post("/attendance/check-out", {});
      loadMine();
      loadAll();
    } catch (err) {
      setError(err.message);
    }
  };

  const handleMarkAbsentees = async () => {
    if (!confirm("Mark all un-recorded active employees as absent/leave for today?")) return;
    try {
      const res = await api.post("/attendance/mark-absentees", {});
      alert(`${res.created} record(s) created for ${res.date}.`);
      loadAll();
    } catch (err) {
      alert(err.message);
    }
  };

  const handleSetStatus = async (record, status) => {
    try {
      await api.post("/attendance/mark", {
        employee: record.employee?._id || record.employee,
        date: record.date,
        status,
      });
      loadAll();
    } catch (err) {
      alert(err.message);
    }
  };

  const STATUSES = ["present", "late", "absent", "half_day", "leave"];

  return (
    <PageShell title="Attendance">
      <div className="card mb-6 flex items-center gap-4">
        <button className="btn-primary" onClick={handleCheckIn}>
          Check In
        </button>
        <button className="btn-secondary" onClick={handleCheckOut}>
          Check Out
        </button>
        {error && <p className="text-xs text-red-500">{error}</p>}
      </div>

      <h2 className="text-sm font-semibold text-gray-500 mb-2">My Attendance</h2>
      <div className="card p-0 overflow-hidden mb-8">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="table-header">Date</th>
              <th className="table-header">Check In</th>
              <th className="table-header">Check Out</th>
              <th className="table-header">Status</th>
            </tr>
          </thead>
          <tbody>
            {myRecords.length === 0 ? (
              <tr>
                <td className="table-cell" colSpan={4}>
                  No records yet.
                </td>
              </tr>
            ) : (
              myRecords.map((r) => (
                <tr key={r._id}>
                  <td className="table-cell">{r.date}</td>
                  <td className="table-cell">
                    {r.checkIn ? new Date(r.checkIn).toLocaleTimeString() : "-"}
                  </td>
                  <td className="table-cell">
                    {r.checkOut ? new Date(r.checkOut).toLocaleTimeString() : "-"}
                  </td>
                  <td className="table-cell capitalize">{r.status.replace("_", " ")}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {isManager && (
        <>
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-sm font-semibold text-gray-500">Team Attendance</h2>
            <button className="btn-secondary text-xs" onClick={handleMarkAbsentees}>
              Mark today's absentees
            </button>
          </div>
          <div className="card p-0 overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="table-header">Employee</th>
                  <th className="table-header">Date</th>
                  <th className="table-header">Check In</th>
                  <th className="table-header">Check Out</th>
                  <th className="table-header">Status</th>
                </tr>
              </thead>
              <tbody>
                {allRecords.length === 0 ? (
                  <tr>
                    <td className="table-cell" colSpan={5}>
                      No records yet.
                    </td>
                  </tr>
                ) : (
                  allRecords.map((r) => (
                    <tr key={r._id}>
                      <td className="table-cell">{r.employee?.name}</td>
                      <td className="table-cell">{r.date}</td>
                      <td className="table-cell">
                        {r.checkIn ? new Date(r.checkIn).toLocaleTimeString() : "-"}
                      </td>
                      <td className="table-cell">
                        {r.checkOut ? new Date(r.checkOut).toLocaleTimeString() : "-"}
                      </td>
                      <td className="table-cell">
                        <select
                          className="text-xs border border-gray-200 rounded-md px-2 py-1 capitalize"
                          value={r.status}
                          onChange={(e) => handleSetStatus(r, e.target.value)}
                        >
                          {STATUSES.map((s) => (
                            <option key={s} value={s}>
                              {s.replace("_", " ")}
                            </option>
                          ))}
                        </select>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </>
      )}
    </PageShell>
  );
}
