/**
 * DadCommunity 일일 자동 시드 스크립트
 * - 매일 1회 실행, 게시글 10개 + 댓글을 24시간 내 랜덤 시간에 분산
 * - Claude API로 자연스러운 콘텐츠 자동 생성
 *
 * 사용법:
 *   node scripts/daily-seed.js                # 기본 10개
 *   node scripts/daily-seed.js --posts 5      # 5개
 *   node scripts/daily-seed.js --no-comments  # 댓글 없이
 */

const https = require('https');
const fs = require('fs');
const os = require('os');

const PROJECT_ID = 'dadcommunity-ae202';
const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY;
if (!ANTHROPIC_API_KEY) {
  console.error('❌ ANTHROPIC_API_KEY 환경변수가 설정되지 않았습니다.');
  process.exit(1);
}

const LOG_DIR = os.homedir() + '/Desktop/dadcommunity/logs';
if (!fs.existsSync(LOG_DIR)) fs.mkdirSync(LOG_DIR, {recursive: true});

const args = process.argv.slice(2);
const getArg = (name, def) => {
  const idx = args.indexOf(`--${name}`);
  return idx >= 0 && args[idx + 1] ? args[idx + 1] : def;
};
const POST_COUNT = parseInt(getArg('posts', '10'));
const NO_COMMENTS = args.includes('--no-comments');

// ─── 로그 ───
function log(msg) {
  const ts = new Date().toLocaleString('ko-KR', {timeZone: 'Asia/Seoul'});
  const line = `[${ts}] ${msg}`;
  console.log(line);
  fs.appendFileSync(`${LOG_DIR}/daily-seed.log`, line + '\n');
}

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

// ─── HTTP ───
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

// ─── 최근 게시글 제목 가져오기 (중복 방지) ───
async function getRecentPostTitles(accessToken, limit = 30) {
  try {
    const body = JSON.stringify({
      structuredQuery: {
        from: [{collectionId: 'posts'}],
        orderBy: [{field: {fieldPath: 'timestamp'}, direction: 'DESCENDING'}],
        limit: limit,
        select: {fields: [{fieldPath: 'title'}]},
      },
    });
    const result = await httpRequest({
      hostname: 'firestore.googleapis.com',
      path: `/v1/projects/${PROJECT_ID}/databases/(default)/documents:runQuery`,
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(body),
      },
    }, body);
    return result
      .filter(r => r.document?.fields?.title?.stringValue)
      .map(r => r.document.fields.title.stringValue);
  } catch (e) {
    log(`⚠️ 기존 제목 조회 실패 (무시하고 계속): ${e.message}`);
    return [];
  }
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
async function generatePosts(count, existingTitles) {
  log(`🤖 게시글 ${count}개 AI 생성 중...`);
  const titleList = existingTitles.length > 0
    ? existingTitles.map(t => `- ${t}`).join('\n')
    : '(없음)';

  const today = new Date().toLocaleDateString('ko-KR', {timeZone: 'Asia/Seoul'});
  const prompt = `당신은 "아빠의다락방"이라는 한국 아빠 커뮤니티 앱의 시드 콘텐츠를 만드는 역할입니다.
오늘 날짜: ${today}
게시글 ${count}개를 JSON 배열로 생성해주세요.

## 조건
- 카테고리: ${CATEGORIES.join(', ')} 중 골고루 분배
- 작성자 인덱스(userIdx): 0~8 중 랜덤
  0=행복한아빠, 1=주말아빠, 2=육아전사, 3=요리하는아빠, 4=캠핑가는아빠, 5=직장인아빠, 6=운동하는아빠, 7=독서하는아빠, 8=게임하는아빠
- 작성자 캐릭터에 맞는 주제
- 제목: 20~40자, 호기심 유발
- 본문: 100~300자, 자연스러운 한국어 구어체 (ㅋㅋ, ~요, ~니다 혼용)
- isAnonymous: 10~20% 확률 true (민감한 주제)
- 계절/시기에 맞는 시의적절한 주제 포함
- 실제 아빠들이 공감할 수 있는 현실적 내용

## 기존 게시글 제목 (중복 금지!)
${titleList}

## 출력
JSON 배열만 출력. 다른 텍스트 없이.
[{"userIdx":0,"category":"육아","title":"제목","text":"본문","isAnonymous":false}]`;

  const response = await callClaude(prompt);
  const jsonStr = response.replace(/```json?\n?/g, '').replace(/```/g, '').trim();
  const posts = JSON.parse(jsonStr);
  log(`✅ 게시글 ${posts.length}개 생성 완료`);
  return posts;
}

// ─── AI 댓글 생성 ───
async function generateComments(posts) {
  log(`🤖 댓글 AI 생성 중...`);
  const postSummaries = posts.map((p, i) => `[${i}] (${p.category}) "${p.title}" by userIdx:${p.userIdx}`).join('\n');

  const prompt = `"아빠의다락방" 커뮤니티 댓글을 생성하세요.

## 게시글
${postSummaries}

## 작성자 (userIdx 0~8)
0=행복한아빠, 1=주말아빠, 2=육아전사, 3=요리하는아빠, 4=캠핑가는아빠, 5=직장인아빠, 6=운동하는아빠, 7=독서하는아빠, 8=게임하는아빠

## 조건
- 각 게시글당 1~4개 댓글 (랜덤)
- 게시글 작성자와 다른 유저가 댓글 작성
- 자연스러운 한국어 구어체, 20~100자
- 공감/조언/경험공유/질문 등 다양

## 출력
JSON 배열만.
[{"postIndex":0,"userIdx":3,"text":"댓글"}]`;

  const response = await callClaude(prompt);
  const jsonStr = response.replace(/```json?\n?/g, '').replace(/```/g, '').trim();
  const comments = JSON.parse(jsonStr);
  log(`✅ 댓글 ${comments.length}개 생성 완료`);
  return comments;
}

// ─── 24시간 내 랜덤 시간 생성 (07:00~23:59 사이) ───
function generateDayTimestamps(count) {
  const now = new Date();
  // 오늘 0시 기준 (KST)
  const todayStart = new Date(now);
  todayStart.setHours(0, 0, 0, 0);

  const timestamps = [];
  for (let i = 0; i < count; i++) {
    // 7시~23시 사이 랜덤 (분, 초도 랜덤)
    const hour = 7 + Math.floor(Math.random() * 17); // 7~23
    const minute = Math.floor(Math.random() * 60);
    const second = Math.floor(Math.random() * 60);
    const t = new Date(todayStart);
    t.setHours(hour, minute, second);

    // 미래 시간이면 현재 시간 -1~30분으로 조정
    if (t > now) {
      t.setTime(now.getTime() - (1 + Math.floor(Math.random() * 30)) * 60 * 1000);
    }

    timestamps.push(t);
  }

  return timestamps.sort((a, b) => a - b);
}

// ─── 메인 ───
async function main() {
  const startTime = Date.now();
  log('═══════════════════════════════════════');
  log(`  일일 자동 시드 시작 (게시글 ${POST_COUNT}개, 댓글 ${NO_COMMENTS ? 'OFF' : 'ON'})`);
  log('═══════════════════════════════════════');

  // 1. Firebase 인증
  const accessToken = await getFirebaseToken();
  log('🔑 Firebase 인증 완료');

  // 2. 기존 게시글 제목 조회 (중복 방지)
  const existingTitles = await getRecentPostTitles(accessToken);
  log(`📋 기존 게시글 ${existingTitles.length}개 제목 조회 완료`);

  // 3. AI 게시글 생성
  const posts = await generatePosts(POST_COUNT, existingTitles);

  // 4. AI 댓글 생성
  let comments = [];
  if (!NO_COMMENTS) {
    comments = await generateComments(posts);
  }

  // 5. 타임스탬프 생성
  const postTimestamps = generateDayTimestamps(posts.length);

  // 6. Firestore에 게시글 쓰기
  log('\n📝 게시글 Firestore 저장 중...');
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
      log(`  ✅ [${i + 1}/${posts.length}] ${timeStr} | ${docData.user} | ${post.category} | "${post.title}"`);
    } catch (err) {
      postIds.push(null);
      log(`  ❌ [${i + 1}/${posts.length}] 실패: ${err.message.slice(0, 100)}`);
    }
    await new Promise(r => setTimeout(r, 200));
  }

  // 7. 댓글 쓰기
  if (!NO_COMMENTS && comments.length > 0) {
    log(`\n💬 댓글 ${comments.length}개 저장 중...`);
    const commentCounts = {};

    for (let i = 0; i < comments.length; i++) {
      const c = comments[i];
      const postId = postIds[c.postIndex];
      if (!postId) continue;

      const demoUser = DEMO_USERS[c.userIdx];
      const postDate = postTimestamps[c.postIndex];
      const commentDate = new Date(postDate.getTime() + (10 + Math.random() * 120) * 60 * 1000);

      // 미래 시간 방지
      const now = new Date();
      const safeDate = commentDate > now ? new Date(now.getTime() - Math.random() * 5 * 60000) : commentDate;

      const commentData = {
        user: demoUser.user,
        userId: demoUser.userId,
        avatar: demoUser.avatar,
        text: c.text,
        timestamp: safeDate,
        likes: 0,
        likedBy: [],
      };

      try {
        await firestoreCreate(accessToken, `posts/${postId}/comments`, commentData);
        commentCounts[c.postIndex] = (commentCounts[c.postIndex] || 0) + 1;
      } catch (err) {
        log(`  ❌ 댓글 실패: ${err.message.slice(0, 80)}`);
      }
      await new Promise(r => setTimeout(r, 150));
    }

    // commentCount 동기화
    for (const [idx, count] of Object.entries(commentCounts)) {
      const postId = postIds[parseInt(idx)];
      if (!postId) continue;
      try {
        await firestorePatch(accessToken, `posts/${postId}`, {commentCount: count});
      } catch (err) { /* ignore */ }
      await new Promise(r => setTimeout(r, 100));
    }
    log(`✅ 댓글 ${comments.length}개 저장 완료`);
  }

  const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);
  const successPosts = postIds.filter(Boolean).length;
  log('\n═══════════════════════════════════════');
  log(`  🎉 완료! 게시글 ${successPosts}/${posts.length}개, 댓글 ${comments.length}개 (${elapsed}초)`);
  log('═══════════════════════════════════════\n');
}

main().catch(err => {
  log(`❌ 치명적 에러: ${err.message}`);
  process.exit(1);
});
