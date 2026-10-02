import { useState, useEffect } from 'react';
import { useThemeColor } from '../context/useTheme';
import { ThemeToggle } from './ThemeToggle';

const SECTIONS = [
  { id: 'hero', label: 'Start' },
  { id: 'curiosity', label: 'Curiosity' },
  { id: 'codesystem', label: 'System' },
  { id: 'problems', label: 'Problems' },
  { id: 'architecture', label: 'Architecture' },
  { id: 'ai', label: 'AI' },
  { id: 'projects', label: 'Projects' },
  { id: 'philosophy', label: 'Philosophy' },
  { id: 'contact', label: 'Contact' },
];

export default function Nav() {
  const [active, setActive] = useState('hero');
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const colors = useThemeColor();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 80);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    const observers: IntersectionObserver[] = [];
    SECTIONS.forEach(({ id }) => {
      const el = document.getElementById(id);
      if (!el) return;
      const obs = new IntersectionObserver(
        ([entry]) => { if (entry.isIntersecting) setActive(id); },
        { threshold: 0.35 }
      );
      obs.observe(el);
      observers.push(obs);
    });
    return () => observers.forEach((o) => o.disconnect());
  }, []);

  const scrollTo = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
    setOpen(false);
  };

  return (
    <nav
      role="navigation"
      aria-label="Main navigation"
      className="fixed top-0 left-0 right-0 z-50 transition-all duration-500"
      style={{
        background: scrolled ? `rgba(${colors.bg === '#050505' ? '5,5,5' : '255,255,255'},0.95)` : 'transparent',
        backdropFilter: scrolled ? 'blur(20px)' : 'none',
        borderBottom: scrolled ? `1px solid ${colors.border}` : `1px solid transparent`,
      }}
    >
      <div className="max-w-7xl mx-auto px-8 md:px-16 py-5 flex items-center justify-between">
        {/* Logo */}
        <button
          onClick={() => scrollTo('hero')}
          className="text-xs tracking-[0.2em] uppercase transition-colors"
          style={{ fontFamily: 'Bricolage Grotesque, sans-serif', color: colors.text, fontWeight: 600 }}
          aria-label="Go to top"
        >
          AC
        </button>

        {/* Desktop links */}
        <div className="hidden md:flex items-center gap-8">
          {SECTIONS.slice(1).map(({ id, label }) => (
            <button
              key={id}
              onClick={() => scrollTo(id)}
              className="text-[11px] tracking-[0.1em] uppercase transition-all duration-300"
              style={{
                fontFamily: 'Bricolage Grotesque, sans-serif',
                color: active === id ? colors.text : colors.muted,
                fontWeight: active === id ? 500 : 400,
              }}
              aria-current={active === id ? 'page' : undefined}
            >
              {label}
            </button>
          ))}
        </div>

        <div className="hidden md:flex items-center gap-6">
          <a
            href="https://github.com"
            target="_blank"
            rel="noopener noreferrer"
            className="text-[11px] tracking-[0.1em] uppercase transition-colors hover:text-current"
            style={{ fontFamily: 'Bricolage Grotesque, sans-serif', color: colors.muted }}
          >
            GitHub ↗
          </a>
          <button
            onClick={() => scrollTo('contact')}
            className="text-[11px] tracking-[0.1em] px-4 py-2 border transition-all duration-300 hover:border-current hover:text-current"
            style={{ fontFamily: 'Bricolage Grotesque, sans-serif', borderColor: colors.border, color: colors.textSecondary }}
          >
            Contact
          </button>
          <ThemeToggle />
        </div>

        {/* Mobile */}
        <button
          className="md:hidden p-2 flex flex-col gap-1.5"
          onClick={() => setOpen((v) => !v)}
          aria-label="Toggle menu"
          aria-expanded={open}
        >
          <span className="block w-5 h-px" style={{ background: colors.textSecondary }} />
          <span className="block w-3 h-px" style={{ background: colors.textSecondary, opacity: open ? 0 : 1 }} />
          <span className="block w-5 h-px" style={{ background: colors.textSecondary }} />
        </button>
      </div>

      {open && (
        <div
          className="md:hidden border-t px-8 py-6 flex flex-col gap-5"
          style={{ background: colors.surface, borderColor: colors.border, transition: 'background-color 0.3s ease, border-color 0.3s ease' }}
        >
          {SECTIONS.map(({ id, label }) => (
            <button
              key={id}
              onClick={() => scrollTo(id)}
              className="text-left text-sm tracking-wide transition-colors"
              style={{
                fontFamily: 'Bricolage Grotesque, sans-serif',
                color: active === id ? colors.text : colors.muted,
              }}
            >
              {label}
            </button>
          ))}
        </div>
      )}
    </nav>
  );
}
