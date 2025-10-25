/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    serverActions: {
      bodySizeLimit: '2mb',
    },
  },
  webpack: (config, { isServer, nextRuntime }) => {
    // Exclude better-sqlite3 from Edge Runtime bundles
    if (isServer && nextRuntime === 'edge') {
      config.externals = config.externals || [];
      if (Array.isArray(config.externals)) {
        config.externals.push('better-sqlite3');
      }
    }
    return config;
  },
}

module.exports = nextConfig
