import express, { type Request, type Response, type NextFunction } from "express"
import cors from "cors"
import mongoose from "mongoose"
import multer from "multer"
import path from "path"
import fs from "fs"
import { Video } from "./models/Video"
import { Transcript } from "./models/Transcript"
import { MCQ } from "./models/MCQ"

const app = express()

app.use(
  cors({
    origin: "http://localhost:3000",
    credentials: true,
  }),
)

app.use(express.json({ limit: "50mb" }))
app.use(express.urlencoded({ extended: true, limit: "50mb" }))

// Serve static files from public directory
app.use("/public", express.static(path.join(__dirname, "../public")))

// Ensure public directory exists
const publicDir = path.join(__dirname, "../public")
if (!fs.existsSync(publicDir)) {
  fs.mkdirSync(publicDir, { recursive: true })
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(__dirname, "../public")
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true })
    }
    cb(null, uploadDir)
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9)
    const filename = file.fieldname + "-" + uniqueSuffix + path.extname(file.originalname)
    cb(null, filename)
  },
})

const upload = multer({
  storage,
  limits: { fileSize: 500000000 },
  fileFilter: (req, file, cb) => {
    const allowedTypes = ["video/mp4", "video/avi", "video/mov", "video/mkv", "video/webm"]
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true)
    } else {
      cb(new Error("Only video files are allowed"))
    }
  },
})

app.post("/api/upload", upload.single("video"), async (req: Request, res: Response) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: "No video file provided" })
    }

    const videoData = {
      id: `video-${Date.now()}`,
      filename: req.file.originalname,
      filepath: req.file.filename, // Store just the filename, not full path
      size: `${(req.file.size / (1024 * 1024)).toFixed(1)} MB`,
      duration: "Unknown",
      uploadedAt: new Date().toISOString(),
      status: "uploaded" as const,
    }

    res.json(videoData)
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error"
    res.status(500).json({ success: false, message: "Upload failed", error: errorMessage })
  }
})

app.post("/api/videos", async (req: Request, res: Response) => {
  try {
    const { id, filename, size, duration, uploadedAt, status, filepath } = req.body

    const videoData = {
      videoId: id,
      filename,
      filepath: filepath || filename, // Use filepath if provided, otherwise use filename
      size,
      duration,
      uploadedAt,
      status,
    }

    const existingVideo = await Video.findOne({ videoId: id })

    if (existingVideo) {
      Object.assign(existingVideo, videoData)
      await existingVideo.save()
    } else {
      const video = new Video(videoData)
      await video.save()
    }

    res.json({ success: true })
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error"
    res.status(500).json({ success: false, error: errorMessage })
  }
})

// Get all videos with transcript and MCQ counts
app.get("/api/videos", async (req: Request, res: Response) => {
  try {
    const videos = await Video.find().sort({ uploadedAt: -1 })

    // Get transcript and MCQ counts for each video
    const videosWithCounts = await Promise.all(
      videos.map(async (video) => {
        const [transcript, mcq] = await Promise.all([
          Transcript.findOne({ videoId: video.videoId }),
          MCQ.findOne({ videoId: video.videoId }),
        ])

        return {
          id: video.videoId,
          filename: video.filename,
          filepath: video.filepath,
          size: video.size,
          duration: video.duration,
          uploadedAt: video.uploadedAt,
          status: video.status,
          transcriptCount: transcript?.segments?.length || 0,
          mcqCount: mcq?.questions?.length || 0,
        }
      }),
    )

    res.json({ success: true, videos: videosWithCounts })
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error"
    res.status(500).json({ success: false, error: errorMessage })
  }
})

// Get video file
app.get("/api/videos/:videoId/file", async (req: Request, res: Response) => {
  try {
    const { videoId } = req.params
    const video = await Video.findOne({ videoId })

    if (!video) {
      return res.status(404).json({ success: false, message: "Video not found" })
    }

    const filePath = path.join(__dirname, "../public", video.filepath)

    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ success: false, message: "Video file not found" })
    }

    res.sendFile(filePath)
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error"
    res.status(500).json({ success: false, error: errorMessage })
  }
})

// Delete video and all associated data
app.delete("/api/videos/:videoId", async (req: Request, res: Response) => {
  try {
    const { videoId } = req.params

    // Find the video first
    const video = await Video.findOne({ videoId })
    if (!video) {
      return res.status(404).json({ success: false, message: "Video not found" })
    }

    // Delete the physical file
    const filePath = path.join(__dirname, "../public", video.filepath)
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath)
    }

    // Delete from database
    await Promise.all([Video.deleteOne({ videoId }), Transcript.deleteOne({ videoId }), MCQ.deleteOne({ videoId })])

    res.json({ success: true, message: "Video deleted successfully" })
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error"
    res.status(500).json({ success: false, error: errorMessage })
  }
})

app.post("/api/transcripts", async (req: Request, res: Response) => {
  try {
    const { videoId, segments } = req.body

    if (!videoId || !segments) {
      return res.status(400).json({ success: false, message: "videoId and segments are required" })
    }

    const existingTranscript = await Transcript.findOne({ videoId })

    if (existingTranscript) {
      existingTranscript.segments = segments
      await existingTranscript.save()
    } else {
      const transcript = new Transcript({ videoId, segments })
      await transcript.save()
    }

    res.json({ success: true })
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error"
    res.status(500).json({ success: false, error: errorMessage })
  }
})

app.post("/api/mcqs", async (req: Request, res: Response) => {
  try {
    const { videoId, questions } = req.body

    if (!videoId || !questions) {
      return res.status(400).json({ success: false, message: "videoId and questions are required" })
    }

    const existingMCQ = await MCQ.findOne({ videoId })

    if (existingMCQ) {
      existingMCQ.questions.push(...questions)
      await existingMCQ.save()
    } else {
      const mcq = new MCQ({ videoId, questions })
      await mcq.save()
    }

    res.json({ success: true })
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error"
    res.status(500).json({ success: false, error: errorMessage })
  }
})

app.put("/api/mcqs/:questionId", async (req: Request, res: Response) => {
  try {
    const { questionId } = req.params
    const updates = req.body

    const mcq = await MCQ.findOne({ "questions.id": questionId })

    if (!mcq) {
      return res.status(404).json({ success: false, message: "MCQ not found" })
    }

    const questionIndex = mcq.questions.findIndex((q) => q.id === questionId)

    if (questionIndex === -1) {
      return res.status(404).json({ success: false, message: "Question not found" })
    }

    mcq.questions[questionIndex] = { ...mcq.questions[questionIndex], ...updates }
    await mcq.save()

    res.json(mcq.questions[questionIndex])
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error"
    res.status(500).json({ success: false, error: errorMessage })
  }
})

app.get("/api/videos/:videoId", async (req: Request, res: Response) => {
  try {
    const { videoId } = req.params
    const video = await Video.findOne({ videoId })

    if (!video) {
      return res.status(404).json({ success: false, message: "Video not found" })
    }

    res.json({ success: true, video })
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error"
    res.status(500).json({ success: false, error: errorMessage })
  }
})

app.get("/api/transcripts/:videoId", async (req: Request, res: Response) => {
  try {
    const { videoId } = req.params
    const transcript = await Transcript.findOne({ videoId })

    if (!transcript) {
      return res.status(404).json({ success: false, message: "Transcript not found" })
    }

    res.json({ success: true, segments: transcript.segments })
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error"
    res.status(500).json({ success: false, error: errorMessage })
  }
})

app.get("/api/mcqs/:videoId", async (req: Request, res: Response) => {
  try {
    const { videoId } = req.params
    const mcq = await MCQ.findOne({ videoId })

    if (!mcq) {
      return res.status(404).json({ success: false, message: "MCQs not found" })
    }

    res.json({ success: true, questions: mcq.questions })
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error"
    res.status(500).json({ success: false, error: errorMessage })
  }
})

app.get("/health", (req: Request, res: Response) => {
  res.json({
    status: "OK",
    timestamp: new Date().toISOString(),
    services: {
      mongodb: mongoose.connection.readyState === 1 ? "connected" : "disconnected",
      whisper: "http://localhost:8000/transcribe-stream",
      ollama: "http://localhost:11434/api/generate",
    },
  })
})

app.use((error: Error, req: Request, res: Response, next: NextFunction) => {
  console.error("Error:", error)
  res.status(500).json({
    success: false,
    message: error.message || "Internal server error",
  })
})

async function connectToDatabase() {
  try {
    await mongoose.connect(
      "mongodb+srv://vermachandan2912003:zpsz6jCpvjcjadU0@ecommerce.x09eh.mongodb.net/videomcq?retryWrites=true&w=majority",
    )
    console.log("✅ Connected to MongoDB")
  } catch (error) {
    console.error("❌ MongoDB connection error:", error)
    process.exit(1)
  }
}

async function startServer() {
  await connectToDatabase()

  const PORT = 3001
  app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`)
    console.log(`📊 Health check: http://localhost:${PORT}/health`)
    console.log(`📁 Static files: http://localhost:${PORT}/public`)
  })
}

startServer().catch((error) => {
  console.error("Failed to start server:", error)
  process.exit(1)
})

export default app
