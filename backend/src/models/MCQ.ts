import mongoose, { type Document, Schema } from "mongoose"

export interface IMCQQuestion {
  id: string
  segmentId: string
  question: string
  options: string[]
  correctAnswer: number
  explanation: string
}

export interface IMCQ extends Document {
  videoId: string
  questions: IMCQQuestion[]
}

const mcqSchema = new Schema<IMCQ>(
  {
    videoId: { type: String, required: true },
    questions: [
      {
        id: { type: String, required: true },
        segmentId: { type: String, required: true },
        question: { type: String, required: true },
        options: [{ type: String, required: true }],
        correctAnswer: { type: Number, required: true },
        explanation: { type: String, required: true },
      },
    ],
  },
  { timestamps: true },
)

export const MCQ = mongoose.model<IMCQ>("MCQ", mcqSchema)
