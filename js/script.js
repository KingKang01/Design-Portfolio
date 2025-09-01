// js/script.js
document.addEventListener('DOMContentLoaded', () => {
  /* ───────── Theme(팔레트)만 전환 ───────── */

  // 라이트/다크 팔레트 변수
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

  // 테마 전환 (이미지 표시만 바뀜)
  const showLight = () => {
    document.body.classList.remove('dark-mode');
    document.body.classList.add('light-mode');
    applyThemeVars(light);
  };
  const showDark = () => {
    document.body.classList.remove('light-mode');
    document.body.classList.add('dark-mode');
    applyThemeVars(dark);
  };

  // 초기 상태: OS 선호 따라가기
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

  /* ───────── Sticky header ───────── */
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

  /* ───────── Smooth scroll ───────── */
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

  /* ───────── Video modal (Works) ───────── */
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

/* (중요) 과거 Hero 비디오 재생/관찰 코드 전부 삭제됨 */
