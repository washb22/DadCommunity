// 불쾌한 콘텐츠 필터링 서비스
// Apple Guideline 1.2 - UGC 콘텐츠 필터링 요구사항 충족

const PROFANITY_PATTERNS = [
  // 욕설/비속어
  '시발', '씨발', 'ㅅㅂ', 'ㅆㅂ', '시바', '씨바',
  '개새끼', '개색끼', 'ㄱㅅㄲ', '개세끼',
  '병신', 'ㅂㅅ', '병싄',
  '지랄', 'ㅈㄹ',
  '닥쳐', '닥치',
  '꺼져',
  '미친놈', '미친년', '미친새끼',
  '또라이',
  '찐따',
  '좆', 'ㅈ같',
  '엿먹',
  // 성적 콘텐츠
  '야동', '포르노', '섹스',
  '자위',
  // 혐오 표현
  '한남충', '한녀충', '김치녀', '된장녀',
  '틀딱', '꼰대',
  // 차별 표현
  '장애인놈', '정신병자',
];

// 패턴을 이스케이프하여 정규식으로 변환
function escapeRegExp(str: string): string {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

const profanityRegex = new RegExp(
  PROFANITY_PATTERNS.map(escapeRegExp).join('|'),
  'gi',
);

export interface FilterResult {
  isClean: boolean;
  flaggedWords: string[];
  filteredText: string;
}

/**
 * 텍스트에서 부적절한 콘텐츠를 검사합니다.
 */
export function checkContent(text: string): FilterResult {
  const matches = text.match(profanityRegex);
  const flaggedWords = matches ? [...new Set(matches)] : [];

  return {
    isClean: flaggedWords.length === 0,
    flaggedWords,
    filteredText: text.replace(profanityRegex, match => '*'.repeat(match.length)),
  };
}

/**
 * 텍스트가 부적절한 콘텐츠를 포함하고 있는지 빠르게 검사합니다.
 */
export function containsProfanity(text: string): boolean {
  return profanityRegex.test(text);
}
