/**
 * DadCommunity 미니 생태계 시뮬레이터
 * - AI 유저들이 서로 댓글/대댓글/좋아요로 상호작용
 * - 기존 게시글을 읽고 맥락에 맞는 반응 생성
 * - 하루 3~4회 실행하면 살아있는 커뮤니티처럼 보임
 *
 * 사용법:
 *   node scripts/ecosystem.js                    # 기본 (자동 활동)
 *   node scripts/ecosystem.js --activity high    # 활발한 활동 (많은 상호작용)
 *   node scripts/ecosystem.js --activity low     # 조용한 활동 (소수 상호작용)
 */

const https = require('https');
const fs = require('fs');
const os = require('os');

const PROJECT_ID = 'dadcommunity-ae202';
const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY;
if (!ANTHROPIC_API_KEY) {
  console.error('❌ ANTHROPIC_API_KEY 환경변수 필요');
  process.exit(1);
}

const LOG_DIR = os.homedir() + '/Desktop/dadcommunity/logs';
if (!fs.existsSync(LOG_DIR)) fs.mkdirSync(LOG_DIR, {recursive: true});

const args = process.argv.slice(2);
const getArg = (name, def) => {
  const idx = args.indexOf(`--${name}`);
  return idx >= 0 && args[idx + 1] ? args[idx + 1] : def;
};

const ACTIVITY = getArg('activity', 'medium'); // low, medium, high
const ACTIVITY_CONFIG = {
  low:    {newComments: [2, 4],  replies: [1, 3],  likes: [3, 8]},
  medium: {newComments: [4, 8],  replies: [3, 6],  likes: [5, 15]},
  high:   {newComments: [8, 15], replies: [5, 10], likes: [10, 25]},
};
const CONFIG = ACTIVITY_CONFIG[ACTIVITY] || ACTIVITY_CONFIG.medium;

function randRange(min, max) { return min + Math.floor(Math.random() * (max - min + 1)); }

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

function log(msg) {
  const ts = new Date().toLocaleString('ko-KR', {timeZone: 'Asia/Seoul'});
  const line = `[${ts}] ${msg}`;
  console.log(line);
  fs.appendFileSync(`${LOG_DIR}/ecosystem.log`, line + '\n');
}

// ─── HTTP ───
function httpRequest(options, body) {
  return new Promise((resolve, reject) => {
    const req = https.request(options, res => {
      let data = '';
      res.on('data', chunk => (data += chunk));
      res.on('end', () => {
        if (res.statusCode >= 200 && res.statusCode < 300) {
          try { resolve(JSON.parse(data)); } catch { resolve(data); }
        } else {
          reject(new Error(`HTTP ${res.statusCode}: ${data.slice(0, 300)}`));
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
    hostname: 'oauth2.googleapis.com', path: '/token', method: 'POST',
    headers: {'Content-Type': 'application/x-www-form-urlencoded', 'Content-Length': Buffer.byteLength(postData)},
  }, postData);
  return result.access_token;
}

// ─── Firestore 헬퍼 ───
function toFV(val) {
  if (val === null || val === undefined) return {nullValue: null};
  if (typeof val === 'string') return {stringValue: val};
  if (typeof val === 'number') return Number.isInteger(val) ? {integerValue: String(val)} : {doubleValue: val};
  if (typeof val === 'boolean') return {booleanValue: val};
  if (val instanceof Date) return {timestampValue: val.toISOString()};
  if (Array.isArray(val)) return {arrayValue: {values: val.length > 0 ? val.map(toFV) : []}};
  if (typeof val === 'object') {
    const fields = {};
    for (const [k, v] of Object.entries(val)) fields[k] = toFV(v);
    return {mapValue: {fields}};
  }
  return {stringValue: String(val)};
}

function toFields(obj) {
  const fields = {};
  for (const [k, v] of Object.entries(obj)) fields[k] = toFV(v);
  return fields;
}

function fromFV(fv) {
  if ('stringValue' in fv) return fv.stringValue;
  if ('integerValue' in fv) return parseInt(fv.integerValue);
  if ('doubleValue' in fv) return fv.doubleValue;
  if ('booleanValue' in fv) return fv.booleanValue;
  if ('timestampValue' in fv) return fv.timestampValue;
  if ('nullValue' in fv) return null;
  if ('arrayValue' in fv) return (fv.arrayValue.values || []).map(fromFV);
  if ('mapValue' in fv) {
    const obj = {};
    for (const [k, v] of Object.entries(fv.mapValue.fields || {})) obj[k] = fromFV(v);
    return obj;
  }
  return null;
}

function fromDoc(doc) {
  const obj = {};
  for (const [k, v] of Object.entries(doc.fields || {})) obj[k] = fromFV(v);
  obj._id = doc.name.split('/').pop();
  obj._path = doc.name.split('documents/')[1];
  return obj;
}

const BASE = `projects/${PROJECT_ID}/databases/(default)/documents`;

async function firestoreQuery(accessToken, query) {
  const body = JSON.stringify({structuredQuery: query});
  const results = await httpRequest({
    hostname: 'firestore.googleapis.com',
    path: `/v1/${BASE}:runQuery`,
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(body),
    },
  }, body);
  return (Array.isArray(results) ? results : [results])
    .filter(r => r.document)
    .map(r => fromDoc(r.document));
}

async function firestoreCreate(accessToken, path, data) {
  const body = JSON.stringify({fields: toFields(data)});
  return httpRequest({
    hostname: 'firestore.googleapis.com',
    path: `/v1/${BASE}/${path}`,
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(body),
    },
  }, body);
}

async function firestorePatch(accessToken, docPath, data) {
  const fields = toFields(data);
  const updateMask = Object.keys(data).map(k => `updateMask.fieldPaths=${k}`).join('&');
  const body = JSON.stringify({fields});
  return httpRequest({
    hostname: 'firestore.googleapis.com',
    path: `/v1/${BASE}/${docPath}?${updateMask}`,
    method: 'PATCH',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(body),
    },
  }, body);
}

// Firestore 배열에 값 추가 (REST API는 arrayUnion 미지원이라 read→write)
async function addToArray(accessToken, docPath, field, value) {
  // 현재 문서 읽기
  const doc = await httpRequest({
    hostname: 'firestore.googleapis.com',
    path: `/v1/${BASE}/${docPath}`,
    method: 'GET',
    headers: {Authorization: `Bearer ${accessToken}`},
  });
  const current = fromDoc(doc);
  const arr = Array.isArray(current[field]) ? current[field] : [];
  if (!arr.includes(value)) {
    arr.push(value);
    await firestorePatch(accessToken, docPath, {[field]: arr});
    return true;
  }
  return false;
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

function parseJSON(text) {
  return JSON.parse(text.replace(/```json?\n?/g, '').replace(/```/g, '').trim());
}

// ═══════════════════════════════════════════════════
// 1단계: 최근 게시글 + 댓글 현황 파악
// ═══════════════════════════════════════════════════
async function getRecentPosts(accessToken, limit = 20) {
  return firestoreQuery(accessToken, {
    from: [{collectionId: 'posts'}],
    orderBy: [{field: {fieldPath: 'timestamp'}, direction: 'DESCENDING'}],
    limit,
  });
}

async function getComments(accessToken, postId) {
  try {
    const body = JSON.stringify({
      structuredQuery: {
        from: [{collectionId: 'comments'}],
        orderBy: [{field: {fieldPath: 'timestamp'}, direction: 'ASCENDING'}],
        limit: 50,
      },
    });
    const results = await httpRequest({
      hostname: 'firestore.googleapis.com',
      path: `/v1/${BASE}/posts/${postId}:runQuery`,
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(body),
      },
    }, body);
    return (Array.isArray(results) ? results : [results])
      .filter(r => r.document)
      .map(r => fromDoc(r.document));
  } catch {
    return [];
  }
}

async function getReplies(accessToken, postId, commentId) {
  try {
    const body = JSON.stringify({
      structuredQuery: {
        from: [{collectionId: 'replies'}],
        orderBy: [{field: {fieldPath: 'timestamp'}, direction: 'ASCENDING'}],
        limit: 20,
      },
    });
    const results = await httpRequest({
      hostname: 'firestore.googleapis.com',
      path: `/v1/${BASE}/posts/${postId}/comments/${commentId}:runQuery`,
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(body),
      },
    }, body);
    return (Array.isArray(results) ? results : [results])
      .filter(r => r.document)
      .map(r => fromDoc(r.document));
  } catch {
    return [];
  }
}

// ═══════════════════════════════════════════════════
// 2단계: AI가 상황 파악하고 반응 생성
// ═══════════════════════════════════════════════════
async function generateInteractions(posts, postComments) {
  // 게시글 + 댓글 상황 요약
  const context = posts.map((p, i) => {
    const comments = postComments[i] || [];
    const commentStr = comments.length > 0
      ? comments.map(c => `    - ${c.user}(idx:${DEMO_USERS.findIndex(u => u.userId === c.userId)}): "${c.text}"`).join('\n')
      : '    (댓글 없음)';
    return `[${i}] "${p.title}" by ${p.user}(idx:${DEMO_USERS.findIndex(u => u.userId === p.userId)}) | 좋아요:${p.likes||0} | 카테고리:${p.category}
  댓글(${comments.length}개):
${commentStr}`;
  }).join('\n\n');

  const numComments = randRange(...CONFIG.newComments);
  const numReplies = randRange(...CONFIG.replies);

  const prompt = `당신은 "아빠의다락방" 커뮤니티의 생태계 시뮬레이터입니다.
아래 현재 게시판 상황을 보고, AI 유저들의 자연스러운 상호작용을 생성하세요.

## 현재 게시판 상황
${context}

## 유저 목록 (userIdx)
0=행복한아빠(긍정적,공감형), 1=주말아빠(가족활동전문), 2=육아전사(열정육아), 3=요리하는아빠(요리/살림), 4=캠핑가는아빠(아웃도어), 5=직장인아빠(워라밸고민), 6=운동하는아빠(건강/체력), 7=독서하는아빠(지적/차분), 8=게임하는아빠(유쾌/솔직)

## 생성 규칙
1. **새 댓글** ${numComments}개: 댓글이 적은 게시글에 우선 배치. 게시글 내용에 대한 공감/조언/경험공유. 글쓴이가 아닌 다른 유저가 작성.
2. **대댓글** ${numReplies}개: 기존 댓글에 대한 답변/동의/추가의견. 원댓글 작성자에게 말 거는 느낌. "@닉네임" 식으로 호칭 가능.
3. 각 유저의 성격에 맞는 말투와 내용
4. 한국어 구어체 (20~80자)
5. 자연스러운 대화 흐름 - 이전 댓글을 읽고 이어가는 느낌

## 출력 (JSON만)
{
  "comments": [
    {"postIndex": 0, "userIdx": 3, "text": "새 댓글 내용"}
  ],
  "replies": [
    {"postIndex": 0, "commentIndex": 0, "userIdx": 5, "text": "대댓글 내용"}
  ]
}`;

  const response = await callClaude(prompt);
  return parseJSON(response);
}

// ═══════════════════════════════════════════════════
// 3단계: Firestore에 상호작용 반영
// ═══════════════════════════════════════════════════
async function applyInteractions(accessToken, posts, postComments, interactions) {
  const now = new Date();
  let commentCount = 0;
  let replyCount = 0;
  let likeCount = 0;

  // --- 새 댓글 추가 ---
  if (interactions.comments) {
    for (const c of interactions.comments) {
      const post = posts[c.postIndex];
      if (!post) continue;
      const user = DEMO_USERS[c.userIdx];
      if (!user) continue;

      const commentDate = new Date(now.getTime() - Math.floor(Math.random() * 30) * 60000);
      try {
        await firestoreCreate(accessToken, `posts/${post._id}/comments`, {
          user: user.user,
          userId: user.userId,
          avatar: user.avatar,
          text: c.text,
          timestamp: commentDate,
          likes: 0,
          likedBy: [],
        });
        // commentCount 증가
        const currentCount = post.commentCount || 0;
        await firestorePatch(accessToken, `posts/${post._id}`, {
          commentCount: currentCount + 1,
        });
        post.commentCount = currentCount + 1;
        log(`  💬 댓글 → "${post.title.slice(0, 20)}..." | ${user.user}: "${c.text.slice(0, 35)}..."`);
        commentCount++;
      } catch (err) {
        log(`  ❌ 댓글 실패: ${err.message.slice(0, 80)}`);
      }
      await new Promise(r => setTimeout(r, 200));
    }
  }

  // --- 대댓글 추가 ---
  if (interactions.replies) {
    for (const r of interactions.replies) {
      const post = posts[r.postIndex];
      if (!post) continue;
      const comments = postComments[r.postIndex] || [];
      const comment = comments[r.commentIndex];
      if (!comment) continue;
      const user = DEMO_USERS[r.userIdx];
      if (!user) continue;

      const replyDate = new Date(now.getTime() - Math.floor(Math.random() * 20) * 60000);
      try {
        await firestoreCreate(accessToken, `posts/${post._id}/comments/${comment._id}/replies`, {
          user: user.user,
          userId: user.userId,
          avatar: user.avatar,
          text: r.text,
          timestamp: replyDate,
          likes: 0,
          likedBy: [],
        });
        const currentCount = post.commentCount || 0;
        await firestorePatch(accessToken, `posts/${post._id}`, {
          commentCount: currentCount + 1,
        });
        post.commentCount = currentCount + 1;
        log(`  ↪️ 대댓글 → ${comment.user}에게 | ${user.user}: "${r.text.slice(0, 35)}..."`);
        replyCount++;
      } catch (err) {
        log(`  ❌ 대댓글 실패: ${err.message.slice(0, 80)}`);
      }
      await new Promise(r => setTimeout(r, 200));
    }
  }

  // --- 좋아요 (랜덤) ---
  const numLikes = randRange(...CONFIG.likes);
  const shuffledPosts = [...posts].sort(() => Math.random() - 0.5);

  for (let i = 0; i < Math.min(numLikes, shuffledPosts.length); i++) {
    const post = shuffledPosts[i];
    // 글쓴이가 아닌 랜덤 유저가 좋아요
    const candidates = DEMO_USERS.filter(u => u.userId !== post.userId);
    const liker = candidates[Math.floor(Math.random() * candidates.length)];
    const likedBy = post.likedBy || [];

    if (!likedBy.includes(liker.userId)) {
      try {
        const newLikedBy = [...likedBy, liker.userId];
        await firestorePatch(accessToken, `posts/${post._id}`, {
          likedBy: newLikedBy,
          likes: newLikedBy.length,
        });
        post.likedBy = newLikedBy;
        post.likes = newLikedBy.length;
        log(`  ❤️ 좋아요 → "${post.title.slice(0, 20)}..." | ${liker.user} (총 ${newLikedBy.length})`);
        likeCount++;
      } catch (err) {
        log(`  ❌ 좋아요 실패: ${err.message.slice(0, 80)}`);
      }
      await new Promise(r => setTimeout(r, 150));
    }
  }

  return {commentCount, replyCount, likeCount};
}

// ═══════════════════════════════════════════════════
// 메인
// ═══════════════════════════════════════════════════
async function main() {
  const startTime = Date.now();
  log('═══════════════════════════════════════');
  log(`  🌿 생태계 시뮬레이터 시작 (활동량: ${ACTIVITY})`);
  log('═══════════════════════════════════════');

  // 1. Firebase 인증
  const accessToken = await getFirebaseToken();
  log('🔑 인증 완료');

  // 2. 최근 게시글 조회
  const posts = await getRecentPosts(accessToken, 15);
  log(`📋 게시글 ${posts.length}개 조회`);

  if (posts.length === 0) {
    log('⚠️ 게시글이 없어서 종료합니다. 먼저 daily-seed.js를 실행하세요.');
    return;
  }

  // 3. 각 게시글의 댓글 조회
  log('💬 댓글 현황 조회 중...');
  const postComments = [];
  for (const post of posts) {
    const comments = await getComments(accessToken, post._id);
    postComments.push(comments);
    await new Promise(r => setTimeout(r, 100));
  }
  const totalComments = postComments.reduce((s, c) => s + c.length, 0);
  log(`📊 현황: 게시글 ${posts.length}개, 댓글 총 ${totalComments}개`);

  // 4. AI로 상호작용 생성
  log('\n🤖 AI 상호작용 생성 중...');
  const interactions = await generateInteractions(posts, postComments);
  log(`✅ 생성: 댓글 ${interactions.comments?.length || 0}개, 대댓글 ${interactions.replies?.length || 0}개`);

  // 5. Firestore에 반영
  log('\n📝 Firestore 반영 중...');
  const result = await applyInteractions(accessToken, posts, postComments, interactions);

  const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);
  log('\n═══════════════════════════════════════');
  log(`  🎉 완료! 댓글 ${result.commentCount}개 + 대댓글 ${result.replyCount}개 + 좋아요 ${result.likeCount}개 (${elapsed}초)`);
  log('═══════════════════════════════════════\n');
}

main().catch(err => {
  log(`❌ 치명적 에러: ${err.message}`);
  process.exit(1);
});
