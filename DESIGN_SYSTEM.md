# DadCommunity (아빠의 다락방) 디자인 시스템 v2.0

---

## 1. 디자인 컨셉

### 무드/톤
**"든든한 아지트"** - 바깥에서는 강한 아빠지만, 이곳에서는 솔직해질 수 있는 나만의 다락방.
따뜻하면서도 신뢰감 있고, 남성적이지만 부드러운 느낌. 과하게 꾸미지 않되 세련된 인상을 주는 디자인.

### 디자인 키워드
1. **Grounded (안정감)** - 30-40대 남성이 신뢰할 수 있는 견고한 구조
2. **Warm Neutral (따뜻한 중립)** - 차갑지도 뜨겁지도 않은, 편안한 톤
3. **Clean Minimal (정돈된 미니멀)** - 불필요한 장식 없이 콘텐츠에 집중
4. **Quiet Confidence (조용한 자신감)** - 과시하지 않지만 품격 있는
5. **Breathable (여유)** - 충분한 여백으로 시각적 안정감

---

## 2. 컬러 시스템

### 라이트 모드

| 역할 | 컬러명 | HEX | 용도 |
|------|--------|-----|------|
| **Primary** | Slate Blue | `#3D5A80` | 헤더, 주요 버튼, 활성 탭, FAB |
| **Primary Light** | Soft Blue | `#5B7BA5` | 호버/프레스 상태, 보조 강조 |
| **Primary Dark** | Deep Navy | `#2C4463` | 텍스트 강조, 헤더 텍스트 |
| **Secondary** | Warm Sand | `#E8DED1` | 카테고리 칩, 보조 배경, 프로필 카드 |
| **Secondary Dark** | Mocha | `#C4B49A` | 보조 테두리, 비활성 요소 |
| **Accent** | Terracotta | `#C4754B` | 알림 뱃지, 하이라이트, NEW 표시 |
| **Accent Light** | Peach | `#F0C9A8` | 좋아요 활성, 부드러운 강조 |
| **Background** | Off White | `#F7F5F2` | 전체 배경 |
| **Surface** | White | `#FFFFFF` | 카드, 모달, 입력 필드 배경 |
| **Surface Elevated** | Warm Gray | `#F0EDE8` | 구분선 영역, 섹션 배경 |
| **Text Primary** | Charcoal | `#2A2A2A` | 제목, 본문 텍스트 |
| **Text Secondary** | Gray | `#6B6B6B` | 보조 텍스트, 메타 정보 |
| **Text Tertiary** | Light Gray | `#A3A3A3` | 플레이스홀더, 캡션 |
| **Border** | Pale Gray | `#E8E4DF` | 구분선, 카드 테두리 |
| **Error/Danger** | Brick Red | `#C44B4B` | 삭제, 에러, 신고 |
| **Success** | Forest Green | `#4B8C6B` | 성공, 완료, 온라인 상태 |

### 다크 모드

| 역할 | HEX | 비고 |
|------|-----|------|
| **Primary** | `#6B9FD4` | 밝기 올려 가독성 확보 |
| **Primary Light** | `#8BB8E0` | |
| **Accent** | `#D4915E` | 따뜻한 톤 유지 |
| **Background** | `#1A1A1E` | 순수 검정 아닌 따뜻한 다크 |
| **Surface** | `#242428` | 카드 배경 |
| **Surface Elevated** | `#2E2E34` | 올라간 레이어 |
| **Text Primary** | `#ECECEC` | |
| **Text Secondary** | `#9A9A9A` | |
| **Text Tertiary** | `#666666` | |
| **Border** | `#3A3A40` | |
| **Error** | `#E06060` | |
| **Success** | `#5EAD80` | |

### 컬러 선정 이유

- **Primary (Slate Blue `#3D5A80`)**: 기존 `#2D5BFF`는 너무 강렬하고 차가운 파란색. Slate Blue는 남성적이면서도 차분하고 신뢰감을 줌. 블라인드 앱의 진중한 톤과 당근마켓의 따뜻함 사이 균형점
- **Secondary (Warm Sand `#E8DED1`)**: 차가운 회색 대신 따뜻한 베이지/샌드 톤으로 "다락방"의 아늑한 느낌 표현. 나무, 종이 같은 내추럴한 질감 연상
- **Accent (Terracotta `#C4754B`)**: 기존 `#FF4444` 빨간색은 공격적. 테라코타는 흙빛 오렌지로 따뜻하면서도 눈에 잘 띄는 포인트 컬러. "다락방"의 벽돌, 나무 느낌과 조화
- **Background (Off White `#F7F5F2`)**: 순백색 대신 약간의 황색을 더해 차가운 느낌 제거. 장시간 사용에도 눈이 편안
- **다크 모드**: 순수 검정(#000) 대신 약간 따뜻한 톤의 다크 그레이 사용. 아몰레드 디스플레이에서도 자연스럽고, 브랜드의 따뜻한 톤을 유지

---

## 3. 타이포그래피

### 추천 폰트

| 용도 | 1순위 | 2순위 | 비고 |
|------|-------|-------|------|
| **한글** | Pretendard | Spoqa Han Sans Neo | Pretendard는 9단계 웨이트, 뛰어난 가독성, 무료 상용 가능 |
| **영문/숫자** | Pretendard (내장) | Inter | Pretendard가 Inter 기반이라 영문도 자연스러움 |

### 사이즈 체계

| 토큰 | 크기 | 웨이트 | 행간 | 용도 |
|------|------|--------|------|------|
| **Display** | 32px | ExtraBold (800) | 40px | 스플래시 타이틀 |
| **H1** | 24px | Bold (700) | 32px | 화면 제목 (헤더) |
| **H2** | 20px | Bold (700) | 28px | 섹션 제목, 프로필 이름 |
| **H3** | 17px | SemiBold (600) | 24px | 카드 제목, 서브헤더 |
| **Body Large** | 16px | Regular (400) | 26px | 게시글 본문, 긴 텍스트 |
| **Body** | 15px | Regular (400) | 24px | 일반 본문, 댓글 |
| **Body Small** | 14px | Regular (400) | 22px | 리스트 아이템, 메뉴 |
| **Caption** | 13px | Medium (500) | 18px | 카테고리 칩, 탭 라벨 |
| **Caption Small** | 12px | Medium (500) | 16px | 타임스탬프, 메타 정보 |
| **Overline** | 11px | SemiBold (600) | 14px | 뱃지, 섹션 라벨, 카운터 |

### 폰트 웨이트 체계

| 웨이트 | 값 | 용도 |
|--------|-----|------|
| Regular | 400 | 본문 텍스트 |
| Medium | 500 | 보조 정보, 캡션, 버튼 보조 |
| SemiBold | 600 | 탭, 카테고리, 강조 본문 |
| Bold | 700 | 제목, 사용자 이름, 주요 버튼 |
| ExtraBold | 800 | 디스플레이, 숫자 강조 (통계) |

### 타이포그래피 원칙
- `letterSpacing: -0.3` ~ `-0.5` 로 한글 자간 살짝 좁힘 (H1, H2)
- 본문 텍스트는 자간 조정 없이 기본값 사용
- 숫자는 tabular figures 사용 (정렬 용도)

---

## 4. 컴포넌트 디자인 가이드

### 4.1 버튼

#### Primary Button
```
높이: 52px
borderRadius: 14px
backgroundColor: #3D5A80
textColor: #FFFFFF
fontSize: 16px, fontWeight: 700
shadow: 0 4px 12px rgba(61, 90, 128, 0.25)
pressed: backgroundColor #2C4463, scale 0.98
```

#### Secondary Button
```
높이: 48px
borderRadius: 12px
backgroundColor: #E8DED1
textColor: #3D5A80
fontSize: 15px, fontWeight: 600
border: none
pressed: backgroundColor #D4C9B8
```

#### Ghost Button (Outline)
```
높이: 44px
borderRadius: 12px
backgroundColor: transparent
borderWidth: 1.5px
borderColor: #E8E4DF
textColor: #6B6B6B
fontSize: 14px, fontWeight: 600
pressed: backgroundColor #F7F5F2
```

#### Text Button
```
padding: 8px 12px
textColor: #3D5A80
fontSize: 14px, fontWeight: 600
pressed: opacity 0.6
```

#### Danger Button
```
동일 Primary 스펙, backgroundColor: #C44B4B
```

### 4.2 카드 컴포넌트

#### 게시글 카드 (PostCard)
```
backgroundColor: #FFFFFF
borderRadius: 16px
padding: 18px
marginHorizontal: 16px
marginBottom: 10px
shadow: 0 2px 8px rgba(42, 42, 42, 0.06)
border: 1px solid #E8E4DF (미세한 테두리로 경계 명확화)

[아바타(40px)] [닉네임 Bold 14px / 시간 Caption 12px]  [익명뱃지]
[제목 SemiBold 16px - 1줄 말줄임]
[본문 Regular 15px #6B6B6B - 3줄 말줄임]
─────────── (borderTop: #F0EDE8) ───────────
[좋아요]    [댓글]    [저장]     (gap: 24px)
```

#### 프로필 카드
```
backgroundColor: #FFFFFF
borderRadius: 20px
padding: 24px
shadow: 0 4px 16px rgba(42, 42, 42, 0.08)

통계 영역: 수치에 Primary 컬러, ExtraBold 웨이트
수정 버튼: Secondary 스타일 (Warm Sand 배경)
```

#### 게시판 아이템 카드
```
backgroundColor: transparent
paddingVertical: 16px
paddingHorizontal: 16px
borderBottom: 1px solid #E8E4DF

아이콘 영역: 48x48, borderRadius 14px, 각 게시판 고유 배경색
```

### 4.3 입력 필드

#### 텍스트 인풋
```
높이: 48px
borderRadius: 12px
backgroundColor: #F0EDE8
paddingHorizontal: 16px
fontSize: 15px
color: #2A2A2A
placeholderColor: #A3A3A3
border: none (기본)
border: 2px solid #3D5A80 (포커스)
border: 2px solid #C44B4B (에러)
transition: border 200ms
```

#### 텍스트에리어 (글 작성)
```
backgroundColor: transparent
fontSize: 16px
lineHeight: 26px
color: #2A2A2A
placeholderColor: #A3A3A3
minHeight: 200px
```

#### 검색바
```
높이: 44px
borderRadius: 22px (pill shape)
backgroundColor: #F0EDE8
paddingHorizontal: 18px
아이콘: 왼쪽 돋보기, #A3A3A3
```

#### 댓글 입력
```
높이: 44px
borderRadius: 22px (pill shape)
backgroundColor: #F0EDE8
전송 버튼: 44px pill, Primary 컬러
```

### 4.4 하단 탭바

```
높이: 68px (Safe Area 별도)
backgroundColor: #FFFFFF
borderTop: 1px solid #E8E4DF
shadow: 0 -2px 12px rgba(0, 0, 0, 0.04)
paddingBottom: 10px
paddingTop: 10px

탭 아이콘: SVG 아이콘 사용 (이모지 제거)
  - 비활성: #A3A3A3, stroke width 1.5
  - 활성: #3D5A80, stroke width 2, filled

탭 라벨:
  - 비활성: 11px, Medium, #A3A3A3
  - 활성: 11px, Bold, #3D5A80

아이콘-라벨 간격: 4px
활성 탭 인디케이터: 없음 (아이콘+라벨 컬러 변화로 충분)
```

**추천 아이콘 (react-native-vector-icons 또는 SVG)**
| 탭 | 비활성 | 활성 |
|----|--------|------|
| 홈 | home-outline | home |
| 게시판 | clipboard-outline | clipboard |
| 채팅 | chatbubble-outline | chatbubble |
| 마이 | person-outline | person |

### 4.5 헤더

```
높이: 56px
backgroundColor: #FFFFFF (기존 파란 배경 제거)
borderBottom: 1px solid #E8E4DF
paddingHorizontal: 16px

타이틀: H1 (24px, Bold, #2A2A2A), letterSpacing: -0.5
뒤로가기: chevron-left 아이콘, 24px, #2A2A2A
우측 액션: 24px 아이콘, #6B6B6B, gap 16px
```

**변경 포인트**: 기존 파란색 배경 헤더를 흰색 기반으로 변경하여 현대적이고 깔끔한 인상. 당근마켓, Reddit 등 주요 커뮤니티 앱 트렌드 반영.

### 4.6 아이콘 스타일

- **스타일**: Outlined (비활성) / Filled (활성) 듀얼 시스템
- **사이즈**: 20px (인라인), 24px (탭바/헤더), 48px (빈 상태)
- **굵기**: Stroke width 1.5px (일반), 2px (강조)
- **라이브러리**: `react-native-vector-icons/Ionicons` 또는 커스텀 SVG
- **이모지 사용 최소화**: 아바타 전용으로만 이모지 유지, 나머지는 모두 아이콘으로 교체

### 4.7 뱃지 & 칩

#### 카테고리 칩
```
비활성:
  backgroundColor: #F0EDE8
  textColor: #6B6B6B
  fontSize: 13px, fontWeight: 600
  paddingH: 14px, paddingV: 7px
  borderRadius: 20px

활성:
  backgroundColor: #3D5A80
  textColor: #FFFFFF
```

#### 알림 뱃지
```
backgroundColor: #C4754B
minWidth: 18px, height: 18px
borderRadius: 9px
textColor: #FFFFFF
fontSize: 10px, fontWeight: 700
```

#### 익명 뱃지
```
backgroundColor: #F0EDE8
textColor: #A3A3A3
fontSize: 11px, fontWeight: 600
paddingH: 8px, paddingV: 3px
borderRadius: 8px
```

#### 자녀 나이대 배지 (AgeBadge)
```
라이트 모드:
  backgroundColor: #F0C9A8 (accentLight)
  textColor: #C4754B (accent)
  fontSize: 11px, fontWeight: 600
  paddingH: 8px, paddingV: 3px
  borderRadius: 8px

다크 모드:
  backgroundColor: rgba(212, 145, 94, 0.2)
  textColor: #D4915E (dark accent)
```

**표시 텍스트**: "유아 아빠", "초등 아빠", "임신중" 등
**표시 위치**:
- 프로필 카드: 닉네임 우측 (userName과 같은 row)
- PostCard 헤더: 닉네임 우측 (익명 뱃지와 동일 위치)
- PostDetail 작성자 영역: 동일 위치

**규칙**: 익명 게시글에서는 나이대 배지 숨김. v2에서 "익명의 유아 아빠" 옵션 검토 예정.

#### 관심사 태그 (InterestChip)
```
라이트 모드:
  backgroundColor: #F0EDE8 (surfaceElevated)
  textColor: #6B6B6B (textSecondary)
  fontSize: 12px (captionSmall), fontWeight: 500
  paddingH: 10px, paddingV: 5px
  borderRadius: 999px (pill)

다크 모드:
  backgroundColor: #2E2E34 (dark surfaceElevated)
  textColor: #9A9A9A (dark textSecondary)
```

**표시 위치**: 프로필 카드 내부, "프로필 수정" 버튼과 통계 영역 사이
**레이아웃**: 수평 flexWrap, gap: 6px, maxLines: 2 (넘치면 +N 표시)

```
[프로필 상단 - 아바타 + 닉네임 + 나이대 배지]
[자기소개]
[프로필 수정 버튼]
[관심사 칩들: 육아 | 캠핑 | 재테크 | ...]
────────────────────────────────
[게시글 N | 받은 좋아요 N | 저장 N]
```

### 4.8 스위치/토글
```
trackColor (off): #D4C9B8
trackColor (on): #3D5A80
thumbColor: #FFFFFF
```

### 4.8.1 다크 모드 전환 (프로필 > 설정)
```
위치: ProfileScreen 설정 섹션
아이콘: moon-outline (Ionicons)
라벨: "다크 모드"
우측: Switch (4.8 스타일)

설명 텍스트 (caption, textTertiary):
  OFF 상태: "시스템 설정을 따릅니다"
  ON 상태: "항상 다크 모드를 사용합니다"

동작:
  OFF: useColorScheme() 시스템 감지 (기본값)
  ON: 강제 다크 모드 적용
```

### 4.9 FAB (글쓰기 버튼)
```
width: 56px, height: 56px
borderRadius: 16px (둥근 사각형 - 2026 트렌드)
backgroundColor: #3D5A80
shadow: 0 6px 16px rgba(61, 90, 128, 0.35)
아이콘: plus, 24px, #FFFFFF, stroke 2.5

위치: bottom 28px, right 20px
pressed: scale 0.92, shadow 축소
```

---

## 5. 레이아웃 원칙

### 5.1 간격 체계 (Spacing Scale)

4px 기반 체계:

| 토큰 | 값 | 용도 |
|------|-----|------|
| `xs` | 4px | 아이콘-텍스트 최소 간격 |
| `sm` | 8px | 요소 내부 미세 간격 |
| `md` | 12px | 리스트 아이템 간 간격, 칩 사이 |
| `base` | 16px | 기본 패딩, 카드 내부, 화면 좌우 마진 |
| `lg` | 20px | 섹션 간 간격 |
| `xl` | 24px | 카드 내부 넉넉한 패딩 |
| `2xl` | 32px | 큰 섹션 분리 |
| `3xl` | 40px | 화면 상하 여백 |
| `4xl` | 48px | 빈 상태 아이콘 등 특수 간격 |

### 5.2 모서리 둥글기 (Border Radius)

| 토큰 | 값 | 용도 |
|------|-----|------|
| `sm` | 8px | 뱃지, 작은 요소 |
| `md` | 12px | 버튼, 입력 필드, 첨부 버튼 |
| `lg` | 16px | 카드, FAB, 게시판 아이콘 |
| `xl` | 20px | 프로필 카드, 모달 |
| `pill` | 999px | 칩, 검색바, 댓글 입력 |
| `circle` | 50% | 아바타 |

### 5.3 그림자 / Elevation

| 레벨 | 값 | 용도 |
|------|-----|------|
| **Level 0** | none | 인라인 요소 |
| **Level 1** | `0 1px 3px rgba(42,42,42,0.06)` | 미세한 분리 (리스트 아이템) |
| **Level 2** | `0 2px 8px rgba(42,42,42,0.08)` | 카드 기본 |
| **Level 3** | `0 4px 16px rgba(42,42,42,0.12)` | 프로필 카드, 모달 |
| **Level 4** | `0 6px 16px rgba(61,90,128,0.35)` | FAB (Primary 컬러 그림자) |
| **Level 5** | `0 8px 32px rgba(42,42,42,0.16)` | 바텀시트, 오버레이 |

다크 모드에서는 그림자 대신 `border: 1px solid #3A3A40`으로 레이어 구분.

### 5.4 화면별 레이아웃 가이드

#### 홈 피드
```
SafeAreaView
  [Header - 흰색 배경, 타이틀 좌측, 아이콘 우측]
  [탭 바 - 최신/인기/팔로잉, 하단 2px 인디케이터]
  [카테고리 칩 - 수평 스크롤, paddingH 16px, gap 8px]
  [피드 리스트 - paddingV 12px]
    [PostCard - marginH 16px, gap 10px]
  [FAB - 우하단]
```

#### 게시글 상세
```
SafeAreaView
  [Header - 흰색, 뒤로가기 + 카테고리명 + 더보기]
  [스크롤]
    [게시글 영역 - padding 16px]
      [작성자 정보]
      [제목 H2]
      [본문 Body Large]
      [액션 바 - 좋아요/댓글/저장]
    [구분선 - 8px 높이 Surface Elevated]
    [댓글 섹션]
      [댓글 아이템 - paddingH 16px]
      [답글 - paddingLeft 56px, 배경 Surface Elevated]
  [댓글 입력 - 하단 고정, pill 인풋 + 전송 버튼]
```

#### 글 작성
```
SafeAreaView
  [Header - 취소 / 타이틀 / 등록]
  [스크롤]
    [게시판 선택 - Surface Elevated 배경, borderRadius 12px]
    [제목 입력 - 하단 구분선]
    [글자수 카운터 - 우측 정렬, Caption Small]
    [본문 입력 - 넉넉한 minHeight]
    [이미지 미리보기 - 72x72 그리드]
    [첨부 버튼 row - 아이콘 + 라벨]
    [익명 토글 - Switch + 설명]
```

#### 마이페이지
```
SafeAreaView
  [Header - 흰색]
  [스크롤]
    [프로필 카드 - margin 16px, borderRadius 20px, shadow Level 3]
      [아바타 + 닉네임 + 소개]
      [프로필 수정 버튼 - Secondary 스타일]
      [통계 3열 - 게시글/좋아요/저장]
    [메뉴 섹션들 - borderRadius 16px, margin 16px]
      [섹션 라벨 - Overline, text-transform uppercase]
      [메뉴 아이템 - 아이콘 + 라벨 + chevron-right]
    [로그아웃 - Danger 텍스트]
    [버전 정보 - Caption, 중앙 정렬]
```

#### 채팅 목록
```
SafeAreaView
  [Header]
  [채팅 리스트]
    [아바타(50px) + 닉네임/마지막메시지 + 시간/읽지않음뱃지]
```

#### 로그인
```
[상단 60% - 로고 + 타이틀 + 서브타이틀, 중앙 정렬]
[하단 40% - 소셜 로그인 버튼 스택]
  [카카오 - #FEE500, borderRadius 14px]
  [네이버 - #03C75A]
  [구글 - 흰색 + 테두리]
  [둘러보기 - 텍스트 링크]
```

---

## 6. 현재 앱 UI 분석 및 개선점

### 6.1 현재 상태 요약

현재 앱은 React Native + TypeScript 기반으로, 기본적인 커뮤니티 기능(피드, 게시판, 채팅, 프로필)이 구현되어 있음. 전반적으로 **기능은 탄탄하지만 디자인에서 개선이 필요한 부분**이 다수 존재.

### 6.2 주요 문제점 및 개선 방향

#### (1) 컬러: `#2D5BFF` 의존도 과다
- **문제**: Primary 컬러 `#2D5BFF`가 헤더 배경, FAB, 탭 활성, 통계 숫자, 스위치, 댓글 전송 등 거의 모든 곳에 동일하게 사용됨. 순수 파란색은 차갑고 기계적인 인상
- **개선**: 따뜻한 Slate Blue(`#3D5A80`)로 교체하고, 보조/강조 컬러를 추가하여 시각적 계층 구조 형성

#### (2) 헤더: 파란 배경 = 구식 패턴
- **문제**: `backgroundColor: '#2D5BFF'`인 파란색 헤더는 2020년대 초반 디자인. 2025-2026 트렌드는 흰색/투명 헤더
- **개선**: 흰색 배경 + 미세 하단 보더로 변경. 타이틀은 진한 텍스트로. 당근마켓, 블라인드, Reddit 모두 이 방식 사용

#### (3) 이모지 아이콘 남용
- **문제**: 탭바, 헤더, 게시판 목록 등 거의 모든 곳에 이모지 사용. 이모지는 OS별 렌더링이 달라 일관성 없음. 전문적이지 않은 인상
- **개선**: SVG 아이콘 또는 `react-native-vector-icons`로 교체. 아바타에만 이모지 유지

#### (4) 회색 톤의 차가움
- **문제**: `#F5F6F8`, `#F0F2F5`, `#F0F0F0` 등 순수 회색 계열만 사용. 차갑고 무미건조한 느낌
- **개선**: `#F7F5F2`, `#F0EDE8`, `#E8DED1` 등 따뜻한 톤의 그레이/베이지로 교체

#### (5) 카드 디자인 불일치
- **문제**: PostCard는 `borderRadius: 14`, ProfileCard는 `16`, 메뉴는 `14` 등 불규칙적. 그림자 값도 제각각
- **개선**: 통일된 radius/shadow 토큰 시스템 적용

#### (6) 타이포그래피 체계 부재
- **문제**: fontSize가 10~32px 범위에서 무체계적으로 사용됨. fontWeight도 '300', '500', '600', '700', '800' 혼재
- **개선**: 명확한 타이포그래피 스케일 정의 및 시맨틱 토큰 사용

#### (7) 간격 불일치
- **문제**: margin/padding이 3, 4, 6, 7, 8, 10, 12, 14, 16, 20, 28, 32 등 불규칙. `gap: 8`과 `marginRight: 0` 혼용
- **개선**: 4px 기반 spacing scale로 통일

#### (8) 반응형/접근성 미비
- **문제**: hitSlop이 일부에만 적용, 터치 타겟이 작은 곳 존재. 색상 대비 비율 WCAG 미충족 가능성
- **개선**: 최소 터치 타겟 44px, 색상 대비 4.5:1 이상 확보

#### (9) 다크 모드 미지원
- **문제**: 전체적으로 하드코딩된 컬러 값 사용, 다크 모드 전환 불가
- **개선**: 테마 토큰 기반 컬러 시스템으로 리팩토링, `useColorScheme` 활용

#### (10) 스플래시/로그인의 브랜드 일관성
- **문제**: 스플래시는 `#2D5BFF` 전면 배경인데, 나머지 화면과 톤이 크게 다름
- **개선**: 스플래시도 Off White 배경 + Primary 컬러 로고 조합으로 통일감 있게

---

## 7. 구현을 위한 테마 토큰 구조 (참고)

```typescript
// src/theme/colors.ts
export const colors = {
  light: {
    primary: '#3D5A80',
    primaryLight: '#5B7BA5',
    primaryDark: '#2C4463',
    secondary: '#E8DED1',
    secondaryDark: '#C4B49A',
    accent: '#C4754B',
    accentLight: '#F0C9A8',
    background: '#F7F5F2',
    surface: '#FFFFFF',
    surfaceElevated: '#F0EDE8',
    textPrimary: '#2A2A2A',
    textSecondary: '#6B6B6B',
    textTertiary: '#A3A3A3',
    border: '#E8E4DF',
    error: '#C44B4B',
    success: '#4B8C6B',
  },
  dark: {
    primary: '#6B9FD4',
    primaryLight: '#8BB8E0',
    primaryDark: '#4A7AAF',
    secondary: '#3D3630',
    secondaryDark: '#4A4238',
    accent: '#D4915E',
    accentLight: '#A06838',
    background: '#1A1A1E',
    surface: '#242428',
    surfaceElevated: '#2E2E34',
    textPrimary: '#ECECEC',
    textSecondary: '#9A9A9A',
    textTertiary: '#666666',
    border: '#3A3A40',
    error: '#E06060',
    success: '#5EAD80',
  },
};

// src/theme/spacing.ts
export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  base: 16,
  lg: 20,
  xl: 24,
  '2xl': 32,
  '3xl': 40,
  '4xl': 48,
};

// src/theme/typography.ts
export const typography = {
  display: { fontSize: 32, fontWeight: '800', lineHeight: 40 },
  h1: { fontSize: 24, fontWeight: '700', lineHeight: 32 },
  h2: { fontSize: 20, fontWeight: '700', lineHeight: 28 },
  h3: { fontSize: 17, fontWeight: '600', lineHeight: 24 },
  bodyLarge: { fontSize: 16, fontWeight: '400', lineHeight: 26 },
  body: { fontSize: 15, fontWeight: '400', lineHeight: 24 },
  bodySmall: { fontSize: 14, fontWeight: '400', lineHeight: 22 },
  caption: { fontSize: 13, fontWeight: '500', lineHeight: 18 },
  captionSmall: { fontSize: 12, fontWeight: '500', lineHeight: 16 },
  overline: { fontSize: 11, fontWeight: '600', lineHeight: 14 },
};

// src/theme/radius.ts
export const radius = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  pill: 999,
};

// src/theme/shadows.ts
export const shadows = {
  level1: { shadowColor: '#2A2A2A', shadowOpacity: 0.06, shadowRadius: 3, shadowOffset: { width: 0, height: 1 }, elevation: 1 },
  level2: { shadowColor: '#2A2A2A', shadowOpacity: 0.08, shadowRadius: 8, shadowOffset: { width: 0, height: 2 }, elevation: 3 },
  level3: { shadowColor: '#2A2A2A', shadowOpacity: 0.12, shadowRadius: 16, shadowOffset: { width: 0, height: 4 }, elevation: 6 },
  level4: { shadowColor: '#3D5A80', shadowOpacity: 0.35, shadowRadius: 16, shadowOffset: { width: 0, height: 6 }, elevation: 8 },
  level5: { shadowColor: '#2A2A2A', shadowOpacity: 0.16, shadowRadius: 32, shadowOffset: { width: 0, height: 8 }, elevation: 12 },
};
```

---

## 8. 디자인 적용 우선순위

| 순서 | 항목 | 영향도 | 난이도 |
|------|------|--------|--------|
| 1 | 테마 토큰 파일 생성 | 높음 | 낮음 |
| 2 | 헤더 컴포넌트 리디자인 (파란 배경 제거) | 높음 | 낮음 |
| 3 | 컬러 시스템 전면 교체 | 높음 | 중간 |
| 4 | 탭바 이모지 -> 아이콘 교체 | 중간 | 낮음 |
| 5 | PostCard 리디자인 | 높음 | 중간 |
| 6 | 타이포그래피 통일 | 중간 | 중간 |
| 7 | 간격/radius 토큰 적용 | 중간 | 중간 |
| 8 | 로그인/스플래시 리디자인 | 중간 | 낮음 |
| 9 | 다크 모드 지원 | 높음 | 높음 |
| 10 | 나머지 화면 순차 적용 | 중간 | 높음 |

---

*이 디자인 시스템은 "아빠의 다락방" 리뉴얼을 위한 가이드라인입니다.*
*2025-2026 모바일 앱 디자인 트렌드와 주요 커뮤니티 앱 분석을 기반으로 설계되었습니다.*
