import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  Image, TextInput, ActivityIndicator,
} from 'react-native';
import { useAuth } from '../../context/AuthContext';

const ListingDetailScreen = ({ route, navigation }) => {
  const { listing } = route.params;
  const { user } = useAuth();
  const [deliveryAddress, setDeliveryAddress] = useState('');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState(null);

  const handleOrder = async () => {
    if (user?.role !== 'customer') {
      setStatus({ type: 'error', msg: 'Only customers can place orders' });
      return;
    }
    if (!deliveryAddress.trim()) {
      setStatus({ type: 'error', msg: 'Please enter a delivery address' });
      return;
    }
    setLoading(true);
    setStatus(null);
    try {
      const token = localStorage.getItem('kasi360_token');
      const res = await fetch('https://kasi360.onrender.com/api/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          business_id: listing.business_id,
          items: [{ listing_id: listing.id, quantity: 1 }],
          delivery_address: deliveryAddress,
          notes: notes,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      setStatus({ type: 'success', msg: '✅ Order placed successfully!' });
      setTimeout(() => navigation.navigate('Orders'), 1500);
    } catch (err) {
      setStatus({ type: 'error', msg: '❌ ' + err.message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container}>
      {listing.image_url ? (
        <Image source={{ uri: listing.image_url }} style={styles.image} />
      ) : (
        <View style={styles.imagePlaceholder}>
          <Text style={styles.emoji}>🛍️</Text>
        </View>
      )}
      <View style={styles.body}>
        <Text style={styles.title}>{listing.title}</Text>
        <Text style={styles.business}>{listing.business_name}</Text>
        <Text style={styles.location}>📍 {listing.location || 'Location TBC'}</Text>
        <Text style={styles.price}>R {parseFloat(listing.price).toFixed(2)}</Text>

        {listing.description ? (
          <>
            <Text style={styles.sectionTitle}>About this listing</Text>
            <Text style={styles.description}>{listing.description}</Text>
          </>
        ) : null}

        <View style={styles.metaRow}>
          <View style={styles.metaItem}>
            <Text style={styles.metaLabel}>Type</Text>
            <Text style={styles.metaValue}>{listing.listing_type || 'Product'}</Text>
          </View>
          <View style={styles.metaItem}>
            <Text style={styles.metaLabel}>Stock</Text>
            <Text style={styles.metaValue}>{listing.stock_qty ?? '—'}</Text>
          </View>
          <View style={styles.metaItem}>
            <Text style={styles.metaLabel}>Category</Text>
            <Text style={styles.metaValue}>{listing.category || '—'}</Text>
          </View>
        </View>

        {user?.role === 'customer' && (
          <View style={styles.orderSection}>
            <Text style={styles.sectionTitle}>Place Order</Text>

            {status && (
              <View style={[styles.statusBox, status.type === 'success' ? styles.statusSuccess : styles.statusError]}>
                <Text style={styles.statusText}>{status.msg}</Text>
              </View>
            )}

            <TextInput
              style={styles.input}
              placeholder="Delivery address *"
              placeholderTextColor="#aaa"
              value={deliveryAddress}
              onChangeText={setDeliveryAddress}
            />
            <TextInput
              style={[styles.input, styles.textarea]}
              placeholder="Notes for vendor (optional)"
              placeholderTextColor="#aaa"
              value={notes}
              onChangeText={setNotes}
              multiline
              numberOfLines={3}
              textAlignVertical="top"
            />

            <TouchableOpacity
              style={styles.orderBtn}
              onPress={handleOrder}
              disabled={loading}>
              {loading
                ? <ActivityIndicator color="#fff" />
                : <Text style={styles.orderBtnText}>Place Order — R {parseFloat(listing.price).toFixed(2)}</Text>}
            </TouchableOpacity>
          </View>
        )}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  image: { width: '100%', height: 220, resizeMode: 'cover' },
  imagePlaceholder: {
    height: 200, backgroundColor: '#FFF4F0',
    justifyContent: 'center', alignItems: 'center',
  },
  emoji: { fontSize: 64 },
  body: { padding: 20 },
  title: { fontSize: 22, fontWeight: '800', color: '#222', marginBottom: 4 },
  business: { fontSize: 14, color: '#FF6B35', marginBottom: 4, fontWeight: '600' },
  location: { fontSize: 13, color: '#888', marginBottom: 12 },
  price: { fontSize: 28, fontWeight: '800', color: '#222', marginBottom: 20 },
  sectionTitle: { fontSize: 15, fontWeight: '700', color: '#333', marginBottom: 8 },
  description: { fontSize: 14, color: '#555', lineHeight: 22, marginBottom: 20 },
  metaRow: { flexDirection: 'row', gap: 12, marginBottom: 28 },
  metaItem: {
    flex: 1, backgroundColor: '#f9f9f9', borderRadius: 10,
    padding: 12, alignItems: 'center',
  },
  metaLabel: { fontSize: 11, color: '#aaa', marginBottom: 4 },
  metaValue: { fontSize: 14, fontWeight: '700', color: '#333' },
  orderSection: {
    borderTopWidth: 1, borderTopColor: '#f0f0f0', paddingTop: 20,
  },
  statusBox: { padding: 12, borderRadius: 8, marginBottom: 14 },
  statusSuccess: { backgroundColor: '#D1FAE5' },
  statusError: { backgroundColor: '#FEE2E2' },
  statusText: { fontSize: 14, fontWeight: '600' },
  input: {
    borderWidth: 1, borderColor: '#ddd', borderRadius: 10,
    padding: 14, fontSize: 15, marginBottom: 14, color: '#333',
  },
  textarea: { height: 80 },
  orderBtn: {
    backgroundColor: '#FF6B35', borderRadius: 12,
    padding: 16, alignItems: 'center',
  },
  orderBtnText: { color: '#fff', fontWeight: '700', fontSize: 16 },
});

export default ListingDetailScreen;