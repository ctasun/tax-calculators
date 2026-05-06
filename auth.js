/**
 * 세무 계산기 접속 인증 스크립트
 * 비밀번호 변경 시 CORRECT_HASH 값만 새 SHA-256 해시로 교체
 * 현재 비밀번호: samho0115! (변경 시 알려주세요)
 */
(function() {
  const CORRECT_HASH = 'c478cb090d719b82d94f58da9cf318c74e641b809882087772a0243a3925e9b0';

  // 이미 인증된 경우 즉시 통과
  if (localStorage.getItem('tax-calc-auth') === CORRECT_HASH) {
    return;
  }

  // 인증 안 됨 - 메인 콘텐츠 즉시 숨김 (인증 오버레이만 보이도록)
  const guardStyle = document.createElement('style');
  guardStyle.id = 'authGuard';
  guardStyle.textContent = 'body > *:not(#authOverlay) { display: none !important; }';
  if (document.head) {
    document.head.appendChild(guardStyle);
  } else {
    document.addEventListener('DOMContentLoaded', () => document.head.appendChild(guardStyle));
  }

  async function sha256(str) {
    const buf = new TextEncoder().encode(str);
    const hash = await crypto.subtle.digest('SHA-256', buf);
    return Array.from(new Uint8Array(hash))
      .map(b => b.toString(16).padStart(2, '0'))
      .join('');
  }

  window.checkAuthPassword = async function() {
    const pwEl = document.getElementById('authPw');
    const errEl = document.getElementById('authError');
    const pw = pwEl.value;
    if (!pw) return;

    const hash = await sha256(pw);
    if (hash === CORRECT_HASH) {
      localStorage.setItem('tax-calc-auth', hash);
      const guard = document.getElementById('authGuard');
      const overlay = document.getElementById('authOverlay');
      if (guard) guard.remove();
      if (overlay) overlay.remove();
    } else {
      errEl.textContent = '비밀번호가 틀렸습니다.';
      pwEl.value = '';
      pwEl.focus();
    }
  };

  function showAuthOverlay() {
    const overlay = document.createElement('div');
    overlay.id = 'authOverlay';
    overlay.style.cssText = 'position:fixed;top:0;left:0;right:0;bottom:0;background:linear-gradient(135deg,#f5f7fa 0%,#e8eef5 100%);display:flex;align-items:center;justify-content:center;z-index:99999;font-family:-apple-system,BlinkMacSystemFont,"Segoe UI","Malgun Gothic",sans-serif;';
    overlay.innerHTML =
      '<div style="background:white;padding:40px 32px;border-radius:16px;box-shadow:0 8px 32px rgba(0,0,0,0.1);max-width:380px;width:90%;text-align:center;box-sizing:border-box;">' +
        '<div style="font-size:40px;margin-bottom:16px;">🔒</div>' +
        '<h2 style="font-size:20px;font-weight:700;color:#0d1b2a;margin:0 0 8px 0;">접속 인증</h2>' +
        '<p style="font-size:13px;color:#5a6577;margin:0 0 24px 0;">계속하려면 비밀번호를 입력하세요</p>' +
        '<input type="password" id="authPw" placeholder="비밀번호" ' +
          'style="width:100%;padding:12px;font-size:15px;border:1px solid #d1d9e0;border-radius:8px;margin-bottom:12px;box-sizing:border-box;font-family:inherit;" ' +
          'onkeypress="if(event.key===\'Enter\')checkAuthPassword()">' +
        '<button onclick="checkAuthPassword()" ' +
          'style="width:100%;padding:12px;background:#2c5aa0;color:white;border:none;border-radius:8px;font-size:15px;font-weight:600;cursor:pointer;font-family:inherit;">' +
          '확인' +
        '</button>' +
        '<div id="authError" style="font-size:13px;color:#c92a2a;margin-top:12px;min-height:18px;"></div>' +
        '<p style="font-size:11px;color:#8a94a6;margin-top:20px;">© 김선영 세무사 · 직원 전용</p>' +
      '</div>';
    document.body.appendChild(overlay);
    setTimeout(() => {
      const pwEl = document.getElementById('authPw');
      if (pwEl) pwEl.focus();
    }, 50);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', showAuthOverlay);
  } else {
    showAuthOverlay();
  }
})();
