/**
 * DadCommunity 완전 자동화 시드 스크립트
 * - Claude API로 게시글 + 댓글 자동 생성
 * - 시간 랜덤 분산
 * - Firestore REST API로 직접 쓰기
 *
 * 사용법:
 *   node scripts/auto-seed.js                  # 기본 10개 게시글 + 댓글
 *   node scripts/auto-seed.js --posts 20       # 20개 게시글
 *   node scripts/auto-seed.js --no-comments    # 댓글 없이 게시글만
 *   node scripts/auto-seed.js --days 14        # 최근 14일에 분산
 */

const https = require('https');
const fs = require('fs');
const os = require('os');

// ─── 설정 ───
const PROJECT_ID = 'dadcommunity-ae202';
const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY;
if (!ANTHROPIC_API_KEY) {
  console.error('❌ ANTHROPIC_API_KEY 환경변수가 설정되지 않았습니다.');
  process.exit(1);
}

// CLI 인자 파싱
const args = process.argv.slice(2);
const getArg = (name, def) => {
  const idx = args.indexOf(`--${name}`);
  return idx >= 0 && args[idx + 1] ? args[idx + 1] : def;
};
const POST_COUNT = parseInt(getArg('posts', '10'));
const SPREAD_DAYS = parseInt(getArg('days', '7'));
const NO_COMMENTS = args.includes('--no-comments');
const COMMENTS_PER_POST_MIN = 1;
const COMMENTS_PER_POST_MAX = 4;

// ─── 데모 유저 ───
const DEMO_USERS = [
  {userId: 'demo_dad_01', user: '행복한아빠', avatar: '😊'},
  {userId: 'demo_dad_02', user: '주말아빠', avatar: '🏖️'},
  {userId: 'demo_dad_03', user: '육아전사', avatar: '💪'},
  {userId: 'demo_dad_04', user: '요리하는아빠', avatar: '👨‍🍳'},
  {userId: 'demo_dad_05', user: '캠핑가는아빠', avatar: '⛺'},
  {userId: 'demo_dad_06', user: '직장인아빠', avatar: '💼'},
  {userId: 'demo_dad_07', user: '운동하는아빠', avatar: '🏋️'},
  {userId: 'demo_dad_08', user: '독서하는아빠', avatar: '📚'},
  {userId: 'demo_dad_09', user: '게임하는아빠', avatar: '🎮'},
];

const CATEGORIES = ['부부관계', '자유', '육아', '직장생활', '재테크/부업', '건강/운동', '요리/집안일', '취미', '고민상담'];

// ─── HTTP 유틸 ───
function httpRequest(options, body) {
  return new Promise((resolve, reject) => {
    const req = https.request(options, res => {
      let data = '';
      res.on('data', chunk => (data += chunk));
      res.on('end', () => {
        if (res.statusCode >= 200 && res.statusCode < 300) {
          resolve(JSON.parse(data));
        } else {
          reject(new Error(`HTTP ${res.statusCode}: ${data.slice(0, 500)}`));
        }
      });
    });
    req.on('error', reject);
    if (body) req.write(body);
    req.end();
  });
}

// ─── Firebase Auth ───
async function getFirebaseToken() {
  const configPath = os.homedir() + '/.config/configstore/firebase-tools.json';
  const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
  const refreshToken = config.tokens?.refresh_token;
  if (!refreshToken) throw new Error('Firebase refresh token not found');

  const postData = `grant_type=refresh_token&refresh_token=${encodeURIComponent(refreshToken)}&client_id=563584335869-fgrhgmd47bqnekij5i8b5pr03ho849e6.apps.googleusercontent.com&client_secret=j9iVZfS8kkCEFUPaAeJV0sAi`;
  const result = await httpRequest({
    hostname: 'oauth2.googleapis.com',
    path: '/token',
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      'Content-Length': Buffer.byteLength(postData),
    },
  }, postData);
  return result.access_token;
}

// ─── Firestore REST ───
function toFirestoreValue(val) {
  if (val === null || val === undefined) return {nullValue: null};
  if (typeof val === 'string') return {stringValue: val};
  if (typeof val === 'number') return Number.isInteger(val) ? {integerValue: String(val)} : {doubleValue: val};
  if (typeof val === 'boolean') return {booleanValue: val};
  if (val instanceof Date) return {timestampValue: val.toISOString()};
  if (Array.isArray(val)) return {arrayValue: {values: val.length > 0 ? val.map(toFirestoreValue) : []}};
  if (typeof val === 'object') {
    const fields = {};
    for (const [k, v] of Object.entries(val)) fields[k] = toFirestoreValue(v);
    return {mapValue: {fields}};
  }
  return {stringValue: String(val)};
}

function toFirestoreFields(obj) {
  const fields = {};
  for (const [k, v] of Object.entries(obj)) fields[k] = toFirestoreValue(v);
  return fields;
}

async function firestoreCreate(accessToken, path, data) {
  const body = JSON.stringify({fields: toFirestoreFields(data)});
  return httpRequest({
    hostname: 'firestore.googleapis.com',
    path: `/v1/projects/${PROJECT_ID}/databases/(default)/documents/${path}`,
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(body),
    },
  }, body);
}

async function firestorePatch(accessToken, docPath, data) {
  const fields = toFirestoreFields(data);
  const updateMask = Object.keys(data).map(k => `updateMask.fieldPaths=${k}`).join('&');
  const body = JSON.stringify({fields});
  return httpRequest({
    hostname: 'firestore.googleapis.com',
    path: `/v1/projects/${PROJECT_ID}/databases/(default)/documents/${docPath}?${updateMask}`,
    method: 'PATCH',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(body),
    },
  }, body);
}

// ─── Claude API ───
async function callClaude(prompt) {
  const body = JSON.stringify({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 4096,
    messages: [{role: 'user', content: prompt}],
  });
  const result = await httpRequest({
    hostname: 'api.anthropic.com',
    path: '/v1/messages',
    method: 'POST',
    headers: {
      'x-api-key': ANTHROPIC_API_KEY,
      'anthropic-version': '2023-06-01',
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(body),
    },
  }, body);
  return result.content[0].text;
}

// ─── AI 게시글 생성 ───
async function generatePosts(count) {
  console.log(`\n🤖 Claude API로 게시글 ${count}개 생성 중...`);
  const prompt = `당신은 "아빠의다락방"이라는 한국 아빠 커뮤니티 앱의 시드 콘텐츠를 만드는 역할입니다.
아래 조건에 맞게 게시글 ${count}개를 JSON 배열로 생성해주세요.

## 조건
- 카테고리: ${CATEGORIES.join(', ')} 중 골고루 분배
- 작성자 인덱스(userIdx): 0~8 중 랜덤 (각 인덱스별 캐릭터: 0=행복한아빠, 1=주말아빠, 2=육아전사, 3=요리하는아빠, 4=캠핑가는아빠, 5=직장인아빠, 6=운동하는아빠, 7=독서하는아빠, 8=게임하는아빠)
- 작성자 캐릭터에 맞는 주제로 글 작성
- 제목: 20~40자, 클릭하고 싶은 제목
- 본문: 100~300자, 자연스러운 한국어 구어체, 커뮤니티 특유의 말투 (ㅋㅋ, ~요, ~니다 혼용)
- isAnonymous: 10~20% 확률로 true (민감한 주제일 때)
- 기존에 올린 게시글과 중복되지 않는 새로운 주제
- 실제 아빠들이 공감할 수 있는 현실적인 내용

## 기존 게시글 제목 (중복 방지)
- 5살 아들이 처음으로 아빠 사랑해 했습니다
- 육아휴직 쓰겠다고 했더니 팀장 반응이
- 아이 도시락 싸는 아빠
- 주말에 아이랑 갈만한 곳 추천
- 아이 재우고 새벽 운동 시작
- 아이가 학교에서 왕따 당하는 것 같아요
- 가족 캠핑 입문 장비 리스트
- 아빠들은 퇴근 후에 뭐하세요
- 아이랑 같이 할 수 있는 게임 추천
- 아내한테 매일 감사하다고 말하기

## 출력 형식
반드시 JSON 배열만 출력. 다른 텍스트 없이.
[
  {"userIdx": 0, "category": "육아", "title": "제목", "text": "본문", "isAnonymous": false},
  ...
]`;

  const response = await callClaude(prompt);
  // JSON 파싱 (코드블록 감싸져있을 수 있음)
  const jsonStr = response.replace(/```json?\n?/g, '').replace(/```/g, '').trim();
  const posts = JSON.parse(jsonStr);
  console.log(`✅ 게시글 ${posts.length}개 생성 완료`);
  return posts;
}

// ─── AI 댓글 생성 ───
async function generateComments(posts) {
  console.log(`\n🤖 Claude API로 댓글 생성 중...`);

  // 게시글 요약 만들기
  const postSummaries = posts.map((p, i) => `[${i}] (${p.category}) "${p.title}" by userIdx:${p.userIdx}`).join('\n');

  const prompt = `당신은 "아빠의다락방" 커뮤니티의 댓글을 생성합니다.

## 게시글 목록
${postSummaries}

## 댓글 작성자 (userIdx 0~8)
0=행복한아빠, 1=주말아빠, 2=육아전사, 3=요리하는아빠, 4=캠핑가는아빠, 5=직장인아빠, 6=운동하는아빠, 7=독서하는아빠, 8=게임하는아빠

## 조건
- 각 게시글당 1~4개 댓글
- 게시글 작성자와 다른 유저가 댓글 작성
- 자연스러운 한국어 구어체
- 공감, 조언, 경험 공유, 질문 등 다양한 유형
- 댓글 길이: 20~100자

## 출력 형식
JSON 배열만 출력. postIndex는 위 게시글 번호.
[
  {"postIndex": 0, "userIdx": 3, "text": "댓글 내용"},
  ...
]`;

  const response = await callClaude(prompt);
  const jsonStr = response.replace(/```json?\n?/g, '').replace(/```/g, '').trim();
  const comments = JSON.parse(jsonStr);
  console.log(`✅ 댓글 ${comments.length}개 생성 완료`);
  return comments;
}

// ─── 시간 분산 ───
function generateRandomTimestamps(count, spreadDays) {
  const now = Date.now();
  const totalMs = spreadDays * 24 * 60 * 60 * 1000;
  const timestamps = [];

  for (let i = 0; i < count; i++) {
    // 균등 분산 + 약간의 랜덤 노이즈
    const base = (i / count) * totalMs;
    const noise = Math.random() * (totalMs / count) * 0.8;
    const msAgo = totalMs - base - noise;
    timestamps.push(new Date(now - msAgo));
  }

  // 시간순 정렬 (오래된 것부터)
  timestamps.sort((a, b) => a - b);

  // 새벽 2~6시 글은 어색하니 시간 조정 (7시~23시 사이로)
  return timestamps.map(t => {
    const h = t.getHours();
    if (h >= 0 && h < 7) t.setHours(7 + Math.floor(Math.random() * 3));
    return t;
  });
}

// ─── 메인 ───
async function main() {
  console.log('═══════════════════════════════════════');
  console.log('  아빠의다락방 자동 시드 스크립트');
  console.log(`  게시글: ${POST_COUNT}개 / 분산: ${SPREAD_DAYS}일 / 댓글: ${NO_COMMENTS ? 'OFF' : 'ON'}`);
  console.log('═══════════════════════════════════════');

  // 1. Firebase 인증
  console.log('\n🔑 Firebase 인증 중...');
  const accessToken = await getFirebaseToken();
  console.log('✅ 인증 성공');

  // 2. AI로 게시글 생성
  const posts = await generatePosts(POST_COUNT);

  // 3. AI로 댓글 생성
  let comments = [];
  if (!NO_COMMENTS) {
    comments = await generateComments(posts);
  }

  // 4. 시간 생성
  const postTimestamps = generateRandomTimestamps(posts.length, SPREAD_DAYS);

  // 5. Firestore에 게시글 쓰기
  console.log('\n📝 Firestore에 게시글 작성 중...\n');
  const postIds = [];

  for (let i = 0; i < posts.length; i++) {
    const post = posts[i];
    const demoUser = DEMO_USERS[post.userIdx];
    const postDate = postTimestamps[i];

    const docData = {
      user: post.isAnonymous ? '익명' : demoUser.user,
      userId: demoUser.userId,
      avatar: post.isAnonymous ? '🎭' : demoUser.avatar,
      category: post.category,
      title: post.title,
      text: post.text,
      isAnonymous: post.isAnonymous,
      timestamp: postDate,
      createdAt: postDate,
      likes: 0,
      likedBy: [],
      savedBy: [],
      commentCount: 0,
      images: [],
    };

    try {
      const result = await firestoreCreate(accessToken, 'posts', docData);
      const docId = result.name.split('/').pop();
      postIds.push(docId);
      const timeStr = postDate.toLocaleString('ko-KR', {timeZone: 'Asia/Seoul'});
      console.log(`  ✅ [${i + 1}/${posts.length}] "${post.title}"`);
      console.log(`     📅 ${timeStr}  👤 ${docData.user}  📂 ${post.category}`);
    } catch (err) {
      postIds.push(null);
      console.error(`  ❌ [${i + 1}/${posts.length}] 실패: ${err.message.slice(0, 100)}`);
    }
    await new Promise(r => setTimeout(r, 200));
  }

  // 6. 댓글 쓰기
  if (!NO_COMMENTS && comments.length > 0) {
    console.log(`\n💬 댓글 ${comments.length}개 작성 중...\n`);

    // postIndex별로 댓글 수 집계 (commentCount 업데이트용)
    const commentCounts = {};

    for (let i = 0; i < comments.length; i++) {
      const c = comments[i];
      const postId = postIds[c.postIndex];
      if (!postId) continue;

      const demoUser = DEMO_USERS[c.userIdx];
      const postDate = postTimestamps[c.postIndex];
      // 댓글 시간: 게시글 이후 1~24시간 후
      const commentDate = new Date(postDate.getTime() + (1 + Math.random() * 23) * 60 * 60 * 1000);

      const commentData = {
        user: demoUser.user,
        userId: demoUser.userId,
        avatar: demoUser.avatar,
        text: c.text,
        timestamp: commentDate,
        likes: 0,
        likedBy: [],
      };

      try {
        await firestoreCreate(accessToken, `posts/${postId}/comments`, commentData);
        commentCounts[c.postIndex] = (commentCounts[c.postIndex] || 0) + 1;
        console.log(`  💬 [${i + 1}/${comments.length}] → 게시글 ${c.postIndex + 1}에 ${demoUser.user}: "${c.text.slice(0, 30)}..."`);
      } catch (err) {
        console.error(`  ❌ 댓글 실패: ${err.message.slice(0, 100)}`);
      }
      await new Promise(r => setTimeout(r, 150));
    }

    // 7. commentCount 업데이트
    console.log('\n🔄 댓글 수 동기화 중...');
    for (const [idx, count] of Object.entries(commentCounts)) {
      const postId = postIds[parseInt(idx)];
      if (!postId) continue;
      try {
        await firestorePatch(accessToken, `posts/${postId}`, {commentCount: count});
      } catch (err) {
        console.error(`  ⚠️ commentCount 업데이트 실패 (${postId}): ${err.message.slice(0, 80)}`);
      }
      await new Promise(r => setTimeout(r, 100));
    }
    console.log('✅ 동기화 완료');
  }

  // 완료
  const successPosts = postIds.filter(Boolean).length;
  console.log('\n═══════════════════════════════════════');
  console.log(`  🎉 완료! 게시글 ${successPosts}/${posts.length}개, 댓글 ${comments.length}개`);
  console.log('═══════════════════════════════════════\n');
}

main().catch(err => {
  console.error('❌ 치명적 에러:', err.message);
  process.exit(1);
});
