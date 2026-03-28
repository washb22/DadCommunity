# 미구현 화면 스펙 & 공지사항 기획

> 작성일: 2026-03-29
> 작성자: @planner
> 대상 태스크: Task #13 (미구현 화면 구현)
> 디자인 기준: DESIGN_SYSTEM.md v2.0

---

## 1. 알림 설정 화면 (NotificationSettingsScreen)

### 1-1. 화면 개요

| 항목 | 내용 |
|------|------|
| **파일명** | `src/screens/NotificationSettingsScreen.tsx` |
| **진입 경로** | 마이페이지 > 설정 > 알림 설정 |
| **네비게이션** | Stack Screen (slide_from_right) |
| **목적** | 알림 종류별 on/off 설정, 방해금지 시간대 설정 |

### 1-2. 화면 구조

```
SafeAreaView (background)
  Header: "알림 설정" + 뒤로가기
  ScrollView
    ┌─ 섹션: 전체 알림 ─────────────────────────┐
    │ [bell-outline]  푸시 알림          [Switch] │
    │  caption: "끄면 모든 푸시 알림이 중지됩니다" │
    └────────────────────────────────────────────┘

    ┌─ 섹션: 활동 알림 ─────────────────────────┐
    │ [heart-outline]   좋아요 알림      [Switch] │
    │ [chatbubble-outline] 댓글 알림     [Switch] │
    │ [person-add-outline] 팔로우 알림   [Switch] │
    └────────────────────────────────────────────┘

    ┌─ 섹션: 채팅 알림 ─────────────────────────┐
    │ [mail-outline]  새 메시지 알림     [Switch] │
    └────────────────────────────────────────────┘

    ┌─ 섹션: 커뮤니티 알림 ─────────────────────┐
    │ [megaphone-outline] 공지사항 알림   [Switch] │
    │ [trending-up-outline] 인기글 알림   [Switch] │
    └────────────────────────────────────────────┘

    ┌─ 섹션: 방해금지 ──────────────────────────┐
    │ [moon-outline]  방해금지 모드       [Switch] │
    │  caption: "설정한 시간에는 알림을 받지 않습니다" │
    │  [시작 시간]  22:00    [종료 시간]  07:00   │
    │  (TimePicker, 방해금지 ON일 때만 표시)       │
    └────────────────────────────────────────────┘
```

### 1-3. 데이터 구조 (Firestore)

```typescript
// users/{uid}/settings/notifications
interface NotificationSettings {
  pushEnabled: boolean;        // 전체 푸시 on/off (기본: true)
  likeEnabled: boolean;        // 좋아요 알림 (기본: true)
  commentEnabled: boolean;     // 댓글 알림 (기본: true)
  followEnabled: boolean;      // 팔로우 알림 (기본: true)
  chatEnabled: boolean;        // 채팅 알림 (기본: true)
  noticeEnabled: boolean;      // 공지사항 알림 (기본: true)
  popularEnabled: boolean;     // 인기글 알림 (기본: false)
  dndEnabled: boolean;         // 방해금지 모드 (기본: false)
  dndStart: string;            // 방해금지 시작 "22:00" (기본: "22:00")
  dndEnd: string;              // 방해금지 종료 "07:00" (기본: "07:00")
}
```

### 1-4. 동작 규칙

1. **전체 푸시 OFF** → 하위 모든 Switch 비활성(disabled) 처리, 회색으로 표시
2. **방해금지 모드** → ON 시 시간 선택 UI 노출 (LayoutAnimation으로 부드럽게)
3. **변경 즉시 저장**: Switch 토글 시 Firestore에 즉시 반영 (debounce 300ms)
4. **초기 로딩**: Firestore에서 설정값 로드, 없으면 기본값 사용
5. **FCM 토픽 연동**: pushEnabled OFF 시 FCM 토픽 구독 해제, ON 시 재구독

### 1-5. 스타일 가이드

- 섹션 카드: `surface` 배경, `radius.md (12px)`, `marginHorizontal: 16px`, `marginBottom: 8px`
- 섹션 제목: `overline` (11px, SemiBold), `textTertiary`, `letterSpacing: 0.5`
- 아이템 행: `paddingVertical: 14px`, `paddingHorizontal: 16px`, 아이콘 20px + 라벨 + Switch
- 캡션 텍스트: `captionSmall` (12px), `textTertiary`, `marginTop: 4px`
- Switch: `trackColor off=#D4C9B8`, `on=#3D5A80`, `thumbColor=#FFFFFF`
- 구분선: `border` 색상, 1px, 아이템 사이

---

## 2. 이용약관 화면 (TermsScreen)

### 2-1. 화면 개요

| 항목 | 내용 |
|------|------|
| **파일명** | `src/screens/TermsScreen.tsx` |
| **진입 경로** | 마이페이지 > 정보 > 이용약관 |
| **네비게이션** | Stack Screen (slide_from_right) |
| **목적** | 서비스 이용약관 전문 표시 |

### 2-2. 화면 구조

```
SafeAreaView (background)
  Header: "이용약관" + 뒤로가기
  ScrollView (paddingHorizontal: 16px, paddingVertical: 20px)
    ┌─ 상단 메타 정보 ──────────────────────────┐
    │ 시행일: 2026년 3월 1일                      │
    │ 최종 수정일: 2026년 3월 1일                  │
    └────────────────────────────────────────────┘

    ┌─ 목차 (터치 시 해당 섹션으로 스크롤) ──────┐
    │ 제1조 (목적)                                │
    │ 제2조 (정의)                                │
    │ 제3조 (약관의 효력 및 변경)                  │
    │ 제4조 (서비스의 제공)                        │
    │ 제5조 (회원가입)                             │
    │ 제6조 (회원탈퇴 및 자격상실)                 │
    │ 제7조 (회원의 의무)                          │
    │ 제8조 (게시물의 관리)                        │
    │ 제9조 (저작권)                               │
    │ 제10조 (면책조항)                            │
    │ 제11조 (분쟁해결)                            │
    └────────────────────────────────────────────┘

    [각 조항 본문 - 아래 콘텐츠 참조]
```

### 2-3. 약관 콘텐츠

```
제1조 (목적)
본 약관은 아빠의 다락방(이하 "서비스")이 제공하는 모바일 커뮤니티 서비스의
이용 조건 및 절차, 회원과 서비스 간의 권리·의무를 규정함을 목적으로 합니다.

제2조 (정의)
① "서비스"란 아빠의 다락방이 제공하는 모바일 애플리케이션 및 관련 서비스를 말합니다.
② "회원"이란 본 약관에 동의하고 서비스에 가입한 이용자를 말합니다.
③ "게시물"이란 회원이 서비스에 작성한 글, 댓글, 이미지 등 일체의 콘텐츠를 말합니다.
④ "닉네임"이란 회원 식별을 위해 회원이 설정한 이름을 말합니다.

제3조 (약관의 효력 및 변경)
① 본 약관은 서비스 내 공지 또는 개별 통지를 통해 효력이 발생합니다.
② 서비스는 관련 법령에 위배되지 않는 범위에서 약관을 변경할 수 있으며,
   변경 시 7일 전 앱 내 공지합니다.
③ 회원이 변경된 약관에 동의하지 않는 경우 서비스 이용을 중단하고 탈퇴할 수 있습니다.

제4조 (서비스의 제공)
① 서비스는 다음의 기능을 제공합니다:
   1. 커뮤니티 게시판 (글 작성, 댓글, 좋아요 등)
   2. 1:1 채팅 및 그룹 채팅
   3. 프로필 및 활동 관리
   4. 알림 서비스
   5. 검색 서비스
② 서비스는 운영상 필요한 경우 사전 공지 후 서비스 내용을 변경할 수 있습니다.
③ 서비스는 정기 점검 등의 사유로 일시 중단될 수 있습니다.

제5조 (회원가입)
① 회원가입은 소셜 로그인(카카오, 네이버, 구글)을 통해 이루어집니다.
② 가입 시 자녀 정보(나이대), 관심사 등을 입력하며, 이는 맞춤 서비스 제공에 활용됩니다.
③ 허위 정보를 입력한 경우 서비스 이용이 제한될 수 있습니다.

제6조 (회원탈퇴 및 자격상실)
① 회원은 언제든 서비스 내에서 탈퇴를 요청할 수 있습니다.
② 탈퇴 시 작성한 게시물은 삭제되지 않으며, 닉네임은 "탈퇴한 회원"으로 표시됩니다.
③ 다음의 경우 서비스는 회원 자격을 제한 또는 정지할 수 있습니다:
   1. 타인의 명예를 훼손하거나 불이익을 주는 행위
   2. 서비스 운영을 방해하는 행위
   3. 음란물, 폭력적 콘텐츠를 게시하는 행위
   4. 상업적 광고를 무단으로 게시하는 행위
   5. 타인의 개인정보를 무단으로 수집·유포하는 행위

제7조 (회원의 의무)
① 회원은 관련 법령, 본 약관, 서비스 이용 안내를 준수해야 합니다.
② 회원은 타인의 권리를 존중하고 건전한 커뮤니티 문화를 유지해야 합니다.
③ 회원은 자신의 계정 정보를 안전하게 관리할 책임이 있습니다.

제8조 (게시물의 관리)
① 서비스는 다음에 해당하는 게시물을 사전 통보 없이 삭제하거나 비공개 처리할 수 있습니다:
   1. 법령에 위반되는 내용
   2. 음란, 폭력적 내용
   3. 타인의 명예를 훼손하는 내용
   4. 허위 사실을 유포하는 내용
   5. 상업적 광고·스팸
② 게시물에 대한 신고 접수 시 검토 후 24시간 이내에 조치합니다.

제9조 (저작권)
① 회원이 작성한 게시물의 저작권은 해당 회원에게 있습니다.
② 서비스는 회원의 게시물을 서비스 운영 목적(홍보, 서비스 개선 등)으로 사용할 수 있으며,
   이 경우 게시물의 내용을 변경하지 않습니다.
③ 타인의 저작물을 무단으로 게시한 경우 해당 회원이 모든 법적 책임을 부담합니다.

제10조 (면책조항)
① 서비스는 회원 간 분쟁에 대해 개입하지 않으며 이에 대한 책임을 지지 않습니다.
② 서비스는 천재지변, 시스템 장애 등 불가항력으로 인한 서비스 중단에 대해 책임을 지지 않습니다.
③ 회원이 게시한 정보의 정확성·신뢰성에 대해 서비스는 보증하지 않습니다.

제11조 (분쟁해결)
① 서비스와 회원 간 분쟁은 대한민국 법률을 적용합니다.
② 분쟁 발생 시 상호 협의를 통해 해결하며, 합의가 이루어지지 않을 경우
   서울중앙지방법원을 관할 법원으로 합니다.
```

### 2-4. 스타일 가이드

- 메타 정보: `captionSmall`, `textTertiary`, `marginBottom: 24px`
- 목차 영역: `surfaceElevated` 배경, `radius.md`, `padding: 16px`
- 목차 항목: `bodySmall`, `primary` 색상, `paddingVertical: 8px`, 터치 시 scrollTo
- 조항 제목: `h3` (17px, SemiBold), `textPrimary`, `marginTop: 24px`, `marginBottom: 8px`
- 조항 본문: `body` (15px, Regular), `textSecondary`, `lineHeight: 26px`
- 항목 들여쓰기: `paddingLeft: 16px`

---

## 3. 개인정보처리방침 화면 (PrivacyPolicyScreen)

### 3-1. 화면 개요

| 항목 | 내용 |
|------|------|
| **파일명** | `src/screens/PrivacyPolicyScreen.tsx` |
| **진입 경로** | 마이페이지 > 정보 > 개인정보처리방침 |
| **네비게이션** | Stack Screen (slide_from_right) |
| **목적** | 개인정보 수집·이용·보관·파기 등 처리 방침 안내 |

### 3-2. 화면 구조

이용약관과 동일한 레이아웃 (Header + ScrollView + 목차 + 본문)

### 3-3. 개인정보처리방침 콘텐츠

```
제1조 (개인정보의 수집 항목 및 방법)
① 서비스는 회원가입 및 서비스 제공을 위해 다음의 개인정보를 수집합니다:

[필수 수집 항목]
- 소셜 로그인 정보: 이름, 이메일, 프로필 사진 (카카오/네이버/구글 제공)
- 서비스 이용 기록: 접속 일시, IP 주소, 기기 정보

[선택 수집 항목]
- 닉네임, 프로필 사진 (직접 설정)
- 자녀 정보: 나이대, 성별, 자녀 수
- 관심사 카테고리
- 거주 지역 (v2 예정)

② 수집 방법: 소셜 로그인 API, 앱 내 직접 입력, 자동 수집 (서비스 이용 기록)

제2조 (개인정보의 수집 및 이용 목적)
수집한 개인정보는 다음의 목적으로 이용합니다:
① 회원 관리: 회원 식별, 가입·탈퇴 처리, 부정 이용 방지
② 서비스 제공: 맞춤 콘텐츠 추천, 커뮤니티 기능 제공, 알림 발송
③ 서비스 개선: 이용 통계 분석, 신규 서비스 개발
④ 안전한 환경: 부정 이용 탐지, 신고 처리, 분쟁 해결

제3조 (개인정보의 보유 및 이용 기간)
① 회원 탈퇴 시 즉시 파기합니다. 단, 다음의 경우 명시된 기간 동안 보관합니다:
   - 부정 이용 방지 목적: 탈퇴 후 30일
   - 전자상거래법에 따른 계약·결제 기록: 5년
   - 통신비밀보호법에 따른 통신사실 확인 자료: 3개월
② 보관 기간 경과 후 지체 없이 파기합니다.

제4조 (개인정보의 제3자 제공)
① 서비스는 원칙적으로 회원의 개인정보를 제3자에게 제공하지 않습니다.
② 다음의 경우 예외로 합니다:
   1. 회원이 사전에 동의한 경우
   2. 법령에 의거하여 수사기관의 요청이 있는 경우

제5조 (개인정보의 파기)
① 보유 기간이 경과하거나 처리 목적이 달성된 경우 지체 없이 파기합니다.
② 파기 방법:
   - 전자적 파일: 복구 불가능한 방법으로 영구 삭제
   - 문서: 분쇄 또는 소각

제6조 (이용자의 권리와 행사 방법)
① 회원은 언제든 자신의 개인정보를 열람, 수정, 삭제할 수 있습니다.
② 개인정보 수정: 앱 내 프로필 수정 기능 이용
③ 회원 탈퇴: 앱 내 탈퇴 기능 또는 고객센터 문의
④ 만 14세 미만 아동의 개인정보는 수집하지 않습니다.

제7조 (개인정보의 안전성 확보 조치)
서비스는 개인정보의 안전성 확보를 위해 다음의 조치를 취합니다:
① 기술적 조치: 데이터 암호화(Firebase 보안), 접근 권한 관리, 보안 프로그램 운영
② 관리적 조치: 개인정보 취급자 최소화, 정기 교육
③ 물리적 조치: 서버 접근 통제 (Google Cloud 인프라)

제8조 (쿠키 및 자동 수집 장치)
① 서비스는 앱 사용 편의를 위해 기기 식별자, 앱 사용 데이터를 자동 수집할 수 있습니다.
② 회원은 기기 설정을 통해 자동 수집을 거부할 수 있으나, 일부 서비스 이용이 제한될 수 있습니다.

제9조 (개인정보 보호 책임자)
개인정보 보호에 관한 문의는 아래 연락처로 문의해주세요:
- 이메일: privacy@dadcommunity.kr
- 고객센터: 앱 내 문의하기

제10조 (개인정보처리방침의 변경)
① 본 방침은 관련 법령 및 서비스 정책 변경에 따라 수정될 수 있습니다.
② 변경 시 7일 전 앱 내 공지하며, 중요 변경은 30일 전 공지합니다.

시행일: 2026년 3월 1일
```

### 3-4. 스타일 가이드

이용약관 화면(TermsScreen)과 동일한 스타일 적용.

> **구현 팁**: TermsScreen과 PrivacyPolicyScreen은 동일 레이아웃이므로,
> 공통 `LegalDocumentScreen` 컴포넌트를 만들고 콘텐츠만 props로 전달하는 구조를 권장합니다.

---

## 4. 문의하기 화면 (ContactScreen)

### 4-1. 화면 개요

| 항목 | 내용 |
|------|------|
| **파일명** | `src/screens/ContactScreen.tsx` |
| **진입 경로** | 마이페이지 > 정보 > 문의하기 |
| **네비게이션** | Stack Screen (slide_from_right) |
| **목적** | 버그 신고, 기능 제안, 일반 문의 등 사용자 피드백 수집 |

### 4-2. 화면 구조

```
SafeAreaView (background)
  Header: "문의하기" + 뒤로가기
  ScrollView (paddingHorizontal: 16px)
    ┌─ 문의 유형 선택 ──────────────────────────┐
    │ [카테고리 칩 가로 스크롤]                    │
    │  버그 신고 | 기능 제안 | 이용 문의 | 기타    │
    └────────────────────────────────────────────┘

    ┌─ 이메일 (자동 입력) ──────────────────────┐
    │ 라벨: "답변 받을 이메일"                     │
    │ TextInput: user.email (수정 가능)           │
    └────────────────────────────────────────────┘

    ┌─ 제목 ─────────────────────────────────────┐
    │ TextInput: "제목을 입력해주세요"              │
    │ 최대 50자, 우측 글자수 카운터                 │
    └────────────────────────────────────────────┘

    ┌─ 내용 ─────────────────────────────────────┐
    │ TextInput (multiline, minHeight: 200px)     │
    │ "문의 내용을 상세히 작성해주세요.             │
    │  버그 신고의 경우 발생 상황을 구체적으로       │
    │  알려주시면 빠른 해결에 도움이 됩니다."        │
    └────────────────────────────────────────────┘

    ┌─ 스크린샷 첨부 (선택) ─────────────────────┐
    │ [camera-outline] 스크린샷 첨부 (최대 3장)    │
    │ [이미지1] [이미지2] [+]                      │
    └────────────────────────────────────────────┘

    ┌─ 기기 정보 (자동 수집) ────────────────────┐
    │ caption: "문의 해결을 위해 기기 정보가        │
    │ 함께 전송됩니다."                            │
    │ 앱 버전: 1.0.0                              │
    │ OS: Android 14 / iOS 18                     │
    │ 기기: Galaxy S24 / iPhone 16                │
    └────────────────────────────────────────────┘

    [전송하기] - Primary Button (52px, full width)
```

### 4-3. 데이터 구조 (Firestore)

```typescript
// contacts/{autoId}
interface ContactInquiry {
  userId: string;
  email: string;
  category: 'bug' | 'feature' | 'usage' | 'other';
  title: string;
  content: string;
  images: string[];          // Storage URL 배열 (최대 3장)
  deviceInfo: {
    appVersion: string;
    os: string;
    osVersion: string;
    device: string;
  };
  status: 'pending' | 'in_review' | 'resolved';
  createdAt: Timestamp;
  resolvedAt?: Timestamp;
  adminReply?: string;
}
```

### 4-4. 동작 규칙

1. **유효성 검사**: 카테고리 필수, 제목 1자 이상, 내용 10자 이상
2. **이미지 첨부**: `react-native-image-picker` 사용, Storage 업로드 후 URL 저장
3. **전송 완료**: 성공 Alert → "문의가 접수되었습니다. 빠른 시일 내 답변드리겠습니다." → goBack()
4. **이메일 자동 입력**: Firebase Auth에서 가져온 이메일 prefill (수정 가능)
5. **기기 정보**: `Platform.OS`, `Platform.Version`, `DeviceInfo` (react-native-device-info) 또는 수동 구성
6. **중복 방지**: 전송 버튼 로딩 상태, 중복 터치 방지

### 4-5. 스타일 가이드

- 카테고리 칩: DESIGN_SYSTEM.md 4.7 카테고리 칩 스타일 적용
- 입력 필드: DESIGN_SYSTEM.md 4.3 텍스트 인풋 스타일 (`surfaceElevated` 배경, `radius.md`)
- 텍스트에리어: 투명 배경, `bodyLarge` (16px), `lineHeight: 26px`
- 이미지 미리보기: 72x72, `radius.md`, 삭제 버튼(X) 우상단
- 기기 정보 영역: `surfaceElevated` 배경, `radius.sm`, `captionSmall`, `textTertiary`
- 전송 버튼: Primary Button 스펙 (DESIGN_SYSTEM.md 4.1)

---

## 5. 공지사항 게시판 (NoticeScreen / 공지사항 기능)

### 5-1. 기능 개요

| 항목 | 내용 |
|------|------|
| **목적** | 서비스 공지, 업데이트, 이벤트, 점검 안내 등 운영진 공식 소통 채널 |
| **접근 경로** | 게시판 탭 > 공지사항 카테고리 |
| **권한** | 읽기: 모든 유저, 작성: 관리자(admin)만 |

### 5-2. 구현 방식

공지사항은 별도 화면을 만들지 않고, 기존 `BoardDetailScreen`을 활용합니다.

```
게시판 목록 (BoardListScreen)
├── 부부관계
├── 육아
├── ...
├── [공지사항] ← 최상단 또는 최하단에 고정 배치
│   icon: megaphone-outline
│   배경색: accent (#C4754B) 아이콘 영역
│   "NEW" 뱃지: 읽지 않은 공지가 있을 때 표시
└── → BoardDetailScreen (category: 'notice')
```

### 5-3. 공지사항 게시글 특수 처리

#### 게시판 목록에서의 표시

```
┌─ 공지사항 카테고리 아이템 ──────────────────────┐
│ [📢 아이콘 영역]   공지사항                       │
│  48x48            "서비스 소식과 업데이트"   [>]  │
│  accent 배경       caption, textSecondary        │
│  megaphone 아이콘                      [NEW 뱃지]│
└──────────────────────────────────────────────────┘
```

#### BoardDetailScreen에서의 공지사항 모드

```
기존 BoardDetailScreen에 다음 분기 추가:

if (category === 'notice') {
  - FAB(글쓰기 버튼) 숨김 (일반 유저)
  - FAB 표시 (관리자 유저: user.role === 'admin')
  - 게시글 카드에 공지 유형 뱃지 표시
  - 상단 고정 공지 (pinned) 지원
}
```

#### 공지사항 게시글 카드 (PostCard 변형)

```
┌─ 공지사항 PostCard ────────────────────────────┐
│ [고정📌] (pinned === true일 때)                  │
│ [유형 뱃지: 공지/업데이트/이벤트/점검]             │
│                                                  │
│ 제목 (h3, SemiBold)                              │
│ 본문 미리보기 2줄 (body, textSecondary)           │
│                                                  │
│ 2026.03.29  ·  조회 128                          │
└──────────────────────────────────────────────────┘
```

### 5-4. 데이터 구조

```typescript
// posts 컬렉션에 category: 'notice'로 저장
interface NoticePost {
  // 기존 Post 필드 모두 포함
  id: string;
  category: 'notice';           // 고정값
  title: string;
  text: string;
  images: string[];
  userId: string;               // admin userId
  userName: string;             // "운영팀" 또는 관리자 닉네임
  isAnonymous: false;           // 공지는 항상 실명

  // 공지 전용 필드
  noticeType: 'notice' | 'update' | 'event' | 'maintenance';
  pinned: boolean;              // 상단 고정 여부

  // 일반 필드
  timestamp: Timestamp;
  likeCount: number;
  commentCount: number;
  viewCount: number;            // 조회수 (공지에서 특히 유용)
}
```

### 5-5. 공지 유형별 뱃지 디자인

| 유형 | 라벨 | 배경색 | 텍스트색 |
|------|------|--------|----------|
| notice (공지) | 공지 | `#3D5A80` (primary) | `#FFFFFF` |
| update (업데이트) | 업데이트 | `#4B8C6B` (success) | `#FFFFFF` |
| event (이벤트) | 이벤트 | `#C4754B` (accent) | `#FFFFFF` |
| maintenance (점검) | 점검 | `#C44B4B` (error) | `#FFFFFF` |

뱃지 스타일: `fontSize: 11px`, `fontWeight: 600`, `paddingH: 8px`, `paddingV: 3px`, `borderRadius: 8px`

### 5-6. 홈 피드 연동

```
HomeFeedScreen 상단에 중요 공지 배너 표시:

┌─ 공지 배너 (pinned + 최신 1개) ──────────────┐
│ [megaphone] 서비스 점검 안내 (3/30 02:00~)  [>]│
│ backgroundColor: secondary (Warm Sand)         │
│ textColor: textPrimary                          │
│ 터치 시 → PostDetail(noticeId)                  │
│ [X] 닫기 (24시간 동안 미표시)                    │
└────────────────────────────────────────────────┘
```

### 5-7. 관리자 판별

```typescript
// Firestore users/{uid} 문서에 role 필드 추가
interface UserDoc {
  // 기존 필드...
  role: 'user' | 'admin';  // 기본값: 'user'
}

// 사용처
const isAdmin = state.user.role === 'admin';
```

### 5-8. 네비게이션 변경 사항

AppNavigator에 추가할 화면:

```typescript
// 새로 등록할 Stack Screen들
<Stack.Screen name="NotificationSettings" component={NotificationSettingsScreen} />
<Stack.Screen name="Terms" component={TermsScreen} />
<Stack.Screen name="PrivacyPolicy" component={PrivacyPolicyScreen} />
<Stack.Screen name="Contact" component={ContactScreen} />
```

ProfileScreen의 MENU_SECTIONS 변경:

```typescript
const MENU_SECTIONS = [
  {
    title: '나의 활동',
    items: [
      {icon: 'create-outline', label: '내가 쓴 글', screen: 'MyPosts'},
      {icon: 'chatbubble-outline', label: '내가 쓴 댓글', screen: 'MyComments'},
      {icon: 'bookmark-outline', label: '저장한 글', screen: 'SavedPosts'},
    ],
  },
  {
    title: '설정',
    items: [
      {icon: 'notifications-outline', label: '알림 설정', screen: 'NotificationSettings'}, // 변경
      {icon: 'ban-outline', label: '차단 관리', screen: 'BlockList'},
    ],
  },
  {
    title: '정보',
    items: [
      {icon: 'call-outline', label: '문의하기', screen: 'Contact'},              // 변경
      {icon: 'document-text-outline', label: '이용약관', screen: 'Terms'},        // 변경
      {icon: 'lock-closed-outline', label: '개인정보처리방침', screen: 'PrivacyPolicy'}, // 변경
    ],
  },
];
```

---

## 6. 구현 우선순위 및 의존성

| 순서 | 화면 | 난이도 | 의존성 |
|------|------|--------|--------|
| 1 | 이용약관 (TermsScreen) | 낮음 | 없음 (정적 콘텐츠) |
| 2 | 개인정보처리방침 (PrivacyPolicyScreen) | 낮음 | TermsScreen 공통 컴포넌트 재사용 |
| 3 | 알림 설정 (NotificationSettingsScreen) | 중간 | Firestore settings 하위 문서 |
| 4 | 문의하기 (ContactScreen) | 중간 | Storage (이미지), Firestore contacts |
| 5 | 공지사항 기능 | 중간 | BoardDetailScreen 분기, admin role |

### 공통 권장사항

- **이용약관 + 개인정보처리방침**: `LegalDocumentScreen` 공통 컴포넌트로 추출 (title, sections props)
- **약관 콘텐츠**: 하드코딩 대신 `src/data/legalContent.ts`에 별도 분리하여 유지보수 용이성 확보
- **공지사항**: 별도 화면 없이 기존 BoardDetailScreen의 category 분기로 처리 (코드 재사용 극대화)

---

*이 문서는 @builder가 Task #13 구현 시 참조할 화면 스펙입니다.*
*디자인 세부사항은 DESIGN_SYSTEM.md v2.0을 기준으로 합니다.*
