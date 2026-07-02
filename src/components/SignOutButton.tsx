import { useState } from "react";
import { LogOut } from "lucide-react";
import { IconButton } from "@/components/IconButton";
import { ConfirmDialog } from "@/components/ConfirmDialog";
import { useAuth } from "@/hooks/useAuth";

export function SignOutButton() {
  const { signOut } = useAuth();
  const [confirmOpen, setConfirmOpen] = useState(false);

  return (
    <>
      <IconButton icon={LogOut} label="Cerrar sesión" onClick={() => setConfirmOpen(true)} />
      <ConfirmDialog
        open={confirmOpen}
        title="Cerrar sesión"
        description="¿Seguro que querés cerrar sesión?"
        confirmLabel="Cerrar sesión"
        onConfirm={() => {
          setConfirmOpen(false);
          signOut();
        }}
        onCancel={() => setConfirmOpen(false)}
      />
    </>
  );
}
