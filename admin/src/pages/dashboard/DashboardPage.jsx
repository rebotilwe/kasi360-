import { useEffect, useState } from 'react';
import { getUsers, getListings, getOrders } from '../../api/client';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, BarChart, Bar, Legend,
} from 'recharts';

const StatCard = ({ label, value, color, icon }) => (
  <div style={{ ...styles.card, borderLeft: `4px solid ${color}` }}>
    <div style={styles.cardIcon}>{icon}</div>
    <div style={{ ...styles.cardValue, color }}>{value}</div>
    <div style={styles.cardLabel}>{label}</div>
  </div>
);

const DashboardPage = () => {
  const [stats, setStats] = useState({ users: 0, smmEs: 0, listings: 0, orders: 0, revenue: 0 });
  const [recentOrders, setRecentOrders] = useState([]);
  const [chartData, setChartData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAll = async () => {
      try {
        const [usersRes, listingsRes, ordersRes] = await Promise.all([
          getUsers(), getListings(), getOrders(),
        ]);
        const users = usersRes.data;
        const listings = listingsRes.data;
        const orders = ordersRes.data;
        const revenue = orders.reduce((sum, o) => sum + parseFloat(o.total_amount || 0), 0);

        setStats({
          users: users.filter(u => u.role === 'customer').length,
          smmEs: users.filter(u => u.role === 'smme').length,
          listings: listings.length,
          orders: orders.length,
          revenue,
        });
        setRecentOrders(orders.slice(0, 5));

        // Build chart data — group orders by date
        const grouped = {};
        orders.forEach((o) => {
          const date = new Date(o.created_at).toLocaleDateString('en-ZA', {
            day: 'numeric', month: 'short',
          });
          if (!grouped[date]) grouped[date] = { date, orders: 0, revenue: 0 };
          grouped[date].orders += 1;
          grouped[date].revenue += parseFloat(o.total_amount || 0);
        });
        setChartData(Object.values(grouped).slice(-14)); // last 14 days
      } catch (err) {
        console.error(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchAll();
  }, []);

  const STATUS_COLORS = {
    pending: '#F59E0B', confirmed: '#3B82F6', processing: '#8B5CF6',
    out_for_delivery: '#06B6D4', delivered: '#10B981', cancelled: '#EF4444',
  };

  return (
    <div>
      <h1 style={styles.title}>Dashboard</h1>
      <p style={styles.sub}>Platform overview</p>

      {/* Stat Cards */}
      <div style={styles.grid}>
        <StatCard label="Customers" value={loading ? '...' : stats.users} color="#3B82F6" icon="🛒" />
        <StatCard label="SMMEs / Vendors" value={loading ? '...' : stats.smmEs} color="#FF6B35" icon="🏪" />
        <StatCard label="Listings" value={loading ? '...' : stats.listings} color="#8B5CF6" icon="🛍️" />
        <StatCard label="Orders" value={loading ? '...' : stats.orders} color="#10B981" icon="📦" />
        <StatCard label="Total Revenue" value={loading ? '...' : `R ${stats.revenue.toFixed(2)}`} color="#F59E0B" icon="💰" />
      </div>

      {/* Charts */}
      {chartData.length > 0 && (
        <div style={styles.chartsRow}>
          {/* Revenue Chart */}
          <div style={styles.chartCard}>
            <h2 style={styles.chartTitle}>Revenue Over Time</h2>
            <ResponsiveContainer width="100%" height={220}>
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="revenueGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#FF6B35" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#FF6B35" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="date" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip formatter={(v) => `R ${v.toFixed(2)}`} />
                <Area
                  type="monotone" dataKey="revenue" stroke="#FF6B35"
                  fill="url(#revenueGrad)" strokeWidth={2} name="Revenue (R)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          {/* Orders Chart */}
          <div style={styles.chartCard}>
            <h2 style={styles.chartTitle}>Orders Over Time</h2>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="date" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} allowDecimals={false} />
                <Tooltip />
                <Bar dataKey="orders" fill="#3B82F6" radius={[4, 4, 0, 0]} name="Orders" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* Recent Orders */}
      <div style={styles.section}>
        <h2 style={styles.sectionTitle}>Recent Orders</h2>
        <div style={styles.table}>
          <div style={styles.tableHeader}>
            <span>Order ID</span>
            <span>Customer</span>
            <span>Amount</span>
            <span>Status</span>
            <span>Date</span>
          </div>
          {recentOrders.length === 0 && !loading ? (
            <div style={styles.empty}>No orders yet</div>
          ) : recentOrders.map((o) => (
            <div key={o.id} style={styles.tableRow}>
              <span style={styles.orderId}>#{o.id.slice(0, 8).toUpperCase()}</span>
              <span>{o.customer_name || '—'}</span>
              <span style={{ fontWeight: 700 }}>R {parseFloat(o.total_amount).toFixed(2)}</span>
              <span>
                <span style={{ ...styles.badge, backgroundColor: STATUS_COLORS[o.status] || '#888' }}>
                  {o.status}
                </span>
              </span>
              <span style={{ color: '#888', fontSize: 13 }}>
                {new Date(o.created_at).toLocaleDateString('en-ZA')}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

const styles = {
  title: { fontSize: 28, fontWeight: 800, color: '#1a1a2e', margin: '0 0 4px' },
  sub: { color: '#888', fontSize: 14, margin: '0 0 32px' },
  grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 20, marginBottom: 32 },
  card: { backgroundColor: '#fff', borderRadius: 12, padding: 20, boxShadow: '0 2px 8px rgba(0,0,0,0.06)' },
  cardIcon: { fontSize: 28, marginBottom: 12 },
  cardValue: { fontSize: 32, fontWeight: 800, marginBottom: 4 },
  cardLabel: { color: '#888', fontSize: 14 },
  chartsRow: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginBottom: 32 },
  chartCard: { backgroundColor: '#fff', borderRadius: 12, padding: 24, boxShadow: '0 2px 8px rgba(0,0,0,0.06)' },
  chartTitle: { fontSize: 16, fontWeight: 700, color: '#1a1a2e', margin: '0 0 16px' },
  section: { backgroundColor: '#fff', borderRadius: 12, padding: 24, boxShadow: '0 2px 8px rgba(0,0,0,0.06)' },
  sectionTitle: { fontSize: 18, fontWeight: 700, color: '#1a1a2e', margin: '0 0 20px' },
  table: { display: 'flex', flexDirection: 'column' },
  tableHeader: {
    display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr 1fr',
    padding: '8px 0', color: '#888', fontSize: 12, fontWeight: 700,
    textTransform: 'uppercase', borderBottom: '1px solid #f0f0f0',
  },
  tableRow: {
    display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr 1fr',
    padding: '14px 0', borderBottom: '1px solid #f9f9f9',
    fontSize: 14, alignItems: 'center',
  },
  orderId: { fontWeight: 700, color: '#1a1a2e' },
  badge: {
    display: 'inline-block', padding: '3px 10px', borderRadius: 20,
    color: '#fff', fontSize: 11, fontWeight: 700,
  },
  empty: { padding: 24, textAlign: 'center', color: '#888' },
};

export default DashboardPage;