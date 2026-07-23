"use client";

import { useEffect, useState } from "react";
import PageShell from "../../components/PageShell";
import { api } from "../../lib/api";
import { useAuth } from "../../lib/useAuth";

const emptyReview = { employee: "", cycle: "", goals: "" };

export default function PerformancePage() {
  const { profile } = useAuth();
  const [myReviews, setMyReviews] = useState([]);
  const [allReviews, setAllReviews] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [form, setForm] = useState(emptyReview);
  const [showForm, setShowForm] = useState(false);
  const [error, setError] = useState("");

  const isManager = profile?.role === "admin" || profile?.role === "HR";

  const load = async () => {
    try {
      setMyReviews(await api.get("/reviews/me"));
    } catch (err) {
      console.error(err);
    }
    if (isManager) {
      const [rev, emp] = await Promise.allSettled([api.get("/reviews"), api.get("/employees")]);
      if (rev.status === "fulfilled") setAllReviews(rev.value);
      if (emp.status === "fulfilled") setEmployees(emp.value);
    }
  };

  useEffect(() => {
    load();
  }, [profile]);

  const createReview = async (e) => {
    e.preventDefault();
    setError("");
    try {
      await api.post("/reviews", form);
      setForm(emptyReview);
      setShowForm(false);
      load();
    } catch (err) {
      setError(err.message);
    }
  };

  const submitSelf = async (id, selfAssessment) => {
    try {
      await api.put(`/reviews/${id}/self`, { selfAssessment });
      load();
    } catch (err) {
      alert(err.message);
    }
  };

  const completeReview = async (id, managerComments, rating) => {
    try {
      await api.put(`/reviews/${id}/complete`, { managerComments, rating: Number(rating) });
      load();
    } catch (err) {
      alert(err.message);
    }
  };

  return (
    <PageShell
      title="Performance"
      action={
        isManager && (
          <button className="btn-primary" onClick={() => setShowForm((s) => !s)}>
            {showForm ? "Cancel" : "New Review"}
          </button>
        )
      }
    >
      {showForm && isManager && (
        <form onSubmit={createReview} className="card mb-6 grid grid-cols-2 gap-4">
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
          <input
            className="input"
            placeholder="Cycle (e.g. 2026-H1)"
            required
            value={form.cycle}
            onChange={(e) => setForm({ ...form, cycle: e.target.value })}
          />
          <textarea
            className="input col-span-2"
            placeholder="Goals / focus areas"
            value={form.goals}
            onChange={(e) => setForm({ ...form, goals: e.target.value })}
          />
          {error && <p className="text-xs text-red-500 col-span-2">{error}</p>}
          <button type="submit" className="btn-primary col-span-2">
            Create Review
          </button>
        </form>
      )}

      <h2 className="text-sm font-semibold text-gray-500 mb-2">My Reviews</h2>
      <div className="space-y-3 mb-8">
        {myReviews.length === 0 ? (
          <p className="text-sm text-gray-400">No reviews assigned to you.</p>
        ) : (
          myReviews.map((r) => <MyReviewCard key={r._id} review={r} onSubmit={submitSelf} />)
        )}
      </div>

      {isManager && (
        <>
          <h2 className="text-sm font-semibold text-gray-500 mb-2">Team Reviews</h2>
          <div className="space-y-3">
            {allReviews.length === 0 ? (
              <p className="text-sm text-gray-400">No reviews yet.</p>
            ) : (
              allReviews.map((r) => (
                <ManagerReviewCard key={r._id} review={r} onComplete={completeReview} />
              ))
            )}
          </div>
        </>
      )}
    </PageShell>
  );
}

function statusBadge(status) {
  const styles = {
    draft: "bg-gray-100 text-gray-500",
    self_submitted: "bg-yellow-50 text-yellow-600",
    completed: "bg-green-50 text-green-600",
  };
  return `text-xs px-2 py-1 rounded-full ${styles[status]}`;
}

function MyReviewCard({ review, onSubmit }) {
  const [text, setText] = useState(review.selfAssessment || "");
  const editable = review.status !== "completed";
  return (
    <div className="card">
      <div className="flex items-center justify-between">
        <h3 className="font-medium text-gray-800">{review.cycle}</h3>
        <span className={statusBadge(review.status)}>{review.status.replace("_", " ")}</span>
      </div>
      {review.goals && <p className="text-sm text-gray-500 mt-2">Goals: {review.goals}</p>}
      <textarea
        className="input mt-3"
        placeholder="Your self-assessment"
        disabled={!editable}
        value={text}
        onChange={(e) => setText(e.target.value)}
      />
      {review.managerComments && (
        <p className="text-sm text-gray-600 mt-3">
          Manager: {review.managerComments}
          {review.rating ? ` · Rating ${review.rating}/5` : ""}
        </p>
      )}
      {editable && (
        <button className="btn-secondary mt-3" onClick={() => onSubmit(review._id, text)}>
          Submit Self-Assessment
        </button>
      )}
    </div>
  );
}

function ManagerReviewCard({ review, onComplete }) {
  const [comments, setComments] = useState(review.managerComments || "");
  const [rating, setRating] = useState(review.rating || 3);
  const editable = review.status !== "completed";
  return (
    <div className="card">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-medium text-gray-800">{review.employee?.name}</h3>
          <p className="text-xs text-gray-400">
            {review.cycle} · {review.employee?.department}
          </p>
        </div>
        <span className={statusBadge(review.status)}>{review.status.replace("_", " ")}</span>
      </div>
      {review.selfAssessment && (
        <p className="text-sm text-gray-500 mt-2">Self: {review.selfAssessment}</p>
      )}
      <div className="grid grid-cols-4 gap-3 mt-3">
        <textarea
          className="input col-span-3"
          placeholder="Manager comments"
          disabled={!editable}
          value={comments}
          onChange={(e) => setComments(e.target.value)}
        />
        <select
          className="input"
          disabled={!editable}
          value={rating}
          onChange={(e) => setRating(e.target.value)}
        >
          {[1, 2, 3, 4, 5].map((n) => (
            <option key={n} value={n}>
              {n} / 5
            </option>
          ))}
        </select>
      </div>
      {editable && (
        <button
          className="btn-primary mt-3"
          onClick={() => onComplete(review._id, comments, rating)}
        >
          Complete Review
        </button>
      )}
    </div>
  );
}
