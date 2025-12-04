import { createAsyncThunk, createSlice } from "@reduxjs/toolkit"
import { apiFetch } from "@/lib/api"
import { mapComment } from "./mappers"
import type { Comment } from "@/types"
import { logout as logoutAction } from "./authSlice"

interface CommentsState {
  byPostId: Record<
    string,
    {
      items: Comment[]
      loading: boolean
      error?: string
    }
  >
}

type RootState = {
  auth: { accessToken?: string }
  comments: CommentsState
}

const initialState: CommentsState = {
  byPostId: {},
}

export const fetchComments = createAsyncThunk(
  "comments/fetch",
  async (postId: string, { rejectWithValue }) => {
    try {
      const res = await apiFetch<{ items: any[] }>(`/posts/${postId}/comments`)
      return { postId, comments: res.items.map(mapComment) }
    } catch (error: any) {
      return rejectWithValue(error?.message || "Unable to load comments")
    }
  },
)

export const addComment = createAsyncThunk(
  "comments/add",
  async (
    payload: { postId: string; content: string; replyToId?: string | number },
    { getState, rejectWithValue },
  ) => {
    const state = getState() as RootState
    const token = state.auth.accessToken
    if (!token) return rejectWithValue("Login required")

    try {
      const { postId, content, replyToId } = payload
      const res = await apiFetch<any>(`/posts/${postId}/comments`, {
        method: "POST",
        token,
        body: JSON.stringify({
          content,
          reply_to_id: replyToId,
        }),
      })

      return { postId, comment: mapComment(res) }
    } catch (error: any) {
      return rejectWithValue(error?.message || "Unable to add comment")
    }
  },
)

const ensureState = (state: CommentsState, postId: string) => {
  if (!state.byPostId[postId]) {
    state.byPostId[postId] = { items: [], loading: false }
  }
  return state.byPostId[postId]
}

const commentsSlice = createSlice({
  name: "comments",
  initialState,
  reducers: {
    clearComments(state, action) {
      delete state.byPostId[action.payload]
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchComments.pending, (state, action) => {
        const postState = ensureState(state, action.meta.arg)
        postState.loading = true
        postState.error = undefined
      })
      .addCase(fetchComments.fulfilled, (state, action) => {
        const { postId, comments } = action.payload
        const postState = ensureState(state, postId)
        postState.loading = false
        postState.items = comments
      })
      .addCase(fetchComments.rejected, (state, action) => {
        const postState = ensureState(state, action.meta.arg as string)
        postState.loading = false
        postState.error = (action.payload as string) || action.error.message
      })
      .addCase(addComment.fulfilled, (state, action) => {
        const { postId, comment } = action.payload
        const postState = ensureState(state, postId)
        postState.items = [...postState.items, comment]
      })
      .addCase(addComment.rejected, (state, action) => {
        const postState = ensureState(state, (action.meta.arg as any).postId)
        postState.error = (action.payload as string) || action.error.message
      })
      .addCase(logoutAction, (state) => {
        state.byPostId = {}
      })
  },
})

export const { clearComments } = commentsSlice.actions
export default commentsSlice.reducer
