import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { type, entries, date } = body;

    // entries: array of { nim, status, type (alfiyah/juz_amma) }
    if (!entries || !Array.isArray(entries)) {
      return NextResponse.json({ error: 'Invalid entries' }, { status: 400 });
    }

    // 1. Map NIMs to user IDs
    const nims = entries.map(e => e.nim);
    const { data: users, error: userError } = await supabase
      .from('users')
      .select('id, nim')
      .in('nim', nims);

    if (userError) {
      console.error(userError);
      return NextResponse.json({ error: 'Database error fetching users' }, { status: 500 });
    }

    const userMap: Record<string, string> = {};
    if (users) {
      users.forEach((u: { id: string; nim: string }) => {
        userMap[u.nim] = u.id;
      });
    }

    const logsToInsert = entries.map(entry => {
      const userId = userMap[entry.nim];
      if (!userId) return null; // Skip if user not found
      return {
        user_id: userId,
        type: type || 'alfiyah',
        status: entry.status ? entry.status.toLowerCase() : 'alfa',
        notes: entry.notes || null,
        created_at: date ? new Date(date).toISOString() : new Date().toISOString()
      };
    }).filter((item): item is { user_id: string; type: string; status: string; notes: string | null; created_at: string } => item !== null);

    if (logsToInsert.length === 0) {
      return NextResponse.json({ success: true, inserted: 0, message: "No matching NIMs found in database" });
    }

    // In a real scenario, determine which table to insert to (hafalan_logs or lalaran_logs)
    const { error: insertError } = await supabase
      .from('hafalan_logs')
      .insert(logsToInsert);

    if (insertError) {
      console.error(insertError);
      return NextResponse.json({ error: 'Failed to insert logs' }, { status: 500 });
    }

    // Auto-generate Qadha tickets for Alfa/Izin
    const qadhaTickets = logsToInsert
      .filter(log => log.status === 'alfa' || log.status === 'izin')
      .map(log => ({
        user_id: log.user_id,
        reason: `${log.status === 'alfa' ? 'Alfa' : 'Izin'} setoran tanggal ${date || new Date().toISOString().split('T')[0]}`,
        status: 'pending',
        created_at: log.created_at
      }));

    if (qadhaTickets.length > 0) {
      const { error: qadhaError } = await supabase
        .from('qadha_tickets')
        .insert(qadhaTickets);
      
      if (qadhaError) {
        console.error("Failed to insert qadha tickets", qadhaError);
      }
    }

    return NextResponse.json({ success: true, inserted: logsToInsert.length, qadha_created: qadhaTickets.length });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
