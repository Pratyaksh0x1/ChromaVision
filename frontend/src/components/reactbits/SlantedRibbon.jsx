import React from 'react';

export default function SlantedRibbon({ 
  text = "Three trained models: 1. Restoration ➔ 2. Enhancement ➔ 3. Colorization — Run together or individually!",
  highlight = "Chroma Vision" 
}) {
  return (
    <div style={{
      position: 'relative',
      margin: '24px auto 0',
      maxWidth: '780px',
      transform: 'rotate(-1.5deg)',
      zIndex: 15
    }}>
      <div style={{
        background: '#181216',
        color: '#FFFFFF',
        padding: '16px 28px',
        borderRadius: '16px',
        boxShadow: '0 12px 24px -5px rgba(0,0,0,0.3)',
        fontSize: '0.96rem',
        fontWeight: 600,
        lineHeight: 1.5,
        fontFamily: 'var(--font-heading)',
        textAlign: 'center',
        border: '2px solid rgba(255,255,255,0.1)',
        position: 'relative'
      }}>
        {/* Connection knot loop to monitor above */}
        <div style={{
          position: 'absolute',
          top: '-18px',
          left: '50%',
          transform: 'translateX(-50%)',
          width: '16px',
          height: '20px',
          borderLeft: '2px dashed #181216',
          borderRight: '2px dashed #181216',
        }} />

        <span style={{ color: '#FFD166', marginRight: '6px' }}>★</span>
        {text}
      </div>
    </div>
  );
}
