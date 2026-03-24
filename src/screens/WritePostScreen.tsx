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
} from 'react-native';

const BOARD_OPTIONS = ['부부관계', '자유게시판', '취미게시판'];

export default function WritePostScreen({navigation}: any) {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [selectedBoard, setSelectedBoard] = useState('');
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [showBoardPicker, setShowBoardPicker] = useState(false);

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
    // TODO: API 호출로 게시글 등록
    Alert.alert('완료', '게시글이 등록되었습니다.', [
      {text: '확인', onPress: () => navigation.goBack()},
    ]);
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.cancelText}>취소</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>글 작성</Text>
        <TouchableOpacity onPress={handleSubmit}>
          <Text style={styles.submitText}>등록</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.content}>
        {/* Board Selector */}
        <TouchableOpacity
          style={styles.boardSelector}
          onPress={() => setShowBoardPicker(!showBoardPicker)}>
          <Text style={styles.boardSelectorText}>
            📋 {selectedBoard || '게시판 선택'}
          </Text>
          <Text style={styles.boardArrow}>▼</Text>
        </TouchableOpacity>

        {showBoardPicker && (
          <View style={styles.boardPicker}>
            {BOARD_OPTIONS.map(board => (
              <TouchableOpacity
                key={board}
                style={[
                  styles.boardOption,
                  selectedBoard === board && styles.boardOptionActive,
                ]}
                onPress={() => {
                  setSelectedBoard(board);
                  setShowBoardPicker(false);
                }}>
                <Text
                  style={[
                    styles.boardOptionText,
                    selectedBoard === board && styles.boardOptionTextActive,
                  ]}>
                  {board}
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

        {/* Content */}
        <TextInput
          style={styles.contentInput}
          placeholder="내용을 입력하세요..."
          placeholderTextColor="#ccc"
          value={content}
          onChangeText={setContent}
          multiline
          textAlignVertical="top"
        />

        {/* Attachments */}
        <View style={styles.attachments}>
          <TouchableOpacity style={styles.attachBtn}>
            <Text style={styles.attachText}>📷 사진</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.attachBtn}>
            <Text style={styles.attachText}>🎥 영상</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.attachBtn}>
            <Text style={styles.attachText}>📊 투표</Text>
          </TouchableOpacity>
        </View>

        {/* Anonymous Toggle */}
        <View style={styles.anonToggle}>
          <Switch
            value={isAnonymous}
            onValueChange={setIsAnonymous}
            trackColor={{false: '#ddd', true: '#2D5BFF'}}
            thumbColor="#fff"
          />
          <Text style={styles.anonText}>익명으로 작성</Text>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    height: 50,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  cancelText: {
    fontSize: 15,
    color: '#999',
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
  content: {
    flex: 1,
    padding: 16,
  },
  boardSelector: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    borderRadius: 10,
    padding: 14,
    marginBottom: 16,
  },
  boardSelectorText: {
    fontSize: 14,
    color: '#666',
  },
  boardArrow: {
    fontSize: 12,
    color: '#999',
  },
  boardPicker: {
    backgroundColor: '#f9f9f9',
    borderRadius: 10,
    marginBottom: 16,
    overflow: 'hidden',
  },
  boardOption: {
    padding: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
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
    fontWeight: '600',
  },
  titleInput: {
    fontSize: 18,
    fontWeight: '700',
    color: '#333',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    paddingBottom: 12,
    marginBottom: 16,
  },
  contentInput: {
    flex: 1,
    fontSize: 15,
    color: '#444',
    lineHeight: 22,
  },
  attachments: {
    flexDirection: 'row',
    gap: 10,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  attachBtn: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
  },
  attachText: {
    fontSize: 13,
    color: '#666',
  },
  anonToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginTop: 16,
  },
  anonText: {
    fontSize: 14,
    color: '#666',
  },
});
