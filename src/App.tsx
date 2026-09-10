import { useState } from 'react';
import Navbar from './components/Navbar';
import PortalKaryawan from './components/PortalKaryawan';
import DashboardAdmin from './components/DashboardAdmin';

export default function App() {
  const [currentView, setCurrentView] = useState<'landing' | 'portal' | 'admin'>('landing');
  const [namaPerusahaan] = useState('PT. Moonjustfine');

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #334155 100%)', fontFamily: 'Arial, sans-serif', color: '#f8fafc' }}>
      {/* Komponen Navbar dengan properti lengkap */}
      <Navbar 
        namaPerusahaan={namaPerusahaan} 
        onNavClick={(view: any) => setCurrentView(view)} 
      />

      {/* Konten Utama Berdasarkan Navigasi */}
      <div style={{ padding: '40px 20px', maxWidth: '900px', margin: '0 auto' }}>
        {currentView === 'landing' && (
          <div style={{ background: '#1e293b', padding: '40px', borderRadius: '20px', border: '1px solid #334155', textAlign: 'center', boxShadow: '0 10px 25px rgba(0,0,0,0.3)' }}>
            <span style={{ background: '#0284c7', color: '#fff', padding: '6px 14px', borderRadius: '20px', fontSize: '12px', fontWeight: 'bold' }}>Platform HRIS Enterprise Berstandar Tinggi</span>
            <h1 style={{ fontSize: '28px', color: '#fff', margin: '20px 0 10px 0' }}>Sistem Manajemen {namaPerusahaan}</h1>
            <p style={{ color: '#94a3b8', fontSize: '14px', lineHeight: '1.6', maxWidth: '650px', margin: '0 auto 30px auto' }}>
              Solusi enterprise mutakhir dengan geofencing GPS, verifikasi wajah (*Vermuk*), perhitungan jam kerja real-time, manajemen gaji proaktif, hingga unduh laporan resmi.
            </p>
            <button onClick={() => setCurrentView('portal')} style={{ background: '#38bdf8', color: '#0f172a', border: 'none', padding: '12px 24px', borderRadius: '10px', fontWeight: 'bold', cursor: 'pointer', fontSize: '14px' }}>
              Masuk Portal Eksekutif →
            </button>
          </div>
        )}

        {currentView === 'portal' && <PortalKaryawan />}
        {currentView === 'admin' && <DashboardAdmin />}
      </div>
    </div>
  );
}
