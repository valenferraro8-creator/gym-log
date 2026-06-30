import { useEffect, useState } from "react";
import type { User } from "@supabase/supabase-js";
import { supabase } from "@/lib/supabase";

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      setLoading(false);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_, session) => {
      setUser(session?.user ?? null);
    });

    // El link mágico se abre en una pestaña/contexto separado del de la PWA
    // instalada (especialmente en iOS standalone). Cuando se vuelve a esta
    // app, hay que releer la sesión persistida para detectar el login.
    function recheckSession() {
      if (document.visibilityState === "visible") {
        supabase.auth.getSession().then(({ data: { session } }) => {
          setUser(session?.user ?? null);
        });
      }
    }

    document.addEventListener("visibilitychange", recheckSession);
    window.addEventListener("focus", recheckSession);

    return () => {
      subscription.unsubscribe();
      document.removeEventListener("visibilitychange", recheckSession);
      window.removeEventListener("focus", recheckSession);
    };
  }, []);

  async function signIn(email: string) {
    return supabase.auth.signInWithOtp({
      email,
      options: { emailRedirectTo: window.location.origin },
    });
  }

  async function signOut() {
    return supabase.auth.signOut();
  }

  return { user, loading, signIn, signOut };
}
