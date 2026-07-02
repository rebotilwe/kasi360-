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
  const set = (key, val) => setForm((f) => ({ ...f, [key]: val }));

  const handleCreate = async () => {
    if (!form.business_name) {
      Alert.alert('Error', 'Business name is required');
      return;
    }
    setLoading(true);
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
      Alert.alert('Success!', 'Business profile created.', [
        { text: 'OK', onPress: () => navigation.replace('MyShop') },
      ]);
    } catch (err) {
      Alert.alert('Error', err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.inner}>
      <Text style={styles.sub}>Set up your storefront on Kasi360</Text>

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