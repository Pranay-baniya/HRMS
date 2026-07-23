"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "./supabaseClient";
import { api } from "./api";

const DEV_BYPASS_AUTH = process.env.NEXT_PUBLIC_DEV_BYPASS_AUTH === "true";

export function useAuth({ redirectIfUnauthenticated = true } = {}) {
  const [session, setSession] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    // DEV ONLY: skip the Supabase session check and hit the backend directly -
    // the backend's own DEV_BYPASS_AUTH attaches a real Employee without a JWT.
    if (DEV_BYPASS_AUTH) {
      api
        .get("/employees/me")
        .then((me) => {
          setSession({ dev: true });
          setProfile(me);
        })
        .catch((err) => console.error("Failed to load profile", err))
        .finally(() => setLoading(false));
      return;
    }

    supabase.auth.getSession().then(async ({ data: { session } }) => {
      setSession(session);
      if (session) {
        try {
          const me = await api.get("/employees/me");
          setProfile(me);
        } catch (err) {
          console.error("Failed to load profile", err);
        }
      } else if (redirectIfUnauthenticated) {
        router.push("/");
      }
      setLoading(false);
    });

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if (!session && redirectIfUnauthenticated) {
        router.push("/");
      }
    });

    return () => listener.subscription.unsubscribe();
  }, []);

  return { session, profile, loading };
}
