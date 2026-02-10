// components/CustomVideoPlayer.js

"use client";

import React, { useState, useEffect, useRef, useCallback } from 'react';
import Image from 'next/image';
import { 
    Play, Pause, Volume2, VolumeX, Maximize, Minimize, 
    Settings, RotateCcw, RotateCw 
} from 'lucide-react';

// --- Singleton API Loader ---
// Prevents race conditions or overwriting window.onYouTubeIframeAPIReady
let apiPromise = null;
const loadYouTubeAPI = () => {
    if (apiPromise) return apiPromise;
    apiPromise = new Promise((resolve) => {
        if (window.YT && window.YT.Player) {
            resolve(window.YT);
            return;
        }
        window.onYouTubeIframeAPIReady = () => resolve(window.YT);
        const tag = document.createElement('script');
        tag.src = "https://www.youtube.com/iframe_api";
        const firstScriptTag = document.getElementsByTagName('script')[0];
        firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);
    });
    return apiPromise;
};

export default function CustomVideoPlayer({ videoId, thumbnail, title }) {
    // --- Refs ---
    const containerRef = useRef(null);
    const playerRef = useRef(null); // The YT Player instance
    const progressInterval = useRef(null);
    const lastTapRef = useRef(0);
    const controlsTimeoutRef = useRef(null);

    // --- State ---
    const [isPlaying, setIsPlaying] = useState(false);
    const [progress, setProgress] = useState(0);
    const [duration, setDuration] = useState(0);
    const [isMuted, setIsMuted] = useState(false);
    const [volume, setVolume] = useState(100);
    const [isFullscreen, setIsFullscreen] = useState(false);
    const [showControls, setShowControls] = useState(false); // Default hidden, tap to show
    const [toast, setToast] = useState({ show: false, text: '', icon: null, side: 'center' });

    // --- 1. Initialization & Cleanup ---
    useEffect(() => {
        let isMounted = true;

        loadYouTubeAPI().then((YT) => {
            if (!isMounted) return;

            // Destroy existing if re-initializing
            if (playerRef.current) {
                playerRef.current.destroy();
            }

            playerRef.current = new YT.Player(`yt-player-${videoId}`, {
                videoId: videoId,
                height: '100%',
                width: '100%',
                playerVars: {
                    autoplay: 0,
                    controls: 0, // No native controls
                    modestbranding: 1,
                    rel: 0,
                    showinfo: 0,
                    iv_load_policy: 3,
                    fs: 0,
                    playsinline: 1 // iOS plays inline
                },
                events: {
                    onReady: (event) => {
                        // Poll for duration as it might be 0 initially
                        const durationInterval = setInterval(() => {
                            const d = event.target.getDuration();
                            if (d > 0) {
                                setDuration(d);
                                clearInterval(durationInterval);
                            }
                        }, 500);
                    },
                    onStateChange: (event) => {
                        const playing = event.data === YT.PlayerState.PLAYING;
                        setIsPlaying(playing);
                        
                        // Auto-hide controls when playing starts
                        if (playing) {
                            resetControlsTimeout();
                        }
                    }
                }
            });
        });

        // Document Fullscreen Sync
        const handleFullscreenChange = () => {
            setIsFullscreen(!!document.fullscreenElement);
        };
        document.addEventListener('fullscreenchange', handleFullscreenChange);

        return () => {
            isMounted = false;
            if (playerRef.current && typeof playerRef.current.destroy === 'function') {
                playerRef.current.destroy();
            }
            clearInterval(progressInterval.current);
            clearTimeout(controlsTimeoutRef.current);
            document.removeEventListener('fullscreenchange', handleFullscreenChange);
        };
    }, [videoId]);

    // --- 2. Progress Loop (Raf) ---
    useEffect(() => {
        if (isPlaying) {
            progressInterval.current = requestAnimationFrame(updateProgress);
        } else {
            cancelAnimationFrame(progressInterval.current);
        }

        function updateProgress() {
            if (playerRef.current && playerRef.current.getCurrentTime) {
                const currentTime = playerRef.current.getCurrentTime();
                const d = duration || playerRef.current.getDuration() || 1; // Avoid divide by zero
                setProgress((currentTime / d) * 100);
            }
            if (isPlaying) {
                progressInterval.current = requestAnimationFrame(updateProgress);
            }
        }

        return () => cancelAnimationFrame(progressInterval.current);
    }, [isPlaying, duration]);

    // --- 3. Interaction Handlers ---

    const resetControlsTimeout = useCallback(() => {
        clearTimeout(controlsTimeoutRef.current);
        setShowControls(true);
        if (isPlaying) {
            controlsTimeoutRef.current = setTimeout(() => {
                setShowControls(false);
            }, 3000);
        }
    }, [isPlaying]);

    const togglePlay = (e) => {
        e?.stopPropagation();
        if (isPlaying) playerRef.current.pauseVideo();
        else playerRef.current.playVideo();
    };

    const handleSeek = (e) => {
        const val = parseFloat(e.target.value);
        const newTime = (val / 100) * duration;
        playerRef.current.seekTo(newTime, true);
        setProgress(val);
        resetControlsTimeout();
    };

    const toggleMute = (e) => {
        e?.stopPropagation();
        if (isMuted) {
            playerRef.current.unMute();
            if (volume === 0) {
                playerRef.current.setVolume(50);
                setVolume(50);
            }
        } else {
            playerRef.current.mute();
        }
        setIsMuted(!isMuted);
    };

    const handleVolumeChange = (e) => {
        e.stopPropagation();
        const newVol = parseInt(e.target.value);
        setVolume(newVol);
        playerRef.current.setVolume(newVol);
        if (newVol > 0 && isMuted) {
            setIsMuted(false);
            playerRef.current.unMute();
        }
        if (newVol === 0 && !isMuted) {
            setIsMuted(true);
            playerRef.current.mute();
        }
    };

    const toggleFullscreen = (e) => {
        e?.stopPropagation();
        if (!document.fullscreenElement) {
            containerRef.current.requestFullscreen().catch(err => console.log(err));
        } else {
            document.exitFullscreen();
        }
    };

    // --- 4. Gesture Handling (Double Tap / Single Tap) ---
    const handleGestureClick = (e) => {
        const now = Date.now();
        const rect = containerRef.current.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const width = rect.width;
        
        // Check for double tap (within 300ms)
        if (now - lastTapRef.current < 300) {
            clearTimeout(controlsTimeoutRef.current); // Cancel toggle hide
            
            // Determine zone
            if (x < width * 0.35) {
                // Left Double Tap
                seekRelative(-10);
                showToast("-10s", <RotateCcw className="w-6 h-6" />, 'left');
            } else if (x > width * 0.65) {
                // Right Double Tap
                seekRelative(10);
                showToast("+10s", <RotateCw className="w-6 h-6" />, 'right');
            } else {
                // Center Double Tap (Toggle Play/Pause Force)
                togglePlay();
                showToast(isPlaying ? "Pause" : "Play", isPlaying ? <Pause className="w-6 h-6" /> : <Play className="w-6 h-6" />, 'center');
            }
            lastTapRef.current = 0; // Reset
        } else {
            // Single Tap
            lastTapRef.current = now;
            // Delay slightly to wait for potential double tap, or just toggle controls immediately
            if (showControls) {
                // If controls are showing and we tap empty space, hide them
                // But we usually want to toggle.
                resetControlsTimeout();
            } else {
                setShowControls(true);
            }
        }
    };

    const seekRelative = (seconds) => {
        if (!playerRef.current) return;
        const current = playerRef.current.getCurrentTime();
        playerRef.current.seekTo(current + seconds, true);
    };

    const showToast = (text, icon, side) => {
        setToast({ show: true, text, icon, side });
        setTimeout(() => setToast(prev => ({ ...prev, show: false })), 800);
    };

    // --- Helpers ---
    const formatTime = (time) => {
        if (!time || isNaN(time)) return "0:00";
        const minutes = Math.floor(time / 60);
        const seconds = Math.floor(time % 60);
        return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
    };

    return (
        <div 
            ref={containerRef}
            className="relative w-full aspect-video bg-black rounded-3xl overflow-hidden group shadow-2xl ring-1 ring-white/10 select-none"
            onKeyDown={(e) => {
                if (e.key === ' ' || e.key === 'Enter') {
                    e.preventDefault();
                    togglePlay();
                }
            }}
            tabIndex="0" // Make accessible
        >
            {/* The Iframe (Pointer Events None to allow custom gestures) */}
            <div className="absolute inset-0 pointer-events-none">
                <div id={`yt-player-${videoId}`} className="w-full h-full" />
            </div>

            {/* Gesture Layer (Invisible) */}
            <div 
                className="absolute inset-0 z-10 cursor-pointer"
                onClick={handleGestureClick}
                onMouseMove={resetControlsTimeout} // Desktop hover keeps controls alive
            ></div>

            {/* Toast Animations */}
            {toast.show && (
                <div className={`absolute top-1/2 -translate-y-1/2 z-30 flex flex-col items-center justify-center pointer-events-none animate-in fade-in zoom-in duration-200 
                    ${toast.side === 'left' ? 'left-1/4' : toast.side === 'right' ? 'right-1/4' : 'left-1/2 -translate-x-1/2'}`}>
                    <div className="w-12 h-12 bg-black/60 backdrop-blur-md rounded-full flex items-center justify-center text-white mb-2">
                        {toast.icon}
                    </div>
                    <span className="text-white font-bold text-sm drop-shadow-md">{toast.text}</span>
                </div>
            )}

            {/* Controls Overlay */}
            <div 
                className={`absolute inset-0 flex flex-col justify-between pointer-events-none z-20 transition-opacity duration-300 ${showControls ? 'opacity-100' : 'opacity-0'}`}
            >
                {/* Top: Branding Only */}
                <div className="p-4 flex justify-end">
                    <div className="bg-black/30 backdrop-blur-md px-3 py-1 rounded-full border border-white/10 flex items-center gap-2">
                        <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
                        <Image src="/images/logo-symbol.webp" alt="Logo" width={16} height={16} className="w-4 h-4 opacity-90" />
                    </div>
                </div>

                {/* Center: Big Play Button (Pointer events auto to allow click through gesture layer if needed, but gesture layer handles clicks generally. We can make this visual only or clickable) */}
                <div className="absolute inset-0 flex items-center justify-center">
                    {!isPlaying && (
                        <div className="w-16 h-16 bg-brand-gold/90 backdrop-blur-md rounded-full flex items-center justify-center text-white shadow-xl scale-100 hover:scale-110 transition-transform">
                            <Play className="w-6 h-6 fill-current ml-1" />
                        </div>
                    )}
                </div>

                {/* Bottom: Control Bar */}
                <div className="bg-gradient-to-t from-black/90 via-black/60 to-transparent px-4 pb-4 pt-12 pointer-events-auto">
                    
                    {/* Progress Bar */}
                    <div className="relative group/progress h-1.5 hover:h-3 transition-all bg-white/20 rounded-full cursor-pointer mb-3">
                        <div 
                            className="absolute left-0 top-0 bottom-0 bg-brand-gold rounded-full transition-all" 
                            style={{ width: `${progress}%` }}
                        >
                            <div className="absolute right-0 top-1/2 -translate-y-1/2 w-3 h-3 bg-white rounded-full shadow scale-0 group-hover/progress:scale-100 transition-transform" />
                        </div>
                        <input 
                            type="range" 
                            min="0" 
                            max="100" 
                            step="0.1"
                            value={progress} 
                            onChange={handleSeek}
                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                            aria-label="Seek video"
                        />
                    </div>

                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <button 
                                onClick={togglePlay} 
                                className="text-white hover:text-brand-gold transition-colors focus:outline-none"
                                aria-label={isPlaying ? "Pause" : "Play"}
                            >
                                {isPlaying ? <Pause className="w-6 h-6 fill-current" /> : <Play className="w-6 h-6 fill-current" />}
                            </button>
                            
                            {/* Volume Controls */}
                            <div className="flex items-center gap-2 group/vol">
                                <button 
                                    onClick={toggleMute} 
                                    className="text-white hover:text-brand-gold focus:outline-none"
                                    aria-label={isMuted ? "Unmute" : "Mute"}
                                >
                                    {isMuted || volume === 0 ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
                                </button>
                                {/* Volume Slider: Hidden on mobile (w-0), expands on desktop hover */}
                                <div className="w-0 overflow-hidden md:group-hover/vol:w-20 transition-all duration-300">
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
                                {formatTime((progress / 100) * duration)} / {formatTime(duration)}
                            </span>
                        </div>

                        <div className="flex items-center gap-3">
                            <button className="text-white/70 hover:text-white" aria-label="Settings">
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
        </div>
    );
}