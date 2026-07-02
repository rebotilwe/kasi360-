import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../api/AuthContext';

const links = [
  { to: '/', label: '📊 Dashboard' },
  { to: '/users', label: '👥 Users' },
  { to: '/listings', label: '🛍️ Listings' },
  { to: '/orders', label: '📦 Orders' },
];

const Sidebar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => { logout(); navigate('/login'); };

  return (
    <aside style={styles.sidebar}>
      <div style={styles.logo}>
        <span style={styles.logoText}>Kasi360</span>
        <span style={styles.logoSub}>Admin</span>
      </div>

      <nav style={styles.nav}>
        {links.map((l) => (
          <NavLink key={l.to} to={l.to} end={l.to === '/'}
            style={({ isActive }) => ({ ...styles.link, ...(isActive ? styles.linkActive : {}) })}>
            {l.label}
          </NavLink>
        ))}
      </nav>

      <div style={styles.bottom}>
        <div style={styles.userInfo}>
          <div style={styles.avatar}>{user?.name?.charAt(0)}</div>
          <div>
            <div style={styles.userName}>{user?.name}</div>
            <div style={styles.userRole}>Administrator</div>
          </div>
        </div>
        <button style={styles.logoutBtn} onClick={handleLogout}>Logout</button>
      </div>
    </aside>
  );
};

const styles = {
  sidebar: {
    width: 240, height: '100vh', backgroundColor: '#1a1a2e',
    display: 'flex', flexDirection: 'column', position: 'fixed', left: 0, top: 0,
  },
  logo: {
    padding: '24px 20px', borderBottom: '1px solid rgba(255,255,255,0.1)',
    display: 'flex', flexDirection: 'column',
  },
  logoText: { fontSize: 24, fontWeight: 800, color: '#FF6B35' },
  logoSub: { fontSize: 11, color: 'rgba(255,255,255,0.4)', letterSpacing: 3, textTransform: 'uppercase' },
  nav: { flex: 1, padding: '16px 12px', display: 'flex', flexDirection: 'column', gap: 4 },
  link: {
    display: 'block', padding: '10px 12px', borderRadius: 8, color: 'rgba(255,255,255,0.6)',
    textDecoration: 'none', fontSize: 14, fontWeight: 500, transition: 'all 0.2s',
  },
  linkActive: { backgroundColor: '#FF6B35', color: '#fff' },
  bottom: { padding: 16, borderTop: '1px solid rgba(255,255,255,0.1)' },
  userInfo: { display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 },
  avatar: {
    width: 36, height: 36, borderRadius: '50%', backgroundColor: '#FF6B35',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    color: '#fff', fontWeight: 700, fontSize: 16,
  },
  userName: { color: '#fff', fontSize: 13, fontWeight: 600 },
  userRole: { color: 'rgba(255,255,255,0.4)', fontSize: 11 },
  logoutBtn: {
    width: '100%', padding: '8px', borderRadius: 8, border: 'none',
    backgroundColor: 'rgba(239,68,68,0.15)', color: '#EF4444',
    cursor: 'pointer', fontSize: 13, fontWeight: 600,
  },
};

export default Sidebar;
