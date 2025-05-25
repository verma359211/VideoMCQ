# Video MCQ Generator Backend - Setup Guide

This backend handles video upload, transcription, and MCQ generation using local AI models or cloud APIs.

## 🚀 Complete Setup Instructions

### 1. Prerequisites
\`\`\`bash
# Install Node.js (v18 or higher)
# Install Python (v3.8 or higher)
# Install FFmpeg for video processing
# Install MongoDB (local or Atlas)
\`\`\`

### 2. Install Dependencies
\`\`\`bash
npm install
\`\`\`

### 3. Install Python Dependencies (for Whisper)
\`\`\`bash
# Install Whisper for transcription
pip install openai-whisper
pip install torch torchvision torchaudio

# Alternative: Use Whisper API instead of local installation
# pip install openai
\`\`\`

### 4. Install Ollama (for Local LLM)
\`\`\`bash
# On macOS
brew install ollama

# On Linux
curl -fsSL https://ollama.ai/install.sh | sh

# On Windows
# Download from https://ollama.ai/download

# Pull a model for MCQ generation
ollama pull llama3.1:8b
# or
ollama pull mistral:7b
# or 
ollama pull codellama:7b
\`\`\`

### 5. Setup MongoDB
\`\`\`bash
# Install MongoDB locally or use MongoDB Atlas
# Create database: video-mcq-generator
# Create collections: videos, transcripts, mcqs
\`\`\`

### 6. Environment Variables
Create `.env` file:
\`\`\`env
# Server Configuration
PORT=3001
NODE_ENV=development

# Database
MONGODB_URI=mongodb://localhost:27017/video-mcq-generator
# OR for MongoDB Atlas:
# MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/video-mcq-generator

# File Storage
UPLOAD_DIR=./uploads
TEMP_DIR=./temp
MAX_FILE_SIZE=500000000

# AI Services
WHISPER_MODEL_SIZE=base
# Options: tiny, base, small, medium, large

# Local LLM (Ollama)
LLM_API_URL=http://localhost:11434
LLM_MODEL_NAME=llama3.1:8b

# Alternative: OpenAI API (if not using local LLM)
# OPENAI_API_KEY=your_openai_api_key_here

# CORS
CORS_ORIGIN=http://localhost:3000

# WebSocket
WS_PORT=3002
\`\`\`

### 7. File Structure
\`\`\`
backend/
├── src/
│   ├── controllers/     # API route handlers
│   │   ├── upload.controller.ts
│   │   ├── transcript.controller.ts
│   │   └── mcq.controller.ts
│   ├── services/        # Business logic
│   │   ├── video.service.ts
│   │   ├── transcription.service.ts
│   │   └── mcq-generation.service.ts
│   ├── models/          # Database models
│   │   ├── video.model.ts
│   │   ├── transcript.model.ts
│   │   └── mcq.model.ts
│   ├── middleware/      # Custom middleware
│   │   ├── upload.middleware.ts
│   │   └── error.middleware.ts
│   ├── utils/           # Utility functions
│   │   ├── ffmpeg.util.ts
│   │   └── whisper.util.ts
│   └── app.ts          # Express app setup
├── uploads/            # Video file storage
├── temp/               # Processing temp files
├── package.json
└── .env
\`\`\`

### 8. API Endpoints
- POST /api/upload - Upload video file
- POST /api/transcript/:videoId - Generate transcript
- POST /api/mcq/:videoId - Generate MCQ questions
- GET /api/status/:videoId - Get processing status
- WebSocket /ws/status/:videoId - Real-time updates

### 9. Processing Pipeline
1. Video Upload → Temporary storage
2. Audio Extraction → FFmpeg
3. Transcription → Whisper
4. Segmentation → 5-minute chunks
5. MCQ Generation → Local LLM
6. Storage → MongoDB
7. Cleanup → Remove temp files

### 10. Run Development Server
\`\`\`bash
npm run dev
\`\`\`

The backend will run on http://localhost:3001

## 🔧 Implementation Checklist

### Backend Controllers (Implement these files):

#### 1. Upload Controller (`src/controllers/upload.controller.ts`)
\`\`\`typescript
// TODO: Implement video upload handling
// - File validation (video formats, size limits)
// - Save to uploads directory
// - Create video record in database
// - Return video metadata
\`\`\`

#### 2. Transcript Controller (`src/controllers/transcript.controller.ts`)
\`\`\`typescript
// TODO: Implement transcript generation
// - Extract audio from video using FFmpeg
// - Process with Whisper AI
// - Segment transcript into 5-minute chunks
// - Save segments to database
// - WebSocket progress updates
\`\`\`

#### 3. MCQ Controller (`src/controllers/mcq.controller.ts`)
\`\`\`typescript
// TODO: Implement MCQ generation
// - Get transcript segments from database
// - Send to LLM (Ollama/OpenAI) for question generation
// - Parse and validate generated questions
// - Save questions to database
// - WebSocket progress updates
\`\`\`

### Backend Services (Implement these files):

#### 1. Video Service (`src/services/video.service.ts`)
\`\`\`typescript
// TODO: Implement video management
// - CRUD operations for videos
// - File metadata extraction
// - Status management
\`\`\`

#### 2. Transcription Service (`src/services/transcription.service.ts`)
\`\`\`typescript
// TODO: Implement transcription logic
// - FFmpeg audio extraction
// - Whisper AI integration
// - Transcript segmentation
// - Error handling and retries
\`\`\`

#### 3. MCQ Generation Service (`src/services/mcq-generation.service.ts`)
\`\`\`typescript
// TODO: Implement MCQ generation logic
// - LLM prompt engineering
// - Response parsing and validation
// - Question quality scoring
// - Batch processing for multiple segments
\`\`\`

### Database Models (Implement these files):

#### 1. Video Model (`src/models/video.model.ts`)
\`\`\`typescript
// TODO: Define video schema
// - File metadata (name, size, duration, format)
// - Processing status
// - Upload timestamp
// - File path
\`\`\`

#### 2. Transcript Model (`src/models/transcript.model.ts`)
\`\`\`typescript
// TODO: Define transcript schema
// - Video reference
// - Segment number and timing
// - Transcript text
// - Processing metadata
\`\`\`

#### 3. MCQ Model (`src/models/mcq.model.ts`)
\`\`\`typescript
// TODO: Define MCQ schema
// - Video and segment references
// - Question text and options
// - Correct answer and explanation
// - Difficulty level and tags
\`\`\`

## 🤖 AI Integration Steps

### 1. Whisper AI Setup
\`\`\`bash
# Option A: Local Whisper Installation
pip install openai-whisper

# Test installation
whisper --help

# Option B: OpenAI Whisper API
# Add OPENAI_API_KEY to .env
# Use API calls instead of local processing
\`\`\`

### 2. LLM Setup (Choose one):

#### Option A: Local LLM with Ollama (Recommended)
\`\`\`bash
# Install Ollama
ollama pull llama3.1:8b

# Test the model
ollama run llama3.1:8b "Generate a multiple choice question about AI"

# API endpoint: http://localhost:11434/api/generate
\`\`\`

#### Option B: OpenAI API
\`\`\`bash
# Add to .env:
# OPENAI_API_KEY=your_key_here

# Use GPT-3.5-turbo or GPT-4 for MCQ generation
\`\`\`

#### Option C: Other LLM APIs
\`\`\`bash
# Anthropic Claude
# ANTHROPIC_API_KEY=your_key_here

# Google Gemini
# GOOGLE_API_KEY=your_key_here

# Hugging Face
# HUGGINGFACE_API_KEY=your_key_here
\`\`\`

## 🚀 Running the Application

### 1. Start Backend Services
\`\`\`bash
# Start MongoDB (if local)
mongod

# Start Ollama (if using local LLM)
ollama serve

# Start backend server
cd backend
npm run dev
\`\`\`

### 2. Start Frontend
\`\`\`bash
# Start Next.js frontend
cd frontend
npm run dev
\`\`\`

### 3. Test the Pipeline
\`\`\`bash
# 1. Upload a video file
# 2. Generate transcript (check Whisper processing)
# 3. Generate MCQs (check LLM processing)
# 4. Verify WebSocket real-time updates
\`\`\`

## 🔍 Debugging & Monitoring

### 1. Check Logs
\`\`\`bash
# Backend logs
tail -f backend/logs/app.log

# MongoDB logs
tail -f /var/log/mongodb/mongod.log

# Ollama logs
ollama logs
\`\`\`

### 2. Test AI Services
\`\`\`bash
# Test Whisper
whisper test-audio.wav --model base

# Test Ollama
curl http://localhost:11434/api/generate -d '{
  "model": "llama3.1:8b",
  "prompt": "Generate a multiple choice question about machine learning"
}'
\`\`\`

### 3. Monitor Performance
\`\`\`bash
# Check GPU usage (if using GPU acceleration)
nvidia-smi

# Check CPU and memory
htop

# Check disk space
df -h
\`\`\`

## 📝 Next Steps After Setup

1. **Test with sample video**: Upload a short video to test the complete pipeline
2. **Optimize performance**: Adjust model sizes based on your hardware
3. **Configure scaling**: Set up load balancing for production
4. **Add authentication**: Implement user management if needed
5. **Monitor costs**: Track API usage if using cloud services
6. **Backup strategy**: Set up database backups
7. **Error handling**: Implement comprehensive error logging
8. **Security**: Add rate limiting and input validation

## 🆘 Common Issues & Solutions

### Whisper Issues:
- **Out of memory**: Use smaller model (tiny/base instead of large)
- **Slow processing**: Enable GPU acceleration or use API
- **Audio format errors**: Ensure FFmpeg is properly installed

### LLM Issues:
- **Ollama not responding**: Check if service is running (`ollama serve`)
- **Poor question quality**: Improve prompts or try different models
- **Rate limiting**: Implement request queuing for API services

### Database Issues:
- **Connection errors**: Check MongoDB service and connection string
- **Slow queries**: Add proper indexes to models
- **Storage space**: Monitor disk usage for video files

This setup will give you a fully functional AI-powered video MCQ generator!
