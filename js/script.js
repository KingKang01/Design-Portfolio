// js/script.js

// 모든 코드 DOM 로드 후 실행
document.addEventListener('DOMContentLoaded', () => {
  /* ───────────────── Theme toggle ───────────────── */
// ── Theme toggle ─────────────────────────────────────
const btn = document.querySelector('.theme-toggle');
btn?.addEventListener('click', () => {
  const isDark = getComputedStyle(document.documentElement).getPropertyValue('--bg').trim() === '#0A0B0D';

// 팔레트 (네가 올린 버전 그대로 예시)
const light = {
  '--bg':'#F6F7FB',
  '--surface':'#FFFFFF',
  '--surface-2':'#F2F4F7',
  '--text':'#0B1220',
  '--muted':'#667085',
  '--line':'rgba(0,0,0,.12)',
  '--accent':'#2563EB',

  // ⬇️ 라이트: 본문과 동일, 유리/그림자 OFF
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

  // ⬇️ 다크: 살짝 유리감 + 그림자 ON
  '--header-glass':'rgba(10,11,13,.75)',
  '--header-glass-strong':'rgba(10,11,13,.85)',
  '--header-blur':'saturate(120%) blur(6px)',
  '--header-shadow':'0 6px 16px rgba(0,0,0,.28)'
};

// 공통 적용 함수
function applyTheme(vars){
  Object.entries(vars).forEach(([k,v]) =>
    document.documentElement.style.setProperty(k, v)
  );
}

// 토글 (현재 다크인지 라이트인지 체크해서 전환)
const btn = document.querySelector('.theme-toggle');
btn?.addEventListener('click', () => {
  const currentBg = getComputedStyle(document.documentElement).getPropertyValue('--bg').trim();
  const isDark = currentBg === '#0A0B0D';
  applyTheme(isDark ? light : dark);
});

// 페이지 첫 로드 상태가 다크라면(지금 네 CSS 기본이 다크) 아래 줄은 선택 사항
// applyTheme(dark);

});



  /* ───────────────── Sticky header ──────────────── */
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

  /* ───────────────── Smooth scroll ──────────────── */
  document.addEventListener('click', (e) => {
    const a = e.target.closest('a[href^="#"]');
    if (!a) return;

    // 모달로 여는 카드(=data-video)는 스크롤 막음
    if (a.matches('.work-card[data-video]')) return;

    const id = a.getAttribute('href');
    if (id && id.length > 1) {
      e.preventDefault();
      document.querySelector(id)?.scrollIntoView({ behavior: 'smooth' });
    }
  });

  /* ───────────────── Lightbox Video ─────────────── */
  const modal  = document.getElementById('videoModal');
  const iframe = document.getElementById('videoFrame');

  const extractYouTubeID = (input) => {
    if (!input) return '';
    if (/^[a-zA-Z0-9_-]{11}$/.test(input)) return input; // 이미 ID
    try {
      const u = new URL(input);
      const v = u.searchParams.get('v');
      if (v) return v;                       // ...watch?v=ID
      const parts = u.pathname.split('/').filter(Boolean);
      return parts.pop() || '';              // youtu.be/ID /shorts/ID /embed/ID
    } catch {
      return input;
    }
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

  // 카드 클릭: 좌클릭=모달/상세, ⌘/Ctrl/중클릭=새 탭
  document.addEventListener('click', (e) => {
    const card = e.target.closest('.work-card');
    if (!card) return;

    const video  = card.getAttribute('data-video');
    const detail = card.getAttribute('data-detail');

    // Ctrl/⌘ 클릭은 새 탭
    if (e.ctrlKey || e.metaKey) {
      if (detail) window.open(detail, '_blank', 'noopener');
      else if (video) window.open(video,  '_blank', 'noopener');
      return;
    }

    if (video || detail) {
      e.preventDefault();
      if (detail) {
        window.open(detail, '_blank', 'noopener');
      } else if (video) {
        openVideo(video);
      }
    }
  });

  // 중클릭(휠 클릭) 새 탭
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

  // 닫기(배경/X/ESC)
  modal?.addEventListener('click', (e) => {
    if (e.target.hasAttribute('data-close')) closeVideo();
  });
  window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && modal?.classList.contains('open')) closeVideo();
  });

  /* ─────────────── YouTube 썸네일 자동 주입 ───────── */
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
    if (manual) {            // 수동 썸네일 우선
      thumb.style.backgroundImage = `url("${manual}")`;
      return;
    }
    const raw = card?.getAttribute('data-video');
    if (!raw) return;
    const id = extractYouTubeID(raw);
    if (!id) return;
    setThumbBackground(thumb, ytThumbURLs(id));
  });
});
