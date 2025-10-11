import type { FaceDetection } from "./types"

let modelsLoaded = false
let faceapi: any = null

async function getFaceAPI() {
  if (!faceapi) {
    // Dynamic import to ensure face-api only loads in browser
    faceapi = await import("@vladmandic/face-api")
  }
  return faceapi
}

export async function loadModels(): Promise<void> {
  if (modelsLoaded) return

  // Ensure we're in browser environment
  if (typeof window === "undefined") {
    throw new Error("Face detection can only run in browser environment")
  }

  const api = await getFaceAPI()
  const MODEL_URL = "https://cdn.jsdelivr.net/npm/@vladmandic/face-api/model"

  try {
    await Promise.all([
      api.nets.tinyFaceDetector.loadFromUri(MODEL_URL),
      api.nets.faceLandmark68Net.loadFromUri(MODEL_URL),
      api.nets.faceRecognitionNet.loadFromUri(MODEL_URL),
      api.nets.faceExpressionNet.loadFromUri(MODEL_URL),
      api.nets.ageGenderNet.loadFromUri(MODEL_URL),
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

  const api = await getFaceAPI()

  try {
    const detections = await api
      .detectAllFaces(input, new api.TinyFaceDetectorOptions())
      .withFaceLandmarks()
      .withFaceExpressions()
      .withAgeAndGender()
      .withFaceDescriptors()

    return detections.map((detection: any, index: number) => ({
      id: `face-${Date.now()}-${index}`,
      box: {
        x: detection.detection.box.x,
        y: detection.detection.box.y,
        width: detection.detection.box.width,
        height: detection.detection.box.height,
      },
      landmarks: {
        positions: detection.landmarks.positions.map((pos: any) => ({
          x: pos.x,
          y: pos.y,
        })),
      },
      expressions: {
        neutral: detection.expressions.neutral,
        happy: detection.expressions.happy,
        sad: detection.expressions.sad,
        angry: detection.expressions.angry,
        fearful: detection.expressions.fearful,
        disgusted: detection.expressions.disgusted,
        surprised: detection.expressions.surprised,
      },
      age: Math.round(detection.age),
      gender: detection.gender as "male" | "female",
      genderProbability: detection.genderProbability,
      descriptor: detection.descriptor ? Array.from(detection.descriptor) : undefined,
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
