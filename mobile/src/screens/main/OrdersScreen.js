import React, { useEffect, useState, useCallback } from 'react';
import {
  View, Text, FlatList, StyleSheet, ActivityIndicator,
  RefreshControl, TouchableOpacity,
} from 'react-native';
import { getOrders } from '../../api/client';

const STATUS_COLORS = {
  pending: '#F59E0B',
  confirmed: '#3B82F6',
  processing: '#8B5CF6',
  out_for_delivery: '#06B6D4',
  delivered: '#10B981',
  cancelled: '#EF4444',
};

const OrderCard = ({ item, onPress }) => (
  <TouchableOpacity style={styles.card} onPress={() => onPress(item)}>
    <View style={styles.cardTop}>
      <Text style={styles.orderId}>Order #{item.id.slice(0, 8).toUpperCase()}</Text>
      <View style={[styles.badge, { backgroundColor: STATUS_COLORS[item.status] || '#888' }]}>
        <Text style={styles.badgeText}>{item.status.replace(/_/g, ' ')}</Text>
      </View>
    </View>
    {item.business_name && (
      <Text style={styles.business}>{item.business_name}</Text>
    )}
    {item.customer_name && (
      <Text style={styles.customer}>Customer: {item.customer_name}</Text>
    )}
    <Text style={styles.amount}>R {parseFloat(item.total_amount).toFixed(2)}</Text>
    <Text style={styles.date}>{new Date(item.created_at).toLocaleDateString('en-ZA')}</Text>
    <Text style={styles.tapHint}>Tap to view details →</Text>
  </TouchableOpacity>
);

const OrdersScreen = ({ navigation }) => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchOrders = useCallback(async () => {
    try {
      const data = await getOrders();
      setOrders(data);
    } catch (err) {
      console.error(err.message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => { fetchOrders(); }, [fetchOrders]);

  const onRefresh = () => { setRefreshing(true); fetchOrders(); };

  if (loading) {
    return <View style={styles.center}><ActivityIndicator size="large" color="#FF6B35" /></View>;
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>My Orders</Text>
      </View>
      {orders.length === 0 ? (
        <View style={styles.center}>
          <Text style={styles.emptyText}>No orders yet</Text>
          <Text style={styles.emptySubText}>Your orders will appear here</Text>
        </View>
      ) : (
        <FlatList
          data={orders}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <OrderCard
              item={item}
              onPress={(o) => navigation.navigate('OrderDetail', { order_id: o.id })}
            />
          )}
          contentContainerStyle={styles.list}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#FF6B35" />}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f9f9f9' },
  header: { backgroundColor: '#FF6B35', padding: 20, paddingTop: 56, paddingBottom: 24 },
  headerTitle: { fontSize: 22, fontWeight: '800', color: '#fff' },
  list: { padding: 16, gap: 12 },
  card: {
    backgroundColor: '#fff', borderRadius: 12, padding: 16,
    borderWidth: 1, borderColor: '#eee',
  },
  cardTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  orderId: { fontSize: 13, fontWeight: '700', color: '#333' },
  badge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20 },
  badgeText: { color: '#fff', fontSize: 11, fontWeight: '700', textTransform: 'capitalize' },
  business: { fontSize: 13, color: '#FF6B35', marginBottom: 4, fontWeight: '600' },
  customer: { fontSize: 13, color: '#555', marginBottom: 4 },
  amount: { fontSize: 18, fontWeight: '800', color: '#222', marginTop: 4 },
  date: { fontSize: 12, color: '#aaa', marginTop: 4 },
  tapHint: { fontSize: 11, color: '#ccc', marginTop: 6, textAlign: 'right' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  emptyText: { fontSize: 18, fontWeight: '700', color: '#333', marginBottom: 4 },
  emptySubText: { fontSize: 14, color: '#888' },
});

export default OrdersScreen;