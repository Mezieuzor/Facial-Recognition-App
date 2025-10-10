"use client"

import { useEffect, useState } from "react"
import { useAppSelector } from "@/app/lib/store/hooks"
import { getDominantEmotion } from "@/app/lib/face-detection"

interface EmotionHistory {
  timestamp: number
  emotion: string
  confidence: number
}

export function EmotionChart() {
  const { faces } = useAppSelector((state) => state.detection)
  const [emotionHistory, setEmotionHistory] = useState<EmotionHistory[]>([])
  const [emotionCounts, setEmotionCounts] = useState<Record<string, number>>({})

  useEffect(() => {
    if (faces.length > 0) {
      const face = faces[0] // Track first face
      if (face.expressions) {
        const dominantEmotion = getDominantEmotion(face.expressions)
        const confidence = face.expressions[dominantEmotion as keyof typeof face.expressions]

        setEmotionHistory((prev) => {
          const newHistory = [
            ...prev,
            {
              timestamp: Date.now(),
              emotion: dominantEmotion,
              confidence,
            },
          ]
          // Keep only last 50 entries
          return newHistory.slice(-50)
        })

        setEmotionCounts((prev) => ({
          ...prev,
          [dominantEmotion]: (prev[dominantEmotion] || 0) + 1,
        }))
      }
    }
  }, [faces])

  const totalCount = Object.values(emotionCounts).reduce((sum, count) => sum + count, 0)

  const emotionColors: Record<string, string> = {
    happy: "oklch(0.696 0.17 162.48)",
    sad: "oklch(0.488 0.243 264.376)",
    angry: "oklch(0.396 0.141 25.723)",
    surprised: "oklch(0.769 0.188 70.08)",
    fearful: "oklch(0.627 0.265 303.9)",
    disgusted: "oklch(0.645 0.246 16.439)",
    neutral: "oklch(0.708 0 0)",
  }

  return (
    <div className="bg-card border border-border rounded-lg p-4">
      <h3 className="text-xl font-semibold mb-4">Emotion Tracking</h3>

      {emotionHistory.length === 0 ? (
        <p className="text-muted-foreground text-center py-8">
          No emotion data yet. Start the webcam to begin tracking.
        </p>
      ) : (
        <div className="space-y-6">
          {/* Current Emotion */}
          <div>
            <p className="text-sm text-muted-foreground mb-2">Current Emotion</p>
            <div className="flex items-center gap-3">
              <div
                className="w-4 h-4 rounded-full"
                style={{
                  backgroundColor: emotionColors[emotionHistory[emotionHistory.length - 1].emotion] || "gray",
                }}
              />
              <span className="text-2xl font-bold capitalize">{emotionHistory[emotionHistory.length - 1].emotion}</span>
              <span className="text-muted-foreground">
                ({Math.round(emotionHistory[emotionHistory.length - 1].confidence * 100)}%)
              </span>
            </div>
          </div>

          {/* Emotion Distribution */}
          <div>
            <p className="text-sm text-muted-foreground mb-3">Emotion Distribution</p>
            <div className="space-y-2">
              {Object.entries(emotionCounts)
                .sort(([, a], [, b]) => b - a)
                .map(([emotion, count]) => {
                  const percentage = (count / totalCount) * 100
                  return (
                    <div key={emotion}>
                      <div className="flex items-center justify-between mb-1">
                        <div className="flex items-center gap-2">
                          <div className="w-3 h-3 rounded-full" style={{ backgroundColor: emotionColors[emotion] }} />
                          <span className="text-sm capitalize">{emotion}</span>
                        </div>
                        <span className="text-sm font-semibold">{Math.round(percentage)}%</span>
                      </div>
                      <div className="w-full bg-secondary rounded-full h-2">
                        <div
                          className="h-2 rounded-full transition-all duration-300"
                          style={{
                            width: `${percentage}%`,
                            backgroundColor: emotionColors[emotion],
                          }}
                        />
                      </div>
                    </div>
                  )
                })}
            </div>
          </div>

          {/* Timeline */}
          <div>
            <p className="text-sm text-muted-foreground mb-3">Recent Timeline</p>
            <div className="flex gap-1 h-12 items-end">
              {emotionHistory.slice(-30).map((entry, index) => (
                <div
                  key={index}
                  className="flex-1 rounded-t transition-all duration-200 hover:opacity-80"
                  style={{
                    backgroundColor: emotionColors[entry.emotion],
                    height: `${entry.confidence * 100}%`,
                    minHeight: "4px",
                  }}
                  title={`${entry.emotion} (${Math.round(entry.confidence * 100)}%)`}
                />
              ))}
            </div>
            <div className="flex justify-between text-xs text-muted-foreground mt-1">
              <span>Past</span>
              <span>Present</span>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 gap-4 pt-4 border-t border-border">
            <div>
              <p className="text-sm text-muted-foreground">Total Samples</p>
              <p className="text-2xl font-bold">{totalCount}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Most Common</p>
              <p className="text-2xl font-bold capitalize">
                {Object.entries(emotionCounts).sort(([, a], [, b]) => b - a)[0]?.[0] || "N/A"}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
