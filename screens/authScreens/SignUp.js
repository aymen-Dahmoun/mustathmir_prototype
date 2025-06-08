import React, { useState } from 'react';
import {
  View, Text, TextInput, StyleSheet, Alert, Image, TouchableOpacity, 
  I18nManager, ScrollView, Modal, SafeAreaView
} from 'react-native';
import { Picker } from '@react-native-picker/picker';
import * as ImagePicker from 'expo-image-picker';
import supabase from '../../supabaseClient';
import { Ionicons } from '@expo/vector-icons';
import { investmentSectors, Wilayas } from '../../constants/constants';


export default function SignUpScreen({ navigation }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [role, setRole] = useState('investor');
  const [city, setCity] = useState('');
  const [sector, setSector] = useState('');
  const [profilePicture, setProfilePicture] = useState(null);
  const [loading, setLoading] = useState(false);
  const [policyAccepted, setPolicyAccepted] = useState(false);
  const [showPolicyModal, setShowPolicyModal] = useState(false);

  // Image Picker
  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.7,
    });

    if (!result.canceled) {
      setProfilePicture(result.assets[0].uri);
    }
  };

  const handleSignUp = async () => {
    if (!fullName || !role || !city || !sector || !email || !password) {
      Alert.alert('خطأ', 'يرجى ملء جميع الحقول.');
      return;
    }

    if (!policyAccepted) {
      Alert.alert('خطأ', 'يجب الموافقة على سياسة الخصوصية للمتابعة.');
      return;
    }

    setLoading(true);

    const { data, error } = await supabase.auth.signUp({ email, password });

    if (error) {
      setLoading(false);
      Alert.alert('فشل التسجيل', error.message);
      return;
    }

    const userId = data?.user?.id;
    let profilePicturePath = null;

    // Handle profile picture upload
    if (userId && profilePicture) {
      try {
        const fileExt = profilePicture.split('.').pop();
        const fileName = `${userId}.${fileExt}`;

        const { data: signedUrlData, error: signedUrlError } = await supabase
          .storage
          .from('pfp')
          .createSignedUploadUrl(fileName);

        if (signedUrlError) throw signedUrlError;

        const formData = new FormData();
        formData.append('file', {
          uri: profilePicture,
          name: fileName,
          type: 'image/jpeg',
        });

        const uploadResponse = await fetch(signedUrlData.signedUrl, {
          method: 'PUT',
          body: formData,
          headers: { 'Content-Type': 'multipart/form-data' },
        });

        if (!uploadResponse.ok) throw new Error('فشل رفع الصورة');

        profilePicturePath = fileName;

      } catch (uploadError) {
        setLoading(false);
        Alert.alert('فشل رفع الصورة', uploadError.message);
        return;
      }
    }

    // Save additional user info to 'users' table
    if (userId) {
      const { error: insertError } = await supabase.from('users').insert([
        {
          id: userId,
          full_name: fullName,
          role,
          city,
          sector,
          profile_picture: profilePicturePath,
        },
      ]);

      setLoading(false);

      if (insertError) {
        Alert.alert('فشل إنشاء الملف الشخصي', insertError.message);
        return;
      }

      Alert.alert('تم التسجيل', 'تحقق من بريدك الإلكتروني لتأكيد الحساب!');
      navigation.navigate('Login');
    } else {
      setLoading(false);
      Alert.alert('فشل التسجيل', 'لم يتم إرجاع معرف المستخدم.');
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.scrollContainer}>
      <View style={styles.container}>
        <Text style={styles.title}>إنشاء حساب جديد</Text>

        <TouchableOpacity style={styles.pfpContainer} onPress={pickImage}>
          {profilePicture ? (
            <Image source={{ uri: profilePicture }} style={styles.pfp} />
          ) : (
            <View style={styles.pfpPlaceholder}>
              <Ionicons name="camera-outline" size={36} color="#888" />
            </View>
          )}
        </TouchableOpacity>

        <TextInput
          style={styles.input}
          placeholder="الاسم الكامل"
          value={fullName}
          onChangeText={setFullName}
          textAlign={I18nManager.isRTL ? 'right' : 'left'}
        />

        <Text style={styles.label}>الدور</Text>
        <View style={styles.pickerWrapper}>
          <Picker
            selectedValue={role}
            style={styles.picker}
            onValueChange={setRole}
            itemStyle={{ textAlign: 'right' }}
          >
            <Picker.Item label="مستثمر" value="investor" />
            <Picker.Item label="صاحب مشروع" value="owner" />
          </Picker>
        </View>
 
          <Text style={styles.label}>المدينة</Text>
        <View style={styles.pickerWrapper}>
        <Picker
            selectedValue={city}
            style={styles.picker}
            onValueChange={setCity}
            itemStyle={{ textAlign: 'right' }}
          >
          {Wilayas.map((wilaya, index) => (
            <Picker.Item key={index} label={wilaya} value={wilaya} />
          ))}
          </Picker>
        </View>

        <Text style={styles.label}>القطاع الاستثماري</Text>
        <View style={styles.pickerWrapper}>
          <Picker
            selectedValue={sector}
            style={styles.picker}
            onValueChange={setSector}
            itemStyle={{ textAlign: 'left'  }}
          >
            {
              investmentSectors.map((sector, index) => (
                <Picker.Item key={index} label={sector} value={sector} />
              ))
            }
          
          </Picker>
        </View>

        <TextInput
          style={styles.input}
          placeholder="البريد الإلكتروني"
          autoCapitalize="none"
          keyboardType="email-address"
          value={email}
          onChangeText={setEmail}
          textAlign={I18nManager.isRTL ? 'right' : 'left'}
        />

        <TextInput
          style={styles.input}
          placeholder="كلمة المرور"
          secureTextEntry
          value={password}
          onChangeText={setPassword}
          textAlign={I18nManager.isRTL ? 'right' : 'left'}
        />

        <View style={styles.policyContainer}>
          <TouchableOpacity 
            style={styles.checkbox} 
            onPress={() => setPolicyAccepted(!policyAccepted)}
          >
            {policyAccepted && <Ionicons name="checkmark" size={20} color="#FFD700" />}
          </TouchableOpacity>
          <View style={styles.policyTextContainer}>
            <TouchableOpacity onPress={() => setShowPolicyModal(true)}>
              <Text style={styles.policyLink}>سياسة الخصوصية</Text>
            </TouchableOpacity>
            <Text style={styles.policyText}>
              أوافق على 
            </Text>
          </View>
        </View>

        <TouchableOpacity
          style={[
            styles.buttonBase, 
            { 
              backgroundColor: policyAccepted ? '#FFD700' : '#e0e0e0',
              marginTop: 12 
            }
          ]}
          onPress={handleSignUp}
          disabled={loading || !policyAccepted}
        >
          <Text style={[styles.buttonText, !policyAccepted && { color: '#666' }]}>
            {loading ? 'جاري التسجيل...' : 'تسجيل'}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={() => navigation.navigate('Login')}>
          <Text style={styles.link}>لديك حساب بالفعل؟ سجل الدخول</Text>
        </TouchableOpacity>
      </View>

      <Modal
        visible={showPolicyModal}
        animationType="slide"
        onRequestClose={() => setShowPolicyModal(false)}
      >
        <SafeAreaView style={styles.modalContainer}>
          <ScrollView style={styles.modalScroll}>
            <View style={styles.modalHeader}>
              <TouchableOpacity 
                onPress={() => setShowPolicyModal(false)}
                style={styles.closeButton}
              >
                <Ionicons name="close" size={24} color="#333" />
              </TouchableOpacity>
              <Text style={styles.modalTitle}>سياسة البيانات والخصوصية</Text>
            </View>          
            <View style={styles.modalContent}>
              <Text style={styles.policyTitle}>سياسة البيانات والخصوصية لتطبيق "شركاء النجاح"</Text>

              <Text style={styles.policyParagraph}>
                نلتزم في "شركاء النجاح" بحماية خصوصية مستخدمينا من أصحاب المشاريع والمستثمرين.
                توضح هذه السياسة كيفية جمع البيانات واستخدامها وحمايتها، بالإضافة إلى حقوق المستخدم في التحكم بمعلوماته.
              </Text>

              <Text style={styles.policySectionTitle}>1. البيانات التي نجمعها</Text>
              <Text style={styles.policyParagraph}>
                نقوم بجمع المعلومات التالية عند استخدامك للتطبيق:{"\n\n"}
                البيانات الشخصية: الاسم، البريد الإلكتروني، رقم الهاتف، المدينة، القطاع المهني.{"\n\n"}
                بيانات المشروع أو الاستثمار: وصف المشروع، المبالغ، المدة، نوع التمويل أو الاستثمار.{"\n\n"}
                معلومات الاستخدام: سجل التفاعل داخل التطبيق، الرسائل، الطلبات، الإشعارات.
              </Text>

              <Text style={styles.policySectionTitle}>2. كيفية استخدام البيانات</Text>
              <Text style={styles.policyParagraph}>
                نستخدم البيانات التي تقدمها من أجل:{"\n\n"}
                تسهيل الربط بين المستثمرين وأصحاب المشاريع.{"\n\n"}
                تحسين تجربة المستخدم داخل التطبيق.{"\n\n"}
                تأمين بيئة موثوقة للتواصل والتعاون.{"\n\n"}
                تحليل النشاطات العامة لتطوير التطبيق.
              </Text>

              <Text style={styles.policySectionTitle}>3. حماية بيانات التواصل</Text>
              <Text style={styles.policyParagraph}>
                لا تُعرض بيانات الهاتف أو البريد الإلكتروني لأي طرف قبل الموافقة الصريحة من الطرفين.{"\n\n"}
                يُمنع تبادل البيانات خارج التطبيق أو استخدامها لأغراض غير مرتبطة بالاستثمار أو المشاريع.{"\n\n"}
                تُحفظ جميع البيانات على خوادم آمنة وتُشفّر باستخدام بروتوكولات حديثة.
              </Text>

              <Text style={styles.policySectionTitle}>4. مشاركة البيانات مع أطراف ثالثة</Text>
              <Text style={styles.policyParagraph}>
                لا نقوم ببيع أو تأجير أو تبادل بيانات المستخدم مع أي طرف خارجي.{"\n\n"}
                يمكن مشاركة بعض البيانات مع الجهات القانونية أو الحكومية في حال وجود طلب قانوني رسمي.
              </Text>

              <Text style={styles.policySectionTitle}>5. حقوق المستخدم</Text>
              <Text style={styles.policyParagraph}>
                يحق لك:{"\n\n"}
                تعديل بياناتك الشخصية من خلال الإعدادات.{"\n\n"}
                حذف حسابك نهائيًا متى شئت.{"\n\n"}
                طلب نسخة من بياناتك المخزّنة لدينا.
              </Text>

              <Text style={styles.policySectionTitle}>6. خرق الخصوصية أو إساءة الاستخدام</Text>
              <Text style={styles.policyParagraph}>
                في حال لاحظت أي محاولة للحصول على معلوماتك خارج القنوات الرسمية، يرجى التبليغ الفوري عبر الدعم داخل التطبيق.{"\n"}
                نحتفظ بحقنا في حظر أو حذف الحسابات التي تنتهك سياسة الخصوصية.
              </Text>

              <Text style={styles.policySectionTitle}>7. موافقتك</Text>
              <Text style={styles.policyParagraph}>
                عند تسجيلك واستخدامك لتطبيق "شركاء النجاح"، فإنك توافق على سياسة الخصوصية هذه وتقر بفهمك والتزامك بمحتواها.
              </Text>

              <Text style={styles.policySectionTitle}>8. تواصل معنا</Text>
              <Text style={styles.policyParagraph}>
                للاستفسار أو الشكاوى المتعلقة بالخصوصية، يرجى التواصل عبر:{"\n\n"}
                البريد الإلكتروني{"\n\n"}
                الدعم داخل التطبيق
              </Text>

              <TouchableOpacity 
                style={styles.acceptButton}
                onPress={() => {
                  setPolicyAccepted(true);
                  setShowPolicyModal(false);
                }}
              >
                <Text style={styles.acceptButtonText}>موافق على السياسة</Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </SafeAreaView>
      </Modal>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scrollContainer: { flexGrow: 1, justifyContent: 'center', backgroundColor: '#fff' },
  container: { flex: 1, justifyContent: 'center', padding: 24, backgroundColor: '#fff' },
  title: { fontSize: 28, fontWeight: 'bold', color: '#1A1A1A', marginBottom: 32, textAlign: 'center' },
  label: { marginBottom: 4, marginTop: 8, fontSize: 16, color: '#6C757D', textAlign: 'right', fontWeight: '600' },
  input: {
    borderWidth: 1,
    borderColor: '#F1F3F4',
    borderRadius: 8,
    padding: 14,
    marginBottom: 18,
    fontSize: 16,
    backgroundColor: '#F8F9FA',
    textAlign: 'right',
  },
  pickerWrapper: {
    borderWidth: 1,
    borderColor: '#000000',
    borderRadius: 8,
    marginBottom: 18,
    backgroundColor: '#F8F9FA',
    overflow: 'hidden',
    marginTop: 8,
  },
  picker: {
    width: '100%',
    height: 52,
    color: '#1A1A1A',
    textAlign: 'right',
    backgroundColor: '#F8F9FA',
    margin: 4,
  },
  buttonBase: {
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
    elevation: 2,
  },
  buttonText: {
    color: '#1A1A1A',
    fontWeight: 'bold',
    fontSize: 18,
  },
  link: {
    color: '#007BFF',
    marginTop: 24,
    textAlign: 'center',
    fontSize: 16,
    fontWeight: '600',
  },
  pfpContainer: { alignSelf: 'center', marginBottom: 16 },
  pfp: { width: 80, height: 80, borderRadius: 40 },
  pfpPlaceholder: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#eee',
    alignItems: 'center',
    justifyContent: 'center',
  },
  policyContainer: {
    flexDirection: I18nManager.isRTL ? 'row-reverse' : 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    marginBottom: 16,
    gap: 8,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderWidth: 2,
    borderColor: '#FFD700',
    borderRadius: 4,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
  },
  policyTextContainer: {
    flexDirection: I18nManager.isRTL ? 'row-reverse' : 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    flex: 1,
    justifyContent: 'flex-end',
  },
  policyText: {
    fontSize: 18,
    color: '#666',
    textAlign: 'right',
  },
  policyLink: {
    fontSize: 18,
    color: '#007BFF',
    textDecorationLine: 'underline',
    marginRight: 4,
    marginLeft: 4,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: '#fff',
  },
  modalScroll: {
    flex: 1,
  },
  modalHeader: {
    flexDirection: I18nManager.isRTL ? 'row-reverse' : 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  closeButton: {
    padding: 8,
  },
  modalTitle: {
    flex: 1,
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center',
    color: '#333',
  },
  modalContent: {
    padding: 20,
  },
  policyTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'right',
    marginBottom: 20,
  },
  policySectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#444',
    textAlign: 'right',
    marginTop: 20,
    marginBottom: 10,
  },
  policyParagraph: {
    fontSize: 16,
    lineHeight: 24,
    color: '#666',
    textAlign: 'right',
    marginBottom: 15,
  },
  acceptButton: {
    backgroundColor: '#FFD700',
    padding: 16,
    borderRadius: 8,
    marginTop: 20,
    marginBottom: 30,
    alignItems: 'center',
  },
  acceptButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
});