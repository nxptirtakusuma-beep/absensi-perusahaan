export default function ModulPayroll() {
  return (
    <div style={{ background: '#fff', padding: '24px', borderRadius: '16px', boxShadow: '0 4px 6px rgba(0,0,0,0.05)' }}>
      <h2 style={{ color: '#0f172a', fontSize: '20px', marginBottom: '16px' }}>💰 Informasi & Kebijakan Payroll PT. Moonlight Indonesia</h2>
      <p style={{ color: '#64748b', fontSize: '14px', lineHeight: '1.6', marginBottom: '20px' }}>Modul penggajian otomatis yang terintegrasi secara langsung dengan rekapitulasi kehadiran, akumulasi jam kerja real-time, serta komponen tunjangan korporat.</p>
      <div style={{ background: '#f8fafc', padding: '16px', borderRadius: '12px', border: '1px solid #e2e8f0', maxWidth: '400px' }}>
        <h4 style={{ margin: '0 0 8px 0', color: '#0f172a' }}>Standar Kompensasi</h4>
        <ul style={{ paddingLeft: '20px', color: '#475569', fontSize: '13px', margin: 0 }}>
          <li>Gaji pokok diatur langsung oleh Admin HR.</li>
          <li>Perhitungan lembur berbasis total jam kerja aktual.</li>
          <li>Slip gaji resmi dapat diunduh mandiri oleh karyawan dalam bentuk PDF.</li>
        </ul>
      </div>
    </div>
  );
}
