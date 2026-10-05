import React from 'react';

export default function TapeSticker({ 
  text, 
  subtext, 
  icon, 
  color = '#2563EB', 
  textColor = '#FFFFFF', 
  rotate = -3,
  tapeColor = 'rgba(255, 235, 179, 0.75)',
  tapeAngle = -5
}) {
  return (
    <div style={{
      position: 'relative',
      display: 'inline-block',
      transform: `rotate(${rotate}deg)`,
      margin: '12px 14px',
      cursor: 'pointer',
      transition: 'transform 0.2s cubic-bezier(0.175, 0.885, 0.32, 1.275)'
    }}
    onMouseEnter={(e) => e.currentTarget.style.transform = `rotate(${rotate * 1.5}deg) scale(1.05)`}
    onMouseLeave={(e) => e.currentTarget.style.transform = `rotate(${rotate}deg) scale(1)`}
    >
      {/* Scotch Tape Strip */}
      <div style={{
        position: 'absolute',
        top: '-10px',
        left: '50%',
        transform: `translateX(-50%) rotate(${tapeAngle}deg)`,
        width: '54px',
        height: '20px',
        background: tapeColor,
        boxShadow: '0 1px 3px rgba(0,0,0,0.15)',
        zIndex: 10,
        opacity: 0.9,
        borderLeft: '1px dashed rgba(0,0,0,0.1)',
        borderRight: '1px dashed rgba(0,0,0,0.1)'
      }} />

      {/* Main Tag Body */}
      <div style={{
        backgroundColor: color,
        color: textColor,
        padding: '12px 20px',
        borderRadius: '12px',
        boxShadow: '0 10px 20px -5px rgba(0,0,0,0.25), 0 2px 4px rgba(0,0,0,0.15)',
        display: 'flex',
        alignItems: 'center',
        gap: '10px',
        border: '2px solid rgba(255,255,255,0.2)'
      }}>
        {icon && <div style={{ fontSize: '1.2rem', display: 'flex', alignItems: 'center' }}>{icon}</div>}
        <div>
          <div style={{ fontWeight: 800, fontSize: '0.92rem', fontFamily: 'var(--font-heading)' }}>
            {text}
          </div>
          {subtext && (
            <div style={{ fontSize: '0.72rem', opacity: 0.9, fontFamily: 'var(--font-body)' }}>
              {subtext}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
