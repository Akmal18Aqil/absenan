import { createClient } from '@supabase/supabase-js';
import * as fs from 'fs';

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://example.supabase.co';
const SUPABASE_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'example';

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

async function check() {
  const { data, error } = await supabase.from('users').select('*').limit(1);
  console.log(JSON.stringify(data, null, 2));
  
  // also delete the 3 july seed ticket
  const { data: tickets } = await supabase.from('qadha_tickets').select('*');
  console.log("Tickets:", tickets);
  
  const { error: delErr } = await supabase.from('qadha_tickets').delete().eq('status', 'pending');
  console.log("Delete error:", delErr);
}

check();
