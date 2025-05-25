"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { FileText, Play, Loader2, Clock, CheckCircle2 } from "lucide-react"
import type { TranscriptSegment } from "@/lib/types"

interface TranscriptDisplayProps {
  segments: TranscriptSegment[]
  onGenerateTranscript: () => void
  isProcessing: boolean
  progress: number
  hasVideo: boolean
}

export default function TranscriptDisplay({
  segments,
  onGenerateTranscript,
  isProcessing,
  progress,
  hasVideo,
}: TranscriptDisplayProps) {
  
  const formatTime = (seconds: number): string => {
		const mins = Math.floor(seconds / 60);
		const secs = Math.floor(seconds % 60); // Ensure secs is an integer
		return `${mins.toString().padStart(2, "0")}:${secs
			.toString()
			.padStart(2, "0")}`;
	};

  const isCompleted = segments.length > 0 && !isProcessing

  return (
    <Card className="h-fit max-h-[600px] flex flex-col bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 transition-colors">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center space-x-2 text-gray-900 dark:text-gray-100">
            <div className="relative">
              <FileText className="h-5 w-5" />
              {isCompleted && <CheckCircle2 className="h-3 w-3 text-green-500 absolute -top-1 -right-1" />}
            </div>
            <span>Transcript</span>
            {isCompleted && (
              <Badge
                variant="secondary"
                className="bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300"
              >
                Ready
              </Badge>
            )}
          </CardTitle>

          <Button
            onClick={onGenerateTranscript}
            disabled={!hasVideo || isProcessing}
            className="flex items-center space-x-2"
            variant={segments.length === 0 ? "default" : "outline"}
            size="sm"
          >
            {isProcessing ? <Loader2 className="h-4 w-4 animate-spin" /> : <Play className="h-4 w-4" />}
            <span>{isProcessing ? "Generating..." : segments.length === 0 ? "Generate Transcript" : "Regenerate"}</span>
          </Button>
        </div>
      </CardHeader>
      <CardContent className="flex-1 overflow-hidden">
        {!hasVideo ? (
          <div className="text-center text-gray-500 dark:text-gray-400 py-8">
            <FileText className="h-12 w-12 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
            <p>Upload a video first</p>
            <p className="text-sm">Upload a video to generate transcript</p>
          </div>
        ) : isProcessing ? (
          <div className="space-y-4">
            <div className="flex items-center justify-between text-sm">
              <span className="flex items-center space-x-2 text-gray-700 dark:text-gray-300">
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>
                  {segments.length === 0
                    ? "Processing video..."
                    : `Transcribing audio... (${segments.length} segments)`}
                </span>
              </span>
              <span className="text-gray-600 dark:text-gray-400">{Math.round(progress)}%</span>
            </div>
            <Progress value={progress} className="h-2" />

            {segments.length === 0 ? (
              <div className="text-center text-gray-500 dark:text-gray-400 py-8">
                <FileText className="h-12 w-12 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
                <p>AI is processing your video...</p>
                <p className="text-sm">Extracting audio and preparing for transcription</p>
              </div>
            ) : (
              // Show segments in real-time as they come
              <div className="space-y-4 max-h-[300px] overflow-y-auto">
                <div className="flex items-center justify-between mb-4">
                  <Badge variant="secondary" className="flex items-center space-x-1">
                    <Clock className="h-3 w-3" />
                    <span>{segments.length} segments (processing...)</span>
                  </Badge>
                </div>

                {segments.map((segment) => (
                  <div
                    key={segment.id}
                    className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors animate-in slide-in-from-bottom-2 duration-300"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <Badge variant="outline" className="text-xs">
                        {formatTime(segment.startTime)} - {formatTime(segment.endTime)}
                      </Badge>
                      <span className="text-xs text-gray-500 dark:text-gray-400">Segment {segment.segmentNumber}</span>
                    </div>
                    <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">{segment.text}</p>
                  </div>
                ))}

                {/* Show loading indicator for next segment */}
                <div className="p-4 border border-dashed border-gray-300 dark:border-gray-600 rounded-lg">
                  <div className="flex items-center space-x-2 text-gray-500 dark:text-gray-400">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span className="text-sm">Processing next segment...</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        ) : segments.length === 0 ? (
          <div className="text-center text-gray-500 dark:text-gray-400 py-8">
            <FileText className="h-12 w-12 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
            <p>No transcript available</p>
            <p className="text-sm">Click "Generate Transcript" to start</p>
          </div>
        ) : (
          <div className="space-y-4 max-h-[400px] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <Badge variant="secondary" className="flex items-center space-x-1">
                <Clock className="h-3 w-3" />
                <span>{segments.length} segments</span>
              </Badge>
            </div>

            {segments.map((segment) => (
              <div
                key={segment.id}
                className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
              >
                <div className="flex items-center justify-between mb-2">
                  <Badge variant="outline" className="text-xs">
                    {formatTime(segment.startTime)} - {formatTime(segment.endTime)}
                  </Badge>
                  <span className="text-xs text-gray-500 dark:text-gray-400">Segment {segment.segmentNumber}</span>
                </div>
                <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">{segment.text}</p>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
