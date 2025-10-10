import { createSlice, type PayloadAction } from "@reduxjs/toolkit"
import type { WebcamState } from "../types"

const initialState: WebcamState = {
  isActive: false,
  stream: null,
  error: null,
}

const webcamSlice = createSlice({
  name: "webcam",
  initialState,
  reducers: {
    startWebcam: (state, action: PayloadAction<MediaStream>) => {
      state.isActive = true
      state.stream = action.payload
      state.error = null
    },
    stopWebcam: (state) => {
      if (state.stream) {
        state.stream.getTracks().forEach((track) => track.stop())
      }
      state.isActive = false
      state.stream = null
      state.error = null
    },
    setWebcamError: (state, action: PayloadAction<string>) => {
      state.error = action.payload
      state.isActive = false
    },
  },
})

export const { startWebcam, stopWebcam, setWebcamError } = webcamSlice.actions
export default webcamSlice.reducer
