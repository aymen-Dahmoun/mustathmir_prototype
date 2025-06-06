import React from 'react';
import { View, TouchableOpacity, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../context/AuthProvider';

export default function NavBar({ onProfile, onInvestors, onSettings, onNotifications,  middleBtn }) {
  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.item} onPress={onProfile}>
        <Ionicons name="person-circle-outline" size={28} color="#fff" />
        <Text style={styles.text}>الملف الشخصي</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.item} onPress={onInvestors}>
        <Ionicons name="people-outline" size={28} color="#fff" />
        <Text style={styles.text}>{middleBtn}</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.item} onPress={onNotifications}>
        <Ionicons name="notifications-outline" size={28} color="#fff" />
        <Text style={styles.text}>الإشعارات</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.item} onPress={onSettings}>
        <Ionicons name="settings-outline" size={28} color="#fff" />
        <Text style={styles.text}>الإعدادات</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    backgroundColor: 'rgb(212, 175, 55)',
    paddingVertical: 10,
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
  },
  item: {
    alignItems: 'center',
    flex: 1,
  },
  text: {
    color: '#fff',
    fontWeight: 'bold',
    marginTop: 4,
    fontSize: 14,
    textAlign: 'center',
    fontFamily: 'Cairo', // Use a font that supports Arabic if available
  },
});