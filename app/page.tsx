"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Plus, Video, Clock, FileText, HelpCircle, Search, Play, Trash2 } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import Header from "@/components/header"
import VideoWorkspace from "@/components/video-workspace"
import type { VideoData } from "@/lib/types"

interface SavedVideo extends VideoData {
  transcriptCount?: number
  mcqCount?: number
}

export default function Home() {
  const [currentView, setCurrentView] = useState<"landing" | "workspace">("landing")
  const [savedVideos, setSavedVideos] = useState<SavedVideo[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [isLoading, setIsLoading] = useState(true)
  const [selectedVideo, setSelectedVideo] = useState<SavedVideo | null>(null)
  const { toast } = useToast()

  useEffect(() => {
    loadSavedVideos()
  }, [])

  const loadSavedVideos = async () => {
    try {
      setIsLoading(true)
      const response = await fetch("http://localhost:3001/api/videos")
      if (response.ok) {
        const data = await response.json()
        setSavedVideos(data.videos || [])
      }
    } catch (error) {
      console.error("Failed to load videos:", error)
      toast({
        title: "Failed to load videos",
        description: "Could not retrieve saved videos from the server.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleCreateNew = () => {
    setSelectedVideo(null)
    setCurrentView("workspace")
  }

  const handleOpenVideo = async (video: SavedVideo) => {
    try {
      // Load video data with transcripts and MCQs
      const [transcriptRes, mcqRes] = await Promise.all([
        fetch(`http://localhost:3001/api/transcripts/${video.id}`),
        fetch(`http://localhost:3001/api/mcqs/${video.id}`),
      ])

      const transcriptData = transcriptRes.ok ? await transcriptRes.json() : { segments: [] }
      const mcqData = mcqRes.ok ? await mcqRes.json() : { questions: [] }

      const videoWithData = {
        ...video,
        transcriptSegments: transcriptData.segments || [],
        mcqQuestions: mcqData.questions || [],
      }

      setSelectedVideo(videoWithData)
      setCurrentView("workspace")
    } catch (error) {
      console.error("Failed to load video data:", error)
      toast({
        title: "Failed to open video",
        description: "Could not load video data from the server.",
        variant: "destructive",
      })
    }
  }

  const handleDeleteVideo = async (videoId: string) => {
    if (!confirm("Are you sure you want to delete this video? This action cannot be undone.")) {
      return
    }

    try {
      const response = await fetch(`http://localhost:3001/api/videos/${videoId}`, {
        method: "DELETE",
      })

      if (response.ok) {
        setSavedVideos((prev) => prev.filter((v) => v.id !== videoId))
        toast({
          title: "Video deleted",
          description: "Video and all associated data have been removed.",
        })
      } else {
        throw new Error("Failed to delete video")
      }
    } catch (error) {
      console.error("Failed to delete video:", error)
      toast({
        title: "Delete failed",
        description: "Could not delete the video. Please try again.",
        variant: "destructive",
      })
    }
  }

  const handleBackToLanding = () => {
    setCurrentView("landing")
    setSelectedVideo(null)
    loadSavedVideos() // Refresh the list
  }

  const filteredVideos = savedVideos.filter((video) => video.filename.toLowerCase().includes(searchTerm.toLowerCase()))

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  if (currentView === "workspace") {
    return <VideoWorkspace initialVideo={selectedVideo} onBack={handleBackToLanding} />
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-purple-900 transition-colors">
      <Header />

      <main className="container mx-auto px-4 py-8">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-gray-100 mb-4">
            Transform Videos into
            <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              {" "}
              Learning Content
            </span>
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-400 mb-8 max-w-2xl mx-auto">
            Upload videos, generate AI-powered transcripts, and create multiple choice questions automatically
          </p>

          <Button
            onClick={handleCreateNew}
            size="lg"
            className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-8 py-3 text-lg"
          >
            <Plus className="h-5 w-5 mr-2" />
            Create New Project
          </Button>
        </div>

        {/* Search and Filter */}
        <div className="mb-8">
          <div className="flex items-center space-x-4 max-w-md mx-auto">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Search videos..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
        </div>

        {/* Videos Grid */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-gray-100">
              Your Videos ({filteredVideos.length})
            </h2>
          </div>

          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3].map((i) => (
                <Card key={i} className="animate-pulse">
                  <CardContent className="p-6">
                    <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded mb-4"></div>
                    <div className="h-3 bg-gray-300 dark:bg-gray-600 rounded mb-2"></div>
                    <div className="h-3 bg-gray-300 dark:bg-gray-600 rounded w-2/3"></div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : filteredVideos.length === 0 ? (
            <Card className="text-center py-12">
              <CardContent>
                <Video className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
                  {searchTerm ? "No videos found" : "No videos yet"}
                </h3>
                <p className="text-gray-600 dark:text-gray-400 mb-6">
                  {searchTerm
                    ? "Try adjusting your search terms"
                    : "Upload your first video to get started with AI-powered learning content"}
                </p>
                {!searchTerm && (
                  <Button onClick={handleCreateNew} className="mx-auto">
                    <Plus className="h-4 w-4 mr-2" />
                    Upload First Video
                  </Button>
                )}
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredVideos.map((video) => (
                <Card key={video.id} className="hover:shadow-lg transition-shadow cursor-pointer group">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="flex-1 min-w-0">
                        <CardTitle className="text-lg font-medium text-gray-900 dark:text-gray-100 truncate">
                          {video.filename}
                        </CardTitle>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{formatDate(video.uploadedAt)}</p>
                      </div>
                      <Badge
                        variant={video.status === "completed" ? "default" : "secondary"}
                        className="ml-2 flex-shrink-0"
                      >
                        {video.status}
                      </Badge>
                    </div>
                  </CardHeader>

                  <CardContent className="pt-0">
                    <div className="space-y-3">
                      {/* Video Info */}
                      <div className="flex items-center justify-between text-sm text-gray-600 dark:text-gray-400">
                        <div className="flex items-center space-x-1">
                          <Clock className="h-4 w-4" />
                          <span>{video.duration}</span>
                        </div>
                        <span>{video.size}</span>
                      </div>

                      {/* Progress Indicators */}
                      <div className="flex items-center space-x-4 text-sm">
                        <div className="flex items-center space-x-1">
                          <FileText className="h-4 w-4 text-blue-600" />
                          <span className="text-gray-600 dark:text-gray-400">
                            {video.transcriptCount || 0} segments
                          </span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <HelpCircle className="h-4 w-4 text-purple-600" />
                          <span className="text-gray-600 dark:text-gray-400">{video.mcqCount || 0} questions</span>
                        </div>
                      </div>

                      {/* Action Buttons */}
                      <div className="flex items-center space-x-2 pt-2">
                        <Button onClick={() => handleOpenVideo(video)} size="sm" className="flex-1">
                          <Play className="h-4 w-4 mr-2" />
                          Open
                        </Button>
                        <Button
                          onClick={(e) => {
                            e.stopPropagation()
                            handleDeleteVideo(video.id)
                          }}
                          size="sm"
                          variant="outline"
                          className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>

        {/* Features Section */}
        <div className="grid md:grid-cols-3 gap-8 mt-16">
          <Card className="text-center p-6">
            <Video className="h-12 w-12 text-blue-600 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">Video Upload</h3>
            <p className="text-gray-600 dark:text-gray-400">
              Upload videos in multiple formats and get instant processing
            </p>
          </Card>

          <Card className="text-center p-6">
            <FileText className="h-12 w-12 text-green-600 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">AI Transcription</h3>
            <p className="text-gray-600 dark:text-gray-400">Automatic speech-to-text with intelligent segmentation</p>
          </Card>

          <Card className="text-center p-6">
            <HelpCircle className="h-12 w-12 text-purple-600 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">MCQ Generation</h3>
            <p className="text-gray-600 dark:text-gray-400">Generate multiple choice questions with explanations</p>
          </Card>
        </div>
      </main>
    </div>
  )
}
