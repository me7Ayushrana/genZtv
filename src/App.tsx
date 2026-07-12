import { useState, useEffect } from 'react';
import { useWorkspaceStore } from './store/useWorkspace';
import { Header } from './components/Header';
import { Sidebar } from './components/Sidebar';
import { Stage } from './components/canvas/Stage';
import { TheForge } from './components/forge/TheForge';
import { StatsPanel } from './components/panels/StatsPanel';
import { PomodoroOverlay } from './components/panels/PomodoroOverlay';
import { BackgroundAtmosphere } from './components/canvas/BackgroundAtmosphere';
import { Minimize2, Layers, ArrowRight, Play, X, MonitorPlay, Image, FileText, Music, Palette, Timer, Globe } from 'lucide-react';

function App() {
  const { importWorkspaceFromHash, workspaces, setActiveWorkspace, activeWorkspaceId } = useWorkspaceStore();
  
  const [viewMode, setViewMode] = useState<'landing' | 'dashboard'>('landing');
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [forgeOpen, setForgeOpen] = useState(false);
  const [statsOpen, setStatsOpen] = useState(false);
  const [pomodoroOpen, setPomodoroOpen] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showIntro, setShowIntro] = useState(false);

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
    };
  }, []);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch((err) => {
        console.error("Error entering fullscreen:", err);
      });
    } else {
      document.exitFullscreen().catch((err) => {
        console.error("Error exiting fullscreen:", err);
      });
    }
  };

  // Check URL hash for shared workspaces on mount
  useEffect(() => {
    const handleHash = () => {
      const hash = window.location.hash;
      if (hash && hash.startsWith('#layout=')) {
        const layoutHash = hash.replace('#layout=', '');
        const success = importWorkspaceFromHash(layoutHash);
        if (success) {
          setViewMode('dashboard');
          // Strip the hash from the browser address bar to clean the view URL
          window.history.replaceState(null, '', window.location.pathname);
        } else {
          alert("Import failed. The shared URL link appears to be invalid or broken.");
        }
      }
    };

    handleHash();
    window.addEventListener('hashchange', handleHash);
    return () => window.removeEventListener('hashchange', handleHash);
  }, []);

  // Keyboard shortcut listener
  useEffect(() => {
    const handleShortcuts = (e: KeyboardEvent) => {
      // Avoid firing when writing in inputs or textareas
      const tag = document.activeElement?.tagName.toLowerCase();
      if (tag === 'input' || tag === 'textarea') return;

      // Ctrl/Cmd + Shift + F: Toggle The Forge
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'f') {
        e.preventDefault();
        setForgeOpen(prev => !prev);
      }
      
      // Ctrl/Cmd + Shift + P: Toggle Pomodoro
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'p') {
        e.preventDefault();
        setPomodoroOpen(prev => !prev);
      }

      // Ctrl/Cmd + Shift + S: Toggle Watch Stats
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 's') {
        e.preventDefault();
        setStatsOpen(prev => !prev);
      }

      // F key: Toggle Fullscreen/Focus Mode (YouTube-like)
      // Skip if user is typing in an input, textarea, or contentEditable element
      if (!e.ctrlKey && !e.metaKey && !e.altKey && !e.shiftKey && e.key.toLowerCase() === 'f') {
        const tag = (document.activeElement?.tagName || '').toLowerCase();
        const isEditable = tag === 'input' || tag === 'textarea' || 
          (document.activeElement as HTMLElement)?.isContentEditable;
        if (!isEditable) {
          e.preventDefault();
          toggleFullscreen();
        }
      }
    };

    window.addEventListener('keydown', handleShortcuts);
    return () => window.removeEventListener('keydown', handleShortcuts);
  }, [toggleFullscreen]);

  const handleStartFree = () => {
    // Select first workspace
    if (workspaces.length > 0) {
      setActiveWorkspace(workspaces[0].id);
    }
    setViewMode('dashboard');
  };

  const handleLoadDemoWS = (id: string) => {
    setActiveWorkspace(id);
    setViewMode('dashboard');
  };

  // RENDER LANDING PAGE VIEWPORT
  if (viewMode === 'landing') {
    return (
      <div className="min-h-screen bg-[#07070a] text-aether-text flex flex-col font-sans select-none overflow-y-auto">
        {/* Animated ambient gradient background shapes */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
          <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-aether-primary/5 blur-[120px] animate-pulse" />
          <div className="absolute bottom-[20%] right-[-10%] w-[60%] h-[60%] rounded-full bg-purple-500/5 blur-[150px]" />
        </div>

        {/* Navigation header */}
        <nav className="h-16 w-full bg-[#07070a]/60 backdrop-blur-md border-b border-aether-border/10 px-6 sm:px-12 flex items-center justify-between z-30 sticky top-0">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-[4px] bg-aether-primary flex items-center justify-center shadow-lg shadow-aether-primary/20">
              <span className="text-white font-black text-sm tracking-tighter">gZ</span>
            </div>
            <span className="font-bold text-sm tracking-wider uppercase text-aether-text font-serif">
              genZtv
            </span>
          </div>
          <button
            onClick={handleStartFree}
            className="px-5 py-2 text-xs font-bold rounded-[4px] bg-aether-primary text-white hover:bg-aether-primary-hover hover:shadow-lg hover:shadow-aether-primary/25 transition-all hover:scale-[1.02] active:scale-[0.98]"
          >
            Launch Canvas
          </button>
        </nav>

        {/* Hero Section */}
        <main className="max-w-6xl mx-auto w-full px-6 pt-12 pb-8 flex flex-col md:grid md:grid-cols-12 md:gap-16 items-center md:items-start text-left z-10">
          {/* Left Column: Asymmetric headline & CTAs */}
          <div className="md:col-span-7 flex flex-col gap-6 items-start">
            
            <h1 className="text-5xl md:text-7xl font-bold font-serif text-aether-text leading-[1.05] tracking-tight max-w-2xl">
              Your Universe. <br />
              Your Canvas. <br />
              Your Command.
            </h1>

            <p className="text-base md:text-lg text-aether-muted max-w-xl leading-relaxed font-sans mt-2">
              Unify multiple YouTube loops, document frames, notes, and ambient controllers on a fluid, zoomable grid. Dim background brightness, adjust layouts, and build the ultimate visual command deck.
            </p>

            <div className="flex flex-col sm:flex-row gap-3 mt-4 w-full sm:w-auto">
              <button
                onClick={handleStartFree}
                className="px-8 py-3.5 text-sm font-bold rounded-[4px] bg-aether-primary text-white hover:bg-aether-primary-hover transition-all shadow-lg shadow-aether-primary/20 hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-2"
              >
                Start Free Workspace <ArrowRight className="w-4 h-4" />
              </button>
              <button
                onClick={() => setShowIntro(true)}
                className="px-8 py-3.5 text-sm font-bold rounded-[4px] border border-aether-border/30 text-aether-muted hover:text-aether-text hover:border-aether-border/60 transition-all flex items-center justify-center gap-2"
              >
                How it Works
              </button>
            </div>
          </div>

          {/* Right Column: Dynamic Editorial Cards for Presets */}
          <div className="md:col-span-5 w-full mt-12 md:mt-0 flex flex-col gap-4">
            <h2 className="text-xs font-bold text-aether-primary/70 uppercase tracking-widest font-sans mb-1 flex items-center gap-1.5">
              <Layers className="w-3.5 h-3.5" /> Workspace Presets
            </h2>
            <div className="flex flex-col gap-4">
              {workspaces.map((ws) => (
                <div
                  key={ws.id}
                  onClick={() => handleLoadDemoWS(ws.id)}
                  className="p-5 rounded-[4px] bg-aether-surface/40 backdrop-blur-sm border border-aether-border/15 hover:border-aether-primary/45 cursor-pointer text-left transition-all hover:translate-y-[-3px] shadow-lg flex flex-col group"
                >
                  {ws.thumbnailUrl && (
                    <div className="w-full h-36 overflow-hidden rounded-[2px] mb-4 bg-black/30 relative">
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent z-10" />
                      <img 
                        src={ws.thumbnailUrl} 
                        alt={ws.name} 
                        className="w-full h-full object-cover opacity-75 group-hover:opacity-100 group-hover:scale-105 transition-all duration-500" 
                      />
                      <div className="absolute bottom-3 left-3 z-20 flex items-center gap-1.5 bg-black/60 px-2 py-0.5 rounded text-[9px] text-white border border-white/5 font-mono">
                        <Play className="w-2.5 h-2.5 fill-current text-aether-primary" />
                        Click to Load Preset
                      </div>
                    </div>
                  )}
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-bold text-aether-text font-serif group-hover:text-aether-primary transition-colors">{ws.name}</h3>
                    <span className="text-[10px] text-aether-muted font-mono bg-black/40 border border-white/5 px-2 py-0.5 rounded-[2px]">{ws.tiles.length} panels</span>
                  </div>
                  <p className="text-xs text-aether-muted mt-1 leading-relaxed">
                    {ws.id === 'study-workspace' 
                      ? 'Loads a side-by-side splitscreen with Lo-Fi background loops and study notes for focus sessions.'
                      : 'Loads twin video player panes. Perfect for tracking side-by-side tutorials or comparative watching.'}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </main>

        {/* Feature Highlights Grid Section */}
        <section className="max-w-6xl mx-auto w-full px-6 py-16 border-t border-aether-border/10 mt-12 z-10">
          <div className="text-center max-w-xl mx-auto mb-12 flex flex-col items-center">
            <span className="text-[9px] font-bold text-aether-primary uppercase tracking-widest mb-1.5">Capabilities</span>
            <h2 className="text-3xl md:text-4xl font-bold font-serif text-aether-text leading-tight">
              Crafted for Visual Focus
            </h2>
            <div className="w-12 h-0.5 bg-aether-primary mt-3" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Feature 1 — Unified Media */}
            <div className="rounded-[4px] bg-aether-surface/20 border border-aether-border/10 flex flex-col overflow-hidden hover:border-aether-primary/30 hover:-translate-y-1 transition-all duration-300 group">
              <div className="w-full h-40 overflow-hidden">
                <img src="/feature_media.png" alt="Unified Media" className="w-full h-full object-cover opacity-80 group-hover:opacity-100 group-hover:scale-105 transition-all duration-500" />
              </div>
              <div className="p-5 flex flex-col gap-2">
                <h3 className="text-sm font-bold text-aether-text uppercase tracking-wider font-sans">
                  Unified Media
                </h3>
                <p className="text-xs text-aether-muted leading-relaxed">
                  Add YouTube loops and local file players. Double click, zoom, and pan across player boards. Controls auto-hide on mouse leave.
                </p>
              </div>
            </div>

            {/* Feature 2 — Atmosphere Control */}
            <div className="rounded-[4px] bg-aether-surface/20 border border-aether-border/10 flex flex-col overflow-hidden hover:border-aether-primary/30 hover:-translate-y-1 transition-all duration-300 group">
              <div className="w-full h-40 overflow-hidden">
                <img src="/feature_atmosphere.png" alt="Atmosphere Control" className="w-full h-full object-cover opacity-80 group-hover:opacity-100 group-hover:scale-105 transition-all duration-500" />
              </div>
              <div className="p-5 flex flex-col gap-2">
                <h3 className="text-sm font-bold text-aether-text uppercase tracking-wider font-sans">
                  Atmosphere Control
                </h3>
                <p className="text-xs text-aether-muted leading-relaxed">
                  Dim background video or wallpaper brightness to make focus tiles pop. Play ambient music playlists directly underneath.
                </p>
              </div>
            </div>

            {/* Feature 3 — Aether Forge */}
            <div className="rounded-[4px] bg-aether-surface/20 border border-aether-border/10 flex flex-col overflow-hidden hover:border-aether-primary/30 hover:-translate-y-1 transition-all duration-300 group">
              <div className="w-full h-40 overflow-hidden">
                <img src="/feature_forge.png" alt="Aether Forge" className="w-full h-full object-cover opacity-80 group-hover:opacity-100 group-hover:scale-105 transition-all duration-500" />
              </div>
              <div className="p-5 flex flex-col gap-2">
                <h3 className="text-sm font-bold text-aether-text uppercase tracking-wider font-sans">
                  Aether Forge
                </h3>
                <p className="text-xs text-aether-muted leading-relaxed">
                  Create workspace themes. Tune primary colors, fonts, border glows, panel roundedness, and grid layouts on the fly.
                </p>
              </div>
            </div>

            {/* Feature 4 — Focus Overlays */}
            <div className="rounded-[4px] bg-aether-surface/20 border border-aether-border/10 flex flex-col overflow-hidden hover:border-aether-primary/30 hover:-translate-y-1 transition-all duration-300 group">
              <div className="w-full h-40 overflow-hidden">
                <img src="/feature_focus.png" alt="Focus Overlays" className="w-full h-full object-cover opacity-80 group-hover:opacity-100 group-hover:scale-105 transition-all duration-500" />
              </div>
              <div className="p-5 flex flex-col gap-2">
                <h3 className="text-sm font-bold text-aether-text uppercase tracking-wider font-sans">
                  Focus Overlays
                </h3>
                <p className="text-xs text-aether-muted leading-relaxed">
                  Stay efficient with a floating Pomodoro overlay, watch duration metrics, and customizable workspace hotkeys.
                </p>
              </div>
            </div>
          </div>
        </section>



        <footer className="py-8 border-t border-aether-border/10 text-center text-[10px] text-aether-muted mt-auto bg-black/20">
          genZtv Platform — Build your workspaces. Launch your canvas.
        </footer>

        {/* ── INTRO MODAL ── */}
        {showIntro && (
          <div
            className="fixed inset-0 z-[999] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
            onClick={() => setShowIntro(false)}
          >
            <div
              className="relative w-full max-w-3xl max-h-[90vh] overflow-y-auto bg-[#0d0d12] border border-white/10 rounded-xl shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="sticky top-0 z-10 bg-[#0d0d12]/95 backdrop-blur-md border-b border-white/8 px-8 py-5 flex items-center justify-between">
                <div>
                  <p className="text-[10px] text-aether-primary uppercase tracking-widest font-bold mb-0.5">Your Complete Guide</p>
                  <h2 className="text-xl font-bold text-aether-text font-serif">Everything genZtv Can Do</h2>
                </div>
                <button
                  onClick={() => setShowIntro(false)}
                  className="w-8 h-8 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center transition-colors border border-white/10"
                >
                  <X className="w-4 h-4 text-aether-muted" />
                </button>
              </div>

              {/* Steps */}
              <div className="px-8 py-6 flex flex-col gap-0">

                {/* Step 1 */}
                <div className="flex gap-5 py-6 border-b border-white/5">
                  <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-red-500/10 border border-red-500/20 flex items-center justify-center">
                    <MonitorPlay className="w-5 h-5 text-red-400" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-[9px] font-bold text-red-400/70 uppercase tracking-widest">Step 01</span>
                    </div>
                    <h3 className="text-sm font-bold text-aether-text mb-1.5">Drop <span className="text-red-400">YouTube Videos</span> onto your Canvas</h3>
                    <p className="text-xs text-aether-muted leading-relaxed">
                      Click <strong className="text-aether-text">+ Add Tile → YouTube Video</strong> and paste any YouTube link. Your video plays inside a draggable, resizable panel. Stack as many as you need — study session? Two videos side by side. Tutorials? Four at once. <strong className="text-aether-text">No limits.</strong>
                    </p>
                  </div>
                </div>

                {/* Step 2 */}
                <div className="flex gap-5 py-6 border-b border-white/5">
                  <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-blue-500/10 border border-blue-500/20 flex items-center justify-center">
                    <FileText className="w-5 h-5 text-blue-400" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-[9px] font-bold text-blue-400/70 uppercase tracking-widest">Step 02</span>
                    </div>
                    <h3 className="text-sm font-bold text-aether-text mb-1.5">Play <span className="text-blue-400">Local Files</span> from your Device</h3>
                    <p className="text-xs text-aether-muted leading-relaxed">
                      Add <strong className="text-aether-text">Local Video or PDF tiles</strong> to play videos stored on your computer — no upload needed. PDFs render inline, perfectly readable alongside your notes. Your files stay <strong className="text-aether-text">100% private</strong> — nothing leaves your device.
                    </p>
                  </div>
                </div>

                {/* Step 3 */}
                <div className="flex gap-5 py-6 border-b border-white/5">
                  <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center">
                    <Music className="w-5 h-5 text-amber-400" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-[9px] font-bold text-amber-400/70 uppercase tracking-widest">Step 03</span>
                    </div>
                    <h3 className="text-sm font-bold text-aether-text mb-1.5">Set a <span className="text-amber-400">Background Atmosphere</span></h3>
                    <p className="text-xs text-aether-muted leading-relaxed">
                      Open the <strong className="text-aether-text">Atmosphere Panel</strong> (cloud icon, bottom-left) to set a background YouTube loop — lo-fi beats, rain sounds, anything. Use the <strong className="text-aether-text">Brightness slider</strong> to dim it so your content tiles pop. The video plays silently behind everything like a wallpaper.
                    </p>
                  </div>
                </div>

                {/* Step 4 */}
                <div className="flex gap-5 py-6 border-b border-white/5">
                  <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
                    <Image className="w-5 h-5 text-emerald-400" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-[9px] font-bold text-emerald-400/70 uppercase tracking-widest">Step 04</span>
                    </div>
                    <h3 className="text-sm font-bold text-aether-text mb-1.5">Use an <span className="text-emerald-400">Image Wallpaper</span> instead</h3>
                    <p className="text-xs text-aether-muted leading-relaxed">
                      Prefer a still background? Switch to <strong className="text-aether-text">Image mode</strong> in the Atmosphere panel and paste a direct image URL or <strong className="text-aether-text">drag-and-drop</strong> a file from your desktop. Brightness control works here too — make it as subtle or bold as you like.
                    </p>
                  </div>
                </div>

                {/* Step 5 */}
                <div className="flex gap-5 py-6 border-b border-white/5">
                  <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-violet-500/10 border border-violet-500/20 flex items-center justify-center">
                    <FileText className="w-5 h-5 text-violet-400" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-[9px] font-bold text-violet-400/70 uppercase tracking-widest">Step 05</span>
                    </div>
                    <h3 className="text-sm font-bold text-aether-text mb-1.5">Take <span className="text-violet-400">Live Notes</span> right on the canvas</h3>
                    <p className="text-xs text-aether-muted leading-relaxed">
                      Add a <strong className="text-aether-text">Note tile</strong> and write in full Markdown — headings, bullet lists, bold, code blocks. Notes auto-save as you type. Position them exactly where you need them — right next to the video you're studying from.
                    </p>
                  </div>
                </div>

                {/* Step 6 */}
                <div className="flex gap-5 py-6 border-b border-white/5">
                  <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center">
                    <Globe className="w-5 h-5 text-cyan-400" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-[9px] font-bold text-cyan-400/70 uppercase tracking-widest">Step 06</span>
                    </div>
                    <h3 className="text-sm font-bold text-aether-text mb-1.5">Embed <span className="text-cyan-400">Websites &amp; Tools</span> as Panels</h3>
                    <p className="text-xs text-aether-muted leading-relaxed">
                      Add a <strong className="text-aether-text">Website tile</strong> and paste any URL — a Google Doc, a Figma file, a live coding sandbox, anything. It embeds as a live interactive frame right inside your workspace. Resize it. Drag it. Done.
                    </p>
                  </div>
                </div>

                {/* Step 7 */}
                <div className="flex gap-5 py-6 border-b border-white/5">
                  <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-pink-500/10 border border-pink-500/20 flex items-center justify-center">
                    <Palette className="w-5 h-5 text-pink-400" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-[9px] font-bold text-pink-400/70 uppercase tracking-widest">Step 07</span>
                    </div>
                    <h3 className="text-sm font-bold text-aether-text mb-1.5">Style Everything with <span className="text-pink-400">Aether Forge</span></h3>
                    <p className="text-xs text-aether-muted leading-relaxed">
                      Hit <kbd className="bg-black/50 px-1.5 py-0.5 rounded border border-white/10 font-bold text-pink-400 text-[10px] font-mono">⌘F</kbd> to open <strong className="text-aether-text">The Forge</strong>. Change the primary color, font, panel border style, tile roundness, and more — all live, no reload. Make it yours.
                    </p>
                  </div>
                </div>

                {/* Step 8 */}
                <div className="flex gap-5 py-6">
                  <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-orange-500/10 border border-orange-500/20 flex items-center justify-center">
                    <Timer className="w-5 h-5 text-orange-400" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-[9px] font-bold text-orange-400/70 uppercase tracking-widest">Step 08</span>
                    </div>
                    <h3 className="text-sm font-bold text-aether-text mb-1.5">Stay in the Zone with <span className="text-orange-400">Focus Tools</span></h3>
                    <p className="text-xs text-aether-muted leading-relaxed">
                      Press <kbd className="bg-black/50 px-1.5 py-0.5 rounded border border-white/10 font-bold text-orange-400 text-[10px] font-mono">⌘P</kbd> for the <strong className="text-aether-text">Pomodoro Timer</strong> overlay — floating, unobtrusive, always visible. Hit <kbd className="bg-black/50 px-1.5 py-0.5 rounded border border-white/10 font-bold text-orange-400 text-[10px] font-mono">F</kbd> to go <strong className="text-aether-text">Fullscreen Focus Mode</strong> — the UI disappears and only your content remains. Press again to exit.
                    </p>
                  </div>
                </div>

              </div>

              {/* Footer CTA */}
              <div className="sticky bottom-0 bg-[#0d0d12]/95 backdrop-blur-md border-t border-white/8 px-8 py-4 flex items-center justify-between">
                <p className="text-[10px] text-aether-muted">Your workspace is saved automatically in your browser.</p>
                <button
                  onClick={() => { setShowIntro(false); handleStartFree(); }}
                  className="px-6 py-2.5 text-xs font-bold rounded-[4px] bg-aether-primary text-white hover:bg-aether-primary-hover transition-all flex items-center gap-2 shadow-lg shadow-aether-primary/20"
                >
                  Let's Go <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  const activeWS = workspaces.find((w) => w.id === activeWorkspaceId);
  void activeWS; // used indirectly via BackgroundAtmosphere reading from store

  // RENDER CANVAS DASHBOARD VIEWPORT
  return (
    <div 
      className={`h-screen w-screen flex flex-col overflow-hidden font-sans select-none text-aether-text relative bg-transparent`}
    >
      {/* Play background media globally under full screen layout */}
      <BackgroundAtmosphere />
      
      {/* Top Header Controls bar */}
      {!isFullscreen && (
        <Header 
          onOpenStats={() => setStatsOpen(true)}
          onOpenPomodoro={() => setPomodoroOpen(true)}
          onOpenForge={() => setForgeOpen(!forgeOpen)}
          onToggleFullscreen={toggleFullscreen}
          isFullscreen={isFullscreen}
        />
      )}

      {/* Main shell: Sidebar + Workspace Stage + Theme Forge */}
      <div className="flex-1 flex min-h-0 relative overflow-hidden">
        
        {/* Left Side Navigation */}
        {!isFullscreen && (
          <Sidebar 
            isOpen={sidebarOpen}
            onToggle={() => setSidebarOpen(!sidebarOpen)}
          />
        )}

        {/* Central Stage Canvas */}
        <Stage />

        {/* Right side Forge Customization panel */}
        {!isFullscreen && forgeOpen && (
          <TheForge onClose={() => setForgeOpen(false)} />
        )}
      </div>

      {/* Floating Exit Fullscreen FAB when in focus mode */}
      {isFullscreen && (
        <button
          onClick={toggleFullscreen}
          className="fixed bottom-4 right-4 z-50 p-2.5 rounded-full bg-black/60 hover:bg-black/85 border border-white/15 text-aether-text hover:text-aether-primary transition-all shadow-lg hover:scale-110 active:scale-95 group flex items-center gap-1.5 cursor-pointer backdrop-blur-sm pointer-events-auto"
          title="Exit Fullscreen Mode (F)"
        >
          <Minimize2 className="w-4 h-4" />
          <span className="text-[10px] uppercase font-bold tracking-wider opacity-0 group-hover:opacity-100 max-w-0 group-hover:max-w-[100px] transition-all duration-300 overflow-hidden whitespace-nowrap">
            Exit Focus
          </span>
        </button>
      )}

      {/* Overlay modals */}
      {statsOpen && (
        <StatsPanel onClose={() => setStatsOpen(false)} />
      )}

      {pomodoroOpen && (
        <PomodoroOverlay onClose={() => setPomodoroOpen(false)} />
      )}

    </div>
  );
}

export default App;
