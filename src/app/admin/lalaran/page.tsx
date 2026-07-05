"use client";

import { useState, useRef, useEffect } from 'react';
import { Camera, Save, ArrowLeft, Loader2, FileDown } from 'lucide-react';
import Link from 'next/link';

import { supabase } from '@/lib/supabase';

export default function FastTrackPage() {
  const [rows, setRows] = useState<any[]>([]);
  const [isScanning, setIsScanning] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [focusedRowIndex, setFocusedRowIndex] = useState<number | null>(null);
  const [currentDate, setCurrentDate] = useState('');

  useEffect(() => {
    const today = new Date();
    // Adjust timezone to local, format YYYY-MM-DD
    const localDate = new Date(today.getTime() - (today.getTimezoneOffset() * 60000)).toISOString().split('T')[0];
    setCurrentDate(localDate);
    
    const fetchUsers = async () => {
      const { data: users, error } = await supabase
        .from('users')
        .select('id, name, nim, role, group_id')
        .order('nim', { ascending: true });
        
      if (users && !error) {
        const { data: logs } = await supabase
          .from('lalaran_logs')
          .select('user_id, status');
          
        setRows(users.map(user => ({
          id: user.id,
          nim: user.nim,
          name: user.name,
          status: ''
        })));
      }
    };
    
    fetchUsers();
  }, []);
  
  // Ref for the grid container to handle keyboard nav
  const gridRef = useRef<HTMLDivElement>(null);

  // Keyboard navigation logic
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (focusedRowIndex === null) return;
      
      switch (e.key) {
        case 'ArrowDown':
          e.preventDefault();
          setFocusedRowIndex(prev => prev! < rows.length - 1 ? prev! + 1 : prev);
          break;
        case 'ArrowUp':
          e.preventDefault();
          setFocusedRowIndex(prev => prev! > 0 ? prev! - 1 : prev);
          break;
        case ' ':
          // Spacebar cycles through status: Setor -> Alfa -> Izin -> (empty)
          e.preventDefault();
          setRows(prevRows => {
            const newRows = [...prevRows];
            const currentStatus = newRows[focusedRowIndex].status;
            let nextStatus = '';
            if (currentStatus === '') nextStatus = 'Setor';
            else if (currentStatus === 'Setor') nextStatus = 'Alfa';
            else if (currentStatus === 'Alfa') nextStatus = 'Izin';
            else nextStatus = '';
            
            newRows[focusedRowIndex].status = nextStatus;
            return newRows;
          });
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [focusedRowIndex, rows]);

  // Handle status toggle (Hadir / Alfa / Izin)
  const toggleStatus = (index: number, status: string) => {
    const newRows = [...rows];
    if (newRows[index].status === status) {
      newRows[index].status = '';
    } else {
      newRows[index].status = status;
    }
    setRows(newRows);
  };

  const simulateAIScan = async () => {
    setIsScanning(true);
    try {
      // Create a dummy form data to hit the actual API route
      const formData = new FormData();
      formData.append('image', new Blob(['fake image data']), 'image.jpg');

      const res = await fetch('/api/vision/scan', {
        method: 'POST',
        body: formData,
      });
      
      const result = await res.json();
      if (result.success && result.data.attendance) {
        // Map the mock data back to our rows
        const attendanceMap = new Map(result.data.attendance.map((a: { nim: string; status: string }) => [a.nim, a.status]));
        
        setRows(prevRows => prevRows.map(row => ({
          ...row,
          status: (attendanceMap.get(row.nim) as string) || row.status
        })));
      }
    } catch (e) {
      console.error(e);
      alert("Gagal memindai kertas.");
    } finally {
      setIsScanning(false);
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const response = await fetch('/api/entry/lalaran', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          group_id: 'group-A',
          type: 'alfiyah',
          date: currentDate,
          entries: rows.map(r => ({ nim: r.nim, status: r.status || 'Alfa' }))
        })
      });
      
      const result = await response.json();
      if (result.success) {
        alert("Data berhasil disimpan ke database!");
      } else {
        alert("Gagal menyimpan data: " + (result.error || result.message));
      }
    } catch {
      alert("Terjadi kesalahan jaringan.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="min-h-screen p-4 sm:p-6 max-w-6xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center mb-6 sm:mb-8 gap-3 sm:gap-4">
        <Link href="/" className="self-start p-2 rounded-full hover:bg-slate-800 transition-colors shrink-0">
          <ArrowLeft className="w-5 h-5 sm:w-6 sm:h-6" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-white mb-2">Presensi Lalaran</h1>
          <p className="text-slate-400 text-sm">Input cepat kehadiran lalaran santri</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
        <div className="space-y-4">
          <div className="glass-panel p-4 sm:p-6">
            <h2 className="text-lg sm:text-xl font-semibold mb-3 sm:mb-4 border-b border-slate-700 pb-2">AI Scanner</h2>
            <p className="text-xs sm:text-sm text-slate-400 mb-4 sm:mb-6">
              Pindai Printable Weekly Grid menggunakan kamera untuk mengekstraksi data secara otomatis menggunakan Vision API.
            </p>
            <button 
              onClick={simulateAIScan}
              disabled={isScanning}
              className="w-full bg-emerald-600 hover:bg-emerald-500 disabled:bg-slate-700 text-white font-medium py-3 px-4 rounded-lg flex items-center justify-center gap-2 transition-colors active:scale-95"
            >
              {isScanning ? <Loader2 className="w-5 h-5 animate-spin" /> : <Camera className="w-5 h-5" />}
              {isScanning ? 'Memindai Kertas...' : 'Pindai Kertas Absen'}
            </button>
          </div>

          <div className="glass-panel p-4 sm:p-6 bg-blue-900/10 border-blue-900/30 hidden sm:block">
            <h3 className="font-semibold text-blue-400 mb-2">Panduan Keyboard ⌨️</h3>
            <ul className="text-sm text-slate-300 space-y-2">
              <li><kbd className="bg-slate-800 px-2 py-1 rounded text-xs">↑</kbd> <kbd className="bg-slate-800 px-2 py-1 rounded text-xs">↓</kbd> Navigasi baris</li>
              <li><kbd className="bg-slate-800 px-2 py-1 rounded text-xs">Spacebar</kbd> Ubah status (Hadir/Alfa/Izin)</li>
            </ul>
          </div>
        </div>

        <div className="lg:col-span-2 glass-panel overflow-hidden flex flex-col">
          <div className="p-3 sm:p-4 bg-slate-800/50 border-b border-slate-700 flex flex-wrap gap-3 justify-between items-center">
            <div className="flex items-center gap-2">
              <span className="text-xs sm:text-sm font-medium text-slate-300">Tanggal:</span>
              <input 
                type="date"
                value={currentDate}
                onChange={(e) => setCurrentDate(e.target.value)}
                className="bg-slate-900 border border-slate-700 text-slate-300 text-sm rounded-md px-2 py-1 focus:outline-none focus:border-blue-500"
              />
            </div>
            <button 
              onClick={handleSave}
              disabled={isSaving}
              className="w-full sm:w-auto bg-blue-600 hover:bg-blue-500 disabled:bg-slate-700 text-white px-4 py-2.5 sm:py-2 rounded-md flex items-center justify-center gap-2 transition-colors text-sm font-medium active:scale-95"
            >
              {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              Submit Data
            </button>
          </div>
          
          <div className="overflow-hidden">
            <div className="block md:hidden p-4 space-y-4">
              {rows.map((row, idx) => (
                <div key={row.id} className="bg-slate-800/50 p-4 rounded-xl border border-slate-700/50">
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <div className="font-medium text-white text-lg">{row.name}</div>
                      <div className="text-purple-400 font-mono text-sm">{row.nim}</div>
                    </div>
                  </div>
                  <div className="grid grid-cols-3 gap-2 mt-4">
                    <button onClick={() => toggleStatus(idx, 'Hadir')} className={`py-2 rounded-lg text-sm font-medium transition-colors ${row.status === 'Hadir' ? 'bg-emerald-500 text-white' : 'bg-slate-700 text-slate-300 hover:bg-slate-600'}`}>Hadir</button>
                    <button onClick={() => toggleStatus(idx, 'Alfa')} className={`py-2 rounded-lg text-sm font-medium transition-colors ${row.status === 'Alfa' ? 'bg-rose-500 text-white' : 'bg-slate-700 text-slate-300 hover:bg-slate-600'}`}>Alfa</button>
                    <button onClick={() => toggleStatus(idx, 'Izin')} className={`py-2 rounded-lg text-sm font-medium transition-colors ${row.status === 'Izin' ? 'bg-amber-500 text-white' : 'bg-slate-700 text-slate-300 hover:bg-slate-600'}`}>Izin</button>
                  </div>
                </div>
              ))}
            </div>

            <div className="hidden md:block overflow-x-auto p-4" ref={gridRef}>
              <table className="w-full text-left border-collapse min-w-[500px]">
                <thead>
                  <tr className="text-slate-400 text-xs sm:text-sm border-b border-slate-700">
                    <th className="pb-3 pl-2 sm:pl-4">NIM</th>
                    <th className="pb-3">Nama Santri</th>
                    <th className="pb-3 pr-2 sm:pr-4">Status Kehadiran</th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map((row, idx) => (
                    <tr 
                      key={row.id}
                      onClick={() => setFocusedRowIndex(idx)}
                      className={`cursor-pointer border-b border-slate-800 transition-colors ${focusedRowIndex === idx ? 'bg-blue-900/30 ring-1 ring-blue-500 outline-none' : 'hover:bg-slate-800/30'}`}
                      tabIndex={0}
                    >
                      <td className="py-4 sm:py-3 pl-2 sm:pl-4 text-slate-300 font-mono text-xs sm:text-sm">{row.nim}</td>
                      <td className="py-4 sm:py-3 font-medium text-sm sm:text-base">{row.name}</td>
                      <td className="py-4 sm:py-3 pr-2 sm:pr-4">
                        <div className="flex gap-2">
                          <button 
                            onClick={(e) => { e.stopPropagation(); toggleStatus(idx, 'Hadir'); }}
                            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${row.status === 'Hadir' ? 'bg-emerald-500 text-white' : 'bg-slate-800 text-slate-400 hover:bg-slate-700'}`}
                          >Hadir</button>
                          <button 
                            onClick={(e) => { e.stopPropagation(); toggleStatus(idx, 'Alfa'); }}
                            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${row.status === 'Alfa' ? 'bg-rose-500 text-white' : 'bg-slate-800 text-slate-400 hover:bg-slate-700'}`}
                          >Alfa</button>
                          <button 
                            onClick={(e) => { e.stopPropagation(); toggleStatus(idx, 'Izin'); }}
                            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${row.status === 'Izin' ? 'bg-amber-500 text-white' : 'bg-slate-800 text-slate-400 hover:bg-slate-700'}`}
                          >Izin</button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
