import React, {useState, useRef} from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Switch,
  Alert,
  ScrollView,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Image,
} from 'react-native';
import {SafeAreaView, useSafeAreaInsets} from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/Ionicons';
import {useApp} from '../context/AppContext';
import {useTheme, Theme} from '../theme';
import * as postService from '../services/postService';
import {checkContent} from '../services/contentFilter';
import type {WritePostScreenProps} from '../navigation/types';

const BOARD_OPTIONS = [
  {label: '부부관계', category: '부부관계'},
  {label: '자유게시판', category: '자유'},
  {label: '육아게시판', category: '육아'},
];

export default function WritePostScreen({navigation, route}: WritePostScreenProps) {
  const {state, dispatch} = useApp();
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const s = makeStyles(theme);

  const editMode = route.params?.editMode || false;
  const editPostId = route.params?.postId;
  const initialCategory = route.params?.initialCategory;

  const [title, setTitle] = useState(route.params?.initialTitle || '');
  const [content, setContent] = useState(route.params?.initialContent || '');
  const [selectedBoard, setSelectedBoard] = useState<typeof BOARD_OPTIONS[0] | null>(
    initialCategory
      ? BOARD_OPTIONS.find(b => b.category === initialCategory) || null
      : null,
  );
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [showBoardPicker, setShowBoardPicker] = useState(false);
  const [images, setImages] = useState<string[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [pollEnabled, setPollEnabled] = useState(false);
  const [pollOptions, setPollOptions] = useState<string[]>(['', '']);
  const scrollRef = useRef<ScrollView>(null);

  const handleSubmit = async () => {
    if (!selectedBoard) {
      Alert.alert('알림', '게시판을 선택해주세요.');
      return;
    }
    if (!title.trim()) {
      Alert.alert('알림', '제목을 입력해주세요.');
      return;
    }
    if (!content.trim()) {
      Alert.alert('알림', '내용을 입력해주세요.');
      return;
    }
    if (!state.uid) {
      Alert.alert('알림', '로그인이 필요합니다.');
      return;
    }

    const titleCheck = checkContent(title);
    const contentCheck = checkContent(content);
    if (!titleCheck.isClean || !contentCheck.isClean) {
      const flagged = [...titleCheck.flaggedWords, ...contentCheck.flaggedWords];
      Alert.alert(
        '부적절한 내용 감지',
        '게시글에 부적절한 표현이 포함되어 있습니다. 수정 후 다시 시도해주세요.',
      );
      return;
    }

    setSubmitting(true);
    try {
      if (editMode && editPostId) {
        await postService.updatePost(editPostId, {
          title: title.trim(),
          text: content.trim(),
        });
        dispatch({
          type: 'UPDATE_POST',
          postId: editPostId,
          updates: {title: title.trim(), text: content.trim()},
        });
        Alert.alert('완료', '게시글이 수정되었습니다!', [
          {text: '확인', onPress: () => navigation.goBack()},
        ]);
      } else {
        let imageUrls: string[] = [];
        if (images.length > 0) {
          try {
            const {uploadPostImages} = require('../services/storageService');
            const tempId = `temp_${Date.now()}`;
            imageUrls = await uploadPostImages(tempId, images);
          } catch (error) {
            console.error('Image upload failed:', error);
            Alert.alert('오류', '이미지 업로드에 실패했습니다. 다시 시도해주세요.');
            return;
          }
        }

        // 투표 데이터 준비
        const validPollOptions = pollEnabled
          ? pollOptions.map(o => o.trim()).filter(o => o.length > 0)
          : [];
        const pollData = validPollOptions.length >= 2
          ? {
              options: validPollOptions,
              votes: {},
              votedBy: {},
              totalVotes: 0,
            }
          : undefined;

        const newPostId = await postService.createPost({
          user: isAnonymous ? '익명의 아빠' : state.user.nickname,
          userId: state.uid,
          avatar: isAnonymous ? '🧔' : state.user.avatar,
          category: selectedBoard.category,
          title: title.trim(),
          text: content.trim(),
          isAnonymous,
          images: imageUrls,
          authorAgeGroup: isAnonymous ? undefined : state.user.childAgeGroup,
          poll: pollData,
        });

        dispatch({
          type: 'ADD_POST',
          post: {
            id: newPostId,
            user: isAnonymous ? '익명의 아빠' : state.user.nickname,
            avatar: isAnonymous ? '🧔' : state.user.avatar,
            category: selectedBoard.category,
            title: title.trim(),
            text: content.trim(),
            isAnonymous,
            time: '방금',
            timestamp: Date.now(),
            likes: 0,
            comments: [],
            saved: false,
            liked: false,
            images: imageUrls,
            authorAgeGroup: isAnonymous ? undefined : state.user.childAgeGroup,
            poll: pollData,
          },
        });

        Alert.alert('완료', '게시글이 등록되었습니다!', [
          {text: '확인', onPress: () => navigation.goBack()},
        ]);
      }
    } catch (error) {
      console.error('Failed to submit post:', error);
      Alert.alert('오류', '게시글 등록에 실패했습니다. 다시 시도해주세요.');
    } finally {
      setSubmitting(false);
    }
  };

  const handlePickImage = async () => {
    if (images.length >= 5) {
      Alert.alert('알림', '이미지는 최대 5장까지 첨부할 수 있습니다.');
      return;
    }
    try {
      const {pickImage} = require('../services/storageService');
      const uri = await pickImage();
      if (uri) {
        setImages(prev => [...prev, uri]);
      }
    } catch {
      Alert.alert('알림', '이미지 선택에 실패했습니다.');
    }
  };

  const handleTakePhoto = async () => {
    if (images.length >= 5) {
      Alert.alert('알림', '이미지는 최대 5장까지 첨부할 수 있습니다.');
      return;
    }
    try {
      const {takePhoto} = require('../services/storageService');
      const uri = await takePhoto();
      if (uri) {
        setImages(prev => [...prev, uri]);
      }
    } catch {
      Alert.alert('알림', '카메라 실행에 실패했습니다.');
    }
  };

  const handleImageAttach = () => {
    Alert.alert('사진 추가', '', [
      {text: '갤러리에서 선택', onPress: handlePickImage},
      {text: '카메라로 촬영', onPress: handleTakePhoto},
      {text: '취소', style: 'cancel'},
    ]);
  };

  const handleCancel = () => {
    if (title.trim() || content.trim()) {
      Alert.alert('작성 취소', '작성 중인 내용이 삭제됩니다.', [
        {text: '계속 작성', style: 'cancel'},
        {text: '나가기', style: 'destructive', onPress: () => navigation.goBack()},
      ]);
    } else {
      navigation.goBack();
    }
  };

  return (
    <SafeAreaView style={s.container}>
      <KeyboardAvoidingView
        style={{flex: 1}}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      {/* Header */}
      <View style={s.header}>
        <TouchableOpacity onPress={handleCancel} hitSlop={{top: 10, bottom: 10, left: 10, right: 10}}>
          <Text style={s.cancelText}>취소</Text>
        </TouchableOpacity>
        <Text style={s.headerTitle}>{editMode ? '글 수정' : '글 작성'}</Text>
        <TouchableOpacity
          onPress={handleSubmit}
          disabled={submitting}
          hitSlop={{top: 10, bottom: 10, left: 10, right: 10}}>
          {submitting ? (
            <ActivityIndicator size="small" color={theme.colors.primary} />
          ) : (
            <Text
              style={[
                s.submitText,
                (!title.trim() || !content.trim() || !selectedBoard) &&
                  s.submitTextDisabled,
              ]}>
              등록
            </Text>
          )}
        </TouchableOpacity>
      </View>

      <ScrollView ref={scrollRef} style={s.content} keyboardShouldPersistTaps="handled">
        {/* Board Selector */}
        <TouchableOpacity
          style={s.boardSelector}
          onPress={() => setShowBoardPicker(!showBoardPicker)}>
          <Text
            style={[
              s.boardSelectorText,
              selectedBoard && s.boardSelectorTextSelected,
            ]}>
            <Icon name="clipboard-outline" size={16} color={selectedBoard ? theme.colors.textPrimary : theme.colors.textSecondary} />{' '}
            {selectedBoard ? selectedBoard.label : '게시판 선택'}
          </Text>
          <Icon name={showBoardPicker ? 'chevron-up' : 'chevron-down'} size={16} color={theme.colors.textSecondary} />
        </TouchableOpacity>

        {showBoardPicker && (
          <View style={s.boardPicker}>
            {BOARD_OPTIONS.map(board => (
              <TouchableOpacity
                key={board.category}
                style={[
                  s.boardOption,
                  selectedBoard?.category === board.category &&
                    s.boardOptionActive,
                ]}
                onPress={() => {
                  setSelectedBoard(board);
                  setShowBoardPicker(false);
                }}>
                <Text
                  style={[
                    s.boardOptionText,
                    selectedBoard?.category === board.category &&
                      s.boardOptionTextActive,
                  ]}>
                  {board.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        )}

        {/* Title */}
        <TextInput
          style={s.titleInput}
          placeholder="제목을 입력하세요"
          placeholderTextColor={theme.colors.textTertiary}
          value={title}
          onChangeText={setTitle}
          maxLength={50}
          editable={!submitting}
        />

        {/* Character count */}
        <Text style={s.charCount}>{title.length}/50</Text>

        {/* Content */}
        <TextInput
          style={s.contentInput}
          placeholder={"내용을 입력하세요...\n\n다른 아빠들에게 고민을 나누거나\n유용한 정보를 공유해보세요."}
          placeholderTextColor={theme.colors.textTertiary}
          value={content}
          onChangeText={setContent}
          multiline
          textAlignVertical="top"
          editable={!submitting}
        />

        {/* Image Previews */}
        {images.length > 0 && (
          <View style={s.imagePreviewRow}>
            {images.map((uri, idx) => (
              <View key={idx} style={s.imagePreview}>
                <Image
                  source={{uri}}
                  style={s.imagePreviewImg}
                  resizeMode="cover"
                />
                <TouchableOpacity
                  style={s.imageRemoveBtn}
                  onPress={() => setImages(prev => prev.filter((_, i) => i !== idx))}>
                  <Icon name="close" size={12} color={theme.colors.onPrimary} />
                </TouchableOpacity>
              </View>
            ))}
          </View>
        )}

        {/* Poll Options */}
        {pollEnabled && (
          <View style={s.pollSection}>
            <Text style={s.pollTitle}>투표 항목</Text>
            {pollOptions.map((opt, idx) => (
              <View key={idx} style={s.pollOptionRow}>
                <TextInput
                  style={s.pollInput}
                  placeholder={`항목 ${idx + 1}`}
                  placeholderTextColor={theme.colors.textTertiary}
                  value={opt}
                  onChangeText={text => {
                    const next = [...pollOptions];
                    next[idx] = text;
                    setPollOptions(next);
                  }}
                  onFocus={() => {
                    setTimeout(() => scrollRef.current?.scrollToEnd({animated: true}), 300);
                  }}
                  maxLength={30}
                />
                {pollOptions.length > 2 && (
                  <TouchableOpacity
                    onPress={() => setPollOptions(prev => prev.filter((_, i) => i !== idx))}
                    hitSlop={{top: 8, bottom: 8, left: 8, right: 8}}>
                    <Icon name="close-circle" size={20} color={theme.colors.textTertiary} />
                  </TouchableOpacity>
                )}
              </View>
            ))}
            {pollOptions.length < 5 && (
              <TouchableOpacity
                style={s.pollAddBtn}
                onPress={() => setPollOptions(prev => [...prev, ''])}>
                <Icon name="add-circle-outline" size={18} color={theme.colors.primary} />
                <Text style={s.pollAddText}>항목 추가</Text>
              </TouchableOpacity>
            )}
          </View>
        )}

        {/* Attachments */}
        <View style={s.attachments}>
          <TouchableOpacity
            style={s.attachBtn}
            activeOpacity={0.7}
            onPress={handleImageAttach}>
            <View style={s.attachContent}><Icon name="camera-outline" size={16} color={theme.colors.textSecondary} /><Text style={s.attachText}> 사진</Text></View>
          </TouchableOpacity>
          <TouchableOpacity style={s.attachBtn} activeOpacity={0.7} onPress={() => Alert.alert('알림', '영상 첨부 기능은 준비 중입니다.')}>
            <View style={s.attachContent}><Icon name="videocam-outline" size={16} color={theme.colors.textSecondary} /><Text style={s.attachText}> 영상</Text></View>
          </TouchableOpacity>
          <TouchableOpacity
            style={[s.attachBtn, pollEnabled && {backgroundColor: theme.colors.secondary}]}
            activeOpacity={0.7}
            onPress={() => setPollEnabled(!pollEnabled)}>
            <View style={s.attachContent}>
              <Icon name="bar-chart-outline" size={16} color={pollEnabled ? theme.colors.primary : theme.colors.textSecondary} />
              <Text style={[s.attachText, pollEnabled && {color: theme.colors.primary}]}> 투표</Text>
            </View>
          </TouchableOpacity>
        </View>

        {/* Anonymous Toggle */}
        <View style={s.anonToggle}>
          <Switch
            value={isAnonymous}
            onValueChange={setIsAnonymous}
            trackColor={{false: theme.colors.border, true: theme.colors.primary}}
            thumbColor={theme.colors.onPrimary}
          />
          <Text style={s.anonText}>익명으로 작성</Text>
          <Text style={s.anonDesc}>닉네임이 '익명의 아빠'로 표시됩니다</Text>
        </View>
      </ScrollView>
      </KeyboardAvoidingView>
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
      fontWeight: '500',
    },
    headerTitle: {
      ...theme.typography.h3,
      color: theme.colors.textPrimary,
    },
    submitText: {
      ...theme.typography.body,
      fontWeight: '700',
      color: theme.colors.primary,
    },
    submitTextDisabled: {
      color: theme.colors.textTertiary,
    },
    content: {
      flex: 1,
      padding: theme.spacing.base,
    },
    boardSelector: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      backgroundColor: theme.colors.background,
      borderRadius: theme.radius.md,
      padding: theme.spacing.md,
      marginBottom: theme.spacing.base,
    },
    boardSelectorText: {
      ...theme.typography.bodySmall,
      color: theme.colors.textSecondary,
      fontWeight: '500',
    },
    boardSelectorTextSelected: {
      color: theme.colors.textPrimary,
    },
    boardPicker: {
      backgroundColor: theme.colors.surfaceElevated,
      borderRadius: theme.radius.md,
      marginBottom: theme.spacing.base,
      overflow: 'hidden',
      borderWidth: 1,
      borderColor: theme.colors.border,
    },
    boardOption: {
      padding: theme.spacing.md,
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.border,
    },
    boardOptionActive: {
      backgroundColor: theme.colors.secondary,
    },
    boardOptionText: {
      ...theme.typography.bodySmall,
      color: theme.colors.textSecondary,
    },
    boardOptionTextActive: {
      color: theme.colors.primary,
      fontWeight: '700',
    },
    titleInput: {
      ...theme.typography.h2,
      fontWeight: '700',
      color: theme.colors.textPrimary,
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.border,
      paddingBottom: theme.spacing.md,
      marginBottom: theme.spacing.xs,
    },
    charCount: {
      textAlign: 'right',
      ...theme.typography.overline,
      color: theme.colors.textTertiary,
      marginBottom: theme.spacing.md,
    },
    contentInput: {
      ...theme.typography.body,
      color: theme.colors.textPrimary,
      minHeight: 200,
    },
    attachments: {
      flexDirection: 'row',
      gap: theme.spacing.sm,
      paddingTop: theme.spacing.base,
      borderTopWidth: 1,
      borderTopColor: theme.colors.border,
    },
    attachBtn: {
      paddingHorizontal: theme.spacing.base,
      paddingVertical: theme.spacing.sm,
      backgroundColor: theme.colors.background,
      borderRadius: theme.radius.sm,
    },
    attachContent: {
      flexDirection: 'row' as const,
      alignItems: 'center' as const,
    },
    attachText: {
      ...theme.typography.caption,
      color: theme.colors.textSecondary,
    },
    anonToggle: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: theme.spacing.sm,
      marginTop: theme.spacing.lg,
      paddingTop: theme.spacing.base,
      borderTopWidth: 1,
      borderTopColor: theme.colors.border,
    },
    anonText: {
      ...theme.typography.bodySmall,
      color: theme.colors.textPrimary,
      fontWeight: '600',
    },
    anonDesc: {
      ...theme.typography.overline,
      color: theme.colors.textTertiary,
      flex: 1,
    },
    imagePreviewRow: {
      flexDirection: 'row',
      gap: theme.spacing.sm,
      marginBottom: theme.spacing.md,
      flexWrap: 'wrap',
    },
    imagePreview: {
      width: 72,
      height: 72,
      borderRadius: theme.radius.sm,
      backgroundColor: theme.colors.surfaceElevated,
      alignItems: 'center',
      justifyContent: 'center',
      overflow: 'hidden',
    },
    imagePreviewImg: {
      width: 72,
      height: 72,
      borderRadius: theme.radius.sm,
    },
    counselGuide: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: theme.colors.secondary,
      padding: theme.spacing.md,
      borderRadius: theme.radius.md,
      marginBottom: theme.spacing.base,
      gap: theme.spacing.sm,
    },
    counselGuideText: {
      ...theme.typography.caption,
      color: theme.colors.textPrimary,
      flex: 1,
    },
    pollSection: {
      marginBottom: theme.spacing.md,
      padding: theme.spacing.md,
      backgroundColor: theme.colors.background,
      borderRadius: theme.radius.md,
    },
    pollTitle: {
      ...theme.typography.bodySmall,
      fontWeight: '700',
      color: theme.colors.textPrimary,
      marginBottom: theme.spacing.sm,
    },
    pollOptionRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: theme.spacing.sm,
      marginBottom: theme.spacing.sm,
    },
    pollInput: {
      flex: 1,
      ...theme.typography.bodySmall,
      color: theme.colors.textPrimary,
      backgroundColor: theme.colors.surface,
      borderRadius: theme.radius.sm,
      borderWidth: 1,
      borderColor: theme.colors.border,
      paddingHorizontal: theme.spacing.md,
      paddingVertical: theme.spacing.sm,
    },
    pollAddBtn: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: theme.spacing.xs,
      paddingVertical: theme.spacing.xs,
    },
    pollAddText: {
      ...theme.typography.caption,
      color: theme.colors.primary,
      fontWeight: '600',
    },
    imageRemoveBtn: {
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
  });