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
} from 'react-native';
import {useApp} from '../context/AppContext';

const AVATARS = ['🧔', '👨', '👴', '🧑', '👨‍🦳', '👨‍🍳', '💪', '🏕️', '⛺', '🎮', '🎸', '📚'];

export default function EditProfileScreen({navigation}: any) {
  const {state, dispatch} = useApp();
  const [nickname, setNickname] = useState(state.user.nickname);
  const [bio, setBio] = useState(state.user.bio);
  const [avatar, setAvatar] = useState(state.user.avatar);

  const handleSave = () => {
    if (!nickname.trim()) {
      Alert.alert('알림', '닉네임을 입력해주세요.');
      return;
    }
    dispatch({
      type: 'UPDATE_PROFILE',
      updates: {nickname: nickname.trim(), bio: bio.trim(), avatar},
    });
    Alert.alert('완료', '프로필이 수정되었습니다.', [
      {text: '확인', onPress: () => navigation.goBack()},
    ]);
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.cancelText}>취소</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>프로필 수정</Text>
        <TouchableOpacity onPress={handleSave}>
          <Text style={styles.saveText}>저장</Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        {/* Avatar */}
        <View style={styles.avatarSection}>
          <TouchableOpacity
            style={styles.currentAvatar}
            onPress={() => {
              Alert.alert('프로필 사진', '프로필 사진을 변경하시겠습니까?', [
                {
                  text: '갤러리에서 선택',
                  onPress: async () => {
                    try {
                      const {pickImage} = require('../services/storageService');
                      const uri = await pickImage();
                      if (uri) {
                        Alert.alert('알림', '프로필 사진이 선택되었습니다.\n(Firebase 연동 후 업로드됩니다)');
                      }
                    } catch {}
                  },
                },
                {text: '아이콘 선택하기', style: 'cancel'},
              ]);
            }}>
            <Text style={styles.currentAvatarText}>{avatar}</Text>
            <View style={styles.cameraIcon}>
              <Text style={styles.cameraIconText}>📷</Text>
            </View>
          </TouchableOpacity>
          <Text style={styles.avatarLabel}>프로필 아이콘 선택</Text>
          <View style={styles.avatarGrid}>
            {AVATARS.map(a => (
              <TouchableOpacity
                key={a}
                style={[
                  styles.avatarOption,
                  avatar === a && styles.avatarOptionActive,
                ]}
                onPress={() => setAvatar(a)}>
                <Text style={styles.avatarOptionText}>{a}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Nickname */}
        <View style={styles.field}>
          <Text style={styles.fieldLabel}>닉네임</Text>
          <TextInput
            style={styles.fieldInput}
            value={nickname}
            onChangeText={setNickname}
            maxLength={12}
            placeholder="닉네임을 입력하세요"
            placeholderTextColor="#ccc"
          />
          <Text style={styles.charCount}>{nickname.length}/12</Text>
        </View>

        {/* Bio */}
        <View style={styles.field}>
          <Text style={styles.fieldLabel}>자기소개</Text>
          <TextInput
            style={[styles.fieldInput, styles.bioInput]}
            value={bio}
            onChangeText={setBio}
            maxLength={50}
            placeholder="간단한 자기소개를 입력하세요"
            placeholderTextColor="#ccc"
            multiline
          />
          <Text style={styles.charCount}>{bio.length}/50</Text>
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
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: '#333',
  },
  saveText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#2D5BFF',
  },
  content: {
    padding: 20,
  },
  avatarSection: {
    alignItems: 'center',
    marginBottom: 32,
  },
  currentAvatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#F0F2F5',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
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
    backgroundColor: '#2D5BFF',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#fff',
  },
  cameraIconText: {
    fontSize: 14,
  },
  avatarLabel: {
    fontSize: 13,
    color: '#999',
    marginBottom: 14,
  },
  avatarGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 10,
  },
  avatarOption: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#F5F6F8',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarOptionActive: {
    backgroundColor: '#EBF0FF',
    borderWidth: 2,
    borderColor: '#2D5BFF',
  },
  avatarOptionText: {
    fontSize: 22,
  },
  field: {
    marginBottom: 24,
  },
  fieldLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: '#666',
    marginBottom: 8,
    letterSpacing: 0.3,
  },
  fieldInput: {
    backgroundColor: '#F5F6F8',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 15,
    color: '#333',
  },
  bioInput: {
    minHeight: 80,
    textAlignVertical: 'top',
  },
  charCount: {
    textAlign: 'right',
    fontSize: 11,
    color: '#ccc',
    marginTop: 4,
  },
});
