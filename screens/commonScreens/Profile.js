import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  ScrollView,
  I18nManager,
  FlatList,
  TouchableOpacity,
  Linking,
} from 'react-native';
import { useAuth } from '../../context/AuthProvider';
import supabase from '../../supabaseClient';
import { useNavigation } from '@react-navigation/native';

export default function Profile({ route }) {
  const { user, loading } = useAuth();
  const userData = route.params?.userData;
  const [profilePicUrl, setProfilePicUrl] = useState(null);
  const [myProjects, setMyProjects] = useState([]);
  const [projectsLoading, setProjectsLoading] = useState(false);
  const navigation = useNavigation();

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

  useEffect(() => {
    const fetchProjects = async () => {
      if (userData?.role === 'owner') {
        setProjectsLoading(true);
        const { data, error } = await supabase
          .from('projects')
          .select('*')
          .eq('owner_id', user.id)
          .order('created_at', { ascending: false });
        setMyProjects(data || []);
        setProjectsLoading(false);
      }
    };
    fetchProjects();
  }, [userData?.role, user?.id]);

  const getPublicUrl = (bucket, fileName) => {
    if (!fileName) return null;
    const { data } = supabase.storage.from(bucket).getPublicUrl(fileName);
    return data?.publicUrl || null;
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
      </View>
    );
  }

  if (!userData) {
    return (
      <View style={styles.centered}>
        <Text style={styles.errorTitle}>الملف غير متوفر</Text>
        <Text style={styles.errorMessage}>تعذر تحميل بيانات الملف الشخصي.</Text>
        <Text style={styles.debugText}>{JSON.stringify(route.params)}</Text>
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

        {userData.role === 'owner' && (
          <View style={styles.card}>
            <View style={{ flexDirection: I18nManager.isRTL ? 'row-reverse' : 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
              <Text style={styles.cardTitle}>مشاريعي</Text>
              <TouchableOpacity
                style={styles.addProjectButton}
                onPress={() => navigation.navigate('Add Project')}
              >
                <Text style={styles.addProjectButtonText}>+ إضافة مشروع</Text>
              </TouchableOpacity>
            </View>
            {projectsLoading ? (
              <Text style={styles.loadingText}>جاري تحميل المشاريع...</Text>
            ) : myProjects.length === 0 ? (
              <Text style={styles.emptyText}>لا توجد مشاريع بعد.</Text>
            ) : (
              <FlatList
                data={myProjects}
                keyExtractor={item => item.id}
                renderItem={({ item }) => {
                  const pictureUrl = getPublicUrl('picture', item.picture);
                  const documentUrl = getPublicUrl('document', item.document);
                  return (
                    <View style={styles.projectItem}>
                      <TouchableOpacity
                        activeOpacity={0.8}
                        onPress={() => {
                          if (pictureUrl) Linking.openURL(pictureUrl);
                        }}
                      >
                        {pictureUrl ? (
                          <Image source={{ uri: pictureUrl }} style={styles.projectImage} />
                        ) : (
                          <View style={styles.projectImagePlaceholder}>
                            <Text style={styles.placeholderText}>لا توجد صورة</Text>
                          </View>
                        )}
                      </TouchableOpacity>
                      <View style={{ flex: 1 }}>
                        <Text style={styles.projectTitle}>{item.title}</Text>
                        <Text style={styles.projectDesc}>{item.description}</Text>
                        {documentUrl && (
                          <TouchableOpacity
                            style={styles.docButton}
                            onPress={() => Linking.openURL(documentUrl)}
                          >
                            <Text style={styles.docButtonText}>عرض المستند</Text>
                          </TouchableOpacity>
                        )}
                      </View>
                    </View>
                  );
                }}
                scrollEnabled={false}
                contentContainerStyle={{ paddingBottom: 8 }}
              />
            )}
          </View>
        )}
      </View>
    </ScrollView>
  );
}

// ...styles remain unchanged, but add these at the end:
const styles = StyleSheet.create({
  // ...existing styles...
  projectItem: {
    flexDirection: I18nManager.isRTL ? 'row-reverse' : 'row',
    alignItems: 'center',
    marginBottom: 16,
    gap: 12,
  },
  projectImage: {
    width: 64,
    height: 64,
    borderRadius: 8,
    backgroundColor: '#eee',
    marginLeft: I18nManager.isRTL ? 0 : 12,
    marginRight: I18nManager.isRTL ? 12 : 0,
  },
  addProjectButton: {
    backgroundColor: '#FFD700',
    paddingVertical: 6,
    paddingHorizontal: 14,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: I18nManager.isRTL ? 0 : 8,
    marginRight: I18nManager.isRTL ? 8 : 0,
  },
  addProjectButtonText: {
    color: '#1A1A1A',
    fontWeight: 'bold',
    fontSize: 15,
  },
  projectImagePlaceholder: {
    width: 64,
    height: 64,
    borderRadius: 8,
    backgroundColor: '#eee',
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: I18nManager.isRTL ? 0 : 12,
    marginRight: I18nManager.isRTL ? 12 : 0,
  },
  placeholderText: {
    color: '#aaa',
    fontSize: 12,
  },
  projectTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1A1A1A',
    textAlign: 'right',
    marginBottom: 2,
  },
  projectDesc: {
    fontSize: 14,
    color: '#6C757D',
    textAlign: 'right',
    marginBottom: 4,
  },
  docButton: {
    backgroundColor: '#FFD700',
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 6,
    alignSelf: 'flex-start',
    marginTop: 4,
  },
  docButtonText: {
    color: '#1A1A1A',
    fontWeight: 'bold',
    fontSize: 13,
  },
  emptyText: {
    textAlign: 'center',
    color: '#888',
    marginTop: 8,
    fontSize: 15,
  },
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
