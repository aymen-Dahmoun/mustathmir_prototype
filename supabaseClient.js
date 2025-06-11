import { createClient } from '@supabase/supabase-js';
import Constants from 'expo-constants';
import AsyncStorage from '@react-native-async-storage/async-storage';

const supabaseUrl = "https://dxuyvokigytpttyeulqt.supabase.co";
const supabaseAnonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImR4dXl2b2tpZ3l0cHR0eWV1bHF0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDg4NjQ2NDMsImV4cCI6MjA2NDQ0MDY0M30.qUI9BYBhsm1vB6A8o_aUf4-Gx85hOfPqcpqEfurl7Fw";

const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: AsyncStorage,
    storageKey: 'supabase.auth.token',
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});

export default supabase;