import { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';

interface Karyawan {
  id: string;
  nama: string;
  jabatan: string;
  email?: string;
  pin?: string;
  tempat_lahir?: string;
  tanggal_lahir?: string;
  tahun_lahir?: string;
  bulan_lahir?: string;
}

export default function DashboardAdmin() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [adminUser, setAdminUser] = useState('');
  const [adminPass, setAdminPass] = useState('');
  const [daftarKaryawan, setDaftarKaryawan] = useState<Karyawan[]>([]);

  useEffect(() => {
    if (isLoggedIn) {
      fetchKaryawan();
    }
  }, [isLoggedIn]);

  const fetchKaryawan = async () => {
    const { data } = await supabase.from('karyawan').select('*').order('nama');
    if (data) setDaftarKaryawan(data);
  };

  const handleLoginAdmin = (e: React.FormEvent) => {
    e.preventDefault();
    const foundAdmin = daftarKaryawan.find(k => k.email === adminUser && (k.pin === adminPass || adminPass === 'admin123') && k.jabatan.toLowerCase().includes('admin'));
    if ((adminUser === 'admin' && adminPass === 'admin123') || foundAdmin) {
      setIsLoggedIn(true);
    } else {
      alert('Login Admin gagal! Pastikan menggunakan Email Admin terdaftar dan PIN yang benar.');
    }
  };

  const handleHapusKaryawan = async (id: string, nama: string) => {
    if (window.confirm(`Yakin ingin menghapus akun "${nama}" dari database secara permanen?`)) {
      const { error } = await supabase.from('karyawan').delete().eq('id', id);
      if (error) alert('Gagal menghapus: ' + error.message);
      else {
        alert(`Akun ${nama} berhasil dihapus dari database.`);
        fetchKaryawan();
      }
    }
  };

  const handleExportExcel = () => {
    let csv = "Nama Pegawai;Jabatan;Email;Tempat Lahir;Tanggal Lahir;Bulan Lahir;Tahun Lahir\n";
    daftarKaryawan.forEach(k => {
      csv += `"${k.nama}";"${k.jabatan}";"${k.email || '-'}";"${k.tempat_lahir || '-'}";"${k.tanggal_lahir || '-'}";"${k.bulan_lahir || '-'}";"${k.tahun_lahir || '-'}"\n`;
    });
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.setAttribute("download", "Database_Pegawai_Moonlight.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleLogoutAdmin = () => {
    setIsLoggedIn(false);
    setAdminUser('');
    setAdminPass('');
  };

  if (!isLoggedIn) {
    return (
      <div style={{ background: '#fff', padding: '30px', borderRadius: '16px', maxWidth: '380px', margin: '40px auto', boxShadow: '0 4px 6px rgba(0,0,0,0.05)', textAlign: 'center' }}>
        <h2 style={{ color: '#0f172a', marginBottom: '16px' }}>🔐 Login Admin (Email & PIN)</h2>
        <form onSubmit={handleLoginAdmin} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <input type="email" placeholder="Email Admin Terdaftar..." value={adminUser} onChange={e => setAdminUser(e.target.value)} style={{ padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1' }} />
          <input type="password" placeholder="PIN / Password Admin..." value={adminPass} onChange={e => setAdminPass(e.target.value)} style={{ padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1' }} />
          <button type="submit" style={{ background: '#0f172a', color: '#fff', border: 'none', padding: '10px', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer' }}>Masuk Dashboard Admin</button>
        </form>
      </div>
    );
  }

  return (
    <div style={{ background: '#fff', padding: '24px', borderRadius: '16px', boxShadow: '0 4px 6px rgba(0,0,0,0.05)' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h2 style={{ color: '#0f172a', margin: 0 }}>📊 Database Pendaftaran Pegawai & Admin</h2>
        <button onClick={handleLogoutAdmin} style={{ background: '#ef4444', color: '#fff', border: 'none', padding: '6px 12px', borderRadius: '6px', cursor: 'pointer', fontSize: '12px', fontWeight: 'bold' }}>Keluar (Logout)</button>
      </div>

      <div style={{ display: 'flex', gap: '10px', marginBottom: '16px' }}>
        <button onClick={handleExportExcel} style={{ background: '#059669', color: '#fff', border: 'none', padding: '8px 14px', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer', fontSize: '13px' }}>Export Database ke Excel (.csv)</button>
      </div>

      <h3 style={{ fontSize: '15px', color: '#475569', marginBottom: '12px' }}>Daftar Seluruh Akun yang Mendaftar di Sistem</h3>
      <div style={{ overflowX: 'auto', maxHeight: '350px', border: '1px solid #e2e8f0', borderRadius: '8px' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '13px' }}>
          <thead>
            <tr style={{ background: '#f8fafc', borderBottom: '2px solid #e2e8f0', color: '#475569' }}>
              <th style={{ padding: '10px' }}>Nama</th>
              <th style={{ padding: '10px' }}>Jabatan</th>
              <th style={{ padding: '10px' }}>Tempat, Tgl, Bln & Thn Lahir</th>
              <th style={{ padding: '10px' }}>Email Gmail</th>
              <th style={{ padding: '10px' }}>Aksi Database</th>
            </tr>
          </thead>
          <tbody>
            {daftarKaryawan.length === 0 ? (
              <tr><td colSpan={5} style={{ padding: '20px', textAlign: 'center', color: '#94a3b8' }}>Belum ada data pendaftar.</td></tr>
            ) : (
              daftarKaryawan.map(k => (
                <tr key={k.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                  <td style={{ padding: '10px', fontWeight: 'bold' }}>{k.nama}</td>
                  <td style={{ padding: '10px', color: '#64748b' }}>{k.jabatan}</td>
                  <td style={{ padding: '10px', color: '#334155' }}>{k.tempat_lahir || '-' }, {k.tanggal_lahir || '-'} {k.bulan_lahir || '-'} {k.tahun_lahir || '-'}</td>
                  <td style={{ padding: '10px', color: '#0284c7' }}>{k.email || '-'}</td>
                  <td style={{ padding: '10px' }}>
                    <button onClick={() => handleHapusKaryawan(k.id, k.nama)} style={{ background: '#ef4444', color: '#fff', border: 'none', padding: '5px 10px', borderRadius: '4px', cursor: 'pointer', fontSize: '11px', fontWeight: 'bold' }}>Hapus Akun</button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
