#!/usr/bin/env node

/**
 * DryJets Database SQL Runner
 * Executes SQL files against the database
 *
 * Usage:
 *   node scripts/run-sql.js migration.sql
 *   node scripts/run-sql.js seed-data.sql
 */

const { Client } = require('pg');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

async function runSQL(filePath) {
  // Check if file exists
  if (!fs.existsSync(filePath)) {
    console.error(`❌ Error: File not found: ${filePath}`);
    process.exit(1);
  }

  // Read SQL file
  console.log(`📖 Reading SQL file: ${filePath}`);
  const sql = fs.readFileSync(filePath, 'utf8');

  // Get database URL from .env
  const DATABASE_URL = process.env.DATABASE_URL;
  if (!DATABASE_URL) {
    console.error('❌ Error: DATABASE_URL not found in .env file');
    process.exit(1);
  }

  // Create PostgreSQL client
  console.log(`🔌 Connecting to database...`);
  const client = new Client({
    connectionString: DATABASE_URL,
    ssl: {
      rejectUnauthorized: false // Required for Supabase
    }
  });

  try {
    // Connect to database
    await client.connect();
    console.log(`✅ Connected to database`);

    // Execute SQL
    console.log(`⚡ Executing SQL...`);
    const startTime = Date.now();

    await client.query(sql);

    const duration = Date.now() - startTime;
    console.log(`✅ SQL executed successfully in ${duration}ms`);
    console.log(`📊 File: ${path.basename(filePath)}`);
    console.log(`📏 Size: ${sql.length} characters`);

  } catch (error) {
    console.error(`❌ Error executing SQL:`);
    console.error(error.message);

    // Show first few lines of error for context
    if (error.position) {
      const lines = sql.split('\n');
      const errorLine = parseInt(error.position);
      console.error(`\n📍 Error near position ${errorLine}:`);
      console.error(lines.slice(Math.max(0, errorLine - 3), errorLine + 2).join('\n'));
    }

    process.exit(1);
  } finally {
    // Close connection
    await client.end();
    console.log(`🔌 Database connection closed`);
  }
}

// Main execution
const args = process.argv.slice(2);
if (args.length === 0) {
  console.log(`
📋 DryJets Database SQL Runner

Usage:
  node scripts/run-sql.js <sql-file>

Examples:
  node scripts/run-sql.js migration.sql
  node scripts/run-sql.js seed-data.sql

Make sure DATABASE_URL is set in your .env file.
  `);
  process.exit(0);
}

const sqlFile = args[0];
runSQL(sqlFile);
