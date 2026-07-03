import React, { useEffect, useState, useCallback } from 'react';
import {
  View, Text, FlatList, TextInput, TouchableOpacity,
  StyleSheet, ActivityIndicator, RefreshControl, Image,
} from 'react-native';
import { getListings } from '../../api/client';
import { useAuth } from '../../context/AuthContext';

const CATEGORIES = ['All', 'Food', 'Clothing', 'Electronics', 'Services', 'Other'];
const SORT_OPTIONS = [
  { label: 'Newest', value: 'newest' },
  { label: 'Price ↑', value: 'price_asc' },
  { label: 'Price ↓', value: 'price_desc' },
];
const TYPES = [
  { label: 'All', value: '' },
  { label: '📦 Products', value: 'product' },
  { label: '🛠️ Services', value: 'service' },
];

const ListingCard = ({ item, onPress, navigation }) => (
  <TouchableOpacity style={styles.card} onPress={() => onPress(item)}>
    {item.image_url ? (
      <Image source={{ uri: item.image_url }} style={styles.cardImage} />
    ) : (
      <View style={styles.cardImagePlaceholder}>
        <Text style={styles.cardEmoji}>🛍️</Text>
      </View>
    )}
    <View style={styles.cardBody}>
      <Text style={styles.cardTitle} numberOfLines={1}>{item.title}</Text>
      <TouchableOpacity onPress={() => navigation.navigate('BusinessProfile', {
        business_id: item.business_id,
        business_name: item.business_name,
      })}>
        <Text style={styles.cardBusiness} numberOfLines={1}>{item.business_name}</Text>
      </TouchableOpacity>
      <Text style={styles.cardLocation} numberOfLines={1}>📍 {item.location || 'Location TBC'}</Text>
      <View style={styles.cardFooter}>
        <Text style={styles.cardPrice}>R {parseFloat(item.price).toFixed(2)}</Text>
        <View style={styles.typeBadge}>
          <Text style={styles.typeBadgeText}>{item.listing_type || 'product'}</Text>
        </View>
      </View>
    </View>
  </TouchableOpacity>
);

const HomeScreen = ({ navigation }) => {
  const { user } = useAuth();
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('All');
  const [sort, setSort] = useState('newest');
  const [type, setType] = useState('');
  const [showFilters, setShowFilters] = useState(false);

  const fetchListings = useCallback(async () => {
    try {
      const q = [];
      if (search) q.push(`search=${encodeURIComponent(search)}`);
      if (category !== 'All') q.push(`category=${encodeURIComponent(category)}`);
      if (type) q.push(`listing_type=${encodeURIComponent(type)}`);
      if (sort) q.push(`sort=${sort}`);
      const params = q.length ? '?' + q.join('&') : '';
      const data = await getListings(params);
      setListings(data);
    } catch (err) {
      console.error(err.message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [search, category, sort, type]);

  useEffect(() => { fetchListings(); }, [fetchListings]);

  const onRefresh = () => { setRefreshing(true); fetchListings(); };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>Hello, {user?.name?.split(' ')[0]} 👋</Text>
          <Text style={styles.headerSub}>What are you looking for?</Text>
        </View>
        <TouchableOpacity
          style={[styles.filterToggle, showFilters && styles.filterToggleActive]}
          onPress={() => setShowFilters(!showFilters)}>
          <Text style={styles.filterToggleText}>⚙️ Filters</Text>
        </TouchableOpacity>
      </View>

      {/* Search */}
      <View style={styles.searchRow}>
        <TextInput
          style={styles.search}
          placeholder="Search listings..."
          placeholderTextColor="#aaa"
          value={search}
          onChangeText={setSearch}
          onSubmitEditing={fetchListings}
          returnKeyType="search"
        />
      </View>

      {/* Filter Panel */}
      {showFilters && (
        <View style={styles.filterPanel}>
          <Text style={styles.filterLabel}>Sort by</Text>
          <View style={styles.filterRow}>
            {SORT_OPTIONS.map((o) => (
              <TouchableOpacity key={o.value}
                style={[styles.filterBtn, sort === o.value && styles.filterBtnActive]}
                onPress={() => setSort(o.value)}>
                <Text style={[styles.filterBtnText, sort === o.value && styles.filterBtnTextActive]}>
                  {o.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <Text style={styles.filterLabel}>Type</Text>
          <View style={styles.filterRow}>
            {TYPES.map((t) => (
              <TouchableOpacity key={t.value}
                style={[styles.filterBtn, type === t.value && styles.filterBtnActive]}
                onPress={() => setType(t.value)}>
                <Text style={[styles.filterBtnText, type === t.value && styles.filterBtnTextActive]}>
                  {t.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      )}

      {/* Categories */}
      <FlatList
        data={CATEGORIES}
        horizontal
        showsHorizontalScrollIndicator={false}
        keyExtractor={(c) => c}
        contentContainerStyle={styles.categories}
        renderItem={({ item: cat }) => (
          <TouchableOpacity
            style={[styles.catBtn, category === cat && styles.catBtnActive]}
            onPress={() => setCategory(cat)}>
            <Text style={[styles.catText, category === cat && styles.catTextActive]}>{cat}</Text>
          </TouchableOpacity>
        )}
      />

      {/* Results count */}
      {!loading && (
        <Text style={styles.resultsCount}>
          {listings.length} listing{listings.length !== 1 ? 's' : ''} found
        </Text>
      )}

      {/* Listings */}
      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color="#FF6B35" />
        </View>
      ) : listings.length === 0 ? (
        <View style={styles.center}>
          <Text style={styles.emptyText}>No listings found</Text>
          <Text style={styles.emptySubText}>Try adjusting your filters</Text>
        </View>
      ) : (
        <FlatList
          data={listings}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <ListingCard
              item={item}
              onPress={(l) => navigation.navigate('ListingDetail', { listing: l })}
              navigation={navigation}
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
  header: {
    backgroundColor: '#FF6B35', padding: 20, paddingTop: 56, paddingBottom: 24,
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
  },
  greeting: { fontSize: 22, fontWeight: '800', color: '#fff' },
  headerSub: { fontSize: 14, color: 'rgba(255,255,255,0.8)', marginTop: 2 },
  filterToggle: {
    backgroundColor: 'rgba(255,255,255,0.2)', paddingHorizontal: 14,
    paddingVertical: 7, borderRadius: 20,
  },
  filterToggleActive: { backgroundColor: '#fff' },
  filterToggleText: { color: '#fff', fontSize: 13, fontWeight: '600' },
  searchRow: { padding: 16, paddingBottom: 0 },
  search: {
    backgroundColor: '#fff', borderRadius: 10, padding: 12,
    fontSize: 15, color: '#333', borderWidth: 1, borderColor: '#eee',
  },
  filterPanel: {
    backgroundColor: '#fff', margin: 16, marginBottom: 0,
    borderRadius: 12, padding: 16, borderWidth: 1, borderColor: '#eee',
  },
  filterLabel: { fontSize: 12, fontWeight: '700', color: '#888', marginBottom: 8, textTransform: 'uppercase' },
  filterRow: { flexDirection: 'row', gap: 8, marginBottom: 16, flexWrap: 'wrap' },
  filterBtn: {
    paddingHorizontal: 14, paddingVertical: 7, borderRadius: 20,
    borderWidth: 1, borderColor: '#ddd', backgroundColor: '#f9f9f9',
  },
  filterBtnActive: { backgroundColor: '#FF6B35', borderColor: '#FF6B35' },
  filterBtnText: { fontSize: 13, color: '#555', fontWeight: '500' },
  filterBtnTextActive: { color: '#fff', fontWeight: '700' },
  categories: { paddingHorizontal: 16, paddingVertical: 12, gap: 8 },
  catBtn: {
    paddingHorizontal: 16, paddingVertical: 7, borderRadius: 20,
    backgroundColor: '#fff', borderWidth: 1, borderColor: '#ddd',
  },
  catBtnActive: { backgroundColor: '#FF6B35', borderColor: '#FF6B35' },
  catText: { color: '#555', fontSize: 13, fontWeight: '500' },
  catTextActive: { color: '#fff', fontWeight: '700' },
  resultsCount: { fontSize: 12, color: '#aaa', paddingHorizontal: 16, marginBottom: 4 },
  list: { padding: 16, gap: 12 },
  card: {
    backgroundColor: '#fff', borderRadius: 12, flexDirection: 'row',
    overflow: 'hidden', borderWidth: 1, borderColor: '#eee',
  },
  cardImage: { width: 90, height: 90, resizeMode: 'cover' },
  cardImagePlaceholder: {
    width: 90, backgroundColor: '#FFF4F0', justifyContent: 'center', alignItems: 'center',
  },
  cardEmoji: { fontSize: 32 },
  cardBody: { flex: 1, padding: 12 },
  cardTitle: { fontSize: 15, fontWeight: '700', color: '#222', marginBottom: 2 },
  cardBusiness: { fontSize: 12, color: '#FF6B35', marginBottom: 2 },
  cardLocation: { fontSize: 12, color: '#888', marginBottom: 6 },
  cardFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  cardPrice: { fontSize: 16, fontWeight: '800', color: '#222' },
  typeBadge: {
    backgroundColor: '#F3F4F6', paddingHorizontal: 8,
    paddingVertical: 3, borderRadius: 10,
  },
  typeBadgeText: { fontSize: 10, color: '#666', textTransform: 'capitalize' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  emptyText: { fontSize: 18, fontWeight: '700', color: '#333', marginBottom: 4 },
  emptySubText: { fontSize: 14, color: '#888' },
});

export default HomeScreen;