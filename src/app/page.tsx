"use client"

import { useState } from "react"
import { WebcamCapture } from "@/app/components/webcam-capture"
import { ImageUpload } from "@/app/components/image-upload"

export default function Home() {
  const [activeTab, setActiveTab] = useState<"webcam" | "upload">("webcam")

  return (
    <div className="min-h-screen bg-background text-foreground">
      <nav className="border-b border-border py-4">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold">
              <span className="text-primary">Face</span>Recognition
            </h1>
            <div className="flex gap-4">
              <a href="#" className="text-muted-foreground hover:text-foreground">
                About
              </a>
              <a href="#" className="text-muted-foreground hover:text-foreground">
                Docs
              </a>
            </div>
          </div>
        </div>
      </nav>

      <main className="py-12">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-12">
            <p className="text-primary text-sm font-semibold mb-4">AI-Powered Recognition</p>
            <h2 className="text-5xl font-bold mb-6 text-balance">Real-time Facial Recognition</h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto text-balance">
              Advanced facial detection with emotion recognition, age estimation, and gender classification powered by
              TensorFlow.js
            </p>
          </div>

          <div className="mb-8">
            <div className="flex justify-center border-b border-border">
              <button
                onClick={() => setActiveTab("webcam")}
                className={`px-6 py-3 font-medium transition-colors ${
                  activeTab === "webcam"
                    ? "border-b-2 border-primary text-foreground"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                Webcam Feed
              </button>
              <button
                onClick={() => setActiveTab("upload")}
                className={`px-6 py-3 font-medium transition-colors ${
                  activeTab === "upload"
                    ? "border-b-2 border-primary text-foreground"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                Upload Image
              </button>
            </div>
          </div>

          <div>{activeTab === "webcam" ? <WebcamCapture /> : <ImageUpload />}</div>
        </div>
      </main>

      <footer className="border-t border-border py-8 mt-12">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center text-muted-foreground">
            <p>Developed by Mezieuzor Amadike</p>
            <p className="text-sm mt-2">Real-time facial recognition with emotion detection</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
