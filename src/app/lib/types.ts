export interface FaceDetection {
  id: string
  box: {
    x: number
    y: number
    width: number
    height: number
  }
  landmarks?: {
    positions: { x: number; y: number }[]
  }
  expressions?: {
    neutral: number
    happy: number
    sad: number
    angry: number
    fearful: number
    disgusted: number
    surprised: number
  }
  age?: number
  gender?: "male" | "female"
  genderProbability?: number
  descriptor?: Float32Array
}

export interface WebcamState {
  isActive: boolean
  stream: MediaStream | null
  error: string | null
}

export interface DetectionState {
  faces: FaceDetection[]
  isProcessing: boolean
  lastDetectionTime: number | null
}

export interface UploadState {
  uploadedImage: string | null
  isProcessing: boolean
}
