import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  TextInput,
  I18nManager,
  Alert,
  Image,
} from 'react-native';
import supabase from '../../supabaseClient';
import { useAuth } from '../../context/AuthProvider';

export default function CoverLetterScreen({ route, navigation }) {
  const { user } = useAuth();
  const investorData = route.params?.investorData;
  const receiverId = investorData?.id;
  const [message, setMessage] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [loading, setLoading] = useState(false);
  console.log('receiver: ', investorData);

  const handleSend = async () => {
    if (!message.trim()) {
      Alert.alert('خطأ', 'يرجى كتابة رسالة قبل الإرسال.');
      return;
    }
    setLoading(true);
    const { error } = await supabase.from('contact_requests').insert([
      {
        sender_id: user.id,
        receiver_id: receiverId,
        message,
        phone_number: phoneNumber || null,
      },
    ]);
    setLoading(false);
    if (error) {
      Alert.alert('خطأ', 'حدث خطأ أثناء إرسال الرسالة. حاول مرة أخرى.');
    } else {
      Alert.alert('تم الإرسال', 'تم إرسال رسالتك بنجاح.');
      navigation.goBack();
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ flexGrow: 1 }}>
      <View style={styles.header}>
        <Text style={styles.title}>إرسال رسالة تعريفية</Text>
      </View>
      {/* Investor Info Section */}
      {investorData && (
        <View style={styles.investorCard}>
          <View style={styles.investorRow}>
            <Image
              source={{ uri: investorData.profilePicUrl }}
              style={styles.avatar}
            />
            <View style={{ flex: 1 }}>
              <Text style={styles.investorName}>{investorData.full_name}</Text>
              <Text style={styles.investorRole}>
                {investorData.role === 'owner' ? 'مالك' : 'مستثمر'}
              </Text>
              <Text style={styles.investorInfo}>المدينة: {investorData.city}</Text>
              <Text style={styles.investorInfo}>القطاع: {investorData.sector}</Text>
            </View>
          </View>
        </View>
      )}
      <View style={styles.content}>
        <View style={styles.card}>
          <Text style={styles.label}>الرسالة</Text>
          <TextInput
            style={styles.textArea}
            placeholder="اكتب رسالتك هنا..."
            value={message}
            onChangeText={setMessage}
            multiline
            textAlign={I18nManager.isRTL ? 'right' : 'left'}
          />
          <Text style={styles.label}>رقم الهاتف (اختياري)</Text>
          <TextInput
            style={styles.input}
            placeholder="رقم الهاتف للتواصل"
            value={phoneNumber}
            onChangeText={setPhoneNumber}
            keyboardType="phone-pad"
            textAlign={I18nManager.isRTL ? 'right' : 'left'}
            maxLength={15}
          />
        </View>
        <View style={styles.actions}>
          <TouchableOpacity
            style={[styles.buttonBase, { backgroundColor: '#007BFF', flex: 1, marginRight: 8 }]}
            onPress={handleSend}
            disabled={loading}
          >
            <Text style={styles.buttonText}>{loading ? 'جاري الإرسال...' : 'إرسال'}</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.buttonBase, { backgroundColor: '#6C757D', flex: 1, marginLeft: 8 }]}
            onPress={() => navigation.goBack()}
          >
            <Text style={styles.buttonText}>رجوع</Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  header: {
    backgroundColor: '#F1F3F4',
    paddingTop: 60,
    paddingBottom: 24,
    alignItems: 'center',
  },
  title: { fontSize: 28, fontWeight: 'bold', color: '#1A1A1A', textAlign: 'center' },
  investorCard: {
    backgroundColor: '#fffbe6',
    borderRadius: 12,
    padding: 16,
    marginHorizontal: 24,
    marginTop: 16,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#ffe066',
    elevation: 2,
  },
  investorRow: {
    flexDirection: I18nManager.isRTL ? 'row-reverse' : 'row',
    alignItems: 'center',
    gap: 16,
  },
  avatar: {
    width: 64,
    height: 64,
    borderRadius: 32,
    borderWidth: 2,
    borderColor: '#FFD700',
    marginLeft: I18nManager.isRTL ? 0 : 12,
    marginRight: I18nManager.isRTL ? 12 : 0,
    backgroundColor: '#eee',
  },
  investorName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1A1A1A',
    textAlign: 'right',
  },
  investorRole: {
    fontSize: 16,
    color: '#B8860B',
    fontWeight: '600',
    marginTop: 2,
    textAlign: 'right',
  },
  investorInfo: {
    fontSize: 14,
    color: '#6C757D',
    textAlign: 'right',
    marginTop: 2,
  },
  content: { paddingHorizontal: 24, paddingBottom: 32, flex: 1, justifyContent: 'center' },
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 24,
    marginBottom: 24,
    elevation: 4,
    borderWidth: 1,
    borderColor: '#F1F3F4',
    minHeight: 200,
    justifyContent: 'center',
  },
  label: {
    fontSize: 16,
    color: '#6C757D',
    fontWeight: '600',
    marginBottom: 8,
    textAlign: 'right',
  },
  textArea: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    minHeight: 100,
    padding: 12,
    marginBottom: 16,
    fontSize: 16,
    textAlignVertical: 'top',
    backgroundColor: '#F8F9FA',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
    fontSize: 16,
    backgroundColor: '#F8F9FA',
  },
  actions: {
    flexDirection: I18nManager.isRTL ? 'row-reverse' : 'row',
    marginTop: 12,
  },
  buttonBase: {
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 16,
  },
});