# VideoMCQ - AI-Powered Learning Platform

Transform educational videos into AI-generated transcripts and multiple-choice questions automatically.

## 🎯 What Does This Application Do?

VideoMCQ is a smart web application that takes your video files and:

1. **Extracts Speech**: Uses AI to convert spoken words in videos to text
2. **Creates Segments**: Breaks down the transcript into 1-minute chunks for easy reading
3. **Generates Questions**: Uses AI to create multiple-choice questions from the content
4. **Saves Everything**: Stores your videos, transcripts, and questions for future use
5. **Exports Content**: Lets you download questions as PDF or copy them

## 🏗️ System Architecture

\`\`\`
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Frontend      │    │   Backend       │    │   AI Services   │
│   (Next.js)     │◄──►│   (Node.js)     │◄──►│                 │
│   Port: 3000    │    │   Port: 3001    │    │ Whisper: 8000   │
└─────────────────┘    └─────────────────┘    │ Ollama: 11434   │
                                              └─────────────────┘
                              │
                              ▼
                       ┌─────────────────┐
                       │    MongoDB      │
                       │   (Database)    │
                       └─────────────────┘
\`\`\`

## 🚀 Features Implemented

### ✅ Core Features
- **Video Upload**: Drag & drop video files (MP4, AVI, MOV, MKV, WebM)
- **AI Transcription**: Real-time speech-to-text with progress tracking
- **Smart Segmentation**: Automatic 1-minute transcript segments
- **MCQ Generation**: AI-powered multiple choice questions with explanations
- **Video Management**: Save, search, and organize multiple videos
- **Content Editing**: Edit generated questions and answers
- **Export Options**: PDF export and clipboard copying

### ✅ User Interface
- **Landing Page**: Overview of all saved videos
- **Real-time Progress**: Live updates during AI processing
- **Dark/Light Theme**: Toggle between themes
- **Responsive Design**: Works on desktop and mobile
- **Video Player**: Built-in player with chapter navigation

### ✅ Data Management
- **Persistent Storage**: Videos saved in backend, metadata in MongoDB
- **Auto-save**: Automatic saving of progress
- **Search & Filter**: Find videos by name
- **Status Tracking**: Monitor processing stages
- **Error Handling**: Graceful error recovery

## 📋 Prerequisites

Before you start, make sure you have:

- **Node.js** (v18 or higher)
- **Python** (v3.8 or higher)
- **MongoDB** (local installation or Atlas account)
- **Git** for cloning the repository

## 🛠️ Installation & Setup

### 1. Clone the Repository
\`\`\`bash
git clone <your-repo-url>
cd video-mcq-generator
\`\`\`

### 2. Setup Frontend (Next.js)
# Install dependencies
npm install

# Start development server
npm run dev
\`\`\`
Frontend will run on: `http://localhost:3000`

### 3. Setup Backend (Node.js)
\`\`\`bash
# Navigate to backend directory
cd backend

# Install dependencies
npm install

# Create environment file
touch .env
\`\`\`

Add to `.env` file:
\`\`\`env
# MongoDB Connection
MONGODB_URI=mongodb+srv://your-username:your-password@cluster.mongodb.net/videomcq?retryWrites=true&w=majority

# Server Configuration
PORT=3001
NODE_ENV=development

# File Storage
UPLOAD_DIR=./public
MAX_FILE_SIZE=500000000

# AI Services
WHISPER_API_URL=http://localhost:8000
OLLAMA_API_URL=http://localhost:11434
\`\`\`

\`\`\`bash
# Start backend server
npm run dev
\`\`\`
Backend will run on: `http://localhost:3001`

### 4. Setup Transcript AI Service (Python)
\`\`\`bash
# Navigate to transcript backend
cd transcript-backend

# Install Python dependencies
pip install fastapi uvicorn openai-whisper torch

# Start the transcript service
uvicorn main:app --host 0.0.0.0 --port 8000 --reload
\`\`\`
Transcript AI will run on: `http://localhost:8000`

### 5. Setup Ollama (Local LLM)
\`\`\`bash
# Install Ollama (macOS)
brew install ollama

# Install Ollama (Linux)
curl -fsSL https://ollama.ai/install.sh | sh

# Install Ollama (Windows)
# Download from: https://ollama.ai/download

# Pull the Mistral model
ollama pull mistral

# Start Ollama service
ollama serve
\`\`\`
Ollama will run on: `http://localhost:11434`

### 6. Setup MongoDB

#### Option A: MongoDB Atlas (Cloud)
1. Go to [MongoDB Atlas](https://www.mongodb.com/atlas)
2. Create a free account
3. Create a new cluster
4. Get your connection string
5. Add it to your `.env` file

#### Option B: Local MongoDB
\`\`\`bash
# Install MongoDB locally
# macOS
brew install mongodb-community

# Start MongoDB
brew services start mongodb-community

# Use local connection string
MONGODB_URI=mongodb://localhost:27017/videomcq
\`\`\`

## 🔄 Application Flow

### Step 1: Upload Video
1. User visits the landing page
2. Clicks "Create New Project"
3. Drags and drops a video file
4. Video is uploaded and saved to backend

### Step 2: Generate Transcript
1. User clicks "Generate Transcript"
2. Video is sent to Whisper AI service (port 8000)
3. AI processes audio and returns text segments
4. Segments appear in real-time as they're processed
5. Transcript is saved to MongoDB

### Step 3: Create MCQ Questions
1. User clicks "Generate MCQs"
2. Transcript segments are sent to Ollama (port 11434)
3. AI analyzes content and creates questions
4. Questions appear one by one as they're generated
5. MCQs are saved to MongoDB

### Step 4: Review and Edit
1. User can edit questions, options, and explanations
2. Changes are automatically saved
3. User can export as PDF or copy to clipboard

### Step 5: Manage Videos
1. All processed videos appear on landing page
2. User can search, filter, and reopen projects
3. Delete videos and associated data

## 🌐 API Endpoints

### Frontend (Next.js) - Port 3000
- Main application interface
- Video upload and management
- Real-time progress tracking

### Backend (Node.js) - Port 3001
- `POST /api/upload` - Upload video files
- `GET /api/videos` - Get all videos
- `POST /api/transcripts` - Save transcript data
- `POST /api/mcqs` - Save MCQ data
- `PUT /api/mcqs/:id` - Update MCQ questions

### Transcript AI (Python) - Port 8000
- `POST /transcribe-stream` - Stream transcript generation
- Uses Whisper AI for speech-to-text conversion

### Ollama (LLM) - Port 11434
- `POST /api/generate` - Generate MCQ questions
- Uses Mistral model for question creation

## 🗂️ Project Structure

\`\`\`
video-mcq-generator/
├── frontend/                    # Next.js Frontend
│   ├── app/                    # App router pages
│   │   ├── page.tsx           # Landing page
│   │   └── layout.tsx         # Root layout
│   ├── components/            # UI Components
│   │   ├── video-upload.tsx   # Video upload component
│   │   ├── transcript-display.tsx # Transcript viewer
│   │   ├── mcq-panel.tsx      # MCQ management
│   │   └── video-workspace.tsx # Main workspace
│   ├── lib/                   # Utilities
│   │   ├── api-client.ts      # API communication
│   │   └── types.ts           # TypeScript types
│   └── package.json
│
├── backend/                    # Node.js Backend
│   ├── src/
│   │   ├── models/            # MongoDB schemas
│   │   │   ├── Video.ts       # Video metadata
│   │   │   ├── Transcript.ts  # Transcript segments
│   │   │   └── MCQ.ts         # MCQ questions
│   │   └── app.ts             # Express server
│   ├── public/                # Video file storage
│   └── package.json
│
├── transcript-backend/         # Python AI Service
│   ├── main.py                # FastAPI server
│   └── requirements.txt       # Python dependencies
│
└── README.md                  # This file
\`\`\`

## 🚦 Running the Complete Application

### Start All Services (in order):

1. **MongoDB**: Make sure MongoDB is running
2. **Ollama**: `ollama serve`
3. **Transcript AI**: `cd transcript-backend && uvicorn main:app --host 0.0.0.0 --port 8000 --reload`
4. **Backend**: `cd backend && npm run dev`
5. **Frontend**: `cd frontend && npm run dev`

### Check if Everything is Working:
- Frontend: `http://localhost:3000`
- Backend Health: `http://localhost:3001/health`
- Transcript AI: `http://localhost:8000/docs`
- Ollama: `http://localhost:11434`

## 🎮 How to Use

1. **Open the App**: Go to `http://localhost:3000`
2. **Create Project**: Click "Create New Project"
3. **Upload Video**: Drag and drop your video file
4. **Generate Transcript**: Click "Generate Transcript" and wait
5. **Create Questions**: Click "Generate MCQs" after transcript is ready
6. **Edit & Export**: Modify questions and export as needed
7. **Manage Videos**: Return to home page to see all your projects

## 🔧 Troubleshooting

### Common Issues:

**Video upload fails:**
- Check file size (max 500MB)
- Ensure video format is supported
- Check backend is running on port 3001

**Transcript generation stuck:**
- Verify Whisper AI service is running on port 8000
- Check Python dependencies are installed
- Look at transcript-backend logs

**MCQ generation fails:**
- Ensure Ollama is running on port 11434
- Check if Mistral model is downloaded: `ollama list`
- Verify transcript exists before generating MCQs

**Database connection issues:**
- Check MongoDB URI in .env file
- Ensure MongoDB service is running
- Verify network connectivity for Atlas

## 📝 Environment Variables

Create `.env` file in backend directory:

\`\`\`env
# Required
MONGODB_URI=your_mongodb_connection_string

# Optional (with defaults)
PORT=3001
NODE_ENV=development
UPLOAD_DIR=./public
MAX_FILE_SIZE=500000000
WHISPER_API_URL=http://localhost:8000
OLLAMA_API_URL=http://localhost:11434
\`\`\`

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 🆘 Support

If you encounter issues:
1. Check the troubleshooting section
2. Verify all services are running
3. Check the console logs for errors
4. Create an issue on GitHub

---

**Happy Learning! 🎓**
