import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL, 
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export async function POST(request) {
  try {
    const body = await request.json();
    const { actions = 'nomal', key, values } = body;

    const { data, error } = await supabase
      .from('system_logs')
      .insert([{ actions, key, values }]);

    if (error) throw error;

    return NextResponse.json({ success: true, message: "Đã lưu log thành công!" });
  } catch (err) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}