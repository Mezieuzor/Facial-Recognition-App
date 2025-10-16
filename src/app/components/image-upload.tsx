"use client"

import type React from "react"
import { useRef, useState } from "react"
import { Upload, X } from "lucide-react"
import { useAppDispatch, useAppSelector } from "@/app/lib/store/hooks"
import { setUploadedImage, setUploadProcessing, clearUploadedImage } from "@/app/lib/store/uploadSlice"
import { setFaces } from "@/app/lib/store/detectionSlice"
import { detectFaces } from "@/app/lib/face-detection"
import { FaceOverlay } from "./face-overlay"
import { FaceInfoPanel } from "./face-info-panel"

export function ImageUpload() {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const imageRef = useRef<HTMLImageElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const dispatch = useAppDispatch()
  const { uploadedImage, isProcessing } = useAppSelector((state) => state.upload)
  const { faces } = useAppSelector((state) => state.detection)
  const [imageDimensions, setImageDimensions] = useState({ width: 0, height: 0 })
  const [displayDimensions, setDisplayDimensions] = useState({ width: 0, height: 0 })

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    if (!file.type.startsWith("image/")) {
      alert("Please select an image file")
      return
    }

    const reader = new FileReader()
    reader.onload = async (e) => {
      const imageData = e.target?.result as string
      dispatch(setUploadedImage(imageData))

      // Wait for image to load before detecting
      const img = new Image()
      img.onload = async () => {
        dispatch(setUploadProcessing(true))
        const detectedFaces = await detectFaces(img)
        dispatch(setFaces(detectedFaces))
        dispatch(setUploadProcessing(false))

        setImageDimensions({ width: img.width, height: img.height })
        if (containerRef.current) {
          setDisplayDimensions({
            width: containerRef.current.offsetWidth,
            height: containerRef.current.offsetHeight,
          })
        }
      }
      img.src = imageData
    }
    reader.readAsDataURL(file)
  }

  const handleClearImage = () => {
    dispatch(clearUploadedImage())
    dispatch(setFaces([]))
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }

  const handleUploadClick = () => {
    fileInputRef.current?.click()
  }

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h3 className="text-2xl font-bold mb-2">Upload Image for Analysis</h3>
        <p className="text-muted-foreground">Upload a photo to detect faces and analyze emotions</p>
      </div>

      {/* Upload Area */}
      <div
        ref={containerRef}
        className="relative bg-secondary rounded-lg overflow-hidden border-2 border-dashed border-border"
        style={{ minHeight: "400px" }}
      >
        {!uploadedImage ? (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center p-8">
              <Upload className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
              <p className="text-muted-foreground mb-4">No image uploaded</p>
              <button
                onClick={handleUploadClick}
                className="bg-primary text-primary-foreground hover:bg-primary/90 px-6 py-3 rounded-lg font-semibold inline-flex items-center gap-2 transition-colors"
              >
                <Upload className="w-5 h-5" />
                Choose Image
              </button>
            </div>
          </div>
        ) : (
          <div className="relative">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              ref={imageRef}
              src={uploadedImage || "/placeholder.svg"}
              alt="Uploaded"
              className="w-full h-auto"
              onLoad={() => {
                if (imageRef.current && containerRef.current) {
                  setImageDimensions({
                    width: imageRef.current.naturalWidth,
                    height: imageRef.current.naturalHeight,
                  })
                  setDisplayDimensions({
                    width: containerRef.current.offsetWidth,
                    height: containerRef.current.offsetHeight,
                  })
                }
              }}
            />

            <FaceOverlay
              faces={faces}
              videoWidth={imageDimensions.width}
              videoHeight={imageDimensions.height}
              displayWidth={displayDimensions.width}
              displayHeight={displayDimensions.height}
            />

            <div className="absolute top-4 right-4">
              <button
                onClick={handleClearImage}
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90 px-4 py-2 rounded-lg font-semibold inline-flex items-center gap-1 transition-colors"
              >
                <X className="w-4 h-4" />
                Clear
              </button>
            </div>

            {isProcessing && (
              <div className="absolute inset-0 bg-background/80 flex items-center justify-center">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mb-2 mx-auto" />
                  <p className="text-foreground">Analyzing faces...</p>
                </div>
              </div>
            )}
          </div>
        )}

        <input ref={fileInputRef} type="file" accept="image/*" onChange={handleFileSelect} className="hidden" />
      </div>

      {/* Upload Button (when image is shown) */}
      {uploadedImage && (
        <div className="flex justify-center">
          <button
            onClick={handleUploadClick}
            className="border border-border text-foreground hover:bg-secondary px-6 py-3 rounded-lg font-semibold inline-flex items-center gap-2 transition-colors"
          >
            <Upload className="w-5 h-5" />
            Upload Different Image
          </button>
        </div>
      )}

      {/* Results */}
      {uploadedImage && !isProcessing && <FaceInfoPanel faces={faces} />}
    </div>
  )
}
