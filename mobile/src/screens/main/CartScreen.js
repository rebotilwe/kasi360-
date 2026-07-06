import React, { useState } from 'react';
import {
  View, Text, FlatList, TouchableOpacity,
  StyleSheet, Image, TextInput, ActivityIndicator,
} from 'react-native';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';

const BASE_URL = 'https://kasi360.onrender.com';

const getToken = async () => {
  const { Platform } = require('react-native');
  if (Platform.OS === 'web') return localStorage.getItem('kasi360_token');
  const SecureStore = await import('expo-secure-store');
  return await SecureStore.getItemAsync('kasi360_token');
};

const CartScreen = ({ navigation }) => {
  const { items, updateQuantity, removeFromCart, clearCart, totalItems, totalAmount } = useCart();
  const { user } = useAuth();
  const [deliveryAddress, setDeliveryAddress] = useState('');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState(null);

  const handleCheckout = async () => {
    if (items.length === 0) return;
    if (!deliveryAddress.trim()) {
      setStatus({ type: 'error', msg: 'Please enter a delivery address' });
      return;
    }

    // Group items by business
    const byBusiness = {};
    items.forEach(({ listing, quantity }) => {
      const bid = listing.business_id;
      if (!byBusiness[bid]) byBusiness[bid] = [];
      byBusiness[bid].push({ listing_id: listing.id, quantity });
    });

    setLoading(true);
    setStatus(null);

    try {
      const token = await getToken();
      const businessIds = Object.keys(byBusiness);

      // Place one order per business
      const promises = businessIds.map((business_id) =>
        fetch(`${BASE_URL}/api/orders`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            business_id,
            items: byBusiness[business_id],
            delivery_address: deliveryAddress,
            notes,
          }),
        })
      );

      await Promise.all(promises);
      clearCart();
      setStatus({ type: 'success', msg: '✅ Order placed successfully!' });
      setTimeout(() => navigation.navigate('Orders'), 1500);
    } catch (err) {
      setStatus({ type: 'error', msg: '❌ ' + err.message });
    } finally {
      setLoading(false);
    }
  };

  if (items.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyIcon}>🛒</Text>
        <Text style={styles.emptyTitle}>Your cart is empty</Text>
        <Text style={styles.emptySub}>Browse the marketplace and add items</Text>
        <TouchableOpacity style={styles.browseBtn} onPress={() => navigation.navigate('Main', { screen: 'Home' })}>
          <Text style={styles.browseBtnText}>Browse Marketplace</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={items}
        keyExtractor={(item) => item.listing.id}
        contentContainerStyle={styles.list}
        ListHeaderComponent={
          <Text style={styles.sectionTitle}>{totalItems} item{totalItems !== 1 ? 's' : ''} in cart</Text>
        }
        renderItem={({ item: { listing, quantity } }) => (
          <View style={styles.card}>
            {listing.image_url ? (
              <Image source={{ uri: listing.image_url }} style={styles.cardImage} />
            ) : (
              <View style={styles.cardImagePlaceholder}>
                <Text style={styles.cardEmoji}>🛍️</Text>
              </View>
            )}
            <View style={styles.cardBody}>
              <Text style={styles.cardTitle} numberOfLines={1}>{listing.title}</Text>
              <Text style={styles.cardBusiness}>{listing.business_name}</Text>
              <Text style={styles.cardPrice}>R {parseFloat(listing.price).toFixed(2)}</Text>
              <View style={styles.qtyRow}>
                <TouchableOpacity style={styles.qtyBtn}
                  onPress={() => updateQuantity(listing.id, quantity - 1)}>
                  <Text style={styles.qtyBtnText}>−</Text>
                </TouchableOpacity>
                <Text style={styles.qtyValue}>{quantity}</Text>
                <TouchableOpacity style={styles.qtyBtn}
                  onPress={() => updateQuantity(listing.id, quantity + 1)}>
                  <Text style={styles.qtyBtnText}>+</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => removeFromCart(listing.id)}>
                  <Text style={styles.removeText}>Remove</Text>
                </TouchableOpacity>
              </View>
            </View>
            <Text style={styles.itemTotal}>
              R {(parseFloat(listing.price) * quantity).toFixed(2)}
            </Text>
          </View>
        )}
        ListFooterComponent={
          <View style={styles.footer}>
            <Text style={styles.sectionTitle}>Delivery Details</Text>

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
              placeholder="Notes (optional)"
              placeholderTextColor="#aaa"
              value={notes}
              onChangeText={setNotes}
              multiline
              numberOfLines={3}
              textAlignVertical="top"
            />

            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>Total</Text>
              <Text style={styles.totalValue}>R {totalAmount.toFixed(2)}</Text>
            </View>

            <TouchableOpacity style={styles.checkoutBtn} onPress={handleCheckout} disabled={loading}>
              {loading
                ? <ActivityIndicator color="#fff" />
                : <Text style={styles.checkoutBtnText}>Place Order — R {totalAmount.toFixed(2)}</Text>}
            </TouchableOpacity>
          </View>
        }
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f9f9f9' },
  emptyContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 32 },
  emptyIcon: { fontSize: 64, marginBottom: 16 },
  emptyTitle: { fontSize: 20, fontWeight: '800', color: '#333', marginBottom: 8 },
  emptySub: { fontSize: 14, color: '#888', marginBottom: 24, textAlign: 'center' },
  browseBtn: { backgroundColor: '#FF6B35', borderRadius: 12, paddingHorizontal: 24, paddingVertical: 14 },
  browseBtnText: { color: '#fff', fontWeight: '700', fontSize: 15 },
  list: { padding: 16, gap: 12 },
  sectionTitle: { fontSize: 16, fontWeight: '700', color: '#333', marginBottom: 12 },
  card: {
    backgroundColor: '#fff', borderRadius: 12, flexDirection: 'row',
    padding: 12, borderWidth: 1, borderColor: '#eee', alignItems: 'center',
  },
  cardImage: { width: 70, height: 70, borderRadius: 8, resizeMode: 'cover' },
  cardImagePlaceholder: {
    width: 70, height: 70, borderRadius: 8,
    backgroundColor: '#FFF4F0', justifyContent: 'center', alignItems: 'center',
  },
  cardEmoji: { fontSize: 28 },
  cardBody: { flex: 1, paddingHorizontal: 12 },
  cardTitle: { fontSize: 14, fontWeight: '700', color: '#222', marginBottom: 2 },
  cardBusiness: { fontSize: 12, color: '#FF6B35', marginBottom: 4 },
  cardPrice: { fontSize: 13, color: '#888', marginBottom: 6 },
  qtyRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  qtyBtn: {
    width: 28, height: 28, borderRadius: 14, borderWidth: 1.5,
    borderColor: '#FF6B35', justifyContent: 'center', alignItems: 'center',
  },
  qtyBtnText: { fontSize: 16, color: '#FF6B35', fontWeight: '700' },
  qtyValue: { fontSize: 15, fontWeight: '800', color: '#222' },
  removeText: { fontSize: 12, color: '#EF4444', fontWeight: '600' },
  itemTotal: { fontSize: 15, fontWeight: '800', color: '#222' },
  footer: { marginTop: 8 },
  input: {
    backgroundColor: '#fff', borderWidth: 1, borderColor: '#ddd',
    borderRadius: 10, padding: 14, fontSize: 15, marginBottom: 14, color: '#333',
  },
  textarea: { height: 80 },
  totalRow: {
    flexDirection: 'row', justifyContent: 'space-between',
    backgroundColor: '#fff', padding: 16, borderRadius: 12,
    borderWidth: 1, borderColor: '#eee', marginBottom: 14,
  },
  totalLabel: { fontSize: 16, fontWeight: '700', color: '#333' },
  totalValue: { fontSize: 18, fontWeight: '800', color: '#FF6B35' },
  checkoutBtn: {
    backgroundColor: '#FF6B35', borderRadius: 12,
    padding: 16, alignItems: 'center', marginBottom: 32,
  },
  checkoutBtnText: { color: '#fff', fontWeight: '700', fontSize: 16 },
  statusBox: { padding: 12, borderRadius: 8, marginBottom: 14 },
  statusSuccess: { backgroundColor: '#D1FAE5' },
  statusError: { backgroundColor: '#FEE2E2' },
  statusText: { fontSize: 14, fontWeight: '600' },
});

export default CartScreen;