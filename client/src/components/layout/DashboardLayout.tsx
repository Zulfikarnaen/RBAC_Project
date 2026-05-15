import { ReactNode } from "react";
import { useAuth } from "@/hooks/useAuth";

export const DashboardLayout = ({ children }: { children: ReactNode }) => {
  const { user, handleLogout } = useAuth();

  return (
    <div className="min-h-screen bg-gray-100 flex">
      {/* Sidebar Ringkas */}
      <aside className="w-64 bg-slate-900 text-white p-6 hidden md:block">
        <h1 className="text-xl font-bold mb-10 text-blue-400">RBAC System</h1>
        <nav className="space-y-2">
          <a href="/dashboard" className="block p-2 hover:bg-slate-800 rounded">Beranda</a>
          <p className="text-xs text-gray-500 mt-4 uppercase">Role: {user?.roles[0]}</p>
        </nav>
      </aside>

      <div className="flex-1 flex flex-col">
        {/* Navbar */}
        <header className="bg-white shadow-sm p-4 flex justify-between items-center px-8">
          <h2 className="font-semibold text-gray-700 text-lg">Dashboard</h2>
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-600">{user?.email}</span>
            <button onClick={handleLogout} className="text-sm text-red-600 font-medium">Keluar</button>
          </div>
        </header>

        {/* Content */}
        <main className="p-8">{children}</main>
      </div>
    </div>
  );
};