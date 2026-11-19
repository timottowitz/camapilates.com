import { useEffect, useState } from 'react';
import { useLocation, useNavigationType } from 'react-router-dom';
import { ArrowUp } from 'lucide-react';

const SHOW_AFTER_PX = 600;

const ScrollToTop = () => {
  const [isVisible, setIsVisible] = useState(false);
  const { pathname, hash } = useLocation();
  const navigationType = useNavigationType();

  // A new page starts at the top. Back/forward keeps the position the browser restores,
  // and a link to an anchor is left to land on that anchor.
  useEffect(() => {
    if (navigationType === 'POP' || hash) return;
    window.scrollTo(0, 0);
  }, [pathname, hash, navigationType]);

  useEffect(() => {
    const onScroll = () => setIsVisible(window.scrollY > SHOW_AFTER_PX);
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // The order flow has a form at the bottom of the screen; nothing should float over it.
  if (!isVisible || pathname.startsWith('/pedido/')) return null;

  // Bottom left: the bottom right corner belongs to the WhatsApp button.
  return (
    <button
      type="button"
      onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
      className="fixed bottom-20 left-4 md:bottom-8 md:left-8 z-40 flex h-10 w-10 items-center justify-center rounded-full bg-[#2A2624]/85 text-[#EAE8E4] shadow-lg backdrop-blur-sm transition-all duration-300 hover:bg-[#2A2624] hover:scale-105 active:scale-95"
      aria-label="Volver arriba"
    >
      <ArrowUp className="h-4 w-4" />
    </button>
  );
};

export default ScrollToTop;
