"use client"

import { useState, useCallback } from "react"
import { useDropzone } from "react-dropzone"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Upload, Video, CheckCircle, Loader2, Maximize2, Play, Pause } from "lucide-react"
import type { VideoData, TranscriptSegment } from "@/lib/types"
import { useToast } from "@/hooks/use-toast"
import VideoModal from "./video-modal"

interface VideoUploadProps {
  onVideoUpload: (file: File) => void
  currentVideo: VideoData | null
  isProcessing: boolean
  progress: number
  transcriptSegments: TranscriptSegment[]
}

export default function VideoUpload({
  onVideoUpload,
  currentVideo,
  isProcessing,
  progress,
  transcriptSegments,
}: VideoUploadProps) {
  const { toast } = useToast()
  const [dragActive, setDragActive] = useState(false)
  const [videoUrl, setVideoUrl] = useState<string | null>(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [showModal, setShowModal] = useState(false)

  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      const file = acceptedFiles[0]
      if (file) {
        if (file.type.startsWith("video/")) {
          // Create video URL for preview
          const url = URL.createObjectURL(file)
          setVideoUrl(url)
          onVideoUpload(file)
          toast({
            title: "Video uploaded successfully",
            description: `${file.name} is being processed...`,
          })
        } else {
          toast({
            title: "Invalid file type",
            description: "Please upload a video file (MP4, AVI, MOV, etc.)",
            variant: "destructive",
          })
        }
      }
    },
    [onVideoUpload, toast],
  )

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "video/*": [".mp4", ".avi", ".mov", ".mkv", ".webm"],
    },
    multiple: false,
    onDragEnter: () => setDragActive(true),
    onDragLeave: () => setDragActive(false),
  })

  const handleVideoPlay = () => {
    const video = document.getElementById("uploaded-video") as HTMLVideoElement
    if (video) {
      if (isPlaying) {
        video.pause()
      } else {
        video.play()
      }
      setIsPlaying(!isPlaying)
    }
  }

  const uploadNewVideo = () => {
    if (videoUrl) {
      URL.revokeObjectURL(videoUrl)
    }
    setVideoUrl(null)
    setIsPlaying(false)
  }

  // For saved videos, create video URL from server
  const getVideoUrl = () => {
    if (videoUrl) return videoUrl
    if (currentVideo?.filepath) {
      return `http://localhost:3001/public/${currentVideo.filepath}`
    }
    return null
  }

  const displayVideoUrl = getVideoUrl()

  return (
    <>
      <Card className="h-fit bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 transition-colors">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center justify-between text-gray-900 dark:text-gray-100">
            <div className="flex items-center space-x-2">
              <Video className="h-5 w-5" />
              <span>Video Upload</span>
            </div>
            {currentVideo && (
              <Button onClick={uploadNewVideo} variant="outline" size="sm">
                Upload New
              </Button>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {!currentVideo ? (
            <div
              {...getRootProps()}
              className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-all duration-200 ${
                isDragActive || dragActive
                  ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20"
                  : "border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500"
              }`}
            >
              <input {...getInputProps()} />
              <Upload className="h-10 w-10 text-gray-400 dark:text-gray-500 mx-auto mb-3" />
              <p className="text-base font-medium text-gray-700 dark:text-gray-300 mb-2">
                {isDragActive ? "Drop your video here" : "Upload your video"}
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-3">
                Drag and drop or click to select a video file
              </p>
              <Button variant="outline" className="mx-auto">
                Choose File
              </Button>
              <p className="text-xs text-gray-400 dark:text-gray-500 mt-2">
                Supports MP4, AVI, MOV, MKV, WebM (Max 500MB)
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Compact Video Preview */}
              {displayVideoUrl && (
                <div className="flex items-center space-x-3">
                  <div className="relative rounded-lg overflow-hidden bg-black flex-shrink-0">
                    <video
                      id="uploaded-video"
                      src={displayVideoUrl}
                      className="w-24 h-16 object-cover"
                      onPlay={() => setIsPlaying(true)}
                      onPause={() => setIsPlaying(false)}
                      muted
                    />
                    <div className="absolute inset-0 flex items-center justify-center">
                      <Button
                        onClick={handleVideoPlay}
                        size="sm"
                        variant="ghost"
                        className="w-8 h-8 p-0 bg-black/50 hover:bg-black/70 text-white"
                      >
                        {isPlaying ? <Pause className="h-3 w-3" /> : <Play className="h-3 w-3" />}
                      </Button>
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-gray-900 dark:text-gray-100 truncate">{currentVideo.filename}</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {currentVideo.duration} • {currentVideo.size}
                    </p>
                  </div>
                  <Button onClick={() => setShowModal(true)} size="sm" variant="outline" className="flex-shrink-0">
                    <Maximize2 className="h-4 w-4" />
                  </Button>
                </div>
              )}

              {/* Video Info */}
              <div className="flex items-center space-x-3 p-3 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
                <CheckCircle className="h-4 w-4 text-green-600 dark:text-green-400 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-green-800 dark:text-green-200">Video uploaded successfully</p>
                  <p className="text-xs text-green-600 dark:text-green-400">Ready for processing</p>
                </div>
              </div>

              {/* Processing Status */}
              {isProcessing && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="flex items-center space-x-2 text-gray-700 dark:text-gray-300">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span>Processing video...</span>
                    </span>
                    <span className="text-gray-600 dark:text-gray-400">{progress}%</span>
                  </div>
                  <Progress value={progress} className="h-2" />
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Video Modal */}
      {displayVideoUrl && (
        <VideoModal
          isOpen={showModal}
          onClose={() => setShowModal(false)}
          videoUrl={displayVideoUrl}
          videoTitle={currentVideo?.filename || "Video"}
          transcriptSegments={transcriptSegments}
        />
      )}
    </>
  )
}
