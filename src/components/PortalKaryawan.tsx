import { useState } from 'react';

export default function PortalKaryawan() {
  const [jenisCuti, setJenisCuti] = useState('Cuti Tahunan');
  const [alasan, setAlasan] = useState('');

  const handleAjukanCuti = (e: React.FormEvent) => {
    e.preventDefault();
    alert(`Pengajuan ${jenisCuti} berhasil dikirim ke HR.`);
    setAlasan('');
  };

  return (
    <div style={{ background: '#fff', padding: '24px', borderRadius: '16px', boxShadow: '0 4px 6px rgba(0,0,0,0.05)' }}>
      <h2 style={{ color: '#1e293b', fontSize: '20px', marginBottom: '16px' }}>👤 Portal Mandiri Karyawan</h2>
      <p style={{ color: '#64748b', fontSize: '14px', marginBottom: '20px' }}>Gunakan panel ini untuk melakukan absensi harian dan mengajukan cuti/izin[cite: 1].</p>
      
      <form onSubmit={handleAjukanCuti} style={{ display: 'flex', flexDirection: 'column', gap: '12px', maxWidth: '400px' }}>
        <label style={{ fontSize: '13px', fontWeight: 'bold', color: '#334155' }}>Form Pengajuan Cuti / Izin:</label>
        <select value={jenisCuti} onChange={(e) => setJenisCuti(e.target.value)} style={{ padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1' }}>
          <option value="Cuti Tahunan">Cuti Tahunan</option>
          <option value="Izin Sakit">Izin Sakit</option>
          <option value="Izin Keperluan Lain">Izin Keperluan Lain</option>
        </select>
        <textarea placeholder="Alasan pengajuan..." value={alasan} onChange={(e) => setAlasan(e.target.value)} style={{ padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1', height: '80px' }} />
        <button type="submit" style={{ background: '#2563eb', color: '#fff', border: 'none', padding: '10px', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer' }}>Kirim Pengajuan</button>
      </form>
    </div>
  );
}
