"use client"

import { useEffect, useRef, useState } from "react"
import { useAppDispatch, useAppSelector } from "@/app/lib/store/hooks"
import { startWebcam, stopWebcam, setWebcamError } from "@/app/lib/store/webcamSlice"
import { setFaces, setProcessing } from "@/app/lib/store/detectionSlice"
import { Video, VideoOff, Camera } from "lucide-react"
import { loadModels, detectFaces } from "@/app/lib/face-detection"
import { FaceOverlay } from "./face-overlay"
import { FaceInfoPanel } from "./face-info-panel"
import { EmotionChart } from "./emotion-chart"

export function WebcamCapture() {
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const detectionIntervalRef = useRef<NodeJS.Timeout | null>(null)
  const dispatch = useAppDispatch()
  const { isActive, error } = useAppSelector((state) => state.webcam)
  const { faces, isProcessing } = useAppSelector((state) => state.detection)
  const [capturedImage, setCapturedImage] = useState<string | null>(null)
  const [modelsLoading, setModelsLoading] = useState(false)
  const [modelsReady, setModelsReady] = useState(false)
  const [videoDimensions, setVideoDimensions] = useState({ width: 0, height: 0 })
  const [displayDimensions, setDisplayDimensions] = useState({ width: 0, height: 0 })

  useEffect(() => {
    const initModels = async () => {
      setModelsLoading(true)
      try {
        await loadModels()
        setModelsReady(true)
      } catch (err) {
        console.error("Failed to load models:", err)
      } finally {
        setModelsLoading(false)
      }
    }
    initModels()
  }, [])

  useEffect(() => {
    const updateDimensions = () => {
      if (videoRef.current && containerRef.current) {
        setVideoDimensions({
          width: videoRef.current.videoWidth,
          height: videoRef.current.videoHeight,
        })
        setDisplayDimensions({
          width: containerRef.current.offsetWidth,
          height: containerRef.current.offsetHeight,
        })
      }
    }

    const video = videoRef.current
    if (video) {
      video.addEventListener("loadedmetadata", updateDimensions)
      window.addEventListener("resize", updateDimensions)
    }

    return () => {
      if (video) {
        video.removeEventListener("loadedmetadata", updateDimensions)
      }
      window.removeEventListener("resize", updateDimensions)
    }
  }, [isActive])

  useEffect(() => {
    if (isActive && videoRef.current && modelsReady) {
      startFaceDetection()
    } else {
      stopFaceDetection()
    }

    return () => {
      stopFaceDetection()
    }
  }, [isActive, modelsReady])

  useEffect(() => {
    return () => {
      if (isActive) {
        dispatch(stopWebcam())
      }
    }
  }, [isActive, dispatch])

  const startFaceDetection = () => {
    if (detectionIntervalRef.current) return

    detectionIntervalRef.current = setInterval(async () => {
      if (videoRef.current && videoRef.current.readyState === 4) {
        dispatch(setProcessing(true))
        const detectedFaces = await detectFaces(videoRef.current)
        dispatch(setFaces(detectedFaces))
        dispatch(setProcessing(false))
      }
    }, 100)
  }

  const stopFaceDetection = () => {
    if (detectionIntervalRef.current) {
      clearInterval(detectionIntervalRef.current)
      detectionIntervalRef.current = null
    }
  }

  const handleStartWebcam = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: { ideal: 1280 },
          height: { ideal: 720 },
          facingMode: "user",
        },
        audio: false,
      })

      if (videoRef.current) {
        videoRef.current.srcObject = stream
        videoRef.current.play()
      }

      dispatch(startWebcam(stream))
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to access webcam"
      dispatch(setWebcamError(errorMessage))
      console.error("Error accessing webcam:", err)
    }
  }

  const handleStopWebcam = () => {
    if (videoRef.current) {
      videoRef.current.srcObject = null
    }
    dispatch(stopWebcam())
    setCapturedImage(null)
  }

  const handleCaptureImage = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current
      const canvas = canvasRef.current

      canvas.width = video.videoWidth
      canvas.height = video.videoHeight

      const ctx = canvas.getContext("2d")
      if (ctx) {
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height)
        const imageData = canvas.toDataURL("image/png")
        setCapturedImage(imageData)
      }
    }
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          {/* Video Display */}
          <div
            ref={containerRef}
            className="relative bg-secondary rounded-lg overflow-hidden mb-4"
            style={{ minHeight: "480px" }}
          >
            {!isActive && !capturedImage && (
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center">
                  <VideoOff className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
                  <p className="text-muted-foreground">
                    {modelsLoading ? "Loading AI models..." : "Webcam is not active"}
                  </p>
                  <p className="text-sm text-muted-foreground mt-2">
                    {modelsLoading ? "Please wait..." : "Click 'Start Webcam' to begin"}
                  </p>
                </div>
              </div>
            )}

            {capturedImage && (
              <div className="relative">
                <img src={capturedImage || "/placeholder.svg"} alt="Captured" className="w-full h-auto" />
                <div className="absolute top-4 right-4">
                  <button
                    onClick={() => setCapturedImage(null)}
                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90 px-4 py-2 rounded-lg font-semibold transition-colors"
                  >
                    Clear
                  </button>
                </div>
              </div>
            )}

            <video
              ref={videoRef}
              className={`w-full h-auto ${capturedImage ? "hidden" : ""}`}
              autoPlay
              playsInline
              muted
            />

            {isActive && !capturedImage && (
              <FaceOverlay
                faces={faces}
                videoWidth={videoDimensions.width}
                videoHeight={videoDimensions.height}
                displayWidth={displayDimensions.width}
                displayHeight={displayDimensions.height}
              />
            )}

            <canvas ref={canvasRef} className="hidden" />
          </div>

          {/* Error Display */}
          {error && (
            <div className="bg-destructive/10 border border-destructive text-destructive-foreground rounded-lg p-4 mb-4">
              <p className="font-semibold">Error</p>
              <p className="text-sm">{error}</p>
            </div>
          )}

          {/* Controls */}
          <div className="flex flex-wrap gap-3 justify-center mb-4">
            {!isActive ? (
              <button
                onClick={handleStartWebcam}
                disabled={modelsLoading}
                className="bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed px-6 py-3 rounded-lg font-semibold inline-flex items-center gap-2 transition-colors"
              >
                <Video className="w-5 h-5" />
                {modelsLoading ? "Loading Models..." : "Start Webcam"}
              </button>
            ) : (
              <>
                <button
                  onClick={handleStopWebcam}
                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90 px-6 py-3 rounded-lg font-semibold inline-flex items-center gap-2 transition-colors"
                >
                  <VideoOff className="w-5 h-5" />
                  Stop Webcam
                </button>
                <button
                  onClick={handleCaptureImage}
                  className="border border-border text-foreground hover:bg-secondary px-6 py-3 rounded-lg font-semibold inline-flex items-center gap-2 transition-colors"
                >
                  <Camera className="w-5 h-5" />
                  Capture Image
                </button>
              </>
            )}
          </div>

          {/* Info */}
          <div className="bg-card border border-border rounded-lg p-4">
            <h3 className="text-lg font-semibold mb-2">Status</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
              <div>
                <p className="text-muted-foreground">Webcam</p>
                <p className="font-semibold">{isActive ? "Active" : "Inactive"}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Faces Detected</p>
                <p className="font-semibold">{faces.length}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Processing</p>
                <p className="font-semibold">{isProcessing ? "Analyzing..." : modelsReady ? "Ready" : "Loading..."}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="lg:col-span-1">
          <EmotionChart />
        </div>
      </div>

      <FaceInfoPanel faces={faces} />
    </div>
  )
}
