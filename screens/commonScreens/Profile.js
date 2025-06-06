import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  Image,
  ScrollView,
  I18nManager,
} from 'react-native';
import { useAuth } from '../../context/AuthProvider';
import supabase from '../../supabaseClient';


export default function Profile({ route }) {
  const { user, loading } = useAuth();
  const userData = route.params?.userData;
  const [profilePicUrl, setProfilePicUrl] = useState(null);

  useEffect(() => {
    async function fetchPic() {
      if (userData?.profile_picture) {
        const { data } = supabase.storage.from('pfp').getPublicUrl(userData.profile_picture);
        setProfilePicUrl(data.publicUrl);
      } else {
        setProfilePicUrl(null);
      }
    }
    fetchPic();
  }, [userData?.profile_picture]);

  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) Alert.alert('فشل تسجيل الخروج', error.message);
  };

  if (loading) {
    return (
      <View style={styles.centered}>
        <Text style={styles.loadingText}>جاري تحميل الملف الشخصي...</Text>
      </View>
    );
  }

  if (!user) {
    return (
      <View style={styles.centered}>
        <Text style={styles.errorTitle}>تم رفض الوصول</Text>
        <Text style={styles.errorMessage}>يجب تسجيل الدخول لعرض الملف الشخصي.</Text>
        <TouchableOpacity
          style={[styles.buttonBase, { backgroundColor: '#DC3545', marginTop: 16 }]}
          onPress={handleLogout}
        >
          <Text style={styles.buttonText}>تسجيل الخروج</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (!userData) {
    return (
      <View style={styles.centered}>
        <Text style={styles.errorTitle}>الملف غير متوفر</Text>
        <Text style={styles.errorMessage}>تعذر تحميل بيانات الملف الشخصي.</Text>
        <Text style={styles.debugText}>{JSON.stringify(route.params)}</Text>
        <TouchableOpacity
          style={[styles.buttonBase, { backgroundColor: '#DC3545', marginTop: 16 }]}
          onPress={handleLogout}
        >
          <Text style={styles.buttonText}>تسجيل الخروج</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <View style={styles.header}>
        <Text style={styles.welcomeText}>مرحباً بعودتك،</Text>
        <Text style={styles.nameTitle}>{userData.full_name}</Text>
        <View style={styles.roleBadge}>
          <Text style={styles.roleText}>{userData.role === 'owner' ? 'مالك' : 'مستثمر'}</Text>
        </View>
      </View>

      {/* Avatar */}
      <View style={styles.avatarSection}>
        <View style={styles.avatarWrapper}>
          {profilePicUrl ? (
            <Image source={{ uri: profilePicUrl }} style={styles.avatar} />
          ) : (
            <View style={styles.avatarPlaceholder}>
              <Text style={styles.avatarInitials}>
                {userData.full_name?.charAt(0)?.toUpperCase()}
              </Text>
            </View>
          )}
          <View style={styles.statusIndicator} />
        </View>
      </View>

      {/* Content */}
      <View style={styles.content}>
        {/* Executive Info Card */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Text style={styles.cardTitle}>الملف التنفيذي</Text>
            <View style={styles.premiumBadge}>
              <Text style={styles.premiumText}>مميز</Text>
            </View>
          </View>
          <View style={styles.infoRow}>
            <View style={styles.infoBlock}>
              <Text style={styles.infoLabel}>الاسم الكامل</Text>
              <Text style={styles.infoValue}>{userData.full_name}</Text>
            </View>
            <View style={styles.infoBlock}>
              <Text style={styles.infoLabel}>البريد الإلكتروني</Text>
              <Text style={styles.infoValue}>{user.email}</Text>
            </View>
            <View style={styles.infoBlock}>
              <Text style={styles.infoLabel}>الدور</Text>
              <Text style={styles.infoValue}>{userData.role === 'owner' ? 'مالك' : 'مستثمر'}</Text>
            </View>
          </View>
        </View>

        {/* Business Info Card */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>معلومات العمل</Text>
          <View style={styles.businessRow}>
            <View style={styles.businessItem}>
              <Text style={styles.icon}>🏙️</Text>
              <View>
                <Text style={styles.infoLabel}>المدينة</Text>
                <Text style={styles.infoValue}>{userData.city}</Text>
              </View>
            </View>
            <View style={styles.businessItem}>
              <Text style={styles.icon}>💼</Text>
              <View>
                <Text style={styles.infoLabel}>القطاع</Text>
                <Text style={styles.infoValue}>{userData.sector}</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Buttons */}
        <View style={styles.actions}>
          <TouchableOpacity style={[styles.buttonBase, { backgroundColor: '#007BFF', flex: 1, marginRight: 8 }]}>
            <Text style={styles.buttonText}>تعديل الملف</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.buttonBase, { backgroundColor: '#6C757D', flex: 1, marginLeft: 8 }]}>
            <Text style={styles.buttonText}>الإعدادات</Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity
          style={[styles.buttonBase, { backgroundColor: '#DC3545', marginTop: 16 }]}
          onPress={handleLogout}
        >
          <Text style={styles.buttonText}>تسجيل الخروج</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 24 },
  loadingText: { fontSize: 18, color: '#6C757D', fontWeight: '500' },
  errorTitle: { fontSize: 24, fontWeight: 'bold', color: '#1A1A1A', marginBottom: 8, textAlign: 'center' },
  errorMessage: { fontSize: 16, color: '#6C757D', textAlign: 'center' },
  debugText: { fontSize: 12, color: '#ADB5BD', textAlign: 'center', marginTop: 8 },
  header: {
    backgroundColor: '#rgb(212, 175, 55)',
    paddingTop: 60,
    paddingBottom: 24,
    alignItems: 'center',
  },
  welcomeText: { fontSize: 16, color: '#6C757D', marginBottom: 4 },
  nameTitle: { fontSize: 32, fontWeight: 'bold', color: '#1A1A1A' },
  roleBadge: {
    backgroundColor: 'rgba(212,175,55,0.1)',
    paddingHorizontal: 16,
    paddingVertical: 4,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#D4AF37',
    marginTop: 8,
    marginBottom: 20,
  },
  roleText: { color: '#B8860B', fontWeight: '600', fontSize: 14 },
  avatarSection: { alignItems: 'center', marginTop: -40, marginBottom: 24 },
  avatarWrapper: { position: 'relative' },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 3,
    borderColor: '#fff',
    elevation: 6,
  },
  avatarPlaceholder: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#F8F9FA',
    borderWidth: 3,
    borderColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 6,
  },
  avatarInitials: { fontSize: 32, fontWeight: 'bold', color: '#D4AF37' },
  statusIndicator: {
    position: 'absolute',
    bottom: 4,
    right: 4,
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: '#28A745',
    borderWidth: 2,
    borderColor: '#fff',
  },
  content: { paddingHorizontal: 24, paddingBottom: 32 },
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    marginBottom: 16,
    elevation: 4,
    borderWidth: 1,
    borderColor: '#F1F3F4',
  },
  cardHeader: {
    flexDirection: I18nManager.isRTL ? 'row-reverse' : 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  cardTitle: { fontSize: 20, fontWeight: 'bold', color: '#1A1A1A', textAlign: 'right' },
  premiumBadge: { backgroundColor: '#D4AF37', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4 },
  premiumText: { color: '#fff', fontSize: 10, fontWeight: 'bold' },
  infoRow: { gap: 12 },
  infoBlock: {
    borderBottomWidth: 1,
    borderBottomColor: '#F1F3F4',
    paddingBottom: 8,
  },
  infoLabel: {
    fontSize: 12,
    color: '#6C757D',
    fontWeight: '600',
    textTransform: 'uppercase',
    marginBottom: 2,
    textAlign: 'right',
  },
  infoValue: {
    fontSize: 16,
    color: '#1A1A1A',
    fontWeight: '500',
    textAlign: 'right',
  },
  businessRow: { marginTop: 12, gap: 12 },
  businessItem: {
    flexDirection: I18nManager.isRTL ? 'row-reverse' : 'row',
    alignItems: 'center',
    gap: 8,
  },
  icon: { fontSize: 20 },
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
