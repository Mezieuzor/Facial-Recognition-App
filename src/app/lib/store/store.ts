import { configureStore } from "@reduxjs/toolkit"
import webcamReducer from "./webcamSlice"
import detectionReducer from "./detectionSlice"
import uploadReducer from "./uploadSlice"

export const store = configureStore({
  reducer: {
    webcam: webcamReducer,
    detection: detectionReducer,
    upload: uploadReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        // Ignore MediaStream in actions
        ignoredActions: ["webcam/startWebcam"],
        ignoredPaths: ["webcam.stream"],
      },
    }),
})

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch
