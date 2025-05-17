/** @type {import('next').NextConfig} */
const nextConfig = {
  // App Router is now stable - no need for experimental flag
  
  // Configure image optimization
  images: {
    domains: ['localhost'],
  },
  
  // Environment variables available to the client
  env: {
    // If you need any client-side env vars (prefix with NEXT_PUBLIC_)
  },
  
  // Improve CSS handling for dynamic content
  webpack: (config) => {
    return config;
  },
};

export default nextConfig;