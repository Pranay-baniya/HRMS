"use client";

import { useEffect, useState } from "react";
import PageShell from "../../components/PageShell";
import { api } from "../../lib/api";
import { useAuth } from "../../lib/useAuth";
import { supabase } from "../../lib/supabaseClient";

const CATEGORIES = ["contract", "id", "certificate", "payslip", "other"];
const emptyForm = { employee: "", name: "", url: "", category: "other" };

export default function DocumentsPage() {
  const { profile } = useAuth();
  const [docs, setDocs] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [showForm, setShowForm] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");

  const isManager = profile?.role === "admin" || profile?.role === "HR";

  const load = async () => {
    try {
      setDocs(await api.get(isManager ? "/documents" : "/documents/me"));
    } catch (err) {
      console.error(err);
    }
    if (isManager) {
      try {
        setEmployees(await api.get("/employees"));
      } catch (err) {
        console.error(err);
      }
    }
  };

  useEffect(() => {
    load();
  }, [profile]);

  // Optional: upload the chosen file to Supabase Storage bucket "documents".
  // Falls back to manual URL entry if the bucket isn't configured.
  const handleUpload = async (file) => {
    if (!file) return;
    setError("");
    setUploading(true);
    try {
      const path = `${form.employee || "unassigned"}/${Date.now()}-${file.name}`;
      const { error: upErr } = await supabase.storage.from("documents").upload(path, file);
      if (upErr) throw upErr;
      const { data } = supabase.storage.from("documents").getPublicUrl(path);
      setForm((f) => ({ ...f, url: data.publicUrl, name: f.name || file.name }));
    } catch (err) {
      setError(
        `Upload failed (${err.message}). Create a public "documents" bucket in Supabase, or paste a URL manually.`
      );
    }
    setUploading(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    try {
      await api.post("/documents", form);
      setForm(emptyForm);
      setShowForm(false);
      load();
    } catch (err) {
      setError(err.message);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm("Delete this document?")) return;
    try {
      await api.del(`/documents/${id}`);
      load();
    } catch (err) {
      alert(err.message);
    }
  };

  return (
    <PageShell
      title="Documents"
      action={
        isManager && (
          <button className="btn-primary" onClick={() => setShowForm((s) => !s)}>
            {showForm ? "Cancel" : "Add Document"}
          </button>
        )
      }
    >
      {showForm && isManager && (
        <form onSubmit={handleSubmit} className="card mb-6 grid grid-cols-2 gap-4">
          <select
            className="input"
            required
            value={form.employee}
            onChange={(e) => setForm({ ...form, employee: e.target.value })}
          >
            <option value="">Select employee…</option>
            {employees.map((emp) => (
              <option key={emp._id} value={emp._id}>
                {emp.name}
              </option>
            ))}
          </select>
          <select
            className="input"
            value={form.category}
            onChange={(e) => setForm({ ...form, category: e.target.value })}
          >
            {CATEGORIES.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
          <input
            className="input"
            placeholder="Document name"
            required
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
          />
          <input
            className="input"
            placeholder="URL (or upload below)"
            required
            value={form.url}
            onChange={(e) => setForm({ ...form, url: e.target.value })}
          />
          <div className="col-span-2">
            <input type="file" onChange={(e) => handleUpload(e.target.files[0])} />
            {uploading && <span className="text-xs text-gray-400 ml-2">Uploading…</span>}
          </div>
          {error && <p className="text-xs text-red-500 col-span-2">{error}</p>}
          <button type="submit" className="btn-primary col-span-2" disabled={uploading}>
            Save Document
          </button>
        </form>
      )}

      <div className="card p-0 overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="table-header">Name</th>
              {isManager && <th className="table-header">Employee</th>}
              <th className="table-header">Category</th>
              <th className="table-header">Link</th>
              {isManager && <th className="table-header"></th>}
            </tr>
          </thead>
          <tbody>
            {docs.length === 0 ? (
              <tr>
                <td className="table-cell" colSpan={5}>
                  No documents yet.
                </td>
              </tr>
            ) : (
              docs.map((d) => (
                <tr key={d._id}>
                  <td className="table-cell">{d.name}</td>
                  {isManager && <td className="table-cell">{d.employee?.name}</td>}
                  <td className="table-cell capitalize">{d.category}</td>
                  <td className="table-cell">
                    <a
                      href={d.url}
                      target="_blank"
                      rel="noreferrer"
                      className="text-brand hover:underline text-xs"
                    >
                      Open
                    </a>
                  </td>
                  {isManager && (
                    <td className="table-cell">
                      <button
                        className="text-xs text-red-500 hover:underline"
                        onClick={() => handleDelete(d._id)}
                      >
                        Delete
                      </button>
                    </td>
                  )}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </PageShell>
  );
}
