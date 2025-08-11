import Sidebar from "./sidebar";
import Header from "./header";
import { useAdminShortcut } from "./secret-admin-access";

interface LayoutProps {
  children: React.ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  // Ativar atalho secreto para painel administrativo
  useAdminShortcut();

  return (
    <div className="flex min-h-screen bg-blue-bg">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header />
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-blue-light/10 p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
