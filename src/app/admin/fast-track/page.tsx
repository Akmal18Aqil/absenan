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
        // Fetch hafalan logs to count totals
        const { data: logs } = await supabase
          .from('hafalan_logs')
          .select('user_id, notes');
          
        const counts = (logs || []).reduce((acc: any, log: any) => {
          let max = 0;
          if (log.notes) {
            const m = log.notes.match(/Nazam \d+-(\d+)/i) || log.notes.match(/Nazam (\d+)/i);
            if (m && m[1]) max = parseInt(m[1]);
          }
          if (max > (acc[log.user_id] || 0)) {
            acc[log.user_id] = max;
          }
          return acc;
        }, {});

        setRows(users.map(user => ({
          id: user.id,
          nim: user.nim,
          name: user.name,
          setorAmount: 5,
          totalHafalan: counts[user.id] || 0,
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
      const response = await fetch('/api/entry/fast-track', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          group_id: 'group-A',
          type: 'alfiyah',
          date: currentDate,
          entries: rows.map(r => {
            const notes = r.status === 'Setor' ? `Nazam ${r.totalHafalan + 1}-${r.totalHafalan + r.setorAmount}` : (r.status || 'Alfa');
            return { nim: r.nim, status: r.status || 'Alfa', notes };
          })
        }),
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
          <h1 className="text-2xl sm:text-3xl font-bold text-white">Fast-Track Data Entry</h1>
          <p className="text-sm sm:text-base text-slate-400">Modul Alfiyah - Kelompok Ust Akmal Aqil Wahyu</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
        {/* Left Column: Tools */}
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

          <div className="glass-panel p-4 sm:p-6">
            <h2 className="text-lg sm:text-xl font-semibold mb-3 sm:mb-4 border-b border-slate-700 pb-2">Generate Grid</h2>
            <button className="w-full bg-slate-800 hover:bg-slate-700 text-white font-medium py-3 px-4 rounded-lg flex items-center justify-center gap-2 transition-colors active:scale-95">
              <FileDown className="w-5 h-5" />
              <span className="truncate">Download Template PDF</span>
            </button>
          </div>
          
          <div className="glass-panel p-4 sm:p-6 bg-blue-900/10 border-blue-900/30 hidden sm:block">
            <h3 className="font-semibold text-blue-400 mb-2">Panduan Keyboard ⌨️</h3>
            <ul className="text-sm text-slate-300 space-y-2">
              <li><kbd className="bg-slate-800 px-2 py-1 rounded text-xs">↑</kbd> <kbd className="bg-slate-800 px-2 py-1 rounded text-xs">↓</kbd> Navigasi baris</li>
              <li><kbd className="bg-slate-800 px-2 py-1 rounded text-xs">Spacebar</kbd> Ubah status (Setor/Alfa/Izin)</li>
              <li>Klik pada baris untuk mulai.</li>
            </ul>
          </div>
        </div>

        {/* Right Column: Spreadsheet Grid */}
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
            {/* Mobile View: Cards */}
            <div className="block md:hidden p-4 space-y-4">
              {rows.map((row, idx) => (
                <div key={row.id} className="bg-slate-800/50 p-4 rounded-xl border border-slate-700/50">
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <div className="font-medium text-white text-lg">{row.name}</div>
                      <div className="text-purple-400 font-mono text-sm">{row.nim}</div>
                      <div className="text-slate-400 text-xs mt-1 flex items-center gap-2">
                        Total Hafalan: 
                        <input 
                          type="number"
                          value={row.totalHafalan}
                          onChange={(e) => {
                            const val = parseInt(e.target.value) || 0;
                            const newRows = [...rows];
                            newRows[idx].totalHafalan = val;
                            setRows(newRows);
                          }}
                          className="bg-slate-900 border border-slate-700 rounded w-16 text-center text-white px-1 py-0.5 focus:outline-none"
                        />
                        Nazam
                      </div>
                    </div>
                    <div className="w-32 flex items-center bg-slate-900 border border-slate-700 rounded-lg overflow-hidden">
                      <button 
                        onClick={() => {
                          const newRows = [...rows];
                          newRows[idx].setorAmount = Math.max(1, newRows[idx].setorAmount - 1);
                          setRows(newRows);
                        }}
                        className="px-3 py-1.5 text-slate-400 hover:bg-slate-800 hover:text-white transition-colors"
                      >-</button>
                      <input 
                        type="number" 
                        value={row.setorAmount}
                        onChange={(e) => {
                          const val = parseInt(e.target.value) || 0;
                          const newRows = [...rows];
                          newRows[idx].setorAmount = val;
                          setRows(newRows);
                        }}
                        className="w-full bg-transparent text-center text-sm text-white focus:outline-none appearance-none"
                      />
                      <button 
                        onClick={() => {
                          const newRows = [...rows];
                          newRows[idx].setorAmount += 1;
                          setRows(newRows);
                        }}
                        className="px-3 py-1.5 text-slate-400 hover:bg-slate-800 hover:text-white transition-colors"
                      >+</button>
                    </div>
                  </div>
                  <div className="flex gap-2 mt-4">
                    <button 
                      onClick={() => {
                        const newRows = [...rows];
                        newRows[idx].status = 'Setor';
                        setRows(newRows);
                      }}
                      className={`flex-1 py-2 rounded-lg text-sm font-medium transition-colors ${row.status === 'Setor' ? 'bg-emerald-500 text-white' : 'bg-slate-700 text-slate-300 hover:bg-slate-600'}`}
                    >
                      Setor
                    </button>
                    <button 
                      onClick={() => {
                        const newRows = [...rows];
                        newRows[idx].status = 'Alfa';
                        setRows(newRows);
                      }}
                      className={`flex-1 py-2 rounded-lg text-sm font-medium transition-colors ${row.status === 'Alfa' ? 'bg-rose-500 text-white' : 'bg-slate-700 text-slate-300 hover:bg-slate-600'}`}
                    >
                      Alfa
                    </button>
                    <button 
                      onClick={() => {
                        const newRows = [...rows];
                        newRows[idx].status = 'Izin';
                        setRows(newRows);
                      }}
                      className={`flex-1 py-2 rounded-lg text-sm font-medium transition-colors ${row.status === 'Izin' ? 'bg-amber-500 text-white' : 'bg-slate-700 text-slate-300 hover:bg-slate-600'}`}
                    >
                      Izin
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Desktop View: Table */}
            <div className="hidden md:block overflow-x-auto p-4" ref={gridRef}>
              <table className="w-full text-left border-collapse min-w-[500px]">
                <thead>
                  <tr className="text-slate-400 text-xs sm:text-sm border-b border-slate-700">
                    <th className="pb-3 pl-2 sm:pl-4">NIM</th>
                    <th className="pb-3">Nama Santri</th>
                    <th className="pb-3">Total Hafalan</th>
                    <th className="pb-3">Setor (Jml Nazam)</th>
                    <th className="pb-3 pr-2 sm:pr-4">Status</th>
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
                      <td className="py-4 sm:py-3 text-xs sm:text-sm">
                        <div className="flex items-center gap-1">
                          <input 
                            type="number"
                            value={row.totalHafalan}
                            onChange={(e) => {
                              const val = parseInt(e.target.value) || 0;
                              const newRows = [...rows];
                              newRows[idx].totalHafalan = val;
                              setRows(newRows);
                            }}
                            onClick={(e) => e.stopPropagation()}
                            className="bg-slate-900 border border-slate-700 rounded-md w-16 text-center text-white px-1 py-1 focus:outline-none"
                          />
                          <span className="text-slate-500">Nazam</span>
                        </div>
                      </td>
                      <td className="py-4 sm:py-3 text-xs sm:text-sm">
                        <div className="w-28 flex items-center bg-slate-900 border border-slate-700 rounded-lg overflow-hidden">
                          <button 
                            onClick={(e) => {
                              e.stopPropagation();
                              const newRows = [...rows];
                              newRows[idx].setorAmount = Math.max(1, newRows[idx].setorAmount - 1);
                              setRows(newRows);
                            }}
                            className="px-2 py-1 text-slate-400 hover:bg-slate-800 hover:text-white transition-colors"
                          >-</button>
                          <input 
                            type="number" 
                            value={row.setorAmount}
                            onChange={(e) => {
                              const val = parseInt(e.target.value) || 0;
                              const newRows = [...rows];
                              newRows[idx].setorAmount = val;
                              setRows(newRows);
                            }}
                            onClick={(e) => e.stopPropagation()}
                            className="w-full bg-transparent text-center text-sm text-white focus:outline-none appearance-none"
                          />
                          <button 
                            onClick={(e) => {
                              e.stopPropagation();
                              const newRows = [...rows];
                              newRows[idx].setorAmount += 1;
                              setRows(newRows);
                            }}
                            className="px-2 py-1 text-slate-400 hover:bg-slate-800 hover:text-white transition-colors"
                          >+</button>
                        </div>
                      </td>
                      <td className="py-4 sm:py-3 pr-2 sm:pr-4">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium
                          ${row.status === 'Setor' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : ''}
                          ${row.status === 'Alfa' ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20' : ''}
                          ${row.status === 'Izin' ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20' : ''}
                          ${row.status === '' ? 'bg-slate-800 text-slate-500' : ''}
                        `}>
                          {row.status || 'Kosong (Klik Spasi)'}
                        </span>
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
