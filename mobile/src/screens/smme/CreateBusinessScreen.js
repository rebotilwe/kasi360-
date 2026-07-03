import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  ActivityIndicator, Alert, ScrollView,
} from 'react-native';
import { useAuth } from '../../context/AuthContext';

const BASE_URL = 'https://kasi360.onrender.com';
const getToken = () => {
  if (typeof localStorage !== 'undefined') return localStorage.getItem('kasi360_token');
  return null;
};

const CreateBusinessScreen = ({ navigation }) => {
  const { token } = useAuth();
  const [form, setForm] = useState({
    business_name: '', description: '', category: '', location: '',
  });
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState(null);
  const set = (key, val) => setForm((f) => ({ ...f, [key]: val }));

  const handleCreate = async () => {
    if (!form.business_name) {
      setStatus({ type: 'error', msg: 'Business name is required' });
      return;
    }
    setLoading(true);
    setStatus(null);
    try {
      const res = await fetch(`${BASE_URL}/api/businesses`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${getToken() || token}`,
        },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      setStatus({ type: 'success', msg: '✅ Business profile created!' });
      setTimeout(() => navigation.replace('MyShop'), 1500);
    } catch (err) {
      setStatus({ type: 'error', msg: '❌ ' + err.message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.inner}>
      <Text style={styles.sub}>Set up your storefront on Kasi360</Text>

      {status && (
        <View style={[styles.statusBox, status.type === 'success' ? styles.statusSuccess : styles.statusError]}>
          <Text style={styles.statusText}>{status.msg}</Text>
        </View>
      )}

      <TextInput style={styles.input} placeholder="Business Name *"
        placeholderTextColor="#aaa" value={form.business_name}
        onChangeText={(v) => set('business_name', v)} />
      <TextInput style={styles.input} placeholder="Category (e.g. Food, Clothing)"
        placeholderTextColor="#aaa" value={form.category}
        onChangeText={(v) => set('category', v)} />
      <TextInput style={styles.input} placeholder="Location (e.g. Soweto, Gauteng)"
        placeholderTextColor="#aaa" value={form.location}
        onChangeText={(v) => set('location', v)} />
      <TextInput style={[styles.input, styles.textarea]} placeholder="Description"
        placeholderTextColor="#aaa" value={form.description}
        onChangeText={(v) => set('description', v)}
        multiline numberOfLines={4} textAlignVertical="top" />

      <TouchableOpacity style={styles.btn} onPress={handleCreate} disabled={loading}>
        {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.btnText}>Create Business Profile</Text>}
      </TouchableOpacity>
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
  btn: {
    backgroundColor: '#FF6B35', borderRadius: 10,
    padding: 15, alignItems: 'center', marginTop: 8,
  },
  btnText: { color: '#fff', fontWeight: '700', fontSize: 16 },
});

export default CreateBusinessScreen;