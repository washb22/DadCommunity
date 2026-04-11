import firestore from '@react-native-firebase/firestore';
import {Platform} from 'react-native';

/**
 * 앱 버전 관리 설정.
 *
 * Firestore `appConfig/appVersion` 문서를 읽는다. 이 문서는 admin/index.html 의
 * "앱 버전 관리" 페이지에서 편집 가능. 스키마는 기존 admin UI 와 1:1 대응.
 *
 * 스키마:
 * {
 *   minVersionAndroid: "1.0.0",   // 이 미만이면 강제 업데이트 (Android)
 *   minVersionIos:     "1.0.0",   // iOS 용 (현재 미배포, 비워둬도 무방)
 *   latestVersion:     "1.0.4",   // 현재 최신 버전
 *   updateMessage:     "...",     // 릴리스 노트 / 업데이트 메시지
 *   forceUpdateEnabled: false,    // true 면 latestVersion 미만 전체 강제
 *   playStoreUrl:      "https://play.google.com/store/apps/details?id=...",
 *   appStoreUrl:       "https://apps.apple.com/app/..."
 * }
 */
export interface VersionConfig {
  minVersionAndroid: string;
  minVersionIos: string;
  latestVersion: string;
  updateMessage: string;
  forceUpdateEnabled: boolean;
  playStoreUrl?: string;
  appStoreUrl?: string;
}

/**
 * Firestore 에서 버전 설정 가져오기.
 * 문서 없음/에러 발생 시 null 반환 → 버전 체크 skip (안전한 기본값).
 */
export async function fetchVersionConfig(): Promise<VersionConfig | null> {
  try {
    const doc = await firestore()
      .collection('appConfig')
      .doc('appVersion')
      .get();
    if (!doc.exists) return null;
    const data = doc.data();
    if (!data) return null;
    // 최신 버전은 필수. 나머지는 기본값으로 채움.
    if (typeof data.latestVersion !== 'string' || !data.latestVersion) {
      return null;
    }
    return {
      minVersionAndroid:
        typeof data.minVersionAndroid === 'string' ? data.minVersionAndroid : '',
      minVersionIos:
        typeof data.minVersionIos === 'string' ? data.minVersionIos : '',
      latestVersion: data.latestVersion,
      updateMessage:
        typeof data.updateMessage === 'string' ? data.updateMessage : '',
      forceUpdateEnabled: data.forceUpdateEnabled === true,
      playStoreUrl:
        typeof data.playStoreUrl === 'string' ? data.playStoreUrl : undefined,
      appStoreUrl:
        typeof data.appStoreUrl === 'string' ? data.appStoreUrl : undefined,
    };
  } catch (error) {
    console.warn('[version] fetchVersionConfig failed:', error);
    return null;
  }
}

/**
 * semver-like 버전 비교.
 * "1.0.4" → [1, 0, 4] 로 파싱 후 lexicographical 비교.
 * 형식이 다르면 0 반환 (비교 불가).
 *
 * @returns a < b 이면 음수, a > b 이면 양수, 같으면 0
 */
export function compareVersions(a: string, b: string): number {
  if (!a || !b) return 0;
  const pa = a.split('.').map(n => parseInt(n, 10));
  const pb = b.split('.').map(n => parseInt(n, 10));
  if (pa.some(isNaN) || pb.some(isNaN)) return 0;
  const len = Math.max(pa.length, pb.length);
  for (let i = 0; i < len; i++) {
    const av = pa[i] ?? 0;
    const bv = pb[i] ?? 0;
    if (av !== bv) return av - bv;
  }
  return 0;
}

/**
 * 현재 앱 버전 기반 업데이트 모드 결정.
 *
 * 강제 업데이트 조건 (OR):
 *   1. forceUpdateEnabled == true AND current < latestVersion
 *   2. current < minVersionAndroid (Android) / minVersionIos (iOS)
 *
 * 권장 업데이트:
 *   - current < latestVersion 이고 강제가 아닐 때
 *
 * 환영 모달 (업데이트 완료 직후 1회):
 *   - current >= latestVersion 이고 lastSeenVersion !== current 일 때
 *
 * @returns 'force' | 'recommended' | 'welcome' | null
 */
export function resolveUpdateMode(
  current: string,
  config: VersionConfig,
  lastSeenVersion: string | undefined,
): 'force' | 'recommended' | 'welcome' | null {
  const minVersion =
    Platform.OS === 'ios' ? config.minVersionIos : config.minVersionAndroid;

  const belowLatest = compareVersions(current, config.latestVersion) < 0;
  const belowMinimum =
    !!minVersion && compareVersions(current, minVersion) < 0;

  // (1) 전역 강제 스위치가 켜져있고 최신보다 낮은 경우
  if (config.forceUpdateEnabled && belowLatest) {
    return 'force';
  }
  // (2) 최소 요구 버전보다 낮은 경우
  if (belowMinimum) {
    return 'force';
  }
  // (3) 권장 업데이트
  if (belowLatest) {
    return 'recommended';
  }
  // (4) 업데이트 완료 상태 — 첫 실행 시 환영 모달
  if (lastSeenVersion !== current) {
    return 'welcome';
  }
  return null;
}
