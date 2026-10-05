import React from 'react';
import { Home, Sparkles, ArrowRight, ShieldCheck, Palette, Wand2 } from 'lucide-react';
import RobotMascot from './reactbits/RobotMascot';
import SpeechBubble from './reactbits/SpeechBubble';
import TapeSticker from './reactbits/TapeSticker';
import CloudDivider from './reactbits/CloudDivider';
import MagneticButton from './reactbits/MagneticButton';
import ParallaxElement from './ParallaxElement';
import ScrollReveal from './ScrollReveal';

export default function BoyCoyHero({ onStartClick, scrollToSection }) {
  return (
    <div className="hero-wrapper" style={{ position: 'relative', overflow: 'hidden' }}>
      {/* Background Parallax Floating Sparks & Tokens */}
      <ParallaxElement
        speed={-0.45}
        rotateSpeed={0.8}
        style={{
          position: 'absolute',
          top: '12%',
          left: '8%',
          pointerEvents: 'none',
          zIndex: 2,
          opacity: 0.35,
          color: '#FFD166',
          fontSize: '2.5rem',
          userSelect: 'none'
        }}
      >
        ✦
      </ParallaxElement>

      <ParallaxElement
        speed={0.35}
        rotateSpeed={-0.5}
        style={{
          position: 'absolute',
          bottom: '22%',
          left: '4%',
          pointerEvents: 'none',
          zIndex: 2,
          opacity: 0.25,
          color: '#FFFFFF',
          fontSize: '3.2rem',
          userSelect: 'none'
        }}
      >
        ★
      </ParallaxElement>

      <ParallaxElement
        speed={-0.3}
        style={{
          position: 'absolute',
          top: '25%',
          right: '42%',
          pointerEvents: 'none',
          zIndex: 2,
          opacity: 0.2,
          width: '80px',
          height: '80px',
          borderRadius: '50%',
          border: '4px dashed #FFFFFF',
        }}
      />

      <ParallaxElement
        speed={0.5}
        rotateSpeed={1.2}
        style={{
          position: 'absolute',
          top: '60%',
          right: '8%',
          pointerEvents: 'none',
          zIndex: 2,
          opacity: 0.3,
          color: '#06D6A0',
          fontSize: '2.8rem',
          userSelect: 'none'
        }}
      >
        ✦
      </ParallaxElement>

      {/* Boy-Coy Style Corner Ribbon Badge */}
      <ParallaxElement speed={-0.12} style={{ position: 'absolute', top: 0, right: 0, zIndex: 40 }}>
        <div className="corner-ribbon" data-cursor="AWARD">
          ★ Top Of The Line
        </div>
      </ParallaxElement>

      {/* Header Bar */}
      <header className="header-container">
        {/* Logo with playful wink face */}
        <div 
          className="brand-logo" 
          onClick={() => scrollToSection('hero')}
          data-cursor="CHROMA"
        >
          <div className="brand-icon">
            <svg width="26" height="26" viewBox="0 0 100 100" fill="none">
              <circle cx="50" cy="50" r="45" fill="#E84855" />
              {/* Wink Left Eye */}
              <path d="M30 42 Q40 48 50 42" stroke="#FFFFFF" strokeWidth="6" strokeLinecap="round" fill="none" />
              {/* Wide Open Right Eye */}
              <circle cx="68" cy="40" r="8" fill="#FFFFFF" />
              <circle cx="68" cy="40" r="4" fill="#1E080F" />
              {/* Cheerful Smile */}
              <path d="M34 62 Q50 82 66 62" stroke="#FFFFFF" strokeWidth="6" strokeLinecap="round" fill="none" />
            </svg>
          </div>
          <span className="brand-text">Chroma Vision<span style={{ color: '#FFD166' }}>.</span></span>
        </div>

        {/* Navigation items */}
        <nav className="nav-menu">
          <div className="nav-link-active" onClick={() => scrollToSection('hero')} data-cursor="HOME">
            <Home size={16} />
          </div>
          <span className="nav-link" onClick={() => scrollToSection('studio')} data-cursor="STUDIO">
            STUDIO
          </span>
          <span className="nav-link" onClick={() => scrollToSection('history')} data-cursor="HISTORY">
            HISTORY
          </span>
          <span className="nav-link" onClick={() => scrollToSection('models')} data-cursor="MODELS">
            MODELS
          </span>
          <span className="nav-link" onClick={() => scrollToSection('pipeline')} data-cursor="PIPELINE">
            PIPELINE
          </span>
          <span className="nav-link" onClick={() => scrollToSection('benchmarks')} data-cursor="STATS">
            BENCHMARKS
          </span>
        </nav>
      </header>

      {/* Main Hero Content */}
      <div style={{
        maxWidth: '1320px',
        margin: '0 auto',
        padding: '50px 24px 20px',
        display: 'grid',
        gridTemplateColumns: 'minmax(320px, 1fr) minmax(340px, 1fr)',
        gap: '40px',
        alignItems: 'center',
        position: 'relative',
        zIndex: 10
      }}>
        {/* Left Editorial Copy with Staggered Scroll Parallax */}
        <ParallaxElement speed={0.08}>
          <ScrollReveal direction="up" delay={0.1}>
            <h1 style={{
              fontFamily: 'var(--font-heading)',
              fontSize: 'clamp(3.8rem, 7vw, 6.2rem)',
              fontWeight: 700,
              lineHeight: 0.95,
              color: '#1E080F',
              letterSpacing: '-0.03em',
              marginBottom: '20px'
            }}>
              Hello!
            </h1>

            <p style={{
              fontSize: 'clamp(1.1rem, 1.4vw, 1.35rem)',
              color: '#FFFFFF',
              lineHeight: 1.5,
              maxWidth: '500px',
              marginBottom: '32px',
              fontWeight: 500
            }}>
              <strong>Chroma Vision</strong> is a creative neural design studio. The place where perfect restorations, colorized memories & ultra-sharp photos come to life.
            </p>

            {/* Action link with hand-drawn arrow */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '20px', flexWrap: 'wrap' }}>
              <MagneticButton 
                onClick={onStartClick} 
                className="btn-pomegranate-cherry"
                style={{ background: '#1E080F', borderColor: '#FFFFFF' }}
                data-cursor="START"
              >
                <span>Restore Photo ▸</span>
              </MagneticButton>

              <div className="hand-annotation" style={{ color: '#FFFFFF' }}>
                <span style={{ fontSize: '1.4rem' }}>⤹</span>
                <span>Need a restore? Try our presets!</span>
              </div>
            </div>
          </ScrollReveal>
        </ParallaxElement>

        {/* Right Character & Taped Stickers Canvas with Multi-Speed Parallax */}
        <div style={{
          position: 'relative',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '380px'
        }}>
          {/* Comic Speech Bubble - Floats faster upwards on scroll */}
          <ParallaxElement 
            speed={-0.38} 
            rotateSpeed={-0.3}
            style={{
              position: 'absolute',
              top: '-30px',
              left: '30px',
              zIndex: 25,
            }}
          >
            <div data-cursor="WOW">
              <SpeechBubble text="This neural net is top of the line!" />
            </div>
          </ParallaxElement>

          {/* Robot Mascot - Moderately fast drift with gentle bob */}
          <ParallaxElement speed={-0.18} style={{ margin: '40px auto 0', zIndex: 12 }}>
            <div data-cursor="MASCOT" className="animate-float-slow">
              <RobotMascot width={200} height={230} />
            </div>
          </ParallaxElement>

          {/* Taped Stickers Stack on the Right - Each sticker translates at a DIFFERENT speed */}
          <div style={{
            position: 'absolute',
            top: '30px',
            right: '-10px',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'flex-end',
            zIndex: 20
          }}>
            {/* Sticker 1: Restoration (speed = 0.16) */}
            <ParallaxElement speed={0.16} rotateSpeed={0.2}>
              <div data-cursor="RESTORE">
                <TapeSticker
                  text="restoration_R_34PT"
                  subtext="1. Heals scratches & grain"
                  icon={<ShieldCheck size={18} />}
                  color="#2563EB"
                  rotate={4}
                  tapeAngle={-6}
                />
              </div>
            </ParallaxElement>

            {/* Sticker 2: Colorization (speed = -0.14) */}
            <ParallaxElement speed={-0.14} rotateSpeed={-0.25}>
              <div data-cursor="COLORIZE">
                <TapeSticker
                  text="colorization_R_34PT"
                  subtext="2. Synthesizes Lab color"
                  icon={<Palette size={18} />}
                  color="#10B981"
                  rotate={-3}
                  tapeAngle={8}
                />
              </div>
            </ParallaxElement>

            {/* Sticker 3: Real-ESRGAN (speed = 0.26) */}
            <ParallaxElement speed={0.26} rotateSpeed={0.3}>
              <div data-cursor="SUPER-RES">
                <TapeSticker
                  text="Real-ESRGAN x4+"
                  subtext="3. Super-resolution 4x"
                  icon={<Wand2 size={18} />}
                  color="#0284C7"
                  rotate={5}
                  tapeAngle={-4}
                />
              </div>
            </ParallaxElement>
          </div>
        </div>
      </div>

      {/* Cloud Divider at the Bottom with subtle parallax */}
      <ParallaxElement speed={-0.06} style={{ position: 'relative', zIndex: 10, marginTop: '-20px' }}>
        <CloudDivider fillColor="#FAF6EF" />
      </ParallaxElement>
    </div>
  );
}
