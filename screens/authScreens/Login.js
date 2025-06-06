import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, I18nManager } from 'react-native';
import supabase from '../../supabaseClient';

export default function LoginScreen({ navigation }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setLoading(false);
    if (error) {
      Alert.alert('فشل تسجيل الدخول', error.message);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>تسجيل الدخول</Text>
      <TextInput
        style={styles.input}
        placeholder="البريد الإلكتروني"
        autoCapitalize="none"
        keyboardType="email-address"
        value={email}
        onChangeText={setEmail}
        textAlign={I18nManager.isRTL ? 'right' : 'left'}
      />
      <TextInput
        style={styles.input}
        placeholder="كلمة المرور"
        secureTextEntry
        value={password}
        onChangeText={setPassword}
        textAlign={I18nManager.isRTL ? 'right' : 'left'}
      />
      <TouchableOpacity
        style={[styles.buttonBase, { backgroundColor: '#FFD700', marginTop: 12 }]}
        onPress={handleLogin}
        disabled={loading}
      >
        <Text style={styles.buttonText}>{loading ? "جاري الدخول..." : "دخول"}</Text>
      </TouchableOpacity>
      <TouchableOpacity onPress={() => navigation.navigate('Signup')}>
        <Text style={styles.link}>ليس لديك حساب؟ سجل الآن</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', padding: 24, backgroundColor: '#fff' },
  title: { fontSize: 28, fontWeight: 'bold', color: '#1A1A1A', marginBottom: 32, textAlign: 'center' },
  input: {
    borderWidth: 1,
    borderColor: '#F1F3F4',
    borderRadius: 8,
    padding: 14,
    marginBottom: 18,
    fontSize: 16,
    backgroundColor: '#F8F9FA',
    textAlign: 'right',
  },
  buttonBase: {
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
    elevation: 2,
  },
  buttonText: {
    color: '#1A1A1A',
    fontWeight: 'bold',
    fontSize: 18,
  },
  link: {
    color: '#007BFF',
    marginTop: 24,
    textAlign: 'center',
    fontSize: 16,
    fontWeight: '600',
  },
});