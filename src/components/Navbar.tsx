import { useState } from 'react';
import PortalKaryawan from './PortalKaryawan';
import DashboardAdmin from './DashboardAdmin';

export default function Navbar() {
  const [activeTab, setActiveTab] = useState<'home' | 'portal' | 'admin'>('home');

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #334155 100%)', fontFamily: 'Arial, sans-serif', color: '#f8fafc' }}>
      {/* Navbar Atas */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 32px', background: '#0f172a', borderBottom: '1px solid #334155', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ width: '38px', height: '38px', background: '#3b82f6', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', color: '#fff' }}>MJ</div>
          <h2 style={{ margin: 0, fontSize: '18px', color: '#fff', fontWeight: 'bold' }}>
            PT. <span style={{ color: '#38bdf8' }}>Moonjustfine</span>
          </h2>
        </div>
        <div style={{ display: 'flex', gap: '20px', fontSize: '14px', fontWeight: '500' }}>
          <span onClick={() => setActiveTab('home')} style={{ cursor: 'pointer', color: activeTab === 'home' ? '#38bdf8' : '#cbd5e1' }}>Beranda</span>
          <span onClick={() => setActiveTab('portal')} style={{ cursor: 'pointer', color: activeTab === 'portal' ? '#38bdf8' : '#cbd5e1' }}>Portal Karyawan</span>
          <span onClick={() => setActiveTab('admin')} style={{ cursor: 'pointer', color: activeTab === 'admin' ? '#38bdf8' : '#cbd5e1' }}>Dashboard HR</span>
        </div>
      </div>

      {/* Konten Utama */}
      <div style={{ padding: '40px 20px', maxWidth: '900px', margin: '0 auto' }}>
        {activeTab === 'home' && (
          <div style={{ background: '#1e293b', padding: '40px', borderRadius: '20px', border: '1px solid #334155', textAlign: 'center', boxShadow: '0 10px 25px rgba(0,0,0,0.3)' }}>
            <span style={{ background: '#0284c7', color: '#fff', padding: '6px 14px', borderRadius: '20px', fontSize: '12px', fontWeight: 'bold' }}>Platform HRIS Enterprise Berstandar Tinggi</span>
            <h1 style={{ fontSize: '28px', color: '#fff', margin: '20px 0 10px 0' }}>Sistem Manajemen PT. Moonjustfine</h1>
            <p style={{ color: '#94a3b8', fontSize: '14px', lineHeight: '1.6', maxWidth: '650px', margin: '0 auto 30px auto' }}>
              Solusi enterprise mutakhir dengan geofencing GPS, verifikasi wajah (*Vermuk*), perhitungan jam kerja real-time, manajemen gaji proaktif, hingga unduh laporan resmi.
            </p>
            <button onClick={() => setActiveTab('portal')} style={{ background: '#38bdf8', color: '#0f172a', border: 'none', padding: '12px 24px', borderRadius: '10px', fontWeight: 'bold', cursor: 'pointer', fontSize: '14px' }}>
              Masuk Portal Eksekutif →
            </button>
          </div>
        )}

        {activeTab === 'portal' && <PortalKaryawan />}
        {activeTab === 'admin' && <DashboardAdmin />}
      </div>
    </div>
  );
}
