// components/CustomVideoPlayer.js
"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import Image from "next/image";
import {
  Play,
  Pause,
  Volume2,
  VolumeX,
  Maximize,
  Minimize,
  Settings,
  RotateCcw,
  RotateCw,
} from "lucide-react";

// --- Singleton API Loader ---
let apiPromise = null;
const loadYouTubeAPI = () => {
  if (apiPromise) return apiPromise;

  apiPromise = new Promise((resolve) => {
    if (window.YT && window.YT.Player) {
      resolve(window.YT);
      return;
    }

    const prev = window.onYouTubeIframeAPIReady;
    window.onYouTubeIframeAPIReady = () => {
      if (typeof prev === "function") prev();
      resolve(window.YT);
    };

    const existingScript = document.querySelector('script[src="https://www.youtube.com/iframe_api"]');
    if (!existingScript) {
      const tag = document.createElement("script");
      tag.src = "https://www.youtube.com/iframe_api";
      const firstScriptTag = document.getElementsByTagName("script")[0];
      firstScriptTag?.parentNode?.insertBefore(tag, firstScriptTag);
    }
  });

  return apiPromise;
};

export default function CustomVideoPlayer({ videoId, thumbnail, title }) {
  // --- Refs ---
  const containerRef = useRef(null);
  const playerRef = useRef(null);
  const rafRef = useRef(null);
  const controlsTimeoutRef = useRef(null);
  
  // Interaction Refs
  const lastTapTimeRef = useRef(0);
  const tapTimeoutRef = useRef(null);

  // --- State ---
  const [playerReady, setPlayerReady] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const [volume, setVolume] = useState(100);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showControls, setShowControls] = useState(false);
  const [toast, setToast] = useState({ show: false, text: "", icon: null, side: "center" });

  // --- Helpers ---
  const clamp = (v, min, max) => Math.min(max, Math.max(min, v));

  const formatTime = (time) => {
    if (!time || Number.isNaN(time)) return "0:00";
    const t = Math.max(0, time);
    const minutes = Math.floor(t / 60);
    const seconds = Math.floor(t % 60);
    return `${minutes}:${seconds < 10 ? "0" : ""}${seconds}`;
  };

  const showToast = useCallback((text, icon, side) => {
    setToast({ show: true, text, icon, side });
    setTimeout(() => {
      setToast((prev) => ({ ...prev, show: false }));
    }, 800);
  }, []);

  // --- Controls Visibility Logic ---
  const resetControlsTimeout = useCallback(() => {
    clearTimeout(controlsTimeoutRef.current);
    setShowControls(true);
    if (isPlaying) {
      controlsTimeoutRef.current = setTimeout(() => {
        setShowControls(false);
      }, 3000);
    }
  }, [isPlaying]);

  const toggleControls = useCallback(() => {
    if (showControls) {
      setShowControls(false);
      clearTimeout(controlsTimeoutRef.current);
    } else {
      resetControlsTimeout();
    }
  }, [showControls, resetControlsTimeout]);

  // --- Player Initialization ---
  useEffect(() => {
    let isMounted = true;
    setPlayerReady(false);

    loadYouTubeAPI().then((YT) => {
      if (!isMounted) return;

      // Cleanup existing player if any
      if (playerRef.current) {
        try { playerRef.current.destroy(); } catch (e) {}
      }

      playerRef.current = new YT.Player(`yt-player-${videoId}`, {
        videoId,
        height: "100%",
        width: "100%",
        playerVars: {
          autoplay: 0,
          controls: 0,
          modestbranding: 1,
          rel: 0,
          showinfo: 0,
          iv_load_policy: 3,
          fs: 0,
          playsinline: 1,
          disablekb: 1,
        },
        events: {
          onReady: (event) => {
            if (!isMounted) return;
            setPlayerReady(true);
            
            // Poll for duration
            const durationInterval = setInterval(() => {
              const d = event.target.getDuration();
              if (d > 0) {
                setDuration(d);
                clearInterval(durationInterval);
              }
            }, 500);
          },
          onStateChange: (event) => {
            if (!isMounted) return;
            const playing = event.data === YT.PlayerState.PLAYING;
            setIsPlaying(playing);
            if (playing) resetControlsTimeout();
            else setShowControls(true);
          }
        }
      });
    });

    const handleFullscreenChange = () => setIsFullscreen(!!document.fullscreenElement);
    document.addEventListener("fullscreenchange", handleFullscreenChange);

    return () => {
      isMounted = false;
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      clearTimeout(controlsTimeoutRef.current);
      document.removeEventListener("fullscreenchange", handleFullscreenChange);
      if (playerRef.current) {
        try { playerRef.current.destroy(); } catch (e) {}
      }
    };
  }, [videoId, resetControlsTimeout]);

  // --- Progress Loop ---
  useEffect(() => {
    if (!isPlaying || !playerReady) return;

    const update = () => {
      if (playerRef.current && playerRef.current.getCurrentTime) {
        const curr = playerRef.current.getCurrentTime();
        const dur = duration || playerRef.current.getDuration() || 1;
        setProgress((curr / dur) * 100);
      }
      rafRef.current = requestAnimationFrame(update);
    };

    rafRef.current = requestAnimationFrame(update);
    return () => cancelAnimationFrame(rafRef.current);
  }, [isPlaying, duration, playerReady]);

  // --- Actions ---
  const togglePlay = useCallback((e) => {
    e?.stopPropagation();
    if (!playerRef.current) return;
    if (isPlaying) playerRef.current.pauseVideo();
    else playerRef.current.playVideo();
  }, [isPlaying]);

  const handleSeek = (e) => {
    e.stopPropagation();
    const val = parseFloat(e.target.value);
    const time = (val / 100) * duration;
    if (playerRef.current) {
      playerRef.current.seekTo(time, true);
      setProgress(val);
    }
    resetControlsTimeout();
  };

  const seekRelative = useCallback((seconds) => {
    if (!playerRef.current) return;
    const curr = playerRef.current.getCurrentTime();
    playerRef.current.seekTo(curr + seconds, true);
  }, []);

  const toggleMute = (e) => {
    e.stopPropagation();
    if (!playerRef.current) return;
    if (isMuted) {
      playerRef.current.unMute();
      if (volume === 0) {
        playerRef.current.setVolume(50);
        setVolume(50);
      }
      setIsMuted(false);
    } else {
      playerRef.current.mute();
      setIsMuted(true);
    }
  };

  const toggleFullscreen = (e) => {
    e.stopPropagation();
    if (!document.fullscreenElement) {
      containerRef.current?.requestFullscreen().catch(() => {});
    } else {
      document.exitFullscreen().catch(() => {});
    }
  };

  // --- Unified Gesture Handler (Click-based) ---
  const handleContainerClick = (e) => {
    if (!playerReady) return;

    const now = Date.now();
    const DOUBLE_TAP_DELAY = 300;
    const rect = containerRef.current.getBoundingClientRect();
    
    // Calculate click position relative to video width
    // Support touch events fallback just in case
    const clientX = e.clientX || (e.touches && e.touches[0]?.clientX);
    const x = clientX - rect.left;
    const width = rect.width;
    const clickZone = x / width; // 0.0 to 1.0

    if (now - lastTapTimeRef.current < DOUBLE_TAP_DELAY) {
      // --- DOUBLE TAP DETECTED ---
      clearTimeout(tapTimeoutRef.current);
      lastTapTimeRef.current = 0; // Reset

      if (clickZone < 0.35) {
        seekRelative(-10);
        showToast("-10s", <RotateCcw className="w-6 h-6" />, "left");
      } else if (clickZone > 0.65) {
        seekRelative(10);
        showToast("+10s", <RotateCw className="w-6 h-6" />, "right");
      } else {
        // Center double tap = Play/Pause
        togglePlay();
        showToast(isPlaying ? "Pause" : "Play", isPlaying ? <Pause className="w-6 h-6" /> : <Play className="w-6 h-6" />, "center");
      }
    } else {
      // --- SINGLE TAP (Wait for potential double tap) ---
      lastTapTimeRef.current = now;
      tapTimeoutRef.current = setTimeout(() => {
        // If single tap confirmed:
        // Center zone -> Toggle Play
        // Side zones -> Toggle Controls
        if (clickZone > 0.3 && clickZone < 0.7) {
           togglePlay();
           // Also briefly show controls to give feedback
           resetControlsTimeout();
        } else {
           toggleControls();
        }
      }, DOUBLE_TAP_DELAY);
    }
  };

  return (
    <div
      ref={containerRef}
      className="relative w-full aspect-video bg-black rounded-3xl overflow-hidden shadow-2xl ring-1 ring-white/10 select-none group touch-none"
      onClick={handleContainerClick}
      onMouseMove={() => { if(playerReady) resetControlsTimeout(); }}
      tabIndex={0}
    >
      {/* YouTube Iframe (Non-interactive layer) */}
      <div className="absolute inset-0 pointer-events-none">
        <div id={`yt-player-${videoId}`} className="w-full h-full" />
      </div>

      {/* Loading State */}
      {!playerReady && (
        <div className="absolute inset-0 z-40 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="w-8 h-8 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
        </div>
      )}

      {/* Toast Feedback */}
      {toast.show && (
        <div className={`absolute top-1/2 -translate-y-1/2 z-30 flex flex-col items-center justify-center pointer-events-none animate-in fade-in zoom-in duration-200
          ${toast.side === 'left' ? 'left-1/4' : toast.side === 'right' ? 'right-1/4' : 'left-1/2 -translate-x-1/2'}`}>
          <div className="w-14 h-14 bg-black/60 backdrop-blur-md rounded-full flex items-center justify-center text-white mb-2">
            {toast.icon}
          </div>
          <span className="text-white font-bold text-sm shadow-lg">{toast.text}</span>
        </div>
      )}

      {/* Controls Overlay */}
      <div className={`absolute inset-0 flex flex-col justify-between z-20 transition-opacity duration-300 ${showControls ? 'opacity-100' : 'opacity-0'} pointer-events-none`}>
        
        {/* Top Bar */}
        <div className="p-4 flex justify-end">
          <div className="bg-black/40 backdrop-blur-md px-3 py-1 rounded-full border border-white/10 flex items-center gap-2 pointer-events-auto">
            <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
            <Image src="/images/logo-symbol.webp" alt="Logo" width={16} height={16} className="w-4 h-4 opacity-90" />
          </div>
        </div>

        {/* Center Play Button Visual */}
        <div className="absolute inset-0 flex items-center justify-center">
          {!isPlaying && (
            <div className="w-16 h-16 bg-brand-gold/90 backdrop-blur-md rounded-full flex items-center justify-center text-white shadow-xl scale-100 hover:scale-110 transition-transform">
              <Play className="w-6 h-6 fill-current ml-1" />
            </div>
          )}
        </div>

        {/* Bottom Control Bar */}
        <div 
          className="bg-gradient-to-t from-black/90 via-black/60 to-transparent px-4 pb-4 pt-12 pointer-events-auto"
          onClick={(e) => e.stopPropagation()} // Prevent closing on control clicks
        >
          {/* Progress Bar */}
          <div className="relative h-6 flex items-center group/progress cursor-pointer">
            <div className="absolute inset-0 flex items-center">
               <div className="relative w-full h-1.5 bg-white/20 rounded-full overflow-hidden">
                 <div 
                   className="absolute left-0 top-0 bottom-0 bg-brand-gold transition-all duration-100 ease-linear"
                   style={{ width: `${clamp(progress, 0, 100)}%` }}
                 />
               </div>
            </div>
            {/* Hit Area */}
            <input 
              type="range"
              min="0"
              max="100"
              step="0.1"
              value={clamp(progress, 0, 100)}
              onChange={handleSeek}
              className="absolute inset-0 w-full h-full opacity-0 z-10 cursor-pointer"
            />
            {/* Knob Visual */}
            <div 
              className="absolute h-4 w-4 bg-white rounded-full shadow-lg pointer-events-none transition-all duration-100 ease-linear group-hover/progress:scale-110"
              style={{ left: `${clamp(progress, 0, 100)}%`, transform: 'translateX(-50%)' }}
            />
          </div>

          {/* Buttons Row */}
          <div className="flex items-center justify-between mt-1">
            <div className="flex items-center gap-4">
              <button onClick={togglePlay} className="text-white hover:text-brand-gold transition-colors p-2 -ml-2 rounded-full hover:bg-white/10">
                {isPlaying ? <Pause className="w-6 h-6 fill-current" /> : <Play className="w-6 h-6 fill-current" />}
              </button>

              <div className="flex items-center gap-2 group/vol">
                <button onClick={toggleMute} className="text-white hover:text-brand-gold p-2 rounded-full hover:bg-white/10">
                  {isMuted || volume === 0 ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
                </button>
                <div className="w-0 overflow-hidden md:group-hover/vol:w-20 transition-all duration-300">
                  <input 
                    type="range"
                    min="0"
                    max="100"
                    value={isMuted ? 0 : volume}
                    onChange={(e) => {
                      const v = parseInt(e.target.value);
                      setVolume(v);
                      playerRef.current?.setVolume(v);
                      setIsMuted(v === 0);
                    }}
                    className="h-1 w-20 bg-white/30 rounded-lg appearance-none cursor-pointer"
                  />
                </div>
              </div>

              <span className="text-xs font-mono font-bold text-white/80">
                {formatTime((progress / 100) * duration)} / {formatTime(duration)}
              </span>
            </div>

            <div className="flex items-center gap-1">
              <button className="text-white/70 hover:text-white p-2 rounded-full hover:bg-white/10">
                <Settings className="w-5 h-5" />
              </button>
              <button onClick={toggleFullscreen} className="text-white hover:text-brand-gold p-2 rounded-full hover:bg-white/10">
                {isFullscreen ? <Minimize className="w-5 h-5" /> : <Maximize className="w-5 h-5" />}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}