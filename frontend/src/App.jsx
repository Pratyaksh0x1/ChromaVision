import React, { useState, useEffect } from 'react';
import BoyCoyHero from './components/BoyCoyHero';
import BoyCoyStudio from './components/BoyCoyStudio';
import ImageHistorySection from './components/ImageHistorySection';
import PomegranateShowcase from './components/PomegranateShowcase';
import PipelineSection from './components/PipelineSection';
import BoyCoyBenchmarks from './components/BoyCoyBenchmarks';
import BoyCoyFooter from './components/BoyCoyFooter';
import CustomCursor from './components/CustomCursor';
import ScrollProgressBar from './components/ScrollProgressBar';

const STORAGE_KEY = 'chromavision_history_v2';

export default function App() {
  const [apiStatus, setApiStatus] = useState(null);
  const [currentImage, setCurrentImage] = useState(null);
  const [processedResult, setProcessedResult] = useState(null);
  const [history, setHistory] = useState([]);

  // Model toggles (Default: all 3 active for full triple pipeline)
  const [runRestoration, setRunRestoration] = useState(true);
  const [runColorization, setRunColorization] = useState(true);
  const [runEnhancement, setRunEnhancement] = useState(true);

  const [isProcessing, setIsProcessing] = useState(false);

  // Initialize history from localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        setHistory(JSON.parse(saved));
      }
    } catch (err) {
      console.warn("Could not read session history from localStorage:", err);
    }
  }, []);

  // Save history to localStorage
  const saveHistory = (newHistory) => {
    setHistory(newHistory);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(newHistory));
    } catch (err) {
      console.warn("Could not persist history (possibly quota exceeded):", err);
    }
  };

  const handleProcessComplete = (resultData, sourceImageInfo, configInfo) => {
    if (!resultData || !resultData.final_image) return;

    const newItem = {
      id: Date.now().toString(),
      name: sourceImageInfo?.name || resultData.filename || 'Photo',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      inputImage: sourceImageInfo?.url || resultData.steps?.[0]?.image,
      finalImage: resultData.final_image,
      executedStages: resultData.executed_stages || [],
      processedDimensions: resultData.processed_dimensions,
      durations: resultData.durations || {},
      steps: resultData.steps || [],
      temperature: configInfo?.temperature,
      outScale: configInfo?.outScale
    };

    const updated = [newItem, ...history.filter(h => h.id !== newItem.id)].slice(0, 30);
    saveHistory(updated);
  };

  const handleSelectHistoryItem = (item) => {
    setCurrentImage({
      url: item.inputImage,
      file: null,
      name: item.name,
      isPreset: false
    });
    setProcessedResult({
      success: true,
      filename: item.name,
      processed_dimensions: item.processedDimensions,
      executed_stages: item.executedStages,
      durations: item.durations,
      steps: item.steps,
      final_image: item.finalImage
    });
    scrollToSection('studio');
  };

  const handleDeleteHistoryItem = (id) => {
    const updated = history.filter(item => item.id !== id);
    saveHistory(updated);
  };

  const handleClearHistory = () => {
    if (window.confirm("Are you sure you want to clear all processed photo history?")) {
      saveHistory([]);
    }
  };

  useEffect(() => {
    const fetchStatus = async () => {
      try {
        const res = await fetch('/api/status');
        if (res.ok) {
          const data = await res.json();
          setApiStatus(data);
        }
      } catch (err) {
        console.log("Local API status check:", err);
      }
    };
    fetchStatus();
  }, []);

  const scrollToSection = (id) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <div className="min-h-screen" style={{ backgroundColor: 'var(--bg-cream)', position: 'relative' }}>
      {/* Dynamic Top Scroll Indicator */}
      <ScrollProgressBar />

      {/* Modern High-Precision Custom Pointer Animation with HUD */}
      <CustomCursor />

      {/* 1. Boy-Coy Style Cherry Red Hero with Robot & Speech Bubble + Multi-Speed Parallax */}
      <BoyCoyHero 
        onStartClick={() => scrollToSection('studio')} 
        scrollToSection={scrollToSection} 
      />

      {/* 2. Boy-Coy Style Floating Balloon Monitor Studio with Presets & Full Upload Support */}
      <BoyCoyStudio
        currentImage={currentImage}
        setCurrentImage={setCurrentImage}
        processedResult={processedResult}
        setProcessedResult={setProcessedResult}
        runRestoration={runRestoration}
        setRunRestoration={setRunRestoration}
        runColorization={runColorization}
        setRunColorization={setRunColorization}
        runEnhancement={runEnhancement}
        setRunEnhancement={setRunEnhancement}
        isProcessing={isProcessing}
        setIsProcessing={setIsProcessing}
        onProcessComplete={handleProcessComplete}
        historyCount={history.length}
        scrollToSection={scrollToSection}
      />

      {/* 3. Dedicated Image History Section */}
      <ImageHistorySection
        history={history}
        onSelectHistoryItem={handleSelectHistoryItem}
        onClearHistory={handleClearHistory}
        onDeleteHistoryItem={handleDeleteHistoryItem}
        onOpenUpload={() => {
          scrollToSection('studio');
        }}
      />

      {/* 4. Pomegranate Health Inspired Device Mockup Showcase & Rainbow Gauge */}
      <PomegranateShowcase 
        onStartClick={() => scrollToSection('studio')} 
      />

      {/* 5. Pipeline Architecture (1. Restoration -> 2. Enhancement -> 3. Colorization) */}
      <PipelineSection 
        onTryPipeline={() => scrollToSection('studio')} 
      />

      {/* 6. Empirical Model Training Benchmarks */}
      <BoyCoyBenchmarks apiStatus={apiStatus} />

      {/* 7. Footer */}
      <BoyCoyFooter scrollToSection={scrollToSection} />
    </div>
  );
}
