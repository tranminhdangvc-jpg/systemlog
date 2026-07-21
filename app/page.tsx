'use client';

import { useState, useEffect } from 'react';

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
      fetchLogsFromApi(urlKey);
    }
  }, []);

  // Gọi API Backend trên Vercel để lấy log (Tránh bị chặn bởi RLS của Supabase)
  const fetchLogsFromApi = async (targetKey: string) => {
    if (!targetKey.trim()) return;
    setLoading(true);

    try {
      const response = await fetch(`/api/log?key=${encodeURIComponent(targetKey.trim())}`, {
        method: 'GET',
      });
      const result = await response.json();

      if (result.success && result.data) {
        setLogs(result.data);
      } else {
        setLogs([]);
      }
    } catch (err) {
      setLogs([]);
    }
    setLoading(false);
  };

  // Xử lý khi bấm nút tra cứu hoặc nhấn Enter
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!keyInput.trim()) return;
    
    const cleanKey = keyInput.trim();
    const newUrl = `${window.location.pathname}?key=${encodeURIComponent(cleanKey)}`;
    window.history.pushState({ path: newUrl }, '', newUrl);

    setCurrentKey(cleanKey);
    fetchLogsFromApi(cleanKey);
  };

  // Màn hình 1: Chưa có Key -> Hiện khung nhập
  if (!currentKey) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#0f172a', color: '#fff', fontFamily: 'sans-serif', padding: '15px' }}>
        <form onSubmit={handleSearch} style={{ background: '#1e293b', padding: '30px', borderRadius: '12px', boxShadow: '0 4px 20px rgba(0,0,0,0.5)', width: '100%', maxWidth: '420px' }}>
          <h2 style={{ marginBottom: '10px', fontSize: '20px', textAlign: 'center' }}>Tra cứu nhật ký từ điện toán đám mây</h2>
          <p style={{ fontSize: '13px', color: '#94a3b8', marginBottom: '20px', textAlign: 'center' }}>Nhập Key của bạn, được cấp độc quyền tại 11pm.</p>
          
          <input 
            type="text" 
            placeholder="Nhập Key định danh của 11pm" 
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

  // Màn hình 2: Đã có Key -> Hiển thị bảng
  return (
    <div style={{ minHeight: '100vh', background: '#f8fafc', color: '#1e293b', fontFamily: 'sans-serif', padding: '20px' }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', background: '#fff', padding: '15px 20px', borderRadius: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', flexWrap: 'wrap', gap: '10px' }}>
          <div>
            <h1 style={{ fontSize: '18px', margin: 0 }}>Nhật ký từ điện toán đám mây</h1>
            <span style={{ fontSize: '13px', color: '#64748b' }}>
              {currentKey === 'cp200809h12' ? (
                <b style={{ color: '#ef4444' }}>⚡ Chế độ ADMIN: Đang xem toàn bộ hệ thống (Load All)</b>
              ) : (
                <>Đang xem dữ liệu của Key: <b style={{ color: '#0284c7' }}>{currentKey}</b></>
              )}
            </span>
          </div>
          <button 
            onClick={() => { setCurrentKey(''); setLogs([]); window.history.pushState({}, '', window.location.pathname); }}
            style={{ padding: '8px 14px', background: '#ef4444', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '13px' }}
          >
            Quay lại nhập key
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
                  <th style={{ padding: '12px' }}>Key Chủ Sở Hữu</th>
                  <th style={{ padding: '12px' }}>Hành Động (Actions)</th>
                  <th style={{ padding: '12px' }}>Chi Tiết Dữ Liệu (Values)</th>
                  <th style={{ padding: '12px' }}>Thời Gian (trên cloud)</th>
                </tr>
              </thead>
              <tbody>
                {logs.length === 0 ? (
                  <tr>
                    <td colSpan={5} style={{ padding: '30px', textAlign: 'center', color: '#94a3b8' }}>Không tìm thấy dữ liệu log nào.</td>
                  </tr>
                ) : (
                  logs.map((log) => (
                    <tr key={log.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                      <td style={{ padding: '12px', fontWeight: 'bold' }}>#{log.id}</td>
                      <td style={{ padding: '12px', color: '#0284c7', fontWeight: '600' }}>{log.key}</td>
                      <td style={{ padding: '12px' }}>
                        <span style={{ padding: '4px 8px', background: '#e0f2fe', color: '#0369a1', borderRadius: '4px', fontSize: '12px', fontWeight: 'bold' }}>
                          {log.actions}
                        </span>
                      </td>
<td style={{ padding: '12px', fontSize: '13px', color: '#334155', maxWidth: '450px' }}>
  {(() => {
    // Ép kiểu hoặc parse an toàn dữ liệu values nếu nó đang ở dạng chuỗi JSON
    let valObj = log.values;
    if (typeof valObj === 'string') {
      try {
        valObj = JSON.parse(valObj);
      } catch (e) {
        valObj = null;
      }
    }

    // Nếu không có data hoặc không phải object thì hiện thô
    if (!valObj || typeof valObj !== 'object') {
      return <span>{String(log.values || '---')}</span>;
    }

    // GIAO DIỆN RIÊNG CHO TỪNG LOẠI HÀNH ĐỘNG (ACTIONS)
    if (log.actions === 'mo_ban' || log.actions === 'open-table') {
      return (
        <div style={{ background: '#f8fafc', padding: '8px 12px', borderRadius: '6px', border: '1px solid #e2e8f0' }}>
          <div style={{ marginBottom: '4px' }}>
            🏓 Bàn: <b style={{ color: '#0f172a' }}>{valObj.tenBan || `ID: ${valObj.idBan}`}</b>
          </div>
          <div style={{ marginBottom: '4px', fontSize: '12px', color: '#64748b' }}>
            👤 Người mở: <b>{valObj.person || 'Không rõ'}</b>
          </div>
          <div style={{ fontSize: '12px', color: '#414141' }}>
            ⏱️ Lúc: {valObj.thoiGian || '---'}
          </div>
        </div>
      );
    }

    // 2. Giao diện cho hành động GHI DỊCH VỤ (Order món)
    if (log.actions === 'ghi_dich_vu') {
      // Chuyển object dichVu thành mảng để lặp map hiển thị danh sách món
      const listDichVu = valObj.dichVu ? Object.values(valObj.dichVu) : [];

      return (
        <div style={{ background: '#fef3c7', padding: '8px 12px', borderRadius: '6px', border: '1px solid #fde68a' }}>
          <div style={{ marginBottom: '6px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span>📝 Ghi dịch vụ tại: <b style={{ color: '#b45309' }}>{valObj.tenBan || `Bàn ID: ${valObj.idBan}`}</b></span>
            <span style={{ fontSize: '11px', color: '#78350f' }}>👤 {valObj.person || '---'}</span>
          </div>

          {/* Danh sách các món được gọi */}
          <div style={{ background: '#fff', padding: '6px 8px', borderRadius: '4px', border: '1px solid #fcd34d' }}>
            {listDichVu.length === 0 ? (
              <div style={{ fontSize: '12px', color: '#78350f' }}>Không có món nào.</div>
            ) : (
              listDichVu.map((item: any, idx: number) => (
                <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', padding: '3px 0', borderBottom: idx < listDichVu.length - 1 ? '1px dashed #fef3c7' : 'none' }}>
                  <span>🥤 <b>{item.ten}</b> (SL: {item.sl})</span>
                  <span style={{ color: '#059669', fontWeight: 'bold' }}>{(item.gia * item.sl).toLocaleString()}đ</span>
                </div>
              ))
            )}
          </div>
        </div>
      );
    }

    // 3. Giao diện cho hành động THANH TOÁN
    if (log.actions === 'thanh_toan') {
      const info = valObj.giaTri || valObj; // Lấy object bên trong giaTri nếu có, hoặc dùng trực tiếp valObj

      return (
        <div style={{ background: '#f0fdf4', padding: '10px 12px', borderRadius: '6px', border: '1px solid #bbf7d0', maxWidth: '450px' }}>
          {/* Header Bill */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #dcfce7', paddingBottom: '6px', marginBottom: '6px' }}>
            <span>💳 Thanh toán: <b style={{ color: '#15803d' }}>{valObj.tenBan || info.tenBan}</b></span>
            <span style={{ fontSize: '11px', color: '#166534' }}>👤 {valObj.person || '---'}</span>
          </div>

          {/* Chi tiết thông số bàn & thời gian */}
          <div style={{ fontSize: '12px', color: '#334155', marginBottom: '8px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '4px' }}>
            <div>⏱️ Bắt đầu: <b>{info.tgBatDau || '---'}</b></div>
            <div>⏳ Phút chơi: <b>{info.phutDaChoi || 0} phút</b></div>
            <div>💵 Tiền giờ: <b>{(info.tienGio || 0).toLocaleString()}đ</b></div>
            <div>🥤 Tiền dịch vụ: <b>{(info.tienDichVu || 0).toLocaleString()}đ</b></div>
          </div>

          {/* Danh sách dịch vụ trong bill (nếu có) */}
          {info.danhSachDichVu && info.danhSachDichVu.length > 0 && (
            <div style={{ background: '#fff', padding: '6px 8px', borderRadius: '4px', border: '1px solid #bbf7d0', marginBottom: '8px', fontSize: '11px' }}>
              <div style={{ fontWeight: 'bold', color: '#166534', marginBottom: '3px' }}>📋 Món đã dùng:</div>
              {info.danhSachDichVu.map((dv: any, idx: number) => (
                <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', color: '#475569', padding: '2px 0' }}>
                  <span>- {dv.tenDichVu} (x{dv.soLuong})</span>
                  <span>{(Number(dv.thanhTien) || 0).toLocaleString()}đ</span>
                </div>
              ))}
            </div>
          )}

          {/* Tổng cộng cuối cùng */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#dcfce7', padding: '6px 8px', borderRadius: '4px', fontWeight: 'bold', color: '#14532d', fontSize: '13px' }}>
            <span>TỔNG CỘNG:</span>
            <span style={{ color: '#16a34a', fontSize: '14px' }}>{(info.tongCong || 0).toLocaleString()}đ</span>
          </div>
        </div>
      );
    }
    // Mặc định cho các action khác: Hiển thị danh sách key-value gọn gàng
    return (
      <div style={{ fontFamily: 'monospace', fontSize: '12px', background: '#f8fafc', padding: '6px', borderRadius: '4px' }}>
        {JSON.stringify(valObj, null, 2)}
      </div>
    );
  })()}
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
