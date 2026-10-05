import React, { useRef } from 'react';
import { motion, useScroll, useTransform, useSpring } from 'framer-motion';

/**
 * ParallaxElement
 * Smoothly translates children at different scroll speeds with spring physics.
 * @param {number} speed - Positive for delayed drift (+0.2, +0.5), Negative for fast drift (-0.2, -0.4)
 * @param {number} rotateSpeed - Optional subtle rotation with scroll
 * @param {string} direction - 'y' or 'x'
 */
export default function ParallaxElement({
  children,
  speed = 0.2,
  rotateSpeed = 0,
  direction = 'y',
  className = '',
  style = {},
  ...props
}) {
  const ref = useRef(null);
  
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start end', 'end start']
  });

  // Calculate translation range based on speed
  const offset = speed * 220;
  const rawY = useTransform(scrollYProgress, [0, 1], [-offset, offset]);
  const smoothY = useSpring(rawY, { stiffness: 90, damping: 22, mass: 0.6 });

  const rawRotate = useTransform(scrollYProgress, [0, 1], [-rotateSpeed * 15, rotateSpeed * 15]);
  const smoothRotate = useSpring(rawRotate, { stiffness: 90, damping: 22 });

  return (
    <motion.div
      ref={ref}
      className={className}
      style={{
        ...style,
        ...(direction === 'y' ? { y: smoothY } : { x: smoothY }),
        ...(rotateSpeed !== 0 ? { rotate: smoothRotate } : {}),
        willChange: 'transform'
      }}
      {...props}
    >
      {children}
    </motion.div>
  );
}
