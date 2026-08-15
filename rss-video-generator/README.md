# 🚀 RSS Video Generator

An advanced, AI-powered RSS feed processing system that automatically summarizes news articles, generates stunning images, and creates videos in multiple formats. Built with Node.js, Express, and modern web technologies.

![Version](https://img.shields.io/badge/version-1.0.0-blue.svg)
![License](https://img.shields.io/badge/license-MIT-green.svg)
![Node](https://img.shields.io/badge/node-%3E%3D16.0.0-brightgreen.svg)

## ✨ Features

### 🎯 Core Features
- **RSS Feed Management** - Add, manage, and automatically fetch from multiple RSS feeds
- **AI Summarization** - Generate concise summaries using OpenAI GPT or Gemini AI
- **Sentiment Analysis** - Analyze emotional tone and subjectivity of articles
- **Keyword Extraction** - Automatically extract key terms and named entities
- **Image Generation** - Create beautiful, branded images from summaries
- **Multi-Format Video** - Generate videos in MP4, WebM, and GIF formats
- **Real-time Updates** - WebSocket integration for live progress tracking

### 🔥 Advanced Features
- **Trending Analysis** - Track and identify trending topics across feeds
- **Duplicate Detection** - Automatically identify and flag duplicate content
- **Scheduled Processing** - Auto-fetch feeds at configurable intervals
- **Webhook Support** - Trigger external services on events
- **Email Notifications** - Get notified about important events
- **Social Media Integration** - Auto-post to Twitter, Facebook (optional)
- **Analytics Dashboard** - Comprehensive statistics and insights
- **Export Capabilities** - Export data as JSON, CSV, or PDF
- **User Authentication** - Secure API with JWT tokens (optional)
- **Rate Limiting** - Protect your API from abuse
- **Comprehensive Logging** - Winston-based logging system

### 🎨 Video Styles
- **Fade** - Smooth fade in/out transitions
- **Zoom** - Ken Burns effect with zoom
- **Pan** - Cinematic panning motion
- **Slide** - Sliding transitions
- **Static** - Simple static display

### 🖼️ Image Styles
- **Modern** - Sleek dark theme with blue accents
- **Minimalist** - Clean, simple design
- **Vibrant** - Bold, colorful gradients
- **Dark** - Deep black theme
- **Professional** - Corporate blue theme

## 📋 Prerequisites

- **Node.js** >= 16.0.0
- **FFmpeg** (for video generation)
- **OpenAI API Key** (optional, for AI summarization)
- **Gemini API Key** (optional, alternative to OpenAI)

### Installing FFmpeg

**Windows:**
```bash
# Using Chocolatey
choco install ffmpeg

# Or download from https://ffmpeg.org/download.html
```

**macOS:**
```bash
brew install ffmpeg
```

**Linux:**
```bash
sudo apt-get install ffmpeg
```

## 🚀 Quick Start

### 1. Clone or Navigate to Project
```bash
cd rss-video-generator
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Configure Environment
```bash
# Copy example environment file
cp .env.example .env

# Edit .env with your settings
notepad .env  # Windows
nano .env     # Linux/Mac
```

### 4. Initialize Database
```bash
npm run init-db
```

### 5. Start Server
```bash
npm start
# or for development
npm run dev
```

### 6. Open Web Interface
Open your browser to: **http://localhost:3000**

## ⚙️ Configuration

### Environment Variables

```env
# Server
PORT=3000
NODE_ENV=development

# AI APIs (at least one recommended)
OPENAI_API_KEY=your_key_here
GEMINI_API_KEY=your_key_here

# Database
DB_PATH=./data/rss_feeds.db

# RSS Feeds (comma-separated)
RSS_FEEDS=https://rss.nytimes.com/services/xml/rss/nyt/HomePage.xml

# Video Settings
VIDEO_WIDTH=1920
VIDEO_HEIGHT=1080
VIDEO_FPS=30
VIDEO_DURATION=5
VIDEO_FORMATS=mp4,webm,gif

# Image Settings
IMAGE_STYLES=modern,minimalist,vibrant,dark,professional
DEFAULT_IMAGE_STYLE=vibrant
IMAGE_QUALITY=95

# Scheduling
AUTO_FETCH_ENABLED=true
FETCH_INTERVAL_MINUTES=30
AUTO_CLEANUP_DAYS=7

# Email (optional)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email@gmail.com
SMTP_PASS=your_app_password

# Advanced Features
ENABLE_SENTIMENT_ANALYSIS=true
ENABLE_KEYWORD_EXTRACTION=true
ENABLE_TRENDING_ANALYSIS=true
ENABLE_WEBHOOKS=true
```

## 📚 API Documentation

### Feeds

#### Get All Feeds
```http
GET /api/feeds
```

#### Add Feed
```http
POST /api/feeds
Content-Type: application/json

{
  "url": "https://example.com/feed.xml",
  "name": "Example Feed",
  "category": "Technology",
  "language": "en"
}
```

#### Fetch Feed
```http
POST /api/feeds/:id/fetch
```

#### Fetch All Feeds
```http
POST /api/feeds/fetch-all
```

### Items

#### Get Items
```http
GET /api/items?limit=50&offset=0&feedId=1
```

#### Get Single Item
```http
GET /api/items/:id
```

#### Process Item
```http
POST /api/items/:id/process
Content-Type: application/json

{
  "style": "vibrant",
  "videoFormats": ["mp4", "webm"],
  "videoStyle": "fade"
}
```

### Analytics

#### Get Trending Topics
```http
GET /api/analytics/trending
```

#### Get Statistics
```http
GET /api/analytics/stats
```

### Export

#### Export as JSON
```http
GET /api/export/json?itemIds=1,2,3
```

#### Export as CSV
```http
GET /api/export/csv?itemIds=1,2,3
```

### Webhooks

#### Get Webhooks
```http
GET /api/webhooks
```

#### Add Webhook
```http
POST /api/webhooks
Content-Type: application/json

{
  "url": "https://example.com/webhook",
  "eventType": "item_processed",
  "secret": "your_secret"
}
```

## 🗄️ Database Schema

The system uses SQLite with the following main tables:

- **rss_feeds** - RSS feed sources
- **feed_items** - Individual articles/posts
- **summaries** - AI-generated summaries
- **generated_images** - Created images
- **generated_videos** - Generated videos
- **sentiment_analysis** - Sentiment data
- **keywords** - Extracted keywords
- **trending_topics** - Trending analysis
- **webhooks** - Webhook configurations
- **analytics_events** - Analytics tracking

## 🎯 Usage Examples

### Adding a Feed via API
```javascript
const response = await fetch('http://localhost:3000/api/feeds', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    url: 'https://feeds.bbci.co.uk/news/rss.xml',
    name: 'BBC News',
    category: 'News',
    language: 'en'
  })
});
```

### Processing an Item
```javascript
const response = await fetch('http://localhost:3000/api/items/1/process', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    style: 'vibrant',
    videoFormats: ['mp4', 'gif'],
    videoStyle: 'zoom'
  })
});
```

## 📁 Project Structure

```
rss-video-generator/
├── lib/
│   ├── ai-processor.js      # AI summarization & NLP
│   ├── database.js          # Database connection
│   ├── image-generator.js   # Image creation
│   ├── logger.js            # Logging system
│   ├── rss-manager.js       # RSS feed handling
│   ├── scheduler.js         # Cron jobs
│   ├── video-generator.js   # Video creation
│   └── webhook-manager.js   # Webhook handling
├── public/
│   ├── index.html          # Web interface
│   ├── styles.css          # Styling
│   └── app.js              # Frontend logic
├── scripts/
│   └── init-db.js          # Database initialization
├── data/                   # Database files
├── output/                 # Generated content
│   ├── images/
│   └── videos/
├── logs/                   # Application logs
├── server.js              # Main server
├── package.json
└── .env                   # Configuration
```

## 🔧 Troubleshooting

### FFmpeg Not Found
Make sure FFmpeg is installed and in your system PATH:
```bash
ffmpeg -version
```

### Database Locked
If you get database locked errors, make sure only one instance is running.

### WebSocket Connection Failed
Check if your firewall is blocking WebSocket connections on port 3000.

### Out of Memory
For large-scale processing, increase Node.js memory:
```bash
node --max-old-space-size=4096 server.js
```

## 🚀 Deployment

### Using PM2
```bash
npm install -g pm2
pm2 start server.js --name rss-video-generator
pm2 save
pm2 startup
```

### Using Docker
```dockerfile
FROM node:18
WORKDIR /app
COPY package*.json ./
RUN npm install
RUN apt-get update && apt-get install -y ffmpeg
COPY . .
EXPOSE 3000
CMD ["npm", "start"]
```

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License

This project is licensed under the MIT License.

## 🙏 Acknowledgments

- OpenAI for GPT API
- Google for Gemini API
- FFmpeg for video processing
- All open-source contributors

## 📞 Support

For issues and questions:
- Create an issue on GitHub
- Check the documentation
- Review the logs in `logs/` directory

---

**Made with ❤️ using Node.js and AI**
