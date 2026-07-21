'use client';
import { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';

// Khởi tạo Supabase client dùng key công khai
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!, 
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default function XemLog() {
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchLogs() {
      try {
        const { data, error } = await supabase
          .from('system_logs')
          .select('*')
          .order('created_at', { ascending: false })
          .limit(50);
        
        if (!error && data) {
          setLogs(data);
        }
      } catch (err) {
        console.error("Lỗi tải log:", err);
      } finally {
        setLoading(false); // Đảm bảo luôn tắt trạng thái đang tải dù thành công hay lỗi
      }
    }
    fetchLogs();
  }, []);

  return (
    <main style={{ padding: '30px', fontFamily: 'monospace', background: '#f9f9f9', minHeight: '100vh' }}>
      <h2>Hệ Thống Giám Sát Log Đám Mây (11pm)</h2>
      
      {loading ? (
        <p>Đang tải dữ liệu từ mây...</p>
      ) : (
        <table border={1} cellPadding={10} style={{ width: '100%', borderCollapse: 'collapse', marginTop: '20px', background: '#fff' }}>
          <thead>
            <tr style={{ background: '#333', color: '#fff' }}>
              <th>ID</th>
              <th>Thời gian</th>
              <th>Actions</th>
              <th>Key</th>
              <th>Values (JSON)</th>
            </tr>
          </thead>
          <tbody>
            {logs.length === 0 ? (
              <tr><td colSpan={5} style={{ textAlign: 'center' }}>Chưa có log nào.</td></tr>
            ) : (
              logs.map((log) => (
                <tr key={log.id}>
                  <td>{log.id}</td>
                  <td>{new Date(log.created_at).toLocaleString()}</td>
                  <td style={{ fontWeight: 'bold', color: 'blue' }}>{log.actions}</td>
                  <td>{log.key}</td>
                  <td>
                    <pre style={{ margin: 0, whiteSpace: 'pre-wrap' }}>
                      {typeof log.values === 'string' ? log.values : JSON.stringify(log.values, null, 2)}
                    </pre>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      )}
    </main>
  );
}