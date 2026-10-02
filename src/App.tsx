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

function AppContent() {
  return (
    <div className="bg-token-bg text-token overflow-hidden transition-theme">
      <a
        href="#hero"
        className="font-display sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-[100] focus:px-4 focus:py-2 focus:text-xs focus:font-medium focus:bg-token-text focus:text-token-bg"
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
