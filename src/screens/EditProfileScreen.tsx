import React, {useEffect, useState} from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
  ActivityIndicator,
  Image,
} from 'react-native';
import {SafeAreaView, useSafeAreaInsets} from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/Ionicons';
import {useApp} from '../context/AppContext';
import {useTheme, Theme} from '../theme';
import firestore from '@react-native-firebase/firestore';
import {uploadProfileImage, pickImage} from '../services/storageService';
import type {EditProfileScreenProps} from '../navigation/types';

const isUrl = (str: string) => str.startsWith('http://') || str.startsWith('https://');

const AVATARS = ['🧔', '👨', '👴', '🧑', '👨‍🦳', '👨‍🍳', '💪', '🏕️', '⛺', '🎮', '🎸', '📚'];

const AGE_GROUPS = [
  {label: '임신중', value: 'expecting'},
  {label: '영아 (0-2)', value: 'infant'},
  {label: '유아 (3-6)', value: 'toddler'},
  {label: '초등 (7-12)', value: 'elementary'},
  {label: '중고등 (13-18)', value: 'teenager'},
];

const GENDER_OPTIONS = [
  {label: '아들', value: 'male'},
  {label: '딸', value: 'female'},
];

const CHILD_COUNT_OPTIONS = [1, 2, 3, 4, 5];

interface ChildEntry {
  ageGroup: string;
  gender: string;
}

export default function EditProfileScreen({navigation}: EditProfileScreenProps) {
  const {state, dispatch} = useApp();
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const s = makeStyles(theme);
  const [nickname, setNickname] = useState(state.user.nickname);
  const [bio, setBio] = useState(state.user.bio);
  const [avatar, setAvatar] = useState(state.user.avatar);

  const [childCount, setChildCount] = useState<number>(1);
  const [children, setChildren] = useState<ChildEntry[]>([
    {ageGroup: '', gender: ''},
  ]);
  const [childLoading, setChildLoading] = useState(true);

  const [saving, setSaving] = useState(false);

  // Load current childInfo from Firestore (users/{uid}.childInfo)
  useEffect(() => {
    if (!state.uid) {
      setChildLoading(false);
      return;
    }
    let cancelled = false;
    (async () => {
      try {
        const doc = await firestore().collection('users').doc(state.uid!).get();
        if (cancelled) return;
        const data = (doc.data() || {}) as Record<string, any>;
        const info = (data.childInfo || {}) as Record<string, any>;

        const count =
          typeof info.count === 'number' && info.count > 0 ? info.count : 1;

        let loaded: ChildEntry[] = [];
        if (Array.isArray(info.children) && info.children.length > 0) {
          loaded = info.children.map((c: any) => ({
            ageGroup: c?.ageGroup || '',
            gender: c?.gender || '',
          }));
        } else {
          // Legacy users: only had a single ageGroup/gender — seed the first
          // child with it and leave the rest blank so the user fills them in
          const legacyAge = info.ageGroup || '';
          const legacyGender = info.gender || '';
          loaded = Array.from({length: count}, (_, i) => ({
            ageGroup: i === 0 ? legacyAge : '',
            gender: i === 0 ? legacyGender : '',
          }));
        }

        // Normalize to count (trim or pad)
        if (loaded.length > count) loaded = loaded.slice(0, count);
        while (loaded.length < count) loaded.push({ageGroup: '', gender: ''});

        setChildCount(count);
        setChildren(loaded);
      } catch (error) {
        console.error('Failed to load childInfo:', error);
      } finally {
        if (!cancelled) setChildLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [state.uid]);

  const updateChildCount = (c: number) => {
    setChildCount(c);
    setChildren(prev => {
      const next = prev.slice(0, c);
      while (next.length < c) next.push({ageGroup: '', gender: ''});
      return next;
    });
  };

  const updateChildAt = (index: number, patch: Partial<ChildEntry>) => {
    setChildren(prev =>
      prev.map((ch, i) => (i === index ? {...ch, ...patch} : ch)),
    );
  };

  const handleSave = async () => {
    if (!nickname.trim()) {
      Alert.alert('알림', '닉네임을 입력해주세요.');
      return;
    }
    if (!state.uid) {
      Alert.alert('알림', '로그인이 필요합니다.');
      return;
    }

    const missingAge = children.findIndex(c => !c.ageGroup);
    if (missingAge !== -1) {
      Alert.alert(
        '알림',
        `${missingAge + 1}번째 자녀의 나이대를 선택해주세요.`,
      );
      return;
    }
    const missingGender = children.findIndex(c => !c.gender);
    if (missingGender !== -1) {
      Alert.alert(
        '알림',
        `${missingGender + 1}번째 자녀의 성별을 선택해주세요.`,
      );
      return;
    }

    setSaving(true);
    try {
      // Primary child = first child — keeps backward compat for feed filters /
      // AgeBadge / WritePost tagging that read the top-level childAgeGroup.
      const primary = children[0];
      const childInfoPayload = {
        ageGroup: primary.ageGroup,
        gender: primary.gender,
        count: childCount,
        children,
      };
      const updates = {
        nickname: nickname.trim(),
        bio: bio.trim(),
        avatar,
        childInfo: childInfoPayload,
      };
      await firestore().collection('users').doc(state.uid).update(updates);
      dispatch({
        type: 'UPDATE_PROFILE',
        updates: {
          nickname: nickname.trim(),
          bio: bio.trim(),
          avatar,
          childAgeGroup: primary.ageGroup,
          childGender: primary.gender,
          childCount,
        },
      });
      Alert.alert('완료', '프로필이 수정되었습니다.', [
        {text: '확인', onPress: () => navigation.goBack()},
      ]);
    } catch (error) {
      console.error('Failed to save profile:', error);
      Alert.alert('오류', '프로필 저장에 실패했습니다. 다시 시도해주세요.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <SafeAreaView style={s.container}>
      <View style={s.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={s.cancelText}>취소</Text>
        </TouchableOpacity>
        <Text style={s.headerTitle}>프로필 수정</Text>
        <TouchableOpacity onPress={handleSave} disabled={saving}>
          {saving ? (
            <ActivityIndicator size="small" color={theme.colors.primary} />
          ) : (
            <Text style={s.saveText}>저장</Text>
          )}
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={s.content}>
        {/* Avatar */}
        <View style={s.avatarSection}>
          <TouchableOpacity
            style={s.currentAvatar}
            onPress={() => {
              Alert.alert('프로필 사진', '프로필 사진을 변경하시겠습니까?', [
                {
                  text: '갤러리에서 선택',
                  onPress: async () => {
                    try {
                      const uri = await pickImage();
                      if (uri && state.uid) {
                        const downloadUrl = await uploadProfileImage(state.uid, uri);
                        setAvatar(downloadUrl);
                        Alert.alert('알림', '프로필 사진이 업로드되었습니다.');
                      }
                    } catch (error) {
                      console.error('Profile image upload failed:', error);
                      Alert.alert('오류', '이미지 업로드에 실패했습니다.');
                    }
                  },
                },
                {text: '취소', style: 'cancel'},
              ]);
            }}>
            {isUrl(avatar) ? (
              <Image source={{uri: avatar}} style={s.currentAvatarImage} />
            ) : (
              <Text style={s.currentAvatarText}>{avatar}</Text>
            )}
            <View style={s.cameraIcon}>
              <Icon name="camera" size={14} color={theme.colors.onPrimary} />
            </View>
          </TouchableOpacity>
          <Text style={s.avatarLabel}>프로필 아이콘 선택</Text>
          <View style={s.avatarGrid}>
            {AVATARS.map(a => (
              <TouchableOpacity
                key={a}
                style={[
                  s.avatarOption,
                  avatar === a && s.avatarOptionActive,
                ]}
                onPress={() => setAvatar(a)}>
                <Text style={s.avatarOptionText}>{a}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Nickname */}
        <View style={s.field}>
          <Text style={s.fieldLabel}>닉네임</Text>
          <TextInput
            style={s.fieldInput}
            value={nickname}
            onChangeText={setNickname}
            maxLength={12}
            placeholder="닉네임을 입력하세요"
            placeholderTextColor={theme.colors.textTertiary}
          />
          <Text style={s.charCount}>{nickname.length}/12</Text>
        </View>

        {/* Bio */}
        <View style={s.field}>
          <Text style={s.fieldLabel}>자기소개</Text>
          <TextInput
            style={[s.fieldInput, s.bioInput]}
            value={bio}
            onChangeText={setBio}
            maxLength={50}
            placeholder="간단한 자기소개를 입력하세요"
            placeholderTextColor={theme.colors.textTertiary}
            multiline
          />
          <Text style={s.charCount}>{bio.length}/50</Text>
        </View>

        {/* Child Info */}
        <View style={s.sectionDivider} />
        <Text style={s.sectionTitle}>자녀 정보</Text>
        <Text style={s.sectionSubtitle}>
          자녀가 생기거나 아이가 자라면 최신화해주세요
        </Text>

        {childLoading ? (
          <ActivityIndicator
            size="small"
            color={theme.colors.primary}
            style={{marginVertical: theme.spacing.lg}}
          />
        ) : (
          <>
            <View style={s.field}>
              <Text style={s.fieldLabel}>자녀 수</Text>
              <View style={s.chipGrid}>
                {CHILD_COUNT_OPTIONS.map(c => (
                  <TouchableOpacity
                    key={c}
                    style={[s.chip, childCount === c && s.chipActive]}
                    onPress={() => updateChildCount(c)}>
                    <Text
                      style={[
                        s.chipText,
                        childCount === c && s.chipTextActive,
                      ]}>
                      {c}명
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {children.map((child, idx) => (
              <View key={idx} style={s.childBlock}>
                <Text style={s.childBlockTitle}>
                  {childCount > 1 ? `${idx + 1}번째 자녀` : '자녀 정보'}
                </Text>

                <View style={s.field}>
                  <Text style={s.fieldLabel}>나이대</Text>
                  <View style={s.chipGrid}>
                    {AGE_GROUPS.map(ag => (
                      <TouchableOpacity
                        key={ag.value}
                        style={[
                          s.chip,
                          child.ageGroup === ag.value && s.chipActive,
                        ]}
                        onPress={() =>
                          updateChildAt(idx, {ageGroup: ag.value})
                        }>
                        <Text
                          style={[
                            s.chipText,
                            child.ageGroup === ag.value && s.chipTextActive,
                          ]}>
                          {ag.label}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>

                <View style={s.field}>
                  <Text style={s.fieldLabel}>성별</Text>
                  <View style={s.chipGrid}>
                    {GENDER_OPTIONS.map(g => (
                      <TouchableOpacity
                        key={g.value}
                        style={[
                          s.chip,
                          child.gender === g.value && s.chipActive,
                        ]}
                        onPress={() => updateChildAt(idx, {gender: g.value})}>
                        <Text
                          style={[
                            s.chipText,
                            child.gender === g.value && s.chipTextActive,
                          ]}>
                          {g.label}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>
              </View>
            ))}
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const makeStyles = (theme: Theme) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.colors.surface,
    },
    header: {
      height: 52,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: theme.spacing.base,
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.border,
    },
    cancelText: {
      ...theme.typography.body,
      color: theme.colors.textSecondary,
    },
    headerTitle: {
      ...theme.typography.h3,
      color: theme.colors.textPrimary,
    },
    saveText: {
      ...theme.typography.body,
      fontWeight: '700',
      color: theme.colors.primary,
    },
    content: {
      padding: theme.spacing.lg,
    },
    avatarSection: {
      alignItems: 'center',
      marginBottom: theme.spacing['2xl'],
    },
    currentAvatar: {
      width: 80,
      height: 80,
      borderRadius: 40,
      backgroundColor: theme.colors.surfaceElevated,
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: theme.spacing.md,
    },
    currentAvatarText: {
      fontSize: 36,
    },
    currentAvatarImage: {
      width: 80,
      height: 80,
      borderRadius: 40,
    },
    cameraIcon: {
      position: 'absolute',
      bottom: 0,
      right: 0,
      width: 28,
      height: 28,
      borderRadius: 14,
      backgroundColor: theme.colors.primary,
      alignItems: 'center',
      justifyContent: 'center',
      borderWidth: 2,
      borderColor: theme.colors.surface,
    },
    avatarLabel: {
      ...theme.typography.caption,
      color: theme.colors.textSecondary,
      marginBottom: theme.spacing.md,
    },
    avatarGrid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      justifyContent: 'center',
      gap: theme.spacing.sm,
    },
    avatarOption: {
      width: 48,
      height: 48,
      borderRadius: 24,
      backgroundColor: theme.colors.background,
      alignItems: 'center',
      justifyContent: 'center',
    },
    avatarOptionActive: {
      backgroundColor: theme.colors.secondary,
      borderWidth: 2,
      borderColor: theme.colors.primary,
    },
    avatarOptionText: {
      fontSize: 22,
    },
    field: {
      marginBottom: theme.spacing.xl,
    },
    fieldLabel: {
      ...theme.typography.caption,
      fontWeight: '700',
      color: theme.colors.textSecondary,
      marginBottom: theme.spacing.sm,
      letterSpacing: 0.3,
    },
    fieldInput: {
      backgroundColor: theme.colors.background,
      borderRadius: theme.radius.md,
      paddingHorizontal: theme.spacing.base,
      paddingVertical: theme.spacing.md,
      ...theme.typography.body,
      color: theme.colors.textPrimary,
    },
    bioInput: {
      minHeight: 80,
      textAlignVertical: 'top',
    },
    charCount: {
      textAlign: 'right',
      ...theme.typography.overline,
      color: theme.colors.textTertiary,
      marginTop: theme.spacing.xs,
    },
    sectionDivider: {
      height: 1,
      backgroundColor: theme.colors.border,
      marginVertical: theme.spacing.lg,
    },
    sectionTitle: {
      ...theme.typography.h3,
      fontWeight: '800',
      color: theme.colors.textPrimary,
      marginBottom: theme.spacing.xs,
    },
    sectionSubtitle: {
      ...theme.typography.bodySmall,
      color: theme.colors.textSecondary,
      marginBottom: theme.spacing.lg,
    },
    chipGrid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: theme.spacing.sm,
    },
    chip: {
      paddingHorizontal: theme.spacing.base,
      paddingVertical: theme.spacing.md,
      borderRadius: theme.radius.md,
      backgroundColor: theme.colors.background,
    },
    chipActive: {
      backgroundColor: theme.colors.primary,
    },
    chipText: {
      ...theme.typography.bodySmall,
      color: theme.colors.textSecondary,
      fontWeight: '600',
    },
    chipTextActive: {
      color: theme.colors.onPrimary,
    },
    childBlock: {
      backgroundColor: theme.colors.background,
      borderRadius: theme.radius.md,
      padding: theme.spacing.base,
      marginBottom: theme.spacing.lg,
    },
    childBlockTitle: {
      ...theme.typography.body,
      fontWeight: '700',
      color: theme.colors.textPrimary,
      marginBottom: theme.spacing.md,
    },
  });
