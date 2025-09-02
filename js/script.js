// ===============================
// 1) Theme Vars
// ===============================
const light = {
  '--bg':'#F6F7FB',
  '--surface':'#FFFFFF',
  '--surface-2':'#F2F4F7',
  '--text':'#0B1220',
  '--muted':'#667085',
  '--line':'rgba(0,0,0,.12)',
  '--accent':'#2563EB',
  '--header-glass':'#F6F7FB',
  '--header-glass-strong':'#F6F7FB',
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

// 현재 테마를 :root[data-theme]로 표시하고, CSS 변수 주입
function applyTheme(mode){
  const vars = mode === 'light' ? light : dark;
  Object.entries(vars).forEach(([k,v]) =>
    document.documentElement.style.setProperty(k, v)
  );
  document.documentElement.setAttribute('data-theme', mode);
  localStorage.setItem('theme', mode);
}

function initTheme(){
  const saved = localStorage.getItem('theme');
  if (saved === 'light' || saved === 'dark') {
    applyTheme(saved);
  } else {
    // 저장값 없으면 OS 선호도 따름
    const prefers = matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark';
    applyTheme(prefers);
  }
}

// ===============================
// 2) DOM Ready
// ===============================
document.addEventListener('DOMContentLoaded', () => {
  initTheme();

  // Theme toggle
  const btn = document.querySelector('.theme-toggle');
  btn?.addEventListener('click', () => {
    const curr = document.documentElement.getAttribute('data-theme') || 'dark';
    applyTheme(curr === 'dark' ? 'light' : 'dark');
  });

  // Sticky header
  const header = document.querySelector('.site-header');
  if(header){
    const sentinel = document.createElement('div');
    sentinel.style.position='absolute';
    sentinel.style.top='0';
    sentinel.style.height='1px';
    sentinel.style.width='1px';
    header.before(sentinel);

    new IntersectionObserver(([e]) => {
      header.classList.toggle('is-stuck', !e.isIntersecting);
    }, {threshold:0}).observe(sentinel);
  }

  // Smooth scroll (Works 영상 카드 제외)
  document.addEventListener('click', (e) => {
    const a = e.target.closest('a[href^="#"]');
    if (!a) return;
    if (a.matches('.work-card[data-video]')) return;
    const id = a.getAttribute('href');
    if (id && id.length > 1) {
      e.preventDefault();
      document.querySelector(id)?.scrollIntoView({ behavior: 'smooth' });
    }
  });

  // Back-to-top
  const topBtn = document.querySelector('.back-to-top');
  if(topBtn){
    const onScroll = () => {
      if (window.scrollY > 400) topBtn.classList.add('show');
      else topBtn.classList.remove('show');
    };
    onScroll();
    window.addEventListener('scroll', onScroll);
    topBtn.addEventListener('click', () => window.scrollTo({top:0, behavior:'smooth'}));
  }

  // ===============================
  // 3) Video Lightbox (YouTube)
  // ===============================
  const modal  = document.getElementById('videoModal');
  const iframe = document.getElementById('videoFrame');

  const ytExtractID = (input) => {
    if(!input) return '';
    if(/^[a-zA-Z0-9_-]{11}$/.test(input)) return input;
    try{
      const u = new URL(input);
      const v = u.searchParams.get('v');
      if(v) return v;
      const parts = u.pathname.split('/').filter(Boolean);
      return parts.pop() || '';
    }catch{ return input; }
  };

  const openVideo = (idOrUrl) => {
    const id = ytExtractID(idOrUrl);
    iframe.src = `https://www.youtube.com/embed/${id}?autoplay=1&rel=0&modestbranding=1&playsinline=1`;
    modal.classList.add('open');
    document.body.classList.add('no-scroll');
  };
  const closeVideo = () => {
    iframe.src = '';
    modal.classList.remove('open');
    document.body.classList.remove('no-scroll');
  };

  document.addEventListener('click', (e) => {
    const card = e.target.closest('.work-card[data-video]');
    if (!card) return;

    if (e.metaKey || e.ctrlKey) {
      window.open(card.getAttribute('data-video'), '_blank', 'noopener');
      return;
    }
    e.preventDefault();
    openVideo(card.getAttribute('data-video'));
  });

  document.addEventListener('auxclick', (e) => {
    if (e.button !== 1) return;
    const card = e.target.closest('.work-card[data-video]');
    if (!card) return;
    e.preventDefault();
    window.open(card.getAttribute('data-video'), '_blank', 'noopener');
  });

  modal?.addEventListener('click', (e)=> {
    if(e.target.hasAttribute('data-close')) closeVideo();
  });
  window.addEventListener('keydown', (e)=> {
    if(e.key === 'Escape' && modal?.classList.contains('open')) closeVideo();
  });

  // ===============================
  // 4) 썸네일 자동 주입 (data-thumb > YouTube)
  // ===============================
  const thumbByYouTubeId = (id) => ([
    `https://i.ytimg.com/vi/${id}/maxresdefault.jpg`,
    `https://i.ytimg.com/vi/${id}/sddefault.jpg`,
    `https://i.ytimg.com/vi/${id}/hqdefault.jpg`
  ]);
  const setThumbBackground = (elem, urls) => {
    const img = new Image();
    let i = 0;
    img.onload = () => { elem.style.backgroundImage = `url("${img.src}")`; };
    img.onerror = () => { i += 1; if (i < urls.length) img.src = urls[i]; };
    img.src = urls[i];
  };

  document.querySelectorAll('.work-card .thumb').forEach(thumb => {
    const card = thumb.closest('.work-card');
    const manual = card?.getAttribute('data-thumb');
    if (manual) { thumb.style.backgroundImage = `url("${manual}")`; return; }

    const raw = card?.getAttribute('data-video');
    if (!raw) return;
    const id = ytExtractID(raw);
    if (!id) return;
    setThumbBackground(thumb, thumbByYouTubeId(id));
  });
});
// Detail Page 처리
document.addEventListener('click', (e) => {
  const card = e.target.closest('.work-card[data-detail]');
  if (!card) return;

  const link = card.getAttribute('data-detail');
  window.open(link, '_blank', 'noopener');
});
