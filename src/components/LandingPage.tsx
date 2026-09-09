interface LandingPageProps {
  onMulai: () => void;
  namaPerusahaan: string;
}

export default function LandingPage({ onMulai, namaPerusahaan }: LandingPageProps) {
  return (
    <div style={{ minHeight: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px 20px' }}>
      <div style={{ maxWidth: '800px', textAlign: 'center', background: '#fff', padding: '50px 30px', borderRadius: '24px', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)' }}>
        <span style={{ background: '#dbeafe', color: '#1d4ed8', padding: '6px 14px', borderRadius: '20px', fontSize: '13px', fontWeight: 'bold' }}>Platform HRIS Enterprise Terpadu</span>
        <h1 style={{ fontSize: '36px', color: '#1e293b', marginTop: '20px', fontWeight: '900' }}>Sistem Manajemen {namaPerusahaan}</h1>
        <p style={{ color: '#64748b', fontSize: '15px', lineHeight: '1.6', margin: '20px 0 30px 0' }}>Solusi lengkap pengelolaan absensi geofencing GPS, verifikasi wajah, pengajuan cuti digital[cite: 1], dan perhitungan payroll otomatis[cite: 1].</p>
        <button onClick={onMulai} style={{ background: 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)', color: '#fff', border: 'none', padding: '14px 32px', borderRadius: '12px', fontSize: '15px', fontWeight: 'bold', cursor: 'pointer', boxShadow: '0 10px 15px -3px rgba(37, 99, 235, 0.3)' }}>
          Mulai Masuk Sistem →
        </button>
      </div>
    </div>
  );
}
