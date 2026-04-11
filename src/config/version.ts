/**
 * 앱 버전 상수.
 *
 * ⚠️ 릴리스 시 반드시 아래 3곳을 동시에 업데이트해야 함:
 *   1. 이 파일 (APP_VERSION)
 *   2. android/app/build.gradle (versionName / versionCode)
 *   3. Firestore appConfig/version 문서 (latestVersion / minimumVersion / releaseNotes)
 *
 * 이 상수가 build.gradle versionName과 다르면 버전 비교 로직이 잘못 작동한다.
 */
export const APP_VERSION = '1.0.5';

/** Android applicationId — Play Store 링크 생성용 */
export const ANDROID_PACKAGE_ID = 'com.dadcommunity';

export const PLAY_STORE_URL = `https://play.google.com/store/apps/details?id=${ANDROID_PACKAGE_ID}`;
