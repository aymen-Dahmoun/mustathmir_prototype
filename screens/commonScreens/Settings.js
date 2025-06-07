import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  I18nManager,
  Linking,
  Platform,
  ScrollView,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useAuth } from '../../context/AuthProvider';
import supabase from '../../supabaseClient';

export default function Settings() {
  const navigation = useNavigation();
  const { logout } = useAuth();

  const handleLogout = async () => {
    Alert.alert(
      'تأكيد الخروج',
      'هل أنت متأكد أنك تريد تسجيل الخروج؟',
      [
        { text: 'إلغاء', style: 'cancel' },
        {
          text: 'خروج',
          style: 'destructive',
          onPress: async () => {
            await supabase.auth.signOut();
            logout && logout();
          },
        },
      ]
    );
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.header}>الإعدادات</Text>

      <TouchableOpacity style={styles.item} onPress={() => navigation.navigate('Policies')}>
        <Text style={styles.itemText}>سياسة الخصوصية والبيانات</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.item}
        onPress={() => {
          Linking.openURL('mailto:support@successpartners.com');
        }}
      >
        <Text style={styles.itemText}>تواصل مع الدعم الفني</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.item}
        onPress={() => {
          Linking.openURL('https://successpartners.com/faq');
        }}
      >
        <Text style={styles.itemText}>الأسئلة الشائعة</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.item}
        onPress={() => {
          Alert.alert(
            'عن التطبيق',
            'شركاء النجاح هو منصة تربط المستثمرين بأصحاب المشاريع في بيئة آمنة واحترافية.\nالإصدار: 1.0.0'
          );
        }}
      >
        <Text style={styles.itemText}>عن التطبيق</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.item, { backgroundColor: '#FFD700', marginTop: 32 }]}
        onPress={handleLogout}
      >
        <Text style={[styles.itemText, { color: '#1A1A1A', fontWeight: 'bold' }]}>تسجيل الخروج</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 24,
    backgroundColor: '#fff',
    flexGrow: 1,
    alignItems: 'stretch',
  },
  header: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1A1A1A',
    textAlign: 'center',
    marginBottom: 32,
  },
  item: {
    backgroundColor: '#fffbe6',
    paddingVertical: 18,
    paddingHorizontal: 16,
    borderRadius: 10,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#ffe066',
    elevation: 1,
  },
  itemText: {
    fontSize: 18,
    color: '#1A1A1A',
    textAlign: 'right',
  },
});