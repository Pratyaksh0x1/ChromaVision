import React from 'react';
import { motion, useScroll, useSpring } from 'framer-motion';

export default function ScrollProgressBar() {
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 120,
    damping: 30,
    restDelta: 0.001
  });

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        height: '4px',
        zIndex: 9999,
        background: 'rgba(30, 8, 15, 0.08)',
        pointerEvents: 'none',
      }}
    >
      <motion.div
        style={{
          scaleX,
          transformOrigin: '0%',
          height: '100%',
          background: 'linear-gradient(90deg, #FF2E63 0%, #FFD166 50%, #06D6A0 100%)',
          boxShadow: '0 0 12px rgba(255, 46, 99, 0.8), 0 0 4px #FFD166',
        }}
      />
    </div>
  );
}
