# Phase 2 디자인 적용 가이드

> @designer 작성 | @builder 실행용
> 이 문서는 디자인 시스템(DESIGN_SYSTEM.md)을 실제 코드에 적용하기 위한 구체적인 수정 가이드입니다.

---

## 1. 하드코딩 컬러값 → 테마 토큰 교체

모든 `'#fff'` 하드코딩을 `theme.colors.onPrimary`로 교체합니다.

| # | 파일 | 라인 | 현재 코드 | 변경 후 |
|---|------|------|----------|--------|
| 1 | `src/screens/HomeFeedScreen.tsx` | 400 | `color: '#fff'` | `color: theme.colors.onPrimary` |
| 2 | `src/screens/HomeFeedScreen.tsx` | 423 | `color: '#fff'` | `color: theme.colors.onPrimary` |
| 3 | `src/screens/LoginScreen.tsx` | 239 | `color: '#fff'` | `color: theme.colors.onPrimary` |
| 4 | `src/screens/PostDetailScreen.tsx` | 547 | `color="#fff"` | `color={theme.colors.onPrimary}` |
| 5 | `src/screens/PostDetailScreen.tsx` | 633 | `color: '#fff'` | `color: theme.colors.onPrimary` |
| 6 | `src/screens/PostDetailScreen.tsx` | 818 | `color: '#fff'` | `color: theme.colors.onPrimary` |
| 7 | `src/screens/WritePostScreen.tsx` | 315 | `thumbColor="#fff"` | `thumbColor={theme.colors.onPrimary}` |
| 8 | `src/screens/WritePostScreen.tsx` | 489 | `color: '#fff'` | `color: theme.colors.onPrimary` |

**참고**: PostDetailScreen.tsx:547의 `<ActivityIndicator>` 컬러는 JSX prop이므로 `color={theme.colors.onPrimary}` 형태로 변경. 단, 이 컴포넌트가 `makeStyles` 외부에 있으므로 `theme` 변수에 접근 가능한지 확인 필요 (현재 코드에서 `theme` 변수는 컴포넌트 내 `useTheme()`으로 접근 가능).

---

## 2. 하드코딩 사이즈/간격 → 테마 토큰 교체

| # | 파일 | 라인 | 현재 코드 | 변경 후 | 비고 |
|---|------|------|----------|--------|------|
| 1 | `src/components/PostCard.tsx` | 108 | `padding: 18` | `padding: theme.spacing.lg` | 18→20 (디자인 시스템 기준) |
| 2 | `src/components/PostCard.tsx` | 150 | `fontSize: 10` | `...theme.typography.overline` 또는 `fontSize: theme.typography.overline.fontSize` | 익명 뱃지 텍스트 |
| 3 | `src/components/PostCard.tsx` | 176 | `gap: 24` | `gap: theme.spacing.xl` | 값 동일(24), 토큰화 |
| 4 | `src/screens/PostDetailScreen.tsx` | 617 | `fontSize: 10` | `...theme.typography.overline` 스프레드 또는 `fontSize: theme.typography.overline.fontSize` | 익명 뱃지 |
| 5 | `src/screens/PostDetailScreen.tsx` | 744 | `paddingLeft: 60` | `paddingLeft: 56` | 디자인 시스템 권장값 (아바타 42+marginRight 12+여백 2) |
| 6 | `src/screens/BoardListScreen.tsx` | 114 | `marginTop: 3` | `marginTop: theme.spacing.xs` | 3→4 (4px 배수 체계) |
| 7 | `src/screens/ChatDetailScreen.tsx` | 254 | `fontSize: 10` | `...theme.typography.overline` 스프레드 | 메시지 시간 |
| 8 | `src/screens/OnboardingScreen.tsx` | 404 | `paddingBottom: 100` | `paddingBottom: theme.spacing['4xl'] * 2 + theme.spacing.xs` 또는 하드코딩 유지 | 바텀 버튼 높이 고려한 값이므로 유지 가능 |
| 9 | `src/screens/PostDetailScreen.tsx` | 438 | `marginLeft: 8` (인라인) | `marginLeft: theme.spacing.sm` | 인라인 스타일을 StyleSheet로 이동 권장 |

### Header.tsx 전면 리팩토링

`src/components/Header.tsx`는 일반 `StyleSheet.create`를 사용 중. `makeStyles(theme)` 패턴으로 전환해야 합니다.

**현재 (라인 59-80)**:
```tsx
const styles = StyleSheet.create({
  header: { height: 56, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16 },
  left: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  backBtn: { paddingRight: 4 },
  title: {},
  right: { flexDirection: 'row', gap: 14 },
});
```

**변경 후**:
```tsx
const makeStyles = (theme: Theme) =>
  StyleSheet.create({
    header: {
      height: 56,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: theme.spacing.base,        // 16 → 토큰
    },
    left: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: theme.spacing.sm,                          // 8 → 토큰
    },
    backBtn: {
      paddingRight: theme.spacing.xs,                 // 4 → 토큰
    },
    title: {},
    right: {
      flexDirection: 'row',
      gap: theme.spacing.base,                        // 14 → 16 (4px 배수)
    },
  });
```

컴포넌트 내부에서 `const s = makeStyles(theme);` 호출 추가 필요. `Theme` import도 추가.

**추가**: 우측 아이콘 색상을 `textPrimary` → `textSecondary`로 변경 (DESIGN_SYSTEM.md 4.5 헤더 스펙: "우측 액션: 24px 아이콘, #6B6B6B").

```tsx
// 라인 46, 50: color={theme.colors.textPrimary} → color={theme.colors.textSecondary}
```

---

## 3. 이모지 → Ionicons 교체 매핑표

### 3-1. PostDetailScreen.tsx - 게시글 액션 바

| 라인 | 현재 이모지 | Ionicons 이름 | 크기 | 색상 |
|------|-----------|-------------|------|------|
| 406 | `♥` (liked) | `heart` | 18 | `theme.colors.error` |
| 406 | `♡` (not liked) | `heart-outline` | 18 | `theme.colors.textTertiary` |
| 411 | `💬` | `chatbubble-outline` | 18 | `theme.colors.textTertiary` |
| 422 | `★ 저장됨` (saved) | `bookmark` | 18 | `theme.colors.accent` |
| 422 | `☆ 저장` (not saved) | `bookmark-outline` | 18 | `theme.colors.textTertiary` |
| 428 | `↗ 공유` | `share-outline` | 18 | `theme.colors.textTertiary` |

**변경 예시 (라인 398-429)**:
```tsx
// 기존: <Text style={[s.actionText, post.liked && s.actionActive]}>{post.liked ? '♥' : '♡'} {post.likes}</Text>
// 변경:
<View style={{flexDirection: 'row', alignItems: 'center', gap: theme.spacing.xs}}>
  <Icon name={post.liked ? 'heart' : 'heart-outline'} size={18} color={post.liked ? theme.colors.error : theme.colors.textTertiary} />
  <Text style={[s.actionText, post.liked && s.actionActive]}>{post.likes}</Text>
</View>
```

같은 패턴으로 댓글, 저장, 공유도 교체. `import Icon from 'react-native-vector-icons/Ionicons'`가 이미 있는지 확인 (현재 PostDetailScreen에는 없음 → 추가 필요).

### 3-2. PostDetailScreen.tsx - 댓글 좋아요

| 라인 | 현재 이모지 | Ionicons 이름 | 크기 | 색상 |
|------|-----------|-------------|------|------|
| 472 | `♥` / `♡` | `heart` / `heart-outline` | 14 | liked: `theme.colors.error`, default: `theme.colors.textSecondary` |

### 3-3. PostDetailScreen.tsx - 답글 취소

| 라인 | 현재 이모지 | Ionicons 이름 | 크기 | 색상 |
|------|-----------|-------------|------|------|
| 521 | `✕` | `close` | 16 | `theme.colors.textSecondary` |

### 3-4. HomeFeedScreen.tsx

| 라인 | 현재 이모지 | Ionicons 이름 | 크기 | 색상 | 비고 |
|------|-----------|-------------|------|------|------|
| 212 | `📋` (전체 카테고리) | 제거 | - | - | 카테고리 칩에서 아이콘 제거, 텍스트만 표시 |
| 281 | `categoryIconMap[cat]` (각 카테고리 이모지) | 제거 | - | - | 카테고리 칩은 텍스트만 표시하는 것이 디자인 시스템에 부합 |
| 292 | `icon="📭"` (EmptyState) | `mail-unread-outline` | 48 | `theme.colors.textTertiary` | EmptyState 컴포넌트는 이미 Ionicons Icon 사용 중 |

**EmptyState 수정**: HomeFeedScreen.tsx:292에서 `icon="📭"` → `icon="mail-unread-outline"` (EmptyState 컴포넌트가 이미 Ionicons `Icon`을 사용하므로 문자열만 변경하면 됨).

**카테고리 칩 이모지 제거**: 라인 212의 `categoryIconMap`과 라인 281의 `${categoryIconMap[cat]} ` 부분 제거.
```tsx
// 기존 (라인 212-213):
const categoryIconMap: Record<string, string> = {'전체': '📋'};
BOARDS.forEach(b => { categoryIconMap[b.category] = b.icon; });

// 삭제 또는 사용하지 않음

// 기존 (라인 281):
{categoryIconMap[cat] ? `${categoryIconMap[cat]} ` : ''}{cat}

// 변경:
{cat}
```

### 3-5. WritePostScreen.tsx

| 라인 | 현재 이모지 | Ionicons 이름 | 크기 | 색상 |
|------|-----------|-------------|------|------|
| 220 | `📋` (게시판 선택) | `clipboard-outline` | 16 | `theme.colors.textSecondary` |
| 222 | `▲` / `▼` (화살표) | `chevron-up` / `chevron-down` | 14 | `theme.colors.textSecondary` |
| 286 | `✕` (이미지 삭제) | `close` | 10 | `theme.colors.onPrimary` |
| 299 | `📷 사진` | `camera-outline` | 16 | `theme.colors.textSecondary` |
| 302 | `🎥 영상` | `videocam-outline` | 16 | `theme.colors.textSecondary` |
| 305 | `📊 투표` | `bar-chart-outline` | 16 | `theme.colors.textSecondary` |

**변경 예시 (첨부 버튼)**:
```tsx
// 기존:
<Text style={s.attachText}>📷 사진</Text>

// 변경:
<View style={{flexDirection: 'row', alignItems: 'center', gap: theme.spacing.xs}}>
  <Icon name="camera-outline" size={16} color={theme.colors.textSecondary} />
  <Text style={s.attachText}>사진</Text>
</View>
```

`import Icon from 'react-native-vector-icons/Ionicons'` 추가 필요 (현재 WritePostScreen에는 없음).

### 3-6. SearchScreen.tsx

| 라인 | 현재 이모지 | Ionicons 이름 | 크기 | 색상 |
|------|-----------|-------------|------|------|
| 79 | `✕` (검색 지우기) | `close-circle` | 18 | `theme.colors.textSecondary` |

`import Icon from 'react-native-vector-icons/Ionicons'` 이미 있음.

### 3-7. EditProfileScreen.tsx

| 라인 | 현재 이모지 | Ionicons 이름 | 크기 | 색상 |
|------|-----------|-------------|------|------|
| 102 | `📷` (카메라 오버레이) | `camera` | 14 | `theme.colors.onPrimary` |

`import Icon from 'react-native-vector-icons/Ionicons'` 추가 필요 (현재 없음).

### 3-8. BoardListScreen.tsx

| 라인 | 현재 이모지/텍스트 | Ionicons 이름 | 크기 | 색상 |
|------|-----------------|-------------|------|------|
| 20 | `board.icon` (게시판 아이콘, 이모지) | 아래 매핑표 참조 | 22 | `theme.colors.onPrimary` 또는 각 board 고유 색상 |
| 29 | `>` (텍스트 화살표) | `chevron-forward` | 18 | `theme.colors.textTertiary` |

**게시판 이모지 → Ionicons 매핑** (mockData.ts의 BOARDS 데이터 수정 필요):

| 게시판 | 현재 이모지 | Ionicons 이름 |
|--------|-----------|-------------|
| 공지사항 | (확인 필요) | `megaphone-outline` |
| 부부관계 | (확인 필요) | `heart-outline` |
| 자유게시판 | (확인 필요) | `chatbubbles-outline` |
| 취미게시판 | (확인 필요) | `game-controller-outline` |
| 육아게시판 | (확인 필요) | `people-outline` |
| 직장생활 | (확인 필요) | `briefcase-outline` |
| 재테크/부업 | (확인 필요) | `trending-up-outline` |
| 건강/운동 | (확인 필요) | `fitness-outline` |
| 요리/집안일 | (확인 필요) | `restaurant-outline` |

> mockData.ts의 BOARDS 배열에서 `icon` 필드를 이모지에서 Ionicons 이름으로 변경하고, BoardListScreen.tsx의 렌더링도 `<Text>` → `<Icon>` 컴포넌트로 교체합니다.

---

## 4. FAB (글쓰기 버튼) 수정

**파일**: `src/screens/HomeFeedScreen.tsx`

### 4-1. 스타일 수정 (라인 410-427)
```tsx
// 현재:
fab: {
  position: 'absolute',
  bottom: theme.spacing.xl,       // 24
  right: theme.spacing.lg,        // 20
  width: 56,
  height: 56,
  borderRadius: 28,               // ← 원형
  backgroundColor: theme.colors.primary,
  alignItems: 'center',
  justifyContent: 'center',
  ...theme.shadows.level4,
},
fabText: {
  fontSize: 28,
  color: '#fff',
  fontWeight: '300',
  marginTop: -2,
},

// 변경:
fab: {
  position: 'absolute',
  bottom: 28,                     // 디자인 시스템: 28px
  right: theme.spacing.lg,        // 20px (일치)
  width: 56,
  height: 56,
  borderRadius: theme.radius.lg,  // 16px (둥근 사각형)
  backgroundColor: theme.colors.primary,
  alignItems: 'center',
  justifyContent: 'center',
  ...theme.shadows.level4,
},
// fabText 스타일 삭제 (Icon으로 대체)
```

### 4-2. JSX 수정 (라인 330-336)
```tsx
// 현재:
<TouchableOpacity style={s.fab} onPress={...} activeOpacity={0.85}>
  <Text style={s.fabText}>+</Text>
</TouchableOpacity>

// 변경:
<TouchableOpacity style={s.fab} onPress={...} activeOpacity={0.85}>
  <Icon name="add" size={24} color={theme.colors.onPrimary} />
</TouchableOpacity>
```

`import Icon from 'react-native-vector-icons/Ionicons'` 추가 필요 (현재 HomeFeedScreen에는 없음).

---

## 5. 탭바 수정

**파일**: `src/navigation/AppNavigator.tsx`

### 5-1. 게시판 아이콘 변경 (라인 33)
```tsx
// 현재:
'게시판': {focused: 'grid', unfocused: 'grid-outline'},

// 변경:
'게시판': {focused: 'clipboard', unfocused: 'clipboard-outline'},
```

### 5-2. 아이콘 크기 변경 (라인 54)
```tsx
// 현재:
return <Icon name={iconName || 'ellipse-outline'} size={22} color={color} />;

// 변경:
return <Icon name={iconName || 'ellipse-outline'} size={24} color={color} />;
```

### 5-3. 탭바 스타일 수정 (라인 104-111)
```tsx
// 현재:
tabBar: {
  height: 64,
  paddingBottom: 10,
  paddingTop: 8,
  ...
},
tabLabel: {
  ...theme.typography.overline,
  marginTop: 2,
},

// 변경:
tabBar: {
  height: 68,                    // 64 → 68
  paddingBottom: 10,
  paddingTop: 10,                // 8 → 10
  ...
},
tabLabel: {
  ...theme.typography.overline,
  marginTop: theme.spacing.xs,   // 2 → 4
},
```

---

## 6. 알림 뱃지 수정

**파일**: `src/screens/ChatListScreen.tsx`

### 6-1. 뱃지 색상 (라인 199)
```tsx
// 현재:
backgroundColor: theme.colors.error,

// 변경:
backgroundColor: theme.colors.accent,
```

### 6-2. 뱃지 크기 (라인 198-200)
```tsx
// 현재:
minWidth: 20, height: 20,

// 변경:
minWidth: 18, height: 18,
```

### 6-3. 뱃지 borderRadius (라인 198)
```tsx
// 현재:
borderRadius: 10,

// 변경:
borderRadius: 9,    // height/2
```

---

## 7. 작업 순서 권장

1. **Header.tsx 리팩토링** (공통 컴포넌트, 모든 화면에 영향)
2. **하드코딩 '#fff' 전면 교체** (8곳, 단순 치환)
3. **하드코딩 사이즈/간격 교체** (10곳)
4. **FAB 수정** (HomeFeedScreen)
5. **탭바 수정** (AppNavigator)
6. **PostDetailScreen 이모지 → Ionicons** (가장 많은 이모지)
7. **WritePostScreen 이모지 → Ionicons**
8. **나머지 화면 이모지 교체** (HomeFeedScreen, SearchScreen, EditProfileScreen, BoardListScreen)
9. **알림 뱃지 수정** (ChatListScreen)

---

## 8. Icon import 추가가 필요한 파일

현재 `import Icon from 'react-native-vector-icons/Ionicons'`가 **없는** 파일 목록:

- `src/screens/HomeFeedScreen.tsx` (FAB, 카테고리 아이콘)
- `src/screens/PostDetailScreen.tsx` (액션 바, 댓글 좋아요)
- `src/screens/WritePostScreen.tsx` (첨부 버튼, 게시판 선택)
- `src/screens/EditProfileScreen.tsx` (카메라 아이콘)

이미 import가 **있는** 파일:
- `src/components/Header.tsx`
- `src/components/PostCard.tsx`
- `src/components/EmptyState.tsx`
- `src/screens/ProfileScreen.tsx`
- `src/screens/LoginScreen.tsx`
- `src/screens/OnboardingScreen.tsx`
- `src/screens/SearchScreen.tsx`
- `src/screens/NotificationScreen.tsx`
- `src/navigation/AppNavigator.tsx`

---

*Phase 2 완료 후, Phase 3에서 다크 모드 그림자→border 전환 로직 및 자녀 나이대 배지/관심사 태그 컴포넌트를 구현합니다.*
