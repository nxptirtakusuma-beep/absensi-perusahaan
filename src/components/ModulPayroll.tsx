export default function ModulPayroll() {
  return (
    <div style={{ background: '#fff', padding: '24px', borderRadius: '16px', boxShadow: '0 4px 6px rgba(0,0,0,0.05)' }}>
      <h2 style={{ color: '#1e293b', fontSize: '20px', marginBottom: '16px' }}>💰 Modul Penggajian (Payroll Engine)</h2>
      <p style={{ color: '#64748b', fontSize: '14px', marginBottom: '20px' }}>Penghitungan kompensasi gaji otomatis berbasis akumulasi kehadiran[cite: 1], lembur, dan potongan keterlambatan[cite: 1].</p>
      <button onClick={() => alert('Memproses kalkulasi slip gaji bulanan...')} style={{ background: '#10b981', color: '#fff', border: 'none', padding: '10px 20px', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer' }}>
        Hitung Gaji Bulan Ini
      </button>
    </div>
  );
}
