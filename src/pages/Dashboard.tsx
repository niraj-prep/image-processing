import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { practicals, postlabs } from '../data/experiments';
import type { ExperimentData } from '../data/experiments';

const FILTER_CATEGORIES = ['All', 'Filters', 'Morphology', 'Restoration', 'Transforms', 'Post-Lab'];

function ExperimentCard({ experiment, index }: { experiment: ExperimentData; index: number }) {
  const isPostlab = experiment.type === 'postlab';
  const path = isPostlab ? `/postlab/${experiment.number}` : `/practical/${experiment.number}`;
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setVisible(true); },
      { threshold: 0.1 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      className={`opacity-0 ${visible ? 'animate-fade-in-up' : ''}`}
      style={{ animationDelay: `${index * 50}ms`, animationFillMode: 'forwards' }}
    >
      <Link to={path} className="block group">
        <div className="card p-5 h-full flex flex-col gap-3 relative overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between">
            <span className={`font-mono text-badge-label px-2 py-0.5 rounded-full font-bold ${
              isPostlab
                ? 'bg-orange-50 text-secondary-hover'
                : 'bg-red-50 text-primary'
            }`}>
              {isPostlab ? `EXP-${String(experiment.number).padStart(2, '0')}` : `P-${String(experiment.number).padStart(2, '0')}`}
            </span>
            <div className="flex items-center gap-1">
              {experiment.tags.map((tag) => (
                <span key={tag} className="font-mono text-badge-label text-text-muted">{tag}</span>
              ))}
            </div>
          </div>

          {/* Icon */}
          <div className={`w-full h-28 rounded-lg flex items-center justify-center ${
            isPostlab
              ? 'bg-gradient-to-br from-orange-50 to-amber-50'
              : 'bg-gradient-to-br from-red-50 to-rose-50'
          }`}>
            <span className={`material-symbols-outlined text-[48px] ${
              isPostlab ? 'text-secondary/60' : 'text-primary/60'
            } group-hover:scale-110 transition-transform motion-fast`}>
              {experiment.icon}
            </span>
          </div>

          {/* Title */}
          <h3 className="font-geist text-headline-sm text-text-primary font-semibold leading-tight">
            {experiment.title}
          </h3>
          <p className="text-body-sm text-text-secondary line-clamp-2">
            {experiment.description}
          </p>

          {/* Operation Chips */}
          <div className="flex flex-wrap gap-1 mt-auto">
            {experiment.operationChips.map((chip) => (
              <span
                key={chip}
                className={`text-body-sm px-2 py-0.5 rounded ${
                  isPostlab
                    ? 'bg-orange-50 text-secondary-hover border border-secondary/20'
                    : 'bg-neutral-100 text-text-secondary border border-border-subtle'
                }`}
              >
                {chip}
              </span>
            ))}
          </div>

          {/* Footer */}
          <div className="flex items-center justify-end pt-2 border-t border-border-subtle">
            <span className={`font-mono text-control-label font-semibold flex items-center gap-1 ${
              isPostlab ? 'text-secondary-hover' : 'text-primary'
            } group-hover:gap-2 transition-all motion-fast`}>
              {isPostlab ? 'Inspect Ops' : 'Workbench'}
              <span className="material-symbols-outlined text-[14px]">arrow_forward</span>
            </span>
          </div>
        </div>
      </Link>
    </div>
  );
}

export default function Dashboard() {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState('All');

  const filterExperiments = (experiments: ExperimentData[]) => {
    let filtered = experiments;

    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (e) =>
          e.title.toLowerCase().includes(q) ||
          e.description.toLowerCase().includes(q) ||
          e.operationChips.some((c) => c.toLowerCase().includes(q))
      );
    }

    if (activeFilter !== 'All' && activeFilter !== 'Post-Lab') {
      const filterMap: Record<string, string[]> = {
        Filters: ['practical-4'],
        Morphology: ['practical-7', 'postlab-1'],
        Restoration: ['practical-5'],
        Transforms: ['practical-2'],
      };
      const ids = filterMap[activeFilter] || [];
      if (ids.length) filtered = filtered.filter((e) => ids.includes(e.id));
    }

    return filtered;
  };

  const filteredPracticals = filterExperiments(practicals);
  const filteredPostlabs = activeFilter === 'Post-Lab' ? postlabs : filterExperiments(postlabs);
  const showPostlabs = activeFilter === 'All' || activeFilter === 'Post-Lab' || filteredPostlabs.length > 0;

  return (
    <div className="flex flex-col w-full">
      {/* Hero Section */}
      <section className="relative w-full px-5 lg:px-8 py-8 overflow-hidden">
        {/* Background glows */}
        <div className="absolute top-0 right-1/4 w-96 h-96 rounded-full bg-red-500/5 blur-3xl pointer-events-none -z-10" />
        <div className="absolute bottom-10 left-1/3 w-80 h-80 rounded-full bg-orange-500/5 blur-3xl pointer-events-none -z-10" />

        <div className="max-w-7xl mx-auto flex flex-col gap-8">
          {/* Title */}
          <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6">
            <div className="flex flex-col gap-2 max-w-3xl">
              <div className="flex items-center gap-2">
                <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-red-50 border border-red-200 text-primary font-mono text-badge-label tracking-wider uppercase font-semibold">
                  <span className="w-1.5 h-1.5 rounded-full bg-primary animate-ping" />
                  Research & Academic Runtime
                </span>
                <span className="font-mono text-stat-label text-text-muted uppercase tracking-wider">
                  Course Code CV-409
                </span>
                <span className="text-border-prominent">•</span>
                <span className="font-mono text-stat-label text-emerald-600 font-medium">
                  IEEE 1180 Compatible
                </span>
              </div>
              <h1 className="font-geist text-display-hero text-text-primary tracking-tight">
                Image Processing Laboratory
              </h1>
              <p className="font-geist text-body-lg text-text-secondary max-w-2xl leading-relaxed">
                Interactive Computer Vision Practicals & Post-Lab Experiments — Real-time WebAssembly & Python Execution with deterministic client-side tensor analysis.
              </p>
            </div>

            <div className="flex items-center gap-2 self-start lg:self-end">
              <button className="btn-outline group">
                <span className="material-symbols-outlined text-[18px] text-primary group-hover:rotate-45 transition-transform">explore</span>
                <span>Interactive Tour</span>
              </button>
              <Link to="/practical/1" className="btn-primary">
                <span className="material-symbols-outlined text-[18px]">terminal</span>
                <span>Launch Workbench</span>
              </Link>
            </div>
          </div>

          {/* Pipeline Visualizer Hero Card */}
          <PipelineVisualizer />
        </div>
      </section>

      {/* Search & Filter */}
      <section className="px-5 lg:px-8 py-4 max-w-7xl mx-auto w-full">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2 bg-white border border-border-subtle rounded-lg px-3 py-2 shadow-xs w-full sm:w-auto sm:min-w-[320px]">
            <span className="material-symbols-outlined text-[18px] text-text-muted">search</span>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search algorithms, cv:: functions, transforms..."
              className="bg-transparent border-none outline-none text-body-md text-text-primary placeholder:text-text-muted:text-neutral-500 w-full font-geist"
            />
          </div>
          <div className="flex items-center gap-1 flex-wrap">
            {FILTER_CATEGORIES.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveFilter(cat)}
                className={`px-3 py-1 rounded-full font-mono text-control-label transition-colors ${
                  activeFilter === cat
                    ? cat === 'Post-Lab'
                      ? 'bg-secondary text-white'
                      : 'bg-primary text-white'
                    : 'bg-white border border-border-subtle text-text-secondary hover:bg-neutral-100:bg-dark-surface-raised'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Stats Strip */}
      <section className="px-5 lg:px-8 py-2 max-w-7xl mx-auto w-full">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: 'Core Coursework', value: '08', sub: 'Practicals', desc: 'Autonomous execution blocks', icon: 'verified' },
            { label: 'Exploratory', value: '03', sub: 'Post-Labs', desc: 'Spectral & gradient expansions', icon: 'science' },
            { label: 'Operator Set', value: '28', sub: 'Operations', desc: 'Spatial, frequency & matrix ops', icon: 'apps' },
            { label: 'Engine Parity', value: '100%', sub: 'WASM', desc: 'Zero-latency hardware SIMD', icon: 'check_circle' },
          ].map((stat) => (
            <div key={stat.label} className="flex flex-col gap-0.5 p-3">
              <div className="flex items-center justify-between">
                <span className="font-mono text-stat-label text-text-muted uppercase tracking-wider">{stat.label}</span>
                <span className={`material-symbols-outlined text-[16px] ${stat.label === 'Engine Parity' ? 'text-emerald-500' : 'text-primary'}`}>{stat.icon}</span>
              </div>
              <div className="flex items-baseline gap-1.5">
                <span className="font-geist text-headline-lg text-text-primary tabular-nums">{stat.value}</span>
                <span className="font-geist text-headline-sm text-text-primary">{stat.sub}</span>
              </div>
              <span className="text-body-sm text-text-muted">{stat.desc}</span>
            </div>
          ))}
        </div>
      </section>

      {/* Core Academic Practicals Grid */}
      <section className="px-5 lg:px-8 py-6 max-w-7xl mx-auto w-full" id="practicals">
        <div className="flex items-center justify-between mb-4">
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-[22px] text-primary">biotech</span>
              <h2 className="font-geist text-headline-lg text-text-primary">
                Core Academic Practicals
              </h2>
              <span className="chip-practical">Curriculum 2024-25</span>
            </div>
            <p className="text-body-md text-text-secondary">
              Standardized computer vision syllabi with interactive parameter manipulation and live canvas rendering.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {filteredPracticals.map((p, i) => (
            <ExperimentCard key={p.id} experiment={p} index={i} />
          ))}
        </div>
      </section>

      {/* Post-Lab Section */}
      {showPostlabs && (
        <section className="px-5 lg:px-8 py-6 max-w-7xl mx-auto w-full">
          <div className="bg-gradient-to-r from-orange-50/50 to-amber-50/50 rounded-xl p-6 border border-secondary/20">
            <div className="flex items-center gap-2 mb-1">
              <span className="chip-postlab">Post-Lab Advanced Modules</span>
              <span className="chip-postlab">Experimental Frontiers</span>
            </div>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="font-geist text-headline-lg text-text-primary mt-2">
                  Non-Uniform Illumination & Spectral Manifolds
                </h2>
                <p className="text-body-md text-text-secondary max-w-3xl mt-1">
                  Independent research extensions designed to examine advanced mathematical formulations: top-hat background leveling, multi-space chromatic isolation, and multi-directional edge gradient operators.
                </p>
              </div>
              <div className="hidden lg:flex flex-col items-end gap-0.5">
                <span className="font-mono text-stat-label text-text-muted uppercase">Module Status</span>
                <span className="font-mono text-body-sm text-secondary font-semibold flex items-center gap-1">
                  3 Unlocked Experiments
                  <span className="material-symbols-outlined text-[16px]">science</span>
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {filteredPostlabs.map((p, i) => (
                <ExperimentCard key={p.id} experiment={p} index={i} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Footer Status Bar */}
      <footer className="px-5 lg:px-8 py-3 border-t border-border-subtle bg-white">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-2 font-mono text-stat-label text-text-muted">
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
              OpenCV.js 4.8.0 WASM [BUILD 2024.11-STABLE]
            </span>
            <span>SIMD Vectorization: <span className="text-emerald-600 font-semibold">128-bit ENABLED</span></span>
          </div>
          <div className="flex items-center gap-3">
            <span>Execution Context: <span className="text-text-secondary font-semibold">CLIENT-THREAD-0</span></span>
            <span>Target FPS: <span className="text-primary font-semibold">60.0 FPS</span></span>
          </div>
        </div>
      </footer>
    </div>
  );
}

// Pipeline Visualizer subcomponent
function PipelineVisualizer() {
  const [currentStage, setCurrentStage] = useState(0);
  const [playing, setPlaying] = useState(true);

  const stages = [
    { num: '01', title: 'RGB Original Source', desc: 'Calibrated sRGB spectral distribution, 24-bit depth', tag: 'B-G-R', filter: '' },
    { num: '02', title: 'Luminance Grayscale Conversion', desc: 'ITU-R BT.601 weighted sum (0.299R + 0.587G + 0.114B)', tag: 'CV_8UC1', filter: 'grayscale(100%)' },
    { num: '03', title: 'Sobel Differential Gradient', desc: 'First derivative convolution: G = sqrt(Gx² + Gy²)', tag: 'CV_16S', filter: 'grayscale(100%) contrast(200%) invert(100%)' },
    { num: '04', title: 'Otsu Optimal Binarization', desc: 'Inter-class variance maximization thresholding (T=127)', tag: 'BINARY', filter: 'grayscale(100%) contrast(500%)' },
    { num: '05', title: 'Morphological Opening (SE=Cross)', desc: 'Erosion followed by Dilation to eliminate high-freq noise', tag: 'MORPH_OPEN', filter: 'grayscale(100%) contrast(300%) brightness(120%)' },
  ];

  useEffect(() => {
    if (!playing) return;
    const timer = setInterval(() => {
      setCurrentStage((prev) => (prev + 1) % stages.length);
    }, 3000);
    return () => clearInterval(timer);
  }, [playing, stages.length]);

  return (
    <div className="relative w-full rounded-xl bg-white border border-border-subtle overflow-hidden shadow-sm p-4 md:p-6 flex flex-col gap-4">
      {/* Top Bar */}
      <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-border-subtle">
        <div className="flex items-center gap-2">
          <div className="w-2.5 h-2.5 rounded-full bg-primary animate-pulse" />
          <span className="font-mono text-stat-label text-text-primary uppercase tracking-wider font-semibold">
            Live Processing Pipeline Simulation
          </span>
          <span className="font-mono text-badge-label bg-neutral-100 text-text-secondary px-1.5 py-0.5 rounded border border-border-subtle">
            cv::Mat 512×512 8UC3
          </span>
        </div>
        <div className="flex items-center gap-1 bg-neutral-100 p-0.5 rounded-lg border border-border-subtle">
          <button onClick={() => setCurrentStage((s) => (s - 1 + stages.length) % stages.length)} className="p-1 rounded text-text-secondary hover:text-text-primary:text-neutral-200 hover:bg-white:bg-dark-surface transition-colors">
            <span className="material-symbols-outlined text-[18px]">skip_previous</span>
          </button>
          <button onClick={() => setPlaying(!playing)} className="flex items-center gap-1 px-2 py-1 rounded bg-primary hover:bg-primary-hover text-white font-mono text-control-label shadow-xs font-semibold">
            <span className="material-symbols-outlined text-[16px]">{playing ? 'pause' : 'play_arrow'}</span>
            <span>{playing ? 'Auto-Cycle' : 'Play'}</span>
          </button>
          <button onClick={() => setCurrentStage((s) => (s + 1) % stages.length)} className="p-1 rounded text-text-secondary hover:text-text-primary:text-neutral-200 hover:bg-white:bg-dark-surface transition-colors">
            <span className="material-symbols-outlined text-[18px]">skip_next</span>
          </button>
        </div>
      </div>

      {/* Canvas & Pipeline */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-center">
        {/* Image viewport */}
        <div className="lg:col-span-5 relative w-full aspect-square max-h-72 lg:max-h-80 mx-auto rounded-lg overflow-hidden bg-neutral-100 border border-border-subtle flex items-center justify-center shadow-inner">
          <div
            className="w-full h-full bg-gradient-to-br from-slate-300 via-rose-200 to-amber-200 transition-all duration-700"
            style={{ filter: stages[currentStage].filter }}
          />
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-red-500/5 to-transparent pointer-events-none" />
          <div className="absolute bottom-2 left-2 right-2 p-2 rounded-lg bg-white/95 border border-border-subtle backdrop-blur-md flex items-center justify-between font-mono text-stat-label shadow-xs">
            <div className="flex items-center gap-2">
              <span className="text-primary font-semibold">ksize: 3×3</span>
              <span className="text-border-prominent">•</span>
              <span className="text-text-secondary">σ: 1.40</span>
            </div>
            <span className="text-secondary font-semibold">1.28 ms</span>
          </div>
        </div>

        {/* Pipeline stages */}
        <div className="lg:col-span-7 flex flex-col gap-2">
          <div className="text-text-muted font-mono text-stat-label uppercase tracking-wider mb-0.5">Active Operation Sequence</div>
          {stages.map((stage, i) => (
            <button
              key={stage.num}
              onClick={() => { setCurrentStage(i); setPlaying(false); }}
              className={`p-3 rounded-lg border transition-all cursor-pointer flex items-center justify-between ${
                i === currentStage
                  ? 'bg-canvas-base border-red-300 shadow-xs'
                  : 'bg-white border-border-subtle opacity-70 hover:opacity-100 hover:bg-canvas-base:bg-dark-bg'
              }`}
            >
              <div className="flex items-center gap-3">
                <span className={`w-6 h-6 rounded flex items-center justify-center font-mono text-stat-label font-bold ${
                  i === currentStage ? 'bg-primary text-white' : 'bg-neutral-100 text-text-secondary'
                }`}>
                  {stage.num}
                </span>
                <div className="text-left">
                  <div className="font-geist text-headline-sm text-text-primary">{stage.title}</div>
                  <div className="text-body-sm text-text-secondary">{stage.desc}</div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="font-mono text-badge-label px-1.5 py-0.5 rounded bg-neutral-100 border border-border-subtle text-text-secondary">
                  {stage.tag}
                </span>
                <span className={`material-symbols-outlined text-[18px] ${
                  i === currentStage ? 'text-emerald-600' : 'text-neutral-400'
                }`}>
                  {i === currentStage ? 'check_circle' : 'circle'}
                </span>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
