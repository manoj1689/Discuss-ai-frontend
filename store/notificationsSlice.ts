import { createAsyncThunk, createSlice } from "@reduxjs/toolkit"
import { apiFetch } from "@/lib/api"
import { mapNotification } from "./mappers"
import type { Notification } from "@/types"
import { logout as logoutAction } from "./authSlice"

interface NotificationsState {
  items: Notification[]
  loading: boolean
  error?: string
  unreadCount: number
}

type RootState = { auth: { accessToken?: string } }

const initialState: NotificationsState = {
  items: [],
  loading: false,
  unreadCount: 0,
}

export const fetchNotifications = createAsyncThunk(
  "notifications/fetch",
  async (params: { unreadOnly?: boolean } | undefined, { getState, rejectWithValue }) => {
    const state = getState() as RootState
    const token = state.auth.accessToken
    if (!token) return rejectWithValue("Login required")

    try {
      const res = await apiFetch<{ items: any[]; unread_count: number }>(`/notifications`, {
        token,
        query: { unread_only: params?.unreadOnly || false },
      })
      return { items: res.items.map(mapNotification), unreadCount: res.unread_count ?? 0 }
    } catch (error: any) {
      return rejectWithValue(error?.message || "Unable to load notifications")
    }
  },
)

export const markAllRead = createAsyncThunk("notifications/markAllRead", async (_, { getState, rejectWithValue }) => {
  const state = getState() as RootState
  const token = state.auth.accessToken
  if (!token) return rejectWithValue("Login required")

  try {
    await apiFetch(`/notifications/read-all`, { method: "POST", token })
    return true
  } catch (error: any) {
    return rejectWithValue(error?.message || "Unable to mark as read")
  }
})

export const markNotificationRead = createAsyncThunk(
  "notifications/markRead",
  async (notificationId: string, { getState, rejectWithValue }) => {
    const state = getState() as RootState
    const token = state.auth.accessToken
    if (!token) return rejectWithValue("Login required")

    try {
      await apiFetch(`/notifications/${notificationId}/read`, { method: "POST", token })
      return notificationId
    } catch (error: any) {
      return rejectWithValue(error?.message || "Unable to mark as read")
    }
  },
)

const notificationsSlice = createSlice({
  name: "notifications",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchNotifications.pending, (state) => {
        state.loading = true
        state.error = undefined
      })
      .addCase(fetchNotifications.fulfilled, (state, action) => {
        state.loading = false
        state.items = action.payload.items
        state.unreadCount = action.payload.unreadCount
      })
      .addCase(fetchNotifications.rejected, (state, action) => {
        state.loading = false
        state.error = (action.payload as string) || action.error.message
      })
      .addCase(markAllRead.fulfilled, (state) => {
        state.items = state.items.map((n) => ({ ...n, read: true }))
        state.unreadCount = 0
      })
      .addCase(markNotificationRead.fulfilled, (state, action) => {
        state.items = state.items.map((n) => (n.id === action.payload ? { ...n, read: true } : n))
        state.unreadCount = Math.max(0, state.unreadCount - 1)
      })
      .addCase(logoutAction, (state) => {
        state.items = []
        state.unreadCount = 0
        state.loading = false
        state.error = undefined
      })
  },
})

export default notificationsSlice.reducer
