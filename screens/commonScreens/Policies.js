import React, { useEffect } from 'react';
import {
  ScrollView,
  Text,
  StyleSheet,
  I18nManager,
  Platform,
  View,
} from 'react-native';

const Policies = () => {
  useEffect(() => {
    if (!I18nManager.isRTL) {
      I18nManager.allowRTL(true);
      I18nManager.forceRTL(true);

    }
  }, []);

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.header}>سياسة البيانات والخصوصية لتطبيق "شركاء النجاح"</Text>

      <Text style={styles.paragraph}>
        نلتزم في "شركاء النجاح" بحماية خصوصية مستخدمينا من أصحاب المشاريع والمستثمرين.
        توضح هذه السياسة كيفية جمع البيانات واستخدامها وحمايتها، بالإضافة إلى حقوق المستخدم في التحكم بمعلوماته.
      </Text>

      <Text style={styles.sectionTitle}>1. البيانات التي نجمعها</Text>
      <Text style={styles.paragraph}>
        نقوم بجمع المعلومات التالية عند استخدامك للتطبيق:{"\n"}
        - البيانات الشخصية: الاسم، البريد الإلكتروني، رقم الهاتف، المدينة، القطاع المهني.{"\n"}
        - بيانات المشروع أو الاستثمار: وصف المشروع، المبالغ، المدة، نوع التمويل أو الاستثمار.{"\n"}
        - معلومات الاستخدام: سجل التفاعل داخل التطبيق، الرسائل، الطلبات، الإشعارات.
      </Text>

      <Text style={styles.sectionTitle}>2. كيفية استخدام البيانات</Text>
      <Text style={styles.paragraph}>
        نستخدم البيانات التي تقدمها من أجل:{"\n"}
        - تسهيل الربط بين المستثمرين وأصحاب المشاريع.{"\n"}
        - تحسين تجربة المستخدم داخل التطبيق.{"\n"}
        - تأمين بيئة موثوقة للتواصل والتعاون.{"\n"}
        - تحليل النشاطات العامة لتطوير التطبيق.
      </Text>

      <Text style={styles.sectionTitle}>3. حماية بيانات التواصل</Text>
      <Text style={styles.paragraph}>
        - لا تُعرض بيانات الهاتف أو البريد الإلكتروني لأي طرف قبل الموافقة الصريحة من الطرفين.{"\n"}
        - يُمنع تبادل البيانات خارج التطبيق أو استخدامها لأغراض غير مرتبطة بالاستثمار أو المشاريع.{"\n"}
        - تُحفظ جميع البيانات على خوادم آمنة وتُشفّر باستخدام بروتوكولات حديثة.
      </Text>

      <Text style={styles.sectionTitle}>4. مشاركة البيانات مع أطراف ثالثة</Text>
      <Text style={styles.paragraph}>
        - لا نقوم ببيع أو تأجير أو تبادل بيانات المستخدم مع أي طرف خارجي.{"\n"}
        - يمكن مشاركة بعض البيانات مع الجهات القانونية أو الحكومية في حال وجود طلب قانوني رسمي.
      </Text>

      <Text style={styles.sectionTitle}>5. حقوق المستخدم</Text>
      <Text style={styles.paragraph}>
        يحق لك:{"\n"}
        - تعديل بياناتك الشخصية من خلال الإعدادات.{"\n"}
        - حذف حسابك نهائيًا متى شئت.{"\n"}
        - طلب نسخة من بياناتك المخزّنة لدينا.
      </Text>

      <Text style={styles.sectionTitle}>6. خرق الخصوصية أو إساءة الاستخدام</Text>
      <Text style={styles.paragraph}>
        في حال لاحظت أي محاولة للحصول على معلوماتك خارج القنوات الرسمية، يرجى التبليغ الفوري عبر الدعم داخل التطبيق.{"\n"}
        نحتفظ بحقنا في حظر أو حذف الحسابات التي تنتهك سياسة الخصوصية.
      </Text>

      <Text style={styles.sectionTitle}>7. موافقتك</Text>
      <Text style={styles.paragraph}>
        عند تسجيلك واستخدامك لتطبيق "شركاء النجاح"، فإنك توافق على سياسة الخصوصية هذه وتقر بفهمك والتزامك بمحتواها.
      </Text>

      <Text style={styles.sectionTitle}>8. تواصل معنا</Text>
      <Text style={styles.paragraph}>
        للاستفسار أو الشكاوى المتعلقة بالخصوصية، يرجى التواصل عبر:{"\n"}
        - البريد الإلكتروني{"\n"}
        - الدعم داخل التطبيق
      </Text>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 20,
    alignItems: 'flex-end',
    backgroundColor: '#fff',
    direction: Platform.OS === 'ios' ? 'rtl' : undefined, // iOS-specific
  },
  header: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 12,
    textAlign: 'right',
    color: '#333',
    writingDirection: 'rtl',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginTop: 20,
    marginBottom: 8,
    textAlign: 'right',
    color: '#444',
    writingDirection: 'rtl',
  },
  paragraph: {
    fontSize: 16,
    lineHeight: 28,
    textAlign: 'right',
    color: '#555',
    writingDirection: 'rtl',
  },
});

export default Policies;
