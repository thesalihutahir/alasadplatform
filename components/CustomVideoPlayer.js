// components/CustomVideoPlayer.js

"use client";

import React, { useState, useEffect, useRef, useCallback } from 'react';
import Image from 'next/image';
import { Play, Pause, Volume2, VolumeX, Maximize, Minimize, Settings } from 'lucide-react';

// Singleton loader for YouTube API
let ytApiPromise = null;
const loadYouTubeAPI = () => {
    if (ytApiPromise) return ytApiPromise;
    ytApiPromise = new Promise((resolve) => {
        if (window.YT && window.YT.Player) {
            resolve(window.YT);
            return;
        }
        const tag = document.createElement('script');
        tag.src = "https://www.youtube.com/iframe_api";
        const firstScriptTag = document.getElementsByTagName('script')[0];
        firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);
        window.onYouTubeIframeAPIReady = () => resolve(window.YT);
    });
    return ytApiPromise;
};

export default function CustomVideoPlayer({ videoId, thumbnail, title }) {
    // Refs
    const playerRef = useRef(null);
    const containerRef = useRef(null);
    const progressInterval = useRef(null);
    const controlsTimeout = useRef(null);
    const lastTapTime = useRef(0);
    const tapTimeout = useRef(null);

    // State
    const [isPlaying, setIsPlaying] = useState(false);
    const [progress, setProgress] = useState(0);
    const [duration, setDuration] = useState(0);
    const [isMuted, setIsMuted] = useState(false);
    const [volume, setVolume] = useState(100);
    const [isFullscreen, setIsFullscreen] = useState(false);
    const [showControls, setShowControls] = useState(true);
    const [gestureToast, setGestureToast] = useState(null); // { text: "-10s", side: "left" }

    // --- 1. Initialize Player ---
    useEffect(() => {
        let playerInstance = null;

        const init = async () => {
            const YT = await loadYouTubeAPI();
            
            playerInstance = new YT.Player(`yt-player-${videoId}`, {
                videoId: videoId,
                height: '100%',
                width: '100%',
                playerVars: {
                    autoplay: 0,
                    controls: 0,
                    modestbranding: 1,
                    rel: 0,
                    showinfo: 0,
                    iv_load_policy: 3,
                    fs: 0,
                    disablekb: 1, // Disable default YT keyboard controls to use our own
                    playsinline: 1
                },
                events: {
                    onReady: (event) => {
                        playerRef.current = event.target;
                        // Poll for duration (sometimes 0 initially)
                        const checkDuration = setInterval(() => {
                            const d = event.target.getDuration();
                            if (d > 0) {
                                setDuration(d);
                                clearInterval(checkDuration);
                            }
                        }, 500);
                    },
                    onStateChange: (event) => {
                        // SYNC PLAY STATE
                        setIsPlaying(event.data === YT.PlayerState.PLAYING);
                        if (event.data === YT.PlayerState.ENDED) {
                            setIsPlaying(false);
                            setShowControls(true);
                        }
                    }
                }
            });
        };

        init();

        return () => {
            if (playerInstance && playerInstance.destroy) {
                playerInstance.destroy();
            }
            clearInterval(progressInterval.current);
            clearTimeout(controlsTimeout.current);
        };
    }, [videoId]);

    // --- 2. Progress Loop ---
    useEffect(() => {
        if (isPlaying) {
            progressInterval.current = setInterval(() => {
                if (playerRef.current && playerRef.current.getCurrentTime) {
                    const current = playerRef.current.getCurrentTime();
                    // Avoid NaN
                    const safeDuration = duration || 1;
                    setProgress((current / safeDuration) * 100);
                }
            }, 250); // 250ms update for smoother bar
        } else {
            clearInterval(progressInterval.current);
        }
        return () => clearInterval(progressInterval.current);
    }, [isPlaying, duration]);

    // --- 3. Fullscreen Sync ---
    useEffect(() => {
        const handleFsChange = () => {
            setIsFullscreen(!!document.fullscreenElement);
        };
        document.addEventListener('fullscreenchange', handleFsChange);
        return () => document.removeEventListener('fullscreenchange', handleFsChange);
    }, []);

    // --- 4. Controls Logic ---
    const showControlsTemporarily = useCallback(() => {
        setShowControls(true);
        clearTimeout(controlsTimeout.current);
        if (isPlaying) {
            controlsTimeout.current = setTimeout(() => setShowControls(false), 3000);
        }
    }, [isPlaying]);

    useEffect(() => {
        showControlsTemporarily();
    }, [isPlaying, showControlsTemporarily]);

    // --- Actions ---
    const togglePlay = (e) => {
        e?.stopPropagation();
        if (!playerRef.current) return;
        if (isPlaying) playerRef.current.pauseVideo();
        else playerRef.current.playVideo();
    };

    const handleSeek = (e) => {
        e.stopPropagation();
        const newVal = parseFloat(e.target.value);
        setProgress(newVal);
        if (playerRef.current && duration > 0) {
            playerRef.current.seekTo((newVal / 100) * duration, true);
        }
    };

    const toggleMute = (e) => {
        e.stopPropagation();
        if (!playerRef.current) return;
        if (isMuted) {
            playerRef.current.unMute();
            playerRef.current.setVolume(volume || 100);
            setIsMuted(false);
        } else {
            playerRef.current.mute();
            setIsMuted(true);
        }
    };

    const handleVolumeChange = (e) => {
        e.stopPropagation();
        const newVol = parseInt(e.target.value);
        setVolume(newVol);
        if (playerRef.current) {
            playerRef.current.setVolume(newVol);
            if (newVol > 0 && isMuted) {
                playerRef.current.unMute();
                setIsMuted(false);
            }
        }
    };

    const toggleFullscreenAction = (e) => {
        e?.stopPropagation();
        if (!containerRef.current) return;
        if (!document.fullscreenElement) {
            containerRef.current.requestFullscreen().catch(console.error);
        } else {
            document.exitFullscreen().catch(console.error);
        }
    };

    // --- Gestures (Tap / Double Tap) ---
    const handleGestureLayerClick = (e) => {
        const now = Date.now();
        const tapDelay = 300;
        const rect = containerRef.current.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const width = rect.width;
        
        // Check double tap
        if (now - lastTapTime.current < tapDelay) {
            clearTimeout(tapTimeout.current);
            // Double Tap Logic
            if (x < width * 0.35) {
                // Left 35% -> Seek Back
                seekRelative(-10);
                triggerToast("-10s", "left");
            } else if (x > width * 0.65) {
                // Right 35% -> Seek Forward
                seekRelative(10);
                triggerToast("+10s", "right");
            } else {
                // Center -> Toggle Play
                togglePlay();
            }
        } else {
            // Single Tap Wait
            tapTimeout.current = setTimeout(() => {
                // Toggle Controls visibility on single tap
                setShowControls(prev => !prev);
            }, tapDelay);
        }
        lastTapTime.current = now;
    };

    const seekRelative = (seconds) => {
        if (!playerRef.current) return;
        const current = playerRef.current.getCurrentTime();
        playerRef.current.seekTo(current + seconds, true);
    };

    const triggerToast = (text, side) => {
        setGestureToast({ text, side });
        setTimeout(() => setGestureToast(null), 800);
    };

    const formatTime = (time) => {
        if (!time || isNaN(time)) return "0:00";
        const m = Math.floor(time / 60);
        const s = Math.floor(time % 60);
        return `${m}:${s < 10 ? '0' : ''}${s}`;
    };

    const handleKeyDown = (e) => {
        if (e.code === 'Space') {
            e.preventDefault();
            togglePlay();
        } else if (e.code === 'ArrowRight') {
            seekRelative(5);
        } else if (e.code === 'ArrowLeft') {
            seekRelative(-5);
        }
    };

    return (
        <div 
            ref={containerRef}
            className="relative w-full h-full bg-black rounded-3xl overflow-hidden group shadow-2xl ring-1 ring-white/10 outline-none"
            onMouseMove={showControlsTemporarily}
            onMouseLeave={() => isPlaying && setShowControls(false)}
            tabIndex="0"
            onKeyDown={handleKeyDown}
            aria-label="Video Player"
        >
            {/* 1. YouTube Iframe (Hidden UI) */}
            <div id={`yt-player-${videoId}`} className="w-full h-full pointer-events-none select-none scale-[1.01]" /> 
            {/* Scale 1.01 removes tiny pixel gaps */}

            {/* 2. Gesture Layer (Invisible Interaction) */}
            <div 
                className="absolute inset-0 z-10 cursor-pointer"
                onClick={handleGestureLayerClick}
            />

            {/* 3. Gesture Toasts */}
            {gestureToast && (
                <div className={`absolute top-1/2 -translate-y-1/2 z-30 pointer-events-none flex flex-col items-center justify-center bg-black/60 backdrop-blur-md text-white rounded-full w-20 h-20 animate-ping-once transition-all ${gestureToast.side === 'left' ? 'left-[10%]' : 'right-[10%]'}`}>
                    {gestureToast.side === 'left' ? <SkipBack className="w-6 h-6 mb-1" /> : <SkipForward className="w-6 h-6 mb-1" />}
                    <span className="text-xs font-bold">{gestureToast.text}</span>
                </div>
            )}

            {/* 4. Center Play Button (Paused State) */}
            {!isPlaying && (
                <div className="absolute inset-0 z-20 flex items-center justify-center pointer-events-none">
                    <button 
                        onClick={(e) => {
                            // Pass click through to togglePlay, ensure pointer-events-auto
                            togglePlay(e);
                        }}
                        className="pointer-events-auto w-20 h-20 bg-brand-gold/90 backdrop-blur-md rounded-full flex items-center justify-center text-white shadow-xl hover:scale-110 transition-transform cursor-pointer"
                        aria-label="Play Video"
                    >
                        <Play className="w-8 h-8 fill-current ml-1" />
                    </button>
                </div>
            )}

            {/* 5. Minimal Bottom Controls */}
            <div 
                className={`absolute bottom-0 left-0 right-0 z-40 bg-gradient-to-t from-black/90 via-black/50 to-transparent px-4 pb-4 pt-12 transition-opacity duration-300 ${showControls ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
            >
                {/* Progress Bar */}
                <div className="relative group/progress h-1.5 hover:h-3 transition-all bg-white/20 rounded-full cursor-pointer mb-3">
                    <div 
                        className="absolute left-0 top-0 bottom-0 bg-brand-gold rounded-full" 
                        style={{ width: `${progress}%` }}
                    />
                    <input 
                        type="range" 
                        min="0" 
                        max="100" 
                        step="0.1"
                        value={progress} 
                        onChange={handleSeek}
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                        aria-label="Seek Slider"
                    />
                </div>

                <div className="flex items-center justify-between">
                    {/* Left: Play / Volume / Time */}
                    <div className="flex items-center gap-4">
                        <button onClick={togglePlay} className="text-white hover:text-brand-gold transition-colors focus:outline-none" aria-label={isPlaying ? "Pause" : "Play"}>
                            {isPlaying ? <Pause className="w-6 h-6 fill-current" /> : <Play className="w-6 h-6 fill-current" />}
                        </button>
                        
                        <div className="flex items-center gap-2 group/vol">
                            <button onClick={toggleMute} className="text-white hover:text-brand-gold focus:outline-none" aria-label="Mute Toggle">
                                {isMuted || volume === 0 ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
                            </button>
                            {/* Desktop Hover Expand / Mobile Fixed (handled by Tailwind 'group-hover' media queries logic or keep simple) */}
                            {/* Simplifying for mobile stability: Always show small slider on desktop, hide on mobile? 
                               Req says: "Volume slider should NOT expand on hover on mobile." 
                               We'll make it always visible but small, or use CSS media hover. */}
                            <div className="w-0 overflow-hidden md:group-hover/vol:w-20 transition-all duration-300 hidden md:block">
                                <input 
                                    type="range" 
                                    min="0" 
                                    max="100" 
                                    value={isMuted ? 0 : volume} 
                                    onChange={handleVolumeChange}
                                    className="h-1 w-20 bg-white/30 rounded-lg appearance-none cursor-pointer accent-brand-gold" 
                                    aria-label="Volume Slider"
                                />
                            </div>
                        </div>

                        <span className="text-xs font-mono font-bold text-white/90 tracking-wide select-none">
                            {formatTime((progress / 100) * duration)} / {formatTime(duration)}
                        </span>
                    </div>

                    {/* Right: Settings / Fullscreen */}
                    <div className="flex items-center gap-4">
                        {/* Settings removed for minimal UI as requested in prompt "Make controls minimal" */}
                        <button onClick={toggleFullscreenAction} className="text-white hover:text-brand-gold focus:outline-none" aria-label="Toggle Fullscreen">
                            {isFullscreen ? <Minimize className="w-5 h-5" /> : <Maximize className="w-5 h-5" />}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}