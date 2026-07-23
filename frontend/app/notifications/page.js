"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import PageShell from "../../components/PageShell";
import { api } from "../../lib/api";

export default function NotificationsPage() {
  const [items, setItems] = useState([]);

  const load = async () => {
    try {
      const data = await api.get("/notifications/me");
      setItems(data.notifications);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const markRead = async (id) => {
    try {
      await api.put(`/notifications/${id}/read`, {});
      load();
    } catch (err) {
      console.error(err);
    }
  };

  const markAll = async () => {
    try {
      await api.put("/notifications/read-all", {});
      load();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <PageShell
      title="Notifications"
      action={
        <button className="btn-secondary" onClick={markAll}>
          Mark all read
        </button>
      }
    >
      <div className="card p-0 overflow-hidden">
        {items.length === 0 ? (
          <p className="text-sm text-gray-400 p-6">No notifications.</p>
        ) : (
          <ul>
            {items.map((n) => (
              <li
                key={n._id}
                className={`flex items-center gap-3 px-6 py-4 border-t border-gray-100 first:border-t-0 ${
                  n.read ? "" : "bg-brand/5"
                }`}
              >
                {!n.read && <span className="w-2 h-2 rounded-full bg-brand shrink-0" />}
                <div className="flex-1">
                  {n.link ? (
                    <Link href={n.link} className="text-sm text-gray-800 hover:text-brand">
                      {n.message}
                    </Link>
                  ) : (
                    <span className="text-sm text-gray-800">{n.message}</span>
                  )}
                  <p className="text-xs text-gray-400 mt-0.5">
                    {new Date(n.createdAt).toLocaleString()}
                  </p>
                </div>
                {!n.read && (
                  <button
                    className="text-xs text-gray-400 hover:text-brand"
                    onClick={() => markRead(n._id)}
                  >
                    Mark read
                  </button>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>
    </PageShell>
  );
}
