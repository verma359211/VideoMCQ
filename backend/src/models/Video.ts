import mongoose, { type Document, Schema } from "mongoose"

export interface IVideo extends Document {
  videoId: string
  filename: string
  filepath: string // Added filepath field
  size: string
  duration: string
  uploadedAt: string
  status: "uploading" | "uploaded" | "processing" | "completed" | "error"
}

const videoSchema = new Schema<IVideo>(
  {
    videoId: { type: String, required: true, unique: true },
    filename: { type: String, required: true },
    filepath: { type: String, required: true }, // Store the actual file path/name
    size: { type: String, required: true },
    duration: { type: String, required: true },
    uploadedAt: { type: String, required: true },
    status: {
      type: String,
      enum: ["uploading", "uploaded", "processing", "completed", "error"],
      default: "uploaded",
    },
  },
  { timestamps: true },
)

export const Video = mongoose.model<IVideo>("Video", videoSchema)
