import { configureStore } from '@reduxjs/toolkit'
import sabqrReducer from '../slices/sabqr/sabqrSlice'

export const store = configureStore({
  reducer: {
    sabqr: sabqrReducer
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        // Ignore these action types
        ignoredActions: ['sabqr/addPaymentRealtime', 'sabqr/addTransaction'],
        // Ignore these paths in the state
        ignoredPaths: ['sabqr.filters.from_date', 'sabqr.filters.to_date']
      }
    }),
  devTools: process.env.NODE_ENV !== 'production'
})

export default store
