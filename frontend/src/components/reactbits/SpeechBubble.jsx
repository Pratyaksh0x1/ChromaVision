import React from 'react';

export default function SpeechBubble({ text = "This neural net is top of the line!", arrowPosition = "bottom-left" }) {
  return (
    <div style={{
      position: 'relative',
      background: '#181216',
      color: '#FFFFFF',
      padding: '16px 22px',
      borderRadius: '24px',
      fontFamily: 'var(--font-heading)',
      fontWeight: 700,
      fontSize: '1.05rem',
      letterSpacing: '0.01em',
      boxShadow: '0 12px 28px rgba(0,0,0,0.3)',
      display: 'inline-block',
      maxWidth: '280px',
      textAlign: 'center',
      border: '2px solid rgba(255,255,255,0.1)'
    }}>
      {/* Decorative lightning spark */}
      <div style={{ position: 'absolute', top: '-10px', left: '16px', color: '#FFD166', fontSize: '1.2rem' }}>
        ⚡
      </div>
      
      {text}

      {/* Bubble pointer tail */}
      <div style={{
        position: 'absolute',
        bottom: '-12px',
        left: '36px',
        width: 0,
        height: 0,
        borderLeft: '12px solid transparent',
        borderRight: '12px solid transparent',
        borderTop: '14px solid #181216',
      }} />
    </div>
  );
}
