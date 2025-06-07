import React, { useState } from 'react';
import { 
  View, 
  Text, 
  TextInput, 
  StyleSheet, 
  Alert, 
  TouchableOpacity, 
  Image, 
  ScrollView,
  I18nManager
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import * as DocumentPicker from 'expo-document-picker';
import supabase from '../../supabaseClient';
import { useAuth } from '../../context/AuthProvider';
import { useNavigation } from '@react-navigation/native';

// Enable RTL layout for Arabic
I18nManager.allowRTL(true);
I18nManager.forceRTL(true);

export default function AddProject() {
  const { user } = useAuth();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [projectPicture, setProjectPicture] = useState(null);
  const [projectDoc, setProjectDoc] = useState(null);
  const [loading, setLoading] = useState(false);
  const navigation = useNavigation();

  const pickImage = async () => {
    try {
      const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
      
      if (permissionResult.granted === false) {
        Alert.alert('الإذن مطلوب', 'الإذن للوصول إلى معرض الصور مطلوب!');
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.7,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        setProjectPicture(result.assets[0].uri);
      }
    } catch (error) {
      console.log('Image picker error:', error);
      Alert.alert('خطأ', 'فشل في اختيار الصورة. يرجى المحاولة مرة أخرى.');
    }
  };

  const pickDocument = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: '*/*',
        copyToCacheDirectory: true,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const asset = result.assets[0];
        setProjectDoc({
          uri: asset.uri,
          name: asset.name,
          size: asset.size,
          mimeType: asset.mimeType
        });
      }
    } catch (error) {
      console.log('Document picker error:', error);
      Alert.alert('خطأ', 'فشل في اختيار المستند. يرجى المحاولة مرة أخرى.');
    }
  };

  const handleAddProject = async () => {
    if (!title || !description) {
      Alert.alert('خطأ', 'يرجى ملء جميع الحقول.');
      return;
    }
    setLoading(true);

    let projectPicturePath = null;
    let projectDocPath = null;

    try {
      // Upload project picture using signed URL
      if (projectPicture) {
        try {
          const fileExt = projectPicture.split('.').pop() || 'jpg';
          const fileName = `${user.id}_project_${Date.now()}.${fileExt}`;

          const { data: signedUrlData, error: signedUrlError } = await supabase
            .storage
            .from('picture')
            .createSignedUploadUrl(fileName);

          if (signedUrlError) throw signedUrlError;

          const formData = new FormData();
          formData.append('file', {
            uri: projectPicture,
            name: fileName,
            type: 'image/jpeg',
          });

          const uploadResponse = await fetch(signedUrlData.signedUrl, {
            method: 'PUT',
            body: formData,
            headers: { 'Content-Type': 'multipart/form-data' },
          });

          if (!uploadResponse.ok) throw new Error('Image upload failed');
          projectPicturePath = fileName;
        } catch (uploadError) {
          throw new Error(`فشل رفع الصورة: ${uploadError.message}`);
        }
      }

      // Upload project document using signed URL
      if (projectDoc) {
        try {
          const fileExt = projectDoc.name?.split('.').pop() || 'pdf';
          const fileName = `${user.id}_doc_${Date.now()}.${fileExt}`;

          const { data: signedUrlData, error: signedUrlError } = await supabase
            .storage
            .from('document')
            .createSignedUploadUrl(fileName);

          if (signedUrlError) throw signedUrlError;

          const formData = new FormData();
          formData.append('file', {
            uri: projectDoc.uri,
            name: fileName,
            type: projectDoc.mimeType || 'application/octet-stream',
          });

          const uploadResponse = await fetch(signedUrlData.signedUrl, {
            method: 'PUT',
            body: formData,
            headers: { 'Content-Type': 'multipart/form-data' },
          });

          if (!uploadResponse.ok) throw new Error('Document upload failed');
          projectDocPath = fileName;
        } catch (uploadError) {
          throw new Error(`فشل رفع المستند: ${uploadError.message}`);
        }
      }

      // Insert project into database
      const { error: insertError } = await supabase.from('projects').insert([
        {
          owner_id: user.id,
          title,
          description,
          picture: projectPicturePath,
          document: projectDocPath,
        },
      ]);

      if (insertError) {
        throw new Error(`فشل في إنشاء المشروع: ${insertError.message}`);
      }

      Alert.alert('نجح', 'تم إضافة المشروع بنجاح!', [
        { text: 'موافق', onPress: () => navigation.goBack() }
      ]);

    } catch (error) {
      console.log('Upload error:', error);
      Alert.alert('خطأ', error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerSubtitle}>إنشاء جديد</Text>
        <Text style={styles.headerTitle}>مشروع</Text>
        <View style={styles.headerBadge}>
          <Text style={styles.headerBadgeText}>مشروع جديد</Text>
        </View>
      </View>

      {/* Content */}
      <View style={styles.content}>
        {/* Project Details Card */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Text style={styles.cardTitle}>تفاصيل المشروع</Text>
            <View style={styles.requiredBadge}>
              <Text style={styles.requiredText}>مطلوب</Text>
            </View>
          </View>
          
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>عنوان المشروع</Text>
            <TextInput
              style={styles.input}
              placeholder="أدخل عنوان المشروع"
              placeholderTextColor="#ADB5BD"
              value={title}
              onChangeText={setTitle}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>الوصف</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              placeholder="اكتب وصف مشروعك..."
              placeholderTextColor="#ADB5BD"
              value={description}
              onChangeText={setDescription}
              multiline
              textAlignVertical="top"
              numberOfLines={4}
            />
          </View>
        </View>

        {/* Media Card */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>وسائط المشروع</Text>
          
          {/* Image Section */}
          <View style={styles.mediaSection}>
            <View style={styles.mediaSectionHeader}>
              <View>
                <Text style={styles.mediaLabel}>صورة المشروع</Text>
                <Text style={styles.mediaSubtext}>أضف تمثيل بصري</Text>
              </View>
              <Text style={styles.icon}>📷</Text>
            </View>
            
            {projectPicture ? (
              <View style={styles.previewContainer}>
                <Image source={{ uri: projectPicture }} style={styles.previewImage} />
                <TouchableOpacity 
                  style={styles.removeButton} 
                  onPress={() => setProjectPicture(null)}
                >
                  <Text style={styles.removeButtonText}>✕</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <TouchableOpacity style={styles.uploadButton} onPress={pickImage}>
                <Text style={styles.uploadButtonText}>اختر صورة</Text>
              </TouchableOpacity>
            )}
          </View>

          {/* Document Section */}
          <View style={styles.mediaSection}>
            <View style={styles.mediaSectionHeader}>
              <View>
                <Text style={styles.mediaLabel}>مستند المشروع</Text>
                <Text style={styles.mediaSubtext}>ارفع الملفات الداعمة</Text>
              </View>
              <Text style={styles.icon}>📄</Text>
            </View>
            
            {projectDoc ? (
              <View style={styles.documentContainer}>
                <TouchableOpacity 
                  style={styles.removeDocButton} 
                  onPress={() => setProjectDoc(null)}
                >
                  <Text style={styles.removeButtonText}>✕</Text>
                </TouchableOpacity>
                <View style={styles.documentInfo}>
                  <View style={styles.documentDetails}>
                    <Text style={styles.documentName} numberOfLines={1}>
                      {projectDoc.name || 'تم اختيار المستند'}
                    </Text>
                    <Text style={styles.documentSize}>
                      {projectDoc.size ? `${(projectDoc.size / 1024).toFixed(1)} كيلوبايت` : 'حجم غير معروف'}
                    </Text>
                  </View>
                  <Text style={styles.documentIcon}>📎</Text>
                </View>
              </View>
            ) : (
              <TouchableOpacity style={styles.uploadButton} onPress={pickDocument}>
                <Text style={styles.uploadButtonText}>اختر مستند</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* Actions */}
        <View style={styles.actions}>
          <TouchableOpacity 
            style={[
              styles.actionButton, 
              styles.submitButton,
              loading && styles.submitButtonDisabled
            ]} 
            onPress={handleAddProject} 
            disabled={loading}
          >
            <Text style={styles.submitButtonText}>
              {loading ? "جاري الإنشاء..." : "إنشاء المشروع"}
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.actionButton, styles.cancelButton]} 
            onPress={() => navigation.goBack()}
          >
            <Text style={styles.cancelButtonText}>إلغاء</Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: '#fff' 
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
    backgroundColor: 'rgba(0,123,255,0.1)',
    paddingHorizontal: 16,
    paddingVertical: 4,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#007BFF',
    marginTop: 8,
  },
  headerBadgeText: { 
    color: '#007BFF', 
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
  
  // Card Styles
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 4,
    borderWidth: 1,
    borderColor: '#F1F3F4',
  },
  cardHeader: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center', 
    marginBottom: 16 
  },
  cardTitle: { 
    fontSize: 20, 
    fontWeight: 'bold', 
    color: '#1A1A1A',
    marginBottom: 12,
    textAlign: 'right'
  },
  requiredBadge: { 
    backgroundColor: '#DC3545', 
    paddingHorizontal: 6, 
    paddingVertical: 2, 
    borderRadius: 4 
  },
  requiredText: { 
    color: '#fff', 
    fontSize: 10, 
    fontWeight: 'bold',
    textAlign: 'center'
  },
  
  inputGroup: { 
    marginBottom: 16 
  },
  inputLabel: { 
    fontSize: 12, 
    color: '#6C757D', 
    fontWeight: '600', 
    textTransform: 'uppercase', 
    marginBottom: 8,
    textAlign: 'right'
  },
  input: {
    borderWidth: 1,
    borderColor: '#E9ECEF',
    borderRadius: 8,
    padding: 16,
    backgroundColor: '#F8F9FA',
    fontSize: 16,
    color: '#1A1A1A',
    textAlign: 'right',
    writingDirection: 'rtl'
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  
  // Media Styles
  mediaSection: { 
    marginBottom: 20 
  },
  mediaSectionHeader: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    marginBottom: 12,
    justifyContent: 'space-between'
  },
  icon: { 
    fontSize: 20, 
    marginLeft: 12 // Changed from marginRight for RTL
  },
  mediaLabel: { 
    fontSize: 16, 
    fontWeight: '600', 
    color: '#1A1A1A',
    textAlign: 'right'
  },
  mediaSubtext: { 
    fontSize: 12, 
    color: '#6C757D',
    textAlign: 'right'
  },
  
  // Upload Button Styles
  uploadButton: {
    backgroundColor: '#F8F9FA',
    borderWidth: 2,
    borderColor: '#E9ECEF',
    borderStyle: 'dashed',
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
  },
  uploadButtonText: {
    color: '#6C757D',
    fontSize: 16,
    fontWeight: '500',
    textAlign: 'center'
  },
  
  // Preview Styles
  previewContainer: {
    position: 'relative',
    alignSelf: 'flex-end', // Changed from flex-start for RTL
  },
  previewImage: {
    width: 120,
    height: 120,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: '#007BFF',
  },
  removeButton: {
    position: 'absolute',
    top: -8,
    left: -8, // Changed from right to left for RTL
    backgroundColor: '#DC3545',
    borderRadius: 12,
    width: 24,
    height: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  removeButtonText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  
  // Document Styles
  documentContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#F8F9FA',
    padding: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E9ECEF',
  },
  documentInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  documentIcon: {
    fontSize: 20,
    marginLeft: 12, // Changed from marginRight for RTL
  },
  documentDetails: {
    flex: 1,
  },
  documentName: {
    fontSize: 16,
    fontWeight: '500',
    color: '#1A1A1A',
    marginBottom: 2,
    textAlign: 'right'
  },
  documentSize: {
    fontSize: 12,
    color: '#6C757D',
    textAlign: 'right'
  },
  removeDocButton: {
    backgroundColor: '#DC3545',
    borderRadius: 10,
    width: 20,
    height: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12, // Changed from marginLeft for RTL
  },
  
  // Action Styles
  actions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 12,
    gap: 12,
  },
  actionButton: {
    flex: 1,
    paddingVertical: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: '#6C757D',
  },
  cancelButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center'
  },
  submitButton: {
    backgroundColor: '#28A745',
  },
  submitButtonDisabled: {
    backgroundColor: '#ADB5BD',
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center'
  },
});