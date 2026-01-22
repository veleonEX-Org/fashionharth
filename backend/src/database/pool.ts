import { Pool } from "pg";
import { env } from "../config/env.js";

// Single shared Postgres connection pool with retry configuration
export const pool = new Pool({
  host: env.db.host,
  port: env.db.port,
  user: env.db.user,
  password: env.db.password,
  database: env.db.database,
  
  // Connection pool settings
  max: 20, // Maximum number of connections in the pool
  min: 2, // Minimum number of connections to maintain
  idleTimeoutMillis: 30000, // Close idle connections after 30 seconds
  connectionTimeoutMillis: 10000, // Wait up to 10 seconds for a connection
  
  // Retry settings for DNS and connection issues
  keepAlive: true,
  keepAliveInitialDelayMillis: 10000,
});

export async function pingDatabase(): Promise<void> {
  await pool.query("SELECT 1");
}




