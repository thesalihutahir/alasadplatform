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

// --- 1. Singleton API Loader ---
// Ensures the YouTube API script is loaded exactly once and handles race conditions.
let apiPromise = null;
const loadYouTubeAPI = () => {
  if (apiPromise) return apiPromise;

  apiPromise = new Promise((resolve) => {
    if (window.YT && window.YT.Player) {
      resolve(window.YT);
      return;
    }

    // Capture existing callback if any
    const existingCallback = window.onYouTubeIframeAPIReady;
    window.onYouTubeIframeAPIReady = () => {
      if (existingCallback) existingCallback();
      resolve(window.YT);
    };

    // Inject script if missing
    if (!document.querySelector('script[src="https://www.youtube.com/iframe_api"]')) {
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
  
  // Interaction Refs
  const controlsTimeoutRef = useRef(null);
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
  const clamp = (val, min, max) => Math.min(Math.max(val, min), max);

  const formatTime = (seconds) => {
    if (!seconds || isNaN(seconds)) return "0:00";
    const m = Math.floor(seconds / 60);
    const s = Math.floor(seconds % 60);
    return `${m}:${s < 10 ? "0" : ""}${s}`;
  };

  const showToast = (text, icon, side) => {
    setToast({ show: true, text, icon, side });
    setTimeout(() => setToast((prev) => ({ ...prev, show: false })), 800);
  };

  // --- Logic: Controls Visibility ---
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

  // --- Logic: Player Lifecycle ---
  useEffect(() => {
    let isMounted = true;
    setPlayerReady(false);

    loadYouTubeAPI().then((YT) => {
      if (!isMounted) return;

      // Clean up previous instance if needed
      if (playerRef.current) {
        try { playerRef.current.destroy(); } catch (e) {}
      }

      playerRef.current = new YT.Player(`yt-player-${videoId}`, {
        videoId,
        width: "100%",
        height: "100%",
        playerVars: {
          autoplay: 0,
          controls: 0, // Hide native controls
          modestbranding: 1,
          rel: 0,
          showinfo: 0,
          iv_load_policy: 3,
          fs: 0,
          playsinline: 1, // Crucial for mobile
          disablekb: 1,
        },
        events: {
          onReady: (event) => {
            if (!isMounted) return;
            setPlayerReady(true);
            
            // Poll for duration (YT often returns 0 initially)
            const dInterval = setInterval(() => {
              const d = event.target.getDuration();
              if (d > 0) {
                setDuration(d);
                clearInterval(dInterval);
              }
            }, 500);
          },
          onStateChange: (event) => {
            if (!isMounted) return;
            const playing = event.data === YT.PlayerState.PLAYING;
            setIsPlaying(playing);
            if (playing) resetControlsTimeout();
            else setShowControls(true);
          },
        },
      });
    });

    const handleFullscreenChange = () => setIsFullscreen(!!document.fullscreenElement);
    document.addEventListener("fullscreenchange", handleFullscreenChange);

    return () => {
      isMounted = false;
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      clearTimeout(controlsTimeoutRef.current);
      clearTimeout(tapTimeoutRef.current);
      document.removeEventListener("fullscreenchange", handleFullscreenChange);
      if (playerRef.current) {
        try { playerRef.current.destroy(); } catch (e) {}
      }
    };
  }, [videoId, resetControlsTimeout]);

  // --- Logic: Progress Loop ---
  useEffect(() => {
    if (!isPlaying || !playerReady) return;

    const loop = () => {
      if (playerRef.current && playerRef.current.getCurrentTime) {
        const curr = playerRef.current.getCurrentTime();
        const dur = duration || playerRef.current.getDuration() || 1;
        setProgress((curr / dur) * 100);
      }
      rafRef.current = requestAnimationFrame(loop);
    };

    rafRef.current = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(rafRef.current);
  }, [isPlaying, duration, playerReady]);

  // --- Actions ---
  const togglePlay = (e) => {
    e?.stopPropagation();
    if (!playerRef.current) return;
    if (isPlaying) playerRef.current.pauseVideo();
    else playerRef.current.playVideo();
  };

  const handleSeek = (e) => {
    e.stopPropagation(); // Stop bubbling to gesture layer
    const val = parseFloat(e.target.value);
    const time = (val / 100) * duration;
    if (playerRef.current) {
      playerRef.current.seekTo(time, true);
      setProgress(val);
    }
    resetControlsTimeout();
  };

  const seekRelative = (seconds) => {
    if (!playerRef.current) return;
    const curr = playerRef.current.getCurrentTime();
    playerRef.current.seekTo(curr + seconds, true);
  };

  const toggleMute = (e) => {
    e.stopPropagation();
    if (!playerRef.current) return;
    if (isMuted) {
      playerRef.current.unMute();
      // Ensure volume is audible when unmuting
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

  const handleVolumeChange = (e) => {
    e.stopPropagation();
    const val = parseInt(e.target.value);
    setVolume(val);
    if (playerRef.current) {
      playerRef.current.setVolume(val);
      if (val === 0) {
        playerRef.current.mute();
        setIsMuted(true);
      } else if (isMuted) {
        playerRef.current.unMute();
        setIsMuted(false);
      }
    }
  };

  const toggleFullscreen = (e) => {
    e.stopPropagation();
    if (!containerRef.current) return;
    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen().catch((err) => console.log(err));
    } else {
      document.exitFullscreen().catch((err) => console.log(err));
    }
  };

  // --- Gesture Handler (The Fix for Mobile) ---
  const handleGestureClick = (e) => {
    // If player isn't ready, just try to show controls/loading state
    if (!playerReady) return;

    // Get click X position relative to container width
    const rect = containerRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const width = rect.width;
    const percentage = x / width;

    const now = Date.now();
    const DOUBLE_TAP_DELAY = 300;
    
    if (now - lastTapTimeRef.current < DOUBLE_TAP_DELAY) {
      // === DOUBLE TAP ===
      clearTimeout(tapTimeoutRef.current);
      lastTapTimeRef.current = 0; // Reset

      if (percentage < 0.35) {
        // Left 35%: Rewind
        seekRelative(-10);
        showToast("-10s", <RotateCcw className="w-5 h-5" />, "left");
      } else if (percentage > 0.65) {
        // Right 35%: Forward
        seekRelative(10);
        showToast("+10s", <RotateCw className="w-5 h-5" />, "right");
      } else {
        // Center 30%: Toggle Play (Force)
        togglePlay();
        showToast(isPlaying ? "Pause" : "Play", isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />, "center");
      }
      resetControlsTimeout();
    } else {
      // === SINGLE TAP ===
      lastTapTimeRef.current = now;
      
      // Wait to see if it becomes a double tap
      tapTimeoutRef.current = setTimeout(() => {
        if (percentage > 0.35 && percentage < 0.65) {
            // Center tap: Toggle Play
            togglePlay();
            resetControlsTimeout();
        } else {
            // Side tap: Toggle Controls Visibility
            toggleControls();
        }
      }, DOUBLE_TAP_DELAY);
    }
  };

  return (
    <div
      ref={containerRef}
      className="relative w-full aspect-video bg-black rounded-3xl overflow-hidden shadow-2xl ring-1 ring-white/10 select-none group touch-none" // touch-none prevents scrolling on mobile
      onKeyDown={(e) => {
        if (e.key === " " || e.key === "Enter") {
          e.preventDefault();
          togglePlay();
        }
      }}
      tabIndex={0}
      aria-label="Video Player"
      onMouseMove={() => playerReady && resetControlsTimeout()} // Desktop: wake on mouse move
    >
      {/* 1. YouTube Iframe (Background) */}
      <div className="absolute inset-0 pointer-events-none">
        <div id={`yt-player-${videoId}`} className="w-full h-full" />
      </div>

      {/* 2. Loading Spinner */}
      {!playerReady && (
        <div className="absolute inset-0 z-0 flex items-center justify-center bg-black/20">
          <div className="w-10 h-10 border-4 border-white/20 border-t-white rounded-full animate-spin" />
        </div>
      )}

      {/* 3. Gesture Layer (Captures Taps) */}
      <div 
        className="absolute inset-0 z-10 cursor-pointer"
        onClick={handleGestureClick}
      />

      {/* 4. Visual Toast Feedback */}
      {toast.show && (
        <div className={`absolute top-1/2 -translate-y-1/2 z-40 flex flex-col items-center justify-center pointer-events-none animate-in fade-in zoom-in duration-200
          ${toast.side === 'left' ? 'left-1/4' : toast.side === 'right' ? 'right-1/4' : 'left-1/2 -translate-x-1/2'}`}>
          <div className="w-12 h-12 bg-black/60 backdrop-blur-md rounded-full flex items-center justify-center text-white mb-2 ring-1 ring-white/20">
            {toast.icon}
          </div>
          <span className="text-white font-bold text-xs shadow-black drop-shadow-md">{toast.text}</span>
        </div>
      )}

      {/* 5. Controls UI Layer */}
      <div className={`absolute inset-0 flex flex-col justify-between z-20 pointer-events-none transition-opacity duration-300 ${showControls ? 'opacity-100' : 'opacity-0'}`}>
        
        {/* Top Bar (Branding) */}
        <div className="p-4 flex justify-end">
          <div className="bg-black/40 backdrop-blur-md px-3 py-1 rounded-full border border-white/10 flex items-center gap-2 pointer-events-auto">
            <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
            <Image src="/images/logo-symbol.webp" alt="Logo" width={16} height={16} className="w-4 h-4 opacity-90" />
          </div>
        </div>

        {/* Center Play Button (Visual Only) */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          {!isPlaying && (
            <div className="w-16 h-16 bg-brand-gold/90 backdrop-blur-md rounded-full flex items-center justify-center text-white shadow-xl scale-100">
              <Play className="w-6 h-6 fill-current ml-1" />
            </div>
          )}
        </div>

        {/* Bottom Bar */}
        <div className="bg-gradient-to-t from-black/90 via-black/50 to-transparent px-4 pb-4 pt-12 pointer-events-auto" onClick={(e) => e.stopPropagation()}>
          
          {/* Progress Bar */}
          <div className="relative h-6 flex items-center group/progress cursor-pointer">
            <div className="absolute inset-0 flex items-center">
               <div className="relative w-full h-1 bg-white/20 rounded-full overflow-hidden">
                 <div 
                   className="absolute left-0 top-0 bottom-0 bg-brand-gold transition-all duration-100 ease-linear"
                   style={{ width: `${clamp(progress, 0, 100)}%` }}
                 />
               </div>
            </div>
            {/* Input range for dragging */}
            <input 
              type="range"
              min="0"
              max="100"
              step="0.1"
              value={clamp(progress, 0, 100)}
              onChange={handleSeek}
              className="absolute inset-0 w-full h-full opacity-0 z-10 cursor-pointer"
            />
            {/* Knob (Visible) */}
            <div 
              className="absolute h-3 w-3 bg-white rounded-full shadow-lg pointer-events-none transition-all duration-100 ease-linear group-hover/progress:scale-125"
              style={{ left: `${clamp(progress, 0, 100)}%`, transform: 'translateX(-50%)' }}
            />
          </div>

          <div className="flex items-center justify-between mt-1">
            <div className="flex items-center gap-4">
              <button 
                onClick={togglePlay} 
                className="text-white hover:text-brand-gold transition-colors p-2 -ml-2 rounded-full hover:bg-white/10"
              >
                {isPlaying ? <Pause className="w-5 h-5 fill-current" /> : <Play className="w-5 h-5 fill-current" />}
              </button>

              <div className="flex items-center gap-2 group/vol">
                <button onClick={toggleMute} className="text-white hover:text-brand-gold p-2 rounded-full hover:bg-white/10">
                  {isMuted || volume === 0 ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
                </button>
                {/* Volume Slider (Desktop Only) */}
                <div className="w-0 overflow-hidden md:group-hover/vol:w-20 transition-all duration-300">
                  <input 
                    type="range"
                    min="0"
                    max="100"
                    value={isMuted ? 0 : volume}
                    onChange={handleVolumeChange}
                    className="h-1 w-20 bg-white/30 rounded-lg appearance-none cursor-pointer"
                  />
                </div>
              </div>

              <span className="text-xs font-mono font-bold text-white/80 select-none">
                {formatTime((clamp(progress, 0, 100) / 100) * duration)} / {formatTime(duration)}
              </span>
            </div>

            <div className="flex items-center gap-2">
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