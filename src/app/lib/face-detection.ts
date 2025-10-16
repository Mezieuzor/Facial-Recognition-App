import type { FaceDetection } from "./types"

let modelsLoaded = false
let faceapi: typeof import("@vladmandic/face-api") | null = null

// Dynamically import face-api only in browser environment
async function getFaceApi() {
  if (typeof window === "undefined") {
    throw new Error("Face detection can only run in the browser")
  }

  if (!faceapi) {
    faceapi = await import("@vladmandic/face-api")
  }

  return faceapi
}

export async function loadModels(): Promise<void> {
  if (typeof window === "undefined") {
    console.warn("Cannot load models in server environment")
    return
  }

  if (modelsLoaded) return

  const api = await getFaceApi()
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
  if (typeof window === "undefined") {
    console.warn("Cannot detect faces in server environment")
    return []
  }

  if (!modelsLoaded) {
    await loadModels()
  }

  const api = await getFaceApi()

  try {
    const detections = await api
      .detectAllFaces(input, new api.TinyFaceDetectorOptions())
      .withFaceLandmarks()
      .withFaceExpressions()
      .withAgeAndGender()
      .withFaceDescriptors()

    return detections.map(
      (
        detection: import("@vladmandic/face-api").WithFaceDescriptor<
          import("@vladmandic/face-api").WithAge<
            import("@vladmandic/face-api").WithGender<
              import("@vladmandic/face-api").WithFaceExpressions<
                import("@vladmandic/face-api").WithFaceLandmarks<
                  { detection: import("@vladmandic/face-api").FaceDetection },
                  import("@vladmandic/face-api").FaceLandmarks68
                >
              >
            >
          >
        >,
        index: number,
      ) => {
        // Extract expressions as plain object with explicit types
        const expressionsObj = detection.expressions as unknown as Record<string, number>

        return {
          id: `face-${Date.now()}-${index}`,
          box: {
            x: detection.detection.box.x,
            y: detection.detection.box.y,
            width: detection.detection.box.width,
            height: detection.detection.box.height,
          },
          landmarks: {
            positions: detection.landmarks.positions.map((pos: { x: number; y: number }) => ({
              x: pos.x,
              y: pos.y,
            })),
          },
          expressions: {
            neutral: expressionsObj.neutral || 0,
            happy: expressionsObj.happy || 0,
            sad: expressionsObj.sad || 0,
            angry: expressionsObj.angry || 0,
            fearful: expressionsObj.fearful || 0,
            disgusted: expressionsObj.disgusted || 0,
            surprised: expressionsObj.surprised || 0,
          },
          age: Math.round(detection.age),
          gender: detection.gender as "male" | "female",
          genderProbability: detection.genderProbability,
          descriptor: detection.descriptor ? Array.from(detection.descriptor) : undefined,
        }
      },
    )
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
  const emotions: [string, number][] = Object.entries(expressions)
  const dominant = emotions.reduce((prev: [string, number], current: [string, number]) =>
    current[1] > prev[1] ? current : prev,
  )
  return dominant[0]
}
