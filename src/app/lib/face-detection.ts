import * as faceapi from "@vladmandic/face-api"
import type { FaceDetection } from "./types"

let modelsLoaded = false

export async function loadModels(): Promise<void> {
  if (modelsLoaded) return

  const MODEL_URL = "https://cdn.jsdelivr.net/npm/@vladmandic/face-api/model"

  try {
    await Promise.all([
      faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL),
      faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL),
      faceapi.nets.faceRecognitionNet.loadFromUri(MODEL_URL),
      faceapi.nets.faceExpressionNet.loadFromUri(MODEL_URL),
      faceapi.nets.ageGenderNet.loadFromUri(MODEL_URL),
    ])
    modelsLoaded = true
    console.log("Face detection models loaded successfully")
  } catch (error) {
    console.error("Error loading face detection models:", error)
    throw error
  }
}

export async function detectFaces(
  input: HTMLVideoElement | HTMLImageElement | HTMLCanvasElement,
): Promise<FaceDetection[]> {
  if (!modelsLoaded) {
    await loadModels()
  }

  try {
    const detections = await faceapi
      .detectAllFaces(input, new faceapi.TinyFaceDetectorOptions())
      .withFaceLandmarks()
      .withFaceExpressions()
      .withAgeAndGender()
      .withFaceDescriptors()

    return detections.map((detection, index) => ({
      id: `face-${Date.now()}-${index}`,
      box: {
        x: detection.detection.box.x,
        y: detection.detection.box.y,
        width: detection.detection.box.width,
        height: detection.detection.box.height,
      },
      landmarks: {
        positions: detection.landmarks.positions.map((pos) => ({
          x: pos.x,
          y: pos.y,
        })),
      },
      expressions: detection.expressions,
      age: Math.round(detection.age),
      gender: detection.gender as "male" | "female",
      genderProbability: detection.genderProbability,
      descriptor: detection.descriptor,
    }))
  } catch (error) {
    console.error("Error detecting faces:", error)
    return []
  }
}

export function getDominantEmotion(expressions: {
  neutral: number
  happy: number
  sad: number
  angry: number
  fearful: number
  disgusted: number
  surprised: number
}): string {
  const emotions = Object.entries(expressions)
  const dominant = emotions.reduce((prev, current) => (current[1] > prev[1] ? current : prev))
  return dominant[0]
}
