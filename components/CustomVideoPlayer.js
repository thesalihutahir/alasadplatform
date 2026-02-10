// components/CustomVideoPlayer.jsx
"use client";

import React, { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import { Play, Pause, Volume2, VolumeX, Maximize, Minimize, SkipBack, SkipForward, Settings } from 'lucide-react';

export default function CustomVideoPlayer({ videoId, thumbnail, title }) {
    const playerRef = useRef(null);
    const [player, setPlayer] = useState(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const [progress, setProgress] = useState(0);
    const [duration, setDuration] = useState(0);
    const [isMuted, setIsMuted] = useState(false);
    const [volume, setVolume] = useState(100);
    const [isFullscreen, setIsFullscreen] = useState(false);
    const [showControls, setShowControls] = useState(true);
    const containerRef = useRef(null);
    const controlsTimeoutRef = useRef(null);

    // Load YouTube API
    useEffect(() => {
        if (!window.YT) {
            const tag = document.createElement('script');
            tag.src = "https://www.youtube.com/iframe_api";
            const firstScriptTag = document.getElementsByTagName('script')[0];
            firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);
        }

        const initPlayer = () => {
            const newPlayer = new window.YT.Player(`Youtubeer-${videoId}`, {
                videoId: videoId,
                playerVars: {
                    autoplay: 0,
                    controls: 0, // Hide native controls
                    modestbranding: 1,
                    rel: 0,
                    showinfo: 0,
                    iv_load_policy: 3,
                    fs: 0
                },
                events: {
                    onReady: (event) => {
                        setPlayer(event.target);
                        setDuration(event.target.getDuration());
                    },
                    onStateChange: (event) => {
                        setIsPlaying(event.data === window.YT.PlayerState.PLAYING);
                    }
                }
            });
        };

        if (window.YT && window.YT.Player) {
            initPlayer();
        } else {
            window.onYouTubeIframeAPIReady = initPlayer;
        }

        return () => {
            if (player) {
                // Cleanup if needed, though YT API handles iframe removal mostly
            }
        };
    }, [videoId]);

    // Progress Loop
    useEffect(() => {
        let interval;
        if (isPlaying && player) {
            interval = setInterval(() => {
                const currentTime = player.getCurrentTime();
                setProgress((currentTime / duration) * 100);
            }, 1000);
        }
        return () => clearInterval(interval);
    }, [isPlaying, player, duration]);

    // Controls Visibility Handler
    const handleMouseMove = () => {
        setShowControls(true);
        clearTimeout(controlsTimeoutRef.current);
        controlsTimeoutRef.current = setTimeout(() => {
            if (isPlaying) setShowControls(false);
        }, 3000);
    };

    const togglePlay = () => {
        if (isPlaying) player.pauseVideo();
        else player.playVideo();
    };

    const handleSeek = (e) => {
        const newTime = (e.target.value / 100) * duration;
        player.seekTo(newTime);
        setProgress(e.target.value);
    };

    const toggleMute = () => {
        if (isMuted) {
            player.unMute();
            setVolume(100);
        } else {
            player.mute();
            setVolume(0);
        }
        setIsMuted(!isMuted);
    };

    const handleVolumeChange = (e) => {
        const newVol = e.target.value;
        setVolume(newVol);
        player.setVolume(newVol);
        if(newVol > 0 && isMuted) {
             setIsMuted(false);
             player.unMute();
        }
    };

    const toggleFullscreen = () => {
        if (!document.fullscreenElement) {
            containerRef.current.requestFullscreen();
            setIsFullscreen(true);
        } else {
            document.exitFullscreen();
            setIsFullscreen(false);
        }
    };

    const formatTime = (time) => {
        const minutes = Math.floor(time / 60);
        const seconds = Math.floor(time % 60);
        return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
    };

    return (
        <div 
            ref={containerRef}
            className="relative w-full aspect-video bg-black rounded-3xl overflow-hidden group shadow-2xl ring-1 ring-white/10"
            onMouseMove={handleMouseMove}
            onMouseLeave={() => isPlaying && setShowControls(false)}
        >
            {/* The Iframe */}
            <div id={`Youtubeer-${videoId}`} className="w-full h-full pointer-events-none" />

            {/* Custom Overlay Controls */}
            <div 
                className={`absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/40 transition-opacity duration-300 flex flex-col justify-between p-6 z-20 ${showControls ? 'opacity-100' : 'opacity-0 cursor-none'}`}
            >
                {/* Top Bar */}
                <div className="flex justify-between items-start">
                    <h3 className="text-white font-agency text-xl md:text-2xl drop-shadow-md opacity-90 line-clamp-1 max-w-[80%]">{title}</h3>
                    <div className="bg-white/10 backdrop-blur-md px-3 py-1 rounded-full border border-white/10">
                        <Image src="/images/logo-symbol.webp" alt="Logo" width={20} height={20} className="w-5 h-5 opacity-80" />
                    </div>
                </div>

                {/* Center Big Play Button (Only when paused) */}
                {!isPlaying && (
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                        <button 
                            onClick={togglePlay}
                            className="w-20 h-20 bg-brand-gold/90 backdrop-blur-md rounded-full flex items-center justify-center text-white shadow-xl hover:scale-110 transition-transform pointer-events-auto cursor-pointer"
                        >
                            <Play className="w-8 h-8 fill-current ml-1" />
                        </button>
                    </div>
                )}

                {/* Bottom Control Bar */}
                <div className="space-y-3">
                    {/* Progress Bar */}
                    <div className="relative group/progress h-1.5 hover:h-2.5 transition-all bg-white/20 rounded-full cursor-pointer">
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
                            value={progress} 
                            onChange={handleSeek}
                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                        />
                    </div>

                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <button onClick={togglePlay} className="text-white hover:text-brand-gold transition-colors">
                                {isPlaying ? <Pause className="w-6 h-6 fill-current" /> : <Play className="w-6 h-6 fill-current" />}
                            </button>
                            
                            <div className="flex items-center gap-2 group/vol">
                                <button onClick={toggleMute} className="text-white hover:text-brand-gold">
                                    {isMuted || volume == 0 ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
                                </button>
                                <div className="w-0 overflow-hidden group-hover/vol:w-20 transition-all duration-300">
                                    <input 
                                        type="range" 
                                        min="0" 
                                        max="100" 
                                        value={volume} 
                                        onChange={handleVolumeChange}
                                        className="h-1 w-20 bg-white/30 rounded-lg appearance-none cursor-pointer" 
                                    />
                                </div>
                            </div>

                            <span className="text-xs font-mono font-bold text-white/80">
                                {formatTime((progress / 100) * duration)} / {formatTime(duration)}
                            </span>
                        </div>

                        <div className="flex items-center gap-4">
                            <button className="text-white/70 hover:text-white"><Settings className="w-5 h-5" /></button>
                            <button onClick={toggleFullscreen} className="text-white hover:text-brand-gold">
                                {isFullscreen ? <Minimize className="w-5 h-5" /> : <Maximize className="w-5 h-5" />}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}