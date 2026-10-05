import React from 'react';
import { ArrowUp, Heart, Sparkles } from 'lucide-react';
import ScrollReveal from './ScrollReveal';

export default function BoyCoyFooter({ scrollToSection }) {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer style={{
      background: '#1E080F',
      color: '#FFFFFF',
      padding: '60px 24px 36px',
      position: 'relative',
      overflow: 'hidden'
    }}>
      {/* Decorative Top Mountain Silhouette (from Boy-Coy Screenshot 2) */}
      <div style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        height: '14px',
        background: 'repeating-linear-gradient(45deg, #1E080F, #1E080F 12px, #2E0E18 12px, #2E0E18 24px)'
      }} />

      <ScrollReveal direction="up" delay={0.1}>
        <div style={{
          maxWidth: '1280px',
          margin: '0 auto',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '24px'
        }}>
          {/* Brand */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }} data-cursor="CHROMA">
            <div style={{
              width: '42px',
              height: '42px',
              borderRadius: '50%',
              background: 'var(--cherry-hero)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 4px 10px rgba(0,0,0,0.3)'
            }}>
              <Sparkles size={20} color="#FFFFFF" />
            </div>
            <div>
              <div style={{ fontFamily: 'var(--font-heading)', fontSize: '1.4rem', fontWeight: 800 }}>
                Chroma Vision<span style={{ color: '#FFD166' }}>.</span>
              </div>
              <div style={{ fontSize: '0.78rem', color: '#FDA4AF' }}>
                Creative Neural Restoration Studio • Models: restoration_R_34PT, colorization_R_34PT & Real-ESRGAN x4+
              </div>
            </div>
          </div>

          {/* Links */}
          <div style={{ display: 'flex', gap: '20px', fontFamily: 'var(--font-heading)', fontWeight: 700, fontSize: '0.88rem', flexWrap: 'wrap' }}>
            <span style={{ cursor: 'pointer', color: '#FFF' }} onClick={() => scrollToSection('studio')} data-cursor="STUDIO">STUDIO</span>
            <span style={{ cursor: 'pointer', color: '#FFF' }} onClick={() => scrollToSection('history')} data-cursor="HISTORY">HISTORY</span>
            <span style={{ cursor: 'pointer', color: '#FFF' }} onClick={() => scrollToSection('models')} data-cursor="MODELS">MODELS</span>
            <span style={{ cursor: 'pointer', color: '#FFF' }} onClick={() => scrollToSection('pipeline')} data-cursor="PIPELINE">PIPELINE</span>
            <span style={{ cursor: 'pointer', color: '#FFF' }} onClick={() => scrollToSection('benchmarks')} data-cursor="BENCHMARKS">BENCHMARKS</span>
          </div>

          {/* Back to top */}
          <button
            onClick={scrollToTop}
            className="btn-pomegranate-cream"
            style={{ padding: '8px 18px', fontSize: '0.78rem', background: '#FFF' }}
            data-cursor="TOP ↑"
          >
            <ArrowUp size={14} />
            <span>Back to Top</span>
          </button>
        </div>

        <div style={{
          maxWidth: '1280px',
          margin: '30px auto 0',
          paddingTop: '20px',
          borderTop: '1px solid rgba(255,255,255,0.1)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '12px',
          fontSize: '0.78rem',
          color: '#9CA3AF'
        }}>
          <div>
            © 2026 Chroma Vision. Built with PyTorch and React.
          </div>
          <div>
            Presets are served locally by the React app.
          </div>
        </div>
      </ScrollReveal>
    </footer>
  );
}
