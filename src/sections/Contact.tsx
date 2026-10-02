import { useState } from 'react';
import { useThemeColor } from '../context/useTheme';

export default function Contact() {
  const [sent, setSent] = useState(false);
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const colors = useThemeColor();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !message) return;
    setSent(true);
  };

  return (
    <section
      id="contact"
      className="relative min-h-screen flex flex-col justify-center py-32 overflow-hidden"
      style={{ background: colors.bg, borderTop: `1px solid ${colors.border}` }}
      aria-labelledby="contact-heading"
    >
      {/* Subtle grid */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage: `linear-gradient(${colors.surface} 1px, transparent 1px), linear-gradient(90deg, ${colors.surface} 1px, transparent 1px)`,
          backgroundSize: '80px 80px',
          transition: 'background-color 0.3s ease',
        }}
        aria-hidden="true"
      />

      <div className="relative z-10 max-w-7xl mx-auto px-8 md:px-16 w-full">
        <div className="grid lg:grid-cols-2 gap-24 items-start">
          {/* Left */}
          <div>
            <p className="text-xs tracking-[0.2em] uppercase mb-6" style={{ color: colors.muted, fontFamily: 'Bricolage Grotesque, sans-serif' }}>
              09 — What's Next
            </p>
            <h2
              id="contact-heading"
              className="font-extrabold leading-[0.95] mb-8"
              style={{
                fontFamily: 'Bricolage Grotesque, sans-serif',
                fontSize: 'clamp(2.5rem, 5vw, 4.5rem)',
                letterSpacing: '-0.03em',
                color: colors.text,
              }}
            >
              Let's build
              <br />
              something
              <br />
              meaningful.
            </h2>
            <p className="text-lg leading-relaxed mb-12" style={{ color: colors.muted, fontFamily: 'Inter, sans-serif', fontWeight: 300, maxWidth: '26rem' }}>
              I'm interested in distributed systems, AI engineering, and hard problems at scale.
            </p>

            {/* Links */}
            <div className="flex flex-col gap-4">
              {[
                { label: 'GitHub', href: 'https://github.com', sub: 'Open source + experiments' },
                { label: 'LinkedIn', href: 'https://linkedin.com', sub: 'Professional profile' },
                { label: 'Email', href: 'mailto:wachid@outlook.com', sub: 'wachid@outlook.com' },
              ].map(({ label, href, sub }) => (
                <a
                  key={label}
                  href={href}
                  target={href.startsWith('http') ? '_blank' : undefined}
                  rel={href.startsWith('http') ? 'noopener noreferrer' : undefined}
                  className="flex items-center justify-between py-4 border-b group transition-all duration-300"
                  style={{ borderColor: colors.border }}
                >
                  <div>
                    <span
                      className="block text-sm font-semibold mb-0.5 transition-colors group-hover:text-[#00C8E8]"
                      style={{ fontFamily: 'Bricolage Grotesque, sans-serif', color: colors.text }}
                    >
                      {label}
                    </span>
                    <span className="text-xs" style={{ color: colors.muted, fontFamily: 'Inter, sans-serif' }}>
                      {sub}
                    </span>
                  </div>
                  <span
                    className="text-sm transition-all duration-300 group-hover:translate-x-1 group-hover:text-[#00C8E8]"
                    style={{ color: colors.muted }}
                  >
                    ↗
                  </span>
                </a>
              ))}
            </div>
          </div>

          {/* Right: form */}
          <div>
            {!sent ? (
              <form onSubmit={handleSubmit} className="flex flex-col gap-6" aria-label="Contact form">
                <div>
                  <label
                    htmlFor="contact-email"
                    className="block text-xs tracking-[0.1em] uppercase mb-3"
                    style={{ fontFamily: 'Bricolage Grotesque, sans-serif', color: colors.muted }}
                  >
                    Email
                  </label>
                  <input
                    id="contact-email"
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@company.com"
                    className="w-full border px-5 py-4 text-sm outline-none transition-all duration-300 focus:border-[#00C8E8]"
                    style={{
                      background: colors.surface,
                      borderColor: colors.border,
                      fontFamily: 'Inter, sans-serif',
                      color: colors.text,
                      transition: 'background-color 0.3s ease, border-color 0.3s ease, color 0.3s ease',
                    }}
                  />
                </div>
                <div>
                  <label
                    htmlFor="contact-message"
                    className="block text-xs tracking-[0.1em] uppercase mb-3"
                    style={{ fontFamily: 'Bricolage Grotesque, sans-serif', color: colors.muted }}
                  >
                    Message
                  </label>
                  <textarea
                    id="contact-message"
                    required
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    rows={5}
                    placeholder="What are you building?"
                    className="w-full border px-5 py-4 text-sm outline-none transition-all duration-300 focus:border-[#00C8E8] resize-none"
                    style={{
                      background: colors.surface,
                      borderColor: colors.border,
                      fontFamily: 'Inter, sans-serif',
                      color: colors.text,
                      transition: 'background-color 0.3s ease, border-color 0.3s ease, color 0.3s ease',
                    }}
                  />
                </div>
                <button
                  type="submit"
                  className="w-full py-4 text-sm font-semibold tracking-[0.1em] uppercase transition-all duration-300 hover:opacity-90"
                  style={{
                    fontFamily: 'Bricolage Grotesque, sans-serif',
                    background: colors.text,
                    color: colors.bg,
                    transition: 'background-color 0.3s ease, color 0.3s ease, opacity 0.3s ease',
                  }}
                >
                  Send Message
                </button>
              </form>
            ) : (
              <div
                className="border p-10"
                style={{ borderColor: '#22C55E33', background: '#22C55E08', transition: 'background-color 0.3s ease, border-color 0.3s ease' }}
                role="status"
                aria-live="polite"
              >
                <p
                  className="text-lg font-semibold mb-2"
                  style={{ fontFamily: 'Bricolage Grotesque, sans-serif', color: '#22C55E' }}
                >
                  Message received.
                </p>
                <p className="text-sm" style={{ color: colors.muted, fontFamily: 'Inter, sans-serif' }}>
                  I'll be in touch within 24 hours.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer
        className="absolute bottom-0 left-0 right-0 px-8 md:px-16 py-6 flex flex-col sm:flex-row items-center justify-between gap-3 border-t"
        style={{ borderColor: colors.elevated, transition: 'border-color 0.3s ease' }}
      >
        <span className="text-xs font-semibold" style={{ fontFamily: 'Bricolage Grotesque, sans-serif', color: colors.text }}>
          AC
        </span>
        <span className="text-xs" style={{ fontFamily: 'Inter, sans-serif', color: colors.border }}>
          © 2026 Nur Wachid — TypeScript · React · Three.js
        </span>
        <span className="text-xs" style={{ fontFamily: 'Inter, sans-serif', color: colors.border }}>
          Systems over features.
        </span>
      </footer>
    </section>
  );
}
