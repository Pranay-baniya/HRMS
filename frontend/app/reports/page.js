"use client";

import { useEffect, useState } from "react";
import PageShell from "../../components/PageShell";
import { api } from "../../lib/api";

export default function ReportsPage() {
  const [data, setData] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    api.get("/reports/overview").then(setData).catch((e) => setError(e.message));
  }, []);

  if (!data) {
    return (
      <PageShell title="Reports">
        <p className="text-sm text-gray-400">{error || "Loading..."}</p>
      </PageShell>
    );
  }

  const npr = (n) => `NPR ${(n || 0).toLocaleString()}`;

  return (
    <PageShell title="Reports & Analytics">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <Stat label="Active Headcount" value={data.totalHeadcount} />
        <Stat
          label={`Payroll (${data.period.month}/${data.period.year})`}
          value={npr(data.payrollThisMonth.totalNet)}
        />
        <Stat label="Tax Withheld" value={npr(data.payrollThisMonth.totalTax)} />
        <Stat label="Payslips Issued" value={data.payrollThisMonth.count} />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <BarChart title="Headcount by Department" rows={data.headcountByDept} />
        <BarChart title="Employment Type" rows={data.employmentTypes} labelFmt={(s) => s?.replace("_", " ")} />
        <BarChart title="Projects by Status" rows={data.projectsByStatus} labelFmt={(s) => s?.replace("_", " ")} />
        <BarChart title="Leaves by Status" rows={data.leavesByStatus} />
        <BarChart title={`Attendance (${data.period.month}/${data.period.year})`} rows={data.attendanceThisMonth} labelFmt={(s) => s?.replace("_", " ")} />
      </div>
    </PageShell>
  );
}

function Stat({ label, value }) {
  return (
    <div className="card">
      <p className="text-xs text-gray-400">{label}</p>
      <p className="text-2xl font-semibold text-gray-800 mt-1">{value}</p>
    </div>
  );
}

function BarChart({ title, rows, labelFmt = (s) => s }) {
  const max = Math.max(1, ...rows.map((r) => r.count));
  return (
    <div className="card">
      <h3 className="text-sm font-semibold text-gray-600 mb-4">{title}</h3>
      {rows.length === 0 ? (
        <p className="text-sm text-gray-400">No data.</p>
      ) : (
        <div className="space-y-3">
          {rows.map((r) => (
            <div key={r._id || "none"}>
              <div className="flex justify-between text-xs text-gray-500 mb-1">
                <span className="capitalize">{labelFmt(r._id) || "—"}</span>
                <span>{r.count}</span>
              </div>
              <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-brand rounded-full"
                  style={{ width: `${(r.count / max) * 100}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
