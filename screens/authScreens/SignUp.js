import React, { useState } from 'react';
import {
  View, Text, TextInput, Button,
  StyleSheet, Alert, Image, TouchableOpacity
} from 'react-native';
import { Picker } from '@react-native-picker/picker';
import * as ImagePicker from 'expo-image-picker';
import supabase from '../../supabaseClient';

export default function SignUpScreen({ navigation }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [role, setRole] = useState('investor');
  const [city, setCity] = useState('');
  const [sector, setSector] = useState('');
  const [profilePicture, setProfilePicture] = useState(null);
  const [loading, setLoading] = useState(false);

  // Image Picker
  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.7,
    });

    if (!result.canceled) {
      setProfilePicture(result.assets[0].uri);
    }
  };

  const handleSignUp = async () => {
    if (!fullName || !role || !city || !sector || !email || !password) {
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

    const userId = data?.user?.id;
    let profilePicturePath = null;

    // Handle profile picture upload
    if (userId && profilePicture) {
      try {
        const fileExt = profilePicture.split('.').pop();
        const fileName = `${userId}.${fileExt}`;

        const { data: signedUrlData, error: signedUrlError } = await supabase
          .storage
          .from('pfp')
          .createSignedUploadUrl(fileName);

        if (signedUrlError) throw signedUrlError;

        const formData = new FormData();
        formData.append('file', {
          uri: profilePicture,
          name: fileName,
          type: 'image/jpeg',
        });

        const uploadResponse = await fetch(signedUrlData.signedUrl, {
          method: 'PUT',
          body: formData,
          headers: { 'Content-Type': 'multipart/form-data' },
        });

        if (!uploadResponse.ok) throw new Error('Image upload failed');

        profilePicturePath = fileName;

      } catch (uploadError) {
        setLoading(false);
        Alert.alert('Image Upload Failed', uploadError.message);
        return;
      }
    }

    // Save additional user info to 'users' table
    if (userId) {
      const { error: insertError } = await supabase.from('users').insert([
        {
          id: userId,
          full_name: fullName,
          role,
          city,
          sector,
          profile_picture: profilePicturePath,
        },
      ]);

      setLoading(false);

      if (insertError) {
        console.error('Insert Error:', insertError.message);
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

      <TouchableOpacity style={styles.pfpContainer} onPress={pickImage}>
        {profilePicture ? (
          <Image source={{ uri: profilePicture }} style={styles.pfp} />
        ) : (
          <View style={styles.pfpPlaceholder}>
            <Text style={{ color: '#888' }}>Pick Profile Picture</Text>
          </View>
        )}
      </TouchableOpacity>

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
        onValueChange={setRole}
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

      <Button
        title={loading ? 'Signing up...' : 'Sign Up'}
        onPress={handleSignUp}
        disabled={loading}
      />

      <Text style={styles.link} onPress={() => navigation.navigate('Login')}>
        Already have an account? Log in
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', padding: 24 },
  title: { fontSize: 24, marginBottom: 24, textAlign: 'center' },
  label: { marginBottom: 4, marginTop: 8 },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 6,
    padding: 12,
    marginBottom: 16,
  },
  link: { color: 'blue', marginTop: 16, textAlign: 'center' },
  pfpContainer: { alignSelf: 'center', marginBottom: 16 },
  pfp: { width: 80, height: 80, borderRadius: 40 },
  pfpPlaceholder: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#eee',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
