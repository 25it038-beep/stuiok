/* ===========================
   STUDIO K — script.js
   All interactions & animations
=========================== */

// ─── LOADER ──────────────────────────────────────────────────────────────────
window.addEventListener('load', () => {
  // Force unlock audio context and play audio immediately
  unlockAudioContext();
  playCompletionAudio();
  attachPortfolioAudioTrigger();

  setTimeout(() => {
    const loader = document.getElementById('loader');
    loader.classList.add('hidden');
    initHeroAnimations();
    initCounters();
  }, 800);
});

// ─── AUDIO CONTEXT UNLOCK & PLAYBACK ──────────────────────────────────────────
const completionAudio = new Audio('mixkit-melodical-flute-music-notification-2310.wav');
completionAudio.preload = 'auto';
completionAudio.volume = 1.0;
completionAudio.playsInline = true;
completionAudio.muted = true;

function unlockAudioContext() {
  const AudioContext = window.AudioContext || window.webkitAudioContext;
  if (AudioContext) {
    const audioContext = new AudioContext();
    if (audioContext.state === 'suspended') {
      audioContext.resume().then(() => {
        console.log('Audio context unlocked');
      }).catch(() => {
        console.log('Audio context resume failed');
      });
    }
  }

  completionAudio.load();
}

function playCompletionAudio() {
  if (!completionAudio) return;

  const tryPlay = () => {
    completionAudio.currentTime = 0;
    completionAudio.muted = true;
    completionAudio.play()
      .then(() => {
        completionAudio.muted = false;
        console.log('✅ Completion audio playing at 100% volume!');
      })
      .catch(error => {
        console.log('Audio autoplay blocked or failed:', error.message);
        showAudioFallback();
      });
  };

  if (completionAudio.readyState >= 2) {
    tryPlay();
  } else {
    completionAudio.addEventListener('canplaythrough', tryPlay, { once: true });
    completionAudio.addEventListener('loadeddata', tryPlay, { once: true });
    completionAudio.load();
  }
}

function showAudioFallback() {
  if (document.querySelector('.audio-fallback')) return;

  const fallback = document.createElement('div');
  fallback.className = 'audio-fallback';
  fallback.textContent = 'Tap anywhere to hear the Studio K welcome sound';
  document.body.appendChild(fallback);

  const resumeAudio = () => {
    completionAudio.play().then(() => {
      fallback.remove();
      console.log('✅ Audio playback started after user interaction');
    }).catch(err => {
      console.log('Audio retry after interaction failed:', err.message);
    });
  };

  document.addEventListener('click', resumeAudio, { once: true });
  document.addEventListener('keydown', resumeAudio, { once: true });
}

function playPortfolioAudio() {
  const portfolioAudio = new Audio('mixkit-melodical-flute-music-notification-2310.wav');
  portfolioAudio.preload = 'auto';
  portfolioAudio.volume = 1.0;
  portfolioAudio.playsInline = true;
  portfolioAudio.currentTime = 0;
  portfolioAudio.play().catch(error => {
    console.log('Portfolio audio failed:', error.message);
  });
}

function attachPortfolioAudioTrigger() {
  const portfolioLinks = document.querySelectorAll('a[href="#portfolio"]');
  portfolioLinks.forEach(link => {
    link.addEventListener('click', () => {
      playPortfolioAudio();
    });
  });
}

// ─── HERO ANIMATIONS ─────────────────────────────────────────────────────────
function initHeroAnimations() {
  const els = document.querySelectorAll('.reveal-hero');
  const delays = [0.1, 0.4, 0.7, 1.0, 1.3];
  els.forEach((el, i) => {
    if (el.classList.contains('hero-divider')) {
      el.style.animationDelay = (delays[i] || 0.7) + 's';
      el.classList.add('hero-anim-line');
    } else {
      el.style.animationDelay = (delays[i] || 0) + 's';
      el.classList.add('hero-anim');
    }
  });
}

// ─── CANVAS PARTICLE BACKGROUND ──────────────────────────────────────────────
(function initCanvas() {
  const canvas = document.getElementById('bgCanvas');
  const ctx = canvas.getContext('2d');
  let W, H, particles = [], mouse = { x: -999, y: -999 };
  const isDark = () => document.documentElement.getAttribute('data-theme') !== 'light';

  function resize() {
    W = canvas.width = window.innerWidth;
    H = canvas.height = window.innerHeight;
  }

  class Particle {
    constructor() { this.reset(true); }
    reset(init) {
      this.x = Math.random() * W;
      this.y = init ? Math.random() * H : H + 20;
      this.vx = (Math.random() - 0.5) * 0.3;
      this.vy = -(Math.random() * 0.4 + 0.1);
      this.alpha = 0;
      this.targetAlpha = Math.random() * 0.4 + 0.1;
      this.radius = Math.random() * 1.5 + 0.3;
      this.life = 0;
      this.maxLife = Math.random() * 400 + 200;
    }
    update() {
      this.x += this.vx;
      this.y += this.vy;
      this.life++;
      if (this.life < 60) this.alpha = (this.life / 60) * this.targetAlpha;
      else if (this.life > this.maxLife - 60) this.alpha = ((this.maxLife - this.life) / 60) * this.targetAlpha;
      else this.alpha = this.targetAlpha;

      // Mouse repulsion
      const dx = this.x - mouse.x, dy = this.y - mouse.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist < 100) {
        this.x += (dx / dist) * 0.6;
        this.y += (dy / dist) * 0.6;
      }

      if (this.life >= this.maxLife || this.y < -20) this.reset(false);
    }
    draw() {
      ctx.save();
      ctx.globalAlpha = this.alpha;
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
      ctx.fillStyle = isDark() ? '#c9a84c' : '#a07828';
      ctx.fill();
      ctx.restore();
    }
  }

  // Shooting stars
  class Star {
    constructor() { this.reset(); }
    reset() {
      this.x = Math.random() * W;
      this.y = Math.random() * H * 0.5;
      this.len = Math.random() * 80 + 30;
      this.speed = Math.random() * 8 + 4;
      this.angle = Math.PI / 4 + (Math.random() - 0.5) * 0.3;
      this.alpha = 0;
      this.active = false;
      this.delay = Math.random() * 8000 + 2000;
      setTimeout(() => { this.active = true; this.alpha = 0.8; }, this.delay);
    }
    update() {
      if (!this.active) return;
      this.x += Math.cos(this.angle) * this.speed;
      this.y += Math.sin(this.angle) * this.speed;
      this.alpha -= 0.012;
      if (this.alpha <= 0) this.reset();
    }
    draw() {
      if (!this.active || this.alpha <= 0) return;
      ctx.save();
      ctx.globalAlpha = this.alpha * 0.5;
      ctx.strokeStyle = isDark() ? '#c9a84c' : '#a07828';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(this.x, this.y);
      ctx.lineTo(this.x - Math.cos(this.angle) * this.len, this.y - Math.sin(this.angle) * this.len);
      ctx.stroke();
      ctx.restore();
    }
  }

  resize();
  window.addEventListener('resize', resize);
  window.addEventListener('mousemove', e => { mouse.x = e.clientX; mouse.y = e.clientY; });

  for (let i = 0; i < 120; i++) particles.push(new Particle());
  const stars = Array.from({ length: 5 }, () => new Star());

  function animate() {
    ctx.clearRect(0, 0, W, H);
    particles.forEach(p => { p.update(); p.draw(); });
    if (isDark()) stars.forEach(s => { s.update(); s.draw(); });
    requestAnimationFrame(animate);
  }
  animate();
})();

// ─── CURSOR ───────────────────────────────────────────────────────────────────
(function initCursor() {
  const cursor = document.getElementById('cursor');
  const ring = document.getElementById('cursorRing');
  let mx = 0, my = 0, rx = 0, ry = 0;

  document.addEventListener('mousemove', e => {
    mx = e.clientX; my = e.clientY;
    cursor.style.left = mx + 'px';
    cursor.style.top = my + 'px';
  });

  function lerp(a, b, t) { return a + (b - a) * t; }
  function animateRing() {
    rx = lerp(rx, mx, 0.1);
    ry = lerp(ry, my, 0.1);
    ring.style.left = rx + 'px';
    ring.style.top = ry + 'px';
    requestAnimationFrame(animateRing);
  }
  animateRing();

  document.querySelectorAll('a, button, .port-item, .service-card, .filter-btn, .t-dot').forEach(el => {
    el.addEventListener('mouseenter', () => { cursor.classList.add('hovering'); ring.classList.add('hovering'); });
    el.addEventListener('mouseleave', () => { cursor.classList.remove('hovering'); ring.classList.remove('hovering'); });
  });
  document.addEventListener('mousedown', () => cursor.classList.add('clicking'));
  document.addEventListener('mouseup', () => cursor.classList.remove('clicking'));
})();

// ─── THEME TOGGLE ─────────────────────────────────────────────────────────────
(function initTheme() {
  const btn = document.getElementById('themeToggle');
  const root = document.documentElement;
  const saved = localStorage.getItem('sk-theme') || 'dark';
  root.setAttribute('data-theme', saved);

  btn.addEventListener('click', () => {
    const current = root.getAttribute('data-theme');
    const next = current === 'dark' ? 'light' : 'dark';
    root.setAttribute('data-theme', next);
    localStorage.setItem('sk-theme', next);
  });
})();

// ─── NAVIGATION ───────────────────────────────────────────────────────────────
(function initNav() {
  const nav = document.getElementById('nav');
  const hamburger = document.getElementById('hamburger');
  const mobileMenu = document.getElementById('mobileMenu');
  let menuOpen = false;

  window.addEventListener('scroll', () => {
    nav.classList.toggle('scrolled', window.scrollY > 60);
  });

  hamburger.addEventListener('click', () => {
    menuOpen = !menuOpen;
    hamburger.classList.toggle('open', menuOpen);
    mobileMenu.classList.toggle('open', menuOpen);
    document.body.style.overflow = menuOpen ? 'hidden' : '';
  });

  document.querySelectorAll('.mobile-link').forEach(link => {
    link.addEventListener('click', () => {
      menuOpen = false;
      hamburger.classList.remove('open');
      mobileMenu.classList.remove('open');
      document.body.style.overflow = '';
    });
  });
})();

// ─── HERO SLIDESHOW ───────────────────────────────────────────────────────────
(function initHeroSlides() {
  const slides = document.querySelectorAll('.hero-slide');
  const counter = document.getElementById('slideCounter');
  let current = 0;
  const total = slides.length;

  function goTo(n) {
    slides[current].classList.remove('active');
    current = (n + total) % total;
    slides[current].classList.add('active');
    counter.textContent = String(current + 1).padStart(2, '0') + ' / ' + String(total).padStart(2, '0');
  }

  setInterval(() => goTo(current + 1), 5500);
})();

// ─── SCROLL REVEAL ────────────────────────────────────────────────────────────
(function initReveal() {
  const elements = document.querySelectorAll('.reveal, .reveal-left, .reveal-right');
  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });

  elements.forEach(el => observer.observe(el));
})();

// ─── COUNT-UP ANIMATION ───────────────────────────────────────────────────────
function initCounters() {
  const counters = document.querySelectorAll('[data-count]');
  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const el = entry.target;
        const target = parseInt(el.getAttribute('data-count'));
        let current = 0;
        const step = target / 60;
        const interval = setInterval(() => {
          current = Math.min(current + step, target);
          el.textContent = Math.floor(current) + (el.classList.contains('stat-num') ? '+' : '');
          if (current >= target) clearInterval(interval);
        }, 25);
        observer.unobserve(el);
      }
    });
  }, { threshold: 0.5 });
  counters.forEach(el => observer.observe(el));
}

// ─── PORTFOLIO FILTER ────────────────────────────────────────────────────────
(function initFilter() {
  const btns = document.querySelectorAll('.filter-btn');
  const items = document.querySelectorAll('.port-item');

  btns.forEach(btn => {
    btn.addEventListener('click', () => {
      btns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      const filter = btn.getAttribute('data-filter');

      items.forEach(item => {
        const cat = item.getAttribute('data-cat');
        if (filter === 'all' || cat === filter) {
          item.classList.remove('hidden');
          item.style.animation = 'fadeIn 0.5s ease forwards';
        } else {
          item.classList.add('hidden');
        }
      });
    });
  });
})();

// ─── LIGHTBOX ─────────────────────────────────────────────────────────────────
(function initLightbox() {
  const lightbox = document.getElementById('lightbox');
  const lbImg = document.getElementById('lbImg');
  const lbCaption = document.getElementById('lbCaption');
  const lbClose = document.getElementById('lbClose');
  const lbPrev = document.getElementById('lbPrev');
  const lbNext = document.getElementById('lbNext');

  let images = [];
  let currentIdx = 0;

  function getVisibleImages() {
    return Array.from(document.querySelectorAll('.port-item:not(.hidden) .port-img-wrap img'));
  }

  function open(idx) {
    images = getVisibleImages();
    currentIdx = idx;
    const img = images[currentIdx];
    const caption = img.closest('.port-item').querySelector('.port-info h3')?.textContent || '';
    lbImg.src = img.src;
    lbImg.alt = img.alt;
    lbCaption.textContent = caption;
    lightbox.classList.add('open');
    document.body.style.overflow = 'hidden';
  }

  function close() {
    lightbox.classList.remove('open');
    document.body.style.overflow = '';
  }

  function prev() {
    currentIdx = (currentIdx - 1 + images.length) % images.length;
    lbImg.style.opacity = '0';
    setTimeout(() => {
      lbImg.src = images[currentIdx].src;
      lbCaption.textContent = images[currentIdx].closest('.port-item').querySelector('.port-info h3')?.textContent || '';
      lbImg.style.opacity = '1';
    }, 200);
  }

  function next() {
    currentIdx = (currentIdx + 1) % images.length;
    lbImg.style.opacity = '0';
    setTimeout(() => {
      lbImg.src = images[currentIdx].src;
      lbCaption.textContent = images[currentIdx].closest('.port-item').querySelector('.port-info h3')?.textContent || '';
      lbImg.style.opacity = '1';
    }, 200);
  }

  lbImg.style.transition = 'opacity 0.3s ease';

  document.querySelectorAll('.port-expand').forEach((btn, i) => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const items = Array.from(document.querySelectorAll('.port-item:not(.hidden)'));
      const item = btn.closest('.port-item');
      const idx = items.indexOf(item);
      open(idx);
    });
  });

  lbClose.addEventListener('click', close);
  lbPrev.addEventListener('click', prev);
  lbNext.addEventListener('click', next);
  lightbox.addEventListener('click', e => { if (e.target === lightbox) close(); });
  document.addEventListener('keydown', e => {
    if (!lightbox.classList.contains('open')) return;
    if (e.key === 'Escape') close();
    if (e.key === 'ArrowLeft') prev();
    if (e.key === 'ArrowRight') next();
  });
})();

// ─── TESTIMONIALS SLIDER ─────────────────────────────────────────────────────
(function initTestimonials() {
  const track = document.getElementById('testimonialTrack');
  const dotsWrap = document.getElementById('tDots');
  const prevBtn = document.getElementById('tPrev');
  const nextBtn = document.getElementById('tNext');
  const cards = document.querySelectorAll('.testimonial-card');
  const total = cards.length;
  let current = 0;
  let autoTimer;

  // Create dots
  cards.forEach((_, i) => {
    const dot = document.createElement('button');
    dot.className = 't-dot' + (i === 0 ? ' active' : '');
    dot.addEventListener('click', () => goTo(i));
    dotsWrap.appendChild(dot);
  });

  function getCardWidth() {
    const card = cards[0];
    const style = getComputedStyle(card);
    return card.offsetWidth + parseInt(style.marginRight || 0) + 24; // gap
  }

  function updateDots() {
    document.querySelectorAll('.t-dot').forEach((d, i) => d.classList.toggle('active', i === current));
  }

  function goTo(n) {
    current = (n + total) % total;
    const offset = current * getCardWidth();
    track.style.transform = `translateX(-${offset}px)`;
    updateDots();
  }

  function startAuto() {
    autoTimer = setInterval(() => goTo(current + 1), 4000);
  }

  function stopAuto() { clearInterval(autoTimer); }

  prevBtn.addEventListener('click', () => { stopAuto(); goTo(current - 1); startAuto(); });
  nextBtn.addEventListener('click', () => { stopAuto(); goTo(current + 1); startAuto(); });

  // Touch/swipe
  let startX = 0;
  track.addEventListener('touchstart', e => { startX = e.touches[0].clientX; stopAuto(); });
  track.addEventListener('touchend', e => {
    const diff = startX - e.changedTouches[0].clientX;
    if (Math.abs(diff) > 40) goTo(current + (diff > 0 ? 1 : -1));
    startAuto();
  });

  startAuto();
})();

// ─── CONTACT FORM ─────────────────────────────────────────────────────────────
(function initForm() {
  const form = document.getElementById('contactForm');
  if (!form) return;

  form.addEventListener('submit', e => {
    e.preventDefault();
    const btn = form.querySelector('.btn-submit');
    const text = btn.querySelector('.btn-text');
    const arrow = btn.querySelector('.btn-arrow');
    text.textContent = 'Sent!';
    arrow.textContent = '✓';
    btn.style.background = '#4a8c4a';
    setTimeout(() => {
      text.textContent = 'Send Enquiry';
      arrow.textContent = '→';
      btn.style.background = '';
      form.reset();
    }, 3000);
  });

  // Floating label effect
  form.querySelectorAll('input, textarea, select').forEach(input => {
    input.addEventListener('focus', () => {
      input.parentElement.classList.add('focused');
    });
    input.addEventListener('blur', () => {
      input.parentElement.classList.remove('focused');
    });
  });
})();

// ─── PARALLAX ─────────────────────────────────────────────────────────────────
(function initParallax() {
  const heroSlides = document.querySelector('.hero-bg-reel');
  const aboutImgMain = document.querySelector('.about-img-main');

  window.addEventListener('scroll', () => {
    const scrollY = window.scrollY;
    if (heroSlides && scrollY < window.innerHeight) {
      heroSlides.style.transform = `translateY(${scrollY * 0.25}px)`;
    }
    if (aboutImgMain) {
      const rect = aboutImgMain.closest('.about').getBoundingClientRect();
      if (rect.top < window.innerHeight && rect.bottom > 0) {
        const progress = -rect.top / window.innerHeight;
        aboutImgMain.style.transform = `translateY(${progress * 30}px)`;
      }
    }
  });
})();

// ─── SMOOTH ANCHOR SCROLL ────────────────────────────────────────────────────
document.querySelectorAll('a[href^="#"]').forEach(a => {
  a.addEventListener('click', e => {
    const target = document.querySelector(a.getAttribute('href'));
    if (!target) return;
    e.preventDefault();
    target.scrollIntoView({ behavior: 'smooth', block: 'start' });
  });
});

// ─── PAGE TRANSITION EFFECT ──────────────────────────────────────────────────
// Subtle fade on portfolio image hover for parallax feel
document.querySelectorAll('.port-item').forEach(item => {
  item.addEventListener('mousemove', e => {
    const rect = item.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width - 0.5) * 8;
    const y = ((e.clientY - rect.top) / rect.height - 0.5) * 8;
    const img = item.querySelector('img');
    if (img) {
      img.style.transform = `scale(1.06) translate(${x * 0.3}px, ${y * 0.3}px)`;
    }
  });
  item.addEventListener('mouseleave', () => {
    const img = item.querySelector('img');
    if (img) img.style.transform = '';
  });
});

// ─── SERVICE CARD TILT ───────────────────────────────────────────────────────
document.querySelectorAll('.service-card').forEach(card => {
  card.addEventListener('mousemove', e => {
    const rect = card.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    card.style.transform = `translateY(-4px) rotateX(${-y * 4}deg) rotateY(${x * 4}deg)`;
  });
  card.addEventListener('mouseleave', () => {
    card.style.transform = '';
  });
});

// ─── ABOUT IMAGE FILES CORRECTION ────────────────────────────────────────────
// Map filenames to the uploaded files based on content
(function fixImagePaths() {
  const map = {
    '1775403738222_AE5A2621.jpg': '1775403738222_AE5A2621.jpg',
    '1775403745666_AE5A2351.JPG': '1775403745666_AE5A2351.JPG',
    '1775403767307_AE5A6772.jpg': '1775403767307_AE5A6772.jpg',
    '1775403789081_AE5A7453.jpg': '1775403789081_AE5A7453.jpg',
    '1775403805769_AE5A8604.jpg': '1775403805769_AE5A8604.jpg',
    '1775403844751_AE5A7012.JPG': '1775403844751_AE5A7012.JPG',
    '1775403895349_AE5A8735-8x6.jpg': '1775403895349_AE5A8735-8x6.jpg',
    '1775403946158_AE5A0036.JPG': '1775403946158_AE5A0036.JPG',
  };
  // Paths are correct as-is when images are placed alongside HTML
})();

// ─── GMAIL COMPOSE REDIRECT ──────────────────────────────────────────────────
function openGmailCompose() {
  const email = 'studiokbabu@gmail.com';
  const subject = encodeURIComponent('Studio K Enquiry');
  const body = encodeURIComponent('Hello,\n\nI would like to enquire about your photography and film services.\n\nLooking forward to hearing from you.');
  
  // Try to open Gmail compose
  const gmailUrl = `https://mail.google.com/mail/?view=cm&fs=1&to=${email}&su=${subject}&body=${body}`;
  
  // Open Gmail in a responsive way
  const newWindow = window.open(gmailUrl, '_blank', 'width=800,height=600');
  
  // If popup is blocked or Gmail doesn't open, fallback to mailto
  if (!newWindow || newWindow.closed) {
    window.location.href = `mailto:${email}?subject=${subject}&body=${body}`;
  }
}

// ─── SCROLL PROGRESS BAR ────────────────────────────────────────────────────
window.addEventListener('scroll', () => {
  const scrollPercentage = (window.scrollY / (document.documentElement.scrollHeight - window.innerHeight)) * 100;
  document.body.style.setProperty('--scroll-progress', scrollPercentage + '%');
  
  // Update progress bar width
  const progressBar = document.querySelector('body::before');
  if (progressBar) {
    document.body.style.backgroundImage = `linear-gradient(90deg, var(--gold) 0%, var(--gold-light) 50%, var(--gold) 100%)`;
  }
});

// ─── ENHANCED REVEAL ON SCROLL ─────────────────────────────────────────────
(function enhancedReveal() {
  const elements = document.querySelectorAll('[class*="reveal"]');
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        // Add staggered animation for groups
        const parent = entry.target.parentElement;
        if (parent) {
          const siblings = Array.from(parent.querySelectorAll('[class*="reveal"]'));
          const index = siblings.indexOf(entry.target);
          entry.target.style.animationDelay = (index * 0.1) + 's';
        }
      }
    });
  }, { 
    threshold: 0.15,
    rootMargin: '0px 0px -60px 0px'
  });
  
  elements.forEach(el => observer.observe(el));
})();

// ─── MOUSE FOLLOW GLOW EFFECT ────────────────────────────────────────────────
(function mouseFollowGlow() {
  const canvas = document.getElementById('bgCanvas');
  if (!canvas) return;
  
  document.addEventListener('mousemove', (e) => {
    const x = e.clientX;
    const y = e.clientY;
    
    // Add glow effect by creating temporary circles
    const cards = document.querySelectorAll('.service-card, .port-item, .testimonial-card, .about-img-accent');
    cards.forEach(card => {
      const rect = card.getBoundingClientRect();
      const cardX = rect.left + rect.width / 2;
      const cardY = rect.top + rect.height / 2;
      const distance = Math.sqrt(Math.pow(x - cardX, 2) + Math.pow(y - cardY, 2));
      
      if (distance < 300) {
        const opacity = (1 - distance / 300) * 0.3;
        card.style.boxShadow = `0 0 ${30 + (1 - distance / 300) * 20}px var(--gold-glow)`;
      } else {
        card.style.boxShadow = '';
      }
    });
  });
})();

// ─── SMOOTH TRANSITIONS BETWEEN SECTIONS ────────────────────────────────────
(function sectionTransitions() {
  const sections = document.querySelectorAll('section, header, footer');
  
  const observerOptions = {
    threshold: 0.3,
    rootMargin: '0px'
  };
  
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.style.opacity = '1';
        entry.target.style.filter = 'blur(0)';
      } else {
        entry.target.style.opacity = '0.9';
        entry.target.style.filter = 'blur(0.5px)';
      }
    });
  }, observerOptions);
  
  sections.forEach(section => observer.observe(section));
})();

// ─── ENHANCED PARALLAX EFFECT ───────────────────────────────────────────────
(function enhancedParallax() {
  window.addEventListener('scroll', () => {
    const scrollY = window.scrollY;
    
    // Multiple parallax layers
    const parallaxElements = document.querySelectorAll('[class*="parallax"], .hero-bg-reel, .about-img');
    
    parallaxElements.forEach(el => {
      const speed = el.getAttribute('data-speed') || 0.5;
      const ypos = scrollY * speed;
      el.style.transform = `translateY(${ypos * 0.5}px)`;
    });
    
    // Blur effect based on scroll
    const threshold = window.innerHeight * 0.3;
    const blurAmount = Math.max(0, Math.min(10, scrollY / 100));
    document.querySelectorAll('[class*="reveal"]').forEach(el => {
      const rect = el.getBoundingClientRect();
      if (rect.top < -threshold || rect.top > window.innerHeight + threshold) {
        el.style.filter = `blur(${Math.min(3, blurAmount / 5)}px)`;
      } else {
        el.style.filter = 'blur(0)';
      }
    });
  });
})();

// ─── ANIMATED COUNTER WITH ENHANCED TIMING ────────────────────────────────
function enhancedCounters() {
  const counters = document.querySelectorAll('[data-count]');
  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const el = entry.target;
        const target = parseInt(el.getAttribute('data-count'));
        let current = 0;
        const duration = 2000; // 2 seconds
        const step = target / (duration / 16);
        const easeOutQuad = (t) => t * (2 - t); // Easing function
        let startTime = Date.now();
        
        function animate() {
          const elapsed = Date.now() - startTime;
          const progress = Math.min(elapsed / duration, 1);
          const easeProgress = easeOutQuad(progress);
          current = Math.floor(target * easeProgress);
          el.textContent = current + (el.classList.contains('stat-num') ? '+' : '');
          
          if (progress < 1) {
            requestAnimationFrame(animate);
          } else {
            el.textContent = target + (el.classList.contains('stat-num') ? '+' : '');
          }
        }
        animate();
        observer.unobserve(el);
      }
    });
  }, { threshold: 0.5 });
  
  counters.forEach(el => observer.observe(el));
}

// ─── STAGGERED ANIMATION FOR LISTS ────────────────────────────────────────
(function staggeredAnimations() {
  const lists = document.querySelectorAll('.services-grid, .portfolio-masonry, .process-timeline');
  
  lists.forEach(list => {
    const items = list.querySelectorAll('> *');
    items.forEach((item, index) => {
      item.style.animationDelay = (index * 0.1) + 's';
      item.style.animation = 'slideInLeft 0.6s ease-out backwards';
    });
  });
})();

// ─── HOVER ZOOM EFFECT ON IMAGES ────────────────────────────────────────────
(function imageHoverZoom() {
  document.querySelectorAll('[class*="port"] img, .about-img').forEach(img => {
    img.addEventListener('mouseenter', function() {
      this.style.transform = 'scale(1.08) rotate(1deg)';
      this.style.filter = 'brightness(1.1) saturate(1.2)';
    });
    
    img.addEventListener('mouseleave', function() {
      this.style.transform = 'scale(1) rotate(0deg)';
      this.style.filter = 'brightness(0.85) saturate(1)';
    });
  });
})();

// ─── TEXT ANIMATION ON REVEAL ────────────────────────────────────────────
(function textRevealAnimation() {
  const titles = document.querySelectorAll('.section-title, .hero-title');
  
  titles.forEach(title => {
    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.style.animation = 'textGlow 4s ease-in-out infinite';
        }
      });
    }, { threshold: 0.5 });
    
    observer.observe(title);
  });
})();

// Initialize enhanced counter
window.addEventListener('load', () => {
  setTimeout(() => {
    enhancedCounters();
    staggeredAnimations();
    imageHoverZoom();
    textRevealAnimation();
  }, 500);
});

// ─── MAGNETIC BUTTONS & ADVANCED MICRO-INTERACTIONS ──────────────────────────
(function initMagneticButtons() {
  const buttons = document.querySelectorAll('.btn-primary, .btn-ghost, .filter-btn');
  const magneticStrength = 0.4;
  
  buttons.forEach(button => {
    let mx = 0, my = 0;
    
    button.addEventListener('mousemove', (e) => {
      const rect = button.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;
      
      mx = (e.clientX - centerX) * magneticStrength;
      my = (e.clientY - centerY) * magneticStrength;
      
      button.style.transform = `translate(${mx}px, ${my}px)`;
    });
    
    button.addEventListener('mouseleave', () => {
      button.style.transform = 'translate(0, 0)';
    });
  });
})();

// ─── ENHANCED TEXT REVEAL ANIMATIONS ──────────────────────────────────────────
(function enhancedTextReveal() {
  const textElements = document.querySelectorAll('.hero-title, .section-title, h2, h3, p');
  
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const text = entry.target.textContent;
        const characters = text.split('');
        
        entry.target.innerHTML = characters
          .map((char, i) => {
            return `<span style="animation: fadeInScale 0.6s ease-out ${i * 0.02}s both; display: inline-block;">${char === ' ' ? '&nbsp;' : char}</span>`;
          })
          .join('');
        
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.15, rootMargin: '0px 0px -60px 0px' });
  
  textElements.forEach(el => observer.observe(el));
})();

// ─── ADVANCED SCROLL SHADOW EFFECT ────────────────────────────────────────────
(function scrollShadowNav() {
  const nav = document.getElementById('nav');
  if (!nav) return;
  
  window.addEventListener('scroll', () => {
    const scrollY = window.scrollY;
    if (scrollY > 10) {
      nav.style.boxShadow = `0 24px 48px rgba(0, 0, 0, ${Math.min(scrollY / 200, 0.6)})`;
    } else {
      nav.style.boxShadow = 'none';
    }
  });
})();

// ─── IMAGE HOVER BRIGHTNESS & ZOOM ───────────────────────────────────────────
(function advancedImageHover() {
  document.querySelectorAll('.port-item img, .about-img img, .hero-slide').forEach(img => {
    img.addEventListener('mouseenter', () => {
      img.style.animation = 'colorShift 0.4s ease';
      img.style.filter = 'brightness(1.15) saturate(1.2)';
    });
    
    img.addEventListener('mouseleave', () => {
      img.style.animation = 'none';
      img.style.filter = 'brightness(0.85) saturate(0.9)';
    });
  });
})();

// ─── BUTTON RIPPLE EFFECT WITH ADVANCED TIMING ───────────────────────────────
(function advancedRipple() {
  document.querySelectorAll('.btn-primary, .btn-ghost').forEach(button => {
    button.addEventListener('click', function(e) {
      const rect = this.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const radius = Math.max(rect.width, rect.height);
      const duration = radius / 3;
      
      const ripple = document.createElement('span');
      ripple.style.cssText = `
        position: absolute;
        left: ${x}px;
        top: ${y}px;
        width: 0;
        height: 0;
        border-radius: 50%;
        background: radial-gradient(circle, rgba(255,255,255,0.4) 0%, transparent 70%);
        animation: rippleEffect ${duration}ms ease-out;
        pointer-events: none;
      `;
      
      this.appendChild(ripple);
      setTimeout(() => ripple.remove(), duration);
    });
  });
})();

// ─── SMOOTH SCROLL WITH CUSTOM EASING ────────────────────────────────────────
(function smoothScrollWithEasing() {
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
      const target = document.querySelector(this.getAttribute('href'));
      if (!target) return;
      
      e.preventDefault();
      const targetY = target.getBoundingClientRect().top + window.scrollY;
      const startY = window.scrollY;
      const distance = targetY - startY;
      const duration = Math.min(1000, Math.abs(distance) / 2);
      let startTime;
      
      const easeInOutCubic = (t) => {
        return t < 0.5 
          ? 4 * t * t * t 
          : 1 - Math.pow(-2 * t + 2, 3) / 2;
      };
      
      function scroll(currentTime) {
        if (!startTime) startTime = currentTime;
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / duration, 1);
        const position = startY + distance * easeInOutCubic(progress);
        window.scrollTo(0, position);
        
        if (progress < 1) requestAnimationFrame(scroll);
      }
      
      requestAnimationFrame(scroll);
    });
  });
})();

// ─── DYNAMIC ELEMENT GLOW ON FOCUS ───────────────────────────────────────────
(function dynamicGlowFocus() {
  const interactiveElements = document.querySelectorAll('button, a, input, textarea');
  
  interactiveElements.forEach(el => {
    el.addEventListener('focus', () => {
      el.style.boxShadow = `0 0 20px rgba(201, 168, 76, 0.4), 0 0 40px rgba(201, 168, 76, 0.2)`;
    });
    
    el.addEventListener('blur', () => {
      el.style.boxShadow = '';
    });
  });
})();

// ─── SECTION ENTER/EXIT ANIMATIONS ───────────────────────────────────────────
(function sectionAnimations() {
  const sections = document.querySelectorAll('section');
  
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.style.animation = 'fadeInScale 0.8s ease-out';
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.15 });
  
  sections.forEach(section => observer.observe(section));
})();
