import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  Image,
  ScrollView,
  RefreshControl,
  ActivityIndicator,
  I18nManager,
} from 'react-native';
import { useAuth } from '../../context/AuthProvider';
import supabase from '../../supabaseClient';

// Enable RTL layout for Arabic
I18nManager.allowRTL(true);
I18nManager.forceRTL(true);

export default function InvestorsList({ navigation }) {
  const { user, loading: authLoading } = useAuth();
  const [investors, setInvestors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchInvestors = async () => {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('role', 'investor')
        .order('full_name', { ascending: true });

      if (error) {
        throw error;
      }

      // Fetch profile pictures for each investor
      const investorsWithPics = await Promise.all(
        data.map(async (investor) => {
          if (investor.profile_picture) {
            const { data: picData } = supabase.storage
              .from('pfp')
              .getPublicUrl(investor.profile_picture);
            return { ...investor, profilePicUrl: picData.publicUrl };
          }
          return { ...investor, profilePicUrl: null };
        })
      );

      setInvestors(investorsWithPics);
    } catch (error) {
      Alert.alert('خطأ', 'فشل في تحميل المستثمرين. يرجى المحاولة مرة أخرى.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchInvestors();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    fetchInvestors();
  };

  const handleInvestorPress = (investor) => {
    // Navigate to investor profile or details screen
    navigation.navigate('Letter', { investorData: investor });
  };
  const renderInvestorCard = (investor) => (
    <TouchableOpacity
      key={investor.id}
      style={styles.investorCard}
      onPress={() => handleInvestorPress(investor)}
      activeOpacity={0.7}
    >
      {/* Arrow Indicator (moved to left for RTL) */}
      <View style={styles.arrowContainer}>
        <Text style={styles.arrow}>‹</Text>
      </View>

      {/* Investor Info */}
      <View style={styles.investorInfo}>
        <View style={styles.investorHeader}>
          <Text style={styles.investorName} numberOfLines={1}>
            {investor.full_name || 'مستثمر غير معروف'}
          </Text>
          <View style={styles.investorBadge}>
            <Text style={styles.investorBadgeText}>مستثمر</Text>
          </View>
        </View>

        <Text style={styles.investorEmail} numberOfLines={1}>
          {investor.email}
        </Text>

        {/* Location and Sector */}
        <View style={styles.investorDetails}>
          {investor.city && (
            <View style={styles.detailItem}>
              <Text style={styles.detailText}>{investor.city}</Text>
              <Text style={styles.detailIcon}>🏙️</Text>
            </View>
          )}
          {investor.sector && (
            <View style={styles.detailItem}>
              <Text style={styles.detailText}>{investor.sector}</Text>
              <Text style={styles.detailIcon}>💼</Text>
            </View>
          )}
        </View>
      </View>

      {/* Avatar Section (moved to right for RTL) */}
      <View style={styles.avatarSection}>
        {investor.profilePicUrl ? (
          <Image source={{ uri: investor.profilePicUrl || '/assets/profile.png'}} style={styles.avatar} />
        ) : (
          <View style={styles.avatarPlaceholder}>
            <Text style={styles.avatarInitials}>
              {investor.full_name?.charAt(0)?.toUpperCase() || '؟'}
            </Text>
          </View>
        )}
        <View style={styles.statusIndicator} />
      </View>
    </TouchableOpacity>
  );

  if (authLoading || loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#007BFF" />
        <Text style={styles.loadingText}>جاري تحميل المستثمرين...</Text>
      </View>
    );
  }

  if (!user) {
    return (
      <View style={styles.centered}>
        <Text style={styles.errorTitle}>تم رفض الوصول</Text>
        <Text style={styles.errorMessage}>يتطلب المصادقة لعرض المستثمرين.</Text>
      </View>
    );
  }

  return (
    <ScrollView 
      style={styles.container} 
      showsVerticalScrollIndicator={false}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerSubtitle}>تواصل مع</Text>
        <Text style={styles.headerTitle}>المستثمرين</Text>
        <View style={styles.headerBadge}>
          <Text style={styles.headerBadgeText}>{investors.length} متاح</Text>
        </View>
      </View>

      {/* Content */}
      <View style={styles.content}>
        {/* Stats Card */}
        <View style={styles.statsCard}>
          <View style={styles.statsHeader}>
            <Text style={styles.statsTitle}>شبكة الاستثمار</Text>
            <View style={styles.premiumBadge}>
              <Text style={styles.premiumText}>نشط</Text>
            </View>
          </View>
          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>{investors.length}</Text>
              <Text style={styles.statLabel}>إجمالي المستثمرين</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>
                {investors.filter(inv => inv.city).length}
              </Text>
              <Text style={styles.statLabel}>مع الموقع</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>
                {investors.filter(inv => inv.sector).length}
              </Text>
              <Text style={styles.statLabel}>القطاع محدد</Text>
            </View>
          </View>
        </View>

        {/* Investors List */}
        {investors.length > 0 ? (
          <View style={styles.investorsContainer}>
            <Text style={styles.sectionTitle}>المستثمرون المتاحون</Text>
            {investors.map(renderInvestorCard)}
          </View>
        ) : (
          <View style={styles.emptyState}>
            <Text style={styles.emptyIcon}>💼</Text>
            <Text style={styles.emptyTitle}>لم يتم العثور على مستثمرين</Text>
            <Text style={styles.emptyMessage}>
              لا يوجد حاليًا مستثمرون مسجلون في المنصة.
            </Text>
            <TouchableOpacity style={styles.refreshButton} onPress={onRefresh}>
              <Text style={styles.refreshButtonText}>تحديث القائمة</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: '#fff' 
  },
  centered: { 
    flex: 1, 
    justifyContent: 'center', 
    alignItems: 'center', 
    padding: 24 
  },
  loadingText: { 
    fontSize: 18, 
    color: '#6C757D', 
    fontWeight: '500', 
    marginTop: 12,
    textAlign: 'center'
  },
  errorTitle: { 
    fontSize: 24, 
    fontWeight: 'bold', 
    color: '#1A1A1A', 
    marginBottom: 8,
    textAlign: 'center'
  },
  errorMessage: { 
    fontSize: 16, 
    color: '#6C757D', 
    textAlign: 'center' 
  },

  // Header Styles
  header: {
    backgroundColor: '#F1F3F4',
    paddingTop: 60,
    paddingBottom: 24,
    alignItems: 'center',
  },
  headerSubtitle: { 
    fontSize: 16, 
    color: '#6C757D', 
    marginBottom: 4,
    textAlign: 'center'
  },
  headerTitle: { 
    fontSize: 32, 
    fontWeight: 'bold', 
    color: '#1A1A1A',
    textAlign: 'center'
  },
  headerBadge: {
    backgroundColor: 'rgba(40,167,69,0.1)',
    paddingHorizontal: 16,
    paddingVertical: 4,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#28A745',
    marginTop: 8,
  },
  headerBadgeText: { 
    color: '#28A745', 
    fontWeight: '600', 
    fontSize: 14,
    textAlign: 'center'
  },

  // Content Styles
  content: { 
    paddingHorizontal: 24, 
    paddingTop: 24,
    paddingBottom: 32 
  },

  // Stats Card Styles
  statsCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 4,
    borderWidth: 1,
    borderColor: '#F1F3F4',
  },
  statsHeader: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center', 
    marginBottom: 16 
  },
  statsTitle: { 
    fontSize: 20, 
    fontWeight: 'bold', 
    color: '#1A1A1A',
    textAlign: 'right'
  },
  premiumBadge: { 
    backgroundColor: '#28A745', 
    paddingHorizontal: 6, 
    paddingVertical: 2, 
    borderRadius: 4 
  },
  premiumText: { 
    color: '#fff', 
    fontSize: 10, 
    fontWeight: 'bold',
    textAlign: 'center'
  },
  statsRow: { 
    flexDirection: 'row', 
    justifyContent: 'space-around' 
  },
  statItem: { 
    alignItems: 'center' 
  },
  statNumber: { 
    fontSize: 24, 
    fontWeight: 'bold', 
    color: '#007BFF', 
    marginBottom: 4 
  },
  statLabel: { 
    fontSize: 12, 
    color: '#6C757D', 
    textAlign: 'center' 
  },

  // Section Styles
  investorsContainer: { 
    marginBottom: 16 
  },
  sectionTitle: { 
    fontSize: 18, 
    fontWeight: 'bold', 
    color: '#1A1A1A', 
    marginBottom: 16,
    textAlign: 'right'
  },

  // Investor Card Styles
  investorCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 4,
    borderWidth: 1,
    borderColor: '#F1F3F4',
  },

  // Avatar Styles (repositioned for RTL)
  avatarSection: { 
    position: 'relative', 
    marginLeft: 16 
  },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    borderWidth: 2,
    borderColor: '#fff',
  },
  avatarPlaceholder: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#F8F9FA',
    borderWidth: 2,
    borderColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarInitials: { 
    fontSize: 20, 
    fontWeight: 'bold', 
    color: '#007BFF' 
  },
  statusIndicator: {
    position: 'absolute',
    bottom: 2,
    left: 2, // Changed from right to left for RTL
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#28A745',
    borderWidth: 2,
    borderColor: '#fff',
  },

  // Investor Info Styles
  investorInfo: { 
    flex: 1 
  },
  investorHeader: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    marginBottom: 4,
    justifyContent: 'flex-end' // Right align for RTL
  },
  investorName: { 
    fontSize: 16, 
    fontWeight: 'bold', 
    color: '#1A1A1A', 
    flex: 1, 
    marginLeft: 8, // Changed from marginRight
    textAlign: 'right'
  },
  investorBadge: {
    backgroundColor: 'rgba(220,53,69,0.1)',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#DC3545',
  },
  investorBadgeText: { 
    color: '#DC3545', 
    fontSize: 8, 
    fontWeight: 'bold',
    textAlign: 'center'
  },
  investorEmail: { 
    fontSize: 14, 
    color: '#6C757D', 
    marginBottom: 8,
    textAlign: 'right'
  },
  investorDetails: { 
    flexDirection: 'row', 
    flexWrap: 'wrap',
    justifyContent: 'flex-end' // Right align for RTL
  },
  detailItem: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    marginLeft: 16, // Changed from marginRight
    marginBottom: 4 
  },
  detailIcon: { 
    fontSize: 12, 
    marginLeft: 4 // Changed from marginRight
  },
  detailText: { 
    fontSize: 12, 
    color: '#6C757D' 
  },

  // Arrow Styles (repositioned for RTL)
  arrowContainer: { 
    marginRight: 8 // Changed from marginLeft
  },
  arrow: { 
    fontSize: 24, 
    color: '#ADB5BD', 
    fontWeight: 'bold' 
  },

  // Empty State Styles
  emptyState: { 
    alignItems: 'center', 
    paddingVertical: 40 
  },
  emptyIcon: { 
    fontSize: 48, 
    marginBottom: 16 
  },
  emptyTitle: { 
    fontSize: 20, 
    fontWeight: 'bold', 
    color: '#1A1A1A', 
    marginBottom: 8,
    textAlign: 'center'
  },
  emptyMessage: { 
    fontSize: 16, 
    color: '#6C757D', 
    textAlign: 'center', 
    marginBottom: 24,
    lineHeight: 24 
  },
  refreshButton: {
    backgroundColor: '#007BFF',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  refreshButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center'
  },
});