/*
import { Request, Response } from 'express'
import { Post, UploadedFile, JsonController, Res, Req, Get } from 'routing-controllers'
import { VideoService } from '../services/video.service'
import { TranscriptionService } from '../services/transcription.service'
import { MCQGenerationService } from '../services/mcq-generation.service'
import multer from 'multer'
import path from 'path'
import fs from 'fs/promises'
import { exec } from 'child_process'
import sharp from 'sharp'

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, process.env.UPLOAD_DIR || './uploads')
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9)
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname))
  }
})

const upload = multer({ 
  storage,
  limits: { fileSize: parseInt(process.env.MAX_FILE_SIZE || '500000000') },
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['video/mp4', 'video/avi', 'video/mov', 'video/mkv', 'video/webm']
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true)
    } else {
      cb(new Error('Only MP4, AVI, MOV, MKV, and WebM video files are allowed'))
    }
  }
})

@JsonController('/api')
export class UploadController {
  private videoService = new VideoService()
  private transcriptionService = new TranscriptionService()
  private mcqService = new MCQGenerationService()

  @Post('/upload')
  async uploadVideo(@Req() req: Request, @Res() res: Response) {
    try {
      // Handle file upload with multer middleware
      upload.single('video')(req, res, async (err) => {
        if (err) {
          return res.status(400).json({ 
            success: false, 
            message: err.message 
          })
        }

        if (!req.file) {
          return res.status(400).json({ 
            success: false, 
            message: 'No video file provided' 
          })
        }

        // Extract video metadata using ffprobe
        const metadata = await extractVideoMetadata(req.file.path)

        // Generate video thumbnail for preview
        const thumbnailPath = path.join(process.env.TEMP_DIR || './temp', `thumbnail-${req.file.filename}`)
        await sharp(req.file.path)
          .resize(320, 240)
          .toFile(thumbnailPath)

        // Save video metadata to database
        const videoData = await this.videoService.createVideo({
          filename: req.file.originalname,
          filepath: req.file.path,
          size: req.file.size,
          mimetype: req.file.mimetype,
          duration: metadata.duration,
          resolution: metadata.resolution,
          status: 'uploaded'
        })

        res.json({
          success: true,
          videoId: videoData._id,
          message: 'Video uploaded successfully'
        })
      })
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Upload failed',
        error: error.message
      })
    }
  }

  @Post('/transcript/:videoId')
  async generateTranscript(@Req() req: Request, @Res() res: Response) {
    try {
      const { videoId } = req.params
      
      // Update video status
      await this.videoService.updateStatus(videoId, 'processing')
      
      // Start transcription process (this will run in background)
      this.transcriptionService.processVideo(videoId)
        .then(async (segments) => {
          await this.videoService.updateStatus(videoId, 'transcribed')
          // Emit WebSocket event for real-time updates
          // this.emitStatusUpdate(videoId, { stage: 'transcription_complete', segments })
        })
        .catch(async (error) => {
          await this.videoService.updateStatus(videoId, 'error')
          console.error('Transcription failed:', error)
        })

      res.json({
        success: true,
        message: 'Transcription started',
        videoId
      })
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Failed to start transcription',
        error: error.message
      })
    }
  }

  @Post('/mcq/:videoId')
  async generateMCQs(@Req() req: Request, @Res() res: Response) {
    try {
      const { videoId } = req.params
      
      // Get transcript segments
      const segments = await this.transcriptionService.getSegments(videoId)
      
      if (!segments || segments.length === 0) {
        return res.status(400).json({
          success: false,
          message: 'No transcript found. Generate transcript first.'
        })
      }

      // Update status
      await this.videoService.updateStatus(videoId, 'generating_mcqs')
      
      // Start MCQ generation (background process)
      this.mcqService.generateMCQsForSegments(videoId, segments)
        .then(async (questions) => {
          await this.videoService.updateStatus(videoId, 'completed')
          // Emit WebSocket event
          // this.emitStatusUpdate(videoId, { stage: 'mcq_complete', questions })
        })
        .catch(async (error) => {
          await this.videoService.updateStatus(videoId, 'error')
          console.error('MCQ generation failed:', error)
        })

      res.json({
        success: true,
        message: 'MCQ generation started',
        videoId
      })
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Failed to start MCQ generation',
        error: error.message
      })
    }
  }

  @Get('/status/:videoId')
  async getStatus(@Req() req: Request, @Res() res: Response) {
    try {
      const { videoId } = req.params
      
      const video = await this.videoService.getVideo(videoId)
      const segments = await this.transcriptionService.getSegments(videoId)
      const questions = await this.mcqService.getQuestions(videoId)
      
      res.json({
        success: true,
        video,
        segments,
        questions,
        status: video.status
      })
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Failed to get status',
        error: error.message
      })
    }
  }

  @Get('/video/:videoId')
  async getVideo(@Req() req: Request, @Res() res: Response) {
    try {
      const { videoId } = req.params
      
      const video = await this.videoService.getVideo(videoId)
      
      res.json({
        success: true,
        video
      })
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Failed to get video',
        error: error.message
      })
    }
  }

  @Post('/delete/:videoId')
  async deleteVideo(@Req() req: Request, @Res() res: Response) {
    try {
      const { videoId } = req.params
      
      // Delete video file and database record
      await this.videoService.deleteVideo(videoId)
      
      res.json({
        success: true,
        message: 'Video deleted successfully'
      })
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Failed to delete video',
        error: error.message
      })
    }
  }
}

// WebSocket handler for real-time updates
export class WebSocketHandler {
  private io: any // Socket.io instance
  
  constructor(io: any) {
    this.io = io
  }
  
  emitStatusUpdate(videoId: string, data: any) {
    this.io.to(`video-${videoId}`).emit('status_update', data)
  }
  
  handleConnection(socket: any) {
    socket.on('join_video', (videoId: string) => {
      socket.join(`video-${videoId}`)
    })
    
    socket.on('leave_video', (videoId: string) => {
      socket.leave(`video-${videoId}`)
    })
  }
}

// Implement video metadata extraction
async function extractVideoMetadata(filePath: string) {
  return new Promise((resolve, reject) => {
    exec(`ffprobe -v error -select_streams v:0 -show_entries stream=duration,width,height,r_bitrate -of default=noprint_wrappers=1:nokey=1 ${filePath}`, (error, stdout, stderr) => {
      if (error) {
        reject(new Error('Failed to extract video metadata'))
      } else {
        const [duration, width, height, bitrate] = stdout.split('\n').map(Number)
        resolve({ duration, resolution: `${width}x${height}`, bitrate })
      }
    })
  })
}
