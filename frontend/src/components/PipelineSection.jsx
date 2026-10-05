import React from 'react';
import { ArrowRight, ShieldCheck, Palette, Wand2, CheckCircle2, AlertCircle } from 'lucide-react';
import ParallaxElement from './ParallaxElement';
import ScrollReveal from './ScrollReveal';

export default function PipelineSection({ onTryPipeline }) {
  return (
    <section id="pipeline" className="content-section" style={{ borderTop: '2px solid rgba(30,8,15,0.08)' }}>
      <ScrollReveal direction="up" delay={0.05}>
        <div style={{ textAlign: 'center', marginBottom: '40px' }}>
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            padding: '6px 16px',
            borderRadius: '9999px',
            background: 'var(--cherry-blush)',
            border: '2px solid var(--cherry-dark)',
            fontFamily: 'var(--font-heading)',
            fontWeight: 700,
            fontSize: '0.86rem',
            color: 'var(--cherry-burgundy)',
            marginBottom: '12px'
          }}>
            <span>Strict Execution Hierarchy</span>
          </div>

          <h2 style={{
            fontFamily: 'var(--font-heading)',
            fontSize: 'clamp(2.2rem, 4vw, 3rem)',
            fontWeight: 700,
            color: 'var(--text-dark)',
            marginBottom: '12px'
          }}>
            Why The 1 ➔ 2 ➔ 3 Order Matters
          </h2>
          <p style={{ color: 'var(--text-medium)', maxWidth: '640px', margin: '0 auto', fontSize: '1rem', lineHeight: 1.5 }}>
            You can run any model individually for targeted tasks, or chain all three together in the optimal neural order:
          </p>
        </div>
      </ScrollReveal>

      {/* Sequential Steps Bento Grid with Multi-Speed Parallax */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
        gap: '24px',
        maxWidth: '1160px',
        margin: '0 auto'
      }}>
        {/* Step 1: Speed = -0.12 */}
        <ParallaxElement speed={-0.12}>
          <div className="pomegranate-card" style={{ borderTop: '8px solid #2563EB' }} data-cursor="STEP 1">
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
              <span style={{
                width: '38px',
                height: '38px',
                borderRadius: '50%',
                background: '#2563EB',
                color: '#FFF',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontFamily: 'var(--font-heading)',
                fontWeight: 800,
                fontSize: '1.1rem'
              }}>
                1
              </span>
              <span style={{ fontSize: '0.74rem', fontWeight: 800, background: '#EFF6FF', color: '#1E40AF', padding: '4px 10px', borderRadius: '9999px', border: '1.5px solid #2563EB' }}>
                First: Surface Healing
              </span>
            </div>

            <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.25rem', fontWeight: 700, color: 'var(--text-dark)', marginBottom: '8px' }}>
              1. Restoration R-34
            </h3>
            <div style={{ fontSize: '0.78rem', color: '#2563EB', fontWeight: 700, marginBottom: '12px', fontFamily: 'var(--font-mono)' }}>
              restoration_R_34PT (Custom Trained)
            </div>
            <p style={{ fontSize: '0.88rem', color: 'var(--text-medium)', lineHeight: 1.5 }}>
              Scratches, dust, and physical decay are repaired first. If you don't heal the image first, the colorization model will mistake crack lines for object borders and create color artifacts!
            </p>
          </div>
        </ParallaxElement>

        {/* Step 2: Speed = 0.16 */}
        <ParallaxElement speed={0.16}>
          <div className="pomegranate-card" style={{ borderTop: '8px solid #0284C7' }} data-cursor="STEP 2">
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
              <span style={{
                width: '38px',
                height: '38px',
                borderRadius: '50%',
                background: '#0284C7',
                color: '#FFF',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontFamily: 'var(--font-heading)',
                fontWeight: 800,
                fontSize: '1.1rem'
              }}>
                2
              </span>
              <span style={{ fontSize: '0.74rem', fontWeight: 800, background: '#F0F9FF', color: '#075985', padding: '4px 10px', borderRadius: '9999px', border: '1.5px solid #0284C7' }}>
                Second: Structural Super-Res
              </span>
            </div>

            <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.25rem', fontWeight: 700, color: 'var(--text-dark)', marginBottom: '8px' }}>
              2. Enhancement x4+
            </h3>
            <div style={{ fontSize: '0.78rem', color: '#0284C7', fontWeight: 700, marginBottom: '12px', fontFamily: 'var(--font-mono)' }}>
              RealESRGAN_x4plus (Pre-Trained SOTA)
            </div>
            <p style={{ fontSize: '0.88rem', color: 'var(--text-medium)', lineHeight: 1.5 }}>
              Real-ESRGAN receives the clean, restored photo and super-resolves it, reconstructing sharp edges, facial micro-textures, hair strands, and textiles without altering or distorting any chromatic values.
            </p>
          </div>
        </ParallaxElement>

        {/* Step 3: Speed = -0.08 */}
        <ParallaxElement speed={-0.08}>
          <div className="pomegranate-card" style={{ borderTop: '8px solid #10B981' }} data-cursor="STEP 3">
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
              <span style={{
                width: '38px',
                height: '38px',
                borderRadius: '50%',
                background: '#10B981',
                color: '#FFF',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontFamily: 'var(--font-heading)',
                fontWeight: 800,
                fontSize: '1.1rem'
              }}>
                3
              </span>
              <span style={{ fontSize: '0.74rem', fontWeight: 800, background: '#ECFDF5', color: '#065F46', padding: '4px 10px', borderRadius: '9999px', border: '1.5px solid #10B981' }}>
                Third: Chroma Prediction
              </span>
            </div>

            <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.25rem', fontWeight: 700, color: 'var(--text-dark)', marginBottom: '8px' }}>
              3. Colorization R-34
            </h3>
            <div style={{ fontSize: '0.78rem', color: '#059669', fontWeight: 700, marginBottom: '12px', fontFamily: 'var(--font-mono)' }}>
              colorization_R_34PT (Custom Trained)
            </div>
            <p style={{ fontSize: '0.88rem', color: 'var(--text-medium)', lineHeight: 1.5 }}>
              Finally, on top of the clean, enhanced structure, the colorization neural network predicts the CIE Lab a*b* chroma channels. Guided filtering locks colors to sharp high-res luminance edges with zero color bleeding or yellow tint!
            </p>
          </div>
        </ParallaxElement>
      </div>
    </section>
  );
}
