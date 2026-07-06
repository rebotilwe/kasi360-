import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  Image, ActivityIndicator, Platform,
} from 'react-native';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';

const ListingDetailScreen = ({ route, navigation }) => {
  const { listing } = route.params;
  const { user } = useAuth();
  const { addToCart, items } = useCart();
  const [quantity, setQuantity] = useState(1);
  const [added, setAdded] = useState(false);

  const inCart = items.find((i) => i.listing.id === listing.id);

  const handleAddToCart = () => {
    addToCart(listing, quantity);
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
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
            <Text style={styles.sectionTitle}>Add to Cart</Text>

            {/* Quantity selector */}
            <View style={styles.qtyRow}>
              <TouchableOpacity
                style={styles.qtyBtn}
                onPress={() => setQuantity(Math.max(1, quantity - 1))}>
                <Text style={styles.qtyBtnText}>−</Text>
              </TouchableOpacity>
              <Text style={styles.qtyValue}>{quantity}</Text>
              <TouchableOpacity
                style={styles.qtyBtn}
                onPress={() => setQuantity(Math.min(listing.stock_qty || 99, quantity + 1))}>
                <Text style={styles.qtyBtnText}>+</Text>
              </TouchableOpacity>
              <Text style={styles.qtyTotal}>
                = R {(parseFloat(listing.price) * quantity).toFixed(2)}
              </Text>
            </View>

            {added && (
              <View style={styles.addedBox}>
                <Text style={styles.addedText}>✅ Added to cart!</Text>
              </View>
            )}

            <TouchableOpacity style={styles.addBtn} onPress={handleAddToCart}>
              <Text style={styles.addBtnText}>
                {inCart ? `Update Cart (${inCart.quantity} in cart)` : '🛒 Add to Cart'}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.viewCartBtn}
              onPress={() => navigation.navigate('Cart')}>
              <Text style={styles.viewCartBtnText}>View Cart</Text>
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
  orderSection: { borderTopWidth: 1, borderTopColor: '#f0f0f0', paddingTop: 20 },
  qtyRow: {
    flexDirection: 'row', alignItems: 'center', gap: 16, marginBottom: 16,
  },
  qtyBtn: {
    width: 40, height: 40, borderRadius: 20, borderWidth: 1.5,
    borderColor: '#FF6B35', justifyContent: 'center', alignItems: 'center',
  },
  qtyBtnText: { fontSize: 20, color: '#FF6B35', fontWeight: '700' },
  qtyValue: { fontSize: 20, fontWeight: '800', color: '#222', minWidth: 30, textAlign: 'center' },
  qtyTotal: { fontSize: 16, fontWeight: '700', color: '#555' },
  addedBox: {
    backgroundColor: '#D1FAE5', padding: 10, borderRadius: 8, marginBottom: 12,
  },
  addedText: { color: '#065F46', fontWeight: '600', fontSize: 14 },
  addBtn: {
    backgroundColor: '#FF6B35', borderRadius: 12,
    padding: 16, alignItems: 'center', marginBottom: 10,
  },
  addBtnText: { color: '#fff', fontWeight: '700', fontSize: 16 },
  viewCartBtn: {
    borderWidth: 1.5, borderColor: '#FF6B35', borderRadius: 12,
    padding: 14, alignItems: 'center',
  },
  viewCartBtnText: { color: '#FF6B35', fontWeight: '700', fontSize: 15 },
});

export default ListingDetailScreen;