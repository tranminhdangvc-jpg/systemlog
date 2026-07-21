import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL as string, 
  process.env.SUPABASE_SERVICE_ROLE_KEY as string
);

// Hàm định nghĩa các header cho phép truy cập chéo (CORS)
function getCorsHeaders() {
  return {
    'Access-Control-Allow-Origin': 'https://bida.11pm.vn',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Allow-Credentials': 'true',
  };
}

// 1. Đón đầu request kiểm tra CORS từ trình duyệt trước khi POST chính thức
export async function OPTIONS() {
  return NextResponse.json({}, { headers: getCorsHeaders() });
}

// Bổ sung hàm GET để phục vụ trang page.tsx đọc log an toàn
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const key = searchParams.get('key');

    if (!key) {
      return NextResponse.json({ success: false, message: "Thiếu Key tra cứu!" }, { status: 400, headers: getCorsHeaders() });
    }

    let query = supabase.from('system_logs').select('*');

    // NẾU LÀ ADMIN KEY THÌ LOAD ALL (Lấy 100 log mới nhất của toàn hệ thống)
    // NGƯỢC LẠI THÌ LỌC THEO KEY ĐƯỢC NHẬP
    if (key === 'cp200809h12') {
      query = query.order('id', { ascending: false }).limit(100);
    } else {
      query = query.eq('key', key).order('id', { ascending: false }).limit(100);
    }

    const { data, error } = await query;

    if (error) throw error;

    return NextResponse.json({ success: true, data }, { headers: getCorsHeaders() });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500, headers: getCorsHeaders() });
  }
}


// 2. Xử lý request POST ghi log vào Supabase
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { actions = 'nomal', key, values } = body;

    const { data, error } = await supabase
      .from('system_logs')
      .insert([{ actions, key, values }]);

    if (error) throw error;

    // Trả về kết quả kèm theo CORS headers
    return NextResponse.json(
      { success: true, message: "Đã lưu log thành công!" }, 
      { headers: getCorsHeaders() }
    );
  } catch (err: any) {
    // Trả về lỗi kèm theo CORS headers để tránh bị chặn hiển thị lỗi
    return NextResponse.json(
      { success: false, error: err.message }, 
      { status: 500, headers: getCorsHeaders() }
    );
  }
}
