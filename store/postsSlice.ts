import { createAsyncThunk, createSlice, type PayloadAction } from "@reduxjs/toolkit"
import { apiFetch } from "@/lib/api"
import { mapPost } from "./mappers"
import type { ContextProfile, Message, Post } from "@/types"
import { addComment } from "./commentsSlice"
import { logout as logoutAction } from "./authSlice"

type FeedType = "foryou" | "following"

interface FeedState {
  items: Post[]
  page: number
  perPage: number
  hasNext: boolean
  loading: boolean
}

interface PostsState {
  feeds: Record<FeedType, FeedState>
  userPosts: Record<string, Post[]>
  searchResults: Post[]
  creating: boolean
  error?: string
}

type RootState = {
  auth: { accessToken?: string }
  posts: PostsState
}

const makeInitialFeed = (): FeedState => ({
  items: [],
  page: 1,
  perPage: 20,
  hasNext: false,
  loading: false,
})

const initialState: PostsState = {
  feeds: {
    foryou: makeInitialFeed(),
    following: makeInitialFeed(),
  },
  userPosts: {},
  searchResults: [],
  creating: false,
  error: undefined,
}

export const fetchFeed = createAsyncThunk(
  "posts/fetchFeed",
  async (params: { feed: FeedType; page?: number; perPage?: number }, { getState, rejectWithValue }) => {
    const state = getState() as RootState
    const token = state.auth.accessToken
    const { feed, page = 1, perPage = 20 } = params

    try {
      const res = await apiFetch<{
        items: any[]
        total: number
        page: number
        per_page: number
        has_next: boolean
      }>("/posts", {
        token,
        query: { feed, page, per_page: perPage },
      })

      return {
        feed,
        page,
        perPage,
        hasNext: res.has_next,
        items: res.items.map(mapPost),
      }
    } catch (error: any) {
      return rejectWithValue(error?.message || "Unable to load feed")
    }
  },
)

export const createPost = createAsyncThunk(
  "posts/create",
  async (
    payload: {
      content: string
      imageUrl?: string | null
      interviewHistory: Message[]
      contextProfile: ContextProfile
    },
    { getState, rejectWithValue },
  ) => {
    const state = getState() as RootState
    const token = state.auth.accessToken
    if (!token) return rejectWithValue("You must be logged in to post")

    const { content, imageUrl, interviewHistory, contextProfile } = payload

    try {
      const res = await apiFetch<any>("/posts", {
        method: "POST",
        token,
        body: JSON.stringify({
          content,
          image_url: imageUrl,
          interview_history: interviewHistory.map((m) => ({
            id: m.id,
            role: m.role,
            content: m.content,
            timestamp: m.timestamp,
          })),
          context_profile: {
            intent: contextProfile.intent,
            tone: contextProfile.tone,
            assumptions: contextProfile.assumptions,
            audience: contextProfile.audience,
            coreArgument: contextProfile.coreArgument,
          },
        }),
      })

      return mapPost(res)
    } catch (error: any) {
      return rejectWithValue(error?.message || "Unable to publish post")
    }
  },
)

export const toggleLike = createAsyncThunk(
  "posts/toggleLike",
  async (payload: { postId: string; isLiked: boolean }, { getState, rejectWithValue }) => {
    const state = getState() as RootState
    const token = state.auth.accessToken
    if (!token) return rejectWithValue("Login required")

    try {
      const { postId, isLiked } = payload
      const method = isLiked ? "DELETE" : "POST"
      const res = await apiFetch<{ likes: number }>(`/posts/${postId}/like`, {
        method,
        token,
      })

      return { postId, isLiked: !isLiked, likes: res.likes }
    } catch (error: any) {
      return rejectWithValue(error?.message || "Unable to toggle like")
    }
  },
)

export const fetchUserPosts = createAsyncThunk(
  "posts/fetchUserPosts",
  async (handle: string, { getState, rejectWithValue }) => {
    const state = getState() as RootState
    const token = state.auth.accessToken
    const normalizedHandle = handle.startsWith("@") ? handle.slice(1) : handle

    try {
      const res = await apiFetch<{
        items: any[]
      }>(`/posts/user/${normalizedHandle}`, {
        token,
      })

      return { handle: `@${normalizedHandle}`, items: res.items.map(mapPost) }
    } catch (error: any) {
      return rejectWithValue(error?.message || "Unable to load user posts")
    }
  },
)

export const searchPosts = createAsyncThunk(
  "posts/search",
  async (query: string, { getState, rejectWithValue }) => {
    const state = getState() as RootState
    const token = state.auth.accessToken
    try {
      const res = await apiFetch<any[]>(`/search/posts`, {
        token,
        query: { q: query },
      })
      return res.map(mapPost)
    } catch (error: any) {
      return rejectWithValue(error?.message || "Search failed")
    }
  },
)

const updatePostCollection = (posts: Post[], postId: string, updater: (post: Post) => Post) =>
  posts.map((p) => (p.id === postId ? updater(p) : p))

const postsSlice = createSlice({
  name: "posts",
  initialState,
  reducers: {
    clearSearch(state) {
      state.searchResults = []
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchFeed.pending, (state, action) => {
        const feed = action.meta.arg.feed
        state.feeds[feed].loading = true
      })
      .addCase(fetchFeed.fulfilled, (state, action) => {
        const { feed, items, page, hasNext, perPage } = action.payload
        state.feeds[feed].loading = false
        state.feeds[feed].page = page
        state.feeds[feed].perPage = perPage
        state.feeds[feed].hasNext = hasNext
        state.feeds[feed].items = page > 1 ? [...state.feeds[feed].items, ...items] : items
      })
      .addCase(fetchFeed.rejected, (state, action) => {
        const feed = (action.meta.arg as any).feed as FeedType
        state.feeds[feed].loading = false
        state.error = (action.payload as string) || action.error.message
      })
      .addCase(createPost.pending, (state) => {
        state.creating = true
        state.error = undefined
      })
      .addCase(createPost.fulfilled, (state, action) => {
        state.creating = false
        const post = action.payload
        state.feeds.foryou.items = [post, ...state.feeds.foryou.items]
        state.userPosts[post.authorHandle] = [post, ...(state.userPosts[post.authorHandle] || [])]
      })
      .addCase(createPost.rejected, (state, action) => {
        state.creating = false
        state.error = (action.payload as string) || action.error.message
      })
      .addCase(toggleLike.fulfilled, (state, action) => {
        const { postId, isLiked, likes } = action.payload
        ;(["foryou", "following"] as FeedType[]).forEach((feed) => {
          state.feeds[feed].items = updatePostCollection(state.feeds[feed].items, postId, (post) => ({
            ...post,
            isLiked,
            likes,
          }))
        })

        Object.keys(state.userPosts).forEach((handle) => {
          state.userPosts[handle] = updatePostCollection(state.userPosts[handle], postId, (post) => ({
            ...post,
            isLiked,
            likes,
          }))
        })
      })
      .addCase(toggleLike.rejected, (state, action) => {
        state.error = (action.payload as string) || action.error.message
      })
      .addCase(addComment.fulfilled, (state, action) => {
        const postId = action.payload.postId
        ;(["foryou", "following"] as FeedType[]).forEach((feed) => {
          state.feeds[feed].items = updatePostCollection(state.feeds[feed].items, postId, (post) => ({
            ...post,
            replyCount: post.replyCount + 1,
          }))
        })
        Object.keys(state.userPosts).forEach((handle) => {
          state.userPosts[handle] = updatePostCollection(state.userPosts[handle], postId, (post) => ({
            ...post,
            replyCount: post.replyCount + 1,
          }))
        })
      })
      .addCase(fetchUserPosts.fulfilled, (state, action) => {
        const { handle, items } = action.payload
        state.userPosts[handle] = items
      })
      .addCase(fetchUserPosts.rejected, (state, action) => {
        state.error = (action.payload as string) || action.error.message
      })
      .addCase(searchPosts.fulfilled, (state, action: PayloadAction<Post[]>) => {
        state.searchResults = action.payload
      })
      .addCase(searchPosts.rejected, (state, action) => {
        state.error = (action.payload as string) || action.error.message
      })
      .addCase(logoutAction, (state) => {
        state.feeds = {
          foryou: makeInitialFeed(),
          following: makeInitialFeed(),
        }
        state.userPosts = {}
        state.searchResults = []
        state.creating = false
      })
  },
})

export const { clearSearch } = postsSlice.actions
export default postsSlice.reducer
