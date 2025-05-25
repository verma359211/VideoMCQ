/*
import mongoose, { Schema, Document } from 'mongoose'

export interface IMCQ extends Document {
  videoId: mongoose.Types.ObjectId
  segmentId: mongoose.Types.ObjectId
  question: string
  options: string[]
  correctAnswer: number
  explanation: string
  difficulty?: 'easy' | 'medium' | 'hard'
  tags?: string[]
  createdAt: Date
  updatedAt: Date
}

const MCQSchema: Schema = new Schema({
  videoId: { type: Schema.Types.ObjectId, ref: 'Video', required: true },
  segmentId: { type: Schema.Types.ObjectId, ref: 'Transcript', required: true },
  question: { type: String, required: true },
  options: [{ type: String, required: true }],
  correctAnswer: { type: Number, required: true, min: 0, max: 3 },
  explanation: { type: String, required: true },
  difficulty: { 
    type: String, 
    enum: ['easy', 'medium', 'hard'],
    default: 'medium'
  },
  tags: [{ type: String }],
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
}, {
  timestamps: true
})

// Indexes for performance
MCQSchema.index({ videoId: 1 })
MCQSchema.index({ segmentId: 1 })
MCQSchema.index({ videoId: 1, segmentId: 1 })
MCQSchema.index({ difficulty: 1 })
MCQSchema.index({ tags: 1 })
MCQSchema.index({ createdAt: -1 })

// Validation
MCQSchema.pre('save', function(next) {
  if (this.options.length < 2 || this.options.length > 4) {
    next(new Error('MCQ must have between 2 and 4 options'))
  }
  if (this.correctAnswer >= this.options.length) {
    next(new Error('Correct answer index is out of range'))
  }
  next()
})

export const MCQModel = mongoose.model<IMCQ>('MCQ', MCQSchema)
*/

// TODO: Uncomment and implement the above code
// This model defines the database schema for:
// 1. MCQ questions with multiple options
// 2. Correct answer tracking and explanations
// 3. Difficulty levels and tagging system
// 4. Validation rules for data integrity

export {}
