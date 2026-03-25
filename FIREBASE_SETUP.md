# Firebase 설정 가이드

## 1. Firebase Console 프로젝트 생성

1. [Firebase Console](https://console.firebase.google.com/) 접속
2. "프로젝트 추가" 클릭
3. 프로젝트 이름: `DadCommunity` (아빠의 다락방)
4. Google Analytics 활성화 (선택)

## 2. Android 앱 등록

1. Firebase Console > 프로젝트 설정 > 앱 추가 > Android
2. 패키지 이름: `com.dadcommunity` (android/app/build.gradle의 applicationId 확인)
3. `google-services.json` 다운로드
4. 파일을 `android/app/google-services.json`에 배치

## 3. iOS 앱 등록

1. Firebase Console > 앱 추가 > iOS
2. Bundle ID: Xcode에서 확인 (보통 `com.dadcommunity`)
3. `GoogleService-Info.plist` 다운로드
4. 파일을 `ios/DadCommunity/GoogleService-Info.plist`에 배치
5. Xcode에서 프로젝트에 파일 추가 (Copy items if needed 체크)

## 4. Firebase 서비스 활성화

Firebase Console에서 다음 서비스를 활성화하세요:

### Authentication
- 로그인 방법 > Google 활성화
- (선택) 카카오/네이버는 Custom Token 방식으로 별도 서버 필요

### Cloud Firestore
- 데이터베이스 만들기 > 프로덕션 모드
- `firestore.rules` 파일의 규칙을 Firebase Console에 배포

### Storage
- Storage 활성화
- 보안 규칙 설정

### Cloud Messaging
- 자동 활성화됨 (별도 설정 불필요)

## 5. Google Sign-In 설정

1. Firebase Console > 프로젝트 설정 > 일반
2. Web Client ID 복사
3. `src/services/authService.ts`에서 `YOUR_WEB_CLIENT_ID`를 교체

## 6. 빌드 및 실행

```bash
# Android
cd android && ./gradlew clean && cd ..
npx react-native run-android

# iOS
cd ios && pod install && cd ..
npx react-native run-ios
```

## 7. Firestore 인덱스

자동 생성되지만, 필요시 Firebase Console > Firestore > 인덱스에서 추가:
- posts: category(ASC), timestamp(DESC)
- posts: likes(DESC)
- chatRooms: members(ARRAY), lastMessageAt(DESC)
