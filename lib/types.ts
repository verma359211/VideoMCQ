export interface VideoData {
  id: string
  filename: string
  size: string
  duration: string
  uploadedAt: string
  status: "uploading" | "uploaded" | "processing" | "completed" | "error"
}

export interface TranscriptSegment {
  id: string
  text: string
  startTime: number // Changed from 'start' to 'startTime'
  endTime: number // Changed from 'end' to 'endTime'
  segmentNumber: number
}

export interface MCQQuestion {
  id: string
  segmentId: string
  question: string
  options: string[]
  correctAnswer: number
  explanation: string
}

export interface ProcessingStatus {
  stage: "upload" | "transcription" | "mcq_generation" | "completed"
  progress: number
  message: string
}
