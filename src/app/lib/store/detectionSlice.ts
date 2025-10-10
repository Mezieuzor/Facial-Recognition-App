import { createSlice, type PayloadAction } from "@reduxjs/toolkit"
import type { DetectionState, FaceDetection } from "../types"

const initialState: DetectionState = {
  faces: [],
  isProcessing: false,
  lastDetectionTime: null,
}

const detectionSlice = createSlice({
  name: "detection",
  initialState,
  reducers: {
    setFaces: (state, action: PayloadAction<FaceDetection[]>) => {
      state.faces = action.payload
      state.lastDetectionTime = Date.now()
    },
    setProcessing: (state, action: PayloadAction<boolean>) => {
      state.isProcessing = action.payload
    },
    clearFaces: (state) => {
      state.faces = []
    },
  },
})

export const { setFaces, setProcessing, clearFaces } = detectionSlice.actions
export default detectionSlice.reducer
