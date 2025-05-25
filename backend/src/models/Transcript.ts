import mongoose, { type Document, Schema } from "mongoose"

export interface ITranscriptSegment {
  id: string
  text: string
  start: number
  end: number
  segmentNumber: number
}

export interface ITranscript extends Document {
  videoId: string
  segments: ITranscriptSegment[]
}

const transcriptSchema = new Schema<ITranscript>(
  {
    videoId: { type: String, required: true },
    segments: [
      {
        id: { type: String, required: true },
        text: { type: String, required: true },
        start: { type: Number, required: true },
        end: { type: Number, required: true },
        segmentNumber: { type: Number, required: true },
      },
    ],
  },
  { timestamps: true },
)

export const Transcript = mongoose.model<ITranscript>("Transcript", transcriptSchema)
