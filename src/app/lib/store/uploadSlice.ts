import { createSlice, type PayloadAction } from "@reduxjs/toolkit"
import type { UploadState } from "../types"

const initialState: UploadState = {
  uploadedImage: null,
  isProcessing: false,
}

const uploadSlice = createSlice({
  name: "upload",
  initialState,
  reducers: {
    setUploadedImage: (state, action: PayloadAction<string | null>) => {
      state.uploadedImage = action.payload
    },
    setUploadProcessing: (state, action: PayloadAction<boolean>) => {
      state.isProcessing = action.payload
    },
    clearUploadedImage: (state) => {
      state.uploadedImage = null
      state.isProcessing = false
    },
  },
})

export const { setUploadedImage, setUploadProcessing, clearUploadedImage } = uploadSlice.actions
export default uploadSlice.reducer
