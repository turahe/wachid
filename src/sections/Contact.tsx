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
      className="relative min-h-screen flex flex-col justify-center py-32 overflow-hidden bg-token-bg border-t-token"
      aria-labelledby="contact-heading"
    >
      {/* Subtle grid */}
      <div
        className="absolute inset-0 pointer-events-none transition-theme"
        style={{
          backgroundImage: `linear-gradient(${colors.surface} 1px, transparent 1px), linear-gradient(90deg, ${colors.surface} 1px, transparent 1px)`,
          backgroundSize: '80px 80px',
        }}
        aria-hidden="true"
      />

      <div className="relative z-10 max-w-7xl mx-auto px-8 md:px-16 w-full">
        <div className="grid lg:grid-cols-2 gap-24 items-start">
          {/* Left */}
          <div>
            <p className="eyebrow mb-6">
              09 — What's Next
            </p>
            <h2
              id="contact-heading"
              className="font-display font-extrabold leading-[0.95] text-token mb-8 tracking-[-0.03em]"
              style={{
                fontSize: 'clamp(2.5rem, 5vw, 4.5rem)',
              }}
            >
              Let's build
              <br />
              something
              <br />
              meaningful.
            </h2>
            <p className="text-lg leading-relaxed mb-12 font-body text-token-muted font-light max-w-[26rem]">
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
                  className="flex items-center justify-between py-4 border-b border-token group transition-all duration-300"
                >
                  <div>
                    <span
                      className="block text-sm font-semibold mb-0.5 transition-colors group-hover:text-[#00C8E8] font-display text-token"
                    >
                      {label}
                    </span>
                    <span className="text-xs font-body text-token-muted">
                      {sub}
                    </span>
                  </div>
                  <span
                    className="text-sm transition-all duration-300 group-hover:translate-x-1 group-hover:text-[#00C8E8] text-token-muted"
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
                    className="block text-xs tracking-[0.1em] uppercase mb-3 font-display text-token-muted"
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
                    className="w-full border px-5 py-4 text-sm outline-none transition-all duration-300 focus:border-[#00C8E8] bg-token-surface border-token font-body text-token transition-theme"
                  />
                </div>
                <div>
                  <label
                    htmlFor="contact-message"
                    className="block text-xs tracking-[0.1em] uppercase mb-3 font-display text-token-muted"
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
                    className="w-full border px-5 py-4 text-sm outline-none transition-all duration-300 focus:border-[#00C8E8] resize-none bg-token-surface border-token font-body text-token transition-theme"
                  />
                </div>
                <button
                  type="submit"
                  className="w-full py-4 text-sm font-semibold tracking-[0.1em] uppercase transition-all duration-300 hover:opacity-90 font-display"
                  style={{
                    background: colors.text,
                    color: colors.bg,
                  }}
                >
                  Send Message
                </button>
              </form>
            ) : (
              <div
                className="border p-10 bg-token-success-8 border-token-success-20 transition-theme"
                role="status"
                aria-live="polite"
              >
                <p
                  className="text-lg font-semibold mb-2 font-display text-token-success"
                >
                  Message received.
                </p>
                <p className="text-sm font-body text-token-muted">
                  I'll be in touch within 24 hours.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer
        className="absolute bottom-0 left-0 right-0 px-8 md:px-16 py-6 flex flex-col sm:flex-row items-center justify-between gap-3 border-t border-token-elevated transition-theme"
      >
        <span className="text-xs font-semibold font-display text-token">
          AC
        </span>
        <span className="text-xs font-body" style={{ color: colors.border }}>
          © 2026 Nur Wachid — TypeScript · React · Three.js
        </span>
        <span className="text-xs font-body" style={{ color: colors.border }}>
          Systems over features.
        </span>
      </footer>
    </section>
  );
}
