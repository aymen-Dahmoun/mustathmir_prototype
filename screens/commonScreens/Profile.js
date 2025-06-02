import React from 'react';
import { View, Text, StyleSheet, Button, Alert } from 'react-native';
import { useAuth } from '../../context/AuthProvider';
import supabase from '../../supabaseClient';

export default function Profile({ route }) {
  const { user, loading } = useAuth();
  const userData = route.params?.user;
  console.log('user: ', user);
  console.log('metadata: ', userData)

  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      Alert.alert('Logout Failed', error.message);
    }
    // On logout, AuthProvider will update and redirect user automatically
  };

  if (loading) {
    return <Text>Loading...</Text>;
  }

  if (!user || !userData) {
    return (
        <View>
            <Text>No user data available.</Text>
            <Button title="Logout" onPress={handleLogout} color="#d9534f" />
        </View>
    )
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Profile</Text>
      <Text style={styles.label}>Email:</Text>
      <Text style={styles.value}>{user.email}</Text>
      <Text style={styles.label}>Role:</Text>
      <Text style={styles.value}>{userData.role}</Text>
      {/* Add more fields from userData as needed */}
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