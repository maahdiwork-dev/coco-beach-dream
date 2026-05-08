import { useEffect, useState } from "react";
import AdminLogin from "@/components/admin/AdminLogin";
import AdminDashboard from "@/components/admin/AdminDashboard";
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

  return <AdminDashboard onLogout={() => setAuthState("unauthenticated")} />;
}
