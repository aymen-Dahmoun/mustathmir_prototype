import React, { useEffect, useState, useRef } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  LayoutAnimation,
  Platform,
  UIManager,
  I18nManager,
  StyleSheet,
  Image,
} from 'react-native';
import supabase from '../../supabaseClient';
import { useAuth } from '../../context/AuthProvider';

if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

export default function Notifications() {
  const { user } = useAuth();
  const [requests, setRequests] = useState([]);
  const [expanded, setExpanded] = useState({});
  const channelRef = useRef(null); // 💡 store the channel here

  useEffect(() => {
  if (!user?.id) return;

  let mounted = true;
  let channel = null;

  const fetchRequests = async () => {
    if (!mounted) return;
    
    const { data, error } = await supabase
      .from('contact_requests')
      .select(`
        *,
        sender:sender_id (
          id,
          city,
          sector,
          full_name,
          profile_picture
        )
      `)
      .eq('receiver_id', user.id)
      .order('created_at', { ascending: false });

    if (!error && mounted) {
      const requestsWithPics = await Promise.all(
        data.map(async (request) => {
          if (request.sender?.profile_picture) {
            const { data: picData } = supabase.storage
              .from('pfp')
              .getPublicUrl(request.sender.profile_picture);
            return {
              ...request,
              sender: {
                ...request.sender,
                profilePicUrl: picData.publicUrl
              }
            };
          }
          return request;
        })
      );
      if (mounted) {
        setRequests(requestsWithPics);
      }
    }
  };

  const setupSubscription = async () => {
    // First, remove any existing channels for this user
    const existingChannels = supabase.getChannels();
    existingChannels.forEach(ch => {
      if (ch.topic.includes(`contact_requests`) && ch.topic.includes(user.id)) {
        supabase.removeChannel(ch);
      }
    });

    // Wait a bit for cleanup
    await new Promise(resolve => setTimeout(resolve, 100));

    if (!mounted) return;

    // Create new unique channel
    const channelName = `contact_requests_${user.id}_${Math.random().toString(36).substr(2, 9)}`;
    
    channel = supabase
      .channel(channelName)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'contact_requests',
          filter: `receiver_id=eq.${user.id}`,
        },
        (payload) => {
          if (mounted) {
            fetchRequests();
          }
        }
      );

    channel.subscribe((status) => {
    });

    channelRef.current = channel;
  };

  // Initial data fetch
  fetchRequests();
  
  // Setup subscription
  setupSubscription();

  return () => {
    mounted = false;
    
    if (channel) {
      supabase.removeChannel(channel);
    }
    
    if (channelRef.current) {
      supabase.removeChannel(channelRef.current);
      channelRef.current = null;
    }
  };
}, [user?.id]);


  const toggleExpand = (id) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setExpanded((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  // Update the return statement with modern UI
  return (
    <ScrollView style={styles.container}>
      <Text style={styles.header}>
        الإشعارات
      </Text>

      {requests.length === 0 ? (
        <Text style={styles.emptyText}>
          لا توجد رسائل جديدة.
        </Text>
      ) : (
        requests.map((req) => (
          <View key={req.id} style={styles.card}>
            <TouchableOpacity
              onPress={() => toggleExpand(req.id)}
              style={styles.row}
            >
              <View style={styles.senderInfoContainer}>
                {req.sender?.profilePicUrl ? (
                  <Image
                    source={{ uri: req.sender.profilePicUrl }}
                    style={styles.profilePicture}
                  />
                ) : (
                  <View style={styles.profilePicturePlaceholder}>
                    <Text style={styles.profilePicturePlaceholderText}>
                      {req.sender?.full_name?.charAt(0) || 'م'}
                    </Text>
                  </View>
                )}
                <View style={styles.senderTextContainer}>
                  <Text style={styles.senderName}>{req.sender?.full_name || 'مستخدم'}</Text>
                  <Text style={styles.senderLocation}>{req.sender?.city}</Text>
                <Text style={styles.date}>
                  {new Date(req.created_at).toLocaleString()}
                </Text>
                </View>
              </View>
            </TouchableOpacity>

            {expanded[req.id] && (
              <View style={styles.content}>
                <View style={styles.senderDetailsSection}>
                  <Text style={styles.label}>معلومات المرسل:</Text>
                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>الاسم:</Text>
                    <Text style={styles.detailValue}>{req.sender?.full_name}</Text>
                  </View>
                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>المدينة:</Text>
                    <Text style={styles.detailValue}>{req.sender?.city}</Text>
                  </View>
                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>القطاع:</Text>
                    <Text style={styles.detailValue}>{req.sender?.sector}</Text>
                  </View>
                </View>

                <View style={styles.messageSection}>
                  <Text style={styles.label}>الرسالة:</Text>
                  <Text style={styles.message}>{req.message}</Text>
                </View>

                {req.phone_number && (
                  <View style={styles.phoneSection}>
                    <Text style={styles.label}>رقم الهاتف:</Text>
                    <Text style={styles.phone}>{req.phone_number}</Text>
                  </View>
                )}
              </View>
            )}
          </View>
        ))
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: '#fff', 
    padding: 16,
    direction:'rtl'
  },
  header: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1A1A1A',
    marginVertical: 24,
    paddingRight: 8,
  },
  card: {
    backgroundColor: '#fffbe6',
    borderRadius: 12,
    padding: 12,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#ffe066',
    elevation: 2,
  },
  row: {
    flexDirection: 'row-reverse',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1A1A1A',
  },
  date: {
    fontSize: 12,
    color: '#888',
    marginRight: 8,
  },
  content: {
    marginTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#ffe066',
    paddingTop: 8,
  },
  label: {
    fontSize: 14,
    color: '#B8860B',
    fontWeight: 'bold',
    marginBottom: 2,
  },
  message: {
    fontSize: 16,
    color: '#333',
    marginBottom: 8,
  },
  emptyText: {
    color: '#888',
    marginTop: 32,
    fontSize: 16,
  },
  senderInfoContainer: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    flex: 1,
    marginLeft: 12,
  },
  profilePicture: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginLeft: 12,
  },
  profilePicturePlaceholder: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#ffe066',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 12,
  },
  profilePicturePlaceholderText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#B8860B',
    writingDirection: 'rtl',
  },
  senderTextContainer: {
    flex: 1,
  },
  senderName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1A1A1A',
    writingDirection: 'rtl',
  },
  senderLocation: {
    fontSize: 14,
    color: '#666',
    writingDirection: 'rtl',
  },
  detailRow: {
    flexDirection: 'row-reverse',
    justifyContent: 'space-between',
    paddingVertical: 4,
    paddingLeft: 8,
  },
  detailLabel: {
    fontSize: 14,
    color: '#666',
    flex: 1,
    writingDirection: 'rtl',
  },
  detailValue: {
    fontSize: 14,
    color: '#1A1A1A',
    flex: 2,
    marginRight: 8,
    writingDirection: 'rtl',
  },
  senderDetailsSection: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
  },
  messageSection: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
  },
  phoneSection: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 12,
  },
});