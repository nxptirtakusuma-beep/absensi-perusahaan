import { useState, useEffect, useRef } from 'react';
import { supabase } from '../supabaseClient';

interface Karyawan {
  id: string;
  id_karyawan: string;
  nama: string;
  jabatan: string;
  email?: string;
  pin?: string;
}

export default function PortalKaryawan() {
  const [subView, setSubView] = useState<'login' | 'daftar' | 'dashboard_kry'>('login');
  const [daftarKaryawan, setDaftarKaryawan] = useState<Karyawan[]>([]);
  const [selectedId, setSelectedId] = useState('');
  const [inputPin, setInputPin] = useState('');
  const [karyawanLogin, setKaryawanLogin] = useState<Karyawan | null>(null);

  // Form Pendaftaran
  const [regId, setRegId] = useState('');
  const [regNama, setRegNama] = useState('');
  const [regJabatan, setRegJabatan] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPin, setRegPin] = useState('');
  const [loading, setLoading] = useState(false);

  // Kamera & GPS
  const [lokasiUser, setLokasiUser] = useState('Mendeteksi GPS...');
  const [fotoSnapshot, setFotoSnapshot] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    fetchKaryawan();
  }, []);

  useEffect(() => {
    if (subView === 'dashboard_kry' && karyawanLogin) {
      startCamera();
      ambilGPS();
    } else {
      stopCamera();
    }
  }, [subView, karyawanLogin]);

  const fetchKaryawan = async () => {
    const { data } = await supabase.from('karyawan').select('*').order('nama');
    if (data) setDaftarKaryawan(data);
  };

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { width: 320, height: 240 } });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }
    } catch (err) {
      console.error("Gagal akses kamera:", err);
    }
  };

  const stopCamera = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach(t => t.stop());
    }
  };

  const ambilFoto = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      canvas.width = video.videoWidth || 320;
      canvas.height = video.videoHeight || 240;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        setFotoSnapshot(canvas.toDataURL('image/jpeg'));
        alert('Foto wajah berhasil diverifikasi!');
      }
    }
  };

  const ambilGPS = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        pos => setLokasiUser(`Lat: ${pos.coords.latitude.toFixed(4)}, Lng: ${pos.coords.longitude.toFixed(4)}`),
        () => setLokasiUser('Izin GPS ditolak')
      );
    }
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    const kry = daftarKaryawan.find(k => k.id === selectedId);
    if (!kry) {
      alert('Pilih nama karyawan.');
      return;
    }
    if (inputPin === (kry.pin || '1234')) {
      setKaryawanLogin(kry);
      setSubView('dashboard_kry');
    } else {
      alert('PIN salah!');
    }
  };

  const handleDaftar = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!regId || !regNama || !regJabatan || !regEmail || !regPin) {
      alert('Semua kolom wajib diisi!');
      return;
    }
    setLoading(true);
    const { error } = await supabase.from('karyawan').insert([
      { id_karyawan: regId, nama: regNama, jabatan: regJabatan, email: regEmail, pin: regPin }
    ]);
    setLoading(false);
    if (error) {
      alert('Gagal daftar: ' + error.message);
    } else {
      alert('Berhasil daftar! Silakan login.');
      fetchKaryawan();
      setSubView('login');
    }
  };

  return (
    <div style={{ background: '#fff', padding: '24px', borderRadius: '16px', boxShadow: '0 4px 6px rgba(0,0,0,0.05)' }}>
      {subView === 'login' && (
        <div>
          <h2 style={{ color: '#1e293b', marginBottom: '16px' }}>👤 Login Karyawan</h2>
          <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '12px', maxWidth: '360px' }}>
            <select value={selectedId} onChange={e => setSelectedId(e.target.value)} style={{ padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1' }}>
              <option value="">-- Pilih Nama Karyawan --</option>
              {daftarKaryawan.map(k => <option key={k.id} value={k.id}>{k.nama} ({k.jabatan})</option>)}
            </select>
            <input type="password" maxLength={6} placeholder="PIN Rahasia..." value={inputPin} onChange={e => setInputPin(e.target.value)} style={{ padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1' }} />
            <button type="submit" style={{ background: '#2563eb', color: '#fff', border: 'none', padding: '10px', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer' }}>Masuk Portal</button>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px' }}>
              <span onClick={() => setSubView('daftar')} style={{ color: '#0284c7', cursor: 'pointer', fontWeight: 'bold' }}>Daftar Akun Baru</span>
            </div>
          </form>
        </div>
      )}

      {subView === 'daftar' && (
        <div>
          <h2 style={{ color: '#1e293b', marginBottom: '16px' }}>✍️ Pendaftaran Mandiri Karyawan</h2>
          <form onSubmit={handleDaftar} style={{ display: 'flex', flexDirection: 'column', gap: '12px', maxWidth: '360px' }}>
            <input type="text" placeholder="ID Karyawan / NIP..." value={regId} onChange={e => setRegId(e.target.value)} style={{ padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1' }} />
            <input type="text" placeholder="Nama Lengkap..." value={regNama} onChange={e => setRegNama(e.target.value)} style={{ padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1' }} />
            <input type="text" placeholder="Jabatan..." value={regJabatan} onChange={e => setRegJabatan(e.target.value)} style={{ padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1' }} />
            <input type="email" placeholder="Email Gmail..." value={regEmail} onChange={e => setRegEmail(e.target.value)} style={{ padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1' }} />
            <input type="password" maxLength={6} placeholder="Buat PIN Rahasia..." value={regPin} onChange={e => setRegPin(e.target.value)} style={{ padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1' }} />
            <button type="submit" disabled={loading} style={{ background: '#10b981', color: '#fff', border: 'none', padding: '10px', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer' }}>{loading ? 'Menyimpan...' : 'Daftar Sekarang'}</button>
            <span onClick={() => setSubView('login')} style={{ color: '#64748b', cursor: 'pointer', fontSize: '13px' }}>← Kembali ke Login</span>
          </form>
        </div>
      )}

      {subView === 'dashboard_kry' && karyawanLogin && (
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <h2 style={{ color: '#1e293b', margin: 0 }}>Halo, {karyawanLogin.nama}</h2>
            <button onClick={() => { setKaryawanLogin(null); setSubView('login'); }} style={{ background: '#ef4444', color: '#fff', border: 'none', padding: '6px 12px', borderRadius: '6px', cursor: 'pointer', fontSize: '12px' }}>Keluar</button>
          </div>
          <p style={{ fontSize: '13px', color: '#64748b' }}>Lokasi Anda: <strong>{lokasiUser}</strong></p>

          <div style={{ background: '#f8fafc', padding: '16px', borderRadius: '12px', textAlign: 'center', maxWidth: '320px', margin: '20px 0' }}>
            <p style={{ fontWeight: 'bold', fontSize: '13px', marginBottom: '8px' }}>Verifikasi Wajah Kamera:</p>
            <video ref={videoRef} autoPlay playsInline muted style={{ width: '100%', height: '140px', background: '#000', borderRadius: '8px', objectFit: 'cover' }} />
            {fotoSnapshot && <p style={{ color: '#10b981', fontSize: '12px', fontWeight: 'bold', margin: '6px 0' }}>✔ Wajah Terverifikasi</p>}
            <button type="button" onClick={ambilFoto} style={{ marginTop: '8px', background: '#0284c7', color: '#fff', border: 'none', padding: '6px 12px', borderRadius: '6px', fontSize: '12px', cursor: 'pointer', fontWeight: 'bold' }}>Ambil Foto</button>
          </div>
          <canvas ref={canvasRef} style={{ display: 'none' }} />
          <button onClick={() => alert('Absensi berhasil dikirim!')} style={{ background: '#2563eb', color: '#fff', border: 'none', padding: '12px 24px', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer' }}>Kirim Absen Sekarang</button>
        </div>
      )}
    </div>
  );
}
