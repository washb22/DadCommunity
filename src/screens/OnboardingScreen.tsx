import React, {useState} from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
  ActivityIndicator,
  Linking,
} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import firestore from '@react-native-firebase/firestore';
import Icon from 'react-native-vector-icons/Ionicons';
import {useApp} from '../context/AppContext';
import {useTheme, Theme} from '../theme';
import type {OnboardingScreenProps} from '../navigation/types';

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

const INTERESTS = [
  '부부관계',
  '육아팁',
  '캠핑',
  '운동',
  '요리',
  '재테크',
  '직장생활',
  '게임',
  '독서',
];

interface ChildInfo {
  ageGroup: string;
  gender: string;
  count: number;
}

export default function OnboardingScreen({navigation}: OnboardingScreenProps) {
  const {state, dispatch} = useApp();
  const theme = useTheme();
  const s = makeStyles(theme);
  const TOTAL_STEPS = 4;
  const [step, setStep] = useState(1);
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [agreePrivacy, setAgreePrivacy] = useState(false);
  const [nickname, setNickname] = useState(state.user.nickname || '');
  const [avatar, setAvatar] = useState(state.user.avatar || '🧔');
  const [childInfo, setChildInfo] = useState<ChildInfo>({
    ageGroup: '',
    gender: '',
    count: 1,
  });
  const [selectedInterests, setSelectedInterests] = useState<string[]>([]);
  const [submitting, setSubmitting] = useState(false);

  const toggleInterest = (interest: string) => {
    setSelectedInterests(prev =>
      prev.includes(interest)
        ? prev.filter(i => i !== interest)
        : [...prev, interest],
    );
  };

  const handleNext = () => {
    if (step === 1) {
      if (!agreeTerms || !agreePrivacy) {
        Alert.alert('알림', '이용약관과 개인정보처리방침에 모두 동의해주세요.');
        return;
      }
      setStep(2);
    } else if (step === 2) {
      if (!nickname.trim()) {
        Alert.alert('알림', '닉네임을 입력해주세요.');
        return;
      }
      setStep(3);
    } else if (step === 3) {
      if (!childInfo.ageGroup) {
        Alert.alert('알림', '자녀 나이대를 선택해주세요.');
        return;
      }
      if (!childInfo.gender) {
        Alert.alert('알림', '자녀 성별을 선택해주세요.');
        return;
      }
      setStep(4);
    }
  };

  const handleBack = () => {
    if (step > 1) {
      setStep(step - 1);
    }
  };

  const handleComplete = async () => {
    if (selectedInterests.length === 0) {
      Alert.alert('알림', '관심사를 1개 이상 선택해주세요.');
      return;
    }
    if (!state.uid) {
      Alert.alert('오류', '로그인 정보를 찾을 수 없습니다.');
      return;
    }

    setSubmitting(true);
    try {
      await firestore().collection('users').doc(state.uid).set(
        {
          nickname: nickname.trim(),
          avatar,
          childInfo: {
            ageGroup: childInfo.ageGroup,
            gender: childInfo.gender,
            count: childInfo.count,
          },
          interests: selectedInterests,
          onboardingCompleted: true,
          termsAgreedAt: firestore.FieldValue.serverTimestamp(),
          privacyAgreedAt: firestore.FieldValue.serverTimestamp(),
        },
        {merge: true},
      );

      dispatch({
        type: 'UPDATE_PROFILE',
        updates: {
          nickname: nickname.trim(),
          avatar,
          childAgeGroup: childInfo.ageGroup,
          childGender: childInfo.gender,
          childCount: childInfo.count,
          interests: selectedInterests,
        },
      });

      navigation.replace('Main');
    } catch (error) {
      console.error('Onboarding save failed:', error);
      Alert.alert('오류', '저장에 실패했습니다. 다시 시도해주세요.');
    } finally {
      setSubmitting(false);
    }
  };

  const renderStepIndicator = () => (
    <View style={s.stepIndicator}>
      {[1, 2, 3, 4].map(i => (
        <View
          key={i}
          style={[s.stepDot, i === step && s.stepDotActive, i < step && s.stepDotDone]}
        />
      ))}
    </View>
  );

  const renderStep1Terms = () => (
    <ScrollView contentContainerStyle={s.stepContent} showsVerticalScrollIndicator={false}>
      <Text style={s.stepTitle}>약관 동의</Text>
      <Text style={s.stepSubtitle}>서비스 이용을 위해 아래 약관에 동의해주세요</Text>

      <View style={s.termsNotice}>
        <Icon name="shield-checkmark-outline" size={20} color={theme.colors.primary} />
        <Text style={s.termsNoticeText}>
          아빠의 다락방은 건전한 커뮤니티 운영을 위해 불쾌한 콘텐츠 및 악용 행위에 대한 무관용 정책을 시행합니다.
        </Text>
      </View>

      <TouchableOpacity
        style={s.termsItem}
        onPress={() => setAgreeTerms(!agreeTerms)}
        activeOpacity={0.7}>
        <Icon
          name={agreeTerms ? 'checkbox' : 'square-outline'}
          size={24}
          color={agreeTerms ? theme.colors.primary : theme.colors.textTertiary}
        />
        <Text style={s.termsItemText}>[필수] 이용약관 동의</Text>
        <TouchableOpacity
          onPress={() => navigation.navigate('Terms')}
          hitSlop={{top: 10, bottom: 10, left: 10, right: 10}}>
          <Text style={s.termsViewLink}>보기</Text>
        </TouchableOpacity>
      </TouchableOpacity>

      <TouchableOpacity
        style={s.termsItem}
        onPress={() => setAgreePrivacy(!agreePrivacy)}
        activeOpacity={0.7}>
        <Icon
          name={agreePrivacy ? 'checkbox' : 'square-outline'}
          size={24}
          color={agreePrivacy ? theme.colors.primary : theme.colors.textTertiary}
        />
        <Text style={s.termsItemText}>[필수] 개인정보처리방침 동의</Text>
        <TouchableOpacity
          onPress={() => navigation.navigate('PrivacyPolicy')}
          hitSlop={{top: 10, bottom: 10, left: 10, right: 10}}>
          <Text style={s.termsViewLink}>보기</Text>
        </TouchableOpacity>
      </TouchableOpacity>

      <TouchableOpacity
        style={s.agreeAllBtn}
        onPress={() => {
          const allAgreed = agreeTerms && agreePrivacy;
          setAgreeTerms(!allAgreed);
          setAgreePrivacy(!allAgreed);
        }}
        activeOpacity={0.7}>
        <Icon
          name={agreeTerms && agreePrivacy ? 'checkbox' : 'square-outline'}
          size={24}
          color={agreeTerms && agreePrivacy ? theme.colors.primary : theme.colors.textTertiary}
        />
        <Text style={s.agreeAllText}>전체 동의</Text>
      </TouchableOpacity>

      <View style={s.termsSummary}>
        <Text style={s.termsSummaryTitle}>주요 안내사항</Text>
        <Text style={s.termsSummaryText}>
          {'\u2022'} 불쾌한 콘텐츠(음란물, 폭력, 혐오 발언 등) 게시 시 계정이 즉시 정지됩니다.{'\n'}
          {'\u2022'} 신고된 콘텐츠는 24시간 이내에 검토 및 조치됩니다.{'\n'}
          {'\u2022'} 부적절한 활동 신고: sbro@sbrother.co.kr{'\n'}
          {'\u2022'} 만 18세 이상 이용 가능한 서비스입니다.
        </Text>
      </View>
    </ScrollView>
  );

  const renderStep1 = () => (
    <ScrollView contentContainerStyle={s.stepContent} showsVerticalScrollIndicator={false}>
      <Text style={s.stepTitle}>프로필 설정</Text>
      <Text style={s.stepSubtitle}>다른 아빠들에게 보여질 프로필을 설정해주세요</Text>

      {/* Avatar Selection */}
      <View style={s.avatarSection}>
        <View style={s.currentAvatar}>
          <Text style={s.currentAvatarText}>{avatar}</Text>
        </View>
        <Text style={s.avatarLabel}>아바타를 선택하세요</Text>
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
    </ScrollView>
  );

  const renderStep2 = () => (
    <ScrollView contentContainerStyle={s.stepContent} showsVerticalScrollIndicator={false}>
      <Text style={s.stepTitle}>자녀 정보</Text>
      <Text style={s.stepSubtitle}>맞춤형 콘텐츠를 추천해드리기 위해 알려주세요</Text>

      {/* Age Group */}
      <View style={s.field}>
        <Text style={s.fieldLabel}>자녀 나이대</Text>
        <View style={s.chipGrid}>
          {AGE_GROUPS.map(ag => (
            <TouchableOpacity
              key={ag.value}
              style={[
                s.chip,
                childInfo.ageGroup === ag.value && s.chipActive,
              ]}
              onPress={() => setChildInfo(prev => ({...prev, ageGroup: ag.value}))}>
              <Text
                style={[
                  s.chipText,
                  childInfo.ageGroup === ag.value && s.chipTextActive,
                ]}>
                {ag.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Gender */}
      <View style={s.field}>
        <Text style={s.fieldLabel}>성별</Text>
        <View style={s.chipGrid}>
          {GENDER_OPTIONS.map(g => (
            <TouchableOpacity
              key={g.value}
              style={[
                s.chip,
                childInfo.gender === g.value && s.chipActive,
              ]}
              onPress={() => setChildInfo(prev => ({...prev, gender: g.value}))}>
              <Text
                style={[
                  s.chipText,
                  childInfo.gender === g.value && s.chipTextActive,
                ]}>
                {g.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Count */}
      <View style={s.field}>
        <Text style={s.fieldLabel}>자녀 수</Text>
        <View style={s.chipGrid}>
          {CHILD_COUNT_OPTIONS.map(c => (
            <TouchableOpacity
              key={c}
              style={[
                s.chip,
                s.chipSmall,
                childInfo.count === c && s.chipActive,
              ]}
              onPress={() => setChildInfo(prev => ({...prev, count: c}))}>
              <Text
                style={[
                  s.chipText,
                  childInfo.count === c && s.chipTextActive,
                ]}>
                {c}명
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>
    </ScrollView>
  );

  const renderStep3 = () => (
    <ScrollView contentContainerStyle={s.stepContent} showsVerticalScrollIndicator={false}>
      <Text style={s.stepTitle}>관심사 선택</Text>
      <Text style={s.stepSubtitle}>관심 있는 주제를 모두 선택해주세요 (복수 선택)</Text>

      <View style={s.interestGrid}>
        {INTERESTS.map(interest => (
          <TouchableOpacity
            key={interest}
            style={[
              s.interestChip,
              selectedInterests.includes(interest) && s.interestChipActive,
            ]}
            onPress={() => toggleInterest(interest)}>
            <Text
              style={[
                s.interestText,
                selectedInterests.includes(interest) && s.interestTextActive,
              ]}>
              {interest}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <Text style={s.selectedCount}>
        {selectedInterests.length}개 선택됨
      </Text>
    </ScrollView>
  );

  return (
    <SafeAreaView style={s.container}>
      {/* Header */}
      <View style={s.header}>
        {step > 1 ? (
          <TouchableOpacity onPress={handleBack} style={{flexDirection: 'row', alignItems: 'center'}} hitSlop={{top: 10, bottom: 10, left: 10, right: 10}}>
            <Icon name="chevron-back" size={20} color={theme.colors.primary} />
            <Text style={s.backText}>이전</Text>
          </TouchableOpacity>
        ) : (
          <View style={s.placeholder} />
        )}
        <Text style={s.headerTitle}>Step {step}/{TOTAL_STEPS}</Text>
        <View style={s.placeholder} />
      </View>

      {renderStepIndicator()}

      {/* Step Content */}
      {step === 1 && renderStep1Terms()}
      {step === 2 && renderStep1()}
      {step === 3 && renderStep2()}
      {step === 4 && renderStep3()}

      {/* Bottom Button */}
      <View style={s.bottomBar}>
        {step < TOTAL_STEPS ? (
          <TouchableOpacity
            style={[s.nextButton, step === 1 && (!agreeTerms || !agreePrivacy) && s.nextButtonDisabled]}
            onPress={handleNext}
            activeOpacity={0.8}>
            <Text style={s.nextButtonText}>{step === 1 ? '동의하고 계속하기' : '다음'}</Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            style={[s.nextButton, submitting && s.nextButtonDisabled]}
            onPress={handleComplete}
            disabled={submitting}
            activeOpacity={0.8}>
            {submitting ? (
              <ActivityIndicator size="small" color={theme.colors.onPrimary} />
            ) : (
              <Text style={s.nextButtonText}>시작하기</Text>
            )}
          </TouchableOpacity>
        )}
      </View>
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
    backText: {
      ...theme.typography.body,
      color: theme.colors.primary,
      fontWeight: '500',
    },
    headerTitle: {
      ...theme.typography.body,
      fontWeight: '700',
      color: theme.colors.textPrimary,
    },
    placeholder: {
      width: 50,
    },
    stepIndicator: {
      flexDirection: 'row',
      justifyContent: 'center',
      alignItems: 'center',
      gap: theme.spacing.sm,
      paddingVertical: theme.spacing.base,
    },
    stepDot: {
      width: 8,
      height: 8,
      borderRadius: 4,
      backgroundColor: theme.colors.border,
    },
    stepDotActive: {
      width: 24,
      backgroundColor: theme.colors.primary,
    },
    stepDotDone: {
      backgroundColor: theme.colors.primary,
    },
    stepContent: {
      padding: theme.spacing.lg,
      paddingBottom: 100,
    },
    stepTitle: {
      ...theme.typography.h1,
      fontWeight: '800',
      color: theme.colors.textPrimary,
      marginBottom: theme.spacing.sm,
    },
    stepSubtitle: {
      ...theme.typography.bodySmall,
      color: theme.colors.textSecondary,
      marginBottom: theme.spacing.xl,
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
    charCount: {
      textAlign: 'right',
      ...theme.typography.overline,
      color: theme.colors.textTertiary,
      marginTop: theme.spacing.xs,
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
    chipSmall: {
      paddingHorizontal: theme.spacing.base,
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
    interestGrid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: theme.spacing.sm,
    },
    interestChip: {
      paddingHorizontal: theme.spacing.lg,
      paddingVertical: theme.spacing.md,
      borderRadius: theme.radius.pill,
      backgroundColor: theme.colors.surfaceElevated,
    },
    interestChipActive: {
      backgroundColor: theme.colors.primary,
    },
    interestText: {
      ...theme.typography.bodySmall,
      color: theme.colors.textSecondary,
      fontWeight: '600',
    },
    interestTextActive: {
      color: theme.colors.onPrimary,
    },
    selectedCount: {
      textAlign: 'center',
      ...theme.typography.caption,
      color: theme.colors.textSecondary,
      marginTop: theme.spacing.lg,
    },
    bottomBar: {
      position: 'absolute',
      bottom: 0,
      left: 0,
      right: 0,
      padding: theme.spacing.base,
      paddingBottom: theme.spacing['2xl'],
      backgroundColor: theme.colors.surface,
      borderTopWidth: 1,
      borderTopColor: theme.colors.border,
    },
    termsNotice: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      backgroundColor: theme.colors.secondary,
      borderRadius: theme.radius.md,
      padding: theme.spacing.base,
      gap: theme.spacing.sm,
      marginBottom: theme.spacing.xl,
    },
    termsNoticeText: {
      flex: 1,
      ...theme.typography.bodySmall,
      color: theme.colors.primary,
      fontWeight: '600',
      lineHeight: 20,
    },
    termsItem: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: theme.spacing.md,
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.border,
      gap: theme.spacing.sm,
    },
    termsItemText: {
      flex: 1,
      ...theme.typography.body,
      color: theme.colors.textPrimary,
    },
    termsViewLink: {
      ...theme.typography.bodySmall,
      color: theme.colors.primary,
      fontWeight: '600',
    },
    agreeAllBtn: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: theme.spacing.base,
      gap: theme.spacing.sm,
      marginTop: theme.spacing.sm,
    },
    agreeAllText: {
      ...theme.typography.body,
      fontWeight: '700',
      color: theme.colors.textPrimary,
    },
    termsSummary: {
      backgroundColor: theme.colors.background,
      borderRadius: theme.radius.md,
      padding: theme.spacing.base,
      marginTop: theme.spacing.lg,
    },
    termsSummaryTitle: {
      ...theme.typography.caption,
      fontWeight: '700',
      color: theme.colors.textSecondary,
      marginBottom: theme.spacing.sm,
    },
    termsSummaryText: {
      ...theme.typography.caption,
      color: theme.colors.textSecondary,
      lineHeight: 20,
    },
    nextButton: {
      height: 52,
      borderRadius: theme.radius.md,
      backgroundColor: theme.colors.primary,
      alignItems: 'center',
      justifyContent: 'center',
    },
    nextButtonDisabled: {
      opacity: 0.6,
    },
    nextButtonText: {
      ...theme.typography.bodyLarge,
      fontWeight: '700',
      color: theme.colors.onPrimary,
    },
  });
