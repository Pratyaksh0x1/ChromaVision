import React from 'react';
import { motion } from 'framer-motion';

/**
 * ScrollReveal
 * Elegant entrance animation triggered when scrolled into view.
 */
export default function ScrollReveal({
  children,
  delay = 0,
  duration = 0.65,
  direction = 'up', // 'up', 'down', 'left', 'right', 'scale', 'none'
  distance = 36,
  className = '',
  style = {},
  threshold = 0.15,
  once = false,
  ...props
}) {
  const getInitialPosition = () => {
    switch (direction) {
      case 'up':
        return { opacity: 0, y: distance, scale: 0.98 };
      case 'down':
        return { opacity: 0, y: -distance, scale: 0.98 };
      case 'left':
        return { opacity: 0, x: distance, scale: 0.98 };
      case 'right':
        return { opacity: 0, x: -distance, scale: 0.98 };
      case 'scale':
        return { opacity: 0, scale: 0.9 };
      case 'none':
        return { opacity: 0 };
      default:
        return { opacity: 0, y: distance };
    }
  };

  const getTargetPosition = () => {
    switch (direction) {
      case 'up':
      case 'down':
        return { opacity: 1, y: 0, scale: 1 };
      case 'left':
      case 'right':
        return { opacity: 1, x: 0, scale: 1 };
      case 'scale':
      case 'none':
        return { opacity: 1, scale: 1 };
      default:
        return { opacity: 1, y: 0 };
    }
  };

  return (
    <motion.div
      className={className}
      initial={getInitialPosition()}
      whileInView={getTargetPosition()}
      viewport={{ once, amount: threshold }}
      transition={{
        duration,
        delay,
        ease: [0.21, 0.47, 0.32, 0.98], // smooth Apple-like easing
      }}
      style={{ ...style, willChange: 'opacity, transform' }}
      {...props}
    >
      {children}
    </motion.div>
  );
}
