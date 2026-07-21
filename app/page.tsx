'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';

// Kết nối Supabase trực tiếp ở phía giao diện đọc log
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL as string,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY as string
);

export default function SystemLogsPage() {
  const [keyInput, setKeyInput] = useState('');
  const [currentKey, setCurrentKey] = useState('');
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  // Tự động quét xem trên URL có sẵn param ?key=... hay không khi vừa vào trang
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const urlKey = params.get('key');
    if (urlKey) {
      setKeyInput(urlKey);
      setCurrentKey(urlKey);
      fetchLogs(urlKey);
    }
  }, []);

  // Hàm gọi dữ liệu log từ Supabase theo Key bất kỳ
  const fetchLogs = async (targetKey: string) => {
    if (!targetKey.trim()) return;
    setLoading(true);
    
    const { data, error } = await supabase
      .from('system_logs')
      .select('*')
      .eq('key', targetKey.trim())
      .order('id', { ascending: false }) // Sắp xếp log mới nhất lên đầu
      .limit(100); // Lấy 100 log gần nhất

    if (!error && data) {
      setLogs(data);
    } else {
      setLogs([]);
    }
    setLoading(false);
  };

  // Xử lý khi bấm nút tra cứu hoặc nhấn Enter
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!keyInput.trim()) return;
    
    // Cập nhật lại URL ngầm bằng history.pushState để dễ copy link chia sẻ
    const newUrl = `${window.location.pathname}?key=${encodeURIComponent(keyInput.trim())}`;
    window.history.pushState({ path: newUrl }, '', newUrl);

    setCurrentKey(keyInput.trim());
    fetchLogs(keyInput.trim());
  };

  // Màn hình 1: Chưa có Key hoặc chưa nhập -> Hiện khung nhập Key
  if (!currentKey) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#0f172a', color: '#fff', fontFamily: 'sans-serif', padding: '15px' }}>
        <form onSubmit={handleSearch} style={{ background: '#1e293b', padding: '30px', borderRadius: '12px', boxShadow: '0 4px 20px rgba(0,0,0,0.5)', width: '100%', maxWidth: '420px' }}>
          <h2 style={{ marginBottom: '10px', fontSize: '20px', textAlign: 'center' }}>📊 Tra Cứu Nhật Ký Hệ Thống</h2>
          <p style={{ fontSize: '13px', color: '#94a3b8', marginBottom: '20px', textAlign: 'center' }}>Nhập mã Key (Ví dụ: <code style={{ color: '#38bdf8' }}>123456abc</code>) để xem lịch sử log.</p>
          
          <input 
            type="text" 
            placeholder="Nhập Key định danh của bạn..." 
            value={keyInput}
            onChange={(e) => setKeyInput(e.target.value)}
            style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #475569', background: '#0f172a', color: '#fff', marginBottom: '15px', outline: 'none', fontSize: '14px', boxSizing: 'border-box' }}
          />
          <button type="submit" style={{ width: '100%', padding: '12px', borderRadius: '8px', border: 'none', background: '#3b82f6', color: '#fff', fontWeight: 'bold', cursor: 'pointer', fontSize: '14px' }}>
            Xem Nhật Ký
          </button>
        </form>
      </div>
    );
  }

  // Màn hình 2: Đã có Key -> Hiển thị bảng danh sách 100 log mới nhất
  return (
    <div style={{ minHeight: '100vh', background: '#f8fafc', color: '#1e293b', fontFamily: 'sans-serif', padding: '20px' }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', background: '#fff', padding: '15px 20px', borderRadius: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', flexWrap: 'wrap', gap: '10px' }}>
          <div>
            <h1 style={{ fontSize: '18px', margin: 0 }}>📊 Nhật Ký Hoạt Động Hệ Thống</h1>
            <span style={{ fontSize: '13px', color: '#64748b' }}>Đang hiển thị dữ liệu của Key: <b style={{ color: '#0284c7' }}>{currentKey}</b></span>
          </div>
          <button 
            onClick={() => { setCurrentKey(''); setLogs([]); window.history.pushState({}, '', window.location.pathname); }}
            style={{ padding: '8px 14px', background: '#ef4444', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '13px' }}
          >
            Tra Cứu Key Khác
          </button>
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', padding: '40px', color: '#64748b' }}>Đang tải dữ liệu log...</div>
        ) : (
          <div style={{ background: '#fff', borderRadius: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '14px' }}>
              <thead>
                <tr style={{ background: '#f1f5f9', borderBottom: '1px solid #e2e8f0', color: '#475569' }}>
                  <th style={{ padding: '12px' }}>ID</th>
                  <th style={{ padding: '12px' }}>Hành Động (Actions)</th>
                  <th style={{ padding: '12px' }}>Chi Tiết Dữ Liệu (Values)</th>
                  <th style={{ padding: '12px' }}>Thời Gian</th>
                </tr>
              </thead>
              <tbody>
                {logs.length === 0 ? (
                  <tr>
                    <td colSpan={4} style={{ padding: '30px', textAlign: 'center', color: '#94a3b8' }}>Không tìm thấy dữ liệu log nào cho Key này.</td>
                  </tr>
                ) : (
                  logs.map((log) => (
                    <tr key={log.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                      <td style={{ padding: '12px', fontWeight: 'bold' }}>#{log.id}</td>
                      <td style={{ padding: '12px' }}>
                        <span style={{ padding: '4px 8px', background: '#e0f2fe', color: '#0369a1', borderRadius: '4px', fontSize: '12px', fontWeight: 'bold' }}>
                          {log.actions}
                        </span>
                      </td>
                      <td style={{ padding: '12px', fontFamily: 'monospace', fontSize: '12px', color: '#334155', maxWidth: '450px', wordBreak: 'break-all' }}>
                        {log.values ? JSON.stringify(log.values, null, 2) : '---'}
                      </td>
                      <td style={{ padding: '12px', color: '#64748b', fontSize: '13px', whiteSpace: 'nowrap' }}>
                        {log.created_at}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
