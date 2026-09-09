import { useState, useEffect, useRef } from 'react';
import { supabase } from './supabaseClient';

interface Karyawan {
  id: string;
  id_karyawan: string;
  nama: string;
  jabatan: string;
  email?: string;
  pin?: string;
}

interface Absen {
  id: string;
  karyawan_id: string;
  id_karyawan: string;
  nama: string;
  jabatan: string;
  tanggal: string;
  jam_masuk: string;
  jam_pulang: string;
  total_jam: string;
  status: string;
  lokasi?: string;
}

interface PengaturanKantor {
  id: string;
  nama_perusahaan: string;
  latitude: number;
  longitude: number;
  radius_meter: number;
}

export default function App() {
  const [role, setRole] = useState<'landing' | 'pilih' | 'karyawan' | 'daftar_karyawan' | 'lupa_password' | 'admin'>('landing');
  const [adminPassword, setAdminPassword] = useState('');
  const [activeTab, setActiveTab] = useState<'absen' | 'karyawan' | 'riwayat' | 'pengaturan'>('absen');

  const [daftarKaryawan, setDaftarKaryawan] = useState<Karyawan[]>([]);
  const [riwayatAbsen, setRiwayatAbsen] = useState<Absen[]>([]);
  const [loading, setLoading] = useState(false);

  // Pengaturan Kantor Dinamis dari Database
  const [kantorConfig, setKantorConfig] = useState<PengaturanKantor>({
    id: '',
    nama_perusahaan: 'Talenta Enterprise HCM',
    latitude: -6.1751,
    longitude: 106.8650,
    radius_meter: 200
  });

  // Form Input Pengaturan Kantor Admin
  const [inputNamaPerusahaan, setInputNamaPerusahaan] = useState('');
  const [inputLat, setInputLat] = useState('');
  const [inputLng, setInputLng] = useState('');
  const [inputRadius, setInputRadius] = useState('');

  // Form States Pendaftaran Mandiri
  const [regIdKaryawan, setRegIdKaryawan] = useState('');
  const [regNama, setRegNama] = useState('');
  const [regJabatan, setRegJabatan] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPin, setRegPin] = useState('');

  // Form States Login Karyawan
  const [selectedKaryawanId, setSelectedKaryawanId] = useState('');
  const [inputPin, setInputPin] = useState('');
  const [karyawanLogin, setKaryawanLogin] = useState<Karyawan | null>(null);

  // Form States Lupa Password
  const [lupaEmail, setLupaEmail] = useState('');

  // Form States Absen
  const [jenisAbsen, setJenisAbsen] = useState<'Masuk' | 'Pulang'>('Masuk');
  const [statusAbsen, setStatusAbsen] = useState('Hadir');

  // Filter & Search Admin States
  const [searchQuery, setSearchQuery] = useState('');
  const [filterTanggal, setFilterTanggal] = useState('');

  // Fitur GPS & Kamera State
  const [lokasiUser, setLokasiUser] = useState<string>('Mendeteksi lokasi...');
  const [jarakKantorMeter, setJarakKantorMeter] = useState<number | null>(null);
  const [fotoSnapshot, setFotoSnapshot] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const JAM_MASUK_JAM = 8;
  const JAM_MASUK_MENIT = 0;

  useEffect(() => {
    fetchDataKaryawan();
    fetchDataAbsensi();
    fetchPengaturanKantor();
  }, []);

  useEffect(() => {
    if (role === 'karyawan' && karyawanLogin) {
      startCamera();
      ambilLokasiGPS();
    } else {
      stopCamera();
    }
  }, [role, karyawanLogin]);

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { width: 320, height: 240 } });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }
    } catch (err) {
      console.error("Gagal mengakses kamera:", err);
      alert("Pastikan izin kamera di browser sudah diaktifkan.");
    }
  };

  const stopCamera = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach(track => track.stop());
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
        const dataUrl = canvas.toDataURL('image/jpeg');
        setFotoSnapshot(dataUrl);
        alert('Verifikasi wajah berhasil diambil!');
      }
    }
  };

  const fetchPengaturanKantor = async () => {
    const { data, error } = await supabase.from('pengaturan_kantor').select('*').limit(1).single();
    if (!error && data) {
      setKantorConfig(data);
      setInputNamaPerusahaan(data.nama_perusahaan);
      setInputLat(data.latitude.toString());
      setInputLng(data.longitude.toString());
      setInputRadius(data.radius_meter.toString());
    }
  };

  const hitungJarakGPS = (lat1: number, lon1: number, lat2: number, lon2: number) => {
    const R = 6371e3;
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
      Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  };

  const ambilLokasiGPS = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const lat = position.coords.latitude;
          const lng = position.coords.longitude;
          const jarak = hitungJarakGPS(lat, lng, kantorConfig.latitude, kantorConfig.longitude);
          setJarakKantorMeter(Math.round(jarak));
          setLokasiUser(`Lat: ${lat.toFixed(4)}, Lng: ${lng.toFixed(4)} (Jarak ±${Math.round(jarak)}m dari kantor)`);
        },
        () => {
          setLokasiUser('Gagal mendeteksi GPS (Izin lokasi ditolak)');
        }
      );
    } else {
      setLokasiUser('GPS tidak didukung browser ini');
    }
  };

  const fetchDataKaryawan = async () => {
    const { data, error } = await supabase.from('karyawan').select('*').order('nama', { ascending: true });
    if (!error && data) setDaftarKaryawan(data);
  };

  const fetchDataAbsensi = async () => {
    const { data, error } = await supabase.from('absensi').select('*').order('created_at', { ascending: false });
    if (!error && data) setRiwayatAbsen(data);
  };

  const handleSimpanPengaturanKantor = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputLat || !inputLng || !inputRadius) {
      alert('Semua kolom koordinat dan radius wajib diisi!');
      return;
    }

    setLoading(true);
    if (kantorConfig.id) {
      const { error } = await supabase.from('pengaturan_kantor').update({
        nama_perusahaan: inputNamaPerusahaan,
        latitude: parseFloat(inputLat),
        longitude: parseFloat(inputLng),
        radius_meter: parseInt(inputRadius)
      }).eq('id', kantorConfig.id);

      setLoading(false);
      if (error) alert('Gagal menyimpan pengaturan: ' + error.message);
      else {
        alert('Pengaturan titik koordinat kantor berhasil diperbarui!');
        fetchPengaturanKantor();
      }
    } else {
      const { error } = await supabase.from('pengaturan_kantor').insert([{
        nama_perusahaan: inputNamaPerusahaan,
        latitude: parseFloat(inputLat),
        longitude: parseFloat(inputLng),
        radius_meter: parseInt(inputRadius)
      }]);

      setLoading(false);
      if (error) alert('Gagal menyimpan pengaturan: ' + error.message);
      else {
        alert('Pengaturan titik koordinat kantor berhasil disimpan!');
        fetchPengaturanKantor();
      }
    }
  };

  const handleLoginKaryawan = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedKaryawanId) {
      alert('Silakan pilih nama karyawan terlebih dahulu.');
      return;
    }
    const found = daftarKaryawan.find(k => k.id === selectedKaryawanId);
    if (!found) return;

    const pinUser = found.pin || '1234';
    if (inputPin === pinUser) {
      setKaryawanLogin(found);
      alert(`Selamat datang, ${found.nama}!`);
    } else {
      alert('PIN Rahasia salah!');
    }
  };

  const handlePendaftaranMandiri = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!regIdKaryawan.trim() || !regNama.trim() || !regJabatan.trim() || !regEmail.trim() || !regPin.trim()) {
      alert('Semua kolom wajib diisi termasuk Email Gmail dan PIN!');
      return;
    }

    if (!regEmail.includes('@gmail.com')) {
      alert('Harap masukkan alamat Email Gmail yang valid!');
      return;
    }

    setLoading(true);
    await supabase.auth.signUp({
      email: regEmail,
      password: regPin,
      options: { data: { nama: regNama, jabatan: regJabatan } }
    });

    const { error: dbError } = await supabase.from('karyawan').insert([
      { id_karyawan: regIdKaryawan, nama: regNama, jabatan: regJabatan, email: regEmail, pin: regPin }
    ]);
    
    setLoading(false);
    if (dbError) alert('Gagal mendaftar: ' + dbError.message);
    else {
      alert('Akun berhasil dibuat! Silakan login.');
      setRegIdKaryawan(''); setRegNama(''); setRegJabatan(''); setRegEmail(''); setRegPin('');
      setRole('karyawan');
      fetchDataKaryawan();
    }
  };

  const handleKirimOTPGmail = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!lupaEmail.trim() || !lupaEmail.includes('@gmail.com')) {
      alert('Masukkan alamat Email Gmail yang valid.');
      return;
    }

    setLoading(true);
    const { error } = await supabase.auth.resetPasswordForEmail(lupaEmail, { redirectTo: window.location.origin });
    setLoading(false);

    if (error) alert('Gagal mengirim email pemulihan: ' + error.message);
    else {
      alert(`Instruksi pemulihan telah dikirimkan ke Gmail: ${lupaEmail}.`);
      setLupaEmail('');
      setRole('karyawan');
    }
  };

  const handleLoginAdmin = (e: React.FormEvent) => {
    e.preventDefault();
    if (adminPassword === 'admin123') {
      setRole('admin');
      setActiveTab('riwayat');
    } else {
      alert('Password Admin salah!');
    }
  };

  const hitungDurasiJam = (masuk: string, pulang: string) => {
    if (masuk === '-' || pulang === '-') return '-';
    try {
      const [jamM, menitM] = masuk.split(':').map(Number);
      const [jamP, menitP] = pulang.split(':').map(Number);
      const selisihMenit = (jamP * 60 + menitP) - (jamM * 60 + menitM);
      if (selisihMenit <= 0) return '0 jam';
      return `${Math.floor(selisihMenit / 60)} jam ${selisihMenit % 60} menit`;
    } catch {
      return '-';
    }
  };

  const cekStatusKeterlambatan = (jamMasuk: string, statusPilihan: string) => {
    if (statusPilihan !== 'Hadir') return statusPilihan;
    if (jamMasuk === '-') return 'Hadir';
    try {
      const [jam, menit] = jamMasuk.split(':').map(Number);
      const totalMenitMasuk = jam * 60 + menit;
      const batasMenitNormal = JAM_MASUK_JAM * 60 + JAM_MASUK_MENIT;

      if (totalMenitMasuk > batasMenitNormal) {
        const selisih = totalMenitMasuk - batasMenitNormal;
        return `Terlambat (${selisih} mnt)`;
      }
    } catch {}
    return 'Hadir';
  };

  const handleKirimAbsen = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!karyawanLogin) return;

    if (jarakKantorMeter !== null && jarakKantorMeter > kantorConfig.radius_meter) {
      alert(`GAGAL ABSEN: Anda berada di luar radius kantor! Jarak Anda sekitar ${jarakKantorMeter} meter (Maksimal ${kantorConfig.radius_meter}m).`);
      return;
    }

    if (!fotoSnapshot) {
      alert('Harap ambil foto verifikasi wajah terlebih dahulu sebelum absen!');
      return;
    }

    setLoading(true);
    const now = new Date();
    const tanggalHariIni = now.toLocaleDateString('id-ID');
    const jamSekarang = now.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });

    const { data: existingData } = await supabase
      .from('absensi')
      .select('*')
      .eq('karyawan_id', karyawanLogin.id)
      .eq('tanggal', tanggalHariIni)
      .single();

    const statusFinal = cekStatusKeterlambatan(jamSekarang, statusAbsen);

    if (jenisAbsen === 'Masuk') {
      if (existingData) {
        const total = hitungDurasiJam(jamSekarang, existingData.jam_pulang);
        await supabase
          .from('absensi')
          .update({ jam_masuk: jamSekarang, total_jam: total, status: statusFinal, lokasi: lokasiUser })
          .eq('id', existingData.id);
      } else {
        await supabase.from('absensi').insert([{
          karyawan_id: karyawanLogin.id,
          id_karyawan: karyawanLogin.id_karyawan || '-',
          nama: karyawanLogin.nama,
          jabatan: karyawanLogin.jabatan,
          tanggal: tanggalHariIni,
          jam_masuk: jamSekarang,
          jam_pulang: '-',
          total_jam: '-',
          status: statusFinal,
          lokasi: lokasiUser
        }]);
      }
      alert(`Absen Masuk berhasil dicatat untuk ${karyawanLogin.nama}!`);
    } else {
      if (existingData) {
        const total = hitungDurasiJam(existingData.jam_masuk, jamSekarang);
        await supabase
          .from('absensi')
          .update({ jam_pulang: jamSekarang, total_jam: total, lokasi: lokasiUser })
          .eq('id', existingData.id);
      } else {
        await supabase.from('absensi').insert([{
          karyawan_id: karyawanLogin.id,
          id_karyawan: karyawanLogin.id_karyawan || '-',
          nama: karyawanLogin.nama,
          jabatan: karyawanLogin.jabatan,
          tanggal: tanggalHariIni,
          jam_masuk: '-',
          jam_pulang: jamSekarang,
          total_jam: '-',
          status: statusFinal,
          lokasi: lokasiUser
        }]);
      }
      alert(`Absen Pulang berhasil dicatat untuk ${karyawanLogin.nama}!`);
    }

    setLoading(false);
    setFotoSnapshot(null);
    setKaryawanLogin(null);
    setSelectedKaryawanId('');
    setInputPin('');
    fetchDataAbsensi();
  };

  const handleHapusKaryawan = async (id: string, nama: string) => {
    if (window.confirm(`Apakah Anda yakin ingin menghapus data karyawan "${nama}"?`)) {
      setLoading(true);
      const { error } = await supabase.from('karyawan').delete().eq('id', id);
      setLoading(false);
      if (error) alert('Gagal menghapus: ' + error.message);
      else { alert(`Karyawan ${nama} dihapus.`); fetchDataKaryawan(); }
    }
  };

  const handleResetRiwayat = async () => {
    if (window.confirm('PERINGATAN: Semua riwayat absensi akan dihapus permanen. Lanjutkan?')) {
      setLoading(true);
      const { error } = await supabase.from('absensi').delete().neq('id', '00000000-0000-0000-0000-000000000000');
      setLoading(false);
      if (error) alert('Gagal mereset: ' + error.message);
      else { alert('Riwayat dibersihkan.'); fetchDataAbsensi(); }
    }
  };

  const handleCetakPDF = () => {
    const printWindow = window.open('', '', 'height=700,width=900');
    if (!printWindow) return;

    let htmlContent = `
      <html>
        <head>
          <title>Laporan Rekapitulasi Absensi</title>
          <style>
            body { font-family: Arial, sans-serif; padding: 20px; color: #333; }
            .header { text-align: center; border-bottom: 3px double #333; padding-bottom: 10px; margin-bottom: 20px; }
            .header h1 { margin: 0; font-size: 22px; color: #1e3a8a; }
            table { width: 100%; border-collapse: collapse; margin-top: 10px; font-size: 12px; }
            th, td { border: 1px solid #ccc; padding: 8px; text-align: left; }
            th { background-color: #f3f4f6; color: #111; }
            .footer { margin-top: 40px; display: flex; justify-content: space-between; font-size: 13px; }
            .sign { text-align: center; margin-top: 60px; }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>${kantorConfig.nama_perusahaan}</h1>
            <p><b>LAPORAN RESMI REKAPITULASI KEHADIRAN KARYAWAN</b></p>
          </div>
          <table>
            <thead>
              <tr>
                <th>ID</th>
                <th>Email Gmail</th>
                <th>Tanggal</th>
                <th>Nama Karyawan</th>
                <th>Jabatan</th>
                <th>Masuk</th>
                <th>Pulang</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
    `;

    filteredAbsen.forEach(r => {
      const kryData = daftarKaryawan.find(k => k.id === r.karyawan_id);
      const emailVal = kryData?.email || '-';
      htmlContent += `
        <tr>
          <td>${r.id_karyawan || '-'}</td>
          <td>${emailVal}</td>
          <td>${r.tanggal}</td>
          <td><b>${r.nama}</b></td>
          <td>${r.jabatan}</td>
          <td>${r.jam_masuk}</td>
          <td>${r.jam_pulang}</td>
          <td>${r.status}</td>
        </tr>
      `;
    });

    htmlContent += `
            </tbody>
          </table>
          <div class="footer">
            <div></div>
            <div class="sign">
              <p>Jakarta, ${new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
              <br><br><br>
              <p><b>HRD Manager</b></p>
            </div>
          </div>
        </body>
      </html>
    `;

    printWindow.document.write(htmlContent);
    printWindow.document.close();
    printWindow.focus();
    setTimeout(() => { printWindow.print(); }, 500);
  };

  const filteredAbsen = riwayatAbsen.filter(item => {
    const matchSearch = item.nama.toLowerCase().includes(searchQuery.toLowerCase()) || 
                        (item.id_karyawan && item.id_karyawan.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchTanggal = filterTanggal ? item.tanggal.includes(filterTanggal) : true;
    return matchSearch && matchTanggal;
  });

  const exportToExcel = () => {
    if (filteredAbsen.length === 0) return;
    let csv = "data:text/csv;charset=utf-8,ID Karyawan;Email Gmail;Nama Karyawan;Jabatan;Tanggal;Jam Masuk;Jam Pulang;Total Jam Kerja;Lokasi GPS;Status\n";
    filteredAbsen.forEach(r => {
      const idKry = r.id_karyawan || '-';
      const kryData = daftarKaryawan.find(k => k.id === r.karyawan_id);
      const emailVal = kryData?.email || '-';
      const lok = r.lokasi || '-';
      csv += `"${idKry}";"${emailVal}";"${r.nama}";"${r.jabatan}";${r.tanggal};${r.jam_masuk};${r.jam_pulang};"${r.total_jam}";"${lok}";${r.status}\n`;
    });
    const link = document.createElement("a");
    link.setAttribute("href", encodeURI(csv));
    link.setAttribute("download", `Rekap_Absensi_${new Date().toLocaleDateString('id-ID')}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div style={{ 
      minHeight: '100vh', 
      background: role === 'landing' ? 'linear-gradient(135deg, #fff5f5 0%, #fff 50%, #fdf2f8 100%)' : 'linear-gradient(135deg, #1e3a8a 0%, #3b82f6 50%, #93c5fd 100%)', 
      padding: role === 'landing' ? '0' : '40px 20px', 
      fontFamily: 'Inter, system-ui, sans-serif',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: role === 'landing' ? 'flex-start' : 'center',
      alignItems: 'center',
      transition: 'all 0.3s ease'
    }}>

      {/* LANDING PAGE GAYA MEKARI TALENTA */}
      {role === 'landing' && (
        <div style={{ width: '100%', minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
          
          {/* Navbar Professional */}
          <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '20px 40px', borderBottom: '1px solid #f3f4f6', background: 'rgba(255,255,255,0.9)', backdropFilter: 'blur(8px)', position: 'sticky', top: 0, zIndex: 100 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <span style={{ fontSize: '24px', background: '#ef4444', color: '#fff', padding: '4px 10px', borderRadius: '8px', fontWeight: '900' }}>⚡</span>
              <span style={{ fontSize: '20px', fontWeight: '800', color: '#1e293b', letterSpacing: '-0.5px' }}>mekari <span style={{ color: '#ef4444' }}>talenta</span></span>
            </div>
            
            <nav style={{ display: 'flex', gap: '24px', alignItems: 'center', fontSize: '14px', fontWeight: '600', color: '#4b5563' }}>
              <span style={{ cursor: 'pointer' }}>Fitur ▾</span>
              <span style={{ cursor: 'pointer' }}>Solusi ▾</span>
              <span style={{ cursor: 'pointer' }}>Harga</span>
              <span style={{ cursor: 'pointer' }}>Resources ▾</span>
            </nav>

            <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
              <span style={{ fontSize: '13px', fontWeight: '600', color: '#374151', cursor: 'pointer' }}>🌐 ID ▾</span>
              <span onClick={() => setRole('pilih')} style={{ fontSize: '13px', fontWeight: '600', color: '#374151', cursor: 'pointer', padding: '8px 12px' }}>Sign In</span>
              <button onClick={() => alert('Hubungi Sales via WhatsApp: +62 812-3456-7890')} style={{ background: '#1f2937', color: '#fff', border: 'none', padding: '10px 18px', borderRadius: '8px', fontSize: '13px', fontWeight: 'bold', cursor: 'pointer' }}>Hubungi sales</button>
              <button onClick={() => setRole('pilih')} style={{ background: '#fff', color: '#1f2937', border: '1px solid #d1d5db', padding: '10px 18px', borderRadius: '8px', fontSize: '13px', fontWeight: 'bold', cursor: 'pointer' }}>Coba gratis</button>
            </div>
          </header>

          {/* Hero Section */}
          <main style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '60px 80px', maxWidth: '1280px', margin: '0 auto', width: '100%', gap: '40px', flexWrap: 'wrap' }}>
            <div style={{ flex: 1, minWidth: '320px', maxWidth: '600px' }}>
              <div style={{ display: 'inline-block', background: '#fee2e2', color: '#dc2626', padding: '6px 12px', borderRadius: '20px', fontSize: '12px', fontWeight: 'bold', marginBottom: '20px' }}>
                #1 Software HR di Indonesia
              </div>
              <h1 style={{ fontSize: '42px', fontWeight: '900', color: '#111827', lineHeight: '1.2', marginBottom: '20px', letterSpacing: '-1px' }}>
                AI-centric HCM untuk HR proaktif dan produktivitas tinggi
              </h1>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '36px', fontSize: '15px', color: '#4b5563', fontWeight: '500' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <span style={{ color: '#10b981', fontWeight: 'bold' }}>✔</span> Dukungan AI untuk keputusan strategis yang lebih cepat
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <span style={{ color: '#10b981', fontWeight: 'bold' }}>✔</span> Kurangi beban kerja administratif HR hingga 90%
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <span style={{ color: '#10b981', fontWeight: 'bold' }}>✔</span> Patuh regulasi Indonesia, siap untuk operasional skala besar
                </div>
              </div>

              <div style={{ display: 'flex', gap: '16px', alignItems: 'center', flexWrap: 'wrap' }}>
                <button onClick={() => setRole('pilih')} style={{ background: '#1f2937', color: '#fff', border: 'none', padding: '14px 24px', borderRadius: '10px', fontSize: '15px', fontWeight: 'bold', cursor: 'pointer', boxShadow: '0 4px 12px rgba(0,0,0,0.15)' }}>
                  💬 WhatsApp sales
                </button>
                <button onClick={() => setRole('pilih')} style={{ background: '#fff', color: '#1f2937', border: '1px solid #d1d5db', padding: '14px 24px', borderRadius: '10px', fontSize: '15px', fontWeight: 'bold', cursor: 'pointer' }}>
                  Coba gratis
                </button>
              </div>

              {/* Rating Section */}
              <div style={{ display: 'flex', gap: '16px', marginTop: '40px', flexWrap: 'wrap' }}>
                <div style={{ background: '#fff', padding: '10px 16px', borderRadius: '8px', border: '1px solid #e5e7eb', fontSize: '12px', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span>⭐ G2</span> <span style={{ color: '#f59e0b' }}>★ 4.8</span>
                </div>
                <div style={{ background: '#fff', padding: '10px 16px', borderRadius: '8px', border: '1px solid #e5e7eb', fontSize: '12px', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span>🛡 Capterra</span> <span style={{ color: '#f59e0b' }}>★ 4.7</span>
                </div>
                <div style={{ background: '#fff', padding: '10px 16px', borderRadius: '8px', border: '1px solid #e5e7eb', fontSize: '12px', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span>🔷 GetApp</span> <span style={{ color: '#f59e0b' }}>★ 4.7</span>
                </div>
              </div>
            </div>

            {/* Ilustrasi Card Profesional */}
            <div style={{ flex: 1, minWidth: '300px', display: 'flex', justifyContent: 'center', position: 'relative' }}>
              <div style={{ background: 'linear-gradient(135deg, #fee2e2 0%, #fef3c7 100%)', padding: '40px', borderRadius: '24px', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.15)', textAlign: 'center', width: '100%', maxWidth: '420px', border: '2px solid rgba(255,255,255,0.8)' }}>
                <div style={{ fontSize: '64px', marginBottom: '16px' }}>👨‍💼📊</div>
                <h3 style={{ fontSize: '20px', color: '#1f2937', fontWeight: '800', marginBottom: '8px' }}>Enterprise HR Dashboard</h3>
                <p style={{ fontSize: '13px', color: '#4b5563', marginBottom: '24px' }}>Akses portal absensi mandiri, pelacakan GPS, rekapitulasi otomatis, dan manajemen talenta perusahaan.</p>
                <button onClick={() => setRole('pilih')} style={{ background: '#ef4444', color: '#fff', border: 'none', padding: '12px 28px', borderRadius: '10px', fontSize: '14px', fontWeight: 'bold', cursor: 'pointer', width: '100%', boxShadow: '0 4px 12px rgba(239, 68, 68, 0.3)' }}>
                  Buka Portal Sistem Sekarang →
                </button>
              </div>
            </div>
          </main>
        </div>
      )}

      {/* CONTAINER UTAMA APLIKASI ABSENSI (SAAT MASUK PORTAL) */}
      {role !== 'landing' && (
        <div style={{ 
          width: '100%',
          maxWidth: '1000px', 
          background: 'rgba(255, 255, 255, 0.96)', 
          backdropFilter: 'blur(10px)',
          padding: '32px', 
          borderRadius: '20px', 
          boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.2), 0 10px 10px -5px rgba(0, 0, 0, 0.1)' 
        }}>
          
          {role === 'pilih' && (
            <div style={{ textAlign: 'center', padding: '30px 10px' }}>
              <div style={{ fontSize: '48px', marginBottom: '10px' }}>🏢📍</div>
              <h1 style={{ color: '#1e293b', marginBottom: '8px', fontSize: '28px', fontWeight: '800' }}>{kantorConfig.nama_perusahaan}</h1>
              <p style={{ color: '#64748b', marginBottom: '36px', fontSize: '15px' }}>Sistem Absensi Enterprise dengan Pengaturan Koordinat GPS Kustom</p>
              
              <div style={{ display: 'flex', justifyContent: 'center', gap: '20px', flexWrap: 'wrap' }}>
                <button 
                  onClick={() => setRole('karyawan')}
                  style={{ background: 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)', color: 'white', padding: '16px 28px', borderRadius: '12px', border: 'none', fontSize: '15px', fontWeight: 'bold', cursor: 'pointer', boxShadow: '0 4px 12px rgba(37, 99, 235, 0.3)' }}
                >
                  👤 Login Karyawan
                </button>

                <button 
                  onClick={() => setRole('daftar_karyawan')}
                  style={{ background: 'linear-gradient(135deg, #0284c7 0%, #0369a1 100%)', color: 'white', padding: '16px 28px', borderRadius: '12px', border: 'none', fontSize: '15px', fontWeight: 'bold', cursor: 'pointer', boxShadow: '0 4px 12px rgba(2, 132, 199, 0.3)' }}
                >
                  ✍️ Daftar Akun Karyawan Baru
                </button>
                
                <div style={{ background: '#f8fafc', padding: '16px', borderRadius: '12px', border: '1px solid #e2e8f0', textAlign: 'left', minWidth: '260px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' }}>
                  <form onSubmit={handleLoginAdmin} style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <label style={{ fontWeight: 'bold', fontSize: '13px', color: '#334155' }}>🔐 Portal Admin:</label>
                    <input 
                      type="password" 
                      placeholder="Password Admin..." 
                      value={adminPassword}
                      onChange={(e) => setAdminPassword(e.target.value)}
                      style={{ padding: '8px 10px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '13px', outline: 'none' }}
                    />
                    <button type="submit" style={{ background: '#10b981', color: 'white', padding: '8px', borderRadius: '6px', border: 'none', fontWeight: 'bold', cursor: 'pointer', fontSize: '13px' }}>
                      Login Admin
                    </button>
                  </form>
                </div>
              </div>

              <div style={{ marginTop: '30px' }}>
                <button onClick={() => setRole('landing')} style={{ background: 'none', border: 'none', color: '#ef4444', fontWeight: 'bold', cursor: 'pointer', fontSize: '14px' }}>← Kembali ke Beranda Talenta</button>
              </div>
            </div>
          )}

          {role === 'daftar_karyawan' && (
            <div style={{ padding: '10px 10px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', borderBottom: '2px solid #f1f5f9', paddingBottom: '12px' }}>
                <h2 style={{ margin: 0, color: '#1e293b', fontSize: '20px', fontWeight: '700' }}>Pendaftaran Akun Karyawan Mandiri</h2>
                <button onClick={() => setRole('pilih')} style={{ background: '#64748b', color: 'white', border: 'none', padding: '6px 12px', borderRadius: '6px', cursor: 'pointer', fontSize: '12px' }}>← Kembali</button>
              </div>
              <form onSubmit={handlePendaftaranMandiri} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <input type="text" placeholder="ID Karyawan / NIP..." value={regIdKaryawan} onChange={(e) => setRegIdKaryawan(e.target.value)} style={{ padding: '11px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '14px' }} />
                  <input type="password" maxLength={6} placeholder="PIN Rahasia..." value={regPin} onChange={(e) => setRegPin(e.target.value)} style={{ padding: '11px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '14px' }} />
                </div>
                <input type="text" placeholder="Nama Lengkap Karyawan..." value={regNama} onChange={(e) => setRegNama(e.target.value)} style={{ padding: '11px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '14px' }} />
                <input type="text" placeholder="Jabatan / Divisi..." value={regJabatan} onChange={(e) => setRegJabatan(e.target.value)} style={{ padding: '11px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '14px' }} />
                <input type="email" placeholder="Alamat Email Gmail..." value={regEmail} onChange={(e) => setRegEmail(e.target.value)} style={{ padding: '11px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '14px' }} />
                <button type="submit" disabled={loading} style={{ background: '#0284c7', color: 'white', padding: '13px', borderRadius: '8px', border: 'none', fontWeight: 'bold', cursor: 'pointer', fontSize: '15px' }}>{loading ? 'Mendaftarkan...' : 'Daftar Akun'}</button>
              </form>
            </div>
          )}

          {role === 'karyawan' && !karyawanLogin && (
            <div style={{ textAlign: 'center', padding: '30px 20px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <h2 style={{ margin: 0, color: '#1e293b', fontSize: '20px' }}>Login Karyawan</h2>
                <button onClick={() => setRole('pilih')} style={{ background: '#64748b', color: 'white', border: 'none', padding: '6px 12px', borderRadius: '6px', cursor: 'pointer', fontSize: '12px' }}>← Kembali</button>
              </div>
              <form onSubmit={handleLoginKaryawan} style={{ maxWidth: '380px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '14px', textAlign: 'left' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '6px', fontWeight: '600', fontSize: '13px', color: '#334155' }}>Pilih Nama:</label>
                  <select value={selectedKaryawanId} onChange={(e) => setSelectedKaryawanId(e.target.value)} style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '14px', background: '#fff' }}>
                    <option value="">-- Pilih Nama Karyawan --</option>
                    {daftarKaryawan.map(k => <option key={k.id} value={k.id}>{k.nama} — {k.jabatan}</option>)}
                  </select>
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '6px', fontWeight: '600', fontSize: '13px', color: '#334155' }}>Masukkan PIN:</label>
                  <input type="password" maxLength={6} placeholder="PIN Anda..." value={inputPin} onChange={(e) => setInputPin(e.target.value)} style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '16px', letterSpacing: '3px' }} />
                </div>
                <button type="submit" style={{ background: '#2563eb', color: 'white', padding: '12px', borderRadius: '8px', border: 'none', fontWeight: 'bold', cursor: 'pointer', fontSize: '15px' }}>Masuk Absensi</button>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', marginTop: '8px' }}>
                  <span onClick={() => setRole('lupa_password')} style={{ color: '#0284c7', cursor: 'pointer', fontWeight: 'bold' }}>Lupa PIN?</span>
                  <span onClick={() => setRole('daftar_karyawan')} style={{ color: '#2563eb', cursor: 'pointer', fontWeight: 'bold' }}>Daftar Akun Baru</span>
                </div>
              </form>
            </div>
          )}

          {role === 'lupa_password' && (
            <div style={{ padding: '20px 10px', textAlign: 'center' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', borderBottom: '2px solid #f1f5f9', paddingBottom: '12px' }}>
                <h2 style={{ margin: 0, color: '#1e293b', fontSize: '20px', fontWeight: '700' }}>Pemulihan PIN</h2>
                <button onClick={() => setRole('karyawan')} style={{ background: '#64748b', color: 'white', border: 'none', padding: '6px 12px', borderRadius: '6px', cursor: 'pointer', fontSize: '12px' }}>← Kembali</button>
              </div>
              <form onSubmit={handleKirimOTPGmail} style={{ maxWidth: '360px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '14px', textAlign: 'left' }}>
                <input type="email" placeholder="Masukkan Email Gmail..." value={lupaEmail} onChange={(e) => setLupaEmail(e.target.value)} style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '14px' }} />
                <button type="submit" disabled={loading} style={{ background: '#0284c7', color: 'white', padding: '12px', borderRadius: '8px', border: 'none', fontWeight: 'bold', cursor: 'pointer', fontSize: '15px' }}>Kirim Pemulihan</button>
              </form>
            </div>
          )}

          {role === 'karyawan' && karyawanLogin && (
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', borderBottom: '2px solid #f1f5f9', paddingBottom: '16px' }}>
                <div>
                  <h2 style={{ margin: 0, color: '#1e293b', fontSize: '22px', fontWeight: '700' }}>Halo, {karyawanLogin.nama}</h2>
                  <p style={{ margin: '4px 0 0 0', color: '#64748b', fontSize: '13px' }}>Lokasi: <strong style={{ color: '#0284c7' }}>{lokasiUser}</strong></p>
                  {jarakKantorMeter !== null && (
                    <p style={{ margin: '2px 0 0 0', fontSize: '12px', fontWeight: 'bold', color: jarakKantorMeter <= kantorConfig.radius_meter ? '#16a34a' : '#dc2626' }}>
                      {jarakKantorMeter <= kantorConfig.radius_meter ? `✔ Dalam Radius Kantor (±${jarakKantorMeter}m)` : `❌ Di Luar Radius (±${jarakKantorMeter}m > ${kantorConfig.radius_meter}m)`}
                    </p>
                  )}
                </div>
                <button onClick={() => { setKaryawanLogin(null); setSelectedKaryawanId(''); setInputPin(''); }} style={{ background: '#64748b', color: 'white', border: 'none', padding: '8px 14px', borderRadius: '8px', cursor: 'pointer', fontWeight: '600', fontSize: '13px' }}>Ganti Akun</button>
              </div>

              <form onSubmit={handleKirimAbsen} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                <div style={{ background: '#f8fafc', padding: '16px', borderRadius: '12px', border: '1px solid #e2e8f0', textAlign: 'center' }}>
                  <label style={{ display: 'block', marginBottom: '10px', fontWeight: 'bold', color: '#334155' }}>📸 Verifikasi Wajah:</label>
                  <div style={{ display: 'flex', justifyContent: 'center', gap: '16px', flexWrap: 'wrap', alignItems: 'center' }}>
                    <video ref={videoRef} autoPlay playsInline muted style={{ width: '220px', height: '165px', borderRadius: '8px', background: '#000', objectFit: 'cover' }} />
                    {fotoSnapshot ? (
                      <div>
                        <img src={fotoSnapshot} alt="Snapshot" style={{ width: '220px', height: '165px', borderRadius: '8px', objectFit: 'cover', border: '2px solid #10b981' }} />
                        <p style={{ fontSize: '11px', color: '#10b981', fontWeight: 'bold', margin: '4px 0 0 0' }}>✔ Terverifikasi</p>
                      </div>
                    ) : (
                      <div style={{ width: '220px', height: '165px', borderRadius: '8px', border: '2px dashed #cbd5e1', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#fff' }}>
                        <span style={{ fontSize: '12px', color: '#94a3b8' }}>Belum Ambil Foto</span>
                      </div>
                    )}
                  </div>
                  <button type="button" onClick={ambilFoto} style={{ marginTop: '12px', background: '#0284c7', color: 'white', border: 'none', padding: '8px 16px', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer', fontSize: '13px' }}>Ambil Foto Wajah</button>
                </div>
                <canvas ref={canvasRef} style={{ display: 'none' }} />

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                  <div>
                    <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: '#334155' }}>Kategori:</label>
                    <select value={jenisAbsen} onChange={(e) => setJenisAbsen(e.target.value as 'Masuk' | 'Pulang')} style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '15px', background: '#fff' }}>
                      <option value="Masuk">🟢 Absen Masuk</option>
                      <option value="Pulang">🔴 Absen Pulang</option>
                    </select>
                  </div>
                  <div>
                    <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: '#334155' }}>Status:</label>
                    <select value={statusAbsen} onChange={(e) => setStatusAbsen(e.target.value)} style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '15px', background: '#fff' }}>
                      <option value="Hadir">Hadir</option>
                      <option value="Izin">Izin</option>
                      <option value="Sakit">Sakit</option>
                      <option value="Cuti">Cuti</option>
                    </select>
                  </div>
                </div>
                <button type="submit" disabled={loading} style={{ background: 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)', color: 'white', padding: '14px', borderRadius: '10px', border: 'none', fontWeight: 'bold', fontSize: '16px', cursor: 'pointer' }}>{loading ? 'Menyimpan...' : 'Kirim Absen Sekarang'}</button>
              </form>
            </div>
          )}

          {role === 'admin' && (
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', borderBottom: '2px solid #f1f5f9', paddingBottom: '16px' }}>
                <div>
                  <h2 style={{ margin: 0, color: '#1e293b', fontSize: '22px', fontWeight: '700' }}>Dashboard Admin Enterprise</h2>
                  <span style={{ color: '#10b981', fontSize: '13px', fontWeight: 'bold' }}>● Perusahaan: {kantorConfig.nama_perusahaan}</span>
                </div>
                <button onClick={() => setRole('pilih')} style={{ background: '#ef4444', color: 'white', border: 'none', padding: '8px 14px', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold', fontSize: '13px' }}>Logout Admin</button>
              </div>

              <div style={{ display: 'flex', gap: '10px', marginBottom: '20px', flexWrap: 'wrap' }}>
                <button onClick={() => setActiveTab('riwayat')} style={{ padding: '10px 18px', background: activeTab === 'riwayat' ? '#2563eb' : '#f1f5f9', color: activeTab === 'riwayat' ? 'white' : '#475569', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold', fontSize: '14px' }}>📊 Rekap Kehadiran</button>
                <button onClick={() => setActiveTab('karyawan')} style={{ padding: '10px 18px', background: activeTab === 'karyawan' ? '#2563eb' : '#f1f5f9', color: activeTab === 'karyawan' ? 'white' : '#475569', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold', fontSize: '14px' }}>👥 Kelola Karyawan</button>
                <button onClick={() => setActiveTab('pengaturan')} style={{ padding: '10px 18px', background: activeTab === 'pengaturan' ? '#2563eb' : '#f1f5f9', color: activeTab === 'pengaturan' ? 'white' : '#475569', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold', fontSize: '14px' }}>⚙️ Pengaturan Kantor & GPS</button>
              </div>

              {activeTab === 'riwayat' && (
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '12px' }}>
                    <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', flex: 1 }}>
                      <input type="text" placeholder="🔍 Cari Nama..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} style={{ padding: '8px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13px', minWidth: '180px' }} />
                      <input type="text" placeholder="📅 Filter Tanggal..." value={filterTanggal} onChange={(e) => setFilterTanggal(e.target.value)} style={{ padding: '8px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13px', minWidth: '140px' }} />
                    </div>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      {filteredAbsen.length > 0 && (
                        <>
                          <button onClick={exportToExcel} style={{ backgroundColor: '#10b981', color: 'white', padding: '8px 12px', borderRadius: '8px', border: 'none', fontWeight: 'bold', cursor: 'pointer', fontSize: '13px' }}>Excel</button>
                          <button onClick={handleCetakPDF} style={{ backgroundColor: '#0284c7', color: 'white', padding: '8px 12px', borderRadius: '8px', border: 'none', fontWeight: 'bold', cursor: 'pointer', fontSize: '13px' }}>PDF Resmi</button>
                        </>
                      )}
                      <button onClick={handleResetRiwayat} style={{ backgroundColor: '#ef4444', color: 'white', padding: '8px 12px', borderRadius: '8px', border: 'none', fontWeight: 'bold', cursor: 'pointer', fontSize: '13px' }}>Reset</button>
                    </div>
                  </div>

                  {filteredAbsen.length === 0 ? (
                    <p style={{ color: '#94a3b8', textAlign: 'center', padding: '40px' }}>Tidak ada data absensi.</p>
                  ) : (
                    <div style={{ overflowX: 'auto', maxHeight: '400px', border: '1px solid #e2e8f0', borderRadius: '8px' }}>
                      <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '13px' }}>
                        <thead>
                          <tr style={{ background: '#f8fafc', borderBottom: '2px solid #e2e8f0', position: 'sticky', top: 0, color: '#475569' }}>
                            <th style={{ padding: '12px' }}>ID</th>
                            <th style={{ padding: '12px' }}>Tanggal</th>
                            <th style={{ padding: '12px' }}>Nama</th>
                            <th style={{ padding: '12px' }}>Jabatan</th>
                            <th style={{ padding: '12px' }}>Masuk</th>
                            <th style={{ padding: '12px' }}>Pulang</th>
                            <th style={{ padding: '12px' }}>Status</th>
                          </tr>
                        </thead>
                        <tbody>
                          {filteredAbsen.map((item) => (
                            <tr key={item.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                              <td style={{ padding: '12px', fontWeight: 'bold' }}>{item.id_karyawan || '-'}</td>
                              <td style={{ padding: '12px', color: '#64748b' }}>{item.tanggal}</td>
                              <td style={{ padding: '12px', fontWeight: 'bold' }}>{item.nama}</td>
                              <td style={{ padding: '12px', color: '#64748b' }}>{item.jabatan}</td>
                              <td style={{ padding: '12px', color: '#2563eb', fontWeight: 'bold' }}>{item.jam_masuk}</td>
                              <td style={{ padding: '12px', color: '#9333ea', fontWeight: 'bold' }}>{item.jam_pulang}</td>
                              <td style={{ padding: '12px' }}>
                                <span style={{ padding: '4px 8px', borderRadius: '6px', fontSize: '11px', fontWeight: 'bold', backgroundColor: item.status.includes('Terlambat') ? '#fee2e2' : '#dcfce7', color: item.status.includes('Terlambat') ? '#991b1b' : '#166534' }}>{item.status}</span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              )}

              {activeTab === 'karyawan' && (
                <div>
                  <h3 style={{ fontSize: '16px', color: '#334155', marginBottom: '12px' }}>Daftar Karyawan ({daftarKaryawan.length})</h3>
                  <div style={{ maxHeight: '350px', overflowY: 'auto', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '4px' }}>
                    <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                      {daftarKaryawan.map(k => (
                        <li key={k.id} style={{ padding: '10px 14px', background: '#fff', borderBottom: '1px solid #f1f5f9', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <div>
                            <strong style={{ color: '#1e293b' }}>{k.nama}</strong> ({k.jabatan}) — <span style={{ color: '#0284c7' }}>{k.email || 'Tanpa Email'}</span>
                          </div>
                          <button onClick={() => handleHapusKaryawan(k.id, k.nama)} style={{ background: '#fee2e2', color: '#991b1b', border: 'none', padding: '6px 12px', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold', fontSize: '12px' }}>Hapus</button>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              )}

              {activeTab === 'pengaturan' && (
                <div>
                  <h3 style={{ fontSize: '16px', color: '#334155', marginBottom: '12px' }}>⚙️ Pengaturan Titik Koordinat Kantor & Geofencing</h3>
                  <p style={{ color: '#64748b', fontSize: '13px', marginBottom: '20px' }}>Admin dapat menentukan titik pusat koordinat GPS kantor dan batas radius toleransi absensi secara mandiri.</p>

                  <form onSubmit={handleSimpanPengaturanKantor} style={{ display: 'flex', flexDirection: 'column', gap: '14px', background: '#f8fafc', padding: '20px', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                    <div>
                      <label style={{ display: 'block', marginBottom: '6px', fontWeight: '600', fontSize: '13px', color: '#334155' }}>Nama Perusahaan / Kantor:</label>
                      <input type="text" value={inputNamaPerusahaan} onChange={(e) => setInputNamaPerusahaan(e.target.value)} style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '14px' }} />
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                      <div>
                        <label style={{ display: 'block', marginBottom: '6px', fontWeight: '600', fontSize: '13px', color: '#334155' }}>Latitude Kantor:</label>
                        <input type="text" placeholder="Contoh: -6.1751" value={inputLat} onChange={(e) => setInputLat(e.target.value)} style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '14px' }} />
                      </div>
                      <div>
                        <label style={{ display: 'block', marginBottom: '6px', fontWeight: '600', fontSize: '13px', color: '#334155' }}>Longitude Kantor:</label>
                        <input type="text" placeholder="Contoh: 106.8650" value={inputLng} onChange={(e) => setInputLng(e.target.value)} style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '14px' }} />
                      </div>
                    </div>

                    <div>
                      <label style={{ display: 'block', marginBottom: '6px', fontWeight: '600', fontSize: '13px', color: '#334155' }}>Radius Toleransi Geofencing (dalam Meter):</label>
                      <input type="number" placeholder="Contoh: 200" value={inputRadius} onChange={(e) => setInputRadius(e.target.value)} style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '14px' }} />
                    </div>

                    <button type="submit" disabled={loading} style={{ background: '#10b981', color: 'white', padding: '12px', borderRadius: '8px', border: 'none', fontWeight: 'bold', cursor: 'pointer', fontSize: '14px', marginTop: '6px' }}>{loading ? 'Menyimpan...' : 'Simpan Pengaturan Koordinat'}</button>
                  </form>
                </div>
              )}
            </div>
          )}

        </div>
      )}

    </div>
  );
}
