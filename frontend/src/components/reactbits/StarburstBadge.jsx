import React from 'react';

export default function StarburstBadge({ text = "User rating", stars = "★★★★★", subtext = "100% Neural" }) {
  return (
    <div style={{
      position: 'absolute',
      top: '-25px',
      right: '-25px',
      zIndex: 25,
      filter: 'drop-shadow(0 8px 16px rgba(0,0,0,0.25))',
      transform: 'rotate(8deg)',
      pointerEvents: 'none'
    }}>
      <div style={{
        position: 'relative',
        width: '110px',
        height: '110px',
        borderRadius: '50%',
        background: 'radial-gradient(circle, #2563EB 0%, #1D4ED8 100%)',
        border: '3px dashed #93C5FD',
        boxShadow: '0 0 0 4px #1E40AF',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        color: '#FFFFFF',
        textAlign: 'center',
        padding: '10px'
      }}>
        <div style={{
          fontSize: '0.74rem',
          fontWeight: 700,
          fontFamily: 'var(--font-heading)',
          textTransform: 'uppercase',
          letterSpacing: '0.04em'
        }}>
          {text}
        </div>
        <div style={{
          color: '#FBBF24',
          fontSize: '0.9rem',
          letterSpacing: '2px',
          margin: '2px 0'
        }}>
          {stars}
        </div>
        <div style={{
          fontSize: '0.62rem',
          fontWeight: 800,
          background: 'rgba(255,255,255,0.2)',
          padding: '2px 6px',
          borderRadius: '9999px',
          letterSpacing: '0.05em'
        }}>
          {subtext}
        </div>
      </div>

      {/* Ribbon tails hanging below */}
      <div style={{
        position: 'absolute',
        bottom: '-14px',
        left: '25px',
        width: '20px',
        height: '24px',
        background: '#1D4ED8',
        clipPath: 'polygon(0 0, 100% 0, 100% 100%, 50% 70%, 0 100%)',
        zIndex: -1
      }} />
      <div style={{
        position: 'absolute',
        bottom: '-14px',
        right: '25px',
        width: '20px',
        height: '24px',
        background: '#1E40AF',
        clipPath: 'polygon(0 0, 100% 0, 100% 100%, 50% 70%, 0 100%)',
        zIndex: -1
      }} />
    </div>
  );
}
