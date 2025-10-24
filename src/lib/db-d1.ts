/**
 * D1 Database Wrapper
 * Provides a unified interface for both local SQLite and Cloudflare D1
 */

import { getRequestContext } from '@cloudflare/next-on-pages';

type D1Result = {
  results?: any[];
  success: boolean;
  error?: string;
  meta?: any;
};

export interface DbAdapter {
  prepare(sql: string): PreparedStatement;
}

export interface PreparedStatement {
  bind(...values: any[]): PreparedStatement;
  run(): Promise<void>;
  get<T = any>(): Promise<T | null>;
  all<T = any>(): Promise<T[]>;
}

class D1PreparedStatement implements PreparedStatement {
  private stmt: any;

  constructor(stmt: any) {
    this.stmt = stmt;
  }

  bind(...values: any[]): PreparedStatement {
    this.stmt = this.stmt.bind(...values);
    return this;
  }

  async run(): Promise<void> {
    await this.stmt.run();
  }

  async get<T = any>(): Promise<T | null> {
    const result = await this.stmt.first();
    return result || null;
  }

  async all<T = any>(): Promise<T[]> {
    const result = await this.stmt.all();
    return result.results || [];
  }
}

class D1Adapter implements DbAdapter {
  private db: any;

  constructor(db: any) {
    this.db = db;
  }

  prepare(sql: string): PreparedStatement {
    return new D1PreparedStatement(this.db.prepare(sql));
  }
}

/**
 * Get D1 database from Cloudflare context
 * This will be used in production on Cloudflare Pages
 */
export function getD1Db(): DbAdapter {
  try {
    const context = getRequestContext();
    const env = context?.env as any;
    if (env?.DB) {
      return new D1Adapter(env.DB);
    }
  } catch (error) {
    // Context not available (local dev or not in request context)
  }

  throw new Error('D1 database not available in this environment');
}

/**
 * Check if we're running on Cloudflare
 */
export function isCloudflare(): boolean {
  try {
    const context = getRequestContext();
    const env = context?.env as any;
    return !!(env?.DB);
  } catch {
    return false;
  }
}
