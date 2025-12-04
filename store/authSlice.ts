import { createAsyncThunk, createSlice, type PayloadAction } from "@reduxjs/toolkit"
import { apiFetch } from "@/lib/api"
import { mapUser } from "./mappers"
import type { AuthTokens, User } from "@/types"

const tokenStorageKey = "discuzz:auth"

const loadTokens = (): AuthTokens | undefined => {
  if (typeof window === "undefined") return undefined
  try {
    const raw = localStorage.getItem(tokenStorageKey)
    if (!raw) return undefined
    return JSON.parse(raw) as AuthTokens
  } catch (e) {
    console.warn("Failed to parse auth tokens", e)
    return undefined
  }
}

const persistTokens = (tokens?: AuthTokens) => {
  if (typeof window === "undefined") return
  if (!tokens) {
    localStorage.removeItem(tokenStorageKey)
    return
  }
  localStorage.setItem(tokenStorageKey, JSON.stringify(tokens))
}

interface AuthState {
  user?: User
  accessToken?: string
  refreshToken?: string
  loading: boolean
  error?: string
}

const initialState: AuthState = {
  user: undefined,
  accessToken: undefined,
  refreshToken: undefined,
  loading: false,
  error: undefined,
}

type RootState = { auth: AuthState }

export const login = createAsyncThunk(
  "auth/login",
  async (data: { email: string; password: string }, { rejectWithValue }) => {
    try {
      const tokenRes = await apiFetch<{
        access_token: string
        refresh_token: string
        expires_in?: number
      }>("/auth/login", {
        method: "POST",
        body: JSON.stringify(data),
      })

      const tokens: AuthTokens = {
        accessToken: tokenRes.access_token,
        refreshToken: tokenRes.refresh_token,
        expiresIn: tokenRes.expires_in,
      }

      const userRes = await apiFetch<any>("/auth/me", { token: tokens.accessToken })

      return { tokens, user: mapUser(userRes) }
    } catch (error: any) {
      return rejectWithValue(error?.message || "Unable to log in")
    }
  },
)

export const signup = createAsyncThunk(
  "auth/signup",
  async (data: { email: string; password: string }, { rejectWithValue }) => {
    try {
      const tokenRes = await apiFetch<{
        access_token: string
        refresh_token: string
        expires_in?: number
      }>("/auth/register", {
        method: "POST",
        body: JSON.stringify(data),
      })

      const tokens: AuthTokens = {
        accessToken: tokenRes.access_token,
        refreshToken: tokenRes.refresh_token,
        expiresIn: tokenRes.expires_in,
      }

      const userRes = await apiFetch<any>("/auth/me", { token: tokens.accessToken })

      return { tokens, user: mapUser(userRes) }
    } catch (error: any) {
      return rejectWithValue(error?.message || "Unable to sign up")
    }
  },
)

export const loginWithGoogle = createAsyncThunk(
  "auth/loginWithGoogle",
  async (data: { idToken: string }, { rejectWithValue }) => {
    try {
      const tokenRes = await apiFetch<{
        access_token: string
        refresh_token: string
        expires_in?: number
      }>("/auth/google", {
        method: "POST",
        body: JSON.stringify({ id_token: data.idToken }),
      })

      const tokens: AuthTokens = {
        accessToken: tokenRes.access_token,
        refreshToken: tokenRes.refresh_token,
        expiresIn: tokenRes.expires_in,
      }

      const userRes = await apiFetch<any>("/auth/me", { token: tokens.accessToken })

      return { tokens, user: mapUser(userRes) }
    } catch (error: any) {
      return rejectWithValue(error?.message || "Unable to log in with Google")
    }
  },
)

export const fetchCurrentUser = createAsyncThunk(
  "auth/fetchCurrentUser",
  async (_, { getState, rejectWithValue }) => {
    const state = getState() as RootState
    const token = state.auth.accessToken
    if (!token) return rejectWithValue("No access token")

    try {
      const userRes = await apiFetch<any>("/auth/me", { token })
      return mapUser(userRes)
    } catch (error: any) {
      return rejectWithValue(error?.message || "Unable to load profile")
    }
  },
)

export const refreshSession = createAsyncThunk(
  "auth/refresh",
  async (_, { getState, rejectWithValue }) => {
    const state = getState() as RootState
    const refreshToken = state.auth.refreshToken
    if (!refreshToken) return rejectWithValue("No refresh token")

    try {
      const tokenRes = await apiFetch<{
        access_token: string
        refresh_token: string
        expires_in?: number
      }>("/auth/refresh", {
        method: "POST",
        body: JSON.stringify({ refresh_token: refreshToken }),
      })

      const tokens: AuthTokens = {
        accessToken: tokenRes.access_token,
        refreshToken: tokenRes.refresh_token,
        expiresIn: tokenRes.expires_in,
      }

      const userRes = await apiFetch<any>("/auth/me", { token: tokens.accessToken })
      return { tokens, user: mapUser(userRes) }
    } catch (error: any) {
      return rejectWithValue(error?.message || "Unable to refresh session")
    }
  },
)

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    logout(state) {
      state.user = undefined
      state.accessToken = undefined
      state.refreshToken = undefined
      state.error = undefined
      persistTokens(undefined)
    },
    setUser(state, action: PayloadAction<User | undefined>) {
      state.user = action.payload
    },
    setTokens(state, action: PayloadAction<AuthTokens | undefined>) {
      state.accessToken = action.payload?.accessToken
      state.refreshToken = action.payload?.refreshToken
      if (!action.payload) {
        state.user = undefined
      }
      persistTokens(action.payload)
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(login.pending, (state) => {
        state.loading = true
        state.error = undefined
      })
      .addCase(login.fulfilled, (state, action) => {
        state.loading = false
        state.user = action.payload.user
        state.accessToken = action.payload.tokens.accessToken
        state.refreshToken = action.payload.tokens.refreshToken
        persistTokens(action.payload.tokens)
      })
      .addCase(login.rejected, (state, action) => {
        state.loading = false
        state.error = (action.payload as string) || action.error.message
      })
      .addCase(loginWithGoogle.pending, (state) => {
        state.loading = true
        state.error = undefined
      })
      .addCase(loginWithGoogle.fulfilled, (state, action) => {
        state.loading = false
        state.user = action.payload.user
        state.accessToken = action.payload.tokens.accessToken
        state.refreshToken = action.payload.tokens.refreshToken
        persistTokens(action.payload.tokens)
      })
      .addCase(loginWithGoogle.rejected, (state, action) => {
        state.loading = false
        state.error = (action.payload as string) || action.error.message
      })
      .addCase(signup.pending, (state) => {
        state.loading = true
        state.error = undefined
      })
      .addCase(signup.fulfilled, (state, action) => {
        state.loading = false
        state.user = action.payload.user
        state.accessToken = action.payload.tokens.accessToken
        state.refreshToken = action.payload.tokens.refreshToken
        persistTokens(action.payload.tokens)
      })
      .addCase(signup.rejected, (state, action) => {
        state.loading = false
        state.error = (action.payload as string) || action.error.message
      })
      .addCase(fetchCurrentUser.pending, (state) => {
        state.loading = true
        state.error = undefined
      })
      .addCase(fetchCurrentUser.fulfilled, (state, action) => {
        state.loading = false
        state.user = action.payload
      })
      .addCase(fetchCurrentUser.rejected, (state, action) => {
        state.loading = false
        state.error = (action.payload as string) || action.error.message
      })
      .addCase(refreshSession.fulfilled, (state, action) => {
        state.user = action.payload.user
        state.accessToken = action.payload.tokens.accessToken
        state.refreshToken = action.payload.tokens.refreshToken
        persistTokens(action.payload.tokens)
      })
      .addCase(refreshSession.rejected, (state, action) => {
        state.error = (action.payload as string) || action.error.message
      })
  },
})

export const { logout, setUser, setTokens } = authSlice.actions
export const loadStoredTokens = loadTokens
export default authSlice.reducer
