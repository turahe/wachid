import { useEffect, useRef, useState } from 'react';

type CursorState = 'default' | 'interactive' | 'architecture-node' | 'project' | 'external-link';

export default function Cursor() {
  const dotRef = useRef<HTMLDivElement>(null);
  const ringRef = useRef<HTMLDivElement>(null);
  const [state, setState] = useState<CursorState>('default');
  const [visible, setVisible] = useState(false);
  const pos = useRef({ x: 0, y: 0 });
  const ring = useRef({ x: 0, y: 0 });

  useEffect(() => {
    // Only on pointer-fine devices
    if (!window.matchMedia('(pointer: fine)').matches) return;

    let animId: number;

    const onMove = (e: MouseEvent) => {
      pos.current = { x: e.clientX, y: e.clientY };
      if (!visible) setVisible(true);

      const target = e.target as HTMLElement;
      if (target.closest('a[href^="http"], a[href^="mailto"]')) {
        setState('external-link');
      } else if (target.closest('[data-cursor="project"]')) {
        setState('project');
      } else if (target.closest('[data-cursor="arch-node"]')) {
        setState('architecture-node');
      } else if (target.closest('button, a, input, textarea, select, [role="button"], [tabindex]')) {
        setState('interactive');
      } else {
        setState('default');
      }
    };

    const onLeave = () => setVisible(false);
    window.addEventListener('mousemove', onMove);
    document.addEventListener('mouseleave', onLeave);

    const animate = () => {
      animId = requestAnimationFrame(animate);
      const ease = 0.1;
      ring.current.x += (pos.current.x - ring.current.x) * ease;
      ring.current.y += (pos.current.y - ring.current.y) * ease;

      if (dotRef.current) {
        dotRef.current.style.transform = `translate(${pos.current.x}px, ${pos.current.y}px) translate(-50%, -50%)`;
      }
      if (ringRef.current) {
        ringRef.current.style.transform = `translate(${ring.current.x}px, ${ring.current.y}px) translate(-50%, -50%)`;
      }
    };
    animId = requestAnimationFrame(animate);

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('mousemove', onMove);
      document.removeEventListener('mouseleave', onLeave);
    };
  }, [visible]);

  const stateStyles: Record<CursorState, { dot: React.CSSProperties; ring: React.CSSProperties }> = {
    default: {
      dot: { width: 4, height: 4, background: '#F5F5F5', borderRadius: '50%' },
      ring: { width: 32, height: 32, border: '1px solid #4A4A4A', borderRadius: '50%' },
    },
    interactive: {
      dot: { width: 4, height: 4, background: '#00C8E8', borderRadius: '50%' },
      ring: { width: 40, height: 40, border: '1px solid #00C8E8', borderRadius: '50%', opacity: 0.6 },
    },
    'architecture-node': {
      dot: { width: 6, height: 6, background: '#8B5CF6', borderRadius: '50%' },
      ring: { width: 48, height: 48, border: '1px solid #8B5CF6', borderRadius: 2, opacity: 0.5, transform: 'rotate(45deg)' },
    },
    project: {
      dot: { width: 4, height: 4, background: '#F5F5F5', borderRadius: '50%' },
      ring: { width: 56, height: 20, border: '1px solid #8A8A8A', borderRadius: 1, opacity: 0.4 },
    },
    'external-link': {
      dot: { width: 4, height: 4, background: '#00C8E8', borderRadius: '50%' },
      ring: { width: 36, height: 36, border: '1px solid #00C8E844', borderRadius: '50%' },
    },
  };

  const s = stateStyles[state];

  return (
    <>
      {/* Dot */}
      <div
        ref={dotRef}
        aria-hidden="true"
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          zIndex: 9999,
          pointerEvents: 'none',
          opacity: visible ? 1 : 0,
          transition: 'opacity 0.3s, width 0.2s, height 0.2s, background 0.2s, border-radius 0.2s',
          ...s.dot,
        }}
      />
      {/* Ring (lagging) */}
      <div
        ref={ringRef}
        aria-hidden="true"
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          zIndex: 9998,
          pointerEvents: 'none',
          opacity: visible ? 1 : 0,
          transition: 'opacity 0.3s, width 0.25s, height 0.25s, border-color 0.25s, border-radius 0.25s',
          ...s.ring,
        }}
      />
    </>
  );
}
