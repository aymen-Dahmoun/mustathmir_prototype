import React, { useState } from 'react';
import {
  View, Text, TextInput, StyleSheet, Alert, Image, TouchableOpacity, I18nManager, ScrollView
} from 'react-native';
import { Picker } from '@react-native-picker/picker';
import * as ImagePicker from 'expo-image-picker';
import supabase from '../../supabaseClient';
import { Ionicons } from '@expo/vector-icons';
import { investmentSectors, Wilayas } from '../../constants/constants';


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
      Alert.alert('خطأ', 'يرجى ملء جميع الحقول.');
      return;
    }

    setLoading(true);

    const { data, error } = await supabase.auth.signUp({ email, password });

    if (error) {
      setLoading(false);
      Alert.alert('فشل التسجيل', error.message);
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

        if (!uploadResponse.ok) throw new Error('فشل رفع الصورة');

        profilePicturePath = fileName;

      } catch (uploadError) {
        setLoading(false);
        Alert.alert('فشل رفع الصورة', uploadError.message);
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
        Alert.alert('فشل إنشاء الملف الشخصي', insertError.message);
        return;
      }

      Alert.alert('تم التسجيل', 'تحقق من بريدك الإلكتروني لتأكيد الحساب!');
      navigation.navigate('Login');
    } else {
      setLoading(false);
      Alert.alert('فشل التسجيل', 'لم يتم إرجاع معرف المستخدم.');
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.scrollContainer}>
      <View style={styles.container}>
        <Text style={styles.title}>إنشاء حساب جديد</Text>

        <TouchableOpacity style={styles.pfpContainer} onPress={pickImage}>
          {profilePicture ? (
            <Image source={{ uri: profilePicture }} style={styles.pfp} />
          ) : (
            <View style={styles.pfpPlaceholder}>
              <Ionicons name="camera-outline" size={36} color="#888" />
            </View>
          )}
        </TouchableOpacity>

        <TextInput
          style={styles.input}
          placeholder="الاسم الكامل"
          value={fullName}
          onChangeText={setFullName}
          textAlign={I18nManager.isRTL ? 'right' : 'left'}
        />

        <Text style={styles.label}>الدور</Text>
        <View style={styles.pickerWrapper}>
          <Picker
            selectedValue={role}
            style={styles.picker}
            onValueChange={setRole}
            itemStyle={{ textAlign: 'right' }}
          >
            <Picker.Item label="مستثمر" value="investor" />
            <Picker.Item label="صاحب مشروع" value="owner" />
          </Picker>
        </View>
 
          <Text style={styles.label}>المدينة</Text>
        <View style={styles.pickerWrapper}>
        <Picker
            selectedValue={role}
            style={styles.picker}
            onValueChange={setCity}
            itemStyle={{ textAlign: 'right' }}
          >
          {Wilayas.map((wilaya, index) => (
            <Picker.Item key={index} label={wilaya} value={wilaya} />
          ))}
          </Picker>
        </View>

        <Text style={styles.label}>القطاع الاستثماري</Text>
        <View style={styles.pickerWrapper}>
          <Picker
            selectedValue={role}
            style={styles.picker}
            onValueChange={setSector}
            itemStyle={{ textAlign: 'left'  }}
          >
            {
              investmentSectors.map((sector, index) => (
                <Picker.Item key={index} label={sector} value={sector} />
              ))
            }
          
          </Picker>
        </View>

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
          onPress={handleSignUp}
          disabled={loading}
        >
          <Text style={styles.buttonText}>{loading ? 'جاري التسجيل...' : 'تسجيل'}</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={() => navigation.navigate('Login')}>
          <Text style={styles.link}>لديك حساب بالفعل؟ سجل الدخول</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scrollContainer: { flexGrow: 1, justifyContent: 'center', backgroundColor: '#fff' },
  container: { flex: 1, justifyContent: 'center', padding: 24, backgroundColor: '#fff' },
  title: { fontSize: 28, fontWeight: 'bold', color: '#1A1A1A', marginBottom: 32, textAlign: 'center' },
  label: { marginBottom: 4, marginTop: 8, fontSize: 16, color: '#6C757D', textAlign: 'right', fontWeight: '600' },
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
  pickerWrapper: {
    borderWidth: 1,
    borderColor: '#000000',
    borderRadius: 8,
    marginBottom: 18,
    backgroundColor: '#F8F9FA',
    overflow: 'hidden',
    marginTop: 8,
  },
  picker: {
    width: '100%',
    height: 52,
    color: '#1A1A1A',
    textAlign: 'right',
    backgroundColor: '#F8F9FA',
    margin: 4,
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