import React, {useCallback, useEffect, useState} from 'react';
import {Linking} from 'react-native';
import firestore from '@react-native-firebase/firestore';
import {useApp} from '../context/AppContext';
import {APP_VERSION, PLAY_STORE_URL} from '../config/version';
import {
  VersionConfig,
  fetchVersionConfig,
  resolveUpdateMode,
} from '../services/versionService';
import UpdateModal, {UpdateModalMode} from './UpdateModal';

/**
 * 전역 버전 게이트.
 *
 * 앱 최상위에 위치하며 다음 2가지를 책임진다:
 *   1. Firestore `appConfig/version` 를 fetch 해서 현재 앱 버전과 비교
 *   2. 상태에 따라 Force / Recommended / Welcome 모달 표시
 *
 * 실행 시점: 유저가 로그인된 이후 (uid 가 있어야 users.lastSeenVersion 저장 가능).
 * 비로그인 상태에서는 아무것도 하지 않음.
 *
 * 네트워크/설정 오류 시 조용히 skip — 버전 체크 실패가 앱 차단으로 이어지면 안 됨.
 */
export default function VersionGate() {
  const {state} = useApp();
  const [config, setConfig] = useState<VersionConfig | null>(null);
  const [mode, setMode] = useState<UpdateModalMode | null>(null);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    if (!state.uid) return;
    // 세션당 1회만 체크 (이미 dismiss 했거나 mode 가 정해진 상태면 재실행 skip)
    if (mode !== null || dismissed) return;

    let cancelled = false;
    (async () => {
      const cfg = await fetchVersionConfig();
      if (cancelled || !cfg) return;
      setConfig(cfg);

      const resolved = resolveUpdateMode(
        APP_VERSION,
        cfg,
        state.user?.lastSeenVersion,
      );
      if (resolved !== null) {
        setMode(resolved);

        // welcome 모드 진입 시 즉시 lastSeenVersion 업데이트
        // (유저가 모달을 닫기 전에 앱 강제종료해도 다음 실행 때 중복 표시 방지)
        if (resolved === 'welcome' && state.uid) {
          firestore()
            .collection('users')
            .doc(state.uid)
            .set({lastSeenVersion: APP_VERSION}, {merge: true})
            .catch(() => {});
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [state.uid, state.user?.lastSeenVersion, mode, dismissed]);

  const handleUpdate = useCallback(() => {
    const url = config?.playStoreUrl || PLAY_STORE_URL;
    Linking.openURL(url).catch(() => {});
    // force/recommended 모드에서 Play Store 로 이동 후 앱으로 돌아왔을 때도
    // 다시 모달을 안 띄우도록 dismiss 플래그만 내려둠 (force 는 재진입 시 다시 계산됨)
  }, [config]);

  const handleDismiss = useCallback(() => {
    setMode(null);
    setDismissed(true);
  }, []);

  if (!mode || !config) return null;

  return (
    <UpdateModal
      visible
      mode={mode}
      version={config.latestVersion}
      releaseNotes={config.updateMessage}
      onUpdate={handleUpdate}
      onDismiss={mode === 'force' ? undefined : handleDismiss}
    />
  );
}
