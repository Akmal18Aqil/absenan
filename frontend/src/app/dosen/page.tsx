"use client";

import Link from 'next/link';
import { ArrowLeft, CheckCircle, XCircle, Clock } from 'lucide-react';
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

export default function DosenView() {
  const [queue, setQueue] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [hafalanType, setHafalanType] = useState<'alfiyah' | 'juz_amma'>('alfiyah');

  useEffect(() => {
    fetchQueue(hafalanType);
  }, [hafalanType]);

  const fetchQueue = async (type: string) => {
    setLoading(true);
    const { data, error } = await supabase
      .from('hafalan_logs')
      .select(`
        id,
        notes,
        type,
        users ( nim, name )
      `)
      .is('verified_by', null)
      .eq('type', type)
      .eq('status', 'setor');
      
    if (error) {
      console.error("Error fetching queue:", error);
    }
      
    if (data) {
      setQueue(data);
    }
    setLoading(false);
  };

  const handleVerify = async (logId: string, action: 'sah' | 'ulangi') => {
    // In a real app, use the logged in user's ID
    const { data: dosen } = await supabase.from('users').select('id').limit(1).single();
    
    if (action === 'sah' && dosen) {
      await supabase
        .from('hafalan_logs')
        .update({ verified_by: dosen.id })
        .eq('id', logId);
    } else {
      await supabase
        .from('hafalan_logs')
        .delete()
        .eq('id', logId);
    }
    
    setQueue(prev => prev.filter(q => q.id !== logId));
  };
  return (
    <div className="min-h-screen p-4 sm:p-6 max-w-5xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-8 sm:mb-10 gap-4">
        <div className="flex items-center gap-3 sm:gap-4">
          <Link href="/" className="p-2 rounded-full hover:bg-slate-800 transition-colors">
            <ArrowLeft className="w-5 h-5 sm:w-6 sm:h-6" />
          </Link>
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-white">Verifikasi Dosen</h1>
            <p className="text-sm sm:text-base text-slate-400">Ust. Akmal Aqil Wahyu - Pendamping Kelompok</p>
          </div>
        </div>
        <div className="self-start sm:self-auto sm:text-right">
          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs sm:text-sm font-medium bg-purple-500/10 text-purple-400 border border-purple-500/20">
            Setoran Mingguan (Kamis)
          </span>
        </div>
      </div>

      <div className="glass-panel p-4 sm:p-6 mb-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 sm:mb-6 gap-4">
          <h2 className="text-lg sm:text-xl font-semibold flex items-center gap-2">
            <Clock className="w-5 h-5 text-purple-400" />
            Antrean Verifikasi
          </h2>
          
          <div className="flex bg-slate-800/50 p-1 rounded-lg border border-slate-700 w-full sm:w-auto">
            <button 
              onClick={() => setHafalanType('alfiyah')}
              className={`flex-1 sm:flex-none px-4 py-2 rounded-md text-sm font-medium transition-all ${hafalanType === 'alfiyah' ? 'bg-purple-500 text-white shadow-md' : 'text-slate-400 hover:text-white'}`}
            >
              Alfiyah
            </button>
            <button 
              onClick={() => setHafalanType('juz_amma')}
              className={`flex-1 sm:flex-none px-4 py-2 rounded-md text-sm font-medium transition-all ${hafalanType === 'juz_amma' ? 'bg-purple-500 text-white shadow-md' : 'text-slate-400 hover:text-white'}`}
            >
              Juz 'Amma
            </button>
          </div>
        </div>
        
        <div className="space-y-4">
          {loading ? (
            <div className="text-center p-8 text-slate-400">Memuat data antrean...</div>
          ) : queue.length === 0 ? (
            <div className="text-center p-8 text-slate-400">Tidak ada antrean verifikasi saat ini.</div>
          ) : (
            queue.map((item) => (
              <div key={item.id} className="p-4 rounded-xl bg-slate-800/80 border border-slate-700/50 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 hover:border-purple-500/30 transition-colors">
                <div>
                  <div className="flex items-center gap-3 mb-1">
                    <span className="font-mono text-sm text-purple-400">{(item.users as any)?.nim}</span>
                    <span className="font-medium text-white text-lg">{(item.users as any)?.name}</span>
                  </div>
                  <div className="text-sm text-slate-400">Target: <span className="text-slate-300 font-medium">{item.notes}</span></div>
                </div>
                <div className="flex gap-2 w-full sm:w-auto mt-2 sm:mt-0">
                  <button 
                    onClick={() => handleVerify(item.id, 'sah')}
                    className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/20 rounded-lg text-sm font-medium transition-colors"
                  >
                    <CheckCircle className="w-4 h-4" />
                    Sah
                  </button>
                  <button 
                    onClick={() => handleVerify(item.id, 'ulangi')}
                    className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/20 rounded-lg text-sm font-medium transition-colors"
                  >
                    <XCircle className="w-4 h-4" />
                    Ulangi
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
