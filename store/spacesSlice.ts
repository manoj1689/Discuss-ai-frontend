import { createAsyncThunk, createSlice } from "@reduxjs/toolkit"
import { apiFetch } from "@/lib/api"
import { mapSpace, mapSpaceMessage, mapSpaceParticipant } from "./mappers"
import type { Space, SpaceMessage } from "@/types"
import { logout as logoutAction } from "./authSlice"

interface SpacesState {
  activeSpaces: Space[]
  currentSpace?: Space | null
  messagesBySpaceId: Record<string, SpaceMessage[]>
  loading: boolean
  error?: string
}

type RootState = { auth: { accessToken?: string } }

const initialState: SpacesState = {
  activeSpaces: [],
  currentSpace: null,
  messagesBySpaceId: {},
  loading: false,
}

export const fetchSpaces = createAsyncThunk("spaces/fetchActive", async (_, { rejectWithValue }) => {
  try {
    const res = await apiFetch<any[]>(`/spaces`)
    return res.map(mapSpace)
  } catch (error: any) {
    return rejectWithValue(error?.message || "Unable to load spaces")
  }
})

export const createSpace = createAsyncThunk(
  "spaces/create",
  async (payload: { title: string; description?: string; tags: string[] }, { getState, rejectWithValue }) => {
    const state = getState() as RootState
    const token = state.auth.accessToken
    if (!token) return rejectWithValue("Login required")

    try {
      const res = await apiFetch<any>("/spaces", {
        method: "POST",
        token,
        body: JSON.stringify(payload),
      })
      return mapSpace(res)
    } catch (error: any) {
      return rejectWithValue(error?.message || "Unable to create space")
    }
  },
)

export const joinSpace = createAsyncThunk(
  "spaces/join",
  async (spaceId: string, { getState, rejectWithValue }) => {
    const state = getState() as RootState
    const token = state.auth.accessToken
    if (!token) return rejectWithValue("Login required")

    try {
      const res = await apiFetch<any>(`/spaces/${spaceId}/join`, {
        method: "POST",
        token,
      })
      return { spaceId, participant: mapSpaceParticipant(res) }
    } catch (error: any) {
      return rejectWithValue(error?.message || "Unable to join space")
    }
  },
)

export const leaveSpace = createAsyncThunk(
  "spaces/leave",
  async (spaceId: string, { getState, rejectWithValue }) => {
    const state = getState() as RootState
    const token = state.auth.accessToken
    if (!token) return rejectWithValue("Login required")

    try {
      await apiFetch(`/spaces/${spaceId}/leave`, {
        method: "POST",
        token,
      })
      return spaceId
    } catch (error: any) {
      return rejectWithValue(error?.message || "Unable to leave space")
    }
  },
)

export const endSpace = createAsyncThunk(
  "spaces/end",
  async (spaceId: string, { getState, rejectWithValue }) => {
    const state = getState() as RootState
    const token = state.auth.accessToken
    if (!token) return rejectWithValue("Login required")

    try {
      await apiFetch(`/spaces/${spaceId}/end`, { method: "POST", token })
      return spaceId
    } catch (error: any) {
      return rejectWithValue(error?.message || "Unable to end space")
    }
  },
)

export const fetchSpaceMessages = createAsyncThunk(
  "spaces/fetchMessages",
  async (spaceId: string, { rejectWithValue }) => {
    try {
      const res = await apiFetch<any[]>(`/spaces/${spaceId}/messages`)
      return { spaceId, messages: res.map(mapSpaceMessage) }
    } catch (error: any) {
      return rejectWithValue(error?.message || "Unable to load messages")
    }
  },
)

export const sendSpaceMessage = createAsyncThunk(
  "spaces/sendMessage",
  async (payload: { spaceId: string; content: string }, { getState, rejectWithValue }) => {
    const state = getState() as RootState
    const token = state.auth.accessToken
    if (!token) return rejectWithValue("Login required")

    try {
      const res = await apiFetch<any>(`/spaces/${payload.spaceId}/messages`, {
        method: "POST",
        token,
        body: JSON.stringify({ content: payload.content }),
      })
      return { spaceId: payload.spaceId, message: mapSpaceMessage(res) }
    } catch (error: any) {
      return rejectWithValue(error?.message || "Unable to send message")
    }
  },
)

export const toggleHandRaise = createAsyncThunk(
  "spaces/handRaise",
  async (spaceId: string, { getState, rejectWithValue }) => {
    const state = getState() as RootState
    const token = state.auth.accessToken
    if (!token) return rejectWithValue("Login required")

    try {
      const res = await apiFetch<{ hand_raised: boolean }>(`/spaces/${spaceId}/raise-hand`, {
        method: "POST",
        token,
      })
      return { spaceId, handRaised: res.hand_raised }
    } catch (error: any) {
      return rejectWithValue(error?.message || "Unable to toggle hand")
    }
  },
)

const spacesSlice = createSlice({
  name: "spaces",
  initialState,
  reducers: {
    setCurrentSpace(state, action) {
      state.currentSpace = action.payload
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchSpaces.pending, (state) => {
        state.loading = true
        state.error = undefined
      })
      .addCase(fetchSpaces.fulfilled, (state, action) => {
        state.loading = false
        state.activeSpaces = action.payload
      })
      .addCase(fetchSpaces.rejected, (state, action) => {
        state.loading = false
        state.error = (action.payload as string) || action.error.message
      })
      .addCase(createSpace.fulfilled, (state, action) => {
        state.currentSpace = action.payload
        state.activeSpaces = [action.payload, ...state.activeSpaces]
      })
      .addCase(joinSpace.fulfilled, (state, action) => {
        const { spaceId } = action.payload
        if (state.currentSpace && state.currentSpace.id === spaceId) {
          state.currentSpace.participants = [...state.currentSpace.participants, action.payload.participant]
        }
      })
      .addCase(leaveSpace.fulfilled, (state, action) => {
        const spaceId = action.payload
        if (state.currentSpace?.id === spaceId) {
          state.currentSpace = null
        }
      })
      .addCase(endSpace.fulfilled, (state, action) => {
        const spaceId = action.payload
        state.activeSpaces = state.activeSpaces.filter((s) => s.id !== spaceId)
        if (state.currentSpace?.id === spaceId) {
          state.currentSpace = null
        }
      })
      .addCase(fetchSpaceMessages.fulfilled, (state, action) => {
        const { spaceId, messages } = action.payload
        state.messagesBySpaceId[spaceId] = messages
      })
      .addCase(sendSpaceMessage.fulfilled, (state, action) => {
        const { spaceId, message } = action.payload
        const existing = state.messagesBySpaceId[spaceId] || []
        state.messagesBySpaceId[spaceId] = [...existing, message]
      })
      .addCase(logoutAction, (state) => {
        state.activeSpaces = []
        state.currentSpace = null
        state.messagesBySpaceId = {}
      })
  },
})

export const { setCurrentSpace } = spacesSlice.actions
export default spacesSlice.reducer
