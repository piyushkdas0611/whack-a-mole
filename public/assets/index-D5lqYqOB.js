(function () {
  const t = document.createElement('link').relList;
  if (t && t.supports && t.supports('modulepreload')) return;
  for (const i of document.querySelectorAll('link[rel="modulepreload"]')) s(i);
  new MutationObserver(i => {
    for (const a of i)
      if (a.type === 'childList')
        for (const T of a.addedNodes)
          T.tagName === 'LINK' && T.rel === 'modulepreload' && s(T);
  }).observe(document, { childList: !0, subtree: !0 });
  function n(i) {
    const a = {};
    return (
      i.integrity && (a.integrity = i.integrity),
      i.referrerPolicy && (a.referrerPolicy = i.referrerPolicy),
      i.crossOrigin === 'use-credentials'
        ? (a.credentials = 'include')
        : i.crossOrigin === 'anonymous'
          ? (a.credentials = 'omit')
          : (a.credentials = 'same-origin'),
      a
    );
  }
  function s(i) {
    if (i.ep) return;
    i.ep = !0;
    const a = n(i);
    fetch(i.href, a);
  }
})();
const A = {
  easy: {
    gameTime: 30,
    initialSpeed: 1e3,
    fastSpeed: 800,
    speedChangeTime: 15,
    pointsPerHit: 1,
    timeBonus: !1,
  },
  medium: {
    gameTime: 45,
    initialSpeed: 700,
    fastSpeed: 500,
    speedChangeTime: 25,
    pointsPerHit: 2,
    timeBonus: !0,
  },
  hard: {
    gameTime: 60,
    initialSpeed: 500,
    fastSpeed: 300,
    speedChangeTime: 40,
    pointsPerHit: 3,
    timeBonus: !0,
  },
};
let I = -1;
function U(e, t = 'easy', n = 0) {
  const s = A[t];
  let i = s.pointsPerHit;
  return (s.timeBonus && n < 10 && (i += 1), e + i);
}
function z(e, t = !0) {
  let n;
  if (t && I !== -1)
    do n = Math.floor(Math.random() * e);
    while (n === I);
  else n = Math.floor(Math.random() * e);
  return ((I = n), n);
}
function B() {
  I = -1;
}
function _(e = 'easy') {
  return A[e].gameTime;
}
function F(e, t = 'easy') {
  const n = A[t];
  return e >= n.speedChangeTime ? n.initialSpeed : n.fastSpeed;
}
function K(e, t = 'easy') {
  return e === A[t].speedChangeTime;
}
let r, E, v, C, b, c, o, u, w, g, M, k;
function X() {
  ((r = document.querySelectorAll('.square')),
    document.querySelector('.mole'),
    (E = document.querySelector('#time-left')),
    (v = document.querySelector('#score')),
    (C = document.querySelector('#high-score')),
    (b = document.querySelector('#final-score')),
    (c = document.querySelector('#start-button')),
    (o = document.querySelector('#pause-button')),
    (u = document.querySelector('#restart-button')),
    (w = document.querySelector('#reset-highscore-button')),
    (g = document.querySelector('#high-score-message')),
    (M = document.querySelectorAll('.difficulty-btn')),
    (k = document.querySelector('#current-difficulty')));
}
let D,
  m = 0,
  L = 0,
  f = 30,
  q = null,
  x = null,
  S = !1,
  p = !1,
  d = 'easy',
  l = null;
function Y() {
  D = new Audio('audio/whack01.mp3');
}
function j() {
  return parseInt(localStorage.getItem(`whackAMoleHighScore_${d}`)) || 0;
}
function J(e) {
  (localStorage.setItem(`whackAMoleHighScore_${d}`, e),
    C && (C.textContent = e));
}
function H() {
  C && (C.textContent = j());
}
function G() {
  confirm(
    `Are you sure you want to reset the ${d.toUpperCase()} high score?`
  ) &&
    (J(0),
    (g.textContent = 'High Score Reset!'),
    (g.style.display = 'block'),
    setTimeout(() => {
      g.style.display = 'none';
    }, 2e3));
}
function y() {
  (clearInterval(q),
    clearInterval(x),
    (m = 0),
    (f = _(d)),
    v && (v.textContent = m),
    E && (E.textContent = f),
    b && (b.innerHTML = ''),
    g && (g.style.display = 'none'));
  const e = document.querySelector('.stats');
  (e && (e.style.display = 'flex'),
    r && r.forEach(t => t.classList.remove('mole')),
    B(),
    (S = !1),
    (p = !1),
    c && (c.disabled = !1),
    o && ((o.disabled = !0), (o.textContent = 'Pause')),
    u && (u.disabled = !0));
}
function $() {
  p ||
    (y(),
    (p = !0),
    c && (c.disabled = !0),
    o && (o.disabled = !1),
    u && (u.disabled = !1),
    O(),
    (x = setInterval(R, 1e3)));
}
function N() {
  p &&
    (S
      ? (O(),
        (x = setInterval(R, 1e3)),
        o && (o.textContent = 'Pause'),
        (S = !1))
      : (clearInterval(q),
        clearInterval(x),
        o && (o.textContent = 'Resume'),
        (S = !0)));
}
function Q() {
  if (!r) return;
  (r.forEach(n => {
    n.classList.remove('mole');
  }),
    r.forEach(n => n.classList.remove('selected')),
    (L = null),
    (l = null));
  const e = z(9, !0),
    t = r[e];
  (t.classList.add('mole'), (L = t.id));
}
function P(e) {
  if (!p || S) return;
  const t = r[e];
  t && t.id == L && (m++, (v.textContent = m), (L = null));
}
function W() {
  r &&
    r.forEach((e, t) => {
      e.addEventListener('mousedown', () => {
        (P(t),
          h(t),
          e.id == L &&
            p &&
            !S &&
            ((m = U(m, d, f)),
            v && (v.textContent = m),
            (L = null),
            (D.currentTime = 0),
            D.play().catch(n => {
              console.log('Audio play prevented:', n);
            })));
      });
    });
}
function h(e) {
  (l !== null && r[l] && r[l].classList.remove('selected'),
    (l = e),
    r[l] &&
      (r[l].classList.add('selected'),
      r[l].focus({ preventScroll: !0 }),
      srAnnouncer && (srAnnouncer.textContent = `Selected Hole ${l + 1}`)));
}
function O() {
  clearInterval(q);
  const e = F(f, d);
  q = setInterval(Q, e);
}
function R() {
  if ((f--, E && (E.textContent = f), K(f, d) && O(), f == 0)) {
    (clearInterval(x),
      clearInterval(q),
      b && (b.textContent = `Your final score is : ${m}`));
    const e = document.querySelector('.stats');
    (e && (e.style.display = 'flex'),
      (p = !1),
      c && (c.disabled = !0),
      o && (o.disabled = !0),
      u && (u.disabled = !1),
      r && r.forEach(t => t.classList.remove('mole')));
  }
}
function Z() {
  M &&
    (M.forEach(e => {
      e.addEventListener('click', () => {
        p ||
          (M.forEach(t => t.classList.remove('active')),
          e.classList.add('active'),
          (d = e.dataset.level),
          k && (k.textContent = d.charAt(0).toUpperCase() + d.slice(1)),
          y(),
          H());
      });
    }),
    document.addEventListener('keydown', e => {
      const t = document.activeElement.tagName;
      if (t === 'INPUT' || t === 'TEXTAREA') return;
      if (/^[1-9]$/.test(e.key)) {
        const a = parseInt(e.key, 10) - 1;
        (h(a), P(a), e.preventDefault());
        return;
      }
      const n = 3;
      l === null && h(4);
      let s = Math.floor(l / n),
        i = l % n;
      switch (e.key) {
        case 'ArrowLeft':
          ((i = Math.max(0, i - 1)), h(s * n + i), e.preventDefault());
          break;
        case 'ArrowRight':
          ((i = Math.min(n - 1, i + 1)), h(s * n + i), e.preventDefault());
          break;
        case 'ArrowUp':
          ((s = Math.max(0, s - 1)), h(s * n + i), e.preventDefault());
          break;
        case 'ArrowDown':
          ((s = Math.min(2, s + 1)), h(s * n + i), e.preventDefault());
          break;
        case 'Enter':
        case ' ':
          (P(l), e.preventDefault());
          break;
      }
    }),
    c.addEventListener('click', $),
    o.addEventListener('click', N),
    u.addEventListener('click', y),
    w.addEventListener('click', G),
    B(),
    y(),
    H(),
    c && c.addEventListener('click', $),
    o && o.addEventListener('click', N),
    u && u.addEventListener('click', y),
    w && w.addEventListener('click', G));
}
function V() {
  (X(), Y(), B(), y(), H(), Z(), W());
}
document.addEventListener('DOMContentLoaded', () => {
  V();
});
