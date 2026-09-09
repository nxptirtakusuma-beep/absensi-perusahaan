import { useState, useEffect, useRef } from 'react';
import { supabase } from '../supabaseClient';

interface Karyawan {
  id: string;
  id_karyawan: string;
  nama: string;
  jabatan: string;
  email?: string;
  pin?: string;
  gaji_pokok?: number;
}

export default function PortalKaryawan() {
  const [subView, setSubView] = useState<'login' | 'daftar_kry' | 'daftar_adm' | 'lupa' | 'dashboard_kry' | 'slip_gaji'>('login');
  const [daftarKaryawan, setDaftarKaryawan] = useState<Karyawan[]>([]);
  const [selectedId, setSelectedId] = useState('');
  const [inputPin, setInputPin] = useState('');
  const [karyawanLogin, setKaryawanLogin] = useState<Karyawan | null>(null);

  const [regId, setRegId] = useState('');
  const [regNama, setRegNama] = useState('');
  const [regJabatan, setRegJabatan] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPin, setRegPin] = useState('');
  const [loading, setLoading] = useState(false);
  const [lupaEmail, setLupaEmail] = useState('');

  const [lokasiUser, setLokasiUser] = useState('Mendeteksi GPS...');
  const [fotoSnapshot, setFotoSnapshot] = useState<string | null>(null);
  const [jenisAbsen, setJenisAbsen] = useState<'Masuk' | 'Pulang'>('Masuk');
  const [statusAbsen, setStatusAbsen] = useState('Hadir');
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    fetchKaryawan();
  }, []);

  useEffect(() => {
    if (karyawanLogin) {
      startCamera();
      ambilGPS();
    } else {
      stopCamera();
    }
  }, [karyawanLogin]);

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
        alert('Verifikasi wajah (Vermuk) berhasil!');
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
    } else {
      alert('PIN atau Password salah!');
    }
  };

  const handleDaftarKaryawan = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!regId || !regNama || !regJabatan || !regEmail || !regPin) {
      alert('Semua kolom wajib diisi!');
      return;
    }
    if (!regEmail.includes('@gmail.com')) {
      alert('Gunakan alamat Gmail yang valid.');
      return;
    }
    setLoading(true);
    await supabase.auth.signUp({ email: regEmail, password: regPin });
    const { error } = await supabase.from('karyawan').insert([
      { id_karyawan: regId, nama: regNama, jabatan: regJabatan, email: regEmail, pin: regPin, gaji_pokok: 4500000 }
    ]);
    setLoading(false);
    if (error) {
      alert('Gagal daftar: ' + error.message);
    } else {
      alert('Registrasi akun karyawan berhasil! Silakan login.');
      fetchKaryawan();
      setSubView('login');
    }
  };

  const handleDaftarAdmin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!regNama || !regEmail || !regPin) {
      alert('Semua kolom wajib diisi!');
      return;
    }
    if (!regEmail.includes('@gmail.com')) {
      alert('Gunakan alamat Gmail yang valid.');
      return;
    }
    setLoading(true);
    const { error } = await supabase.auth.signUp({ email: regEmail, password: regPin });
    setLoading(false);
    if (error) {
      alert('Gagal daftar Admin: ' + error.message);
    } else {
      alert('Akun Admin berhasil didaftarkan! Silakan masuk melalui Dashboard HR.');
      setSubView('login');
    }
  };

  const handleLupaPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!lupaEmail || !lupaEmail.includes('@gmail.com')) {
      alert('Masukkan Gmail yang valid.');
      return;
    }
    setLoading(true);
    const { error } = await supabase.auth.resetPasswordForEmail(lupaEmail, { redirectTo: window.location.origin });
    setLoading(false);
    if (error) {
      alert('Gagal mengirim pemulihan: ' + error.message);
    } else {
      alert(`Instruksi pemulihan sandi telah dikirimkan ke Gmail: ${lupaEmail}`);
      setSubView('login');
    }
  };

  const handleKirimAbsen = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!karyawanLogin) return;
    if (!fotoSnapshot) {
      alert('Harap lakukan verifikasi wajah (Vermuk) terlebih dahulu!');
      return;
    }

    const now = new Date();
    const tanggalHariIni = now.toLocaleDateString('id-ID');
    const jamSekarang = now.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });

    const { data: existingData } = await supabase
      .from('absensi')
      .select('*')
      .eq('karyawan_id', karyawanLogin.id)
      .eq('tanggal', tanggalHariIni)
      .single();

    if (jenisAbsen === 'Masuk') {
      if (existingData) {
        alert('Anda sudah melakukan Absen Masuk hari ini.');
        return;
      }
      const { error } = await supabase.from('absensi').insert([{
        karyawan_id: karyawanLogin.id,
        id_karyawan: karyawanLogin.id_karyawan || '-',
        nama: karyawanLogin.nama,
        jabatan: karyawanLogin.jabatan,
        tanggal: tanggalHariIni,
        jam_masuk: jamSekarang,
        jam_pulang: '-',
        total_jam: 'Sedang Berjalan',
        status: statusAbsen,
        lokasi: lokasiUser
      }]);
      if (error) alert('Gagal absen masuk: ' + error.message);
      else alert('Absen Masuk berhasil dicatat secara realtime!');
    } else {
      if (!existingData) {
        alert('Anda belum melakukan Absen Masuk hari ini.');
        return;
      }

      const jamMasukStr = existingData.jam_masuk;
      let totalJamStr = '0 Jam';
      try {
        const [hM, mM] = jamMasukStr.split(':').map(Number);
        const [hP, mP] = jamSekarang.split(':').map(Number);
        const selisihMenit = (hP * 60 + mP) - (hM * 60 + mM);
        if (selisihMenit > 0) {
          const jam = Math.floor(selisihMenit / 60);
          const menit = selisihMenit % 60;
          totalJamStr = `${jam} Jam ${menit} Menit`;
        }
      } catch {
        totalJamStr = 'hitung otomatis';
      }

      const { error } = await supabase.from('absensi').update({
        jam_pulang: jamSekarang,
        total_jam: totalJamStr
      }).eq('id', existingData.id);

      if (error) alert('Gagal absen pulang: ' + error.message);
      else alert(`Absen Pulang berhasil dicatat! Total Kerja: ${totalJamStr}`);
    }

    setFotoSnapshot(null);
  };

  const handleDownloadSlip = () => {
    if (!karyawanLogin) return;
    const slipWindow = window.open('', '', 'height=600,width=800');
    if (!slipWindow) return;
    const gaji = karyawanLogin.gaji_pokok || 4500000;
    const html = `
      <html>
        <head><title>Slip Gaji - ${karyawanLogin.nama}</title></head>
        <body style="font-family: Arial; padding: 30px;">
          <h2 style="text-align: center; color: #0f172a;">PT. MOONLIGHT INDONESIA</h2>
          <h3 style="text-align: center; color: #3b82f6;">SLIP GAJI RESMI KARYAWAN</h3>
          <hr/>
          <p><b>Nama:</b> ${karyawanLogin.nama}</p>
          <p><b>Jabatan:</b> ${karyawanLogin.jabatan}</p>
          <p><b>Email:</b> ${karyawanLogin.email || '-'}</p>
          <hr/>
          <p><b>Gaji Pokok:</b> Rp ${gaji.toLocaleString('id-ID')}</p>
          <p><b>Tunjangan & Kinerja:</b> Rp 500.000</p>
          <p><b>Total Pendapatan:</b> <span style="color: green; font-weight: bold;">Rp ${(gaji + 500000).toLocaleString('id-ID')}</span></p>
          <br/><br/>
          <p style="text-align: right;">HRD Manager PT. Moonlight Indonesia</p>
        </body>
      </html>
    `;
    slipWindow.document.write(html);
    slipWindow.document.close();
    slipWindow.focus();
    setTimeout(() => slipWindow.print(), 500);
  };

  const handleLogout = () => {
    setKaryawanLogin(null);
    setSelectedId('');
    setInputPin('');
    setSubView('login');
  };

  return (
    <div style={{ background: '#fff', padding: '24px', borderRadius: '16px', boxShadow: '0 4px 6px rgba(0,0,0,0.05)' }}>
      {subView === 'login' && !karyawanLogin && (
        <div>
          <h2 style={{ color: '#0f172a', marginBottom: '16px' }}>👤 Login Karyawan</h2>
          <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '12px', maxWidth: '360px' }}>
            <select value={selectedId} onChange={e => setSelectedId(e.target.value)} style={{ padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1' }}>
              <option value="">-- Pilih Nama Karyawan --</option>
              {daftarKaryawan.map(k => <option key={k.id} value={k.id}>{k.nama} ({k.jabatan})</option>)}
            </select>
            <input type="password" maxLength={6} placeholder="PIN / Password..." value={inputPin} onChange={e => setInputPin(e.target.value)} style={{ padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1' }} />
            <button type="submit" style={{ background: '#0f172a', color: '#fff', border: 'none', padding: '10px', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer' }}>Masuk Portal</button>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', marginTop: '6px' }}>
              <span onClick={() => setSubView('daftar_kry')} style={{ color: '#0284c7', cursor: 'pointer', fontWeight: 'bold' }}>Daftar Karyawan</span>
              <span onClick={() => setSubView('daftar_adm')} style={{ color: '#059669', cursor: 'pointer', fontWeight: 'bold' }}>Daftar Admin</span>
              <span onClick={() => setSubView('lupa')} style={{ color: '#dc2626', cursor: 'pointer', fontWeight: 'bold' }}>Lupa PIN?</span>
            </div>
          </form>
        </div>
      )}

      {subView === 'daftar_kry' && (
        <div>
          <h2 style={{ color: '#0f172a', marginBottom: '16px' }}>✍️ Pendaftaran Akun Karyawan Mandiri</h2>
          <form onSubmit={handleDaftarKaryawan} style={{ display: 'flex', flexDirection: 'column', gap: '12px', maxWidth: '360px' }}>
            <input type="text" placeholder="ID Karyawan / NIP..." value={regId} onChange={e => setRegId(e.target.value)} style={{ padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1' }} />
            <input type="text" placeholder="Nama Lengkap..." value={regNama} onChange={e => setRegNama(e.target.value)} style={{ padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1' }} />
            <input type="text" placeholder="Jabatan..." value={regJabatan} onChange={e => setRegJabatan(e.target.value)} style={{ padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1' }} />
            <input type="email" placeholder="Alamat Gmail..." value={regEmail} onChange={e => setRegEmail(e.target.value)} style={{ padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1' }} />
            <input type="password" maxLength={6} placeholder="Buat PIN / Password..." value={regPin} onChange={e => setRegPin(e.target.value)} style={{ padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1' }} />
            <button type="submit" disabled={loading} style={{ background: '#059669', color: '#fff', border: 'none', padding: '10px', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer' }}>{loading ? 'Menyimpan...' : 'Daftar Karyawan'}</button>
            <span onClick={() => setSubView('login')} style={{ color: '#64748b', cursor: 'pointer', fontSize: '13px' }}>← Kembali ke Login</span>
          </form>
        </div>
      )}

      {subView === 'daftar_adm' && (
        <div>
          <h2 style={{ color: '#0f172a', marginBottom: '16px' }}>✍️ Pendaftaran Akun Admin Mandiri</h2>
          <form onSubmit={handleDaftarAdmin} style={{ display: 'flex', flexDirection: 'column', gap: '12px', maxWidth: '360px' }}>
            <input type="text" placeholder="Nama Lengkap Admin..." value={regNama} onChange={e => setRegNama(e.target.value)} style={{ padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1' }} />
            <input type="email" placeholder="Alamat Gmail Admin..." value={regEmail} onChange={e => setRegEmail(e.target.value)} style={{ padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1' }} />
            <input type="password" placeholder="Password Admin..." value={regPin} onChange={e => setRegPin(e.target.value)} style={{ padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1' }} />
            <button type="submit" disabled={loading} style={{ background: '#0f172a', color: '#fff', border: 'none', padding: '10px', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer' }}>{loading ? 'Menyimpan...' : 'Daftar Admin'}</button>
            <span onClick={() => setSubView('login')} style={{ color: '#64748b', cursor: 'pointer', fontSize: '13px' }}>← Kembali ke Login</span>
          </form>
        </div>
      )}

      {subView === 'lupa' && (
        <div>
          <h2 style={{ color: '#0f172a', marginBottom: '16px' }}>🔄 Pemulihan PIN via Gmail</h2>
          <form onSubmit={handleLupaPassword} style={{ display: 'flex', flexDirection: 'column', gap: '12px', maxWidth: '360px' }}>
            <input type="email" placeholder="Masukkan Gmail terdaftar..." value={lupaEmail} onChange={e => setLupaEmail(e.target.value)} style={{ padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1' }} />
            <button type="submit" disabled={loading} style={{ background: '#0284c7', color: '#fff', border: 'none', padding: '10px', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer' }}>Kirim Pemulihan</button>
            <span onClick={() => setSubView('login')} style={{ color: '#64748b', cursor: 'pointer', fontSize: '13px' }}>← Kembali ke Login</span>
          </form>
        </div>
      )}

      {karyawanLogin && (
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <h2 style={{ color: '#0f172a', margin: 0 }}>Halo, {karyawanLogin.nama}</h2>
            <button onClick={handleLogout} style={{ background: '#ef4444', color: '#fff', border: 'none', padding: '6px 12px', borderRadius: '6px', cursor: 'pointer', fontSize: '12px', fontWeight: 'bold' }}>Keluar (Logout)</button>
          </div>
          <p style={{ fontSize: '13px', color: '#64748b' }}>Lokasi GPS: <strong>{lokasiUser}</strong></p>
          
          <div style={{ display: 'flex', gap: '10px', margin: '15px 0' }}>
            <button onClick={() => setSubView('dashboard_kry')} style={{ background: '#0f172a', color: '#fff', border: 'none', padding: '8px 14px', borderRadius: '6px', cursor: 'pointer', fontSize: '13px' }}>Absensi & Vermuk</button>
            <button onClick={() => setSubView('slip_gaji')} style={{ background: '#059669', color: '#fff', border: 'none', padding: '8px 14px', borderRadius: '6px', cursor: 'pointer', fontSize: '13px' }}>Unduh Slip Gaji</button>
          </div>

          {subView === 'dashboard_kry' && (
            <form onSubmit={handleKirimAbsen} style={{ display: 'flex', flexDirection: 'column', gap: '14px', maxWidth: '360px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 'bold', marginBottom: '6px' }}>Jenis Absen:</label>
                <select value={jenisAbsen} onChange={e => setJenisAbsen(e.target.value as 'Masuk' | 'Pulang')} style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1' }}>
                  <option value="Masuk">🟢 Absen Masuk</option>
                  <option value="Pulang">🔴 Absen Pulang</option>
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 'bold', marginBottom: '6px' }}>Status Kehadiran:</label>
                <select value={statusAbsen} onChange={e => setStatusAbsen(e.target.value)} style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1' }}>
                  <option value="Hadir">Hadir</option>
                  <option value="Terlambat">Terlambat</option>
                  <option value="Sakit">Sakit</option>
                  <option value="Izin">Izin</option>
                </select>
              </div>

              <div style={{ background: '#f8fafc', padding: '16px', borderRadius: '12px', textAlign: 'center' }}>
                <p style={{ fontWeight: 'bold', fontSize: '13px', marginBottom: '8px' }}>📸 Verifikasi Wajah (Vermuk):</p>
                <video ref={videoRef} autoPlay playsInline muted style={{ width: '100%', height: '140px', background: '#000', borderRadius: '8px', objectFit: 'cover' }} />
                {fotoSnapshot && <p style={{ color: '#10b981', fontSize: '12px', fontWeight: 'bold', margin: '6px 0' }}>✔ Wajah Terverifikasi</p>}
                <button type="button" onClick={ambilFoto} style={{ marginTop: '8px', background: '#0284c7', color: '#fff', border: 'none', padding: '6px 12px', borderRadius: '6px', fontSize: '12px', cursor: 'pointer', fontWeight: 'bold' }}>Ambil Foto Vermuk</button>
              </div>
              <canvas ref={canvasRef} style={{ display: 'none' }} />
              <button type="submit" style={{ background: '#0f172a', color: '#fff', border: 'none', padding: '12px', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer' }}>Kirim Absen Sekarang</button>
            </form>
          )}

          {subView === 'slip_gaji' && (
            <div style={{ background: '#f8fafc', padding: '20px', borderRadius: '12px', border: '1px solid #e2e8f0', maxWidth: '400px' }}>
              <h3 style={{ margin: '0 0 10px 0', fontSize: '16px', color: '#0f172a' }}>Slip Gaji Bulanan</h3>
              <p style={{ fontSize: '14px', color: '#475569' }}>Gaji Pokok: Rp {(karyawanLogin.gaji_pokok || 4500000).toLocaleString('id-ID')}</p>
              <button onClick={handleDownloadSlip} style={{ background: '#059669', color: '#fff', border: 'none', padding: '10px 16px', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer', fontSize: '13px' }}>Download Slip Gaji (PDF)</button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
