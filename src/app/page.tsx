import Link from 'next/link';
import { BookOpen, Users, LayoutDashboard, ScanLine } from 'lucide-react';

export default function Home() {
  return (
    <div className="min-h-screen p-4 sm:p-8 md:p-20 flex flex-col items-center justify-center">
      <header className="mb-10 sm:mb-16 text-center">
        <h1 className="text-3xl sm:text-5xl md:text-6xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-emerald-400 mb-3 sm:mb-4 drop-shadow-sm px-2">
          Ma&apos;had Aly An-Nur II
        </h1>
        <p className="text-base sm:text-lg text-slate-300 max-w-2xl mx-auto font-light px-4">
          Sistem Manajemen Hafalan & Lalaran Digital. Integrasi hybrid presensi fisik dan entri data kilat menggunakan AI Vision.
        </p>
      </header>

      <div className="hidden sm:grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 w-full max-w-5xl px-2">
        
        <Link href="/mahasantri" className="group">
          <div className="glass-panel p-8 h-full flex flex-col items-center justify-center text-center hover:bg-slate-800/50 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-blue-900/20 cursor-pointer">
            <div className="bg-blue-500/20 p-4 rounded-full mb-6 group-hover:scale-110 transition-transform duration-300 group-hover:bg-blue-500/30">
              <BookOpen className="w-8 h-8 text-blue-400" />
            </div>
            <h2 className="text-2xl font-semibold mb-2">Portal Mahasantri</h2>
            <p className="text-slate-400 text-sm">Cek progres hafalan, status alfa, dan tagihan qadha harian.</p>
          </div>
        </Link>

        <Link href="/admin/fast-track" className="group">
          <div className="glass-panel p-8 h-full flex flex-col items-center justify-center text-center hover:bg-slate-800/50 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-emerald-900/20 cursor-pointer">
            <div className="bg-emerald-500/20 p-4 rounded-full mb-6 group-hover:scale-110 transition-transform duration-300 group-hover:bg-emerald-500/30">
              <ScanLine className="w-8 h-8 text-emerald-400" />
            </div>
            <h2 className="text-2xl font-semibold mb-2">Presensi Setoran</h2>
            <p className="text-slate-400 text-sm">Pindai kertas presensi setoran ketua kelompok dan input data secepat kilat dengan keyboard.</p>
          </div>
        </Link>

        <Link href="/admin/lalaran" className="group">
          <div className="glass-panel p-8 h-full flex flex-col items-center justify-center text-center hover:bg-slate-800/50 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-emerald-900/20 cursor-pointer">
            <div className="bg-emerald-500/20 p-4 rounded-full mb-6 group-hover:scale-110 transition-transform duration-300 group-hover:bg-emerald-500/30">
              <ScanLine className="w-8 h-8 text-emerald-400" />
            </div>
            <h2 className="text-2xl font-semibold mb-2">Presensi Lalaran</h2>
            <p className="text-slate-400 text-sm">Input cepat kehadiran lalaran santri dengan keyboard.</p>
          </div>
        </Link>

        <Link href="/dosen" className="group">
          <div className="glass-panel p-8 h-full flex flex-col items-center justify-center text-center hover:bg-slate-800/50 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-purple-900/20 cursor-pointer">
            <div className="bg-purple-500/20 p-4 rounded-full mb-6 group-hover:scale-110 transition-transform duration-300 group-hover:bg-purple-500/30">
              <Users className="w-8 h-8 text-purple-400" />
            </div>
            <h2 className="text-2xl font-semibold mb-2">Verifikasi Dosen</h2>
            <p className="text-slate-400 text-sm">Dashboard pendamping untuk verifikasi setoran mingguan (Kamis) dan evaluasi.</p>
          </div>
        </Link>

        <Link href="/laporan" className="group">
          <div className="glass-panel p-8 h-full flex flex-col items-center justify-center text-center hover:bg-slate-800/50 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-orange-900/20 cursor-pointer">
            <div className="bg-orange-500/20 p-4 rounded-full mb-6 group-hover:scale-110 transition-transform duration-300 group-hover:bg-orange-500/30">
              <LayoutDashboard className="w-8 h-8 text-orange-400" />
            </div>
            <h2 className="text-2xl font-semibold mb-2">Laporan Analitik</h2>
            <p className="text-slate-400 text-sm">Akses rekapitulasi data untuk PJ Hafalan, Wali Kelas, dan Bidang Kurikulum.</p>
          </div>
        </Link>
        
      </div>
    </div>
  );
}
