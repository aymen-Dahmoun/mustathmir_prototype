import React, { useState } from 'react';
import { View, Text, TextInput, Button, StyleSheet, Alert } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import supabase from '../../supabaseClient';

export default function SignUpScreen({ navigation }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [role, setRole] = useState('investor');
  const [city, setCity] = useState('');
  const [sector, setSector] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSignUp = async () => {
    if (!fullName || !role || !city || !sector) {
      Alert.alert('Error', 'Please fill all fields.');
      return;
    }
    setLoading(true);
    const { data, error } = await supabase.auth.signUp({ email, password });
    if (error) {
      setLoading(false);
      Alert.alert('Sign Up Failed', error.message);
      return;
    }
    // Insert user profile into users table
    const userId = data?.user?.id;
    if (userId) {
      const { error: insertError } = await supabase.from('users').insert([
        {
          id: userId,
          full_name: fullName,
          role,
          city,
          sector,
        },
      ]);
      setLoading(false);
      if (insertError) {
        Alert.alert('Profile Creation Failed', insertError.message);
        return;
      }
      Alert.alert('Success', 'Check your email for confirmation!');
      navigation.navigate('Login');
    } else {
      setLoading(false);
      Alert.alert('Sign Up Failed', 'No user ID returned.');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Sign Up</Text>
      <TextInput
        style={styles.input}
        placeholder="Full Name"
        value={fullName}
        onChangeText={setFullName}
      />
      <Text style={styles.label}>Role</Text>
      <Picker
        selectedValue={role}
        style={styles.input}
        onValueChange={(itemValue) => setRole(itemValue)}
      >
        <Picker.Item label="Investor" value="investor" />
        <Picker.Item label="Owner" value="owner" />
      </Picker>
      <TextInput
        style={styles.input}
        placeholder="City"
        value={city}
        onChangeText={setCity}
      />
      <TextInput
        style={styles.input}
        placeholder="Sector"
        value={sector}
        onChangeText={setSector}
      />
      <TextInput
        style={styles.input}
        placeholder="Email"
        autoCapitalize="none"
        keyboardType="email-address"
        value={email}
        onChangeText={setEmail}
      />
      <TextInput
        style={styles.input}
        placeholder="Password"
        secureTextEntry
        value={password}
        onChangeText={setPassword}
      />
      <Button title={loading ? "Signing up..." : "Sign Up"} onPress={handleSignUp} disabled={loading} />
      <Text
        style={styles.link}
        onPress={() => navigation.navigate('Login')}
      >
        Already have an account? Log in
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', padding: 24 },
  title: { fontSize: 24, marginBottom: 24, textAlign: 'center' },
  label: { marginBottom: 4, marginTop: 8 },
  input: { borderWidth: 1, borderColor: '#ccc', borderRadius: 6, padding: 12, marginBottom: 16 },
  link: { color: 'blue', marginTop: 16, textAlign: 'center' },
});