import React from 'react';
import { Sparkles, Award, TrendingUp, CheckCircle, ArrowRight } from 'lucide-react';
import MagneticButton from './reactbits/MagneticButton';
import ParallaxElement from './ParallaxElement';
import ScrollReveal from './ScrollReveal';

export default function PomegranateShowcase({ onStartClick }) {
  return (
    <section id="models" className="content-section" style={{ borderTop: '2px solid rgba(30, 8, 15, 0.08)' }}>
      {/* Top Header Pill */}
      <ScrollReveal direction="up" delay={0.05}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px', marginBottom: '36px' }}>
          <button className="btn-pomegranate-cream" data-cursor="MORE">
            <span>☰ LEARN MORE</span>
          </button>

          <MagneticButton onClick={onStartClick} className="btn-pomegranate-cherry" data-cursor="RESTORE">
            <span>REGISTER YOUR RESTORATION</span>
          </MagneticButton>
        </div>
      </ScrollReveal>

      <ScrollReveal direction="up" delay={0.1}>
        <div style={{ textAlign: 'center', marginBottom: '40px' }}>
          <h2 style={{
            fontFamily: 'var(--font-heading)',
            fontSize: 'clamp(2.2rem, 4vw, 3.2rem)',
            fontWeight: 700,
            color: 'var(--text-dark)',
            marginBottom: '10px'
          }}>
            Intelligent Archival Vision
          </h2>
          <p style={{ color: 'var(--text-medium)', maxWidth: '620px', margin: '0 auto', fontSize: '1rem', lineHeight: 1.5 }}>
            Traditional restoration tools look backwards. Chroma Vision looks ahead — reconstructing depth, texture, and natural chromatic vibrancy.
          </p>
        </div>
      </ScrollReveal>

      {/* Three Illustrated Mobile Mockups with Multi-Speed Parallax */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
        gap: '30px',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        {/* Mockup 1: Comparison & Restoration (speed = 0.14) */}
        <ParallaxElement speed={0.14}>
          <div 
            style={{
              background: '#FFEBF0',
              border: '3.5px solid #2D0014',
              borderRadius: '40px',
              padding: '24px',
              boxShadow: '0 14px 0 #2D0014',
              position: 'relative'
            }}
            data-cursor="RESTORE"
          >
            <div style={{ textAlign: 'center', marginBottom: '14px' }}>
              <span style={{ fontFamily: 'var(--font-heading)', fontWeight: 700, fontSize: '0.86rem', color: '#820024', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                Stage 1 • Restoration
              </span>
              <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.4rem', fontWeight: 700, color: '#2D0014', marginTop: '4px' }}>
                restoration_R_34PT
              </h3>
            </div>

            <div style={{
              background: '#FFFFFF',
              border: '2.5px solid #2D0014',
              borderRadius: '24px',
              padding: '20px',
              marginBottom: '16px'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                <span style={{ fontWeight: 700, fontSize: '0.88rem', color: '#2D0014' }}>Heavy Damage PSNR</span>
                <span style={{ background: '#10B981', color: '#FFF', padding: '3px 8px', borderRadius: '9999px', fontSize: '0.72rem', fontWeight: 800 }}>
                  +4.48 dB Gain
                </span>
              </div>
              {/* Visual Bar */}
              <div style={{ height: '14px', background: '#FEE2E2', borderRadius: '9999px', overflow: 'hidden', border: '1.5px solid #2D0014', position: 'relative' }}>
                <div style={{ width: '82%', height: '100%', background: '#EF4444' }} />
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.74rem', color: '#6B7280', marginTop: '6px' }}>
                <span>Input: 19.68 dB</span>
                <span style={{ fontWeight: 700, color: '#1E080F' }}>Output: 24.16 dB</span>
              </div>
            </div>

            <div style={{
              background: '#FFFFFF',
              border: '2.5px solid #2D0014',
              borderRadius: '24px',
              padding: '20px'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                <span style={{ fontWeight: 700, fontSize: '0.88rem', color: '#2D0014' }}>Structural SSIM</span>
                <span style={{ fontWeight: 800, color: '#2563EB', fontSize: '0.92rem' }}>79.5%</span>
              </div>
              <p style={{ fontSize: '0.78rem', color: '#4B5563', lineHeight: 1.4 }}>
                Eliminates tear fissures and grain while preserving underlying anatomical contours.
              </p>
            </div>
          </div>
        </ParallaxElement>

        {/* Mockup 2: The Hero Rainbow Comparison Phone (Elevates forward with speed = -0.2) */}
        <ParallaxElement speed={-0.2} style={{ zIndex: 10 }}>
          <div 
            style={{
              background: '#FFF0F5',
              border: '4.5px solid #2D0014',
              borderRadius: '44px',
              padding: '28px',
              boxShadow: '0 20px 0 #2D0014',
              position: 'relative',
              transform: 'scale(1.04)',
            }}
            data-cursor="RAINBOW"
          >
            {/* Top Speaker Notch */}
            <div style={{ width: '80px', height: '6px', background: '#2D0014', borderRadius: '9999px', margin: '0 auto 16px' }} />

            {/* Title in Pomegranate style bubbly lowercase */}
            <div style={{ textAlign: 'center', marginBottom: '14px' }}>
              <div style={{ fontFamily: 'var(--font-heading)', fontSize: '1.8rem', fontWeight: 800, color: '#2D0014', letterSpacing: '-0.02em' }}>
                chroma<span style={{ color: '#E84855' }}>vision</span>
              </div>
              <div style={{ fontSize: '0.74rem', fontWeight: 700, color: '#820024', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                How your photo compares
              </div>
            </div>

            {/* Rainbow Benchmark Arch (Exact from Screenshot 3) */}
            <div style={{
              background: '#FFFFFF',
              border: '2.5px solid #2D0014',
              borderRadius: '28px',
              padding: '20px',
              textAlign: 'center',
              marginBottom: '16px'
            }}>
              <svg viewBox="0 0 200 110" style={{ width: '100%', maxHeight: '110px' }}>
                {/* Outer Arc: Colorfulness */}
                <path d="M20,100 A80,80 0 0,1 180,100" fill="none" stroke="#FFD166" strokeWidth="10" strokeLinecap="round" />
                {/* Mid Arc: SSIM */}
                <path d="M40,100 A60,60 0 0,1 160,100" fill="none" stroke="#10B981" strokeWidth="10" strokeLinecap="round" />
                {/* Inner Arc: PSNR */}
                <path d="M60,100 A40,40 0 0,1 140,100" fill="none" stroke="#E84855" strokeWidth="10" strokeLinecap="round" />
                {/* Center icon */}
                <circle cx="100" cy="100" r="14" fill="#820024" />
                <text x="100" y="104" textAnchor="middle" fill="#FFF" fontSize="12" fontWeight="bold">★</text>
              </svg>
              <div style={{ fontSize: '0.8rem', fontWeight: 700, color: '#2D0014', marginTop: '6px' }}>
                92.4% Colorfulness & 0.92 SSIM
              </div>
            </div>

            {/* Metric Rows */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 14px', background: '#FFF', border: '1.5px solid #2D0014', borderRadius: '14px', fontSize: '0.82rem', fontWeight: 700 }}>
                <span style={{ color: '#2D0014' }}>1. Restoration Speed</span>
                <span style={{ color: '#2563EB' }}>0.85s (Fast)</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 14px', background: '#FFF', border: '1.5px solid #2D0014', borderRadius: '14px', fontSize: '0.82rem', fontWeight: 700 }}>
                <span style={{ color: '#2D0014' }}>2. ESRGAN Scale</span>
                <span style={{ color: '#0284C7' }}>4x Resolution</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 14px', background: '#FFF', border: '1.5px solid #2D0014', borderRadius: '14px', fontSize: '0.82rem', fontWeight: 700 }}>
                <span style={{ color: '#2D0014' }}>3. Color Prior Ratio</span>
                <span style={{ color: '#10B981' }}>0.922 / 1.0</span>
              </div>
            </div>
          </div>
        </ParallaxElement>

        {/* Mockup 3: Enhancement & Colorization (speed = 0.08) */}
        <ParallaxElement speed={0.08}>
          <div 
            style={{
              background: '#FFF9E6',
              border: '3.5px solid #2D0014',
              borderRadius: '40px',
              padding: '24px',
              boxShadow: '0 14px 0 #2D0014',
              position: 'relative'
            }}
            data-cursor="COLOR"
          >
            <div style={{ textAlign: 'center', marginBottom: '14px' }}>
              <span style={{ fontFamily: 'var(--font-heading)', fontWeight: 700, fontSize: '0.86rem', color: '#B45309', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                Stage 2 & 3 • Super-Res + Color
              </span>
              <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.4rem', fontWeight: 700, color: '#2D0014', marginTop: '4px' }}>
                Real-ESRGAN + colorization_R_34PT
              </h3>
            </div>

            <div style={{
              background: '#FFFFFF',
              border: '2.5px solid #2D0014',
              borderRadius: '24px',
              padding: '20px',
              marginBottom: '16px'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                <span style={{ fontWeight: 700, fontSize: '0.88rem', color: '#2D0014' }}>Lab Chroma Synthesis</span>
                <span style={{ background: '#F59E0B', color: '#FFF', padding: '3px 8px', borderRadius: '9999px', fontSize: '0.72rem', fontWeight: 800 }}>
                  CIE ab Space
                </span>
              </div>
              <p style={{ fontSize: '0.78rem', color: '#4B5563', lineHeight: 1.4 }}>
                Predicts realistic pigments across clothing, skin, eyes, and natural foliage based on ResNet-34 semantic scene priors.
              </p>
            </div>

            <div style={{
              background: '#FFFFFF',
              border: '2.5px solid #2D0014',
              borderRadius: '24px',
              padding: '20px'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                <span style={{ fontWeight: 700, fontSize: '0.88rem', color: '#2D0014' }}>Real-ESRGAN x4+</span>
                <span style={{ fontWeight: 800, color: '#10B981', fontSize: '0.92rem' }}>RRDBNet</span>
              </div>
              <p style={{ fontSize: '0.78rem', color: '#4B5563', lineHeight: 1.4 }}>
                Super-resolves fine micro-textures, eyebrows, and architectural brickwork without synthetic blur.
              </p>
            </div>
          </div>
        </ParallaxElement>
      </div>
    </section>
  );
}
