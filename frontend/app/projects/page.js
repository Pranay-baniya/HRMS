"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import PageShell from "../../components/PageShell";
import { api } from "../../lib/api";

const emptyForm = {
  name: "",
  client: "",
  description: "",
  category: "other",
  status: "active",
  startDate: "",
};

export default function ProjectsPage() {
  const [projects, setProjects] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    try {
      const data = await api.get("/projects");
      setProjects(data);
    } catch (err) {
      console.error(err);
    }
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    try {
      await api.post("/projects", form);
      setForm(emptyForm);
      setShowForm(false);
      load();
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <PageShell
      title="Projects"
      action={
        <button className="btn-primary" onClick={() => setShowForm((s) => !s)}>
          {showForm ? "Cancel" : "Add Project"}
        </button>
      }
    >
      {showForm && (
        <form onSubmit={handleSubmit} className="card mb-6 grid grid-cols-2 gap-4">
          <input
            className="input"
            placeholder="Project name (e.g. Afterlight)"
            required
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
          />
          <input
            className="input"
            placeholder="Client name"
            value={form.client}
            onChange={(e) => setForm({ ...form, client: e.target.value })}
          />
          <select
            className="input"
            value={form.category}
            onChange={(e) => setForm({ ...form, category: e.target.value })}
          >
            {["healthtech", "fintech", "sportstech", "events", "internal_product", "other"].map(
              (c) => (
                <option key={c} value={c}>
                  {c.replace("_", " ")}
                </option>
              )
            )}
          </select>
          <select
            className="input"
            value={form.status}
            onChange={(e) => setForm({ ...form, status: e.target.value })}
          >
            {["planning", "active", "on_hold", "completed"].map((s) => (
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
          <textarea
            className="input col-span-2"
            placeholder="Short description"
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
          />

          {error && <p className="text-xs text-red-500 col-span-2">{error}</p>}

          <button type="submit" className="btn-primary col-span-2">
            Save Project
          </button>
        </form>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {loading ? (
          <p className="text-sm text-gray-400">Loading...</p>
        ) : projects.length === 0 ? (
          <p className="text-sm text-gray-400">No projects yet.</p>
        ) : (
          projects.map((p) => (
            <Link key={p._id} href={`/projects/${p._id}`} className="card hover:border-brand/40 transition-colors">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-gray-800">{p.name}</h3>
                <span className="text-xs px-2 py-1 rounded-full bg-brand/10 text-brand capitalize">
                  {p.status.replace("_", " ")}
                </span>
              </div>
              <p className="text-xs text-gray-400 mt-1">{p.client || "Internal"}</p>
              <p className="text-sm text-gray-500 mt-3">{p.description}</p>
              <p className="text-xs text-gray-400 mt-3 capitalize">
                {p.category.replace("_", " ")}
              </p>
            </Link>
          ))
        )}
      </div>
    </PageShell>
  );
}
