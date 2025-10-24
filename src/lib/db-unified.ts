/**
 * Unified Database Layer
 * Auto-detects environment and uses appropriate database (SQLite or D1)
 */

import { isCloudflare, getD1Db, DbAdapter } from './db-d1';

let dbInstance: DbAdapter | null = null;

/**
 * Get database instance (auto-detects environment)
 */
export function getDb(): DbAdapter {
  if (dbInstance) return dbInstance;

  if (isCloudflare()) {
    // Use D1 on Cloudflare
    dbInstance = getD1Db();
  } else {
    // Use better-sqlite3 for local development
    // Note: This path won't be reached in edge runtime due to the isCloudflare() check above
    throw new Error('Local SQLite not supported in edge runtime. Please run in Node.js environment for local development.');
  }

  return dbInstance;
}

/**
 * Reset database instance (useful for testing)
 */
export function resetDb() {
  dbInstance = null;
}
