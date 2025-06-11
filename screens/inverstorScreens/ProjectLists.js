import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Image,
  TouchableOpacity,
  ActivityIndicator,
  Linking,
  I18nManager,
} from 'react-native';
import supabase from '../../supabaseClient';
import { useNavigation } from '@react-navigation/native';

export default function ProjectLists() {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigation = useNavigation();

  useEffect(() => {
    const fetchProjects = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from('projects')
        .select('*, users:owner_id(full_name, city, sector, role, profile_picture, id)')
      if (!error) {
        setProjects(data || []);
      }
      setLoading(false);
    };
    fetchProjects();
  }, []);

  // Helper to get public URL for picture/document
  const getPublicUrl = (bucket, fileName) => {
    if (!fileName) return null;
    const { data } = supabase.storage.from(bucket).getPublicUrl(fileName);
    return data?.publicUrl || null;
  };

  const handleContactOwner = (project) => {
    // Prepare owner data for the Letter screen
    const owner = project.users;
    let profilePicUrl = null;
    if (owner?.profile_picture) {
      const { data: picData } = supabase.storage
        .from('pfp')
        .getPublicUrl(owner.profile_picture);
      profilePicUrl = picData?.publicUrl || null;
    }
    const ownerData = {
      id: owner?.id,
      full_name: owner?.full_name,
      city: owner?.city,
      sector: owner?.sector,
      role: owner?.role,
      profilePicUrl,
      profile_picture: owner?.profile_picture,
    };
    navigation.navigate('Letter', { investorData: ownerData });
  };

  const renderItem = ({ item }) => {
    const pictureUrl = getPublicUrl('picture', item.picture);
    const documentUrl = getPublicUrl('document', item.document);

    return (
      <TouchableOpacity style={styles.card}
        onPress={()=>handleContactOwner(item)}
      >
        <View style={styles.row}>
          <View style={{ alignItems: 'center', marginLeft: I18nManager.isRTL ? 0 : 12, marginRight: I18nManager.isRTL ? 12 : 0 }}>
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={() => {
                if (pictureUrl) {
                  Linking.openURL(pictureUrl);
                }
              }}
            >
              {pictureUrl ? (
                <Image source={{ uri: pictureUrl  }} style={styles.projectImage} />
              ) : (
                <View style={styles.imagePlaceholder}>
                  <Text style={styles.placeholderText}>لا توجد صورة</Text>
                </View>
              )}
            </TouchableOpacity>
            {documentUrl && (
              <TouchableOpacity
                style={styles.docButton}
                onPress={() => Linking.openURL(documentUrl)}
              >
                <Text style={styles.docButtonText}>عرض المستند</Text>
              </TouchableOpacity>
            )}
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.title}>{item.title}</Text>
            <Text style={styles.description}>{item.description}</Text>

          </View>
        </View>
      </TouchableOpacity>
    );
  };

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#FFD700" />
        <Text style={{ marginTop: 12 }}>جاري تحميل المشاريع...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.header}>قائمة المشاريع</Text>
      <FlatList
        data={projects}
        keyExtractor={item => item.id}
        renderItem={renderItem}
        contentContainerStyle={{ paddingBottom: 24 }}
        ListEmptyComponent={
          <Text style={styles.emptyText}>لا توجد مشاريع متاحة حالياً.</Text>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff', paddingHorizontal: 16 },
  header: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1A1A1A',
    textAlign: 'center',
    marginVertical: 24,
  },
  card: {
    backgroundColor: '#fffbe6',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#ffe066',
    elevation: 2,
  },
  row: {
    flexDirection: I18nManager.isRTL ? 'row-reverse' : 'row',
    alignItems: 'center',
  },
  projectImage: {
    width: 80,
    height: 80,
    borderRadius: 8,
    marginLeft: I18nManager.isRTL ? 0 : 12,
    marginRight: I18nManager.isRTL ? 12 : 0,
    backgroundColor: '#eee',
  },
  imagePlaceholder: {
    width: 80,
    height: 80,
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
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1A1A1A',
    textAlign: 'right',
    marginBottom: 4,
  },
  description: {
    fontSize: 15,
    color: '#6C757D',
    textAlign: 'right',
    marginBottom: 8,
  },
  docButton: {
    backgroundColor: '#FFD700',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 6,
    alignSelf: 'flex-start',
    marginTop: 8,
  },
  docButtonText: {
    color: '#1A1A1A',
    fontWeight: 'bold',
    fontSize: 14,
  },
  contactButton: {
    backgroundColor: '#FFD700',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
    marginTop: 12,
    alignSelf: 'flex-end',
    left:4
  },
  contactButtonText: {
    fontWeight: 'bold',
    fontSize: 15,
    textAlign: 'center',
  },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  emptyText: {
    textAlign: 'center',
    color: '#888',
    marginTop: 32,
    fontSize: 16,
  },
});