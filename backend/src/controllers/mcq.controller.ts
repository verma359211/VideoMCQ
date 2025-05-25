/*
 * MCQ CONTROLLER
 *
 * TODO: Implement the following functionality:
 *
 * 1. MCQ Generation:
 *    - Get transcript segments from database
 *    - Send segments to LLM for question generation
 *    - Parse and validate generated questions
 *    - Save questions to database
 *
 * 2. LLM Integration:
 *    - Local LLM (Ollama) integration
 *    - OpenAI API integration (alternative)
 *    - Prompt engineering for quality questions
 *    - Response parsing and validation
 *
 * 3. Question Management:
 *    - Get existing questions
 *    - Update questions
 *    - Delete questions
 *    - Bulk operations
 *
 * Required AI Integration:
 * - Ollama (local LLM) or OpenAI API
 * - Prompt engineering for MCQ generation
 *
 * Environment variables needed:
 * - LLM_API_URL (for Ollama)
 * - LLM_MODEL_NAME (model to use)
 * - OPENAI_API_KEY (if using OpenAI)
 */

import type { Request, Response } from "express"
import { TranscriptService } from "../services/transcript.service"
import { VideoService } from "../services/video.service"
import { MCQService } from "../services/mcq.service"

export class MCQController {
  // TODO: Implement MCQ generation endpoint
  async generateMCQs(req: Request, res: Response) {
    try {
      const { videoId } = req.params

      // Get transcript segments from database
      const segments = await TranscriptService.getSegments(videoId)

      if (!segments || segments.length === 0) {
        return res.status(400).json({
          success: false,
          message: "No transcript found. Generate transcript first.",
        })
      }

      // Update video status to 'generating_mcqs'
      await VideoService.updateStatus(videoId, "generating_mcqs")

      // Start MCQ generation in background
      this.processMCQGeneration(videoId, segments)

      res.json({
        success: true,
        message: "MCQ generation started",
        videoId,
      })
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "Failed to start MCQ generation",
        error: error.message,
      })
    }
  }

  // TODO: Implement background MCQ processing
  private async processMCQGeneration(videoId: string, segments: any[]) {
    try {
      const allQuestions = []

      for (const segment of segments) {
        // Generate MCQs for each segment
        const questions = await this.generateMCQsForSegment(segment)

        // Save questions to database
        for (const question of questions) {
          const savedQuestion = await MCQService.createQuestion({
            videoId,
            segmentId: segment._id,
            question: question.question,
            options: question.options,
            correctAnswer: question.correctAnswer,
            explanation: question.explanation,
          })
          allQuestions.push(savedQuestion)
        }

        // Emit progress update via WebSocket
        // this.emitProgressUpdate(videoId, {
        //   stage: 'mcq_generation',
        //   progress: (segments.indexOf(segment) + 1) / segments.length * 100
        // })
      }

      // Update video status to 'completed'
      await VideoService.updateStatus(videoId, "completed")

      // Emit completion event
      // this.emitProgressUpdate(videoId, { stage: 'completed', progress: 100 })
    } catch (error) {
      console.error("MCQ generation failed:", error)
      // Update video status to 'error'
      await VideoService.updateStatus(videoId, "error")
    }
  }

  // TODO: Implement MCQ generation for single segment
  private async generateMCQsForSegment(segment: any): Promise<any[]> {
    const prompt = this.createMCQPrompt(segment.text)

    // Option A: Local LLM (Ollama)
    try {
      const response = await fetch(`${process.env.LLM_API_URL}/api/generate`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: process.env.LLM_MODEL_NAME || "llama3.1:8b",
          prompt: prompt,
          stream: false,
          options: {
            temperature: 0.7,
            max_tokens: 1000,
          },
        }),
      })

      if (!response.ok) {
        throw new Error(`LLM API error: ${response.statusText}`)
      }

      const result = await response.json()
      return this.parseMCQResponse(result.response)
    } catch (error) {
      console.error("LLM generation failed:", error)
      throw error
    }

    // Option B: OpenAI API
    /*
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'gpt-3.5-turbo',
        messages: [
          {
            role: 'system',
            content: 'You are an expert educator who creates high-quality multiple choice questions.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.7
      })
    })
    
    const result = await response.json()
    return this.parseMCQResponse(result.choices[0].message.content)
    */
  }

  // TODO: Implement prompt engineering for MCQ generation
  private createMCQPrompt(transcriptText: string): string {
    return `
Based on the following transcript segment, generate 2-3 multiple choice questions that test comprehension and key concepts.

Transcript:
"${transcriptText}"

Please format your response as JSON with the following structure:
{
  "questions": [
    {
      "question": "Question text here?",
      "options": ["Option A", "Option B", "Option C", "Option D"],
      "correctAnswer": 0,
      "explanation": "Explanation of why this answer is correct"
    }
  ]
}

Guidelines:
- Focus on key concepts, facts, and important information
- Make questions clear and unambiguous
- Ensure options are plausible but only one is clearly correct
- Provide helpful explanations
- Avoid trivial or overly complex questions
- Generate 2-3 questions per segment

Response:
`
  }

  // TODO: Implement response parsing and validation
  private parseMCQResponse(response: string): any[] {
    try {
      // Clean up the response (remove any markdown formatting)
      const cleanResponse = response
        .replace(/```json/g, "")
        .replace(/```/g, "")
        .trim()

      const parsed = JSON.parse(cleanResponse)

      if (parsed.questions && Array.isArray(parsed.questions)) {
        return parsed.questions.map((q) => ({
          question: q.question,
          options: q.options || [],
          correctAnswer: q.correctAnswer || 0,
          explanation: q.explanation || "",
        }))
      }

      throw new Error("Invalid response format")
    } catch (error) {
      console.error("Failed to parse MCQ response:", error)

      // Implement fallback parsing
      return this.fallbackParsing(response)
    }
  }

  // TODO: Implement fallback parsing for malformed responses
  private fallbackParsing(response: string): any[] {
    // Simple fallback parsing if JSON parsing fails
    const questions = []
    const lines = response.split("\n")

    let currentQuestion = null
    let currentOptions = []

    for (const line of lines) {
      const trimmed = line.trim()

      if (trimmed.includes("?")) {
        if (currentQuestion) {
          questions.push({
            question: currentQuestion,
            options: currentOptions,
            correctAnswer: 0,
            explanation: "Generated by AI",
          })
        }
        currentQuestion = trimmed
        currentOptions = []
      } else if (trimmed.match(/^[A-D][.)]/)) {
        currentOptions.push(trimmed.substring(2).trim())
      }
    }

    if (currentQuestion && currentOptions.length > 0) {
      questions.push({
        question: currentQuestion,
        options: currentOptions,
        correctAnswer: 0,
        explanation: "Generated by AI",
      })
    }

    return questions
  }

  // TODO: Implement get MCQs endpoint
  async getMCQs(req: Request, res: Response) {
    try {
      const { videoId } = req.params

      // Get questions from database
      const questions = await MCQService.getQuestions(videoId)

      res.json({
        success: true,
        questions,
      })
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "Failed to get MCQs",
        error: error.message,
      })
    }
  }

  // TODO: Implement update MCQ endpoint
  async updateMCQ(req: Request, res: Response) {
    try {
      const { questionId } = req.params
      const updates = req.body

      // Update question in database
      const updatedQuestion = await MCQService.updateQuestion(questionId, updates)

      res.json({
        success: true,
        question: updatedQuestion,
      })
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "Failed to update MCQ",
        error: error.message,
      })
    }
  }

  // TODO: Implement delete MCQ endpoint
  async deleteMCQ(req: Request, res: Response) {
    try {
      const { questionId } = req.params

      // Delete question from database
      await MCQService.deleteQuestion(questionId)

      res.json({
        success: true,
        message: "MCQ deleted successfully",
      })
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "Failed to delete MCQ",
        error: error.message,
      })
    }
  }
}
