import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import AdminLogin from "@/components/admin/AdminLogin";
import { Loader2 } from "lucide-react";

type AuthState = "loading" | "unauthenticated" | "authenticated";

export default function Admin() {
  const [authState, setAuthState] = useState<AuthState>("loading");

  const checkAuth = async () => {
    try {
      const res = await fetch("/api/admin/auth", { credentials: "include" });
      const body = await res.json();
      setAuthState(body.authenticated ? "authenticated" : "unauthenticated");
    } catch {
      setAuthState("unauthenticated");
    }
  };

  useEffect(() => {
    checkAuth();
  }, []);

  if (authState === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (authState === "unauthenticated") {
    return <AdminLogin onSuccess={() => setAuthState("authenticated")} />;
  }

  // Authenticated → go straight to the live site in edit mode (the one, simple way to edit)
  return <Navigate to="/?edit=1" replace />;
}
