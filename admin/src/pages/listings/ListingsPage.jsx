import { useEffect, useState } from 'react';
import { getListings, deleteListing } from '../../api/client';

const ListingsPage = () => {
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  const fetchListings = async () => {
    try {
      const res = await getListings();
      setListings(res.data);
    } catch (err) {
      console.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchListings(); }, []);

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this listing?')) return;
    try {
      await deleteListing(id);
      fetchListings();
    } catch (err) {
      alert('Error: ' + err.message);
    }
  };

  const filtered = listings.filter((l) =>
    l.title.toLowerCase().includes(search.toLowerCase()) ||
    (l.business_name || '').toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div>
      <h1 style={styles.title}>Listings</h1>
      <p style={styles.sub}>{listings.length} listings on the marketplace</p>

      <input style={styles.search} placeholder="Search by title or business..."
        value={search} onChange={(e) => setSearch(e.target.value)} />

      <div style={styles.table}>
        <div style={styles.tableHeader}>
          <span>Title</span>
          <span>Business</span>
          <span>Category</span>
          <span>Price</span>
          <span>Stock</span>
          <span>Status</span>
          <span>Actions</span>
        </div>
        {loading ? <div style={styles.empty}>Loading...</div> :
          filtered.length === 0 ? <div style={styles.empty}>No listings found</div> :
          filtered.map((l) => (
            <div key={l.id} style={styles.tableRow}>
              <span style={{ fontWeight: 600 }}>{l.title}</span>
              <span style={{ color: '#FF6B35', fontSize: 13 }}>{l.business_name || '—'}</span>
              <span style={{ color: '#888', fontSize: 13 }}>{l.category || '—'}</span>
              <span style={{ fontWeight: 700 }}>R {parseFloat(l.price).toFixed(2)}</span>
              <span style={{ color: '#555' }}>{l.stock_qty}</span>
              <span>
                <span style={{
                  ...styles.badge,
                  backgroundColor: l.is_available ? '#D1FAE5' : '#FEE2E2',
                  color: l.is_available ? '#065F46' : '#991B1B',
                }}>
                  {l.is_available ? 'Live' : 'Off'}
                </span>
              </span>
              <span>
                <button style={styles.deleteBtn} onClick={() => handleDelete(l.id)}>Delete</button>
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
  sub: { color: '#888', fontSize: 14, margin: '0 0 20px' },
  search: {
    width: '100%', padding: 10, borderRadius: 8, border: '1px solid #ddd',
    fontSize: 14, outline: 'none', marginBottom: 20, boxSizing: 'border-box',
  },
  table: { backgroundColor: '#fff', borderRadius: 12, padding: 24, boxShadow: '0 2px 8px rgba(0,0,0,0.06)' },
  tableHeader: {
    display: 'grid', gridTemplateColumns: '2fr 1.5fr 1fr 0.8fr 0.6fr 0.6fr 0.8fr',
    padding: '8px 0', color: '#888', fontSize: 12, fontWeight: 700,
    textTransform: 'uppercase', borderBottom: '1px solid #f0f0f0', marginBottom: 4,
  },
  tableRow: {
    display: 'grid', gridTemplateColumns: '2fr 1.5fr 1fr 0.8fr 0.6fr 0.6fr 0.8fr',
    padding: '14px 0', borderBottom: '1px solid #f9f9f9',
    fontSize: 14, alignItems: 'center',
  },
  badge: {
    display: 'inline-block', padding: '3px 10px', borderRadius: 20,
    fontSize: 11, fontWeight: 700,
  },
  deleteBtn: {
    padding: '5px 12px', borderRadius: 6, border: 'none',
    backgroundColor: '#FEE2E2', color: '#EF4444',
    cursor: 'pointer', fontSize: 12, fontWeight: 700,
  },
  empty: { padding: 24, textAlign: 'center', color: '#888' },
};

export default ListingsPage;
