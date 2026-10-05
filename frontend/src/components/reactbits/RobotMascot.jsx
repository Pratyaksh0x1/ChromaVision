import React from 'react';

export default function RobotMascot({ width = 180, height = 210 }) {
  return (
    <svg 
      width={width} 
      height={height} 
      viewBox="0 0 200 240" 
      fill="none" 
      xmlns="http://www.w3.org/2000/svg"
      style={{ overflow: 'visible', filter: 'drop-shadow(0 15px 25px rgba(0,0,0,0.25))' }}
    >
      {/* Shadow */}
      <ellipse cx="100" cy="230" rx="65" ry="10" fill="rgba(0,0,0,0.15)" />

      {/* Left Mechanical Articulated Arm with Claw */}
      <g className="arm-left">
        {/* Shoulder */}
        <circle cx="50" cy="115" r="10" fill="#3B0715" />
        {/* Segment 1 */}
        <path d="M48 115 L25 95" stroke="#3B0715" strokeWidth="12" strokeLinecap="round" />
        <path d="M48 115 L25 95" stroke="#E84855" strokeWidth="4" strokeLinecap="round" />
        {/* Elbow Joint */}
        <circle cx="25" cy="95" r="7" fill="#3B0715" />
        {/* Segment 2 */}
        <path d="M25 95 L18 65" stroke="#3B0715" strokeWidth="10" strokeLinecap="round" />
        {/* Claw Hand */}
        <path d="M8 58 Q18 65 24 50" stroke="#3B0715" strokeWidth="6" strokeLinecap="round" fill="none" />
        <path d="M16 65 Q28 65 32 52" stroke="#3B0715" strokeWidth="6" strokeLinecap="round" fill="none" />
      </g>

      {/* Right Mechanical Articulated Arm with Claw */}
      <g className="arm-right">
        {/* Shoulder */}
        <circle cx="150" cy="115" r="10" fill="#3B0715" />
        {/* Segment 1 */}
        <path d="M150 115 L175 125" stroke="#3B0715" strokeWidth="12" strokeLinecap="round" />
        <path d="M150 115 L175 125" stroke="#E84855" strokeWidth="4" strokeLinecap="round" />
        {/* Elbow Joint */}
        <circle cx="175" cy="125" r="7" fill="#3B0715" />
        {/* Segment 2 */}
        <path d="M175 125 L185 155" stroke="#3B0715" strokeWidth="10" strokeLinecap="round" />
        {/* Claw Hand */}
        <path d="M175 165 Q185 155 195 162" stroke="#3B0715" strokeWidth="6" strokeLinecap="round" fill="none" />
        <path d="M178 150 Q188 156 194 148" stroke="#3B0715" strokeWidth="6" strokeLinecap="round" fill="none" />
      </g>

      {/* Robot Body */}
      <rect x="55" y="90" width="90" height="110" rx="30" fill="#1E080F" />
      {/* Front Screen / Sensor Panel */}
      <rect x="68" y="105" width="64" height="60" rx="16" fill="#2E0E18" stroke="#4A1224" strokeWidth="2" />
      
      {/* Camera / Lens Sensor Dial */}
      <circle cx="100" cy="135" r="18" fill="#15050A" stroke="#E84855" strokeWidth="3" />
      <circle cx="100" cy="135" r="8" fill="#FF2E63" />
      <circle cx="97" cy="132" r="3" fill="#FFFFFF" />

      {/* Robot Head */}
      <rect x="60" y="32" width="80" height="54" rx="26" fill="#1E080F" />
      
      {/* Antennas */}
      <line x1="78" y1="32" x2="68" y2="14" stroke="#1E080F" strokeWidth="5" strokeLinecap="round" />
      <circle cx="68" cy="14" r="5" fill="#E84855" />

      <line x1="122" y1="32" x2="132" y2="14" stroke="#1E080F" strokeWidth="5" strokeLinecap="round" />
      <circle cx="132" cy="14" r="5" fill="#E84855" />

      {/* Glowing Cheerful Eyes */}
      <ellipse cx="82" cy="56" rx="8" ry="11" fill="#FF2E63" />
      <circle cx="80" cy="53" r="3.5" fill="#FFFFFF" />

      <ellipse cx="118" cy="56" rx="8" ry="11" fill="#FF2E63" />
      <circle cx="116" cy="53" r="3.5" fill="#FFFFFF" />

      {/* Smirk Smile */}
      <path d="M92 70 Q100 77 108 70" stroke="#FFFFFF" strokeWidth="3" strokeLinecap="round" fill="none" />

      {/* Robot Legs */}
      <rect x="76" y="196" width="16" height="24" rx="8" fill="#1E080F" />
      <ellipse cx="84" cy="220" rx="14" ry="6" fill="#3B0715" />

      <rect x="108" y="196" width="16" height="24" rx="8" fill="#1E080F" />
      <ellipse cx="116" cy="220" rx="14" ry="6" fill="#3B0715" />
    </svg>
  );
}
