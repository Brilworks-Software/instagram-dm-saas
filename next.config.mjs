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
    // Fallback to process.cwd() if dir is not available (Vercel compatibility)
    const projectRoot = dir || process.cwd();
    const srcPath = path.resolve(projectRoot, 'src');
    
    // CRITICAL: Ensure resolve and alias exist
    config.resolve = config.resolve || {};
    config.resolve.alias = config.resolve.alias || {};
    
    // Set the @ alias - MUST be absolute path
    // Overwrite to ensure it's set correctly (don't merge, replace)
    config.resolve.alias['@'] = srcPath;
    
    // Configure module resolution for both relative and absolute imports
    // This ensures both @/ imports and relative imports work correctly
    if (!config.resolve.modules) {
      config.resolve.modules = ['node_modules'];
    }
    
    // Add src directory to modules array (before node_modules for priority)
    // This helps resolve relative imports that go up to src/
    if (!config.resolve.modules.includes(srcPath)) {
      config.resolve.modules = [srcPath, ...config.resolve.modules];
    }
    
    // Also add project root for absolute resolution
    // This helps with any imports that might reference from root
    if (!config.resolve.modules.includes(projectRoot)) {
      config.resolve.modules = [projectRoot, ...config.resolve.modules];
    }
    
    // Ensure extensions are resolved correctly
    config.resolve.extensions = config.resolve.extensions || ['.js', '.jsx', '.ts', '.tsx', '.json'];
    
    // Ensure symlinks are resolved (important for Vercel builds)
    config.resolve.symlinks = true;

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
