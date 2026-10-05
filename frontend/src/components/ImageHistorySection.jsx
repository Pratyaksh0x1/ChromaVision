import React, { useState } from 'react';
import { 
  History, 
  Trash2, 
  Download, 
  Eye, 
  Sparkles, 
  Clock, 
  Layers, 
  ShieldCheck, 
  Maximize2, 
  Palette, 
  ArrowUpRight,
  FolderOpen,
  Image as ImageIcon,
  Check
} from 'lucide-react';
import confetti from 'canvas-confetti';
import ParallaxElement from './ParallaxElement';

export default function ImageHistorySection({
  history = [],
  onSelectHistoryItem,
  onClearHistory,
  onDeleteHistoryItem,
  onOpenUpload
}) {
  const [filter, setFilter] = useState('all'); // 'all', 'colorized', 'restored', 'enhanced'

  const filteredItems = history.filter(item => {
    if (filter === 'all') return true;
    if (filter === 'colorized') return item.executedStages?.includes('Colorization');
    if (filter === 'restored') return item.executedStages?.includes('Restoration');
    if (filter === 'enhanced') return item.executedStages?.includes('Enhancement');
    return true;
  });

  const handleDownload = (imgUrl, name) => {
    const a = document.createElement('a');
    a.href = imgUrl;
    a.download = `${name.replace(/\.[^/.]+$/, "")}_chromavision_history.png`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);

    confetti({
      particleCount: 70,
      spread: 60,
      origin: { y: 0.8 },
      colors: ['#E84855', '#10B981', '#2563EB', '#FFD166']
    });
  };

  return (
    <section id="history" className="content-section" style={{ paddingTop: '20px', paddingBottom: '60px' }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 24px' }}>
        
        {/* Section Header */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '16px',
          marginBottom: '28px',
          paddingBottom: '16px',
          borderBottom: '2.5px solid var(--cherry-dark)'
        }}>
          <div>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', background: 'var(--cherry-hero)', color: '#FFF', padding: '4px 14px', borderRadius: '9999px', fontSize: '0.78rem', fontWeight: 800, textTransform: 'uppercase', marginBottom: '8px' }}>
              <History size={14} />
              <span>Session Archives</span>
            </div>
            <h2 style={{
              fontFamily: 'var(--font-heading)',
              fontSize: 'clamp(1.6rem, 3vw, 2.2rem)',
              fontWeight: 800,
              color: 'var(--cherry-dark)',
              lineHeight: 1.15
            }}>
              Neural Restoration History
            </h2>
            <p style={{ fontSize: '0.9rem', color: 'var(--text-medium)', marginTop: '4px' }}>
              Every photo processed in your current session is cataloged below with full stage breakdown & instant re-load.
            </p>
          </div>

          {/* Action Bar */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
            {history.length > 0 && (
              <button
                onClick={onClearHistory}
                style={{
                  padding: '8px 16px',
                  borderRadius: '9999px',
                  border: '2px solid rgba(220, 38, 38, 0.4)',
                  background: '#FFF',
                  color: '#DC2626',
                  fontFamily: 'var(--font-heading)',
                  fontSize: '0.8rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  transition: 'all 0.15s'
                }}
              >
                <Trash2 size={14} />
                <span>Clear History ({history.length})</span>
              </button>
            )}

            <button
              onClick={onOpenUpload}
              className="btn-pomegranate-cherry"
              style={{ padding: '8px 18px', fontSize: '0.82rem', borderRadius: '9999px' }}
            >
              <FolderOpen size={15} />
              <span>Process New Photo</span>
            </button>
          </div>
        </div>

        {/* Filter Pills */}
        {history.length > 0 && (
          <div style={{ display: 'flex', gap: '8px', marginBottom: '22px', flexWrap: 'wrap' }}>
            {[
              { id: 'all', label: `All Processed (${history.length})` },
              { id: 'restored', label: 'Restoration Passes' },
              { id: 'enhanced', label: 'Super-Resolved' },
              { id: 'colorized', label: 'Colorized Passes' }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setFilter(tab.id)}
                style={{
                  padding: '6px 16px',
                  borderRadius: '9999px',
                  border: filter === tab.id ? '2px solid var(--cherry-dark)' : '1.5px solid rgba(30,8,15,0.15)',
                  background: filter === tab.id ? 'var(--cherry-dark)' : '#FFF',
                  color: filter === tab.id ? '#FFF' : 'var(--cherry-dark)',
                  fontFamily: 'var(--font-heading)',
                  fontWeight: 700,
                  fontSize: '0.78rem',
                  cursor: 'pointer',
                  transition: 'all 0.15s'
                }}
              >
                {tab.label}
              </button>
            ))}
          </div>
        )}

        {/* History Cards Grid */}
        {filteredItems.length > 0 ? (
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
            gap: '22px'
          }}>
            {filteredItems.map((item) => (
              <div
                key={item.id}
                style={{
                  background: '#FFF',
                  border: '2.5px solid var(--cherry-dark)',
                  borderRadius: '18px',
                  boxShadow: '0 6px 0 var(--cherry-dark)',
                  overflow: 'hidden',
                  display: 'flex',
                  flexDirection: 'column',
                  transition: 'transform 0.15s, box-shadow 0.15s'
                }}
              >
                {/* Image Comparison Thumbnail */}
                <div 
                  onClick={() => onSelectHistoryItem(item)}
                  style={{
                    position: 'relative',
                    height: '210px',
                    background: '#140F11',
                    cursor: 'pointer',
                    overflow: 'hidden',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                  title="Click to reload this item into the interactive studio"
                >
                  <img
                    src={item.finalImage}
                    alt={item.name}
                    style={{ width: '100%', height: '100%', objectFit: 'contain' }}
                  />

                  {/* Top Badge: Date / Time */}
                  <div style={{
                    position: 'absolute',
                    top: '10px',
                    left: '10px',
                    background: 'rgba(30, 8, 15, 0.85)',
                    color: '#FFF',
                    padding: '3px 8px',
                    borderRadius: '6px',
                    fontSize: '0.68rem',
                    fontWeight: 700,
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                    backdropFilter: 'blur(4px)'
                  }}>
                    <Clock size={11} />
                    <span>{item.timestamp}</span>
                  </div>

                  {/* Dimensions badge */}
                  {item.processedDimensions && (
                    <div style={{
                      position: 'absolute',
                      top: '10px',
                      right: '10px',
                      background: 'rgba(30, 8, 15, 0.85)',
                      color: 'var(--accent-yellow)',
                      padding: '3px 8px',
                      borderRadius: '6px',
                      fontSize: '0.68rem',
                      fontWeight: 800,
                      fontFamily: 'var(--font-mono)'
                    }}>
                      {item.processedDimensions.width}×{item.processedDimensions.height}
                    </div>
                  )}

                  {/* Hover Overlay Prompt */}
                  <div style={{
                    position: 'absolute',
                    inset: 0,
                    background: 'rgba(232, 72, 85, 0.75)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px',
                    color: '#FFF',
                    fontWeight: 800,
                    fontSize: '0.9rem',
                    opacity: 0,
                    transition: 'opacity 0.2s',
                    backdropFilter: 'blur(2px)'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.opacity = '1'}
                  onMouseLeave={(e) => e.currentTarget.style.opacity = '0'}
                  >
                    <Eye size={18} />
                    <span>Open in Studio Slider</span>
                  </div>
                </div>

                {/* Card Info Body */}
                <div style={{ padding: '16px', flex: 1, display: 'flex', flexDirection: 'column' }}>
                  <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '8px', marginBottom: '8px' }}>
                    <h4 style={{
                      fontFamily: 'var(--font-heading)',
                      fontWeight: 700,
                      fontSize: '0.98rem',
                      color: 'var(--cherry-dark)',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                      maxWidth: '220px'
                    }}>
                      {item.name}
                    </h4>
                    <button
                      onClick={() => onDeleteHistoryItem(item.id)}
                      style={{
                        background: 'none',
                        border: 'none',
                        color: '#9CA3AF',
                        cursor: 'pointer',
                        padding: '2px',
                        transition: 'color 0.15s'
                      }}
                      onMouseEnter={(e) => e.currentTarget.style.color = '#DC2626'}
                      onMouseLeave={(e) => e.currentTarget.style.color = '#9CA3AF'}
                      title="Delete this history item"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>

                  {/* Stage Badges */}
                  <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginBottom: '14px' }}>
                    {item.executedStages?.map((stage, idx) => (
                      <span
                        key={idx}
                        style={{
                          fontSize: '0.7rem',
                          fontWeight: 800,
                          padding: '3px 8px',
                          borderRadius: '9999px',
                          border: '1px solid var(--cherry-dark)',
                          background: stage === 'Restoration' ? '#EFF6FF' : (stage === 'Enhancement' ? '#F0FDF4' : '#FFF7ED'),
                          color: stage === 'Restoration' ? '#1D4ED8' : (stage === 'Enhancement' ? '#15803D' : '#C2410C')
                        }}
                      >
                        {stage}
                      </span>
                    ))}
                    {item.temperature && item.executedStages?.includes('Colorization') && (
                      <span style={{ fontSize: '0.7rem', fontWeight: 800, padding: '3px 8px', borderRadius: '9999px', background: '#FEF3C7', color: '#B45309', border: '1px solid var(--cherry-dark)' }}>
                        T = {item.temperature}
                      </span>
                    )}
                  </div>

                  {/* Actions Footer */}
                  <div style={{ marginTop: 'auto', display: 'flex', gap: '8px', paddingTop: '12px', borderTop: '1px solid rgba(0,0,0,0.08)' }}>
                    <button
                      onClick={() => onSelectHistoryItem(item)}
                      className="btn-pomegranate-cream"
                      style={{ flex: 1, padding: '8px 12px', fontSize: '0.78rem', justifyContent: 'center' }}
                    >
                      <Eye size={14} />
                      <span>Inspect Slider</span>
                    </button>

                    <button
                      onClick={() => handleDownload(item.finalImage, item.name)}
                      className="btn-pomegranate-cherry"
                      style={{ padding: '8px 14px', fontSize: '0.78rem' }}
                      title="Download PNG"
                    >
                      <Download size={14} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          /* Empty History State */
          <div style={{
            background: '#FFF',
            border: '2.5px dashed var(--cherry-dark)',
            borderRadius: '24px',
            padding: '48px 24px',
            textAlign: 'center',
            maxWidth: '640px',
            margin: '0 auto'
          }}>
            <div style={{
              width: '64px',
              height: '64px',
              borderRadius: '50%',
              background: 'var(--cherry-blush)',
              color: 'var(--cherry-hero)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 16px'
            }}>
              <ImageIcon size={30} />
            </div>
            <h3 style={{ fontFamily: 'var(--font-heading)', fontWeight: 800, fontSize: '1.2rem', color: 'var(--cherry-dark)', marginBottom: '8px' }}>
              No Processed Photos in History Yet
            </h3>
            <p style={{ fontSize: '0.88rem', color: 'var(--text-medium)', marginBottom: '22px', maxWidth: '420px', margin: '0 auto 22px' }}>
              Run any photo through the Restoration, Enhancement, or Colorization neural pipeline above. Your processed results will automatically be cataloged here!
            </p>
            <button
              onClick={onOpenUpload}
              className="btn-pomegranate-cherry"
              style={{ padding: '10px 24px', fontSize: '0.88rem', borderRadius: '9999px' }}
            >
              <Sparkles size={16} />
              <span>Go to Studio & Process First Photo</span>
            </button>
          </div>
        )}
      </div>
    </section>
  );
}
