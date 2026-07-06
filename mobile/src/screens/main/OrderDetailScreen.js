import React, { useEffect, useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView,
  ActivityIndicator, Image, TouchableOpacity, TextInput, Platform,
} from 'react-native';
import { useAuth } from '../../context/AuthContext';

const BASE_URL = 'https://kasi360.onrender.com';

const getToken = async () => {
  if (Platform.OS === 'web') {
    return localStorage.getItem('kasi360_token');
  }
  const SecureStore = await import('expo-secure-store');
  return await SecureStore.getItemAsync('kasi360_token');
};

const STATUS_COLORS = {
  pending: '#F59E0B', confirmed: '#3B82F6', processing: '#8B5CF6',
  out_for_delivery: '#06B6D4', delivered: '#10B981', cancelled: '#EF4444',
};

const StarRating = ({ rating, onRate, readonly = false }) => (
  <View style={styles.starsRow}>
    {[1, 2, 3, 4, 5].map((star) => (
      <TouchableOpacity key={star} onPress={() => !readonly && onRate(star)} disabled={readonly}>
        <Text style={[styles.star, star <= rating && styles.starFilled]}>★</Text>
      </TouchableOpacity>
    ))}
  </View>
);

const OrderDetailScreen = ({ route }) => {
  const { order_id } = route.params;
  const { user } = useAuth();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [existingReview, setExistingReview] = useState(null);
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [reviewLoading, setReviewLoading] = useState(false);
  const [reviewStatus, setReviewStatus] = useState(null);

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        const token = await getToken();
        const res = await fetch(`${BASE_URL}/api/orders/${order_id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        setOrder(data);

        if (user?.role === 'customer') {
          const revRes = await fetch(`${BASE_URL}/api/reviews/order/${order_id}`, {
            headers: { Authorization: `Bearer ${token}` },
          });
          const revData = await revRes.json();
          if (revData) {
            setExistingReview(revData);
            setRating(revData.rating);
            setComment(revData.comment || '');
          }
        }
      } catch (err) {
        console.error(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchOrder();
  }, [order_id]);

  const handleReview = async () => {
    if (rating === 0) {
      setReviewStatus({ type: 'error', msg: 'Please select a star rating' });
      return;
    }
    setReviewLoading(true);
    setReviewStatus(null);
    try {
      const token = await getToken();
      const res = await fetch(`${BASE_URL}/api/reviews`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          order_id,
          business_id: order.business_id,
          rating,
          comment,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      setExistingReview(data);
      setReviewStatus({ type: 'success', msg: '✅ Review submitted! Thank you.' });
    } catch (err) {
      setReviewStatus({ type: 'error', msg: '❌ ' + err.message });
    } finally {
      setReviewLoading(false);
    }
  };

  if (loading) {
    return <View style={styles.center}><ActivityIndicator size="large" color="#FF6B35" /></View>;
  }

  if (!order) {
    return <View style={styles.center}><Text style={styles.emptyText}>Order not found</Text></View>;
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.orderId}>Order #{order.id.slice(0, 8).toUpperCase()}</Text>
        <View style={[styles.badge, { backgroundColor: STATUS_COLORS[order.status] || '#888' }]}>
          <Text style={styles.badgeText}>{order.status.replace(/_/g, ' ')}</Text>
        </View>
      </View>

      <View style={styles.section}>
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Business</Text>
          <Text style={styles.infoValue}>{order.business_name}</Text>
        </View>
        {order.customer_name && (
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Customer</Text>
            <Text style={styles.infoValue}>{order.customer_name}</Text>
          </View>
        )}
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Date</Text>
          <Text style={styles.infoValue}>
            {new Date(order.created_at).toLocaleDateString('en-ZA', {
              day: 'numeric', month: 'long', year: 'numeric',
            })}
          </Text>
        </View>
        {order.delivery_address && (
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Delivery</Text>
            <Text style={styles.infoValue}>{order.delivery_address}</Text>
          </View>
        )}
        {order.notes && (
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Notes</Text>
            <Text style={styles.infoValue}>{order.notes}</Text>
          </View>
        )}
      </View>

      <Text style={styles.sectionTitle}>Items</Text>
      <View style={styles.section}>
        {order.items?.map((item, index) => (
          <View key={item.id} style={[
            styles.itemRow,
            index < order.items.length - 1 && styles.itemBorder,
          ]}>
            {item.image_url ? (
              <Image source={{ uri: item.image_url }} style={styles.itemImage} />
            ) : (
              <View style={styles.itemImagePlaceholder}>
                <Text style={styles.itemEmoji}>🛍️</Text>
              </View>
            )}
            <View style={styles.itemBody}>
              <Text style={styles.itemTitle}>{item.title}</Text>
              <Text style={styles.itemType}>{item.listing_type}</Text>
              <Text style={styles.itemQty}>Qty: {item.quantity}</Text>
            </View>
            <View style={styles.itemPriceCol}>
              <Text style={styles.itemUnitPrice}>R {parseFloat(item.unit_price).toFixed(2)}</Text>
              <Text style={styles.itemTotal}>
                R {(parseFloat(item.unit_price) * item.quantity).toFixed(2)}
              </Text>
            </View>
          </View>
        ))}
      </View>

      <View style={styles.totalSection}>
        <View style={styles.totalRow}>
          <Text style={styles.totalLabel}>Subtotal</Text>
          <Text style={styles.totalValue}>R {parseFloat(order.total_amount).toFixed(2)}</Text>
        </View>
        <View style={styles.totalRow}>
          <Text style={styles.totalLabel}>Delivery</Text>
          <Text style={styles.totalValue}>TBC</Text>
        </View>
        <View style={[styles.totalRow, styles.grandTotalRow]}>
          <Text style={styles.grandTotalLabel}>Total</Text>
          <Text style={styles.grandTotalValue}>R {parseFloat(order.total_amount).toFixed(2)}</Text>
        </View>
      </View>

      {user?.role === 'customer' && (
        <View style={styles.reviewSection}>
          <Text style={styles.sectionTitle}>
            {existingReview ? 'Your Review' : 'Leave a Review'}
          </Text>

          {reviewStatus && (
            <View style={[styles.statusBox, reviewStatus.type === 'success' ? styles.statusSuccess : styles.statusError]}>
              <Text style={styles.statusText}>{reviewStatus.msg}</Text>
            </View>
          )}

          <StarRating rating={rating} onRate={setRating} readonly={!!existingReview} />

          <TextInput
            style={[styles.input, existingReview && styles.inputReadonly]}
            placeholder="Write a comment (optional)"
            placeholderTextColor="#aaa"
            value={comment}
            onChangeText={setComment}
            multiline
            numberOfLines={3}
            textAlignVertical="top"
            editable={!existingReview}
          />

          {!existingReview && (
            <TouchableOpacity style={styles.reviewBtn} onPress={handleReview} disabled={reviewLoading}>
              {reviewLoading
                ? <ActivityIndicator color="#fff" />
                : <Text style={styles.reviewBtnText}>Submit Review</Text>}
            </TouchableOpacity>
          )}

          {existingReview && (
            <Text style={styles.reviewedNote}>✅ You reviewed this order</Text>
          )}
        </View>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f9f9f9' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  emptyText: { fontSize: 16, color: '#888' },
  header: {
    backgroundColor: '#FF6B35', padding: 20, paddingTop: 24,
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
  },
  orderId: { fontSize: 18, fontWeight: '800', color: '#fff' },
  badge: { paddingHorizontal: 12, paddingVertical: 5, borderRadius: 20 },
  badgeText: { color: '#fff', fontSize: 12, fontWeight: '700', textTransform: 'capitalize' },
  section: {
    backgroundColor: '#fff', marginHorizontal: 16, marginTop: 16,
    borderRadius: 12, borderWidth: 1, borderColor: '#eee', overflow: 'hidden',
  },
  infoRow: {
    flexDirection: 'row', justifyContent: 'space-between',
    padding: 14, borderBottomWidth: 1, borderBottomColor: '#f5f5f5',
  },
  infoLabel: { fontSize: 13, color: '#888' },
  infoValue: { fontSize: 13, fontWeight: '600', color: '#333', maxWidth: '60%', textAlign: 'right' },
  sectionTitle: { fontSize: 16, fontWeight: '700', color: '#333', marginHorizontal: 16, marginTop: 20, marginBottom: 4 },
  itemRow: { flexDirection: 'row', padding: 14, alignItems: 'center' },
  itemBorder: { borderBottomWidth: 1, borderBottomColor: '#f5f5f5' },
  itemImage: { width: 56, height: 56, borderRadius: 8, resizeMode: 'cover' },
  itemImagePlaceholder: {
    width: 56, height: 56, borderRadius: 8,
    backgroundColor: '#FFF4F0', justifyContent: 'center', alignItems: 'center',
  },
  itemEmoji: { fontSize: 24 },
  itemBody: { flex: 1, paddingHorizontal: 12 },
  itemTitle: { fontSize: 14, fontWeight: '700', color: '#222', marginBottom: 2 },
  itemType: { fontSize: 11, color: '#aaa', textTransform: 'capitalize', marginBottom: 2 },
  itemQty: { fontSize: 12, color: '#888' },
  itemPriceCol: { alignItems: 'flex-end' },
  itemUnitPrice: { fontSize: 12, color: '#aaa', marginBottom: 2 },
  itemTotal: { fontSize: 14, fontWeight: '800', color: '#222' },
  totalSection: {
    backgroundColor: '#fff', marginHorizontal: 16, marginTop: 16,
    borderRadius: 12, borderWidth: 1, borderColor: '#eee', padding: 16,
  },
  totalRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10 },
  totalLabel: { fontSize: 14, color: '#888' },
  totalValue: { fontSize: 14, color: '#333', fontWeight: '600' },
  grandTotalRow: {
    borderTopWidth: 1, borderTopColor: '#eee',
    paddingTop: 12, marginTop: 4, marginBottom: 0,
  },
  grandTotalLabel: { fontSize: 16, fontWeight: '800', color: '#222' },
  grandTotalValue: { fontSize: 18, fontWeight: '800', color: '#FF6B35' },
  reviewSection: {
    backgroundColor: '#fff', marginHorizontal: 16, marginTop: 16, marginBottom: 32,
    borderRadius: 12, borderWidth: 1, borderColor: '#eee', padding: 16,
  },
  starsRow: { flexDirection: 'row', gap: 8, marginBottom: 16, marginTop: 8 },
  star: { fontSize: 36, color: '#ddd' },
  starFilled: { color: '#F59E0B' },
  input: {
    borderWidth: 1, borderColor: '#ddd', borderRadius: 10,
    padding: 12, fontSize: 14, color: '#333', marginBottom: 14,
    minHeight: 80,
  },
  inputReadonly: { backgroundColor: '#f9f9f9', color: '#888' },
  reviewBtn: {
    backgroundColor: '#FF6B35', borderRadius: 10,
    padding: 14, alignItems: 'center',
  },
  reviewBtnText: { color: '#fff', fontWeight: '700', fontSize: 15 },
  reviewedNote: { fontSize: 13, color: '#10B981', fontWeight: '600', textAlign: 'center' },
  statusBox: { padding: 12, borderRadius: 8, marginBottom: 14 },
  statusSuccess: { backgroundColor: '#D1FAE5' },
  statusError: { backgroundColor: '#FEE2E2' },
  statusText: { fontSize: 14, fontWeight: '600' },
});

export default OrderDetailScreen;