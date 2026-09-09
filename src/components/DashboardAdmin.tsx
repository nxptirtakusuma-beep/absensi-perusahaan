export default function DashboardAdmin() {
  return (
    <div style={{ background: '#fff', padding: '24px', borderRadius: '16px', boxShadow: '0 4px 6px rgba(0,0,0,0.05)' }}>
      <h2 style={{ color: '#1e293b', fontSize: '20px', marginBottom: '16px' }}>📊 Dashboard Eksekutif HR & Admin</h2>
      <p style={{ color: '#64748b', fontSize: '14px', marginBottom: '20px' }}>Pantau kehadiran operasional harian[cite: 1], setujui permohonan cuti[cite: 1], dan kelola database pegawai.</p>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
        <div style={{ background: '#f8fafc', padding: '16px', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
          <h4 style={{ margin: '0 0 8px 0', color: '#475569' }}>Total Pegawai</h4>
          <span style={{ fontSize: '24px', fontWeight: 'bold', color: '#1e293b' }}>24 Orang</span>
        </div>
        <div style={{ background: '#f8fafc', padding: '16px', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
          <h4 style={{ margin: '0 0 8px 0', color: '#475569' }}>Kehadiran Hari Ini</h4>
          <span style={{ fontSize: '24px', fontWeight: 'bold', color: '#16a34a' }}>22 Hadir</span>
        </div>
      </div>
    </div>
  );
}
