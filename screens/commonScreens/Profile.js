import React from 'react';
import { View, Text, StyleSheet, Button, Alert } from 'react-native';
import { useAuth } from '../../context/AuthProvider';
import supabase from '../../supabaseClient';

export default function Profile({ route }) {
  const { user, loading } = useAuth();
  const userData = route.params?.userData;

  // Debug logs
  console.log('=== PROFILE SCREEN DEBUG ===');
  console.log('route.params:', route.params);
  console.log('userData from params:', userData);
  console.log('user from auth:', user ? 'exists' : 'null');
  console.log('=============================');

  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      Alert.alert('Logout Failed', error.message);
    }
  };

  if (loading) {
    return <Text>Loading...</Text>;
  }

  if (!user) {
    return (
      <View style={styles.container}>
        <Text>No authenticated user found.</Text>
        <Button title="Logout" onPress={handleLogout} color="#d9534f" />
      </View>
    );
  }

  if (!userData) {
    return (
      <View style={styles.container}>
        <Text>User authenticated but no profile data found.</Text>
        <Text>Route params: {JSON.stringify(route.params)}</Text>
        <Button title="Logout" onPress={handleLogout} color="#d9534f" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Profile</Text>
      
      <Text style={styles.label}>Full Name:</Text>
      <Text style={styles.value}>{userData.full_name}</Text>
      
      <Text style={styles.label}>Email:</Text>
      <Text style={styles.value}>{user.email}</Text>
      
      <Text style={styles.label}>Role:</Text>
      <Text style={styles.value}>{userData.role}</Text>
      
      <Text style={styles.label}>City:</Text>
      <Text style={styles.value}>{userData.city}</Text>
      
      <Text style={styles.label}>Sector:</Text>
      <Text style={styles.value}>{userData.sector}</Text>
      
      {userData.profile_picture && (
        <>
          <Text style={styles.label}>Profile Picture:</Text>
          <Text style={styles.value}>{userData.profile_picture}</Text>
        </>
      )}
      
      <Button title="Logout" onPress={handleLogout} color="#d9534f" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', padding: 24 },
  title: { fontSize: 24, marginBottom: 24, textAlign: 'center' },
  label: { fontWeight: 'bold', marginTop: 12 },
  value: { marginBottom: 8 },
});