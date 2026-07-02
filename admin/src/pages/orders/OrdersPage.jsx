import { useEffect, useState } from 'react';
import { getOrders, updateOrderStatus } from '../../api/client';

const STATUSES = ['pending', 'confirmed', 'processing', 'out_for_delivery', 'delivered', 'cancelled'];
const STATUS_COLORS = {
  pending: '#F59E0B', confirmed: '#3B82F6', processing: '#8B5CF6',
  out_for_delivery: '#06B6D4', delivered: '#10B981', cancelled: '#EF4444',
};

const OrdersPage = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  const fetchOrders = async () => {
    try {
      const res = await getOrders();
      setOrders(res.data);
    } catch (err) {
      console.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchOrders(); }, []);

  const handleStatusChange = async (id, status) => {
    try {
      await updateOrderStatus(id, status);
      fetchOrders();
    } catch (err) {
      alert('Error: ' + err.message);
    }
  };

  const filtered = filter === 'all' ? orders : orders.filter((o) => o.status === filter);

  return (
    <div>
      <h1 style={styles.title}>Orders</h1>
      <p style={styles.sub}>{orders.length} total orders</p>

      <div style={styles.filters}>
        {['all', ...STATUSES].map((s) => (
          <button key={s} onClick={() => setFilter(s)}
            style={{ ...styles.filterBtn, ...(filter === s ? styles.filterBtnActive : {}) }}>
            {s.replace(/_/g, ' ')}
          </button>
        ))}
      </div>

      <div style={styles.table}>
        <div style={styles.tableHeader}>
          <span>Order ID</span>
          <span>Customer</span>
          <span>Business</span>
          <span>Amount</span>
          <span>Date</span>
          <span>Status</span>
          <span>Update</span>
        </div>
        {loading ? <div style={styles.empty}>Loading...</div> :
          filtered.length === 0 ? <div style={styles.empty}>No orders found</div> :
          filtered.map((o) => (
            <div key={o.id} style={styles.tableRow}>
              <span style={{ fontWeight: 700, fontSize: 13 }}>#{o.id.slice(0, 8).toUpperCase()}</span>
              <span style={{ fontSize: 13 }}>{o.customer_name || '—'}</span>
              <span style={{ color: '#FF6B35', fontSize: 13 }}>{o.business_name || '—'}</span>
              <span style={{ fontWeight: 700 }}>R {parseFloat(o.total_amount).toFixed(2)}</span>
              <span style={{ color: '#888', fontSize: 12 }}>
                {new Date(o.created_at).toLocaleDateString('en-ZA')}
              </span>
              <span>
                <span style={{ ...styles.badge, backgroundColor: STATUS_COLORS[o.status] }}>
                  {o.status.replace(/_/g, ' ')}
                </span>
              </span>
              <span>
                <select style={styles.select} value={o.status}
                  onChange={(e) => handleStatusChange(o.id, e.target.value)}>
                  {STATUSES.map((s) => (
                    <option key={s} value={s}>{s.replace(/_/g, ' ')}</option>
                  ))}
                </select>
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
  filters: { display: 'flex', gap: 8, marginBottom: 20, flexWrap: 'wrap' },
  filterBtn: {
    padding: '6px 14px', borderRadius: 20, border: '1px solid #ddd',
    backgroundColor: '#fff', cursor: 'pointer', fontSize: 12, textTransform: 'capitalize',
  },
  filterBtnActive: { backgroundColor: '#FF6B35', color: '#fff', borderColor: '#FF6B35' },
  table: { backgroundColor: '#fff', borderRadius: 12, padding: 24, boxShadow: '0 2px 8px rgba(0,0,0,0.06)' },
  tableHeader: {
    display: 'grid', gridTemplateColumns: '1fr 1.2fr 1.2fr 0.8fr 0.8fr 1fr 1.2fr',
    padding: '8px 0', color: '#888', fontSize: 12, fontWeight: 700,
    textTransform: 'uppercase', borderBottom: '1px solid #f0f0f0', marginBottom: 4,
  },
  tableRow: {
    display: 'grid', gridTemplateColumns: '1fr 1.2fr 1.2fr 0.8fr 0.8fr 1fr 1.2fr',
    padding: '14px 0', borderBottom: '1px solid #f9f9f9',
    fontSize: 14, alignItems: 'center',
  },
  badge: {
    display: 'inline-block', padding: '3px 10px', borderRadius: 20,
    color: '#fff', fontSize: 11, fontWeight: 700, textTransform: 'capitalize',
  },
  select: {
    padding: '5px 8px', borderRadius: 6, border: '1px solid #ddd',
    fontSize: 12, cursor: 'pointer', outline: 'none',
  },
  empty: { padding: 24, textAlign: 'center', color: '#888' },
};

export default OrdersPage;
