interface NavbarProps {
  namaPerusahaan: string;
  onNavClick: (view: 'landing' | 'portal' | 'admin') => void;
}

export default function Navbar({ namaPerusahaan, onNavClick }: NavbarProps) {
  return (
    <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 40px', borderBottom: '1px solid #e2e8f0', background: 'rgba(15, 23, 42, 0.95)', backdropFilter: 'blur(8px)', position: 'sticky', top: 0, zIndex: 100, color: '#fff' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer' }} onClick={() => onNavClick('landing')}>
        <span style={{ fontSize: '18px', background: 'linear-gradient(135deg, #0f172a 0%, #3b82f6 100%)', color: '#d4af37', padding: '6px 10px', borderRadius: '8px', fontWeight: '900', border: '1px solid #d4af37' }}>🌙</span>
        <span style={{ fontSize: '18px', fontWeight: '800', color: '#fff', letterSpacing: '-0.5px' }}>PT. Moonlight <span style={{ color: '#d4af37' }}>Indonesia</span></span>
      </div>
      <nav style={{ display: 'flex', gap: '24px', alignItems: 'center', fontSize: '14px', fontWeight: '600', color: '#cbd5e1' }}>
        <span style={{ cursor: 'pointer' }} onClick={() => onNavClick('landing')}>Beranda</span>
        <span style={{ cursor: 'pointer' }} onClick={() => onNavClick('portal')}>Portal Karyawan</span>
        <span style={{ cursor: 'pointer' }} onClick={() => onNavClick('admin')}>Dashboard HR</span>
      </nav>
    </header>
  );
}
