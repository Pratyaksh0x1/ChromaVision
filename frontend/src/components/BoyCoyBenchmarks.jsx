import React from 'react';
import { Award, ShieldCheck, Palette, Wand2, TrendingUp, Cpu } from 'lucide-react';
import ParallaxElement from './ParallaxElement';
import ScrollReveal from './ScrollReveal';

export default function BoyCoyBenchmarks({ apiStatus }) {
  const metrics = apiStatus?.benchmarks || {
    restoration: {
      light: { psnr_input: 23.456, psnr_output: 27.079, ssim_input: 0.679, ssim_output: 0.855 },
      heavy: { psnr_input: 19.683, psnr_output: 24.165, ssim_input: 0.535, ssim_output: 0.795 }
    },
    colorization: {
      "FINAL T=1.0": { psnr: 22.496, ssim: 0.92, colorfulness_ratio: 0.922 }
    }
  };

  return (
    <section id="benchmarks" className="content-section" style={{ borderTop: '2px solid rgba(30,8,15,0.08)' }}>
      <ScrollReveal direction="up" delay={0.05}>
        <div style={{ textAlign: 'center', marginBottom: '40px' }}>
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            padding: '6px 16px',
            borderRadius: '9999px',
            background: '#FEF3C7',
            border: '2px solid #1E080F',
            fontFamily: 'var(--font-heading)',
            fontWeight: 700,
            fontSize: '0.86rem',
            color: '#92400E',
            marginBottom: '12px'
          }}>
            <span>★ Empirical Training Benchmarks</span>
          </div>

          <h2 style={{
            fontFamily: 'var(--font-heading)',
            fontSize: 'clamp(2.2rem, 4vw, 3rem)',
            fontWeight: 700,
            color: 'var(--text-dark)',
            marginBottom: '12px'
          }}>
            Measured Gains on Test Datasets
          </h2>
          <p style={{ color: 'var(--text-medium)', maxWidth: '640px', margin: '0 auto', fontSize: '1rem', lineHeight: 1.5 }}>
            Real quantitative performance recorded across test validation splits during model training:
          </p>
        </div>
      </ScrollReveal>

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
        gap: '24px',
        maxWidth: '1200px',
        margin: '0 auto'
      }}>
        {/* Restoration Card - Speed = 0.1 */}
        <ParallaxElement speed={0.1}>
          <div className="pomegranate-card" style={{ background: '#FFF' }} data-cursor="PSNR">
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
              <div style={{ width: '42px', height: '42px', borderRadius: '50%', background: '#2563EB', color: '#FFF', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <ShieldCheck size={22} />
              </div>
              <div>
                <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.2rem', fontWeight: 700, color: 'var(--text-dark)' }}>
                  restoration_R_34PT
                </h3>
                <div style={{ fontSize: '0.76rem', color: '#6B7280', fontWeight: 600 }}>
                  ResNet-34 Encoder-Decoder
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div style={{ background: '#F8FAFC', border: '1.5px solid #1E080F', borderRadius: '14px', padding: '12px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 700, fontSize: '0.86rem', color: '#1E080F', marginBottom: '4px' }}>
                  <span>Heavy Scratch Degradation</span>
                  <span style={{ color: '#16A34A' }}>+4.48 dB Gain</span>
                </div>
                <div style={{ fontSize: '0.78rem', color: '#64748B' }}>
                  PSNR: 19.68 ➔ 24.16 dB • SSIM: 53.5% ➔ 79.5%
                </div>
              </div>

              <div style={{ background: '#F8FAFC', border: '1.5px solid #1E080F', borderRadius: '14px', padding: '12px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 700, fontSize: '0.86rem', color: '#1E080F', marginBottom: '4px' }}>
                  <span>Light Damage & Dust</span>
                  <span style={{ color: '#16A34A' }}>+3.62 dB Gain</span>
                </div>
                <div style={{ fontSize: '0.78rem', color: '#64748B' }}>
                  PSNR: 23.45 ➔ 27.08 dB • SSIM: 67.9% ➔ 85.5%
                </div>
              </div>
            </div>
          </div>
        </ParallaxElement>

        {/* Colorization Card - Speed = -0.12 */}
        <ParallaxElement speed={-0.12}>
          <div className="pomegranate-card" style={{ background: '#FFF' }} data-cursor="CHROMA">
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
              <div style={{ width: '42px', height: '42px', borderRadius: '50%', background: '#10B981', color: '#FFF', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Palette size={22} />
              </div>
              <div>
                <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.2rem', fontWeight: 700, color: 'var(--text-dark)' }}>
                  colorization_R_34PT
                </h3>
                <div style={{ fontSize: '0.76rem', color: '#6B7280', fontWeight: 600 }}>
                  ResNet-34 + Global Scene Prior
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div style={{ background: '#F8FAFC', border: '1.5px solid #1E080F', borderRadius: '14px', padding: '12px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 700, fontSize: '0.86rem', color: '#1E080F', marginBottom: '4px' }}>
                  <span>Colorfulness Ratio</span>
                  <span style={{ color: '#F59E0B' }}>0.922 / 1.0</span>
                </div>
                <div style={{ fontSize: '0.78rem', color: '#64748B' }}>
                  Recovers 92.2% of real-world chromatic richness compared to native camera sensors.
                </div>
              </div>

              <div style={{ background: '#F8FAFC', border: '1.5px solid #1E080F', borderRadius: '14px', padding: '12px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 700, fontSize: '0.86rem', color: '#1E080F', marginBottom: '4px' }}>
                  <span>Structural SSIM</span>
                  <span style={{ color: '#2563EB' }}>0.920 SSIM</span>
                </div>
                <div style={{ fontSize: '0.78rem', color: '#64748B' }}>
                  Zero color spilling over sharp edges or clothing silhouettes.
                </div>
              </div>
            </div>
          </div>
        </ParallaxElement>

        {/* Real-ESRGAN Card - Speed = 0.14 */}
        <ParallaxElement speed={0.14}>
          <div className="pomegranate-card" style={{ background: '#FFF' }} data-cursor="SCALE">
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
              <div style={{ width: '42px', height: '42px', borderRadius: '50%', background: '#0284C7', color: '#FFF', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Wand2 size={22} />
              </div>
              <div>
                <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.2rem', fontWeight: 700, color: 'var(--text-dark)' }}>
                  Real-ESRGAN x4plus
                </h3>
                <div style={{ fontSize: '0.76rem', color: '#6B7280', fontWeight: 600 }}>
                  Deep RRDBNet Super-Resolution
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div style={{ background: '#F8FAFC', border: '1.5px solid #1E080F', borderRadius: '14px', padding: '12px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 700, fontSize: '0.86rem', color: '#1E080F', marginBottom: '4px' }}>
                  <span>Super-Resolution Scale</span>
                  <span style={{ color: '#0284C7' }}>4x Resolution</span>
                </div>
                <div style={{ fontSize: '0.78rem', color: '#64748B' }}>
                  Sharpens facial micro-textures, hair strands, and textiles without halo ringing.
                </div>
              </div>

              <div style={{ background: '#F8FAFC', border: '1.5px solid #1E080F', borderRadius: '14px', padding: '12px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 700, fontSize: '0.86rem', color: '#1E080F', marginBottom: '4px' }}>
                  <span>Memory Tiling</span>
                  <span style={{ color: '#16A34A' }}>Bounded Memory</span>
                </div>
                <div style={{ fontSize: '0.78rem', color: '#64748B' }}>
                  Tiled overlapping inference guarantees seamless high-res scaling without GPU OOM.
                </div>
              </div>
            </div>
          </div>
        </ParallaxElement>
      </div>
    </section>
  );
}
