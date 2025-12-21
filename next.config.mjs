import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/** @type {import('next').NextConfig} */
const nextConfig = {
  // Mark server-only packages as external to prevent webpack from bundling them
  serverComponentsExternalPackages: [
    'instagram-private-api',
    'puppeteer',
    'puppeteer-core',
    'puppeteer-extra',
    'puppeteer-extra-plugin-stealth',
  ],
  // Vercel doesn't need standalone output
  // Image optimization
  images: {
    domains: [
      'instagram.com', 
      'cdninstagram.com', 
      'scontent.cdninstagram.com',
      'scontent-iad3-1.cdninstagram.com',
      'scontent-iad3-2.cdninstagram.com',
      'instagram.fbom61-1.fna.fbcdn.net',
      'instagram.fgnm1-1.fna.fbcdn.net',
      'fbcdn.net',
      'fbcdn.com',
    ],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**.instagram.com',
      },
      {
        protocol: 'https',
        hostname: '**.cdninstagram.com',
      },
      {
        protocol: 'https',
        hostname: '**.fbcdn.net',
      },
      {
        protocol: 'https',
        hostname: '**.fbcdn.com',
      },
    ],
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

    // For server-side, ensure instagram-private-api and related packages are external
    // This prevents webpack from trying to bundle binary files
    if (isServer) {
      config.externals = config.externals || [];
      if (typeof config.externals === 'function') {
        const originalExternals = config.externals;
        config.externals = [
          originalExternals,
          ({ request }, callback) => {
            // Mark instagram-private-api and its dependencies as external
            if (request && (
              request.includes('instagram-private-api') ||
              request.includes('puppeteer') ||
              request.includes('puppeteer-core')
            )) {
              return callback(null, `commonjs ${request}`);
            }
            callback();
          },
        ];
      } else if (Array.isArray(config.externals)) {
        config.externals.push(({ request }, callback) => {
          if (request && (
            request.includes('instagram-private-api') ||
            request.includes('puppeteer') ||
            request.includes('puppeteer-core')
          )) {
            return callback(null, `commonjs ${request}`);
          }
          callback();
        });
      }
    }

    // Client-side fallbacks
    if (!isServer) {
      config.resolve.fallback = {
        ...(config.resolve.fallback || {}),
        fs: false,
        net: false,
        tls: false,
        child_process: false,
        'puppeteer': false,
        'puppeteer-core': false,
        'instagram-private-api': false,
      };
    }
    
    return config;
  },
};

export default nextConfig;
