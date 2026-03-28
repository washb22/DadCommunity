import React, {useState} from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Image,
  StyleSheet,
  SafeAreaView,
  Alert,
  Platform,
  ActivityIndicator,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import firestore from '@react-native-firebase/firestore';
import storage from '@react-native-firebase/storage';
import {launchImageLibrary} from 'react-native-image-picker';
import auth from '@react-native-firebase/auth';
import {useApp} from '../context/AppContext';
import {useTheme, Theme} from '../theme';
import Header from '../components/Header';
import type {ContactScreenProps} from '../navigation/types';

const CATEGORIES = [
  {key: 'bug' as const, label: '버그 신고'},
  {key: 'feature' as const, label: '기능 제안'},
  {key: 'usage' as const, label: '이용 문의'},
  {key: 'other' as const, label: '기타'},
];

type CategoryKey = 'bug' | 'feature' | 'usage' | 'other';

export default function ContactScreen({navigation}: ContactScreenProps) {
  const {state} = useApp();
  const theme = useTheme();
  const s = makeStyles(theme);

  const [category, setCategory] = useState<CategoryKey | null>(null);
  const [email, setEmail] = useState(auth().currentUser?.email || '');
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [images, setImages] = useState<string[]>([]);
  const [submitting, setSubmitting] = useState(false);

  const pickImage = async () => {
    if (images.length >= 3) return;
    const result = await launchImageLibrary({
      mediaType: 'photo',
      selectionLimit: 3 - images.length,
    });
    if (result.assets) {
      const uris = result.assets
        .map(a => a.uri)
        .filter((u): u is string => !!u);
      setImages(prev => [...prev, ...uris].slice(0, 3));
    }
  };

  const removeImage = (index: number) => {
    setImages(prev => prev.filter((_, i) => i !== index));
  };

  const validate = (): boolean => {
    if (!category) {
      Alert.alert('알림', '문의 유형을 선택해주세요.');
      return false;
    }
    if (title.trim().length < 1) {
      Alert.alert('알림', '제목을 입력해주세요.');
      return false;
    }
    if (content.trim().length < 10) {
      Alert.alert('알림', '내용을 10자 이상 입력해주세요.');
      return false;
    }
    return true;
  };

  const handleSubmit = async () => {
    if (!validate() || submitting) return;
    setSubmitting(true);

    try {
      const imageUrls: string[] = [];
      for (const uri of images) {
        const filename = `contacts/${Date.now()}_${Math.random().toString(36).slice(2)}`;
        const ref = storage().ref(filename);
        await ref.putFile(uri);
        const url = await ref.getDownloadURL();
        imageUrls.push(url);
      }

      await firestore().collection('contacts').add({
        userId: state.uid,
        email: email.trim(),
        category,
        title: title.trim(),
        content: content.trim(),
        images: imageUrls,
        deviceInfo: {
          appVersion: '1.0.0',
          os: Platform.OS,
          osVersion: String(Platform.Version),
          device: Platform.OS === 'ios' ? 'iOS Device' : 'Android Device',
        },
        status: 'pending',
        createdAt: firestore.FieldValue.serverTimestamp(),
      });

      Alert.alert(
        '문의 접수 완료',
        '문의가 접수되었습니다. 빠른 시일 내 답변드리겠습니다.',
        [{text: '확인', onPress: () => navigation.goBack()}],
      );
    } catch (error) {
      Alert.alert('오류', '문의 전송에 실패했습니다. 다시 시도해주세요.');
    } finally {
      setSubmitting(false);
    }
  };

  const canSubmit = !!category && title.trim().length >= 1 && content.trim().length >= 10;

  return (
    <SafeAreaView style={s.container}>
      <Header title="문의하기" showBack onBack={() => navigation.goBack()} />
      <ScrollView
        style={s.scroll}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled">
        {/* Category */}
        <Text style={s.label}>문의 유형</Text>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={s.chipScroll}>
          {CATEGORIES.map(cat => (
            <TouchableOpacity
              key={cat.key}
              style={[
                s.chip,
                category === cat.key && s.chipActive,
              ]}
              onPress={() => setCategory(cat.key)}
              activeOpacity={0.7}>
              <Text
                style={[
                  s.chipText,
                  category === cat.key && s.chipTextActive,
                ]}>
                {cat.label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Email */}
        <Text style={s.label}>답변 받을 이메일</Text>
        <TextInput
          style={s.input}
          value={email}
          onChangeText={setEmail}
          placeholder="이메일 주소"
          placeholderTextColor={theme.colors.textTertiary}
          keyboardType="email-address"
          autoCapitalize="none"
        />

        {/* Title */}
        <View style={s.labelRow}>
          <Text style={s.label}>제목</Text>
          <Text style={s.counter}>{title.length}/50</Text>
        </View>
        <TextInput
          style={s.input}
          value={title}
          onChangeText={t => setTitle(t.slice(0, 50))}
          placeholder="제목을 입력해주세요"
          placeholderTextColor={theme.colors.textTertiary}
        />

        {/* Content */}
        <Text style={s.label}>내용</Text>
        <TextInput
          style={s.textArea}
          value={content}
          onChangeText={setContent}
          placeholder={
            '문의 내용을 상세히 작성해주세요.\n버그 신고의 경우 발생 상황을 구체적으로 알려주시면 빠른 해결에 도움이 됩니다.'
          }
          placeholderTextColor={theme.colors.textTertiary}
          multiline
          textAlignVertical="top"
        />

        {/* Images */}
        <Text style={s.label}>스크린샷 첨부 (선택, 최대 3장)</Text>
        <View style={s.imageRow}>
          {images.map((uri, idx) => (
            <View key={idx} style={s.imageWrapper}>
              <Image source={{uri}} style={s.imagePreview} />
              <TouchableOpacity
                style={s.imageRemove}
                onPress={() => removeImage(idx)}>
                <Icon name="close" size={14} color={theme.colors.onPrimary} />
              </TouchableOpacity>
            </View>
          ))}
          {images.length < 3 && (
            <TouchableOpacity style={s.imageAdd} onPress={pickImage}>
              <Icon name="camera-outline" size={24} color={theme.colors.textTertiary} />
            </TouchableOpacity>
          )}
        </View>

        {/* Device Info */}
        <View style={s.deviceInfo}>
          <Text style={s.deviceCaption}>
            문의 해결을 위해 기기 정보가 함께 전송됩니다.
          </Text>
          <Text style={s.deviceText}>앱 버전: 1.0.0</Text>
          <Text style={s.deviceText}>
            OS: {Platform.OS === 'ios' ? 'iOS' : 'Android'} {Platform.Version}
          </Text>
        </View>

        {/* Submit */}
        <TouchableOpacity
          style={[s.submitBtn, !canSubmit && s.submitBtnDisabled]}
          onPress={handleSubmit}
          disabled={!canSubmit || submitting}
          activeOpacity={0.8}>
          {submitting ? (
            <ActivityIndicator color={theme.colors.onPrimary} />
          ) : (
            <Text style={s.submitBtnText}>전송하기</Text>
          )}
        </TouchableOpacity>

        <View style={s.bottomSpacer} />
      </ScrollView>
    </SafeAreaView>
  );
}

const makeStyles = (theme: Theme) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.colors.background,
    },
    scroll: {
      flex: 1,
      paddingHorizontal: theme.spacing.base,
    },
    label: {
      ...theme.typography.caption,
      fontWeight: '600',
      color: theme.colors.textPrimary,
      marginTop: theme.spacing.lg,
      marginBottom: theme.spacing.sm,
    },
    labelRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginTop: theme.spacing.lg,
      marginBottom: theme.spacing.sm,
    },
    counter: {
      ...theme.typography.captionSmall,
      color: theme.colors.textTertiary,
    },
    chipScroll: {
      flexDirection: 'row',
    },
    chip: {
      paddingHorizontal: theme.spacing.base,
      paddingVertical: theme.spacing.sm,
      borderRadius: theme.radius.pill,
      backgroundColor: theme.colors.surfaceElevated,
      marginRight: theme.spacing.sm,
    },
    chipActive: {
      backgroundColor: theme.colors.primary,
    },
    chipText: {
      ...theme.typography.bodySmall,
      color: theme.colors.textSecondary,
    },
    chipTextActive: {
      color: theme.colors.onPrimary,
      fontWeight: '600',
    },
    input: {
      backgroundColor: theme.colors.surfaceElevated,
      borderRadius: theme.radius.md,
      paddingHorizontal: theme.spacing.base,
      paddingVertical: theme.spacing.md,
      ...theme.typography.body,
      color: theme.colors.textPrimary,
    },
    textArea: {
      backgroundColor: theme.colors.surfaceElevated,
      borderRadius: theme.radius.md,
      paddingHorizontal: theme.spacing.base,
      paddingVertical: theme.spacing.md,
      ...theme.typography.bodyLarge,
      color: theme.colors.textPrimary,
      lineHeight: 26,
      minHeight: 200,
    },
    imageRow: {
      flexDirection: 'row',
      gap: theme.spacing.sm,
    },
    imageWrapper: {
      position: 'relative',
    },
    imagePreview: {
      width: 72,
      height: 72,
      borderRadius: theme.radius.md,
    },
    imageRemove: {
      position: 'absolute',
      top: -6,
      right: -6,
      width: 20,
      height: 20,
      borderRadius: 10,
      backgroundColor: theme.colors.error,
      alignItems: 'center',
      justifyContent: 'center',
    },
    imageAdd: {
      width: 72,
      height: 72,
      borderRadius: theme.radius.md,
      backgroundColor: theme.colors.surfaceElevated,
      alignItems: 'center',
      justifyContent: 'center',
      borderWidth: 1,
      borderColor: theme.colors.border,
      borderStyle: 'dashed',
    },
    deviceInfo: {
      backgroundColor: theme.colors.surfaceElevated,
      borderRadius: theme.radius.sm,
      padding: theme.spacing.md,
      marginTop: theme.spacing.lg,
    },
    deviceCaption: {
      ...theme.typography.captionSmall,
      color: theme.colors.textTertiary,
      marginBottom: theme.spacing.sm,
    },
    deviceText: {
      ...theme.typography.captionSmall,
      color: theme.colors.textTertiary,
      marginBottom: theme.spacing.xs,
    },
    submitBtn: {
      backgroundColor: theme.colors.primary,
      height: 52,
      borderRadius: theme.radius.md,
      alignItems: 'center',
      justifyContent: 'center',
      marginTop: theme.spacing.xl,
    },
    submitBtnDisabled: {
      opacity: 0.5,
    },
    submitBtnText: {
      ...theme.typography.body,
      fontWeight: '700',
      color: theme.colors.onPrimary,
    },
    bottomSpacer: {
      height: theme.spacing['3xl'],
    },
  });
