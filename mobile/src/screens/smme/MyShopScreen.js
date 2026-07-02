import React, { useEffect, useState, useCallback } from 'react';
import {
  View, Text, FlatList, TouchableOpacity, StyleSheet,
  ActivityIndicator, Alert, RefreshControl,
} from 'react-native';
import { useAuth } from '../../context/AuthContext';

const BASE_URL = 'https://kasi360.onrender.com';
const getToken = () => {
  if (typeof localStorage !== 'undefined') return localStorage.getItem('kasi360_token');
  return null;
};

const MyShopScreen = ({ navigation }) => {
  const { token } = useAuth();
  const [business, setBusiness] = useState(null);
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchShop = useCallback(async () => {
    try {
      const authToken = getToken() || token;
      const res = await fetch(`${BASE_URL}/api/businesses/mine`, {
        headers: { Authorization: `Bearer ${authToken}` },
      });
      if (res.status === 404) {
        setBusiness(null); setLoading(false); setRefreshing(false); return;
      }
      const data = await res.json();
      setBusiness(data);

      const lRes = await fetch(`${BASE_URL}/api/listings?business_id=${data.id}`, {
        headers: { Authorization: `Bearer ${authToken}` },
      });
      const lData = await lRes.json();
      setListings(lData);
    } catch (err) {
      console.error(err.message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [token]);

  useEffect(() => { fetchShop(); }, [fetchShop]);

  const onRefresh = () => { setRefreshing(true); fetchShop(); };

  const toggleAvailability = async (listing) => {
    try {
      await fetch(`${BASE_URL}/api/listings/${listing.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${getToken() || token}`,
        },
        body: JSON.stringify({ is_available: !listing.is_available }),
      });
      fetchShop();
    } catch (err) {
      Alert.alert('Error', err.message);
    }
  };

  if (loading) return <View style={styles.center}><ActivityIndicator size="large" color="#FF6B35" /></View>;

  if (!business) {
    return (
      <View style={styles.center}>
        <Text style={styles.emptyTitle}>No business profile yet</Text>
        <Text style={styles.emptySub}>Set up your storefront to start selling</Text>
        <TouchableOpacity style={styles.btn} onPress={() => navigation.navigate('CreateBusiness')}>
          <Text style={styles.btnText}>Create Business Profile</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View>
          <Text style={styles.shopName}>{business.business_name}</Text>
          <Text style={styles.shopLocation}>📍 {business.location || 'Location TBC'}</Text>
        </View>
        <TouchableOpacity style={styles.addBtn}
          onPress={() => navigation.navigate('CreateListing', { business_id: business.id })}>
          <Text style={styles.addBtnText}>+ Add</Text>
        </TouchableOpacity>
      </View>

      {listings.length === 0 ? (
        <View style={styles.center}>
          <Text style={styles.emptyTitle}>No listings yet</Text>
          <Text style={styles.emptySub}>Add your first product or service</Text>
        </View>
      ) : (
        <FlatList
          data={listings}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.list}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#FF6B35" />}
          renderItem={({ item }) => (
            <View style={styles.card}>
              <View style={styles.cardTop}>
                <Text style={styles.cardTitle}>{item.title}</Text>
                <TouchableOpacity
                  style={[styles.toggle, item.is_available ? styles.toggleOn : styles.toggleOff]}
                  onPress={() => toggleAvailability(item)}>
                  <Text style={styles.toggleText}>{item.is_available ? 'Live' : 'Off'}</Text>
                </TouchableOpacity>
              </View>
              <Text style={styles.cardPrice}>R {parseFloat(item.price).toFixed(2)}</Text>
              <Text style={styles.cardMeta}>Stock: {item.stock_qty} · {item.listing_type}</Text>
            </View>
          )}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f9f9f9' },
  header: {
    backgroundColor: '#FF6B35', padding: 20, paddingTop: 56,
    paddingBottom: 24, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
  },
  shopName: { fontSize: 20, fontWeight: '800', color: '#fff' },
  shopLocation: { fontSize: 13, color: 'rgba(255,255,255,0.8)', marginTop: 2 },
  addBtn: { backgroundColor: 'rgba(255,255,255,0.25)', paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20 },
  addBtnText: { color: '#fff', fontWeight: '700', fontSize: 14 },
  list: { padding: 16, gap: 12 },
  card: { backgroundColor: '#fff', borderRadius: 12, padding: 16, borderWidth: 1, borderColor: '#eee' },
  cardTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 },
  cardTitle: { fontSize: 15, fontWeight: '700', color: '#222', flex: 1 },
  toggle: { paddingHorizontal: 12, paddingVertical: 4, borderRadius: 20, marginLeft: 8 },
  toggleOn: { backgroundColor: '#D1FAE5' },
  toggleOff: { backgroundColor: '#FEE2E2' },
  toggleText: { fontSize: 12, fontWeight: '700' },
  cardPrice: { fontSize: 18, fontWeight: '800', color: '#222', marginBottom: 4 },
  cardMeta: { fontSize: 12, color: '#888' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 24 },
  emptyTitle: { fontSize: 18, fontWeight: '700', color: '#333', marginBottom: 8 },
  emptySub: { fontSize: 14, color: '#888', marginBottom: 24, textAlign: 'center' },
  btn: { backgroundColor: '#FF6B35', borderRadius: 10, paddingHorizontal: 24, paddingVertical: 14 },
  btnText: { color: '#fff', fontWeight: '700', fontSize: 15 },
});

export default MyShopScreen;