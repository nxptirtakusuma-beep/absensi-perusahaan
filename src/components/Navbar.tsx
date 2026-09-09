interface NavbarProps {
  namaPerusahaan: string;
  onNavClick: (view: 'landing' | 'portal' | 'admin') => void;
}

export default function Navbar({ namaPerusahaan, onNavClick }: NavbarProps) {
  return (
    <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '20px 40px', borderBottom: '1px solid #f3f4f6', background: 'rgba(255,255,255,0.9)', backdropFilter: 'blur(8px)', position: 'sticky', top: 0, zIndex: 100 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' }} onClick={() => onNavClick('landing')}>
        <span style={{ fontSize: '20px', background: '#2563eb', color: '#fff', padding: '6px 12px', borderRadius: '8px', fontWeight: '900' }}>⚡</span>
        <span style={{ fontSize: '18px', fontWeight: '800', color: '#1e293b' }}>{namaPerusahaan}</span>
      </div>
      <nav style={{ display: 'flex', gap: '20px', alignItems: 'center', fontSize: '14px', fontWeight: '600', color: '#4b5563' }}>
        <span style={{ cursor: 'pointer' }} onClick={() => onNavClick('landing')}>Beranda</span>
        <span style={{ cursor: 'pointer' }} onClick={() => onNavClick('portal')}>Portal Karyawan</span>
        <span style={{ cursor: 'pointer' }} onClick={() => onNavClick('admin')}>Dashboard HR</span>
      </nav>
    </header>
  );
}
