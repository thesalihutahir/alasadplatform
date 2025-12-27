/** @type {import('next').NextConfig} */
const nextConfig = {
    images: {
        remotePatterns: [
            {
                protocol: "https",
                hostname: "firebasestorage.googleapis.com", 
            },
            {
                protocol: "https",
                hostname: "img.clerk.com", 
            },
            {
                protocol: "https",
                hostname: "img.youtube.com",
            }
        ],
    },
    typescript: {
        ignoreBuildErrors: true,
    }
};

module.exports = nextConfig;
