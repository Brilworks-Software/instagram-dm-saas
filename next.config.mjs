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
  webpack: (config, { isServer, dir }) => {
    // Get the absolute path to src directory
    // Use dir parameter (Next.js provides this) for reliable path resolution
    const projectRoot = dir || process.cwd();
    const srcPath = path.resolve(projectRoot, 'src');
    
    // CRITICAL: Ensure resolve and alias exist
    config.resolve = config.resolve || {};
    config.resolve.alias = config.resolve.alias || {};
    
    // Set the @ alias - MUST be absolute path
    // Overwrite to ensure it's set correctly (don't merge, replace)
    config.resolve.alias['@'] = srcPath;
    
    // Add project root and src to modules for better resolution
    // This helps webpack resolve relative imports correctly
    if (!config.resolve.modules) {
      config.resolve.modules = ['node_modules'];
    }
    // Add src directory to modules array (before node_modules for priority)
    if (!config.resolve.modules.includes(srcPath)) {
      config.resolve.modules = [srcPath, ...config.resolve.modules];
    }
    // Also add project root for absolute resolution
    if (!config.resolve.modules.includes(projectRoot)) {
      config.resolve.modules = [projectRoot, ...config.resolve.modules];
    }

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
