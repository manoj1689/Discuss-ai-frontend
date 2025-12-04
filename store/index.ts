import { configureStore } from "@reduxjs/toolkit"
import authReducer from "./authSlice"
import postsReducer from "./postsSlice"
import commentsReducer from "./commentsSlice"
import notificationsReducer from "./notificationsSlice"
import spacesReducer from "./spacesSlice"
import usersReducer from "./usersSlice"

export const store = configureStore({
  reducer: {
    auth: authReducer,
    posts: postsReducer,
    comments: commentsReducer,
    notifications: notificationsReducer,
    spaces: spacesReducer,
    users: usersReducer,
  },
})

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch
