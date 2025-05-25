"use client"

import { useState, useRef, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { X, Settings } from "lucide-react"
import type { TranscriptSegment } from "@/lib/types"

interface VideoModalProps {
  isOpen: boolean
  onClose: () => void
  videoUrl: string
  videoTitle: string
  transcriptSegments?: TranscriptSegment[]
}

export default function VideoModal({
  isOpen,
  onClose,
  videoUrl,
  videoTitle,
  transcriptSegments = [],
}: VideoModalProps) {
  const [playbackSpeed, setPlaybackSpeed] = useState("1")
  const [isPlaying, setIsPlaying] = useState(false)
  const [showControls, setShowControls] = useState(true)
  const videoRef = useRef<HTMLVideoElement>(null)
  const controlsTimeoutRef = useRef<NodeJS.Timeout>()

  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.playbackRate = Number.parseFloat(playbackSpeed)
    }
  }, [playbackSpeed])

  const handleSeekToSegment = (startTime: number) => {
    if (videoRef.current) {
      videoRef.current.currentTime = startTime
      if (!isPlaying) {
        videoRef.current.play()
      }
    }
  }

  const handleMouseMove = () => {
    setShowControls(true)
    if (controlsTimeoutRef.current) {
      clearTimeout(controlsTimeoutRef.current)
    }
    controlsTimeoutRef.current = setTimeout(() => {
      setShowControls(false)
    }, 3000)
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = Math.floor(seconds % 60)
    return `${mins}:${secs.toString().padStart(2, "0")}`
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl w-full p-0 bg-black" onMouseMove={handleMouseMove}>
        {/* Header Controls */}
        <DialogHeader
          className={`absolute top-4 left-4 right-4 z-20 transition-opacity duration-300 ${
            showControls ? "opacity-100" : "opacity-0"
          }`}
        >
          <div className="flex items-center justify-between">
            <DialogTitle className="text-white bg-black/70 px-3 py-2 rounded-lg backdrop-blur-sm">
              {videoTitle}
            </DialogTitle>
            <div className="flex items-center space-x-2">
              <Select value={playbackSpeed} onValueChange={setPlaybackSpeed}>
                <SelectTrigger className="w-20 h-8 bg-black/70 text-white border-white/20 backdrop-blur-sm">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="0.5">0.5x</SelectItem>
                  <SelectItem value="0.75">0.75x</SelectItem>
                  <SelectItem value="1">1x</SelectItem>
                  <SelectItem value="1.25">1.25x</SelectItem>
                  <SelectItem value="1.5">1.5x</SelectItem>
                  <SelectItem value="2">2x</SelectItem>
                </SelectContent>
              </Select>
              <Button
                onClick={onClose}
                variant="ghost"
                size="sm"
                className="text-white hover:bg-white/20 bg-black/70 backdrop-blur-sm"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </DialogHeader>

        {/* Video Player */}
        <div className="relative aspect-video">
          <video
            ref={videoRef}
            src={videoUrl}
            className="w-full h-full object-contain"
            controls
            autoPlay
            onPlay={() => setIsPlaying(true)}
            onPause={() => setIsPlaying(false)}
          />
        </div>

        {/* Chapter Navigation */}
        {transcriptSegments.length > 0 && (
          <div
            className={`absolute bottom-4 left-4 right-4 z-20 transition-opacity duration-300 ${
              showControls ? "opacity-100" : "opacity-0"
            }`}
          >
            <div className="bg-black/70 backdrop-blur-sm rounded-lg p-4">
              <h3 className="text-white text-sm font-medium mb-3 flex items-center">
                <Settings className="h-4 w-4 mr-2" />
                Video Chapters
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 max-h-32 overflow-y-auto">
                {transcriptSegments.map((segment) => (
                  <Button
                    key={segment.id}
                    onClick={() => handleSeekToSegment(segment.startTime)}
                    variant="ghost"
                    size="sm"
                    className="text-white hover:bg-white/20 text-left justify-start h-auto p-2"
                  >
                    <div>
                      <div className="text-xs text-gray-300">
                        {formatTime(segment.startTime)} - {formatTime(segment.endTime)}
                      </div>
                      <div className="text-sm truncate">Segment {segment.segmentNumber}</div>
                    </div>
                  </Button>
                ))}
              </div>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
