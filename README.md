
💡💡💡💡💡💡💡💡
Web Dev Frontend
💡💡💡💡💡💡💡💡


⚙️ What It Does — Step by Step
1. Loads the AI Models
When the component starts, it loads the face detection models (like training the camera to recognize faces).


While loading, the screen says “Loading AI models…”.


Once models are ready, face detection can begin.


2. Starts and Stops the Webcam
When you click Start Webcam, it asks permission to use your device’s camera.


The video feed appears on the screen.


Clicking Stop Webcam turns it off and clears the stream.


3. Face Detection (Real-Time)
Once the webcam is active and models are loaded, it begins scanning the video feed every 100 milliseconds.


Each time it scans:


It sends the video frame to the face detection function (detectFaces()).


The AI looks for faces and returns data (like position, landmarks, and emotions).


That data is stored in the Redux store for display (setFaces()).


You’ll see boxes or overlays around detected faces drawn by the FaceOverlay component.


4. Capture Image
The Capture Image button takes a snapshot of the current video frame.


It saves it as an image (PNG format) and shows it on screen.


You can clear the captured image anytime.


5. Status Display
At the bottom, it shows live system info:
Webcam: On or Off


Faces Detected: How many faces are visible


Processing: Whether the AI is analyzing frames or ready


6. Charts and Face Info
On the right side, EmotionChart shows emotions or analysis results (like happy, sad, neutral, etc.).


Below everything, FaceInfoPanel displays detailed face data for each detected person (like emotion confidence, bounding box info, etc.).



🧩 Key Technical Parts (Simplified)
Feature
What It Does
Controlled By
Video Element
Shows the live webcam feed
videoRef
Canvas
Hidden tool used for capturing screenshots
canvasRef
AI Models
Detects faces in real time
loadModels() + detectFaces()
Redux Store
Keeps track of webcam state and faces
webcamSlice + detectionSlice
Face Overlay
Draws boxes around detected faces
FaceOverlay component
Emotion Chart
Visualizes detected emotions
EmotionChart component
Face Info Panel
Lists all faces with analysis
FaceInfoPanel component







This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
