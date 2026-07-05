import Link from 'next/link';
import { ArrowLeft, BarChart3, TrendingUp, Users } from 'lucide-react';
import { supabase } from '@/lib/supabase';

export const revalidate = 0; // Disable cache for real-time data

export default async function LaporanAnalitik() {
  // Fetch lalaran logs
  const { data: lalaranLogs } = await supabase.from('lalaran_logs').select('status, user_id');
  const logs = lalaranLogs || [];
  
  const totalHadir = logs.filter(l => l.status === 'hadir').length;
  const totalLogs = logs.length;
  const kedisiplinan = totalLogs === 0 ? 0 : (totalHadir / totalLogs) * 100;

  // Calculate Alfa per user
  const alfaCountPerUser: Record<string, number> = {};
  logs.forEach(l => {
    if (l.status === 'alfa') {
      alfaCountPerUser[l.user_id] = (alfaCountPerUser[l.user_id] || 0) + 1;
    }
  });

  const usersWithAlfa = Object.keys(alfaCountPerUser).filter(uid => alfaCountPerUser[uid] > 0);
  
  // Fetch bermasalah users data
  const { data: bermasalahUsers } = usersWithAlfa.length > 0 
    ? await supabase.from('users').select('id, nim, name, groups(name)').in('id', usersWithAlfa)
    : { data: [] };

  const { count: totalSetoran } = await supabase.from('hafalan_logs').select('*', { count: 'exact', head: true });

  return (
    <div className="min-h-screen p-4 sm:p-6 max-w-6xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-8 sm:mb-10 gap-4">
        <div className="flex items-center gap-3 sm:gap-4">
          <Link href="/" className="p-2 rounded-full hover:bg-slate-800 transition-colors">
            <ArrowLeft className="w-5 h-5 sm:w-6 sm:h-6" />
          </Link>
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-white">Laporan Analitik</h1>
            <p className="text-sm sm:text-base text-slate-400">Dasbor Eksekutif PJ Hafalan & Kurikulum</p>
          </div>
        </div>
        <div className="self-start sm:self-auto sm:text-right">
          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs sm:text-sm font-medium bg-orange-500/10 text-orange-400 border border-orange-500/20">
            Periode: Juli 2026
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6 mb-6 sm:mb-8">
        <div className="glass-panel p-4 sm:p-6 border-l-4 border-l-emerald-500">
          <div className="flex justify-between items-start mb-2">
            <div>
              <p className="text-xs sm:text-sm text-slate-400 font-medium">Tingkat Kedisiplinan</p>
              <h3 className="text-xl sm:text-3xl font-bold text-white mt-1">{kedisiplinan.toFixed(1)}%</h3>
            </div>
            <div className="bg-emerald-500/20 p-2 sm:p-3 rounded-lg">
              <TrendingUp className="w-4 h-4 sm:w-6 sm:h-6 text-emerald-400" />
            </div>
          </div>
          <p className="text-xs sm:text-sm text-emerald-400 mt-2 flex items-center gap-1">
            <TrendingUp className="w-3 h-3" /> +2.4% dari bulan lalu
          </p>
        </div>

        <div className="glass-panel p-4 sm:p-6 border-l-4 border-l-rose-500">
          <div className="flex justify-between items-start mb-2">
            <div>
              <p className="text-xs sm:text-sm text-slate-400 font-medium">Mahasantri Bermasalah</p>
              <h3 className="text-xl sm:text-3xl font-bold text-white mt-1">{usersWithAlfa.length} <span className="text-sm font-normal text-slate-400">Orang</span></h3>
            </div>
            <div className="bg-rose-500/20 p-2 sm:p-3 rounded-lg">
              <Users className="w-4 h-4 sm:w-6 sm:h-6 text-rose-400" />
            </div>
          </div>
          <p className="text-xs sm:text-sm text-rose-400 mt-2">Masuk zona merah (Wajib Pembinaan)</p>
        </div>

        <div className="glass-panel p-4 sm:p-6 border-l-4 border-l-blue-500">
          <div className="flex justify-between items-start mb-2">
            <div>
              <p className="text-xs sm:text-sm text-slate-400 font-medium">Total Setoran</p>
              <h3 className="text-xl sm:text-3xl font-bold text-white mt-1">{totalSetoran || 0}</h3>
            </div>
            <div className="bg-blue-500/20 p-2 sm:p-3 rounded-lg">
              <BarChart3 className="w-4 h-4 sm:w-6 sm:h-6 text-blue-400" />
            </div>
          </div>
          <p className="text-xs sm:text-sm text-slate-400 mt-2">Nazam & Ayat dihafal bulan ini</p>
        </div>
      </div>

      <div className="glass-panel p-4 sm:p-6">
        <h2 className="text-lg sm:text-xl font-semibold mb-4 sm:mb-6 border-b border-slate-700 pb-3">
          Daftar Mahasantri Perlu Pembinaan Khusus (2 Bulan Beruntun)
        </h2>
        
        <div className="overflow-hidden">
          {/* Mobile View: Cards */}
          <div className="block md:hidden space-y-4">
            {bermasalahUsers?.length === 0 && (
              <div className="p-6 text-center text-slate-400 bg-slate-800/30 rounded-xl">Alhamdulillah, tidak ada santri bermasalah.</div>
            )}
            {bermasalahUsers?.map((user, idx) => (
              <div key={idx} className="bg-slate-800/50 p-4 rounded-xl border border-slate-700/50">
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <div className="font-medium text-white text-lg">{user.name}</div>
                    <div className="text-rose-400 font-mono text-sm">{user.nim}</div>
                  </div>
                  <div className="bg-rose-500/10 px-3 py-1 rounded text-rose-400 font-bold text-sm">
                    {alfaCountPerUser[user.id]} Hari Alfa
                  </div>
                </div>
                <div className="text-slate-400 text-sm mb-4">{(user.groups as any)?.name || 'Unknown'}</div>
                <button className="w-full px-4 py-2 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/20 rounded-lg text-sm font-medium transition-colors">
                  Panggil Sidang
                </button>
              </div>
            ))}
          </div>

          {/* Desktop View: Table */}
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[500px]">
              <thead>
                <tr className="text-slate-400 text-xs sm:text-sm border-b border-slate-700">
                  <th className="pb-3 pl-2 sm:pl-4">NIM</th>
                  <th className="pb-3">Nama Santri</th>
                  <th className="pb-3">Kelompok</th>
                  <th className="pb-3">Total Alfa</th>
                  <th className="pb-3 pr-2 sm:pr-4">Aksi</th>
                </tr>
              </thead>
              <tbody>
                {bermasalahUsers?.length === 0 && (
                  <tr>
                    <td colSpan={5} className="py-8 text-center text-slate-400">Alhamdulillah, tidak ada santri bermasalah.</td>
                  </tr>
                )}
                {bermasalahUsers?.map((user, idx) => (
                  <tr key={idx} className="border-b border-slate-800/50 hover:bg-slate-800/30 transition-colors text-sm sm:text-base">
                    <td className="py-4 pl-2 sm:pl-4 text-rose-400 font-mono">{user.nim}</td>
                    <td className="py-4 font-medium text-white">{user.name}</td>
                    <td className="py-4 text-slate-400">{(user.groups as any)?.name || 'Unknown'}</td>
                    <td className="py-4 text-rose-400 font-bold">{alfaCountPerUser[user.id]} Hari</td>
                    <td className="py-4 pr-2 sm:pr-4">
                      <button className="px-3 py-1.5 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/20 rounded text-xs sm:text-sm font-medium transition-colors">
                        Panggil Sidang
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
