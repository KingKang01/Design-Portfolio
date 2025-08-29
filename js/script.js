// js/script.js
document.addEventListener('DOMContentLoaded', () => {
  /* ───────── Theme(팔레트) + Video 전환 ───────── */

  // 팔레트(현재 CSS는 다크가 기본이라 JS로 라이트 팔레트 주입)
  const light = {
    '--bg':'#F6F7FB',
    '--surface':'#FFFFFF',
    '--surface-2':'#F2F4F7',
    '--text':'#0B1220',
    '--muted':'#667085',
    '--line':'rgba(0,0,0,.12)',
    '--accent':'#2563EB',
    '--header-glass':'#EDF4FF',
    '--header-glass-strong':'#DCE9FA',
    '--header-blur':'none',
    '--header-shadow':'none'
  };

  const dark = {
    '--bg':'#0A0B0D',
    '--surface':'#0E1013',
    '--surface-2':'#0B0C10',
    '--text':'#ECEFF3',
    '--muted':'#A2A9B2',
    '--line':'rgba(255,255,255,.18)',
    '--accent':'#86C7FF',
    '--header-glass':'rgba(10,11,13,.75)',
    '--header-glass-strong':'rgba(10,11,13,.85)',
    '--header-blur':'saturate(120%) blur(6px)',
    '--header-shadow':'0 6px 16px rgba(0,0,0,.28)'
  };

  const applyThemeVars = (vars) => {
    Object.entries(vars).forEach(([k, v]) =>
      document.documentElement.style.setProperty(k, v)
    );
  };

  // 비디오 엘리먼트
  const vLight = document.querySelector('.video-light');
  const vDark  = document.querySelector('.video-dark');

  // 보여줄 비디오만 재생, 나머지는 멈춤
  const showLight = () => {
    document.body.classList.remove('dark-mode');
    document.body.classList.add('light-mode');
    applyThemeVars(light);
    vDark?.pause(); if (vDark) vDark.currentTime = 0;
    vLight?.play();
  };
  const showDark = () => {
    document.body.classList.remove('light-mode');
    document.body.classList.add('dark-mode');
    applyThemeVars(dark);
    vLight?.pause(); if (vLight) vLight.currentTime = 0;
    vDark?.play();
  };

  // 초기 모드: OS 설정을 따르되, CSS 기본이 다크라서 그대로 두어도 됨.
  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
  if (!document.body.classList.contains('light-mode') &&
      !document.body.classList.contains('dark-mode')) {
    prefersDark ? showDark() : showLight();
  }

  // 토글 버튼
  const btn = document.querySelector('.theme-toggle');
  btn?.addEventListener('click', () => {
    if (document.body.classList.contains('light-mode')) showDark();
    else showLight();
  });

  /* ───────── 아래부터 너가 쓰던 코드 그대로 유지 ───────── */

  /* Sticky header */
  const header = document.querySelector('.site-header');
  if (header) {
    const sentinel = document.createElement('div');
    sentinel.style.position = 'absolute';
    sentinel.style.top = '0';
    sentinel.style.height = '1px';
    sentinel.style.width  = '1px';
    header.before(sentinel);

    new IntersectionObserver(([e]) => {
      header.classList.toggle('is-stuck', !e.isIntersecting);
    }, { threshold: 0 }).observe(sentinel);
  }

  /* Smooth scroll */
  document.addEventListener('click', (e) => {
    const a = e.target.closest('a[href^="#"]');
    if (!a) return;
    if (a.matches('.work-card[data-video]')) return; // 모달 링크 예외
    const id = a.getAttribute('href');
    if (id && id.length > 1) {
      e.preventDefault();
      document.querySelector(id)?.scrollIntoView({ behavior: 'smooth' });
    }
  });

  /* Video modal (네 코드 그대로) */
  const modal  = document.getElementById('videoModal');
  const iframe = document.getElementById('videoFrame');

  const extractYouTubeID = (input) => {
    if (!input) return '';
    if (/^[a-zA-Z0-9_-]{11}$/.test(input)) return input;
    try {
      const u = new URL(input);
      const v = u.searchParams.get('v');
      if (v) return v;
      const parts = u.pathname.split('/').filter(Boolean);
      return parts.pop() || '';
    } catch { return input; }
  };

  const openVideo = (idOrUrl) => {
    if (!modal || !iframe) return;
    const id  = extractYouTubeID(idOrUrl);
    const src = `https://www.youtube.com/embed/${id}?autoplay=1&rel=0&modestbranding=1&playsinline=1`;
    iframe.src = src;
    modal.classList.add('open');
    document.body.classList.add('no-scroll');
  };

  const closeVideo = () => {
    if (!modal || !iframe) return;
    iframe.src = '';
    modal.classList.remove('open');
    document.body.classList.remove('no-scroll');
  };

  document.addEventListener('click', (e) => {
    const card = e.target.closest('.work-card');
    if (!card) return;
    const video  = card.getAttribute('data-video');
    const detail = card.getAttribute('data-detail');
    if (e.ctrlKey || e.metaKey) {
      if (detail) window.open(detail, '_blank', 'noopener');
      else if (video) window.open(video,  '_blank', 'noopener');
      return;
    }
    if (video || detail) {
      e.preventDefault();
      if (detail) window.open(detail, '_blank', 'noopener');
      else if (video) openVideo(video);
    }
  });

  document.addEventListener('auxclick', (e) => {
    if (e.button !== 1) return;
    const card = e.target.closest('.work-card');
    if (!card) return;
    const video  = card.getAttribute('data-video');
    const detail = card.getAttribute('data-detail');
    e.preventDefault();
    if (detail) window.open(detail, '_blank', 'noopener');
    else if (video) window.open(video,   '_blank', 'noopener');
  });

  modal?.addEventListener('click', (e) => {
    if (e.target.hasAttribute('data-close')) closeVideo();
  });
  window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && modal?.classList.contains('open')) closeVideo();
  });

  // 썸네일 주입
  const ytThumbURLs = (id) => ([
    `https://i.ytimg.com/vi/${id}/maxresdefault.jpg`,
    `https://i.ytimg.com/vi/${id}/sddefault.jpg`,
    `https://i.ytimg.com/vi/${id}/hqdefault.jpg`
  ]);
  const setThumbBackground = (elem, urls) => {
    const img = new Image();
    let i = 0;
    img.onload  = () => { elem.style.backgroundImage = `url("${img.src}")`; };
    img.onerror = () => { i += 1; if (i < urls.length) img.src = urls[i]; };
    img.src = urls[i];
  };
  document.querySelectorAll('.work-card .thumb').forEach(thumb => {
    const card   = thumb.closest('.work-card');
    const manual = card?.getAttribute('data-thumb');
    if (manual) { thumb.style.backgroundImage = `url("${manual}")`; return; }
    const raw = card?.getAttribute('data-video');
    if (!raw) return;
    const id = extractYouTubeID(raw);
    if (!id) return;
    setThumbBackground(thumb, ytThumbURLs(id));
  });
});
// ── Hero 비디오: 보이면 재생, 사라지면 멈추고 처음으로 ─────────────────
(() => {
  const videos = document.querySelectorAll('.hero-frame .video');

  // 접근성: 모션 줄임 선호 시 재생 안 함
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // 현재 테마에 맞는 비디오만 활성화
  function activeVideo() {
    const dark = document.body.classList.contains('dark-mode');
    return [...videos].find(v => (dark ? v.classList.contains('video-dark')
                                       : v.classList.contains('video-light')));
  }

  const io = new IntersectionObserver((entries) => {
    if (reduceMotion) return;

    entries.forEach(entry => {
      const v = entry.target;
      const isActive = v === activeVideo();

      if (!isActive) { // 숨김 영상은 항상 정지 & 0으로
        v.pause();
        v.currentTime = 0;
        return;
      }

      if (entry.isIntersecting && entry.intersectionRatio > 0.6) {
        // 화면에 충분히 들어오면 처음부터 재생
        try {
          v.currentTime = 0;
          v.play();
        } catch(_) {}
      } else {
        // 벗어나면 멈추고 다시 처음으로
        v.pause();
        v.currentTime = 0;
      }
    });
  }, { threshold: [0, .6, 1] });

  videos.forEach(v => {
    // 영상 끝나면 그 프레임에 멈추고(깜빡임 방지), 다음에 다시 들어오면 0에서 재생
    v.loop = false;
    v.addEventListener('ended', () => {
      v.pause();
      // 마지막 프레임 유지 (표시용), 다시 들어오면 위 로직이 0으로 되감아줌
    });
    io.observe(v);
  });

  // 테마 바뀔 때: 이전 영상 멈추고 0으로, 새 영상은 처음부터 play
  const togglePlayForTheme = () => {
    const cur = activeVideo();
    videos.forEach(v => {
      if (v !== cur) { v.pause(); v.currentTime = 0; }
    });
    if (!reduceMotion && cur) {
      try { cur.currentTime = 0; cur.play(); } catch(_) {}
    }
  };

  // 기존 토글 버튼에 이미 리스너가 있다면, 토글 직후에 이것만 한 줄 호출해 주세요.
  // 예: applyTheme(...) 다음 줄에:
  // togglePlayForTheme();
  window._heroTogglePlayForTheme = togglePlayForTheme; // 필요시 외부에서 호출할 수 있게
})();
