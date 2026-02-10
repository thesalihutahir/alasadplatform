// components/CustomVideoPlayer.js
"use client";

import React, { useState, useEffect, useRef } from "react";

// --- Singleton API Loader ---
let apiPromise = null;
const loadYouTubeAPI = () => {
  if (apiPromise) return apiPromise;

  apiPromise = new Promise((resolve) => {
    if (typeof window === "undefined") return;

    if (window.YT && window.YT.Player) {
      resolve(window.YT);
      return;
    }

    const existingCallback = window.onYouTubeIframeAPIReady;
    window.onYouTubeIframeAPIReady = () => {
      if (existingCallback) existingCallback();
      resolve(window.YT);
    };

    if (!document.querySelector('script[src="https://www.youtube.com/iframe_api"]')) {
      const tag = document.createElement("script");
      tag.src = "https://www.youtube.com/iframe_api";
      const firstScriptTag = document.getElementsByTagName("script")[0];
      firstScriptTag?.parentNode?.insertBefore(tag, firstScriptTag);
    }
  });

  return apiPromise;
};

export default function CustomVideoPlayer({ videoId }) {
  // --- Refs ---
  const containerRef = useRef(null);
  const playerRef = useRef(null);

  // --- State ---
  const [playerReady, setPlayerReady] = useState(false);

  // --- Player Initialization ---
  useEffect(() => {
    let isMounted = true;
    setPlayerReady(false);

    loadYouTubeAPI().then((YT) => {
      if (!isMounted) return;

      // Clean up previous instance
      if (playerRef.current) {
        try { playerRef.current.destroy(); } catch (e) {}
      }

      // Initialize Player with Native Controls
      playerRef.current = new YT.Player(`yt-player-${videoId}`, {
        videoId,
        width: "100%",
        height: "100%",
        playerVars: {
          autoplay: 0,
          controls: 1, // Enable native controls
          modestbranding: 1,
          rel: 0,
          showinfo: 0,
          iv_load_policy: 3,
          fs: 1, // Enable fullscreen
          playsinline: 1,
        },
        events: {
          onReady: () => {
            if (isMounted) setPlayerReady(true);
          },
        },
      });
    });

    return () => {
      isMounted = false;
      if (playerRef.current) {
        try { playerRef.current.destroy(); } catch (e) {}
      }
    };
  }, [videoId]);

  return (
    <div
      ref={containerRef}
      className="relative w-full aspect-video bg-black rounded-3xl overflow-hidden shadow-2xl ring-1 ring-white/10"
    >
      {/* Container for YouTube Iframe */}
      <div id={`yt-player-${videoId}`} className="w-full h-full" />

      {/* Simple Loading State */}
      {!playerReady && (
        <div className="absolute inset-0 z-10 flex items-center justify-center bg-black/20">
          <div className="w-10 h-10 border-4 border-white/20 border-t-white rounded-full animate-spin" />
        </div>
      )}
    </div>
  );
}