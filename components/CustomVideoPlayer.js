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

// --- Singleton API Loader (safer: does not clobber existing ready handlers) ---
let apiPromise = null;
const loadYouTubeAPI = () => {
  if (apiPromise) return apiPromise;

  apiPromise = new Promise((resolve) => {
    if (window.YT && window.YT.Player) {
      resolve(window.YT);
      return;
    }

    // Chain any existing handler instead of overwriting
    const prev = window.onYouTubeIframeAPIReady;
    window.onYouTubeIframeAPIReady = () => {
      if (typeof prev === "function") prev();
      resolve(window.YT);
    };

    // Avoid inserting script multiple times
    const already = document.querySelector('script[src="https://www.youtube.com/iframe_api"]');
    if (!already) {
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

  // Tap / gesture refs
  const tapTimerRef = useRef(null);
  const lastTapAtRef = useRef(0);
  const lastTapXRef = useRef(0);

  // Toast timer
  const toastTimerRef = useRef(null);

  // --- State ---
  const [playerReady, setPlayerReady] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);

  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);

  const [isMuted, setIsMuted] = useState(false);
  const [volume, setVolume] = useState(100);

  const [isFullscreen, setIsFullscreen] = useState(false);

  // Default hidden, tap to show
  const [showControls, setShowControls] = useState(false);

  const [toast, setToast] = useState({ show: false, text: "", icon: null, side: "center" });

  // --- Helpers ---
  const clamp = (v, min, max) => Math.min(max, Math.max(min, v));

  const safePlayer = () => {
    const p = playerRef.current;
    if (!p || !playerReady) return null;
    return p;
  };

  const formatTime = (time) => {
    if (!time || Number.isNaN(time)) return "0:00";
    const t = Math.max(0, time);
    const minutes = Math.floor(t / 60);
    const seconds = Math.floor(t % 60);
    return `${minutes}:${seconds < 10 ? "0" : ""}${seconds}`;
  };

  const showToast = useCallback((text, icon, side) => {
    setToast({ show: true, text, icon, side });
    clearTimeout(toastTimerRef.current);
    toastTimerRef.current = setTimeout(() => {
      setToast((prev) => ({ ...prev, show: false }));
    }, 700);
  }, []);

  // --- Controls timeout ---
  const resetControlsTimeout = useCallback(
    (forceShow = true) => {
      clearTimeout(controlsTimeoutRef.current);
      if (forceShow) setShowControls(true);

      // Only auto-hide while playing
      if (isPlaying) {
        controlsTimeoutRef.current = setTimeout(() => setShowControls(false), 2500);
      }
    },
    [isPlaying]
  );

  const hideControls = useCallback(() => {
    clearTimeout(controlsTimeoutRef.current);
    setShowControls(false);
  }, []);

  // --- Player init & cleanup ---
  useEffect(() => {
    let isMounted = true;

    setPlayerReady(false);
    setIsPlaying(false);
    setProgress(0);
    setDuration(0);

    loadYouTubeAPI().then((YT) => {
      if (!isMounted) return;

      // Destroy existing
      if (playerRef.current && typeof playerRef.current.destroy === "function") {
        try {
          playerRef.current.destroy();
        } catch {}
      }

      // Ensure target exists (Next renders fast)
      const mountId = `yt-player-${videoId}`;
      const mountEl = document.getElementById(mountId);
      if (!mountEl) return;

      playerRef.current = new YT.Player(mountId, {
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
          // Hint: these help but do not guarantee removing overlays
          disablekb: 1,
        },
        events: {
          onReady: (event) => {
            if (!isMounted) return;
            setPlayerReady(true);

            // Duration can be 0 initially, poll briefly
            let tries = 0;
            const durTimer = setInterval(() => {
              tries += 1;
              try {
                const d = event.target.getDuration?.() || 0;
                if (d > 0) {
                  setDuration(d);
                  clearInterval(durTimer);
                }
                if (tries >= 12) clearInterval(durTimer);
              } catch {
                if (tries >= 12) clearInterval(durTimer);
              }
            }, 250);
          },
          onStateChange: (event) => {
            if (!isMounted) return;
            const playing = event.data === YT.PlayerState.PLAYING;
            setIsPlaying(playing);

            // Keep controls visible when paused, auto-hide when playing
            if (playing) resetControlsTimeout(true);
            else setShowControls(true);
          },
        },
      });
    });

    // Fullscreen sync
    const handleFullscreenChange = () => setIsFullscreen(!!document.fullscreenElement);
    document.addEventListener("fullscreenchange", handleFullscreenChange);

    return () => {
      isMounted = false;

      clearTimeout(controlsTimeoutRef.current);
      clearTimeout(tapTimerRef.current);
      clearTimeout(toastTimerRef.current);

      if (rafRef.current) cancelAnimationFrame(rafRef.current);

      document.removeEventListener("fullscreenchange", handleFullscreenChange);

      if (playerRef.current && typeof playerRef.current.destroy === "function") {
        try {
          playerRef.current.destroy();
        } catch {}
      }
      playerRef.current = null;
    };
  }, [videoId, resetControlsTimeout]);

  // --- Progress loop (RAF, throttled by browser) ---
  useEffect(() => {
    if (!isPlaying) {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
      return;
    }

    const tick = () => {
      const p = safePlayer();
      if (p?.getCurrentTime) {
        const currentTime = p.getCurrentTime() || 0;
        const d = duration || p.getDuration?.() || 1;
        const pct = clamp((currentTime / d) * 100, 0, 100);
        setProgress(pct);
      }
      rafRef.current = requestAnimationFrame(tick);
    };

    rafRef.current = requestAnimationFrame(tick);
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    };
  }, [isPlaying, duration, playerReady]);

  // --- Core actions (guarded) ---
  const togglePlay = useCallback(
    (e) => {
      e?.stopPropagation?.();
      const p = safePlayer();
      if (!p) return;

      try {
        if (isPlaying) p.pauseVideo();
        else p.playVideo();
      } catch {}
    },
    [isPlaying, playerReady]
  );

  const seekToPercent = useCallback(
    (pct) => {
      const p = safePlayer();
      if (!p) return;

      const d = duration || p.getDuration?.() || 0;
      if (!d) return;

      const newTime = (clamp(pct, 0, 100) / 100) * d;
      try {
        p.seekTo(newTime, true);
        setProgress(clamp(pct, 0, 100));
      } catch {}
    },
    [duration, playerReady]
  );

  const seekRelative = useCallback(
    (seconds) => {
      const p = safePlayer();
      if (!p) return;

      const d = duration || p.getDuration?.() || 0;
      if (!d) return;

      try {
        const current = p.getCurrentTime?.() || 0;
        const next = clamp(current + seconds, 0, d - 0.1);
        p.seekTo(next, true);
      } catch {}
    },
    [duration, playerReady]
  );

  const toggleMute = useCallback(
    (e) => {
      e?.stopPropagation?.();
      const p = safePlayer();
      if (!p) return;

      try {
        if (isMuted) {
          p.unMute();
          // Restore volume if needed
          if (volume === 0) {
            p.setVolume(50);
            setVolume(50);
          }
          setIsMuted(false);
        } else {
          p.mute();
          setIsMuted(true);
        }
      } catch {}
    },
    [isMuted, volume, playerReady]
  );

  const handleVolumeChange = useCallback(
    (e) => {
      e.stopPropagation();
      const p = safePlayer();
      if (!p) return;

      const newVol = clamp(parseInt(e.target.value, 10) || 0, 0, 100);
      setVolume(newVol);

      try {
        p.setVolume(newVol);
        if (newVol === 0) {
          p.mute();
          setIsMuted(true);
        } else {
          p.unMute();
          setIsMuted(false);
        }
      } catch {}
    },
    [playerReady]
  );

  const toggleFullscreen = useCallback((e) => {
    e?.stopPropagation?.();
    const el = containerRef.current;
    if (!el) return;

    if (!document.fullscreenElement) {
      el.requestFullscreen?.().catch(() => {});
    } else {
      document.exitFullscreen?.().catch(() => {});
    }
  }, []);

  // --- Seek bar (no layout shifts, stable on mobile) ---
  const handleSeek = (e) => {
    const val = parseFloat(e.target.value);
    seekToPercent(val);
    resetControlsTimeout(true);
  };

  // --- Gesture handling (Pointer based, single vs double tap correctly) ---
  const getClientX = (ev) => {
    // PointerEvent has clientX, fallback for safety
    if (typeof ev.clientX === "number") return ev.clientX;
    if (ev.touches && ev.touches[0]) return ev.touches[0].clientX;
    if (ev.changedTouches && ev.changedTouches[0]) return ev.changedTouches[0].clientX;
    return 0;
  };

  const handleGesturePointerUp = (e) => {
    // If player not ready, just show controls and do nothing else (prevents "stress")
    if (!playerReady) {
      setShowControls(true);
      return;
    }

    const rect = containerRef.current?.getBoundingClientRect?.();
    if (!rect) return;

    const x = getClientX(e) - rect.left;
    const width = rect.width || 1;

    const now = Date.now();
    const DOUBLE_MS = 280;

    const isSecondTap = now - lastTapAtRef.current < DOUBLE_MS;
    const prevX = lastTapXRef.current;

    clearTimeout(tapTimerRef.current);

    if (isSecondTap) {
      // Confirmed double tap
      lastTapAtRef.current = 0;
      lastTapXRef.current = 0;

      // Determine side based on current tap position
      if (x < width * 0.35) {
        seekRelative(-10);
        showToast("-10s", <RotateCcw className="w-6 h-6" />, "left");
      } else if (x > width * 0.65) {
        seekRelative(10);
        showToast("+10s", <RotateCw className="w-6 h-6" />, "right");
      } else {
        togglePlay();
        showToast(isPlaying ? "Pause" : "Play", isPlaying ? <Pause className="w-6 h-6" /> : <Play className="w-6 h-6" />, "center");
      }

      resetControlsTimeout(true);
      return;
    }

    // First tap, wait briefly to see if it becomes a double tap
    lastTapAtRef.current = now;
    lastTapXRef.current = x;

    tapTimerRef.current = setTimeout(() => {
      // Single tap action
      // Rule:
      // - If tap is in the middle zone, toggle play/pause.
      // - Else toggle controls.
      const middle = x >= width * 0.25 && x <= width * 0.75;

      if (middle) {
        togglePlay();
        resetControlsTimeout(true);
      } else {
        setShowControls((prev) => {
          const next = !prev;
          if (next) resetControlsTimeout(false);
          else hideControls();
          return next;
        });
      }

      // Clear last tap markers
      lastTapAtRef.current = 0;
      lastTapXRef.current = 0;
    }, DOUBLE_MS);
  };

  return (
    <div
      ref={containerRef}
      className="relative w-full aspect-video bg-black rounded-3xl overflow-hidden shadow-2xl ring-1 ring-white/10 select-none"
      onKeyDown={(e) => {
        if (e.key === " " || e.key === "Enter") {
          e.preventDefault();
          togglePlay();
        }
      }}
      tabIndex={0}
      aria-label="Custom video player"
    >
      {/* Iframe mount (kept non-interactive, our gesture layer handles everything) */}
      <div className="absolute inset-0 pointer-events-none">
        <div id={`yt-player-${videoId}`} className="w-full h-full" />
      </div>

      {/* Gesture layer */}
      <div
        className="absolute inset-0 z-10"
        onPointerUp={handleGesturePointerUp}
        onMouseMove={() => resetControlsTimeout(true)}
        // Prevent text selection / long-press menus
        onContextMenu={(e) => e.preventDefault()}
        role="button"
        aria-label="Video gesture layer"
      />

      {/* Toast */}
      {toast.show && (
        <div
          className={[
            "absolute top-1/2 -translate-y-1/2 z-30 flex flex-col items-center justify-center pointer-events-none",
            "animate-in fade-in zoom-in duration-200",
            toast.side === "left"
              ? "left-1/4"
              : toast.side === "right"
              ? "right-1/4"
              : "left-1/2 -translate-x-1/2",
          ].join(" ")}
        >
          <div className="w-12 h-12 bg-black/60 backdrop-blur-md rounded-full flex items-center justify-center text-white mb-2 ring-1 ring-white/10">
            {toast.icon}
          </div>
          <span className="text-white font-bold text-sm drop-shadow-md">{toast.text}</span>
        </div>
      )}

      {/* Controls overlay */}
      <div
        className={[
          "absolute inset-0 flex flex-col justify-between z-20 transition-opacity duration-250",
          showControls ? "opacity-100" : "opacity-0",
          "pointer-events-none",
        ].join(" ")}
      >
        {/* Top: minimal branding */}
        <div className="p-4 flex justify-end">
          <div className="bg-black/30 backdrop-blur-md px-3 py-1 rounded-full border border-white/10 flex items-center gap-2">
            <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
            <Image
              src="/images/logo-symbol.webp"
              alt="Logo"
              width={16}
              height={16}
              className="w-4 h-4 opacity-90"
            />
          </div>
        </div>

        {/* Center play button (visual only, taps handled by gesture layer) */}
        <div className="absolute inset-0 flex items-center justify-center">
          {!isPlaying && (
            <div className="w-16 h-16 bg-brand-gold/90 backdrop-blur-md rounded-full flex items-center justify-center text-white shadow-xl ring-1 ring-white/10">
              <Play className="w-6 h-6 fill-current ml-1" />
            </div>
          )}
        </div>

        {/* Bottom bar */}
        <div className="bg-gradient-to-t from-black/90 via-black/55 to-transparent px-4 pb-4 pt-12 pointer-events-auto">
          {/* Progress bar (stable height, no hover resize) */}
          <div className="relative h-2 bg-white/20 rounded-full mb-3">
            <div
              className="absolute left-0 top-0 bottom-0 bg-brand-gold rounded-full"
              style={{ width: `${clamp(progress, 0, 100)}%` }}
            />
            <input
              type="range"
              min="0"
              max="100"
              step="0.1"
              value={clamp(progress, 0, 100)}
              onChange={handleSeek}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              aria-label="Seek video"
            />
            {/* Knob (subtle, no hover dependency) */}
            <div
              className="absolute top-1/2 -translate-y-1/2 w-3 h-3 bg-white rounded-full shadow ring-1 ring-black/20"
              style={{ left: `calc(${clamp(progress, 0, 100)}% - 6px)` }}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={togglePlay}
                className="text-white hover:text-brand-gold transition-colors focus:outline-none"
                aria-label={isPlaying ? "Pause" : "Play"}
              >
                {isPlaying ? (
                  <Pause className="w-6 h-6 fill-current" />
                ) : (
                  <Play className="w-6 h-6 fill-current" />
                )}
              </button>

              {/* Volume */}
              <div className="flex items-center gap-2 group/vol">
                <button
                  onClick={toggleMute}
                  className="text-white hover:text-brand-gold focus:outline-none"
                  aria-label={isMuted ? "Unmute" : "Mute"}
                >
                  {isMuted || volume === 0 ? (
                    <VolumeX className="w-5 h-5" />
                  ) : (
                    <Volume2 className="w-5 h-5" />
                  )}
                </button>

                {/* Desktop-only slider */}
                <div className="hidden md:block w-20">
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={isMuted ? 0 : volume}
                    onChange={handleVolumeChange}
                    className="h-1 w-20 bg-white/30 rounded-lg appearance-none cursor-pointer"
                    aria-label="Volume"
                  />
                </div>
              </div>

              <span className="text-xs font-mono font-bold text-white/80 select-none">
                {formatTime((clamp(progress, 0, 100) / 100) * (duration || 0))} / {formatTime(duration)}
              </span>
            </div>

            <div className="flex items-center gap-3">
              <button className="text-white/70 hover:text-white" aria-label="Settings" onClick={(e) => e.stopPropagation()}>
                <Settings className="w-5 h-5" />
              </button>
              <button
                onClick={toggleFullscreen}
                className="text-white hover:text-brand-gold"
                aria-label="Toggle Fullscreen"
              >
                {isFullscreen ? <Minimize className="w-5 h-5" /> : <Maximize className="w-5 h-5" />}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Optional: subtle pre-ready hint (prevents "tap stress") */}
      {!playerReady && (
        <div className="absolute inset-0 z-40 flex items-center justify-center bg-black/30 backdrop-blur-[2px]">
          <div className="px-4 py-2 rounded-full bg-black/50 border border-white/10 text-white/80 text-xs font-bold tracking-wider">
            Loading player...
          </div>
        </div>
      )}
    </div>
  );
}