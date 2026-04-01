/**
 * DadCommunity 시드 게시글 작성 스크립트
 * firebase-tools 토큰으로 Firestore REST API 사용
 * 실행: node scripts/seed-posts.js
 */

const {execSync} = require('child_process');
const https = require('https');

const PROJECT_ID = 'dadcommunity-ae202';

// firebase-tools에서 access token 가져오기
function getAccessToken() {
  const configPath = require('os').homedir() + '/.config/configstore/firebase-tools.json';

  const fs = require('fs');
  let config;
  try {
    config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
  } catch (e) {
    // fallback: use firebase CLI
    const token = execSync('npx firebase login:ci --token 2>/dev/null', {encoding: 'utf8'}).trim();
    return token;
  }

  const refreshToken = config.tokens?.refresh_token;
  if (!refreshToken) throw new Error('No refresh token found');

  // Exchange refresh token for access token
  return new Promise((resolve, reject) => {
    const postData = `grant_type=refresh_token&refresh_token=${encodeURIComponent(refreshToken)}&client_id=563584335869-fgrhgmd47bqnekij5i8b5pr03ho849e6.apps.googleusercontent.com&client_secret=j9iVZfS8kkCEFUPaAeJV0sAi`;
    const options = {
      hostname: 'oauth2.googleapis.com',
      path: '/token',
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Content-Length': Buffer.byteLength(postData),
      },
    };
    const req = https.request(options, res => {
      let data = '';
      res.on('data', chunk => (data += chunk));
      res.on('end', () => {
        const json = JSON.parse(data);
        if (json.access_token) resolve(json.access_token);
        else reject(new Error('Token exchange failed: ' + data));
      });
    });
    req.on('error', reject);
    req.write(postData);
    req.end();
  });
}

// Firestore REST API로 문서 추가
function createDocument(accessToken, collectionId, fields) {
  return new Promise((resolve, reject) => {
    const body = JSON.stringify({fields});
    const options = {
      hostname: 'firestore.googleapis.com',
      path: `/v1/projects/${PROJECT_ID}/databases/(default)/documents/${collectionId}`,
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(body),
      },
    };
    const req = https.request(options, res => {
      let data = '';
      res.on('data', chunk => (data += chunk));
      res.on('end', () => {
        if (res.statusCode >= 200 && res.statusCode < 300) {
          resolve(JSON.parse(data));
        } else {
          reject(new Error(`HTTP ${res.statusCode}: ${data}`));
        }
      });
    });
    req.on('error', reject);
    req.write(body);
    req.end();
  });
}

// Firestore REST 필드 변환
function toFirestoreValue(val) {
  if (val === null || val === undefined) return {nullValue: null};
  if (typeof val === 'string') return {stringValue: val};
  if (typeof val === 'number') return Number.isInteger(val) ? {integerValue: String(val)} : {doubleValue: val};
  if (typeof val === 'boolean') return {booleanValue: val};
  if (val instanceof Date) return {timestampValue: val.toISOString()};
  if (Array.isArray(val)) return {arrayValue: {values: val.map(toFirestoreValue)}};
  if (typeof val === 'object') {
    const fields = {};
    for (const [k, v] of Object.entries(val)) fields[k] = toFirestoreValue(v);
    return {mapValue: {fields}};
  }
  return {stringValue: String(val)};
}

function toFirestoreFields(obj) {
  const fields = {};
  for (const [k, v] of Object.entries(obj)) {
    fields[k] = toFirestoreValue(v);
  }
  return fields;
}

// 데모 유저
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

// 게시글 10개
const POSTS = [
  {
    userIdx: 0, category: '육아',
    title: '5살 아들이 처음으로 "아빠 사랑해" 했습니다',
    text: '퇴근하고 집에 들어갔더니 아들이 달려와서 "아빠 사랑해!"라고 하네요. 지금까지 맨날 엄마만 찾던 아이가... 솔직히 눈물 나올 뻔했습니다. 이 맛에 아빠 하는 거 맞죠? 다들 자녀에게 처음 사랑한다고 들었을 때 기억나시나요?',
    isAnonymous: false,
  },
  {
    userIdx: 5, category: '직장생활',
    title: '육아휴직 쓰겠다고 했더니 팀장 반응이...',
    text: '둘째 태어나서 3개월 육아휴직 신청하려고 팀장한테 말했는데, "남자가 뭔 육아휴직이야" 라는 반응이네요. 법적으로 보장된 권리인데 이런 분위기가 아직도 있다니. 혹시 육아휴직 사용하신 아빠분들 계신가요? 어떻게 설득하셨는지 팁 좀 주세요.',
    isAnonymous: false,
  },
  {
    userIdx: 3, category: '요리/집안일',
    title: '아이 도시락 싸는 아빠, 저만 그런가요?',
    text: '아내가 출근이 빨라서 매일 아침 7살 딸 유치원 도시락을 제가 싸고 있습니다. 처음엔 김밥만 말았는데 이제 캐릭터 도시락까지 도전 중이에요. 근데 유치원 엄마들 단톡방에서 "00아빠가 도시락 싸준대" 하면서 화제가 됐다고 ㅋㅋ 도시락 레시피 공유해주실 분?',
    isAnonymous: false,
  },
  {
    userIdx: 1, category: '자유',
    title: '주말에 아이랑 갈만한 곳 추천 부탁드려요 (수도권)',
    text: '매주 주말마다 아이랑 어디 갈지 고민입니다. 키즈카페는 이제 질렸고, 야외에서 뛰어놀 수 있는 곳이면 좋겠어요. 4살, 7살 두 아이 데리고 갈 만한 수도권 추천지 있으실까요? 최근에 다녀온 곳 중 괜찮았던 데 알려주세요!',
    isAnonymous: false,
  },
  {
    userIdx: 6, category: '건강/운동',
    title: '아이 재우고 새벽 운동 시작했는데 인생이 바뀝니다',
    text: '40대 접어들면서 체력이 확 떨어지는 게 느껴져서 새벽 5시 기상 운동을 시작했습니다. 처음 2주는 죽을 맛이었는데 한 달 지나니까 오히려 낮에 집중력이 좋아지고 퇴근 후에도 아이들이랑 놀 체력이 남더라고요. 운동하시는 아빠들 루틴 공유해요!',
    isAnonymous: false,
  },
  {
    userIdx: 2, category: '육아',
    title: '아이가 학교에서 왕따 당하는 것 같아요',
    text: '초등 2학년 아들인데, 요즘 학교 얘기를 안 하고 친구 이름도 안 나와요. 어제 슬쩍 물어봤더니 "쉬는 시간에 혼자 논다"고 하네요. 가슴이 너무 아프고 어떻게 해야 할지 모르겠습니다. 비슷한 경험 있으신 아빠분들 조언 부탁드립니다.',
    isAnonymous: true,
  },
  {
    userIdx: 4, category: '취미',
    title: '가족 캠핑 입문 장비 리스트 정리해봤습니다',
    text: '올해 처음 가족 캠핑 시작하려는 분들을 위해 입문 장비 정리해봤어요.\n\n1. 텐트: 4인용 이상 (리빙쉘 추천)\n2. 침낭: 봄가을용 기준 1인 1개\n3. 매트: 자충 매트 필수\n4. 버너+코펠 세트\n5. 랜턴: LED 충전식\n6. 타프: 비 올 때 필수\n\n처음부터 비싼 거 사지 마시고 중고나라에서 입문용 구하는 게 낫습니다. 질문 있으시면 댓글로!',
    isAnonymous: false,
  },
  {
    userIdx: 7, category: '자유',
    title: '아빠들은 퇴근 후에 뭐하세요?',
    text: '퇴근하고 아이 재우면 보통 10시쯤인데, 거기서 잠들기까지 1-2시간이 유일한 개인 시간이잖아요. 저는 그 시간에 책 읽거나 넷플릭스 보는데, 다른 아빠들은 뭐 하시는지 궁금합니다. 부업하시는 분도 계신가요?',
    isAnonymous: false,
  },
  {
    userIdx: 8, category: '취미',
    title: '아이랑 같이 할 수 있는 게임 추천',
    text: '7살 아들이 게임에 관심을 보이기 시작해서, 같이 할 수 있는 건전한 게임을 찾고 있습니다. 지금은 마리오카트 하고 있는데 다른 추천 있으실까요? 닌텐도 스위치, PC 다 괜찮습니다. 너무 자극적이지 않으면서 아빠랑 협동할 수 있는 게임이면 좋겠어요.',
    isAnonymous: false,
  },
  {
    userIdx: 0, category: '부부관계',
    title: '아내한테 매일 감사하다고 말하기 시작했더니',
    text: '어디서 읽었는데 매일 배우자한테 감사 표현을 하면 관계가 좋아진다고 해서, 2주 전부터 매일 한 가지씩 감사한 점을 말하고 있습니다. "오늘 밥 맛있었어 고마워", "아이들 잘 챙겨줘서 고마워" 이런 식으로요. 처음엔 아내가 "뭐야 갑자기" 했는데 요즘은 아내도 저한테 감사 표현을 하더라고요. 부부관계 개선에 진짜 효과 있는 것 같습니다.',
    isAnonymous: false,
  },
];

async function seedPosts() {
  console.log('🔑 Access token 가져오는 중...');
  const accessToken = await getAccessToken();
  console.log('✅ 인증 성공\n');

  const now = Date.now();
  let successCount = 0;

  for (let i = 0; i < POSTS.length; i++) {
    const post = POSTS[i];
    const demoUser = DEMO_USERS[post.userIdx];

    // 시간 분산: 최근 7일에 걸쳐 (오래된 것부터)
    const hoursAgo = Math.floor((POSTS.length - i) * 16 + Math.random() * 8);
    const postDate = new Date(now - hoursAgo * 60 * 60 * 1000);

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
      const result = await createDocument(accessToken, 'posts', toFirestoreFields(docData));
      const docId = result.name.split('/').pop();
      const timeStr = postDate.toLocaleString('ko-KR', {timeZone: 'Asia/Seoul'});
      console.log(`✅ [${i + 1}/10] "${post.title}"`);
      console.log(`   📅 ${timeStr}  🆔 ${docId}`);
      successCount++;
    } catch (err) {
      console.error(`❌ [${i + 1}/10] 실패: ${err.message}`);
    }

    // API rate limit 방지 200ms 대기
    await new Promise(r => setTimeout(r, 200));
  }

  console.log(`\n🎉 총 ${successCount}/${POSTS.length}개 게시글 작성 완료!`);
}

seedPosts().catch(err => {
  console.error('❌ 에러:', err.message);
  process.exit(1);
});
