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
} from 'react-native';
import {useApp} from '../context/AppContext';

const BOARD_OPTIONS = [
  {label: '부부관계', category: '부부관계'},
  {label: '자유게시판', category: '자유'},
  {label: '취미게시판', category: '취미'},
  {label: '육아게시판', category: '육아'},
];

export default function WritePostScreen({navigation, route}: any) {
  const {state, dispatch} = useApp();

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

  const handleSubmit = () => {
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

    if (editMode && editPostId) {
      dispatch({
        type: 'UPDATE_POST',
        postId: editPostId,
        updates: {title: title.trim(), text: content.trim()},
      });
      Alert.alert('완료', '게시글이 수정되었습니다!', [
        {text: '확인', onPress: () => navigation.goBack()},
      ]);
    } else {
      dispatch({
        type: 'ADD_POST',
        post: {
          user: isAnonymous ? '익명의 아빠' : state.user.nickname,
          avatar: isAnonymous ? '🧔' : state.user.avatar,
          category: selectedBoard.category,
          title: title.trim(),
          text: content.trim(),
          isAnonymous,
        },
      });
      Alert.alert('완료', '게시글이 등록되었습니다!', [
        {text: '확인', onPress: () => navigation.goBack()},
      ]);
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
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={handleCancel} hitSlop={{top: 10, bottom: 10, left: 10, right: 10}}>
          <Text style={styles.cancelText}>취소</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{editMode ? '글 수정' : '글 작성'}</Text>
        <TouchableOpacity onPress={handleSubmit} hitSlop={{top: 10, bottom: 10, left: 10, right: 10}}>
          <Text
            style={[
              styles.submitText,
              (!title.trim() || !content.trim() || !selectedBoard) &&
                styles.submitTextDisabled,
            ]}>
            등록
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} keyboardShouldPersistTaps="handled">
        {/* Board Selector */}
        <TouchableOpacity
          style={styles.boardSelector}
          onPress={() => setShowBoardPicker(!showBoardPicker)}>
          <Text
            style={[
              styles.boardSelectorText,
              selectedBoard && styles.boardSelectorTextSelected,
            ]}>
            📋 {selectedBoard ? selectedBoard.label : '게시판 선택'}
          </Text>
          <Text style={styles.boardArrow}>{showBoardPicker ? '▲' : '▼'}</Text>
        </TouchableOpacity>

        {showBoardPicker && (
          <View style={styles.boardPicker}>
            {BOARD_OPTIONS.map(board => (
              <TouchableOpacity
                key={board.category}
                style={[
                  styles.boardOption,
                  selectedBoard?.category === board.category &&
                    styles.boardOptionActive,
                ]}
                onPress={() => {
                  setSelectedBoard(board);
                  setShowBoardPicker(false);
                }}>
                <Text
                  style={[
                    styles.boardOptionText,
                    selectedBoard?.category === board.category &&
                      styles.boardOptionTextActive,
                  ]}>
                  {board.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        )}

        {/* Title */}
        <TextInput
          style={styles.titleInput}
          placeholder="제목을 입력하세요"
          placeholderTextColor="#ccc"
          value={title}
          onChangeText={setTitle}
          maxLength={50}
        />

        {/* Character count */}
        <Text style={styles.charCount}>{title.length}/50</Text>

        {/* Content */}
        <TextInput
          style={styles.contentInput}
          placeholder="내용을 입력하세요...&#10;&#10;다른 아빠들에게 고민을 나누거나&#10;유용한 정보를 공유해보세요."
          placeholderTextColor="#ccc"
          value={content}
          onChangeText={setContent}
          multiline
          textAlignVertical="top"
        />

        {/* Image Previews */}
        {images.length > 0 && (
          <View style={styles.imagePreviewRow}>
            {images.map((uri, idx) => (
              <View key={idx} style={styles.imagePreview}>
                <TouchableOpacity
                  style={styles.imageRemoveBtn}
                  onPress={() => setImages(prev => prev.filter((_, i) => i !== idx))}>
                  <Text style={styles.imageRemoveText}>✕</Text>
                </TouchableOpacity>
              </View>
            ))}
          </View>
        )}

        {/* Attachments */}
        <View style={styles.attachments}>
          <TouchableOpacity
            style={styles.attachBtn}
            activeOpacity={0.7}
            onPress={handleImageAttach}>
            <Text style={styles.attachText}>📷 사진</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.attachBtn} activeOpacity={0.7}>
            <Text style={styles.attachText}>🎥 영상</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.attachBtn} activeOpacity={0.7}>
            <Text style={styles.attachText}>📊 투표</Text>
          </TouchableOpacity>
        </View>

        {/* Anonymous Toggle */}
        <View style={styles.anonToggle}>
          <Switch
            value={isAnonymous}
            onValueChange={setIsAnonymous}
            trackColor={{false: '#E0E0E0', true: '#2D5BFF'}}
            thumbColor="#fff"
          />
          <Text style={styles.anonText}>익명으로 작성</Text>
          <Text style={styles.anonDesc}>닉네임이 '익명의 아빠'로 표시됩니다</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    height: 52,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  cancelText: {
    fontSize: 15,
    color: '#999',
    fontWeight: '500',
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: '#333',
  },
  submitText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#2D5BFF',
  },
  submitTextDisabled: {
    color: '#CCC',
  },
  content: {
    flex: 1,
    padding: 16,
  },
  boardSelector: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#F5F6F8',
    borderRadius: 12,
    padding: 14,
    marginBottom: 16,
  },
  boardSelectorText: {
    fontSize: 14,
    color: '#999',
    fontWeight: '500',
  },
  boardSelectorTextSelected: {
    color: '#333',
  },
  boardArrow: {
    fontSize: 11,
    color: '#999',
  },
  boardPicker: {
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    marginBottom: 16,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#F0F0F0',
  },
  boardOption: {
    padding: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  boardOptionActive: {
    backgroundColor: '#EBF0FF',
  },
  boardOptionText: {
    fontSize: 14,
    color: '#666',
  },
  boardOptionTextActive: {
    color: '#2D5BFF',
    fontWeight: '700',
  },
  titleInput: {
    fontSize: 18,
    fontWeight: '700',
    color: '#333',
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
    paddingBottom: 12,
    marginBottom: 4,
  },
  charCount: {
    textAlign: 'right',
    fontSize: 11,
    color: '#ccc',
    marginBottom: 12,
  },
  contentInput: {
    fontSize: 15,
    color: '#444',
    lineHeight: 24,
    minHeight: 200,
  },
  attachments: {
    flexDirection: 'row',
    gap: 10,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
  },
  attachBtn: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: '#F5F6F8',
    borderRadius: 10,
  },
  attachText: {
    fontSize: 13,
    color: '#666',
    fontWeight: '500',
  },
  anonToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginTop: 20,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
  },
  anonText: {
    fontSize: 14,
    color: '#444',
    fontWeight: '600',
  },
  anonDesc: {
    fontSize: 11,
    color: '#bbb',
    flex: 1,
  },
  imagePreviewRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 12,
    flexWrap: 'wrap',
  },
  imagePreview: {
    width: 72,
    height: 72,
    borderRadius: 10,
    backgroundColor: '#F0F2F5',
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
    backgroundColor: '#FF4444',
    alignItems: 'center',
    justifyContent: 'center',
  },
  imageRemoveText: {
    fontSize: 10,
    color: '#fff',
    fontWeight: '700',
  },
});
