import type { VideoData, TranscriptSegment, MCQQuestion } from "./types"

const API_BASE_URL = "http://localhost:3001/api"

export class ApiClient {
  static async uploadVideo(file: File): Promise<VideoData> {
    const formData = new FormData()
    formData.append("video", file)

    const response = await fetch(`${API_BASE_URL}/upload`, {
      method: "POST",
      body: formData,
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.message || "Upload failed")
    }

    const result = await response.json()

    // Add the filepath to the result for future reference
    return {
      ...result,
      filepath: result.filepath || result.filename,
    }
  }

  static async generateTranscript(
    file: File,
    videoDuration: number,
    onProgress: (segments: TranscriptSegment[], progress: number) => void,
  ): Promise<TranscriptSegment[]> {
    const formData = new FormData()
    formData.append("file", file)

    const response = await fetch("http://localhost:8000/transcribe-stream", {
      method: "POST",
      body: formData,
    })

    if (!response.ok || !response.body) {
      throw new Error("Failed to start transcription")
    }

    const reader = response.body.getReader()
    const decoder = new TextDecoder("utf-8")
    const rawSegments: Array<{ text: string; start: number; end: number }> = []
    const oneMinuteSegments: TranscriptSegment[] = []
    let segmentNumber = 1
    let currentSegment: { text: string; start: number; end: number } | null = null

    // Initial progress update - processing started
    onProgress([], 0)

    while (true) {
      const { value, done } = await reader.read()
      if (done) break

      const chunk = decoder.decode(value, { stream: true })
      const lines = chunk
        .split("\n")
        .filter((line) => line.startsWith("data:"))
        .map((line) => line.replace(/^data:\s*/, ""))

      for (const line of lines) {
        try {
          const parsed = JSON.parse(line)
          if (parsed.text && parsed.start !== undefined && parsed.end !== undefined) {
            rawSegments.push({
              text: parsed.text,
              start: parsed.start,
              end: parsed.end,
            })

            // Group into 1-minute segments in real-time
            if (!currentSegment) {
              currentSegment = {
                text: parsed.text,
                start: parsed.start,
                end: parsed.end,
              }
            } else {
              if (parsed.start - currentSegment.start >= 60) {
                // Complete current segment and add to array
                const newSegment: TranscriptSegment = {
                  id: `segment-${segmentNumber}`,
                  text: currentSegment.text,
                  startTime: currentSegment.start,
                  endTime: currentSegment.end,
                  segmentNumber: segmentNumber,
                }
                oneMinuteSegments.push(newSegment)
                segmentNumber++

                // Calculate progress based on latest segment end time vs video duration
                const progress = Math.min((currentSegment.end / videoDuration) * 100, 100)

                // Send real-time update with new segment and progress
                onProgress([...oneMinuteSegments], progress)

                // Start new segment
                currentSegment = {
                  text: parsed.text,
                  start: parsed.start,
                  end: parsed.end,
                }
              } else {
                // Continue building current segment
                currentSegment.text += " " + parsed.text
                currentSegment.end = parsed.end
              }
            }
          }
        } catch (err) {
          console.warn("Failed to parse streamed line:", err)
        }
      }
    }

    // Handle final segment if exists
    if (currentSegment) {
      const finalSegment: TranscriptSegment = {
        id: `segment-${segmentNumber}`,
        text: currentSegment.text,
        startTime: currentSegment.start,
        endTime: currentSegment.end,
        segmentNumber: segmentNumber,
      }
      oneMinuteSegments.push(finalSegment)

      // Final progress update
      onProgress([...oneMinuteSegments], 100)
    }

    return oneMinuteSegments
  }

  static async generateMCQs(
    segments: TranscriptSegment[],
    onQuestionGenerated: (question: MCQQuestion) => void,
    onProgress: (current: number, total: number) => void,
  ): Promise<MCQQuestion[]> {
    const allQuestions: MCQQuestion[] = []

    for (let i = 0; i < segments.length; i++) {
      const segment = segments[i]
      onProgress(i + 1, segments.length)

      try {
        const response = await fetch("http://localhost:11434/api/generate", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            model: "mistral",
            prompt: `Create 1 multiple choice question from this text. Format as JSON:
{
  "question": "Question text?",
  "options": ["Option A", "Option B", "Option C", "Option D"],
  "correctAnswer": 0,
  "explanation": "Why this is correct"
}

Text: "${segment.text}"`,
            stream: true,
          }),
        })

        if (!response.ok || !response.body) {
          console.error(`Failed to generate MCQ for segment ${segment.segmentNumber}`)
          continue
        }

        const reader = response.body.getReader()
        const decoder = new TextDecoder("utf-8")
        let mcqText = ""

        while (true) {
          const { value, done } = await reader.read()
          if (done) break

          const chunkData = decoder.decode(value, { stream: true })
          const lines = chunkData.split("\n").filter((line) => line.trim().startsWith("{"))

          for (const line of lines) {
            try {
              const parsed = JSON.parse(line.trim())
              if (parsed.response !== undefined) {
                mcqText += parsed.response
              }
            } catch (err) {
              console.warn("Failed to parse MCQ line:", line)
            }
          }
        }

        const question = this.parseMCQText(mcqText, segment.id, segment.segmentNumber)
        if (question) {
          allQuestions.push(question)
          onQuestionGenerated(question)
        }
      } catch (error) {
        console.error(`Error generating MCQ for segment ${segment.segmentNumber}:`, error)
      }
    }

    return allQuestions
  }

  private static parseMCQText(text: string, segmentId: string, segmentNumber: number): MCQQuestion | null {
    try {
      const jsonMatch = text.match(/\{[\s\S]*\}/)
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0])
        if (parsed.question && parsed.options && Array.isArray(parsed.options)) {
          return {
            id: `mcq-${segmentNumber}-${Date.now()}`,
            segmentId: segmentId,
            question: parsed.question || "",
            options: parsed.options || [],
            correctAnswer: parsed.correctAnswer || 0,
            explanation: parsed.explanation || "",
          }
        }
      }
    } catch (error) {
      console.error("Failed to parse MCQ JSON:", error)
    }
    return null
  }

  static async saveVideo(video: VideoData): Promise<void> {
    await fetch(`${API_BASE_URL}/videos`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(video),
    })
  }

  static async saveTranscript(videoId: string, segments: TranscriptSegment[]): Promise<void> {
    await fetch(`${API_BASE_URL}/transcripts`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ videoId, segments }),
    })
  }

  static async saveMCQs(videoId: string, questions: MCQQuestion[]): Promise<void> {
    await fetch(`${API_BASE_URL}/mcqs`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ videoId, questions }),
    })
  }

  static async updateMCQ(questionId: string, updates: Partial<MCQQuestion>): Promise<MCQQuestion> {
    const response = await fetch(`${API_BASE_URL}/mcqs/${questionId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(updates),
    })
    return response.json()
  }
}
