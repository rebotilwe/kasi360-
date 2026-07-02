import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { useAuth } from '../../context/AuthContext';
import { createOrder } from '../../api/client';

const ListingDetailScreen = ({ route, navigation }) => {
  const { listing } = route.params;
  const { user } = useAuth();

  const handleOrder = async () => {
    if (user?.role !== 'customer') {
      Alert.alert('Not available', 'Only customers can place orders');
      return;
    }
    try {
      await createOrder({
        business_id: listing.business_id,
        items: [{ listing_id: listing.id, quantity: 1 }],
      });
      Alert.alert('Order Placed! 🎉', 'Your order has been placed successfully.', [
        { text: 'View Orders', onPress: () => navigation.navigate('Orders') },
        { text: 'OK' },
      ]);
    } catch (err) {
      Alert.alert('Error', err.message);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.imagePlaceholder}>
        <Text style={styles.emoji}>🛍️</Text>
      </View>
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
          <TouchableOpacity style={styles.orderBtn} onPress={handleOrder}>
            <Text style={styles.orderBtnText}>Place Order</Text>
          </TouchableOpacity>
        )}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
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
  orderBtn: {
    backgroundColor: '#FF6B35', borderRadius: 12,
    padding: 16, alignItems: 'center',
  },
  orderBtnText: { color: '#fff', fontWeight: '700', fontSize: 16 },
});

export default ListingDetailScreen;
