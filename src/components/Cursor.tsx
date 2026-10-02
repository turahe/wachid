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
        const rotate = state === 'architecture-node' ? ' rotate(45deg)' : '';
        ringRef.current.style.transform = `translate(${ring.current.x}px, ${ring.current.y}px) translate(-50%, -50%)${rotate}`;
      }
    };
    animId = requestAnimationFrame(animate);

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('mousemove', onMove);
      document.removeEventListener('mouseleave', onLeave);
    };
  }, [visible, state]);

  return (
    <div data-cursor-state={state}>
      {/* Dot */}
      <div
        ref={dotRef}
        aria-hidden="true"
        className={`cursor-base cursor-dot ${visible ? 'visible' : ''}`}
      />
      {/* Ring (lagging) */}
      <div
        ref={ringRef}
        aria-hidden="true"
        className={`cursor-base cursor-ring ${visible ? 'visible' : ''}`}
      />
    </div>
  );
}
