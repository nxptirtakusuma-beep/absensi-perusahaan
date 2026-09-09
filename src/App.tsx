import { useState, useEffect } from 'react';
import { supabase } from './supabaseClient';
import Navbar from './components/Navbar';
import LandingPage from './components/LandingPage';
import PortalKaryawan from './components/PortalKaryawan';
import DashboardAdmin from './components/DashboardAdmin';
import ModulPayroll from './components/ModulPayroll';

export default function App() {
  const [currentView, setCurrentView] = useState<'landing' | 'portal' | 'admin'>('landing');
  const [namaPerusahaan, setNamaPerusahaan] = useState('Enterprise HCM');
  const [activeTab, setActiveTab] = useState<'portal' | 'payroll'>('portal');

  useEffect(() => {
    async function fetchInfoKantor() {
      const { data } = await supabase.from('pengaturan_kantor').select('nama_perusahaan').limit(1).single();
      if (data && data.nama_perusahaan) {
        setNamaPerusahaan(data.nama_perusahaan);
      }
    }
    fetchInfoKantor();
  }, []);

  return (
    <div style={{ minHeight: '100vh', background: '#f8fafc', fontFamily: 'Inter, sans-serif' }}>
      <Navbar namaPerusahaan={namaPerusahaan} onNavClick={(view) => setCurrentView(view)} />

      <main style={{ maxWidth: '1100px', margin: '30px auto', padding: '0 20px' }}>
        {currentView === 'landing' && (
          <LandingPage onMulai={() => setCurrentView('portal')} namaPerusahaan={namaPerusahaan} />
        )}

        {currentView === 'portal' && (
          <div>
            <div style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
              <button onClick={() => setActiveTab('portal')} style={{ padding: '8px 16px', background: activeTab === 'portal' ? '#2563eb' : '#e2e8f0', color: activeTab === 'portal' ? '#fff' : '#475569', border: 'none', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer' }}>Portal Karyawan</button>
              <button onClick={() => setActiveTab('payroll')} style={{ padding: '8px 16px', background: activeTab === 'payroll' ? '#2563eb' : '#e2e8f0', color: activeTab === 'payroll' ? '#fff' : '#475569', border: 'none', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer' }}>Informasi Payroll</button>
            </div>
            {activeTab === 'portal' ? <PortalKaryawan /> : <ModulPayroll />}
          </div>
        )}

        {currentView === 'admin' && (
          <DashboardAdmin />
        )}
      </main>
    </div>
  );
}
