// ============ STARFIELD ============
const canvas = document.getElementById('stars');
const ctx = canvas.getContext('2d');
let stars = [];
let mouseX = 0, mouseY = 0;

function resizeCanvas() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
  const count = Math.min(220, Math.floor((canvas.width * canvas.height) / 9000));
  stars = Array.from({ length: count }, () => ({
    x: Math.random() * canvas.width,
    y: Math.random() * canvas.height,
    r: Math.random() * 1.4 + 0.4,
    depth: Math.random() * 0.8 + 0.2,
    tw: Math.random() * Math.PI * 2,
    twSpeed: 0.008 + Math.random() * 0.02
  }));
}
resizeCanvas();
window.addEventListener('resize', resizeCanvas);

window.addEventListener('mousemove', e => {
  mouseX = (e.clientX / window.innerWidth - 0.5) * 2;
  mouseY = (e.clientY / window.innerHeight - 0.5) * 2;
});

function drawStars() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  for (const s of stars) {
    s.tw += s.twSpeed;
    const alpha = 0.25 + Math.abs(Math.sin(s.tw)) * 0.65;
    const px = s.x - mouseX * s.depth * 18;
    const py = s.y - mouseY * s.depth * 18 - window.scrollY * s.depth * 0.12;
    const wy = ((py % canvas.height) + canvas.height) % canvas.height;
    ctx.beginPath();
    ctx.arc(px, wy, s.r, 0, Math.PI * 2);
    ctx.fillStyle = `rgba(220, 230, 255, ${alpha * s.depth})`;
    ctx.fill();
  }
  requestAnimationFrame(drawStars);
}
drawStars();

// ============ CURSOR GLOW ============
const glow = document.getElementById('cursorGlow');
window.addEventListener('mousemove', e => {
  glow.style.left = e.clientX + 'px';
  glow.style.top = e.clientY + 'px';
});

// ============ NAV + PROGRESS ============
const nav = document.getElementById('nav');
const progress = document.getElementById('progress');
window.addEventListener('scroll', () => {
  nav.classList.toggle('scrolled', window.scrollY > 40);
  const h = document.documentElement.scrollHeight - window.innerHeight;
  progress.style.width = (window.scrollY / h * 100) + '%';
}, { passive: true });

// ============ SCROLL REVEAL ============
const observer = new IntersectionObserver(entries => {
  entries.forEach((entry, i) => {
    if (entry.isIntersecting) {
      entry.target.style.transitionDelay = `${(i % 4) * 0.08}s`;
      entry.target.classList.add('visible');
      observer.unobserve(entry.target);
    }
  });
}, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });

document.querySelectorAll('.reveal').forEach(el => observer.observe(el));

// ============ COUNTERS ============
const counterObserver = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (!entry.isIntersecting) return;
    const el = entry.target;
    const target = parseInt(el.dataset.count, 10);
    const prefix = el.dataset.prefix || '';
    const suffix = el.dataset.suffix || '';
    const dur = 1600;
    const start = performance.now();
    function tick(now) {
      const p = Math.min((now - start) / dur, 1);
      const eased = 1 - Math.pow(1 - p, 3);
      el.textContent = prefix + Math.round(target * eased) + suffix;
      if (p < 1) requestAnimationFrame(tick);
    }
    requestAnimationFrame(tick);
    counterObserver.unobserve(el);
  });
}, { threshold: 0.5 });

document.querySelectorAll('.stat-num').forEach(el => counterObserver.observe(el));

// ============ CARD SPOTLIGHT + TILT ============
document.querySelectorAll('.card').forEach(card => {
  card.addEventListener('mousemove', e => {
    const r = card.getBoundingClientRect();
    card.style.setProperty('--mx', ((e.clientX - r.left) / r.width * 100) + '%');
    card.style.setProperty('--my', ((e.clientY - r.top) / r.height * 100) + '%');
  });
});

document.querySelectorAll('.tilt').forEach(el => {
  el.addEventListener('mousemove', e => {
    const r = el.getBoundingClientRect();
    const rx = ((e.clientY - r.top) / r.height - 0.5) * -6;
    const ry = ((e.clientX - r.left) / r.width - 0.5) * 6;
    el.style.transform = `perspective(800px) rotateX(${rx}deg) rotateY(${ry}deg) translateY(-3px)`;
  });
  el.addEventListener('mouseleave', () => {
    el.style.transform = '';
  });
});


