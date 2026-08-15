import sqlite3 from 'sqlite3';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const dbPath = join(__dirname, '../data/rss_feeds.db');

// Ensure data directory exists
const dataDir = join(__dirname, '../data');
if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
}

const db = new sqlite3.Database(dbPath);

db.serialize(() => {
    // RSS Feeds table
    db.run(`
    CREATE TABLE IF NOT EXISTS rss_feeds (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      url TEXT UNIQUE NOT NULL,
      name TEXT,
      category TEXT,
      language TEXT DEFAULT 'en',
      active BOOLEAN DEFAULT 1,
      fetch_interval_minutes INTEGER DEFAULT 30,
      last_fetched DATETIME,
      total_items_fetched INTEGER DEFAULT 0,
      error_count INTEGER DEFAULT 0,
      last_error TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

    // Feed Items table
    db.run(`
    CREATE TABLE IF NOT EXISTS feed_items (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      feed_id INTEGER NOT NULL,
      guid TEXT UNIQUE NOT NULL,
      title TEXT NOT NULL,
      link TEXT,
      description TEXT,
      content TEXT,
      author TEXT,
      published_date DATETIME,
      categories TEXT,
      image_url TEXT,
      video_url TEXT,
      enclosure_url TEXT,
      enclosure_type TEXT,
      word_count INTEGER,
      reading_time_minutes INTEGER,
      language TEXT,
      is_duplicate BOOLEAN DEFAULT 0,
      duplicate_of INTEGER,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (feed_id) REFERENCES rss_feeds(id) ON DELETE CASCADE
    )
  `);

    // Summaries table
    db.run(`
    CREATE TABLE IF NOT EXISTS summaries (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      item_id INTEGER NOT NULL,
      summary_text TEXT NOT NULL,
      summary_type TEXT DEFAULT 'extractive',
      model_used TEXT,
      tokens_used INTEGER,
      confidence_score REAL,
      key_points TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (item_id) REFERENCES feed_items(id) ON DELETE CASCADE
    )
  `);

    // Generated Images table
    db.run(`
    CREATE TABLE IF NOT EXISTS generated_images (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      item_id INTEGER NOT NULL,
      summary_id INTEGER,
      file_path TEXT NOT NULL,
      file_size_bytes INTEGER,
      width INTEGER,
      height INTEGER,
      format TEXT,
      style TEXT,
      generation_method TEXT,
      prompt_used TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (item_id) REFERENCES feed_items(id) ON DELETE CASCADE,
      FOREIGN KEY (summary_id) REFERENCES summaries(id) ON DELETE SET NULL
    )
  `);

    // Generated Videos table
    db.run(`
    CREATE TABLE IF NOT EXISTS generated_videos (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      item_id INTEGER NOT NULL,
      image_id INTEGER,
      file_path TEXT NOT NULL,
      file_size_bytes INTEGER,
      duration_seconds REAL,
      width INTEGER,
      height INTEGER,
      fps INTEGER,
      format TEXT,
      codec TEXT,
      bitrate INTEGER,
      video_style TEXT,
      has_audio BOOLEAN DEFAULT 0,
      audio_path TEXT,
      processing_time_seconds REAL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (item_id) REFERENCES feed_items(id) ON DELETE CASCADE,
      FOREIGN KEY (image_id) REFERENCES generated_images(id) ON DELETE SET NULL
    )
  `);

    // Sentiment Analysis table
    db.run(`
    CREATE TABLE IF NOT EXISTS sentiment_analysis (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      item_id INTEGER NOT NULL,
      sentiment_score REAL,
      sentiment_label TEXT,
      positive_score REAL,
      negative_score REAL,
      neutral_score REAL,
      emotions TEXT,
      subjectivity_score REAL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (item_id) REFERENCES feed_items(id) ON DELETE CASCADE
    )
  `);

    // Keywords and Entities table
    db.run(`
    CREATE TABLE IF NOT EXISTS keywords (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      item_id INTEGER NOT NULL,
      keyword TEXT NOT NULL,
      relevance_score REAL,
      keyword_type TEXT,
      frequency INTEGER DEFAULT 1,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (item_id) REFERENCES feed_items(id) ON DELETE CASCADE
    )
  `);

    // Categories and Tags table
    db.run(`
    CREATE TABLE IF NOT EXISTS tags (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      item_id INTEGER NOT NULL,
      tag_name TEXT NOT NULL,
      tag_type TEXT,
      confidence REAL,
      auto_generated BOOLEAN DEFAULT 1,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (item_id) REFERENCES feed_items(id) ON DELETE CASCADE
    )
  `);

    // Trending Topics table
    db.run(`
    CREATE TABLE IF NOT EXISTS trending_topics (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      topic TEXT UNIQUE NOT NULL,
      mention_count INTEGER DEFAULT 1,
      trend_score REAL,
      first_seen DATETIME DEFAULT CURRENT_TIMESTAMP,
      last_seen DATETIME DEFAULT CURRENT_TIMESTAMP,
      peak_date DATETIME,
      related_items TEXT,
      status TEXT DEFAULT 'active'
    )
  `);

    // User Accounts table (for authentication)
    db.run(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT UNIQUE NOT NULL,
      email TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      role TEXT DEFAULT 'user',
      api_key TEXT UNIQUE,
      active BOOLEAN DEFAULT 1,
      last_login DATETIME,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

    // Processing Jobs table
    db.run(`
    CREATE TABLE IF NOT EXISTS processing_jobs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      job_type TEXT NOT NULL,
      item_id INTEGER,
      status TEXT DEFAULT 'pending',
      priority INTEGER DEFAULT 5,
      attempts INTEGER DEFAULT 0,
      max_attempts INTEGER DEFAULT 3,
      error_message TEXT,
      started_at DATETIME,
      completed_at DATETIME,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (item_id) REFERENCES feed_items(id) ON DELETE CASCADE
    )
  `);

    // Webhooks table
    db.run(`
    CREATE TABLE IF NOT EXISTS webhooks (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      url TEXT NOT NULL,
      event_type TEXT NOT NULL,
      active BOOLEAN DEFAULT 1,
      secret TEXT,
      last_triggered DATETIME,
      success_count INTEGER DEFAULT 0,
      failure_count INTEGER DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

    // Analytics Events table
    db.run(`
    CREATE TABLE IF NOT EXISTS analytics_events (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      event_type TEXT NOT NULL,
      event_data TEXT,
      item_id INTEGER,
      user_id INTEGER,
      ip_address TEXT,
      user_agent TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (item_id) REFERENCES feed_items(id) ON DELETE SET NULL,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
    )
  `);

    // Social Media Shares table
    db.run(`
    CREATE TABLE IF NOT EXISTS social_shares (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      item_id INTEGER NOT NULL,
      platform TEXT NOT NULL,
      share_url TEXT,
      post_id TEXT,
      status TEXT DEFAULT 'pending',
      scheduled_time DATETIME,
      posted_at DATETIME,
      engagement_count INTEGER DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (item_id) REFERENCES feed_items(id) ON DELETE CASCADE
    )
  `);

    // Export History table
    db.run(`
    CREATE TABLE IF NOT EXISTS export_history (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      export_type TEXT NOT NULL,
      file_path TEXT,
      file_format TEXT,
      items_count INTEGER,
      file_size_bytes INTEGER,
      user_id INTEGER,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
    )
  `);

    // System Logs table
    db.run(`
    CREATE TABLE IF NOT EXISTS system_logs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      level TEXT NOT NULL,
      message TEXT NOT NULL,
      module TEXT,
      error_stack TEXT,
      metadata TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

    // Create indexes for better performance
    db.run(`CREATE INDEX IF NOT EXISTS idx_feed_items_feed_id ON feed_items(feed_id)`);
    db.run(`CREATE INDEX IF NOT EXISTS idx_feed_items_published ON feed_items(published_date DESC)`);
    db.run(`CREATE INDEX IF NOT EXISTS idx_summaries_item_id ON summaries(item_id)`);
    db.run(`CREATE INDEX IF NOT EXISTS idx_images_item_id ON generated_images(item_id)`);
    db.run(`CREATE INDEX IF NOT EXISTS idx_videos_item_id ON generated_videos(item_id)`);
    db.run(`CREATE INDEX IF NOT EXISTS idx_keywords_item_id ON keywords(item_id)`);
    db.run(`CREATE INDEX IF NOT EXISTS idx_tags_item_id ON tags(item_id)`);
    db.run(`CREATE INDEX IF NOT EXISTS idx_jobs_status ON processing_jobs(status, priority DESC)`);
    db.run(`CREATE INDEX IF NOT EXISTS idx_analytics_created ON analytics_events(created_at DESC)`);
    db.run(`CREATE INDEX IF NOT EXISTS idx_trending_score ON trending_topics(trend_score DESC)`);

    console.log('✅ Database initialized successfully with all tables and indexes!');
});

db.close();
