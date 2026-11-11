import { resolve } from 'node:path';
import type { NextConfig } from 'next';

// The repo-root .env is loaded by the package scripts (dotenv -e ../../.env), the same way as in packages/db.
const config: NextConfig = {
  reactStrictMode: true,
  transpilePackages: ['@tkg/ui', '@tkg/i18n', '@tkg/db', '@tkg/materials', '@tkg/sku-selling'],
  outputFileTracingRoot: resolve(process.cwd(), '../..'),
};

export default config;
