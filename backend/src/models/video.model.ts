/*
import mongoose, { Schema, Document } from 'mongoose'

export interface IVideo extends Document {
  filename: string
  filepath: string
  originalName: string
  size: number
  mimetype: string
  duration?: number
  status: 'uploaded' | 'processing' | 'transcribed' | 'generating_mcqs' | 'completed' | 'error'
  uploadedAt: Date
  processedAt?: Date
  metadata?: {
    width?: number
    height?: number
    bitrate?: number
    fps?: number
  }
}

const VideoSchema: Schema = new Schema({
  filename: { type: String, required: true },
  filepath: { type: String, required: true },
  originalName: { type: String, required: true },
  size: { type: Number, required: true },
  mimetype: { type: String, required: true },
  duration: { type: Number },
  status: { 
    type: String, 
    enum: ['uploaded', 'processing', 'transcribed', 'generating_mcqs', 'completed', 'error'],
    default: 'uploaded'
  },
  uploadedAt: { type: Date, default: Date.now },
  processedAt: { type: Date },
  metadata: {
    width: { type: Number },
    height: { type: Number },
    bitrate: { type: Number },
    fps: { type: Number }
  }
}, {
  timestamps: true
})

// Indexes for performance
VideoSchema.index({ filename: 1 })
VideoSchema.index({ status: 1 })
VideoSchema.index({ uploadedAt: -1 })

export const VideoModel = mongoose.model<IVideo>('Video', VideoSchema)

// Transcript Model
export interface ITranscript extends Document {
  videoId: mongoose.Types.ObjectId
  segmentNumber: number
  startTime: number
  endTime: number
  text: string
  createdAt: Date
}

const TranscriptSchema: Schema = new Schema({
  videoId: { type: Schema.Types.ObjectId, ref: 'Video', required: true },
  segmentNumber: { type: Number, required: true },
  startTime: { type: Number, required: true },
  endTime: { type: Number, required: true },
  text: { type: String, required: true },
  createdAt: { type: Date, default: Date.now }
}, {
  timestamps: true
})

// Compound index for efficient queries
TranscriptSchema.index({ videoId: 1, segmentNumber: 1 })
TranscriptSchema.index({ createdAt: -1 })

export const TranscriptModel = mongoose.model<ITranscript>('Transcript', TranscriptSchema)
*/

// TODO: Uncomment and implement the above code
// These models define the database schema for:
// 1. Video metadata and processing status
// 2. Transcript segments with timing information
// 3. Proper indexing for performance optimization

export {}
