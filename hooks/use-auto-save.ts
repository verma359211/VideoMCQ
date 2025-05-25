"use client"

import { useCallback } from "react"
import type { VideoData, TranscriptSegment, MCQQuestion } from "@/lib/types"

interface AutoSaveData {
  currentVideo: VideoData | null
  transcriptSegments: TranscriptSegment[]
  mcqQuestions: MCQQuestion[]
  lastSaved: string
}

export function useAutoSave() {
  const saveToStorage = useCallback((data: Partial<AutoSaveData>) => {
    try {
      const existing = localStorage.getItem("videoMCQ-autosave")
      const existingData = existing ? JSON.parse(existing) : {}

      const newData = {
        ...existingData,
        ...data,
        lastSaved: new Date().toISOString(),
      }

      localStorage.setItem("videoMCQ-autosave", JSON.stringify(newData))
    } catch (error) {
      console.error("Failed to save to localStorage:", error)
    }
  }, [])

  const loadFromStorage = useCallback((): AutoSaveData | null => {
    try {
      const saved = localStorage.getItem("videoMCQ-autosave")
      return saved ? JSON.parse(saved) : null
    } catch (error) {
      console.error("Failed to load from localStorage:", error)
      return null
    }
  }, [])

  const clearStorage = useCallback(() => {
    try {
      localStorage.removeItem("videoMCQ-autosave")
    } catch (error) {
      console.error("Failed to clear localStorage:", error)
    }
  }, [])

  return { saveToStorage, loadFromStorage, clearStorage }
}
