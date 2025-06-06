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
    if (!user) return;

    const fetchRequests = async () => {
      const { data, error } = await supabase
        .from('contact_requests')
        .select('*')
        .eq('receiver_id', user.id)
        .order('created_at', { ascending: false });
      if (!error) setRequests(data || []);
    };

    fetchRequests();

    // 🔁 Cleanup previous channel if exists
    if (channelRef.current) {
      console.log('Unsubscribing previous channel');
      channelRef.current.unsubscribe(); // ✅ unsubscribe instead of removeChannel
    }

    // ✅ Create new channel and subscribe only once
    const newChannel = supabase
      .channel(`contact_requests_${user.id}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'contact_requests',
          filter: `receiver_id=eq.${user.id}`,
        },
        (payload) => {
          fetchRequests();
        }
      );

    channelRef.current = newChannel;

    newChannel.subscribe((status) => {
      console.log('Subscribed with status:', status);
    });

    return () => {
      console.log('Cleaning up channel');
      if (channelRef.current) {
        channelRef.current.unsubscribe();
        channelRef.current = null;
      }
    };
  }, [user]);

  const toggleExpand = (id) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setExpanded((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  return (
    <ScrollView style={{ flex: 1, backgroundColor: '#fff', padding: 16 }}>
      <Text style={{ fontSize: 28, fontWeight: 'bold', textAlign: 'center', marginVertical: 24 }}>
        الإشعارات
      </Text>

      {requests.length === 0 ? (
        <Text style={{ textAlign: 'center', color: '#888', marginTop: 32, fontSize: 16 }}>
          لا توجد رسائل جديدة.
        </Text>
      ) : (
        requests.map((req) => (
          <View key={req.id} style={{ backgroundColor: '#fffbe6', padding: 12, marginBottom: 16 }}>
            <TouchableOpacity onPress={() => toggleExpand(req.id)} style={{ flexDirection: I18nManager.isRTL ? 'row-reverse' : 'row', justifyContent: 'space-between' }}>
              <Text style={{ fontSize: 18, fontWeight: 'bold' }}>رسالة جديدة من مستخدم</Text>
              <Text style={{ fontSize: 12 }}>{new Date(req.created_at).toLocaleString('ar-EG')}</Text>
            </TouchableOpacity>

            {expanded[req.id] && (
              <View style={{ marginTop: 12, borderTopWidth: 1, paddingTop: 8 }}>
                <Text style={{ fontWeight: 'bold' }}>الرسالة:</Text>
                <Text>{req.message}</Text>
                {req.phone_number && (
                  <>
                    <Text style={{ fontWeight: 'bold' }}>رقم الهاتف:</Text>
                    <Text>{req.phone_number}</Text>
                  </>
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
  container: { flex: 1, backgroundColor: '#fff', padding: 16 },
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
    padding: 12,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#ffe066',
    elevation: 2,
  },
  row: {
    flexDirection: I18nManager.isRTL ? 'row-reverse' : 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1A1A1A',
    textAlign: 'right',
  },
  date: {
    fontSize: 12,
    color: '#888',
    textAlign: 'left',
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
    textAlign: 'right',
  },
  message: {
    fontSize: 16,
    color: '#333',
    marginBottom: 8,
    textAlign: 'right',
  },
  emptyText: {
    textAlign: 'center',
    color: '#888',
    marginTop: 32,
    fontSize: 16,
  },
});