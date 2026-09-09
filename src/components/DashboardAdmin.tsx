import { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';

interface Absen {
  id: string;
  nama: string;
  tanggal: string;
  jam_masuk: string;
  jam_pulang: string;
  status: string;
}

export default function DashboardAdmin() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [passwordInput, setPasswordInput] = useState('');
  const [riwayat, setRiwayat] = useState<Absen[]>([]);

  useEffect(() => {
    if (isLoggedIn) {
      fetchRiwayat();
    }
  }, [isLoggedIn]);

  const fetchRiwayat = async () => {
    const { data } = await supabase.from('absensi').select('*').order('created_at', { ascending: false });
    if (data) setRiwayat(data);
  };

  const handleLoginAdmin = (e: React.FormEvent) => {
    e.preventDefault();
    if (passwordInput === 'admin123') {
      setIsLoggedIn(true);
    } else {
      alert('Password Admin salah! (Gunakan: admin123)');
    }
  };

  if (!isLoggedIn) {
    return (
      <div style={{ background: '#fff', padding: '30px', borderRadius: '16px', maxWidth: '380px', margin: '40px auto', boxShadow: '0 4px 6px rgba(0,0,0,0.05)', textAlign: 'center' }}>
        <h2 style={{ color: '#1e293b', marginBottom: '16px' }}>🔐 Login Khusus Admin</h2>
        <form onSubmit={handleLoginAdmin} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <input type="password" placeholder="Password Admin..." value={passwordInput} onChange={e => setPasswordInput(e.target.value)} style={{ padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1' }} />
          <button type="submit" style={{ background: '#10b981', color: '#fff', border: 'none', padding: '10px', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer' }}>Buka Dashboard Admin</button>
        </form>
      </div>
    );
  }

  return (
    <div style={{ background: '#fff', padding: '24px', borderRadius: '16px', boxShadow: '0 4px 6px rgba(0,0,0,0.05)' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h2 style={{ color: '#1e293b', margin: 0 }}>📊 Dashboard Eksekutif HR & Admin</h2>
        <button onClick={() => setIsLoggedIn(false)} style={{ background: '#ef4444', color: '#fff', border: 'none', padding: '6px 12px', borderRadius: '6px', cursor: 'pointer', fontSize: '12px', fontWeight: 'bold' }}>Logout Admin</button>
      </div>

      <h3 style={{ fontSize: '15px', color: '#475569', marginBottom: '12px' }}>Rekapitulasi Kehadiran Pegawai</h3>
      <div style={{ overflowX: 'auto', maxHeight: '350px', border: '1px solid #e2e8f0', borderRadius: '8px' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '13px' }}>
          <thead>
            <tr style={{ background: '#f8fafc', borderBottom: '2px solid #e2e8f0', color: '#475569' }}>
              <th style={{ padding: '10px' }}>Tanggal</th>
              <th style={{ padding: '10px' }}>Nama</th>
              <th style={{ padding: '10px' }}>Masuk</th>
              <th style={{ padding: '10px' }}>Pulang</th>
              <th style={{ padding: '10px' }}>Status</th>
            </tr>
          </thead>
          <tbody>
            {riwayat.length === 0 ? (
              <tr><td colSpan={5} style={{ padding: '20px', textAlign: 'center', color: '#94a3b8' }}>Belum ada data absensi.</td></tr>
            ) : (
              riwayat.map(item => (
                <tr key={item.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                  <td style={{ padding: '10px', color: '#64748b' }}>{item.tanggal}</td>
                  <td style={{ padding: '10px', fontWeight: 'bold' }}>{item.nama}</td>
                  <td style={{ padding: '10px', color: '#2563eb', fontWeight: 'bold' }}>{item.jam_masuk}</td>
                  <td style={{ padding: '10px', color: '#9333ea', fontWeight: 'bold' }}>{item.jam_pulang}</td>
                  <td style={{ padding: '10px' }}><span style={{ background: '#dcfce7', color: '#166534', padding: '3px 8px', borderRadius: '4px', fontSize: '11px', fontWeight: 'bold' }}>{item.status}</span></td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
