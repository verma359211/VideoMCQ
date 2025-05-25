"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"
import Header from "@/components/header"
import VideoUpload from "@/components/video-upload"
import TranscriptDisplay from "@/components/transcript-display"
import MCQPanel from "@/components/mcq-panel"
import WorkflowStepper from "@/components/workflow-stepper"
import { Upload, FileText, HelpCircle } from "lucide-react"
import type { VideoData, TranscriptSegment, MCQQuestion } from "@/lib/types"
import { ApiClient } from "@/lib/api-client"
import { useToast } from "@/hooks/use-toast"

interface VideoWorkspaceProps {
  initialVideo?: any
  onBack: () => void
}

export default function VideoWorkspace({ initialVideo, onBack }: VideoWorkspaceProps) {
  const [currentVideo, setCurrentVideo] = useState<VideoData | null>(initialVideo || null)
  const [currentFile, setCurrentFile] = useState<File | null>(null)
  const [transcriptSegments, setTranscriptSegments] = useState<TranscriptSegment[]>(
    initialVideo?.transcriptSegments || [],
  )
  const [mcqQuestions, setMcqQuestions] = useState<MCQQuestion[]>(initialVideo?.mcqQuestions || [])
  const [isProcessing, setIsProcessing] = useState(false)
  const [progress, setProgress] = useState(0)
  const [processingType, setProcessingType] = useState<"upload" | "transcript" | "mcq" | null>(null)
  const [mcqProgress, setMcqProgress] = useState({ current: 0, total: 0 })
  const [isTranscriptCompleted, setIsTranscriptCompleted] = useState(false)

  const { toast } = useToast()

  useEffect(() => {
    if (initialVideo) {
      setIsTranscriptCompleted(initialVideo.transcriptSegments?.length > 0)
    }
  }, [initialVideo])

  const handleVideoUpload = async (file: File) => {
    setIsProcessing(true)
    setProgress(0)
    setProcessingType("upload")
    setTranscriptSegments([])
    setMcqQuestions([])
    setIsTranscriptCompleted(false)

    try {
      // Create a video element to load metadata
      const videoElement = document.createElement("video")
      const videoURL = URL.createObjectURL(file)

      const getVideoDuration = (): Promise<string> => {
        return new Promise((resolve, reject) => {
          videoElement.preload = "metadata"
          videoElement.src = videoURL

          videoElement.onloadedmetadata = () => {
            const totalSeconds = Math.floor(videoElement.duration)
            const minutes = Math.floor(totalSeconds / 60)
            const seconds = totalSeconds % 60
            const formatted = `${minutes}:${seconds.toString().padStart(2, "0")}`
            resolve(formatted)
            URL.revokeObjectURL(videoURL)
          }

          videoElement.onerror = () => {
            reject("Failed to load video metadata.")
          }
        })
      }

      const duration = await getVideoDuration()
      const videoData: VideoData = {
        id: `video-${Date.now()}`,
        filename: file.name,
        size: `${(file.size / (1024 * 1024)).toFixed(1)} MB`,
        duration: duration,
        uploadedAt: new Date().toISOString(),
        status: "uploaded",
      }

      setCurrentVideo(videoData)
      setCurrentFile(file)
      await ApiClient.saveVideo(videoData)
      setProgress(100)
      setIsProcessing(false)
      setProcessingType(null)

      toast({
        title: "Video uploaded successfully",
        description: `${file.name} is ready for processing.`,
      })
    } catch (error) {
      setIsProcessing(false)
      setProcessingType(null)
      toast({
        title: "Upload failed",
        description: error instanceof Error ? error.message : "Failed to upload video",
        variant: "destructive",
      })
    }
  }

  const handleGenerateTranscript = async () => {
    if (!currentFile && !currentVideo) return

    // If we have a saved video but no file, we need to get the file from the server
    let fileToProcess = currentFile
    if (!fileToProcess && currentVideo) {
      try {
        const response = await fetch(`http://localhost:3001/api/videos/${currentVideo.id}/file`)
        if (response.ok) {
          const blob = await response.blob()
          fileToProcess = new File([blob], currentVideo.filename, { type: "video/mp4" })
        } else {
          throw new Error("Could not retrieve video file")
        }
      } catch (error) {
        toast({
          title: "Error",
          description: "Could not retrieve video file for processing",
          variant: "destructive",
        })
        return
      }
    }

    if (!fileToProcess || !currentVideo) return

    setIsProcessing(true)
    setProgress(0)
    setProcessingType("transcript")
    setTranscriptSegments([])
    setIsTranscriptCompleted(false)

    try {
      // Extract duration in seconds from the video data
      const durationParts = currentVideo.duration.split(":")
      const videoDurationInSeconds = Number.parseInt(durationParts[0]) * 60 + Number.parseInt(durationParts[1])

      const segments = await ApiClient.generateTranscript(
        fileToProcess,
        videoDurationInSeconds,
        (segments, progressPercent) => {
          // Real-time updates: set segments and progress as they come
          setTranscriptSegments(segments)
          setProgress(progressPercent)
        },
      )

      await ApiClient.saveTranscript(currentVideo.id, segments)
      setIsProcessing(false)
      setProcessingType(null)
      setIsTranscriptCompleted(true)

      toast({
        title: "Transcript generated",
        description: `${segments.length} segments created successfully.`,
      })
    } catch (error) {
      setIsProcessing(false)
      setProcessingType(null)
      toast({
        title: "Transcript generation failed",
        description: error instanceof Error ? error.message : "Failed to generate transcript",
        variant: "destructive",
      })
    }
  }

  const handleGenerateMCQs = async () => {
    if (!currentVideo || transcriptSegments.length === 0 || !isTranscriptCompleted) return

    setIsProcessing(true)
    setProcessingType("mcq")
    setMcqQuestions([])
    setMcqProgress({ current: 0, total: transcriptSegments.length })

    try {
      const questions = await ApiClient.generateMCQs(
        transcriptSegments,
        (question) => {
          setMcqQuestions((prev) => [...prev, question])
        },
        (current, total) => {
          setMcqProgress({ current, total })
        },
      )

      await ApiClient.saveMCQs(currentVideo.id, questions)
      setIsProcessing(false)
      setProcessingType(null)

      toast({
        title: "MCQs generated",
        description: `${questions.length} questions created successfully.`,
      })
    } catch (error) {
      setIsProcessing(false)
      setProcessingType(null)
      toast({
        title: "MCQ generation failed",
        description: error instanceof Error ? error.message : "Failed to generate MCQs",
        variant: "destructive",
      })
    }
  }

  const handleUpdateMCQ = async (questionId: string, updatedQuestion: Partial<MCQQuestion>) => {
    try {
      const updated = await ApiClient.updateMCQ(questionId, updatedQuestion)
      setMcqQuestions((prev) => prev.map((q) => (q.id === questionId ? updated : q)))

      toast({
        title: "Question updated",
        description: "Your changes have been saved successfully.",
      })
    } catch (error) {
      toast({
        title: "Update failed",
        description: "Failed to save changes. Please try again.",
        variant: "destructive",
      })
    }
  }

  const workflowSteps = [
    {
      id: 1,
      title: "Upload Video",
      description: "Select your video file",
      icon: <Upload className="h-5 w-5" />,
      completed: !!currentVideo && processingType !== "upload",
    },
    {
      id: 2,
      title: "Generate Transcript",
      description: "AI transcribes audio",
      icon: <FileText className="h-5 w-5" />,
      completed: isTranscriptCompleted && processingType !== "transcript",
    },
    {
      id: 3,
      title: "Create MCQs",
      description: "AI generates questions",
      icon: <HelpCircle className="h-5 w-5" />,
      completed: mcqQuestions.length === transcriptSegments.length && processingType !== "mcq",
    },
  ]

  const getCurrentStep = () => {
    if (!currentVideo || processingType === "upload") return 1
    if (!isTranscriptCompleted || processingType === "transcript") return 2
    if (mcqQuestions.length < transcriptSegments.length || processingType === "mcq") return 3
    return 3
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-purple-900 transition-colors">
      <Header />

      <main className="container mx-auto px-4 py-8">
        {/* Back Button */}
        <div className="mb-6">
          <Button onClick={onBack} variant="ghost" className="flex items-center space-x-2">
            <ArrowLeft className="h-4 w-4" />
            <span>Back to Videos</span>
          </Button>
        </div>

        <WorkflowStepper currentStep={getCurrentStep()} steps={workflowSteps} />

        <div className="grid lg:grid-cols-2 gap-8">
          <div className="space-y-6">
            <VideoUpload
              onVideoUpload={handleVideoUpload}
              currentVideo={currentVideo}
              isProcessing={isProcessing && processingType === "upload"}
              progress={processingType === "upload" ? progress : 100}
              transcriptSegments={transcriptSegments}
            />

            <TranscriptDisplay
              segments={transcriptSegments}
              onGenerateTranscript={handleGenerateTranscript}
              isProcessing={isProcessing && processingType === "transcript"}
              progress={processingType === "transcript" ? progress : 100}
              hasVideo={!!currentVideo}
            />
          </div>

          <div>
            <MCQPanel
              questions={mcqQuestions}
              onUpdateQuestion={handleUpdateMCQ}
              onGenerateMCQs={handleGenerateMCQs}
              isLoading={isProcessing && processingType === "mcq"}
              hasTranscript={isTranscriptCompleted}
              mcqProgress={mcqProgress}
              totalSegments={transcriptSegments.length}
            />
          </div>
        </div>
      </main>
    </div>
  )
}
