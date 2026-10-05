import React, { useState, useRef, useEffect } from 'react';
import { 
  UploadCloud, 
  Sparkles, 
  Play, 
  RotateCcw, 
  Check, 
  ShieldCheck, 
  Palette, 
  Wand2, 
  Download, 
  Copy, 
  ZoomIn, 
  SplitSquareVertical, 
  Layers, 
  Sliders, 
  Star,
  Quote,
  Eye,
  SlidersHorizontal,
  Flame,
  Leaf,
  Maximize2,
  AlertTriangle,
  History,
  Image as ImageIcon,
  FolderOpen
} from 'lucide-react';
import BalloonsSuspension from './reactbits/BalloonsSuspension';
import StarburstBadge from './reactbits/StarburstBadge';
import SlantedRibbon from './reactbits/SlantedRibbon';
import MagneticButton from './reactbits/MagneticButton';
import confetti from 'canvas-confetti';
import ParallaxElement from './ParallaxElement';
import ScrollReveal from './ScrollReveal';

export default function BoyCoyStudio({
  currentImage,
  setCurrentImage,
  processedResult,
  setProcessedResult,
  runRestoration,
  setRunRestoration,
  runColorization,
  setRunColorization,
  runEnhancement,
  setRunEnhancement,
  isProcessing,
  setIsProcessing,
  onProcessComplete,
  historyCount = 0,
  scrollToSection
}) {
  const [sliderPos, setSliderPos] = useState(50);
  const [isDragging, setIsDragging] = useState(false);
  const [viewMode, setViewMode] = useState('split'); // 'split', 'steps'
  const [activeStepIndex, setActiveStepIndex] = useState(0);
  const [errorMessage, setErrorMessage] = useState(null);
  const [isDragOver, setIsDragOver] = useState(false);
  
  // Model fine-tuning parameters:
  const [colorStyle, setColorStyle] = useState('vivid'); // 'vivid', 'natural', 'custom'
  const [temperature, setTemperature] = useState(0.45);
  const [outScale, setOutScale] = useState(1.0);
  const [strength, setStrength] = useState(1.0);
  const [progressStage, setProgressStage] = useState('');
  const [progressPercent, setProgressPercent] = useState(0);

  const fileInputRef = useRef(null);
  const monitorFileInputRef = useRef(null);
  const sliderContainerRef = useRef(null);

  // Preset images served from frontend/public/presets.
  const userPresets = [
    {
      id: 'preset-evgeni',
      title: 'Archival Heritage Lake',
      filename: 'evgeni-tcherkasski-hoKgCD9kfTE-unsplash.jpg',
      url: '/presets/evgeni-tcherkasski-hoKgCD9kfTE-unsplash.jpg',
      description: 'Historic boat resting on calm lake with soft mountains and sky',
      recommended: { restore: true, colorize: true, enhance: false }
    },
    {
      id: 'preset-lisa',
      title: 'Vintage Character Portrait',
      filename: 'lisa-MGDIKg9Bw5U-unsplash.jpg',
      url: '/presets/lisa-MGDIKg9Bw5U-unsplash.jpg',
      description: 'Expressive vintage portrait with fine facial features and hair',
      recommended: { restore: true, colorize: true, enhance: false }
    }
  ];

  const [selectedPresetId, setSelectedPresetId] = useState('preset-evgeni');

  // Load default preset on initial mount if currentImage is empty
  useEffect(() => {
    if (!currentImage) {
      loadPreset('preset-evgeni');
    }
  }, []);

  // Global Clipboard Paste Listener
  useEffect(() => {
    const handlePaste = (e) => {
      const items = e.clipboardData?.items;
      if (!items) return;
      for (let i = 0; i < items.length; i++) {
        if (items[i].type.indexOf('image') !== -1) {
          const file = items[i].getAsFile();
          if (file) {
            handleCustomUpload(file);
            break;
          }
        }
      }
    };

    window.addEventListener('paste', handlePaste);
    return () => window.removeEventListener('paste', handlePaste);
  }, []);

  const loadPreset = (presetId) => {
    setSelectedPresetId(presetId);
    setErrorMessage(null);
    const p = userPresets.find(x => x.id === presetId);
    if (!p) return;

    setCurrentImage({
      url: p.url,
      file: null,
      name: p.filename,
      presetId: presetId,
      isPreset: true
    });
    setRunRestoration(p.recommended.restore);
    setRunColorization(p.recommended.colorize);
    setRunEnhancement(p.recommended.enhance);
    setProcessedResult(null);
  };

  const handleCustomUpload = (file) => {
    if (!file || !file.type.startsWith('image/')) {
      setErrorMessage("Please upload a valid image file (JPEG, PNG, WebP, etc.).");
      return;
    }
    setSelectedPresetId(null);
    setErrorMessage(null);
    const reader = new FileReader();
    reader.onload = (e) => {
      setCurrentImage({
        url: e.target.result,
        file: file,
        name: file.name,
        isPreset: false
      });
      setProcessedResult(null);
    };
    reader.readAsDataURL(file);
  };

  // Pipeline Execution (Strict order: 1. Restoration -> 2. Enhancement -> 3. Colorization)
  const handleExecute = async (mode = 'pipeline') => {
    if (!currentImage) {
      setErrorMessage("Please select a preset or upload a custom image first.");
      return;
    }

    let doRestore = runRestoration;
    let doEnhance = runEnhancement;
    let doColorize = runColorization;

    if (mode === 'restore-only') {
      doRestore = true; doEnhance = false; doColorize = false;
      setRunRestoration(true); setRunEnhancement(false); setRunColorization(false);
    } else if (mode === 'enhance-only') {
      doRestore = false; doEnhance = true; doColorize = false;
      setRunRestoration(false); setRunEnhancement(true); setRunColorization(false);
    } else if (mode === 'colorize-only') {
      doRestore = false; doEnhance = false; doColorize = true;
      setRunRestoration(false); setRunEnhancement(false); setRunColorization(true);
    }

    if (!doRestore && !doColorize && !doEnhance) {
      alert("Please toggle at least one model (Restoration, Enhancement, or Colorization)!");
      return;
    }

    setIsProcessing(true);
    setErrorMessage(null);
    setProgressPercent(0);
    setProgressStage("Preparing image for neural models...");

    try {
      let fileToSend = currentImage.file;
      if (!fileToSend && currentImage.url) {
        // Fetch preset blob to send as standard multipart file
        const r = await fetch(currentImage.url);
        if (!r.ok) throw new Error("Could not load preset image file.");
        const b = await r.blob();
        fileToSend = new File([b], currentImage.name || "input.jpg", { type: "image/jpeg" });
      }

      if (!fileToSend) {
        throw new Error("No image file available to send to model.");
      }

      const fd = new FormData();
      const processingId = globalThis.crypto?.randomUUID?.()
        || `${Date.now()}-${Math.random().toString(16).slice(2)}`;
      fd.append("processing_id", processingId);
      fd.append("file", fileToSend);
      fd.append("run_restoration", doRestore);
      fd.append("run_enhancement", doEnhance);
      fd.append("run_colorization", doColorize);
      fd.append("color_style", colorStyle);
      const chosenT = colorStyle === 'vivid' ? 0.45 : (colorStyle === 'natural' ? 1.0 : temperature);
      fd.append("T", chosenT);
      fd.append("out_scale", outScale);
      fd.append("strength", strength);
      fd.append("max_side", 1024);

      const selectedStages = [
        doRestore && "Restoration",
        doEnhance && "Enhancement",
        doColorize && "Colorization"
      ].filter(Boolean);
      setProgressStage(`Starting ${selectedStages.join(" → ")}.`);

      const controller = new AbortController();
      const requestTimeout = window.setTimeout(() => controller.abort(), 15 * 60 * 1000);
      let res;
      try {
        const processRequest = fetch("/api/process", {
          method: "POST",
          body: fd,
          signal: controller.signal
        });
        while (true) {
          const outcome = await Promise.race([
            processRequest.then(response => ({ type: "response", response })),
            new Promise(resolve => window.setTimeout(() => resolve({ type: "progress" }), 900))
          ]);
          if (outcome.type === "response") {
            res = outcome.response;
            break;
          }

          try {
            const progressRes = await fetch(`/api/process-progress/${encodeURIComponent(processingId)}`);
            if (progressRes.ok) {
              const progress = await progressRes.json();
              if (Number.isFinite(progress.progress)) setProgressPercent(progress.progress);
              if (progress.stage) setProgressStage(progress.stage);
            }
          } catch (progressErr) {
            console.warn("Could not retrieve live processing progress:", progressErr);
          }
        }
      } finally {
        window.clearTimeout(requestTimeout);
      }

      if (!res.ok) {
        let errDetail = `Server returned status ${res.status}`;
        try {
          const errJson = await res.json();
          if (errJson.detail) errDetail = errJson.detail;
        } catch (_) {}
        throw new Error(errDetail);
      }
      const data = await res.json();
      setProgressPercent(100);
      setProgressStage("Model inference complete!");
      setProcessedResult(data);
      setActiveStepIndex(data.steps.length - 1);

      // Record in Session History
      if (onProcessComplete) {
        onProcessComplete(data, currentImage, {
          temperature: chosenT,
          outScale: outScale
        });
      }

    } catch (apiErr) {
      console.error("Neural model execution error:", apiErr);
      setProgressStage("Processing failed.");
      setErrorMessage(`Model execution failed: ${apiErr.message}. Make sure the FastAPI server (server.py) is running.`);
    } finally {
      setIsProcessing(false);
    }
  };

  // Slider drag controls
  const handleSliderMove = (e) => {
    if (!sliderContainerRef.current) return;
    const rect = sliderContainerRef.current.getBoundingClientRect();
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const x = Math.max(0, Math.min(clientX - rect.left, rect.width));
    setSliderPos(Math.round((x / rect.width) * 100));
  };

  const triggerDownload = (url, name) => {
    const a = document.createElement('a');
    a.href = url;
    a.download = `${name.replace(/\.[^/.]+$/, "")}_chromavision.png`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);

    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.75 },
      colors: ['#E84855', '#FFD166', '#10B981', '#2563EB']
    });
  };

  // Drag and Drop handlers for entire TV Monitor Area
  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleCustomUpload(e.dataTransfer.files[0]);
    }
  };

  return (
    <section id="studio" className="content-section" style={{ paddingTop: '10px' }}>
      {/* Central Floating TV Monitor Frame (Boy-Coy Screenshot 2) */}
      <div 
        className="tv-monitor-frame"
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        style={{
          boxShadow: isDragOver ? '0 0 0 4px var(--cherry-hero), 0 16px 36px rgba(232, 72, 85, 0.3)' : undefined,
          transition: 'box-shadow 0.2s'
        }}
      >
        {/* Floating Balloons Suspension with parallax offset */}
        <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', pointerEvents: 'none', zIndex: 12 }}>
          <ParallaxElement speed={-0.34} style={{ pointerEvents: 'none' }}>
            <BalloonsSuspension />
          </ParallaxElement>
        </div>

        {/* Starburst Ribbon Badge with subtle drift and rotation */}
        <div style={{ position: 'absolute', top: 0, right: 0, pointerEvents: 'none', zIndex: 25 }}>
          <ParallaxElement speed={0.22} rotateSpeed={0.3} style={{ pointerEvents: 'none' }}>
            <StarburstBadge text="User rating" stars="★★★★★" subtext="100% Neural" />
          </ParallaxElement>
        </div>

        {/* Hidden inputs for universal uploads */}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          style={{ display: 'none' }}
          onChange={(e) => {
            if (e.target.files?.[0]) handleCustomUpload(e.target.files[0]);
            e.target.value = '';
          }}
        />
        <input
          ref={monitorFileInputRef}
          type="file"
          accept="image/*"
          style={{ display: 'none' }}
          onChange={(e) => {
            if (e.target.files?.[0]) handleCustomUpload(e.target.files[0]);
            e.target.value = '';
          }}
        />

        {/* TV Screen Contents */}
        <div className="tv-monitor-screen">
          {/* Top Preset Bar — EXCLUSIVELY FROM USER PRESET FOLDER */}
          <div style={{
            background: 'var(--bg-card-muted)',
            border: '2px solid var(--cherry-dark)',
            borderRadius: '16px',
            padding: '14px 18px',
            marginBottom: '20px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '12px'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Sparkles size={18} color="var(--cherry-hero)" />
              <span style={{ fontFamily: 'var(--font-heading)', fontWeight: 700, fontSize: '0.98rem' }}>
                Preset Archives:
              </span>
            </div>

            {/* Presets Selection Buttons & Upload Trigger */}
            <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', alignItems: 'center' }}>
              {userPresets.map((p) => (
                <button
                  key={p.id}
                  onClick={() => loadPreset(p.id)}
                  style={{
                    padding: '6px 14px',
                    borderRadius: '9999px',
                    border: '2px solid var(--cherry-dark)',
                    background: selectedPresetId === p.id ? 'var(--cherry-burgundy)' : '#FFF',
                    color: selectedPresetId === p.id ? '#FFF' : 'var(--cherry-dark)',
                    fontFamily: 'var(--font-heading)',
                    fontSize: '0.82rem',
                    fontWeight: 700,
                    cursor: 'pointer',
                    boxShadow: selectedPresetId === p.id ? '0 3px 0 var(--cherry-dark)' : 'none',
                    transition: 'all 0.15s'
                  }}
                >
                  {p.title}
                </button>
              ))}

              <button
                onClick={() => fileInputRef.current && fileInputRef.current.click()}
                className="btn-pomegranate-cream"
                style={{
                  padding: '6px 14px',
                  fontSize: '0.82rem',
                  borderRadius: '9999px',
                  background: !selectedPresetId && currentImage && !currentImage.isPreset ? 'var(--cherry-hero)' : '#FFF',
                  color: !selectedPresetId && currentImage && !currentImage.isPreset ? '#FFF' : 'var(--cherry-dark)'
                }}
              >
                <UploadCloud size={15} />
                <span>Upload Custom Image</span>
              </button>

              {historyCount > 0 && scrollToSection && (
                <button
                  onClick={() => scrollToSection('history')}
                  style={{
                    padding: '6px 12px',
                    borderRadius: '9999px',
                    border: '1.5px dashed var(--cherry-dark)',
                    background: 'var(--cherry-blush)',
                    color: 'var(--cherry-dark)',
                    fontFamily: 'var(--font-heading)',
                    fontSize: '0.76rem',
                    fontWeight: 700,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px'
                  }}
                  title="View saved sessions in History section below"
                >
                  <History size={13} />
                  <span>History ({historyCount})</span>
                </button>
              )}
            </div>
          </div>

          {/* Model Selection Row (Stage 1, Stage 2, Stage 3) */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
            gap: '14px',
            marginBottom: '16px'
          }}>
            {/* Stage 1: Restoration */}
            <div 
              onClick={() => setRunRestoration(!runRestoration)}
              style={{
                background: runRestoration ? '#EFF6FF' : '#FFF',
                border: runRestoration ? '2.5px solid #2563EB' : '2px solid rgba(0,0,0,0.15)',
                boxShadow: runRestoration ? '0 4px 0 #2563EB' : 'none',
                borderRadius: '16px',
                padding: '14px',
                cursor: 'pointer',
                transition: 'all 0.2s',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{ width: '34px', height: '34px', borderRadius: '50%', background: '#2563EB', color: '#FFF', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800 }}>
                  1
                </div>
                <div>
                  <div style={{ fontFamily: 'var(--font-heading)', fontWeight: 700, fontSize: '0.92rem', color: '#1E080F' }}>
                    Restoration
                  </div>
                  <div style={{ fontSize: '0.72rem', color: '#4B5563' }}>
                    restoration_R_34PT
                  </div>
                </div>
              </div>
              <input type="checkbox" checked={runRestoration} onChange={() => {}} style={{ accentColor: '#2563EB', width: '18px', height: '18px' }} />
            </div>

            {/* Stage 2: Enhancement */}
            <div 
              onClick={() => setRunEnhancement(!runEnhancement)}
              style={{
                background: runEnhancement ? '#F0F9FF' : '#FFF',
                border: runEnhancement ? '2.5px solid #0284C7' : '2px solid rgba(0,0,0,0.15)',
                boxShadow: runEnhancement ? '0 4px 0 #0284C7' : 'none',
                borderRadius: '16px',
                padding: '14px',
                cursor: 'pointer',
                transition: 'all 0.2s',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{ width: '34px', height: '34px', borderRadius: '50%', background: '#0284C7', color: '#FFF', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800 }}>
                  2
                </div>
                <div>
                  <div style={{ fontFamily: 'var(--font-heading)', fontWeight: 700, fontSize: '0.92rem', color: '#1E080F' }}>
                    Enhancement
                  </div>
                  <div style={{ fontSize: '0.72rem', color: '#4B5563' }}>
                    Real-ESRGAN x4+
                  </div>
                </div>
              </div>
              <input type="checkbox" checked={runEnhancement} onChange={() => {}} style={{ accentColor: '#0284C7', width: '18px', height: '18px' }} />
            </div>

            {/* Stage 3: Colorization */}
            <div 
              onClick={() => setRunColorization(!runColorization)}
              style={{
                background: runColorization ? '#ECFDF5' : '#FFF',
                border: runColorization ? '2.5px solid #10B981' : '2px solid rgba(0,0,0,0.15)',
                boxShadow: runColorization ? '0 4px 0 #10B981' : 'none',
                borderRadius: '16px',
                padding: '14px',
                cursor: 'pointer',
                transition: 'all 0.2s',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{ width: '34px', height: '34px', borderRadius: '50%', background: '#10B981', color: '#FFF', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800 }}>
                  3
                </div>
                <div>
                  <div style={{ fontFamily: 'var(--font-heading)', fontWeight: 700, fontSize: '0.92rem', color: '#1E080F' }}>
                    Colorization
                  </div>
                  <div style={{ fontSize: '0.72rem', color: '#4B5563' }}>
                    colorization_R_34PT
                  </div>
                </div>
              </div>
              <input type="checkbox" checked={runColorization} onChange={() => {}} style={{ accentColor: '#10B981', width: '18px', height: '18px' }} />
            </div>
          </div>

          {/* COLOR STYLE SELECTOR (Vivid vs Natural vs Custom T) */}
          {runColorization && (
            <div style={{
              background: '#F0FDF4',
              border: '2px solid #10B981',
              borderRadius: '16px',
              padding: '12px 18px',
              marginBottom: '20px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: '12px'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Palette size={18} color="#10B981" />
                <span style={{ fontFamily: 'var(--font-heading)', fontWeight: 700, fontSize: '0.9rem', color: '#065F46' }}>
                  Color Profile & Temperature:
                </span>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                {/* Vivid Button (Default) */}
                <button
                  type="button"
                  onClick={() => setColorStyle('vivid')}
                  style={{
                    padding: '6px 14px',
                    borderRadius: '9999px',
                    border: '1.5px solid #10B981',
                    background: colorStyle === 'vivid' ? '#10B981' : '#FFF',
                    color: colorStyle === 'vivid' ? '#FFF' : '#065F46',
                    fontFamily: 'var(--font-heading)',
                    fontSize: '0.78rem',
                    fontWeight: 700,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px'
                  }}
                >
                  <Flame size={14} />
                  <span>Vivid (T = 0.45)</span>
                </button>

                {/* Natural Button */}
                <button
                  type="button"
                  onClick={() => setColorStyle('natural')}
                  style={{
                    padding: '6px 14px',
                    borderRadius: '9999px',
                    border: '1.5px solid #10B981',
                    background: colorStyle === 'natural' ? '#10B981' : '#FFF',
                    color: colorStyle === 'natural' ? '#FFF' : '#065F46',
                    fontFamily: 'var(--font-heading)',
                    fontSize: '0.78rem',
                    fontWeight: 700,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px'
                  }}
                >
                  <Leaf size={14} />
                  <span>Natural (T = 1.0)</span>
                </button>

                {/* Custom Button */}
                <button
                  type="button"
                  onClick={() => setColorStyle('custom')}
                  style={{
                    padding: '6px 14px',
                    borderRadius: '9999px',
                    border: '1.5px solid #10B981',
                    background: colorStyle === 'custom' ? '#10B981' : '#FFF',
                    color: colorStyle === 'custom' ? '#FFF' : '#065F46',
                    fontFamily: 'var(--font-heading)',
                    fontSize: '0.78rem',
                    fontWeight: 700,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px'
                  }}
                >
                  <SlidersHorizontal size={14} />
                  <span>Custom T</span>
                </button>

                {colorStyle === 'custom' && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginLeft: '6px' }}>
                    <input
                      type="range"
                      min="0.25"
                      max="1.0"
                      step="0.01"
                      value={temperature}
                      onChange={(e) => setTemperature(parseFloat(e.target.value))}
                      style={{ accentColor: '#10B981', width: '90px' }}
                    />
                    <span style={{ fontSize: '0.78rem', fontWeight: 800, color: '#065F46', fontFamily: 'var(--font-mono)' }}>
                      T={temperature.toFixed(2)}
                    </span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ENHANCEMENT SCALE SELECTOR (1x vs 2x vs 4x) */}
          {runEnhancement && (
            <div style={{
              background: '#F0F9FF',
              border: '2px solid #0284C7',
              borderRadius: '16px',
              padding: '12px 18px',
              marginBottom: '20px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: '12px'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Maximize2 size={18} color="#0284C7" />
                <div>
                  <span style={{ fontFamily: 'var(--font-heading)', fontWeight: 700, fontSize: '0.9rem', color: '#0369A1' }}>
                    Enhancement Scale:
                  </span>
                  <span style={{ fontSize: '0.74rem', color: '#64748B', marginLeft: '6px' }}>
                    (Real-ESRGAN x4+ Neural Core)
                  </span>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                {[
                  { scale: 1.0, label: '1x (Original Size)', desc: 'Full 4x detail synthesis mapped to native resolution' },
                  { scale: 2.0, label: '2x (Double HD)', desc: '2x high-resolution upscale' },
                  { scale: 4.0, label: '4x (Ultra 4K Super-Res)', desc: 'Full native 4x super-resolution canvas' }
                ].map((item) => (
                  <button
                    key={item.scale}
                    type="button"
                    onClick={() => setOutScale(item.scale)}
                    style={{
                      padding: '6px 14px',
                      borderRadius: '9999px',
                      border: outScale === item.scale ? '2px solid #0284C7' : '1.5px solid rgba(2,132,199,0.3)',
                      background: outScale === item.scale ? '#0284C7' : '#FFF',
                      color: outScale === item.scale ? '#FFF' : '#0369A1',
                      fontFamily: 'var(--font-heading)',
                      fontSize: '0.78rem',
                      fontWeight: 700,
                      cursor: 'pointer',
                      transition: 'all 0.15s ease'
                    }}
                    title={item.desc}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Execution Actions Strip */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '12px',
            marginBottom: '20px'
          }}>
            {/* Primary Action Button (Pomegranate Cherry Pill) */}
            <MagneticButton
              onClick={() => handleExecute('pipeline')}
              disabled={isProcessing || !currentImage}
              className="btn-pomegranate-cherry"
              style={{ padding: '14px 34px', fontSize: '1rem' }}
            >
              <Play size={18} fill="#FFF" />
              <span>{isProcessing ? 'Running PyTorch Models...' : 'PROCESS PHOTO NOW ➔'}</span>
            </MagneticButton>

            {/* Quick individual run buttons */}
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
              <button
                onClick={() => handleExecute('restore-only')}
                disabled={isProcessing || !currentImage}
                className="btn-pomegranate-cream"
                style={{ padding: '8px 14px', fontSize: '0.78rem' }}
              >
                Restore Only
              </button>
              <button
                onClick={() => handleExecute('enhance-only')}
                disabled={isProcessing || !currentImage}
                className="btn-pomegranate-cream"
                style={{ padding: '8px 14px', fontSize: '0.78rem' }}
              >
                Enhance Only
              </button>
              <button
                onClick={() => handleExecute('colorize-only')}
                disabled={isProcessing || !currentImage}
                className="btn-pomegranate-cream"
                style={{ padding: '8px 14px', fontSize: '0.78rem' }}
              >
                Colorize Only
              </button>
            </div>
          </div>

          {/* Error Banner */}
          {errorMessage && (
            <div style={{
              background: '#FEE2E2',
              border: '2px solid #DC2626',
              borderRadius: '14px',
              padding: '12px 18px',
              marginBottom: '16px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '10px',
              color: '#991B1B',
              fontSize: '0.86rem',
              fontWeight: 600
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <AlertTriangle size={20} color="#DC2626" />
                <span>{errorMessage}</span>
              </div>
              <button
                onClick={() => setErrorMessage(null)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#991B1B', fontWeight: 800 }}
              >
                ✕
              </button>
            </div>
          )}

          {/* Progress Banner */}
          {isProcessing && (
            <div style={{
              background: '#FFF3F5',
              border: '2px solid var(--cherry-hero)',
              borderRadius: '14px',
              padding: '12px 18px',
              marginBottom: '16px'
            }}>
              <div style={{ fontSize: '0.84rem', fontWeight: 700, color: 'var(--cherry-dark)', marginBottom: '8px' }}>
                <span>{progressStage}</span>
              </div>
              <div
                role="progressbar"
                aria-label="Processing neural models"
                aria-valuemin={0}
                aria-valuemax={100}
                aria-valuenow={progressPercent}
                aria-valuetext={progressStage}
                style={{ height: '8px', background: 'rgba(0,0,0,0.08)', borderRadius: '9999px', overflow: 'hidden' }}
              >
                <div style={{
                  width: `${progressPercent}%`,
                  height: '100%',
                  background: 'var(--cherry-hero)',
                  borderRadius: 'inherit',
                  transition: 'width 0.35s ease'
                }} />
              </div>
            </div>
          )}

          {/* Canvas & Comparison Area */}
          {currentImage ? (
            <div style={{ position: 'relative' }}>
              {/* If processed result exists, show interactive split slider */}
              {processedResult ? (
                <div>
                  {/* Step selector tabs */}
                  <div style={{ display: 'flex', gap: '8px', marginBottom: '12px', flexWrap: 'wrap', alignItems: 'center' }}>
                    <button
                      onClick={() => setViewMode('split')}
                      style={{
                        padding: '6px 14px',
                        borderRadius: '9999px',
                        border: '2px solid var(--cherry-dark)',
                        background: viewMode === 'split' ? 'var(--cherry-dark)' : '#FFF',
                        color: viewMode === 'split' ? '#FFF' : 'var(--cherry-dark)',
                        fontFamily: 'var(--font-heading)',
                        fontWeight: 700,
                        fontSize: '0.78rem',
                        cursor: 'pointer'
                      }}
                    >
                      Interactive Split Slider
                    </button>

                    <button
                      onClick={() => setViewMode('steps')}
                      style={{
                        padding: '6px 14px',
                        borderRadius: '9999px',
                        border: '2px solid var(--cherry-dark)',
                        background: viewMode === 'steps' ? 'var(--cherry-dark)' : '#FFF',
                        color: viewMode === 'steps' ? '#FFF' : 'var(--cherry-dark)',
                        fontFamily: 'var(--font-heading)',
                        fontWeight: 700,
                        fontSize: '0.78rem',
                        cursor: 'pointer'
                      }}
                    >
                      Step-by-Step Inspector ({processedResult.steps.length} steps)
                    </button>

                    <button
                      onClick={() => triggerDownload(processedResult.final_image, currentImage.name)}
                      className="btn-pomegranate-cherry"
                      style={{ padding: '6px 16px', fontSize: '0.76rem', marginLeft: 'auto' }}
                    >
                      <Download size={14} />
                      <span>Download PNG</span>
                    </button>
                  </div>

                  {viewMode === 'split' ? (
                    <div
                      ref={sliderContainerRef}
                      onMouseDown={() => setIsDragging(true)}
                      onMouseUp={() => setIsDragging(false)}
                      onMouseMove={(e) => isDragging && handleSliderMove(e)}
                      onTouchMove={handleSliderMove}
                      style={{
                        position: 'relative',
                        width: '100%',
                        height: '480px',
                        borderRadius: '16px',
                        overflow: 'hidden',
                        border: '3px solid var(--cherry-dark)',
                        background: '#000',
                        cursor: 'ew-resize',
                        userSelect: 'none'
                      }}
                    >
                      {/* After Image (Right Side / Full Background) */}
                      <img
                        src={processedResult.final_image}
                        alt="After"
                        style={{
                          width: '100%',
                          height: '100%',
                          objectFit: 'contain',
                          position: 'absolute',
                          inset: 0
                        }}
                      />

                      {/* Before Image (Left Side / Clipped) */}
                      <div
                        style={{
                          position: 'absolute',
                          top: 0,
                          left: 0,
                          bottom: 0,
                          width: `${sliderPos}%`,
                          overflow: 'hidden',
                          zIndex: 5
                        }}
                      >
                        <img
                          src={currentImage.url}
                          alt="Before"
                          style={{
                            width: sliderContainerRef.current ? `${sliderContainerRef.current.clientWidth}px` : '100%',
                            height: '100%',
                            objectFit: 'contain',
                            position: 'absolute',
                            left: 0,
                            top: 0
                          }}
                        />
                      </div>

                      {/* Divider Line & Handle */}
                      <div
                        style={{
                          position: 'absolute',
                          top: 0,
                          bottom: 0,
                          left: `${sliderPos}%`,
                          width: '3px',
                          background: '#FFF',
                          boxShadow: '0 0 10px rgba(0,0,0,0.5)',
                          zIndex: 10
                        }}
                      >
                        <div
                          style={{
                            position: 'absolute',
                            top: '50%',
                            left: '50%',
                            transform: 'translate(-50%, -50%)'
                          }}
                        >
                          <div className="retro-slider-handle" data-cursor="DRAG">
                            <SplitSquareVertical size={18} />
                          </div>
                        </div>
                      </div>

                      {/* Overlay Labels */}
                      <div style={{ position: 'absolute', bottom: '12px', left: '12px', zIndex: 12 }}>
                        <span style={{
                          background: '#1E080F',
                          color: '#FFF',
                          padding: '4px 10px',
                          borderRadius: '9999px',
                          fontSize: '0.74rem',
                          fontWeight: 700
                        }}>
                          Original Input
                        </span>
                      </div>
                      <div style={{ position: 'absolute', bottom: '12px', right: '12px', zIndex: 12 }}>
                        <span style={{
                          background: 'var(--cherry-burgundy)',
                          color: '#FFF',
                          padding: '4px 10px',
                          borderRadius: '9999px',
                          fontSize: '0.74rem',
                          fontWeight: 700
                        }}>
                          Neural Model Output
                        </span>
                      </div>
                    </div>
                  ) : (
                    /* Step-by-Step Inspector */
                    <div style={{
                      borderRadius: '16px',
                      border: '3px solid var(--cherry-dark)',
                      padding: '16px',
                      background: '#FAF6EF'
                    }}>
                      <div style={{ display: 'flex', gap: '8px', marginBottom: '14px', flexWrap: 'wrap' }}>
                        {processedResult.steps.map((st, idx) => (
                          <button
                            key={idx}
                            onClick={() => setActiveStepIndex(idx)}
                            style={{
                              padding: '6px 12px',
                              borderRadius: '8px',
                              border: activeStepIndex === idx ? '2px solid var(--cherry-dark)' : '1px solid rgba(0,0,0,0.15)',
                              background: activeStepIndex === idx ? 'var(--cherry-hero)' : '#FFF',
                              color: activeStepIndex === idx ? '#FFF' : 'var(--cherry-dark)',
                              fontWeight: 700,
                              fontSize: '0.76rem',
                              cursor: 'pointer'
                            }}
                          >
                            {st.title} {st.duration ? `(${st.duration})` : ''}
                          </button>
                        ))}
                      </div>

                      <div style={{ textAlign: 'center' }}>
                        <img 
                          src={processedResult.steps[activeStepIndex]?.image} 
                          alt="Step" 
                          style={{ maxHeight: '420px', maxWidth: '100%', objectFit: 'contain', borderRadius: '8px' }} 
                        />
                        <div style={{ 
                          marginTop: '12px', 
                          display: 'flex', 
                          alignItems: 'center', 
                          justifyContent: 'center', 
                          gap: '14px',
                          flexWrap: 'wrap'
                        }}>
                          <span style={{ fontSize: '0.84rem', color: 'var(--text-medium)', fontWeight: 600 }}>
                            {processedResult.steps[activeStepIndex]?.description}
                          </span>
                          <button
                            type="button"
                            onClick={() => triggerDownload(
                              processedResult.steps[activeStepIndex]?.image, 
                              `${currentImage.name}_${processedResult.steps[activeStepIndex]?.key || 'step'}`
                            )}
                            className="btn-pomegranate-cream"
                            style={{ 
                              padding: '5px 14px', 
                              fontSize: '0.76rem', 
                              display: 'inline-flex', 
                              alignItems: 'center', 
                              gap: '6px' 
                            }}
                          >
                            <Download size={13} />
                            <span>Download This Step</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                /* Source Image Initial Preview */
                <div style={{
                  position: 'relative',
                  width: '100%',
                  height: '440px',
                  borderRadius: '16px',
                  overflow: 'hidden',
                  border: '3px solid var(--cherry-dark)',
                  background: '#140F11',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <img
                    src={currentImage.url}
                    alt="Source"
                    style={{ maxWidth: '100%', maxHeight: '420px', objectFit: 'contain' }}
                  />
                  <div style={{ position: 'absolute', bottom: '16px', left: '16px' }}>
                    <span style={{
                      background: '#1E080F',
                      color: '#FFF',
                      padding: '6px 14px',
                      borderRadius: '9999px',
                      fontSize: '0.8rem',
                      fontWeight: 700
                    }}>
                      Loaded: {currentImage.name}
                    </span>
                  </div>

                  <div style={{ position: 'absolute', bottom: '16px', right: '16px' }}>
                    <button
                      onClick={() => monitorFileInputRef.current && monitorFileInputRef.current.click()}
                      className="btn-pomegranate-cream"
                      style={{ padding: '6px 14px', fontSize: '0.76rem', borderRadius: '9999px' }}
                    >
                      <UploadCloud size={13} />
                      <span>Change Image</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            /* Upload Dropzone when no image loaded */
            <div
              onClick={() => monitorFileInputRef.current && monitorFileInputRef.current.click()}
              style={{
                width: '100%',
                height: '380px',
                borderRadius: '16px',
                border: '3px dashed var(--cherry-dark)',
                background: '#FAF6EF',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                padding: '24px',
                textAlign: 'center'
              }}
            >
              <div style={{
                width: '64px',
                height: '64px',
                borderRadius: '50%',
                background: 'var(--cherry-blush)',
                color: 'var(--cherry-hero)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: '16px'
              }}>
                <UploadCloud size={32} />
              </div>
              <h3 style={{ fontFamily: 'var(--font-heading)', fontWeight: 800, fontSize: '1.2rem', color: 'var(--cherry-dark)', marginBottom: '6px' }}>
                Drop any vintage photo here or click to browse
              </h3>
              <p style={{ fontSize: '0.84rem', color: 'var(--text-medium)', marginBottom: '16px', maxWidth: '380px' }}>
                Supports JPEG, PNG, BMP, and WebP. You can also paste directly from clipboard (Ctrl+V)!
              </p>
              <button
                type="button"
                className="btn-pomegranate-cherry"
                style={{ padding: '8px 20px', fontSize: '0.82rem', borderRadius: '9999px' }}
              >
                Browse From Computer
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Slanted Comic Dialogue Banner below TV monitor */}
      <ParallaxElement speed={0.14} rotateSpeed={-0.12}>
        <SlantedRibbon text="Neural Order: 1. Restoration ➔ 2. Enhancement ➔ 3. Colorization — Run together or one by one!" />
      </ParallaxElement>

      {/* Download stamp & User reviews (Boy-Coy Screenshot 2) */}
      <div style={{
        maxWidth: '1100px',
        margin: '50px auto 0',
        display: 'grid',
        gridTemplateColumns: '140px 1fr',
        gap: '40px',
        alignItems: 'center'
      }}>
        {/* Circular Green Stamp with Parallax Float */}
        <div style={{ textAlign: 'center' }}>
          <ParallaxElement speed={-0.22} rotateSpeed={0.35}>
            <div 
              onClick={() => handleExecute('pipeline')} 
              className="circle-stamp-green" 
              style={{ cursor: 'pointer' }}
              data-cursor="RESTORE!"
            >
              <div style={{ fontSize: '1.4rem' }}>⚡</div>
              <div style={{ fontSize: '0.68rem', fontWeight: 800, textTransform: 'uppercase', lineHeight: 1.1 }}>
                Restore<br />Now!
              </div>
            </div>
            <div className="hand-annotation" style={{ justifyContent: 'center', marginTop: '8px' }}>
              <span>⤹ 100% Free</span>
            </div>
          </ParallaxElement>
        </div>

        {/* User Reviews */}
        <div>
          <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.4rem', fontWeight: 700, color: 'var(--text-dark)', marginBottom: '16px' }}>
            User reviews & Verified Model Outputs
          </h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px' }}>
            <div style={{ display: 'flex', gap: '10px' }}>
              <Quote size={24} color="#84CC16" style={{ flexShrink: 0 }} />
              <div>
                <p style={{ fontSize: '0.88rem', color: 'var(--text-dark)', lineHeight: 1.45, fontWeight: 500 }}>
                  <strong>Could not ask for more.</strong> Brilliant scratch removal, sharp textures, and rich natural colors in the 1 ➔ 2 ➔ 3 pipeline order.
                </p>
                <div style={{ fontSize: '0.78rem', color: '#16A34A', fontWeight: 700, marginTop: '4px' }}>
                  — Geoffrey
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '10px' }}>
              <Quote size={24} color="#84CC16" style={{ flexShrink: 0 }} />
              <div>
                <p style={{ fontSize: '0.88rem', color: 'var(--text-dark)', lineHeight: 1.45, fontWeight: 500 }}>
                  <strong>Ultra Slick Restoration.</strong> Nice to get an app which does exactly what it says. Colorization R-34 captures rich color fidelity with zero artificial yellow tint.
                </p>
                <div style={{ fontSize: '0.78rem', color: '#16A34A', fontWeight: 700, marginTop: '4px' }}>
                  — Keith
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
