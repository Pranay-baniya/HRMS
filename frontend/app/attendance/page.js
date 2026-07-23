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
          <h2 className="text-sm font-semibold text-gray-500 mb-2">Team Attendance</h2>
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
                      <td className="table-cell capitalize">{r.status.replace("_", " ")}</td>
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
