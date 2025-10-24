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
    try {
      // Dynamic import to avoid bundling in edge runtime
      const Database = require('better-sqlite3');
      const path = require('path');
      const dbPath = path.join(process.cwd(), 'mafia-game.db');
      const db = new Database(dbPath);

      // Wrapper to match D1 interface
      dbInstance = {
        prepare(query: string) {
          const stmt = db.prepare(query);
          return {
            bind(...params: any[]) {
              return {
                async run() {
                  const result = stmt.run(...params);
                  return {
                    success: true,
                    meta: {
                      changes: result.changes,
                      last_row_id: result.lastInsertRowid,
                    },
                  };
                },
                async all() {
                  const results = stmt.all(...params);
                  return { results, success: true };
                },
                async first() {
                  const result = stmt.get(...params);
                  return result || null;
                },
                async get() {
                  const result = stmt.get(...params);
                  return result || null;
                },
              };
            },
            async run(...params: any[]) {
              const result = stmt.run(...params);
              return {
                success: true,
                meta: {
                  changes: result.changes,
                  last_row_id: result.lastInsertRowid,
                },
              };
            },
            async all(...params: any[]) {
              const results = stmt.all(...params);
              return { results, success: true };
            },
            async first(...params: any[]) {
              const result = stmt.get(...params);
              return result || null;
            },
            async get(...params: any[]) {
              const result = stmt.get(...params);
              return result || null;
            },
          };
        },
      };
    } catch (error) {
      console.error('Failed to initialize SQLite database:', error);
      throw new Error('Failed to initialize local SQLite database. Please ensure better-sqlite3 is installed.');
    }
  }

  return dbInstance;
}

/**
 * Reset database instance (useful for testing)
 */
export function resetDb() {
  dbInstance = null;
}
