import React, {useState} from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  Switch,
  Alert,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/Ionicons';
import {useApp} from '../context/AppContext';
import {useTheme, Theme} from '../theme';
import * as postService from '../services/postService';
import type {WritePostScreenProps} from '../navigation/types';

const BOARD_OPTIONS = [
  {label: '부부관계', category: '부부관계'},
  {label: '자유게시판', category: '자유'},
  {label: '취미게시판', category: '취미'},
  {label: '육아게시판', category: '육아'},
  {label: '직장생활', category: '직장생활'},
  {label: '재테크/부업', category: '재테크/부업'},
  {label: '건강/운동', category: '건강/운동'},
  {label: '요리/집안일', category: '요리/집안일'},
];

export default function WritePostScreen({navigation, route}: WritePostScreenProps) {
  const {state, dispatch} = useApp();
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const s = makeStyles(theme);

  // Edit mode
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
          }
        }

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
            authorAgeGroup: isAnonymous ? undefined : state.user.childAgeGroup,
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
      {/* Header */}
      <View style={[s.header, {paddingTop: insets.top}]}>
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

      <ScrollView style={s.content} keyboardShouldPersistTaps="handled">
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
                <TouchableOpacity
                  style={s.imageRemoveBtn}
                  onPress={() => setImages(prev => prev.filter((_, i) => i !== idx))}>
                  <Icon name="close" size={12} color={theme.colors.onPrimary} />
                </TouchableOpacity>
              </View>
            ))}
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
          <TouchableOpacity style={s.attachBtn} activeOpacity={0.7}>
            <View style={s.attachContent}><Icon name="videocam-outline" size={16} color={theme.colors.textSecondary} /><Text style={s.attachText}> 영상</Text></View>
          </TouchableOpacity>
          <TouchableOpacity style={s.attachBtn} activeOpacity={0.7}>
            <View style={s.attachContent}><Icon name="bar-chart-outline" size={16} color={theme.colors.textSecondary} /><Text style={s.attachText}> 투표</Text></View>
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
