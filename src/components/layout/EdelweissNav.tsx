import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';

interface EdelweissNavProps {
  /** Use light text for dark hero backgrounds (e.g., full-bleed hero images) */
  darkBackground?: boolean;
}

const EdelweissNav: React.FC<EdelweissNavProps> = ({ darkBackground = false }) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 60);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();

    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Lock body scroll when mobile menu open
  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [isMobileMenuOpen]);

  // Close mobile menu on route change
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location.pathname]);

  // Accent color for brand dot and active states
  const accentColor = '#CF6C63';

  const navLinks = [
    { to: '/', label: 'Home', exact: true },
    { to: '/estudios-de-pilates', label: 'Search Studio' },
    { to: '/instructores-pilates', label: 'Instructors' },
    { to: '/certificacion-pilates', label: 'Courses' },
    { to: '/shop', label: 'Store' },
    { to: '/products', label: 'Compare' },
    { to: '/blog', label: 'Blog' },
    { to: '/about', label: 'Us' },
  ];

  const isActive = (path: string, exact?: boolean) => {
    if (exact) return location.pathname === path;
    return location.pathname === path || location.pathname.startsWith(path + '/');
  };

  // Determine text color based on scroll state and background
  // Default: dark text for light backgrounds
  // darkBackground: light text for dark hero images (before scroll)
  const getTextColor = () => {
    if (isMobileMenuOpen) return 'text-[#F5F4F1]';
    if (isScrolled) return 'text-[#1C1917]';
    if (darkBackground) return 'text-[#F5F4F1]';
    return 'text-[#1C1917]'; // Dark text on light background (default)
  };

  return (
    <>
      <motion.header
        initial={false}
        animate={{
          backgroundColor: isScrolled
            ? 'rgba(245, 244, 241, 0.92)'
            : 'rgba(245, 244, 241, 0)',
          backdropFilter: isScrolled ? 'blur(20px)' : 'blur(0px)',
          borderBottomColor: isScrolled
            ? 'rgba(28, 25, 23, 0.08)'
            : 'rgba(28, 25, 23, 0)',
        }}
        transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
        className={`
          fixed top-0 left-0 right-0 z-50
          border-b
          ${getTextColor()}
        `}
      >
        <div className="max-w-[1800px] mx-auto px-5 sm:px-8 lg:px-12">
          <div className="flex items-center justify-between h-16 sm:h-20">

            {/* Logo with accent dot */}
            <Link
              to="/"
              className="relative group z-50 flex items-baseline gap-0.5"
            >
              <motion.span
                className="text-xl sm:text-2xl font-serif italic tracking-tight"
                whileHover={{ scale: 1.02 }}
                transition={{ type: 'spring', stiffness: 400, damping: 25 }}
              >
                Edelweiss
              </motion.span>
              <span
                className="w-1.5 h-1.5 rounded-full mb-0.5"
                style={{ backgroundColor: accentColor }}
              />
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden lg:flex items-center gap-1">
              {navLinks.map((link) => {
                const active = isActive(link.to, (link as { exact?: boolean }).exact);
                return (
                  <Link
                    key={link.to}
                    to={link.to}
                    className="relative px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.15em] transition-colors duration-200 hover:opacity-70"
                    style={active ? { color: accentColor } : undefined}
                  >
                    {link.label}
                    {/* Active indicator underline */}
                    <AnimatePresence>
                      {active && (
                        <motion.span
                          layoutId="nav-indicator"
                          initial={{ opacity: 0, scaleX: 0 }}
                          animate={{ opacity: 1, scaleX: 1 }}
                          exit={{ opacity: 0, scaleX: 0 }}
                          transition={{ type: 'spring', stiffness: 500, damping: 35 }}
                          className="absolute bottom-0 left-4 right-4 h-[2px] rounded-full"
                          style={{ backgroundColor: accentColor }}
                        />
                      )}
                    </AnimatePresence>
                  </Link>
                );
              })}
            </nav>

            {/* Mobile Menu Toggle */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="lg:hidden z-50 relative w-10 h-10 flex items-center justify-center"
              aria-label={isMobileMenuOpen ? 'Close menu' : 'Open menu'}
            >
              <div className="relative w-6 h-4">
                <motion.span
                  animate={{
                    rotate: isMobileMenuOpen ? 45 : 0,
                    y: isMobileMenuOpen ? 7 : 0,
                    backgroundColor: isMobileMenuOpen ? '#F5F4F1' : 'currentColor',
                  }}
                  transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
                  className="absolute top-0 left-0 w-full h-[2px] bg-current origin-center"
                />
                <motion.span
                  animate={{
                    opacity: isMobileMenuOpen ? 0 : 1,
                    scaleX: isMobileMenuOpen ? 0 : 1,
                  }}
                  transition={{ duration: 0.2 }}
                  className="absolute top-1/2 left-0 w-full h-[2px] bg-current -translate-y-1/2"
                />
                <motion.span
                  animate={{
                    rotate: isMobileMenuOpen ? -45 : 0,
                    y: isMobileMenuOpen ? -7 : 0,
                    backgroundColor: isMobileMenuOpen ? '#F5F4F1' : 'currentColor',
                  }}
                  transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
                  className="absolute bottom-0 left-0 w-full h-[2px] bg-current origin-center"
                />
              </div>
            </button>
          </div>
        </div>
      </motion.header>

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
            className="fixed inset-0 z-40 bg-[#1C1917]"
          >
            {/* Decorative gradient */}
            <div className="absolute inset-0 opacity-30">
              <div className="absolute top-0 right-0 w-[60%] h-[60%] bg-gradient-to-bl from-[#3E2723]/40 to-transparent rounded-full blur-3xl" />
              <div className="absolute bottom-0 left-0 w-[40%] h-[40%] bg-gradient-to-tr from-[#5D5550]/30 to-transparent rounded-full blur-3xl" />
            </div>

            {/* Navigation Links */}
            <nav className="relative h-full flex flex-col items-center justify-center px-8">
              <motion.div
                initial="hidden"
                animate="visible"
                exit="hidden"
                variants={{
                  hidden: {},
                  visible: {
                    transition: {
                      staggerChildren: 0.08,
                      delayChildren: 0.15,
                    },
                  },
                }}
                className="flex flex-col items-center gap-2"
              >
                {navLinks.map((link) => {
                  const active = isActive(link.to, (link as { exact?: boolean }).exact);
                  return (
                    <motion.div
                      key={link.to}
                      variants={{
                        hidden: { opacity: 0, y: 30, filter: 'blur(10px)' },
                        visible: {
                          opacity: 1,
                          y: 0,
                          filter: 'blur(0px)',
                          transition: {
                            duration: 0.5,
                            ease: [0.22, 1, 0.36, 1],
                          },
                        },
                      }}
                    >
                      <Link
                        to={link.to}
                        className="relative block py-3 text-3xl sm:text-4xl font-serif tracking-tight transition-all duration-300"
                        style={{ color: active ? accentColor : 'rgba(245, 244, 241, 0.6)' }}
                      >
                        <span className="relative hover:text-[#F5F4F1] transition-colors">
                          {link.label}
                          {active && (
                            <motion.span
                              layoutId="mobile-indicator"
                              className="absolute -left-6 top-1/2 -translate-y-1/2 w-2 h-2 rounded-full"
                              style={{ backgroundColor: accentColor }}
                            />
                          )}
                        </span>
                      </Link>
                    </motion.div>
                  );
                })}
              </motion.div>

              {/* Footer info */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 20 }}
                transition={{ delay: 0.6, duration: 0.5 }}
                className="absolute bottom-12 left-0 right-0 px-8"
              >
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-[#F5F4F1]/40 text-xs uppercase tracking-[0.2em]">
                  <a href="mailto:hello@camadepilates.com" className="hover:text-[#F5F4F1]/70 transition-colors">
                    hello@camadepilates.com
                  </a>
                  <a href="https://wa.me/525548468190" className="hover:text-[#F5F4F1]/70 transition-colors">
                    WhatsApp
                  </a>
                </div>
              </motion.div>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default EdelweissNav;
