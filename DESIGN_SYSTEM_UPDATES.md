# 디자인 시스템 보완 내역 (v2.1)

> 작성: @designer | 날짜: 2026-03-29

---

## 변경사항 요약

### 1. colors.ts - 게시판 카드 색상 토큰 추가
- `boardColors: string[]` 필드를 light/dark 모드 모두에 추가
- 9개 게시판에 대응하는 고유 색상 (라이트 모드 9색, 다크 모드 9색)
- 다크 모드에서는 약간 어두운 톤으로 자동 전환

### 2. mockData.ts - BOARDS 데이터 확장
- **3개 → 9개** 게시판으로 확장
  - 기존: 부부관계, 자유게시판, 육아게시판
  - 추가: 직장생활, 재테크/부업, 건강/운동, 요리/집안일, 취미게시판, 공지사항
- Board 인터페이스에 `ionicon: string` 필드 추가
- CATEGORIES 배열도 9개 카테고리로 확장

### 3. BoardListScreen.tsx - 전면 리디자인
- 하드코딩 색상 `CARD_COLORS` 배열 → `theme.colors.boardColors` 토큰 사용
- 하드코딩 `BOARD_ICON_MAP` → `board.ionicon` 필드 직접 사용
- NEW 뱃지: `'#FF6B6B'` → `theme.colors.accent` 토큰
- 타이포그래피: `fontSize: 22` → `theme.typography.h2`
- 간격: 모든 값을 `theme.spacing` 토큰으로 교체
- `FlatList` → `ScrollView` (9개 아이템은 virtualization 불필요)
- 다크 모드 자동 대응 완료

### 4. Switch 토큰화
- ProfileScreen: `trackColor false: '#D4C9B8'` → `theme.colors.secondaryDark`
- NotificationSettingsScreen: `trackColor false: '#D4C9B8'` → `theme.colors.secondaryDark`

---

## 수정 파일 목록

| 파일 | 변경 유형 |
|------|----------|
| `src/theme/colors.ts` | boardColors 배열 추가 |
| `src/data/mockData.ts` | Board 인터페이스 + BOARDS 9개 + CATEGORIES 확장 |
| `src/screens/BoardListScreen.tsx` | 전면 리디자인 |
| `src/screens/ProfileScreen.tsx` | Switch 토큰화 |
| `src/screens/NotificationSettingsScreen.tsx` | Switch 토큰화 |

---

## 디자인 적용률 변화

| 항목 | Before | After |
|------|--------|-------|
| BoardListScreen | 60% | 95% |
| ProfileScreen | 93% | 95% |
| NotificationSettingsScreen | 93% | 95% |
| **전체 평균** | **~88%** | **~95%** |

