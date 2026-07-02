import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  ActivityIndicator, ScrollView,
} from 'react-native';
import { useAuth } from '../../context/AuthContext';

const BASE_URL = 'https://kasi360.onrender.com';
const getToken = () => {
  if (typeof localStorage !== 'undefined') return localStorage.getItem('kasi360_token');
  return null;
};

const CreateListingScreen = ({ navigation, route }) => {
  const { token } = useAuth();
  const { business_id } = route.params;
  const [form, setForm] = useState({
    title: '', description: '', price: '',
    category: '', stock_qty: '', listing_type: 'product',
  });
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState(null); // { type: 'success'|'error', msg: '' }
  const set = (key, val) => setForm((f) => ({ ...f, [key]: val }));

  const handleCreate = async () => {
    if (!form.title || !form.price) {
      setStatus({ type: 'error', msg: 'Title and price are required' });
      return;
    }
    setLoading(true);
    setStatus(null);
    try {
      const res = await fetch(`${BASE_URL}/api/listings`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${getToken() || token}`,
        },
        body: JSON.stringify({
          ...form,
          business_id,
          price: parseFloat(form.price),
          stock_qty: parseInt(form.stock_qty) || 0,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      setStatus({ type: 'success', msg: '✅ Listing added! Going back...' });
      setTimeout(() => navigation.goBack(), 1500);
    } catch (err) {
      setStatus({ type: 'error', msg: '❌ ' + err.message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.inner}>
      <Text style={styles.sub}>Add a product or service to your shop</Text>

      {status && (
        <View style={[styles.statusBox, status.type === 'success' ? styles.statusSuccess : styles.statusError]}>
          <Text style={styles.statusText}>{status.msg}</Text>
        </View>
      )}

      <TextInput style={styles.input} placeholder="Title *" placeholderTextColor="#aaa"
        value={form.title} onChangeText={(v) => set('title', v)} />
      <TextInput style={styles.input} placeholder="Price (ZAR) *" placeholderTextColor="#aaa"
        value={form.price} onChangeText={(v) => set('price', v)} keyboardType="numeric" />
      <TextInput style={styles.input} placeholder="Category" placeholderTextColor="#aaa"
        value={form.category} onChangeText={(v) => set('category', v)} />
      <TextInput style={styles.input} placeholder="Stock quantity" placeholderTextColor="#aaa"
        value={form.stock_qty} onChangeText={(v) => set('stock_qty', v)} keyboardType="numeric" />

      <Text style={styles.label}>Type:</Text>
      <View style={styles.typeRow}>
        {['product', 'service'].map((t) => (
          <TouchableOpacity key={t}
            style={[styles.typeBtn, form.listing_type === t && styles.typeBtnActive]}
            onPress={() => set('listing_type', t)}>
            <Text style={[styles.typeBtnText, form.listing_type === t && styles.typeBtnTextActive]}>
              {t === 'product' ? '📦 Product' : '🛠️ Service'}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <TextInput style={[styles.input, styles.textarea]} placeholder="Description"
        placeholderTextColor="#aaa" value={form.description}
        onChangeText={(v) => set('description', v)}
        multiline numberOfLines={4} textAlignVertical="top" />

      <TouchableOpacity style={styles.btn} onPress={handleCreate} disabled={loading}>
        {loading
          ? <ActivityIndicator color="#fff" />
          : <Text style={styles.btnText}>Add Listing</Text>}
      </TouchableOpacity>

      {/* Debug info */}
      <Text style={styles.debug}>business_id: {business_id || 'MISSING'}</Text>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  inner: { padding: 24 },
  sub: { fontSize: 14, color: '#888', marginBottom: 24 },
  statusBox: { padding: 12, borderRadius: 8, marginBottom: 16 },
  statusSuccess: { backgroundColor: '#D1FAE5' },
  statusError: { backgroundColor: '#FEE2E2' },
  statusText: { fontSize: 14, fontWeight: '600' },
  input: {
    borderWidth: 1, borderColor: '#ddd', borderRadius: 10,
    padding: 14, fontSize: 15, marginBottom: 14, color: '#333',
  },
  textarea: { height: 100 },
  label: { fontSize: 14, fontWeight: '600', color: '#555', marginBottom: 10 },
  typeRow: { flexDirection: 'row', gap: 10, marginBottom: 14 },
  typeBtn: {
    flex: 1, borderWidth: 1.5, borderColor: '#ddd',
    borderRadius: 10, padding: 12, alignItems: 'center',
  },
  typeBtnActive: { borderColor: '#FF6B35', backgroundColor: '#FFF4F0' },
  typeBtnText: { color: '#888', fontWeight: '600' },
  typeBtnTextActive: { color: '#FF6B35' },
  btn: {
    backgroundColor: '#FF6B35', borderRadius: 10,
    padding: 15, alignItems: 'center', marginTop: 8,
  },
  btnText: { color: '#fff', fontWeight: '700', fontSize: 16 },
  debug: { fontSize: 11, color: '#ccc', marginTop: 16, textAlign: 'center' },
});

export default CreateListingScreen;