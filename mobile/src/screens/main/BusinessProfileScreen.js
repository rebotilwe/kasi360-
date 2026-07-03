import React, { useEffect, useState } from 'react';
import {
  View, Text, FlatList, TouchableOpacity,
  StyleSheet, ActivityIndicator, Image,
} from 'react-native';

const BASE_URL = 'https://kasi360.onrender.com';

const BusinessProfileScreen = ({ route, navigation }) => {
  const { business_id } = route.params;
  const [business, setBusiness] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBusiness = async () => {
      try {
        const [bizRes, reviewRes] = await Promise.all([
          fetch(`${BASE_URL}/api/businesses/${business_id}`),
          fetch(`${BASE_URL}/api/reviews/business/${business_id}`),
        ]);
        const bizData = await bizRes.json();
        const reviewData = await reviewRes.json();
        setBusiness({
          ...bizData,
          avgRating: reviewData.avgRating,
          totalReviews: reviewData.total,
          reviews: reviewData.reviews,
        });
      } catch (err) {
        console.error(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchBusiness();
  }, [business_id]);

  if (loading) {
    return <View style={styles.center}><ActivityIndicator size="large" color="#FF6B35" /></View>;
  }

  if (!business) {
    return (
      <View style={styles.center}>
        <Text style={styles.emptyText}>Business not found</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={business.listings}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        ListHeaderComponent={
          <View>
            {/* Business Header */}
            <View style={styles.header}>
              <View style={styles.avatar}>
                <Text style={styles.avatarText}>{business.business_name?.charAt(0)}</Text>
              </View>
              <Text style={styles.businessName}>{business.business_name}</Text>
              {business.location && (
                <Text style={styles.location}>📍 {business.location}</Text>
              )}
              {business.category && (
                <View style={styles.categoryBadge}>
                  <Text style={styles.categoryText}>{business.category}</Text>
                </View>
              )}
              {business.description && (
                <Text style={styles.description}>{business.description}</Text>
              )}
              <Text style={styles.listingCount}>
                {business.listings?.length || 0} listing{business.listings?.length !== 1 ? 's' : ''}
              </Text>
             {business.avgRating && parseFloat(business.avgRating) > 0 && (
                <View style={styles.ratingRow}>
                <Text style={styles.ratingStars}>
  {'★'.repeat(Math.round(parseFloat(business.avgRating)))}
  {'☆'.repeat(5 - Math.round(parseFloat(business.avgRating)))}
</Text>
<Text style={styles.ratingText}>
  {parseFloat(business.avgRating).toFixed(1)} ({business.totalReviews} review{business.totalReviews !== 1 ? 's' : ''})
</Text>
                </View>
              )}
            </View>

            {/* Reviews section */}
            {business.reviews?.length > 0 && (
              <View style={styles.reviewsSection}>
                <Text style={styles.reviewsTitle}>Customer Reviews</Text>
                {business.reviews.slice(0, 3).map((r) => (
                  <View key={r.id} style={styles.reviewCard}>
                    <View style={styles.reviewTop}>
                      <Text style={styles.reviewName}>{r.customer_name}</Text>
                      <Text style={styles.reviewStars}>
                        {'★'.repeat(r.rating)}{'☆'.repeat(5 - r.rating)}
                      </Text>
                    </View>
                    {r.comment && <Text style={styles.reviewComment}>{r.comment}</Text>}
                    <Text style={styles.reviewDate}>
                      {new Date(r.created_at).toLocaleDateString('en-ZA')}
                    </Text>
                  </View>
                ))}
              </View>
            )}

            {business.listings?.length > 0 && (
              <Text style={styles.listingsHeader}>Listings</Text>
            )}
          </View>
        }
        ListEmptyComponent={
          <View style={styles.center}>
            <Text style={styles.emptyText}>No listings yet</Text>
          </View>
        }
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.card}
            onPress={() => navigation.navigate('ListingDetail', {
              listing: { ...item, business_name: business.business_name, location: business.location }
            })}>
            {item.image_url ? (
              <Image source={{ uri: item.image_url }} style={styles.cardImage} />
            ) : (
              <View style={styles.cardImagePlaceholder}>
                <Text style={styles.cardEmoji}>🛍️</Text>
              </View>
            )}
            <View style={styles.cardBody}>
              <Text style={styles.cardTitle} numberOfLines={1}>{item.title}</Text>
              {item.description ? (
                <Text style={styles.cardDesc} numberOfLines={2}>{item.description}</Text>
              ) : null}
              <View style={styles.cardFooter}>
                <Text style={styles.cardPrice}>R {parseFloat(item.price).toFixed(2)}</Text>
                <Text style={styles.cardStock}>Stock: {item.stock_qty}</Text>
              </View>
            </View>
          </TouchableOpacity>
        )}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f9f9f9' },
  header: {
    backgroundColor: '#FF6B35', padding: 24, paddingTop: 20,
    alignItems: 'center',
  },
  avatar: {
    width: 70, height: 70, borderRadius: 35,
    backgroundColor: 'rgba(255,255,255,0.3)',
    justifyContent: 'center', alignItems: 'center', marginBottom: 12,
  },
  avatarText: { fontSize: 30, fontWeight: '800', color: '#fff' },
  businessName: { fontSize: 22, fontWeight: '800', color: '#fff', marginBottom: 4 },
  location: { fontSize: 13, color: 'rgba(255,255,255,0.85)', marginBottom: 8 },
  categoryBadge: {
    backgroundColor: 'rgba(255,255,255,0.2)', paddingHorizontal: 14,
    paddingVertical: 4, borderRadius: 20, marginBottom: 10,
  },
  categoryText: { color: '#fff', fontSize: 12, fontWeight: '600' },
  description: {
    fontSize: 13, color: 'rgba(255,255,255,0.85)',
    textAlign: 'center', marginBottom: 10, paddingHorizontal: 16,
  },
  listingCount: { fontSize: 12, color: 'rgba(255,255,255,0.7)', marginTop: 4 },
  ratingRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 8 },
  ratingStars: { fontSize: 16, color: '#F59E0B' },
  ratingText: { fontSize: 13, color: 'rgba(255,255,255,0.85)' },
  reviewsSection: {
    margin: 16, backgroundColor: '#fff',
    borderRadius: 12, padding: 16, borderWidth: 1, borderColor: '#eee',
  },
  reviewsTitle: { fontSize: 15, fontWeight: '700', color: '#333', marginBottom: 12 },
  reviewCard: {
    paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#f5f5f5',
  },
  reviewTop: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 },
  reviewName: { fontSize: 13, fontWeight: '700', color: '#333' },
  reviewStars: { fontSize: 13, color: '#F59E0B' },
  reviewComment: { fontSize: 13, color: '#555', marginBottom: 4, lineHeight: 18 },
  reviewDate: { fontSize: 11, color: '#aaa' },
  listingsHeader: {
    fontSize: 15, fontWeight: '700', color: '#333',
    marginHorizontal: 16, marginTop: 8, marginBottom: 4,
  },
  list: { paddingHorizontal: 16, paddingBottom: 16, gap: 12 },
  card: {
    backgroundColor: '#fff', borderRadius: 12, flexDirection: 'row',
    overflow: 'hidden', borderWidth: 1, borderColor: '#eee',
  },
  cardImage: { width: 90, height: 90, resizeMode: 'cover' },
  cardImagePlaceholder: {
    width: 90, backgroundColor: '#FFF4F0',
    justifyContent: 'center', alignItems: 'center',
  },
  cardEmoji: { fontSize: 28 },
  cardBody: { flex: 1, padding: 12, justifyContent: 'space-between' },
  cardTitle: { fontSize: 15, fontWeight: '700', color: '#222', marginBottom: 4 },
  cardDesc: { fontSize: 12, color: '#888', marginBottom: 6, lineHeight: 17 },
  cardFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  cardPrice: { fontSize: 16, fontWeight: '800', color: '#222' },
  cardStock: { fontSize: 11, color: '#aaa' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 24 },
  emptyText: { fontSize: 16, color: '#888' },
});

export default BusinessProfileScreen;