/*
import { spawn } from 'child_process'
import path from 'path'
import fs from 'fs/promises'
import { VideoService } from './video.service'
import { TranscriptModel } from '../models/transcript.model'

export class TranscriptionService {
  private videoService = new VideoService()
  
  async processVideo(videoId: string): Promise<any[]> {
    try {
      // Get video file path
      const video = await this.videoService.getVideo(videoId)
      if (!video) {
        throw new Error('Video not found')
      }
      
      // Extract audio from video
      const audioPath = await this.extractAudio(video.filepath)
      
      // Transcribe audio using Whisper
      const transcriptText = await this.transcribeAudio(audioPath)
      
      // Segment transcript into 5-minute chunks
      const segments = await this.segmentTranscript(transcriptText, videoId)
      
      // Save segments to database
      await this.saveSegments(videoId, segments)
      
      // Cleanup temporary audio file
      await fs.unlink(audioPath)
      
      return segments
    } catch (error) {
      console.error('Transcription failed:', error)
      throw error
    }
  }
  
  private async extractAudio(videoPath: string): Promise<string> {
    return new Promise((resolve, reject) => {
      const audioPath = path.join(
        process.env.TEMP_DIR || './temp',
        `audio-${Date.now()}.wav`
      )
      
      // Use FFmpeg to extract audio
      const ffmpeg = spawn('ffmpeg', [
        '-i', videoPath,
        '-vn', // No video
        '-acodec', 'pcm_s16le', // Audio codec
        '-ar', '16000', // Sample rate
        '-ac', '1', // Mono channel
        audioPath
      ])
      
      ffmpeg.on('close', (code) => {
        if (code === 0) {
          resolve(audioPath)
        } else {
          reject(new Error(`FFmpeg failed with code ${code}`))
        }
      })
      
      ffmpeg.on('error', reject)
    })
  }
  
  private async transcribeAudio(audioPath: string): Promise<string> {
    return new Promise((resolve, reject) => {
      const whisperModel = process.env.WHISPER_MODEL_SIZE || 'base'
      
      // Run Whisper transcription
      const whisper = spawn('whisper', [
        audioPath,
        '--model', whisperModel,
        '--output_format', 'txt',
        '--output_dir', process.env.TEMP_DIR || './temp'
      ])
      
      let output = ''
      whisper.stdout.on('data', (data) => {
        output += data.toString()
      })
      
      whisper.on('close', async (code) => {
        if (code === 0) {
          try {
            // Read the generated transcript file
            const transcriptFile = audioPath.replace('.wav', '.txt')
            const transcript = await fs.readFile(transcriptFile, 'utf-8')
            await fs.unlink(transcriptFile) // Cleanup
            resolve(transcript)
          } catch (error) {
            reject(error)
          }
        } else {
          reject(new Error(`Whisper failed with code ${code}`))
        }
      })
      
      whisper.on('error', reject)
    })
  }
  
  private async segmentTranscript(transcript: string, videoId: string): Promise<any[]> {
    // Simple segmentation by word count (approximately 5 minutes of speech)
    // In a real implementation, you might use more sophisticated methods
    const words = transcript.split(' ')
    const wordsPerSegment = 750 // Approximately 5 minutes at 150 WPM
    const segments = []
    
    for (let i = 0; i < words.length; i += wordsPerSegment) {
      const segmentWords = words.slice(i, i + wordsPerSegment)
      const segmentText = segmentWords.join(' ')
      
      const segment = {
        segmentNumber: Math.floor(i / wordsPerSegment) + 1,
        startTime: (i / wordsPerSegment) * 300, // 5 minutes = 300 seconds
        endTime: Math.min(((i + wordsPerSegment) / wordsPerSegment) * 300, (words.length / wordsPerSegment) * 300),
        text: segmentText,
        videoId
      }
      
      segments.push(segment)
    }
    
    return segments
  }
  
  private async saveSegments(videoId: string, segments: any[]): Promise<void> {
    for (const segment of segments) {
      await TranscriptModel.create({
        videoId,
        segmentNumber: segment.segmentNumber,
        startTime: segment.startTime,
        endTime: segment.endTime,
        text: segment.text
      })
    }
  }
  
  async getSegments(videoId: string): Promise<any[]> {
    return await TranscriptModel.find({ videoId }).sort({ segmentNumber: 1 })
  }
}

// Alternative implementation using Whisper API (if you prefer API over CLI)
export class WhisperAPIService {
  async transcribeAudio(audioBuffer: Buffer): Promise<string> {
    // If using OpenAI Whisper API instead of local installation
    // const formData = new FormData()
    // formData.append('file', audioBuffer, 'audio.wav')
    // formData.append('model', 'whisper-1')
    // 
    // const response = await fetch('https://api.openai.com/v1/audio/transcriptions', {
    //   method: 'POST',
    //   headers: {
    //     'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`
    //   },
    //   body: formData
    // })
    // 
    // const result = await response.json()
    // return result.text
    
    throw new Error('Implement Whisper API integration')
  }
}
*/

// TODO: Uncomment and implement the above code
// This service handles:
// 1. Audio extraction from video using FFmpeg
// 2. Speech-to-text transcription using Whisper
// 3. Transcript segmentation into 5-minute chunks
// 4. Database storage of transcript segments

export {}
