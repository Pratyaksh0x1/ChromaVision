import React from 'react';

export default function BalloonsSuspension() {
  return (
    <div style={{
      position: 'absolute',
      top: '-150px',
      left: '50%',
      transform: 'translateX(-50%)',
      width: '260px',
      height: '160px',
      pointerEvents: 'none',
      zIndex: 10
    }}>
      <svg viewBox="0 0 260 160" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ width: '100%', height: '100%' }}>
        {/* Left Balloon */}
        <ellipse cx="75" cy="50" rx="36" ry="46" fill="#1C1819" />
        <ellipse cx="64" cy="38" rx="8" ry="16" fill="rgba(255,255,255,0.12)" transform="rotate(-15 64 38)" />
        <polygon points="72,96 78,96 75,102" fill="#1C1819" />

        {/* Right Balloon */}
        <ellipse cx="185" cy="54" rx="36" ry="46" fill="#1C1819" />
        <ellipse cx="174" cy="42" rx="8" ry="16" fill="rgba(255,255,255,0.12)" transform="rotate(-15 174 42)" />
        <polygon points="182,100 188,100 185,106" fill="#1C1819" />

        {/* Middle Balloon (front & larger) */}
        <ellipse cx="130" cy="42" rx="42" ry="52" fill="#282224" />
        <ellipse cx="118" cy="28" rx="10" ry="20" fill="rgba(255,255,255,0.16)" transform="rotate(-15 118 28)" />
        <polygon points="126,94 134,94 130,100" fill="#282224" />

        {/* Strings tying to center ring */}
        <path d="M75,102 Q100,125 130,140" stroke="#1C1819" strokeWidth="1.8" fill="none" />
        <path d="M185,106 Q160,125 130,140" stroke="#1C1819" strokeWidth="1.8" fill="none" />
        <path d="M130,100 L130,140" stroke="#1C1819" strokeWidth="1.8" fill="none" />

        {/* Tie Knot Ring */}
        <circle cx="130" cy="140" r="5" fill="#E84855" stroke="#1C1819" strokeWidth="2" />
        
        {/* String down to TV frame */}
        <path d="M130,145 L130,165" stroke="#1C1819" strokeWidth="2.5" strokeDasharray="3 3" fill="none" />
      </svg>
    </div>
  );
}
