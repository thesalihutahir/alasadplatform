"use client";

import React from 'react';
import LogoReveal from '@/components/logo-reveal';

export default function Loader({ size = "md", className = "" }) {
    
    // Map abstract sizes to actual Tailwind width/height classes
    const sizeClasses = {
        xs: "w-5 h-5",       // For inside text buttons (e.g. "Saving...")
        sm: "w-8 h-8",       // Small container
        md: "w-20 h-20",     // Standard section loader
        lg: "w-32 h-32",     // Large section loader
        xl: "w-48 h-48",     // Huge
    };

    // If size is 'full', we center it on the whole screen
    if (size === 'full') {
        return (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-white/80 backdrop-blur-sm">
                <div className="w-32 h-32 md:w-48 md:h-48">
                    <LogoReveal />
                </div>
            </div>
        );
    }

    return (
        <div className={`flex items-center justify-center ${className}`}>
            <div className={`${sizeClasses[size] || sizeClasses.md} relative flex items-center justify-center`}>
                <LogoReveal />
            </div>
        </div>
    );
}