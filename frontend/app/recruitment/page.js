"use client";

import { useEffect, useState } from "react";
import PageShell from "../../components/PageShell";
import { api } from "../../lib/api";

const STAGES = [
  { key: "applied", label: "Applied" },
  { key: "screening", label: "Screening" },
  { key: "interview", label: "Interview" },
  { key: "offer", label: "Offer" },
  { key: "hired", label: "Hired" },
  { key: "rejected", label: "Rejected" },
];

const emptyJob = { title: "", department: "", employmentType: "full_time", openings: 1 };
const emptyCandidate = { name: "", email: "", phone: "", jobOpening: "", stage: "applied" };

export default function RecruitmentPage() {
  const [jobs, setJobs] = useState([]);
  const [candidates, setCandidates] = useState([]);
  const [jobForm, setJobForm] = useState(emptyJob);
  const [candForm, setCandForm] = useState(emptyCandidate);
  const [showJob, setShowJob] = useState(false);
  const [showCand, setShowCand] = useState(false);
  const [error, setError] = useState("");

  const load = async () => {
    try {
      const [j, c] = await Promise.all([
        api.get("/recruitment/jobs"),
        api.get("/recruitment/candidates"),
      ]);
      setJobs(j);
      setCandidates(c);
    } catch (err) {
      setError(err.message);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const addJob = async (e) => {
    e.preventDefault();
    setError("");
    try {
      await api.post("/recruitment/jobs", { ...jobForm, openings: Number(jobForm.openings) });
      setJobForm(emptyJob);
      setShowJob(false);
      load();
    } catch (err) {
      setError(err.message);
    }
  };

  const addCandidate = async (e) => {
    e.preventDefault();
    setError("");
    try {
      await api.post("/recruitment/candidates", candForm);
      setCandForm(emptyCandidate);
      setShowCand(false);
      load();
    } catch (err) {
      setError(err.message);
    }
  };

  const moveCandidate = async (c, stage) => {
    try {
      await api.put(`/recruitment/candidates/${c._id}`, { stage });
      load();
    } catch (err) {
      alert(err.message);
    }
  };

  return (
    <PageShell
      title="Recruitment"
      action={
        <div className="flex gap-2">
          <button className="btn-secondary" onClick={() => setShowJob((s) => !s)}>
            {showJob ? "Cancel" : "New Opening"}
          </button>
          <button className="btn-primary" onClick={() => setShowCand((s) => !s)}>
            {showCand ? "Cancel" : "Add Candidate"}
          </button>
        </div>
      }
    >
      {error && <p className="text-xs text-red-500 mb-3">{error}</p>}

      {showJob && (
        <form onSubmit={addJob} className="card mb-6 grid grid-cols-2 gap-4">
          <input
            className="input"
            placeholder="Job title"
            required
            value={jobForm.title}
            onChange={(e) => setJobForm({ ...jobForm, title: e.target.value })}
          />
          <input
            className="input"
            placeholder="Department"
            value={jobForm.department}
            onChange={(e) => setJobForm({ ...jobForm, department: e.target.value })}
          />
          <select
            className="input"
            value={jobForm.employmentType}
            onChange={(e) => setJobForm({ ...jobForm, employmentType: e.target.value })}
          >
            <option value="full_time">Full time</option>
            <option value="part_time">Part time</option>
            <option value="intern">Intern</option>
            <option value="contract">Contract</option>
          </select>
          <input
            className="input"
            type="number"
            min="1"
            placeholder="Openings"
            value={jobForm.openings}
            onChange={(e) => setJobForm({ ...jobForm, openings: e.target.value })}
          />
          <button type="submit" className="btn-primary col-span-2">
            Save Opening
          </button>
        </form>
      )}

      {showCand && (
        <form onSubmit={addCandidate} className="card mb-6 grid grid-cols-2 gap-4">
          <select
            className="input"
            required
            value={candForm.jobOpening}
            onChange={(e) => setCandForm({ ...candForm, jobOpening: e.target.value })}
          >
            <option value="">Select opening…</option>
            {jobs.map((j) => (
              <option key={j._id} value={j._id}>
                {j.title}
              </option>
            ))}
          </select>
          <input
            className="input"
            placeholder="Candidate name"
            required
            value={candForm.name}
            onChange={(e) => setCandForm({ ...candForm, name: e.target.value })}
          />
          <input
            className="input"
            placeholder="Email"
            value={candForm.email}
            onChange={(e) => setCandForm({ ...candForm, email: e.target.value })}
          />
          <input
            className="input"
            placeholder="Phone"
            value={candForm.phone}
            onChange={(e) => setCandForm({ ...candForm, phone: e.target.value })}
          />
          <button type="submit" className="btn-primary col-span-2">
            Save Candidate
          </button>
        </form>
      )}

      {/* Open positions */}
      <h2 className="text-sm font-semibold text-gray-500 mb-2">Open Positions</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        {jobs.length === 0 ? (
          <p className="text-sm text-gray-400">No openings yet.</p>
        ) : (
          jobs.map((j) => (
            <div key={j._id} className="card">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-gray-800">{j.title}</h3>
                <span className="text-xs px-2 py-1 rounded-full bg-brand/10 text-brand capitalize">
                  {j.status}
                </span>
              </div>
              <p className="text-xs text-gray-400 mt-1">{j.department || "—"}</p>
              <p className="text-xs text-gray-400 mt-2 capitalize">
                {j.employmentType?.replace("_", " ")} · {j.openings} opening(s)
              </p>
              <p className="text-xs text-gray-500 mt-2">
                {candidates.filter((c) => (c.jobOpening?._id || c.jobOpening) === j._id).length}{" "}
                candidate(s)
              </p>
            </div>
          ))
        )}
      </div>

      {/* Pipeline */}
      <h2 className="text-sm font-semibold text-gray-500 mb-2">Candidate Pipeline</h2>
      <div className="grid grid-cols-2 md:grid-cols-6 gap-3">
        {STAGES.map((stage) => {
          const stageCands = candidates.filter((c) => c.stage === stage.key);
          return (
            <div key={stage.key} className="bg-gray-50 rounded-xl p-3">
              <div className="flex items-center justify-between mb-3 px-1">
                <h3 className="text-xs font-semibold text-gray-600">{stage.label}</h3>
                <span className="text-xs text-gray-400">{stageCands.length}</span>
              </div>
              <div className="space-y-2">
                {stageCands.map((c) => (
                  <div key={c._id} className="card p-3">
                    <p className="text-sm font-medium text-gray-800">{c.name}</p>
                    <p className="text-xs text-gray-400">{c.jobOpening?.title || "—"}</p>
                    <select
                      className="text-xs border border-gray-200 rounded-md px-1 py-1 mt-2 w-full"
                      value={c.stage}
                      onChange={(e) => moveCandidate(c, e.target.value)}
                    >
                      {STAGES.map((s) => (
                        <option key={s.key} value={s.key}>
                          {s.label}
                        </option>
                      ))}
                    </select>
                  </div>
                ))}
                {stageCands.length === 0 && (
                  <p className="text-xs text-gray-300 text-center py-3">—</p>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </PageShell>
  );
}
