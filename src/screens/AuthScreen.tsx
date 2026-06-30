import { useState } from "react";
import { Dumbbell } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/lib/supabase";

export function AuthScreen() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email.trim()) return;
    setLoading(true);
    setError(null);

    const { error: err } = await supabase.auth.signInWithOtp({
      email: email.trim(),
      options: { emailRedirectTo: window.location.origin },
    });

    if (err) {
      setError(err.message || "No se pudo enviar el link. Verificá el email e intentá de nuevo.");
    } else {
      setSent(true);
    }
    setLoading(false);
  }

  return (
    <div className="flex h-screen flex-col items-center justify-center px-8">
      <div className="mb-10 flex flex-col items-center gap-3">
        <div className="grid h-14 w-14 place-items-center rounded-2xl bg-primary">
          <Dumbbell size={28} className="text-primary-foreground" />
        </div>
        <div className="text-center">
          <h1 className="font-display text-2xl font-bold text-foreground">Gym Log</h1>
          <p className="mt-1 text-sm text-muted-foreground">Tu logbook personal de entrenamiento</p>
        </div>
      </div>

      {sent ? (
        <div className="w-full rounded-2xl border border-border bg-card p-6 text-center">
          <p className="text-sm font-semibold text-foreground">Revisá tu email</p>
          <p className="mt-1 text-xs text-muted-foreground">
            Te mandamos un link a <span className="text-foreground">{email}</span>.
            Tocá el link para entrar — no hace falta contraseña.
          </p>
          <button
            onClick={() => setSent(false)}
            className="mt-4 text-xs font-semibold text-primary"
          >
            Usar otro email
          </button>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="w-full space-y-3">
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="tu@email.com"
            autoComplete="email"
            inputMode="email"
            required
            className="h-12 w-full rounded-xl border border-border bg-secondary px-4 text-sm text-foreground placeholder:text-muted-foreground outline-none focus:border-primary"
          />
          {error && <p className="text-xs text-destructive">{error}</p>}
          <Button type="submit" disabled={loading || !email.trim()} className="h-12 w-full rounded-xl text-sm font-bold">
            {loading ? "Enviando..." : "Continuar con email"}
          </Button>
          <p className="text-center text-[11px] text-muted-foreground">
            Te enviamos un link mágico — sin contraseña.
          </p>
        </form>
      )}
    </div>
  );
}
