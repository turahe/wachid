import Cursor from './components/Cursor';
import Nav from './components/Nav';
import SeoHead from './components/SeoHead';
import Hero from './sections/Hero';
import Curiosity from './sections/Curiosity';
import CodeToSystem from './sections/CodeToSystem';
import Problems from './sections/Problems';
import Architecture from './sections/Architecture';
import InvisibleLayer from './sections/InvisibleLayer';
import AISection from './sections/AISection';
import Projects from './sections/Projects';
import Philosophy from './sections/Philosophy';
import Contact from './sections/Contact';
import { ThemeProvider } from './context/ThemeContext';
import { useThemeColor } from './context/useTheme';

function AppContent() {
  const colors = useThemeColor();
  return (
    <div style={{ background: colors.bg, color: colors.text, overflowX: 'hidden', transition: 'background-color 0.3s ease, color 0.3s ease' }}>
      <a
        href="#hero"
        className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-[100] focus:px-4 focus:py-2 focus:text-xs focus:font-medium"
        style={{ background: colors.text, color: colors.bg, fontFamily: 'Bricolage Grotesque, sans-serif' }}
      >
        Skip to content
      </a>
      <Cursor />
      <Nav />
      <main id="hero-main">
        <Hero />
        <Curiosity />
        <CodeToSystem />
        <Problems />
        <Architecture />
        <InvisibleLayer />
        <AISection />
        <Projects />
        <Philosophy />
        <Contact />
      </main>
    </div>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <SeoHead
        canonicalPath="/"
        ogImage="/og.svg"
      />
      <AppContent />
    </ThemeProvider>
  );
}
