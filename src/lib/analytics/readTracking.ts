import { track } from './track';

// Reading behaviour for Rybbit: how far people scroll on each page, which sections and headings they
// actually reach, and whether a blog article was really read. Each event fires at most once per page
// view; Rybbit attaches the path itself. This is a single-page app, so everything resets when the
// route changes.
const DEPTHS = [25, 50, 75, 100];
const READ_DEPTH = 75;
const READ_SECONDS = 30;
const ARTICLE_PATH = /^\/blog\/[^/]+\/?$/;

let path = '';
let startedAt = 0;
let reached = new Set<number>();
let seen = new Set<Element>();
let read = false;
let readTimer: number | undefined;

const label = (el: Element) =>
  (el.id || el.textContent || '').trim().replace(/\s+/g, ' ').slice(0, 60);

let observer: IntersectionObserver;

const onIntersect: IntersectionObserverCallback = (entries) => {
    for (const entry of entries) {
      if (!entry.isIntersecting || seen.has(entry.target)) continue;
      seen.add(entry.target);
      observer.unobserve(entry.target);
      const name = label(entry.target);
      if (name) track('section_view', { section: name });
    }
};

function resetForRoute() {
  path = location.pathname;
  startedAt = Date.now();
  reached = new Set();
  seen = new Set();
  read = false;
  observer.disconnect();
  window.clearTimeout(readTimer);
  // Someone who reached the end early and stopped scrolling still counts once the time is up.
  readTimer = window.setTimeout(check, READ_SECONDS * 1000 + 250);
}

// Sections and headings render after route changes and lazy loads, so every check looks again;
// observing an element twice is a no-op.
function observeSections() {
  document.querySelectorAll('main section[id], main h2, section[id], article h2').forEach((el) => {
    if (!seen.has(el)) observer.observe(el);
  });
}

function check() {
  if (location.pathname !== path) resetForRoute();
  observeSections();
  const scrollable = document.documentElement.scrollHeight - window.innerHeight;
  const depth = scrollable <= 0 ? 100 : Math.round((window.scrollY / scrollable) * 100);
  for (const mark of DEPTHS) {
    if (depth >= mark && !reached.has(mark)) {
      reached.add(mark);
      track('scroll_depth', { depth: mark });
    }
  }
  const seconds = Math.round((Date.now() - startedAt) / 1000);
  if (!read && ARTICLE_PATH.test(path) && depth >= READ_DEPTH && seconds >= READ_SECONDS) {
    read = true;
    track('article_read', { seconds });
  }
}

export function startReadTracking() {
  if (typeof window === 'undefined' || !('IntersectionObserver' in window)) return;
  // Counts a section once it reaches the middle of the screen, whatever its height.
  observer = new IntersectionObserver(onIntersect, { rootMargin: '0px 0px -50% 0px', threshold: 0 });
  resetForRoute();
  window.addEventListener('scroll', check, { passive: true });
  // Client-side navigation fires no scroll event, so look for a new route regularly.
  window.setInterval(() => {
    if (location.pathname !== path) check();
  }, 1000);
  window.setTimeout(observeSections, 1500);
}
