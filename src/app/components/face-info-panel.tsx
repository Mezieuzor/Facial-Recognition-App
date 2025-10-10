"use client"

import type { FaceDetection } from "@/app/lib/types"
import { getDominantEmotion } from "@/app/lib/face-detection"
import { User, Smile, Calendar } from "lucide-react"

interface FaceInfoPanelProps {
  faces: FaceDetection[]
}

export function FaceInfoPanel({ faces }: FaceInfoPanelProps) {
  if (faces.length === 0) {
    return (
      <div className="bg-card border border-border rounded-lg p-6 text-center">
        <p className="text-muted-foreground">No faces detected</p>
        <p className="text-sm text-muted-foreground mt-2">Position yourself in front of the camera</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <h3 className="text-xl font-semibold">Detected Faces ({faces.length})</h3>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {faces.map((face, index) => {
          const dominantEmotion = face.expressions ? getDominantEmotion(face.expressions) : "unknown"
          const emotionConfidence = face.expressions
            ? face.expressions[dominantEmotion as keyof typeof face.expressions]
            : 0

          return (
            <div key={face.id} className="bg-card border border-border rounded-lg p-4">
              <div className="flex items-center justify-between mb-3">
                <h4 className="text-lg font-semibold">Face {index + 1}</h4>
                <span className="bg-primary text-primary-foreground px-2 py-1 rounded text-xs font-semibold">
                  Active
                </span>
              </div>

              <div className="space-y-3">
                {/* Gender */}
                <div className="flex items-center gap-2">
                  <User className="w-4 h-4 text-muted-foreground" />
                  <div className="flex-1">
                    <p className="text-sm text-muted-foreground">Gender</p>
                    <p className="font-semibold capitalize">
                      {face.gender} ({Math.round((face.genderProbability || 0) * 100)}%)
                    </p>
                  </div>
                </div>

                {/* Age */}
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-muted-foreground" />
                  <div className="flex-1">
                    <p className="text-sm text-muted-foreground">Estimated Age</p>
                    <p className="font-semibold">{face.age} years</p>
                  </div>
                </div>

                {/* Emotion */}
                <div className="flex items-center gap-2">
                  <Smile className="w-4 h-4 text-muted-foreground" />
                  <div className="flex-1">
                    <p className="text-sm text-muted-foreground">Emotion</p>
                    <p className="font-semibold capitalize">{dominantEmotion}</p>
                  </div>
                </div>

                <div>
                  <p className="text-sm text-muted-foreground mb-1">Confidence</p>
                  <div className="w-full bg-secondary rounded-full h-2.5">
                    <div
                      className="bg-primary h-2.5 rounded-full transition-all duration-300 flex items-center justify-end pr-1"
                      style={{ width: `${emotionConfidence * 100}%` }}
                    >
                      <span className="text-xs text-primary-foreground font-semibold">
                        {Math.round(emotionConfidence * 100)}%
                      </span>
                    </div>
                  </div>
                </div>

                {/* All Emotions */}
                {face.expressions && (
                  <div className="pt-2 border-t border-border">
                    <p className="text-sm text-muted-foreground mb-2">All Emotions</p>
                    <div className="space-y-1">
                      {Object.entries(face.expressions)
                        .sort(([, a], [, b]) => b - a)
                        .map(([emotion, value]) => (
                          <div key={emotion} className="flex items-center justify-between text-xs">
                            <span className="capitalize text-muted-foreground">{emotion}</span>
                            <span className="font-semibold">{Math.round(value * 100)}%</span>
                          </div>
                        ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
