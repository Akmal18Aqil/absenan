import { Book, AlertTriangle, Calendar, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import { UserSwitcher } from '@/components/UserSwitcher';
import { QadhaButton } from '@/components/QadhaButton';

export default async function MahasantriDashboard(props: { searchParams: Promise<{ nim?: string }> }) {
  const searchParams = await props.searchParams;
  const currentNim = searchParams.nim || '2001';

  // Fetch all users for switcher
  const { data: allUsers } = await supabase.from('users').select('nim, name').order('nim');
  
  // Fetch specific user
  const { data: users } = await supabase.from('users').select('*').eq('nim', currentNim).single();
  const user = users;

  if (!user) return <div className="p-10 text-white">User not found</div>;

  // Fetch hafalan count from latest notes (even if not yet verified)
  const { data: latestVerifiedLogs } = await supabase
    .from('hafalan_logs')
    .select('notes')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })
    .limit(1);

  let hafalanCount = 0;
  const latestVerifiedLog = latestVerifiedLogs?.[0];
  if (latestVerifiedLog?.notes) {
    const match = latestVerifiedLog.notes.match(/Nazam \d+-(\d+)/i) || latestVerifiedLog.notes.match(/Nazam (\d+)/i);
    if (match && match[1]) {
      hafalanCount = parseInt(match[1]);
    }
  }

  // Fetch qadha tickets
  const { data: qadhaTickets } = await supabase
    .from('qadha_tickets')
    .select('*')
    .eq('user_id', user.id)
    .eq('status', 'pending');

  // Fetch setoran history (last 5)
  const { data: setoranLogs } = await supabase
    .from('hafalan_logs')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })
    .limit(5);

  // Fetch lalaran history (last 5)
  const { data: lalaranLogs } = await supabase
    .from('lalaran_logs')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })
    .limit(5);

  // Fetch latest juz amma log
  const { data: juzAmmaLogs } = await supabase
    .from('hafalan_logs')
    .select('notes')
    .eq('user_id', user.id)
    .eq('type', 'juz_amma')
    .order('created_at', { ascending: false })
    .limit(1);
    
  const latestJuzAmma = juzAmmaLogs?.[0]?.notes || 'Belum Ada Data';

  const progress = Math.min(100, ((hafalanCount || 0) / 750) * 100);
  return (
    <div className="min-h-screen p-4 sm:p-6 max-w-5xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-8 sm:mb-10 gap-4">
        <div className="flex items-center gap-3 sm:gap-4">
          <Link href="/" className="p-2 rounded-full hover:bg-slate-800 transition-colors">
            <ArrowLeft className="w-5 h-5 sm:w-6 sm:h-6" />
          </Link>
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-white">Dashboard Mahasantri</h1>
            <p className="text-sm sm:text-base text-slate-400">{user.name} - NIM: {user.nim}</p>
          </div>
        </div>
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 w-full">
          <div>
            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs sm:text-sm font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 mb-2 sm:mb-0">
              Aktif
            </span>
          </div>
          <UserSwitcher users={allUsers || []} currentNim={currentNim} />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6 mb-6 sm:mb-8">
        <div className="glass-panel p-4 sm:p-6 border-l-4 border-l-blue-500">
          <div className="flex justify-between items-start mb-3 sm:mb-4">
            <div>
              <p className="text-xs sm:text-sm text-slate-400 font-medium">Progres Alfiyah</p>
              <h3 className="text-xl sm:text-2xl font-bold text-white mt-1">{hafalanCount || 0} <span className="text-xs sm:text-sm font-normal text-slate-400">/ 750 Nazam</span></h3>
            </div>
            <div className="bg-blue-500/20 p-2 sm:p-3 rounded-lg">
              <Book className="w-4 h-4 sm:w-5 sm:h-5 text-blue-400" />
            </div>
          </div>
          <div className="w-full bg-slate-800 rounded-full h-2">
            <div className="bg-blue-500 h-2 rounded-full" style={{ width: `${progress}%` }}></div>
          </div>
        </div>

        <div className="glass-panel p-4 sm:p-6 border-l-4 border-l-purple-500">
          <div className="flex justify-between items-start mb-3 sm:mb-4">
            <div>
              <p className="text-xs sm:text-sm text-slate-400 font-medium">Progres Juz &apos;Amma</p>
              <h3 className="text-xl sm:text-2xl font-bold text-white mt-1 capitalize">{latestJuzAmma}</h3>
            </div>
            <div className="bg-purple-500/20 p-2 sm:p-3 rounded-lg">
              <Book className="w-4 h-4 sm:w-5 sm:h-5 text-purple-400" />
            </div>
          </div>

        </div>

        <div className="glass-panel p-4 sm:p-6 border-l-4 border-l-rose-500">
          <div className="flex justify-between items-start mb-2">
            <div>
              <p className="text-xs sm:text-sm text-slate-400 font-medium">Tagihan Qadha</p>
              <h3 className="text-xl sm:text-2xl font-bold text-white mt-1">{qadhaTickets?.length || 0} <span className="text-xs sm:text-sm font-normal text-slate-400">Tiket</span></h3>
            </div>
            <div className="bg-rose-500/20 p-2 sm:p-3 rounded-lg">
              <AlertTriangle className="w-4 h-4 sm:w-5 sm:h-5 text-rose-400" />
            </div>
          </div>
          <p className="text-xs sm:text-sm text-rose-400 mt-2">Segera lunasi hutang lalaran Anda!</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8">
        <div className="glass-panel p-4 sm:p-6">
          <h2 className="text-lg sm:text-xl font-semibold mb-4 sm:mb-6 flex items-center gap-2">
            <Calendar className="w-5 h-5 text-blue-400" />
            Riwayat Setoran (Minggu Ini)
          </h2>
          <div className="space-y-4">
            {(setoranLogs?.length === 0) && (
              <div className="text-slate-400 text-sm p-4 text-center bg-slate-800/50 rounded-lg border border-slate-700/50">Belum ada riwayat setoran.</div>
            )}
            {(setoranLogs || []).map((item, i) => {
              const date = new Date(item.created_at);
              const day = date.toLocaleDateString('id-ID', { weekday: 'short' });
              const dateStr = date.toLocaleDateString('id-ID', { day: '2-digit', month: 'short' });
              return (
              <div key={item.id || i} className="flex items-center justify-between p-3 rounded-lg bg-slate-800/50 border border-slate-700/50">
                <div className="flex items-center gap-4">
                  <div className="w-12 text-center">
                    <div className="text-xs text-slate-400 uppercase">{day}</div>
                    <div className="font-semibold">{dateStr}</div>
                  </div>
                  <div className="h-8 w-px bg-slate-700"></div>
                  <div>
                    <div className="font-medium text-sm capitalize">{item.notes || 'Tidak ada capaian'}</div>
                  </div>
                </div>
                <div>
                  <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium capitalize
                    ${item.status === 'setor' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : ''}
                    ${item.status === 'alfa' ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20' : ''}
                    ${item.status === 'izin' ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20' : ''}
                  `}>
                    {item.status}
                  </span>
                </div>
              </div>
            )})}
          </div>
          
          <h2 className="text-lg sm:text-xl font-semibold mb-4 sm:mb-6 mt-8 flex items-center gap-2">
            <Calendar className="w-5 h-5 text-emerald-400" />
            Riwayat Lalaran (Minggu Ini)
          </h2>
          <div className="space-y-4">
            {(lalaranLogs?.length === 0) && (
              <div className="text-slate-400 text-sm p-4 text-center bg-slate-800/50 rounded-lg border border-slate-700/50">Belum ada riwayat lalaran.</div>
            )}
            {(lalaranLogs || []).map((item, i) => {
              const date = new Date(item.created_at);
              const day = date.toLocaleDateString('id-ID', { weekday: 'short' });
              const dateStr = date.toLocaleDateString('id-ID', { day: '2-digit', month: 'short' });
              return (
              <div key={item.id || i} className="flex items-center justify-between p-3 rounded-lg bg-slate-800/50 border border-slate-700/50">
                <div className="flex items-center gap-4">
                  <div className="w-12 text-center">
                    <div className="text-xs text-slate-400 uppercase">{day}</div>
                    <div className="font-semibold">{dateStr}</div>
                  </div>
                  <div className="h-8 w-px bg-slate-700"></div>
                  <div>
                    <div className="font-medium text-sm capitalize">Lalaran Mingguan</div>
                  </div>
                </div>
                <div>
                  <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium capitalize
                    ${item.status === 'hadir' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : ''}
                    ${item.status === 'alfa' ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20' : ''}
                    ${item.status === 'izin' ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20' : ''}
                  `}>
                    {item.status}
                  </span>
                </div>
              </div>
            )})}
          </div>
        </div>

        <div className="glass-panel p-6 border border-rose-900/30 bg-rose-900/5 relative overflow-hidden">
          <div className="absolute top-0 right-0 p-32 bg-rose-500/5 rounded-full blur-3xl -z-10 -mr-16 -mt-16"></div>
          <h2 className="text-xl font-semibold mb-6 flex items-center gap-2 text-rose-200">
            <AlertTriangle className="w-5 h-5 text-rose-400" />
            Tiket Wajib Qadha
          </h2>
          <div className="space-y-4">
            {qadhaTickets?.length === 0 && (
              <div className="text-slate-400 text-sm p-4 text-center">Tidak ada tagihan qadha.</div>
            )}
            {qadhaTickets?.map((ticket, i) => (
              <div key={ticket.id || i} className="p-4 rounded-xl bg-slate-800/80 border border-rose-500/20 flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
                <div>
                  <div className="text-rose-400 font-medium mb-1">{ticket.reason}</div>
                  <div className="text-sm text-slate-400">{new Date(ticket.created_at).toLocaleDateString('id-ID', { dateStyle: 'full' })}</div>
                </div>
                <QadhaButton ticketId={ticket.id} />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
