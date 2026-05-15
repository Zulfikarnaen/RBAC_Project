import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { useAuth } from "@/hooks/useAuth";

export default function UserPage() {
  const { user } = useAuth();

  // Helper untuk ambil nama role
  const getRoleName = (item: any): string => {
    if (typeof item === "string") return item;
    return item?.name || item?.role?.name || "STAFF";
  };

  // Pastikan roles selalu array
  const userRoles = Array.isArray(user?.roles) ? user.roles : [];

  return (
    <DashboardLayout>
      {/* Kontainer Utama: Ukuran Proporsional */}
      <div className="bg-white p-8 rounded-[1.5rem] shadow-[0_4px_20px_rgb(0,0,0,0.03)] border border-slate-100">
        
        {/* Header Section */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-slate-800 tracking-tight">
            Halo, {user?.username || user?.email?.split("@")[0] || "User"}! 👋
          </h1>
          <p className="text-slate-400 text-sm mt-1">
            Selamat datang di sistem manajemen akses berbasis peran.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          
          {/* --- BOX ROLE --- */}
          <div className="p-6 bg-[#fcfdff] rounded-2xl border border-slate-100 hover:shadow-md transition-all duration-300">
            <div className="flex items-center gap-3 mb-5">
              <div className="p-2 bg-indigo-500 rounded-lg shadow-sm">
                <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              </div>
              <h3 className="font-bold text-slate-700 text-base">Role Anda</h3>
            </div>

            <div className="flex gap-2 flex-wrap">
              {userRoles.length > 0 ? (
                userRoles.map((role: any, index: number) => (
                  <span
                    key={index}
                    className="px-4 py-1.5 bg-white text-indigo-600 text-[10px] rounded-lg uppercase font-bold tracking-widest border border-slate-100 shadow-sm"
                  >
                    {getRoleName(role)}
                  </span>
                ))
              ) : (
                <div className="py-1">
                  <p className="text-xs text-slate-400 italic">Data role tidak terdeteksi</p>
                  <span className="text-[9px] text-rose-500 font-bold bg-rose-50 px-2 py-0.5 rounded mt-1 inline-block uppercase tracking-tighter">Mohon Re-login</span>
                </div>
              )}
            </div>
          </div>

          {/* --- BOX STATUS --- */}
          <div className="p-6 bg-[#fcfdff] rounded-2xl border border-slate-100 hover:shadow-md transition-all duration-300">
            <div className="flex items-center gap-3 mb-5">
              <div className="p-2 bg-emerald-500 rounded-lg shadow-sm">
                <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h3 className="font-bold text-slate-700 text-base">Status Akun</h3>
            </div>

            <div className="flex items-center gap-3 p-3 bg-white rounded-xl border border-slate-50">
              <div className="relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
              </div>
              <div>
                <p className="text-sm font-bold text-slate-700">Terverifikasi & Aktif</p>
                <p className="text-[9px] text-slate-400 uppercase tracking-widest font-bold">Enterprise Secured</p>
              </div>
            </div>
          </div>

        </div>
      </div>
    </DashboardLayout>
  );
}