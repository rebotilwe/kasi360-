import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  ActivityIndicator, Alert, KeyboardAvoidingView, Platform, ScrollView,
} from 'react-native';
import { useAuth } from '../../context/AuthContext';

const RegisterScreen = ({ navigation }) => {
  const { register } = useAuth();
  const [form, setForm] = useState({ name: '', email: '', phone: '', password: '', role: 'customer' });
  const [loading, setLoading] = useState(false);

  const set = (key, val) => setForm((f) => ({ ...f, [key]: val }));

  const handleRegister = async () => {
    if (!form.name || !form.email || !form.password) {
      Alert.alert('Error', 'Name, email and password are required');
      return;
    }
    setLoading(true);
    try {
      await register(form.name, form.email.trim(), form.phone, form.password, form.role);
    } catch (err) {
      Alert.alert('Registration Failed', err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView contentContainerStyle={styles.inner}>
        <Text style={styles.title}>Create Account</Text>
        <Text style={styles.sub}>Join the Kasi360 marketplace</Text>

        <TextInput style={styles.input} placeholder="Full Name" placeholderTextColor="#aaa"
          value={form.name} onChangeText={(v) => set('name', v)} />
        <TextInput style={styles.input} placeholder="Email" placeholderTextColor="#aaa"
          value={form.email} onChangeText={(v) => set('email', v)}
          keyboardType="email-address" autoCapitalize="none" />
        <TextInput style={styles.input} placeholder="Phone (optional)" placeholderTextColor="#aaa"
          value={form.phone} onChangeText={(v) => set('phone', v)} keyboardType="phone-pad" />
        <TextInput style={styles.input} placeholder="Password" placeholderTextColor="#aaa"
          value={form.password} onChangeText={(v) => set('password', v)} secureTextEntry />

        <Text style={styles.roleLabel}>I am a:</Text>
        <View style={styles.roleRow}>
          {['customer', 'smme'].map((r) => (
            <TouchableOpacity
              key={r}
              style={[styles.roleBtn, form.role === r && styles.roleBtnActive]}
              onPress={() => set('role', r)}
            >
              <Text style={[styles.roleBtnText, form.role === r && styles.roleBtnTextActive]}>
                {r === 'customer' ? '🛒 Customer' : '🏪 SMME / Vendor'}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <TouchableOpacity style={styles.btn} onPress={handleRegister} disabled={loading}>
          {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.btnText}>Create Account</Text>}
        </TouchableOpacity>

        <TouchableOpacity onPress={() => navigation.navigate('Login')}>
          <Text style={styles.link}>Already have an account? <Text style={styles.linkBold}>Login</Text></Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  inner: { padding: 28, paddingTop: 60 },
  title: { fontSize: 28, fontWeight: '800', color: '#222', marginBottom: 4 },
  sub: { fontSize: 14, color: '#888', marginBottom: 32 },
  input: {
    borderWidth: 1, borderColor: '#ddd', borderRadius: 10,
    padding: 14, fontSize: 15, marginBottom: 14, color: '#333',
  },
  roleLabel: { fontSize: 14, color: '#555', marginBottom: 10, fontWeight: '600' },
  roleRow: { flexDirection: 'row', gap: 10, marginBottom: 24 },
  roleBtn: {
    flex: 1, borderWidth: 1.5, borderColor: '#ddd',
    borderRadius: 10, padding: 12, alignItems: 'center',
  },
  roleBtnActive: { borderColor: '#FF6B35', backgroundColor: '#FFF4F0' },
  roleBtnText: { color: '#888', fontWeight: '600', fontSize: 13 },
  roleBtnTextActive: { color: '#FF6B35' },
  btn: {
    backgroundColor: '#FF6B35', borderRadius: 10,
    padding: 15, alignItems: 'center', marginBottom: 16,
  },
  btnText: { color: '#fff', fontWeight: '700', fontSize: 16 },
  link: { textAlign: 'center', color: '#888', fontSize: 14 },
  linkBold: { color: '#FF6B35', fontWeight: '700' },
});

export default RegisterScreen;
