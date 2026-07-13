import { Sidebar } from "@/components/layout/sidebar";
import { Topbar } from "@/components/layout/topbar";
import { getAuthContext, supabaseAuthEnabled } from "@/server/auth";

export async function AppShell({ children }: { children: React.ReactNode }) {
  const auth = supabaseAuthEnabled ? await getAuthContext() : null;

  return (
    <div className="flex min-h-dvh">
      <Sidebar />
      <div className="flex min-w-0 flex-1 flex-col">
        <Topbar
          authEnabled={supabaseAuthEnabled}
          user={auth ? { name: auth.name, email: auth.email } : null}
        />
        <main className="flex-1 px-4 py-6 lg:px-8">{children}</main>
      </div>
    </div>
  );
}
