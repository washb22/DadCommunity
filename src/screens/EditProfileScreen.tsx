import React, {useState} from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  Alert,
  ActivityIndicator,
} from 'react-native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/Ionicons';
import {useApp} from '../context/AppContext';
import {useTheme, Theme} from '../theme';
import firestore from '@react-native-firebase/firestore';
import {uploadProfileImage, pickImage} from '../services/storageService';
import type {EditProfileScreenProps} from '../navigation/types';

const AVATARS = ['🧔', '👨', '👴', '🧑', '👨‍🦳', '👨‍🍳', '💪', '🏕️', '⛺', '🎮', '🎸', '📚'];

export default function EditProfileScreen({navigation}: EditProfileScreenProps) {
  const {state, dispatch} = useApp();
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const s = makeStyles(theme);
  const [nickname, setNickname] = useState(state.user.nickname);
  const [bio, setBio] = useState(state.user.bio);
  const [avatar, setAvatar] = useState(state.user.avatar);

  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    if (!nickname.trim()) {
      Alert.alert('알림', '닉네임을 입력해주세요.');
      return;
    }
    if (!state.uid) {
      Alert.alert('알림', '로그인이 필요합니다.');
      return;
    }

    setSaving(true);
    try {
      const updates = {nickname: nickname.trim(), bio: bio.trim(), avatar};
      await firestore().collection('users').doc(state.uid).update(updates);
      dispatch({type: 'UPDATE_PROFILE', updates});
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
      <View style={[s.header, {paddingTop: insets.top}]}>
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
                {text: '아이콘 선택하기', style: 'cancel'},
              ]);
            }}>
            <Text style={s.currentAvatarText}>{avatar}</Text>
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
  });
