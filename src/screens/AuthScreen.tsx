import { useState } from "react";
import { Dumbbell } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/lib/supabase";

export function AuthScreen() {
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSendCode(e: React.FormEvent) {
    e.preventDefault();
    if (!email.trim()) return;
    setLoading(true);
    setError(null);

    const { error: err } = await supabase.auth.signInWithOtp({ email: email.trim() });

    if (err) {
      setError(err.message || "No se pudo enviar el código. Verificá el email e intentá de nuevo.");
    } else {
      setSent(true);
    }
    setLoading(false);
  }

  async function handleVerifyCode(e: React.FormEvent) {
    e.preventDefault();
    if (!code.trim()) return;
    setLoading(true);
    setError(null);

    const { error: err } = await supabase.auth.verifyOtp({
      email: email.trim(),
      token: code.trim(),
      type: "email",
    });

    if (err) {
      setError(err.message || "Código incorrecto o vencido. Pedí uno nuevo.");
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
        <form onSubmit={handleVerifyCode} className="w-full space-y-3">
          <p className="text-center text-sm text-foreground">
            Te mandamos un código a <span className="font-semibold">{email}</span>
          </p>
          <input
            type="text"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            placeholder="Código del email"
            inputMode="numeric"
            autoComplete="one-time-code"
            maxLength={10}
            required
            className="h-12 w-full rounded-xl border border-border bg-secondary px-4 text-center text-lg tracking-[0.3em] text-foreground placeholder:tracking-normal placeholder:text-muted-foreground outline-none focus:border-primary"
          />
          {error && <p className="text-xs text-destructive">{error}</p>}
          <Button type="submit" disabled={loading || !code.trim()} className="h-12 w-full rounded-xl text-sm font-bold">
            {loading ? "Verificando..." : "Confirmar código"}
          </Button>
          <button
            type="button"
            onClick={() => {
              setSent(false);
              setCode("");
              setError(null);
            }}
            className="block w-full text-center text-xs font-semibold text-primary"
          >
            Usar otro email
          </button>
        </form>
      ) : (
        <form onSubmit={handleSendCode} className="w-full space-y-3">
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
            Te enviamos un código de acceso — sin contraseña.
          </p>
        </form>
      )}
    </div>
  );
}
