import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/** @type {import('next').NextConfig} */
const nextConfig = {
  // Vercel doesn't need standalone output
  // Image optimization
  images: {
    domains: ['instagram.com', 'cdninstagram.com', 'scontent.cdninstagram.com'],
    unoptimized: false,
  },
  // Disable ESLint during builds for now
  eslint: {
    ignoreDuringBuilds: true,
  },
  // Disable TypeScript errors during builds
  typescript: {
    ignoreBuildErrors: false,
  },
  // Allow dynamic pages to skip static generation
  experimental: {
    missingSuspenseWithCSRBailout: false,
  },
  // Webpack configuration for Supabase and path aliases
  webpack: (config, { isServer }) => {
    // Get the absolute path to src directory
    const projectRoot = process.cwd();
    const srcPath = path.resolve(projectRoot, 'src');
    
    // CRITICAL: Set alias BEFORE any other resolve configuration
    // This ensures webpack uses the alias for module resolution
    if (!config.resolve) {
      config.resolve = {};
    }
    
    // Set the @ alias - must be absolute path
    // Use both direct assignment and spread to ensure it's set
    config.resolve.alias = {
      ...(config.resolve.alias || {}),
      '@': srcPath,
    };

    // Client-side fallbacks
    if (!isServer) {
      config.resolve.fallback = {
        ...(config.resolve.fallback || {}),
        fs: false,
        net: false,
        tls: false,
      };
    }
    
    return config;
  },
};

export default nextConfig;
