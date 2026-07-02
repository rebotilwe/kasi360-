import { useEffect, useState } from 'react';
import { getUsers, toggleUser } from '../../api/client';

const UsersPage = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [search, setSearch] = useState('');

  const fetchUsers = async () => {
    try {
      const res = await getUsers();
      setUsers(res.data);
    } catch (err) {
      console.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchUsers(); }, []);

  const handleToggle = async (user) => {
    try {
      await toggleUser(user.id, !user.is_active);
      fetchUsers();
    } catch (err) {
      alert('Error: ' + err.message);
    }
  };

  const filtered = users.filter((u) => {
    const matchRole = filter === 'all' || u.role === filter;
    const matchSearch = u.name.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase());
    return matchRole && matchSearch;
  });

  const ROLE_COLORS = { admin: '#8B5CF6', smme: '#FF6B35', customer: '#3B82F6' };

  return (
    <div>
      <h1 style={styles.title}>Users</h1>
      <p style={styles.sub}>{users.length} total users on the platform</p>

      <div style={styles.toolbar}>
        <input style={styles.search} placeholder="Search by name or email..."
          value={search} onChange={(e) => setSearch(e.target.value)} />
        <div style={styles.filters}>
          {['all', 'customer', 'smme', 'admin'].map((r) => (
            <button key={r} onClick={() => setFilter(r)}
              style={{ ...styles.filterBtn, ...(filter === r ? styles.filterBtnActive : {}) }}>
              {r.charAt(0).toUpperCase() + r.slice(1)}
            </button>
          ))}
        </div>
      </div>

      <div style={styles.table}>
        <div style={styles.tableHeader}>
          <span>Name</span>
          <span>Email</span>
          <span>Phone</span>
          <span>Role</span>
          <span>Joined</span>
          <span>Status</span>
        </div>
        {loading ? <div style={styles.empty}>Loading...</div> :
          filtered.length === 0 ? <div style={styles.empty}>No users found</div> :
          filtered.map((u) => (
            <div key={u.id} style={styles.tableRow}>
              <span style={{ fontWeight: 600 }}>{u.name}</span>
              <span style={{ color: '#555', fontSize: 13 }}>{u.email}</span>
              <span style={{ color: '#888', fontSize: 13 }}>{u.phone || '—'}</span>
              <span>
                <span style={{ ...styles.badge, backgroundColor: ROLE_COLORS[u.role] }}>
                  {u.role}
                </span>
              </span>
              <span style={{ color: '#888', fontSize: 13 }}>
                {new Date(u.created_at).toLocaleDateString('en-ZA')}
              </span>
              <span>
                <button
                  onClick={() => handleToggle(u)}
                  style={{ ...styles.toggleBtn, ...(u.is_active ? styles.toggleActive : styles.toggleInactive) }}>
                  {u.is_active ? 'Active' : 'Suspended'}
                </button>
              </span>
            </div>
          ))
        }
      </div>
    </div>
  );
};

const styles = {
  title: { fontSize: 28, fontWeight: 800, color: '#1a1a2e', margin: '0 0 4px' },
  sub: { color: '#888', fontSize: 14, margin: '0 0 24px' },
  toolbar: { display: 'flex', gap: 16, marginBottom: 20, alignItems: 'center', flexWrap: 'wrap' },
  search: {
    flex: 1, minWidth: 200, padding: 10, borderRadius: 8,
    border: '1px solid #ddd', fontSize: 14, outline: 'none',
  },
  filters: { display: 'flex', gap: 8 },
  filterBtn: {
    padding: '8px 16px', borderRadius: 20, border: '1px solid #ddd',
    backgroundColor: '#fff', cursor: 'pointer', fontSize: 13,
  },
  filterBtnActive: { backgroundColor: '#FF6B35', color: '#fff', borderColor: '#FF6B35' },
  table: { backgroundColor: '#fff', borderRadius: 12, padding: 24, boxShadow: '0 2px 8px rgba(0,0,0,0.06)' },
  tableHeader: {
    display: 'grid', gridTemplateColumns: '1.5fr 2fr 1fr 0.8fr 1fr 1fr',
    padding: '8px 0', color: '#888', fontSize: 12, fontWeight: 700,
    textTransform: 'uppercase', borderBottom: '1px solid #f0f0f0', marginBottom: 4,
  },
  tableRow: {
    display: 'grid', gridTemplateColumns: '1.5fr 2fr 1fr 0.8fr 1fr 1fr',
    padding: '14px 0', borderBottom: '1px solid #f9f9f9',
    fontSize: 14, alignItems: 'center',
  },
  badge: {
    display: 'inline-block', padding: '3px 10px', borderRadius: 20,
    color: '#fff', fontSize: 11, fontWeight: 700,
  },
  toggleBtn: {
    padding: '5px 12px', borderRadius: 20, border: 'none',
    cursor: 'pointer', fontSize: 12, fontWeight: 700,
  },
  toggleActive: { backgroundColor: '#D1FAE5', color: '#065F46' },
  toggleInactive: { backgroundColor: '#FEE2E2', color: '#991B1B' },
  empty: { padding: 24, textAlign: 'center', color: '#888' },
};

export default UsersPage;
