"use client";

import { useEffect, useState } from "react";
import PageShell from "../../components/PageShell";
import { api } from "../../lib/api";
import { useAuth } from "../../lib/useAuth";

export default function SettingsPage() {
  const { profile } = useAuth();
  const [settings, setSettings] = useState(null);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");

  const isAdmin = profile?.role === "admin";

  useEffect(() => {
    api.get("/settings").then(setSettings).catch((e) => setError(e.message));
  }, []);

  const handleSave = async (e) => {
    e.preventDefault();
    setError("");
    setSaved(false);
    try {
      const payload = {
        companyName: settings.companyName,
        departments: settings.departments,
        workDayStartHour: Number(settings.workDayStartHour),
        workDayStartMinute: Number(settings.workDayStartMinute),
        providentFundRate: Number(settings.providentFundRate),
        holidays: settings.holidays,
      };
      const updated = await api.put("/settings", payload);
      setSettings(updated);
      setSaved(true);
    } catch (err) {
      setError(err.message);
    }
  };

  if (!settings) {
    return (
      <PageShell title="Settings">
        <p className="text-sm text-gray-400">{error || "Loading..."}</p>
      </PageShell>
    );
  }

  const readOnly = !isAdmin;

  return (
    <PageShell title="Settings">
      {!isAdmin && (
        <p className="text-sm text-gray-400 mb-4">Only admins can change organization settings.</p>
      )}
      <form onSubmit={handleSave} className="card grid grid-cols-2 gap-4 max-w-3xl">
        <div className="col-span-2">
          <label className="text-xs text-gray-400">Company Name</label>
          <input
            className="input mt-1"
            disabled={readOnly}
            value={settings.companyName || ""}
            onChange={(e) => setSettings({ ...settings, companyName: e.target.value })}
          />
        </div>
        <div className="col-span-2">
          <label className="text-xs text-gray-400">Departments (comma-separated)</label>
          <input
            className="input mt-1"
            disabled={readOnly}
            value={(settings.departments || []).join(", ")}
            onChange={(e) =>
              setSettings({
                ...settings,
                departments: e.target.value.split(",").map((s) => s.trim()).filter(Boolean),
              })
            }
          />
        </div>
        <div>
          <label className="text-xs text-gray-400">Work-day start hour (late after)</label>
          <input
            className="input mt-1"
            type="number"
            min="0"
            max="23"
            disabled={readOnly}
            value={settings.workDayStartHour}
            onChange={(e) => setSettings({ ...settings, workDayStartHour: e.target.value })}
          />
        </div>
        <div>
          <label className="text-xs text-gray-400">Work-day start minute</label>
          <input
            className="input mt-1"
            type="number"
            min="0"
            max="59"
            disabled={readOnly}
            value={settings.workDayStartMinute}
            onChange={(e) => setSettings({ ...settings, workDayStartMinute: e.target.value })}
          />
        </div>
        <div>
          <label className="text-xs text-gray-400">Provident Fund rate (e.g. 0.1 = 10%)</label>
          <input
            className="input mt-1"
            type="number"
            step="0.01"
            min="0"
            max="1"
            disabled={readOnly}
            value={settings.providentFundRate}
            onChange={(e) => setSettings({ ...settings, providentFundRate: e.target.value })}
          />
        </div>
        <div>
          <label className="text-xs text-gray-400">Holidays (comma-separated YYYY-MM-DD)</label>
          <input
            className="input mt-1"
            disabled={readOnly}
            value={(settings.holidays || []).join(", ")}
            onChange={(e) =>
              setSettings({
                ...settings,
                holidays: e.target.value.split(",").map((s) => s.trim()).filter(Boolean),
              })
            }
          />
        </div>

        {error && <p className="text-xs text-red-500 col-span-2">{error}</p>}
        {saved && <p className="text-xs text-green-600 col-span-2">Settings saved.</p>}

        {isAdmin && (
          <button type="submit" className="btn-primary col-span-2">
            Save Settings
          </button>
        )}
      </form>
    </PageShell>
  );
}
