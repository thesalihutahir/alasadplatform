/** @type {import('next').NextConfig} */
const nextConfig = {
    images: {
        remotePatterns: [
            {
                protocol: "https",
                hostname: "utfs.io",
            },
            {
                protocol: "https",
                hostname: "img.clerk.com", 
            }
        ],
    },
    
    // 1. Fix for UploadThing dependency resolution
    webpack: (config) => {
        config.resolve.alias = {
            ...config.resolve.alias,
            "solid-js": false,
            "solid-js/store": false,
            "svelte": false,
            "svelte/store": false,
            "vue": false,
        };
        return config;
    },

    // 2. Fix for Next.js 16 Turbopack conflict
    // This tells Next.js we are aware of the webpack config and it's okay.
    turbopack: {} 
};

export default nextConfig;
