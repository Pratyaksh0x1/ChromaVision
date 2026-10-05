import React, { useEffect, useState, useRef } from 'react';

export default function CustomCursor() {
  const [position, setPosition] = useState({ x: -100, y: -100 });
  const [trailingPos, setTrailingPos] = useState({ x: -100, y: -100 });
  const [cursorState, setCursorState] = useState('default');
  const [cursorLabel, setCursorLabel] = useState('');
  const [isClicking, setIsClicking] = useState(false);
  const [isVisible, setIsVisible] = useState(false);

  const posRef = useRef({ x: -100, y: -100 });
  const trailRef = useRef({ x: -100, y: -100 });
  const requestRef = useRef(null);

  useEffect(() => {
    const hasPointer = window.matchMedia('(pointer: fine)').matches;
    if (!hasPointer) return;

    setIsVisible(true);

    const handleMouseMove = (e) => {
      posRef.current = { x: e.clientX, y: e.clientY };
      setPosition({ x: e.clientX, y: e.clientY });

      const target = e.target;
      if (!target) return;

      const cursorAttr = target.closest('[data-cursor]');
      const clickable = target.closest('button, a, input, select, textarea, [role="button"], .circle-stamp-green, .brand-logo');
      const isSlider = target.closest('.retro-slider-handle, .tv-monitor-screen, input[type="range"]');

      if (cursorAttr) {
        setCursorState('custom');
        setCursorLabel(cursorAttr.getAttribute('data-cursor') || 'CLICK');
      } else if (isSlider) {
        setCursorState('drag');
        setCursorLabel('↔ DRAG');
      } else if (clickable) {
        setCursorState('hover');
        setCursorLabel('');
      } else {
        setCursorState('default');
        setCursorLabel('');
      }
    };

    const handleMouseDown = () => setIsClicking(true);
    const handleMouseUp = () => setIsClicking(false);
    const handleMouseLeave = () => setIsVisible(false);
    const handleMouseEnter = () => setIsVisible(true);

    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    window.addEventListener('mousedown', handleMouseDown, { passive: true });
    window.addEventListener('mouseup', handleMouseUp, { passive: true });
    document.addEventListener('mouseleave', handleMouseLeave);
    document.addEventListener('mouseenter', handleMouseEnter);

    const animateTrailing = () => {
      const lerp = 0.22;
      trailRef.current.x += (posRef.current.x - trailRef.current.x) * lerp;
      trailRef.current.y += (posRef.current.y - trailRef.current.y) * lerp;

      setTrailingPos({
        x: Math.round(trailRef.current.x * 10) / 10,
        y: Math.round(trailRef.current.y * 10) / 10,
      });

      requestRef.current = requestAnimationFrame(animateTrailing);
    };

    requestRef.current = requestAnimationFrame(animateTrailing);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mousedown', handleMouseDown);
      window.removeEventListener('mouseup', handleMouseUp);
      document.removeEventListener('mouseleave', handleMouseLeave);
      document.removeEventListener('mouseenter', handleMouseEnter);
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
    };
  }, []);

  if (!isVisible) return null;

  const isCustomOrHover = cursorState === 'hover' || cursorState === 'custom';
  const isDrag = cursorState === 'drag';

  return (
    <div style={{ pointerEvents: 'none', position: 'fixed', inset: 0, zIndex: 99999, overflow: 'hidden' }}>
      {/* Precision Center Dot */}
      <div
        style={{
          position: 'fixed',
          left: 0,
          top: 0,
          transform: `translate3d(${position.x}px, ${position.y}px, 0) translate(-50%, -50%) scale(${
            isClicking ? 0.7 : isCustomOrHover ? 1.3 : 1
          })`,
          width: '8px',
          height: '8px',
          borderRadius: '50%',
          backgroundColor: isDrag ? '#FFD166' : isCustomOrHover ? '#06D6A0' : '#FF2E63',
          boxShadow: '0 0 10px rgba(255, 46, 99, 0.7), 0 0 2px #FFFFFF',
          pointerEvents: 'none',
          transition: 'transform 0.05s ease-out'
        }}
      />

      {/* Trailing Aura Ring */}
      <div
        style={{
          position: 'fixed',
          left: 0,
          top: 0,
          transform: `translate3d(${trailingPos.x}px, ${trailingPos.y}px, 0) translate(-50%, -50%) scale(${
            isClicking ? 0.85 : 1
          })`,
          width: isDrag ? '72px' : isCustomOrHover ? (cursorLabel ? '86px' : '44px') : '32px',
          height: isDrag ? '34px' : isCustomOrHover ? (cursorLabel ? '32px' : '44px') : '32px',
          borderRadius: isCustomOrHover && cursorLabel ? '9999px' : isDrag ? '16px' : '50%',
          backgroundColor: isDrag
            ? 'rgba(255, 209, 102, 0.25)'
            : isCustomOrHover
            ? 'rgba(232, 72, 85, 0.22)'
            : 'rgba(30, 8, 15, 0.08)',
          border: isDrag
            ? '2px solid #FFD166'
            : isCustomOrHover
            ? '2px solid #FF2E63'
            : '1.5px solid rgba(232, 72, 85, 0.55)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          pointerEvents: 'none',
          transition: 'width 0.15s ease-out, height 0.15s ease-out, background-color 0.15s'
        }}
      >
        {(cursorLabel || isDrag) && (
          <span
            style={{
              fontFamily: 'var(--font-heading, "Fredoka", sans-serif)',
              fontSize: '0.68rem',
              fontWeight: 800,
              letterSpacing: '0.06em',
              color: isDrag ? '#1E080F' : '#FFFFFF',
              background: isDrag ? '#FFD166' : '#1E080F',
              padding: '2px 8px',
              borderRadius: '9999px',
              textTransform: 'uppercase',
              boxShadow: '0 2px 5px rgba(0,0,0,0.2)',
              whiteSpace: 'nowrap',
              pointerEvents: 'none'
            }}
          >
            {cursorLabel || '↔ DRAG'}
          </span>
        )}
      </div>
    </div>
  );
}
