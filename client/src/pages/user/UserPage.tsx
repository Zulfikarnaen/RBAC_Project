import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { useAuth } from "@/hooks/useAuth";

export default function UserPage() {
  const { user } = useAuth();

  return (
    <DashboardLayout>
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
        <h1 className="text-2xl font-bold text-gray-800 mb-2">Halo, {user?.username}! 👋</h1>
        <p className="text-gray-600">Selamat datang di sistem manajemen akses berbasis peran.</p>
        
        <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-4 bg-blue-50 rounded-lg border border-blue-100">
            <h3 className="font-semibold text-blue-800">Role Anda</h3>
            <div className="mt-2 flex gap-2">
              {user?.roles.map(role => (
                <span key={role} className="px-2 py-1 bg-blue-200 text-blue-800 text-xs rounded uppercase font-bold">
                  {role}
                </span>
              ))}
            </div>
          </div>
          
          <div className="p-4 bg-green-50 rounded-lg border border-green-100">
            <h3 className="font-semibold text-green-800">Status Akun</h3>
            <p className="text-sm text-green-700 mt-1 flex items-center gap-2">
              <span className="w-2 h-2 bg-green-500 rounded-full"></span> Terverifikasi & Aktif
            </p>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}