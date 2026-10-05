import React from 'react';

export default function CloudDivider({ fillColor = '#FAF6EF' }) {
  return (
    <div style={{
      position: 'relative',
      width: '100%',
      overflow: 'hidden',
      lineHeight: 0,
      transform: 'translateY(1px)',
      zIndex: 5
    }}>
      <svg 
        viewBox="0 0 1440 180" 
        fill="none" 
        xmlns="http://www.w3.org/2000/svg"
        preserveAspectRatio="none"
        style={{ width: '100%', height: '120px', display: 'block' }}
      >
        {/* Back Cloud Layer (slightly darker cream for depth) */}
        <path 
          d="M0,180 L0,110 C80,105 140,75 220,95 C300,115 360,70 450,85 C540,100 620,55 720,70 C820,85 880,45 980,65 C1080,85 1160,50 1260,80 C1340,105 1400,90 1440,95 L1440,180 Z" 
          fill="#EDE7DC" 
        />
        {/* Front Cloud Layer (main background cream) */}
        <path 
          d="M0,180 L0,130 C60,115 110,80 180,95 C250,110 320,65 400,85 C480,105 560,75 640,90 C720,105 800,60 890,80 C980,100 1060,70 1140,85 C1220,100 1300,75 1380,95 C1410,102 1430,115 1440,120 L1440,180 Z" 
          fill={fillColor} 
        />
      </svg>
    </div>
  );
}
