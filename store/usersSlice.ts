import { createAsyncThunk, createSlice } from "@reduxjs/toolkit"
import { apiFetch } from "@/lib/api"
import { mapUser } from "./mappers"
import type { User } from "@/types"
import { logout as logoutAction } from "./authSlice"

interface UsersState {
  profiles: Record<string, User>
  searchResults: User[]
  followingHandles: string[]
  loading: boolean
  error?: string
}

type RootState = { auth: { accessToken?: string; user?: User } }

const initialState: UsersState = {
  profiles: {},
  searchResults: [],
  followingHandles: [],
  loading: false,
}

const normalizeHandle = (handle: string) => (handle.startsWith("@") ? handle.toLowerCase() : `@${handle.toLowerCase()}`)

export const searchUsers = createAsyncThunk(
  "users/search",
  async (query: string, { rejectWithValue }) => {
    try {
      const res = await apiFetch<any[]>(`/search/users`, { query: { q: query } })
      return res.map(mapUser)
    } catch (error: any) {
      return rejectWithValue(error?.message || "User search failed")
    }
  },
)

export const fetchUserProfile = createAsyncThunk(
  "users/profile",
  async (handle: string, { rejectWithValue }) => {
    const normalized = normalizeHandle(handle)
    try {
      const res = await apiFetch<any>(`/users/${normalized}`)
      return mapUser(res)
    } catch (error: any) {
      return rejectWithValue(error?.message || "Unable to load profile")
    }
  },
)

export const fetchFollowing = createAsyncThunk(
  "users/fetchFollowing",
  async (handle: string, { rejectWithValue }) => {
    const normalized = normalizeHandle(handle)
    try {
      const res = await apiFetch<any[]>(`/users/${normalized}/following`)
      return res.map(mapUser)
    } catch (error: any) {
      return rejectWithValue(error?.message || "Unable to load following list")
    }
  },
)

export const followUser = createAsyncThunk(
  "users/follow",
  async (handle: string, { getState, rejectWithValue }) => {
    const state = getState() as RootState
    const token = state.auth.accessToken
    if (!token) return rejectWithValue("Login required")
    const normalized = normalizeHandle(handle)
    try {
      await apiFetch(`/users/${normalized}/follow`, { method: "POST", token })
      return normalized
    } catch (error: any) {
      return rejectWithValue(error?.message || "Unable to follow user")
    }
  },
)

export const unfollowUser = createAsyncThunk(
  "users/unfollow",
  async (handle: string, { getState, rejectWithValue }) => {
    const state = getState() as RootState
    const token = state.auth.accessToken
    if (!token) return rejectWithValue("Login required")
    const normalized = normalizeHandle(handle)
    try {
      await apiFetch(`/users/${normalized}/follow`, { method: "DELETE", token })
      return normalized
    } catch (error: any) {
      return rejectWithValue(error?.message || "Unable to unfollow user")
    }
  },
)

const usersSlice = createSlice({
  name: "users",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(searchUsers.pending, (state) => {
        state.loading = true
        state.error = undefined
      })
      .addCase(searchUsers.fulfilled, (state, action) => {
        state.loading = false
        state.searchResults = action.payload
      })
      .addCase(searchUsers.rejected, (state, action) => {
        state.loading = false
        state.error = (action.payload as string) || action.error.message
      })
      .addCase(fetchUserProfile.fulfilled, (state, action) => {
        const profile = action.payload
        state.profiles[normalizeHandle(profile.handle)] = profile
      })
      .addCase(fetchUserProfile.rejected, (state, action) => {
        state.error = (action.payload as string) || action.error.message
      })
      .addCase(fetchFollowing.fulfilled, (state, action) => {
        state.followingHandles = action.payload.map((u) => normalizeHandle(u.handle))
        action.payload.forEach((u) => {
          state.profiles[normalizeHandle(u.handle)] = u
        })
      })
      .addCase(followUser.fulfilled, (state, action) => {
        if (!state.followingHandles.includes(action.payload)) {
          state.followingHandles.push(action.payload)
        }
      })
      .addCase(unfollowUser.fulfilled, (state, action) => {
        state.followingHandles = state.followingHandles.filter((h) => h !== action.payload)
      })
      .addCase(logoutAction, (state) => {
        state.followingHandles = []
        state.searchResults = []
        state.profiles = {}
      })
  },
})

export default usersSlice.reducer
