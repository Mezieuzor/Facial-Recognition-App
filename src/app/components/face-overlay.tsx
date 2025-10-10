"use client"

import type { FaceDetection } from "@/app/lib/types"
import { getDominantEmotion } from "@/app/lib/face-detection"

interface FaceOverlayProps {
  faces: FaceDetection[]
  videoWidth: number
  videoHeight: number
  displayWidth: number
  displayHeight: number
}

export function FaceOverlay({ faces, videoWidth, videoHeight, displayWidth, displayHeight }: FaceOverlayProps) {
  if (!videoWidth || !videoHeight) return null

  const scaleX = displayWidth / videoWidth
  const scaleY = displayHeight / videoHeight

  return (
    <svg
      className="absolute top-0 left-0 w-full h-full pointer-events-none"
      viewBox={`0 0 ${displayWidth} ${displayHeight}`}
      style={{ zIndex: 10 }}
    >
      {faces.map((face) => {
        const x = face.box.x * scaleX
        const y = face.box.y * scaleY
        const width = face.box.width * scaleX
        const height = face.box.height * scaleY

        const emotion = face.expressions ? getDominantEmotion(face.expressions) : "unknown"

        return (
          <g key={face.id}>
            {/* Face bounding box */}
            <rect
              x={x}
              y={y}
              width={width}
              height={height}
              fill="none"
              stroke="oklch(0.488 0.243 264.376)"
              strokeWidth="3"
              rx="4"
            />

            {/* Info label background */}
            <rect x={x} y={y - 32} width={width} height="30" fill="oklch(0.488 0.243 264.376)" opacity="0.9" rx="4" />

            {/* Info text */}
            <text x={x + width / 2} y={y - 12} fill="white" fontSize="14" fontWeight="bold" textAnchor="middle">
              {emotion.charAt(0).toUpperCase() + emotion.slice(1)}
            </text>

            {/* Facial landmarks */}
            {face.landmarks?.positions.map((point, idx) => (
              <circle
                key={`${face.id}-landmark-${idx}`}
                cx={point.x * scaleX}
                cy={point.y * scaleY}
                r="1.5"
                fill="oklch(0.696 0.17 162.48)"
                opacity="0.6"
              />
            ))}
          </g>
        )
      })}
    </svg>
  )
}
