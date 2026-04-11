/**
 * Firestore 인덱스 상태 체크 (READY vs CREATING)
 * 실행: node scripts/check-indexes.js
 */
const {execSync} = require('child_process');
const https = require('https');
const fs = require('fs');
const os = require('os');

const PROJECT_ID = 'dadcommunity-ae202';

function getAccessToken() {
  const configPath = os.homedir() + '/.config/configstore/firebase-tools.json';
  const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
  const refreshToken = config.tokens?.refresh_token;
  if (!refreshToken) throw new Error('No refresh token found');

  return new Promise((resolve, reject) => {
    const postData = `grant_type=refresh_token&refresh_token=${encodeURIComponent(refreshToken)}&client_id=563584335869-fgrhgmd47bqnekij5i8b5pr03ho849e6.apps.googleusercontent.com&client_secret=j9iVZfS8kkCEFUPaAeJV0sAi`;
    const req = https.request({
      hostname: 'oauth2.googleapis.com',
      path: '/token',
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Content-Length': Buffer.byteLength(postData),
      },
    }, res => {
      let data = '';
      res.on('data', c => (data += c));
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

function listIndexes(accessToken) {
  return new Promise((resolve, reject) => {
    const req = https.request({
      hostname: 'firestore.googleapis.com',
      path: `/v1/projects/${PROJECT_ID}/databases/(default)/collectionGroups/-/indexes`,
      method: 'GET',
      headers: { Authorization: `Bearer ${accessToken}` },
    }, res => {
      let data = '';
      res.on('data', c => (data += c));
      res.on('end', () => {
        if (res.statusCode >= 200 && res.statusCode < 300) {
          resolve(JSON.parse(data));
        } else {
          reject(new Error(`HTTP ${res.statusCode}: ${data}`));
        }
      });
    });
    req.on('error', reject);
    req.end();
  });
}

(async () => {
  try {
    const token = await getAccessToken();
    const result = await listIndexes(token);
    const indexes = result.indexes || [];
    console.log(`총 ${indexes.length}개 인덱스\n`);
    for (const idx of indexes) {
      const fields = (idx.fields || [])
        .filter(f => f.fieldPath !== '__name__')
        .map(f => `${f.fieldPath}(${f.order || f.arrayConfig || '?'})`)
        .join(', ');
      const coll = idx.name.split('/').slice(-3, -2)[0]; // collectionGroups/{id}/indexes/...
      console.log(`[${idx.state}] ${coll} ${idx.queryScope}: ${fields}`);
    }
  } catch (e) {
    console.error('ERROR:', e.message);
    process.exit(1);
  }
})();
