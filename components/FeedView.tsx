"use client"

import { useMemo } from "react"
import type React from "react"
import { Button } from "./Button"
import { PostCard } from "./PostCard"
import type { Post, User } from "@/types"

interface FeedViewProps {
  currentUser: User
  feedTab: "foryou" | "following"
  posts: Post[]
  followingSet: Set<string>
  onTabChange: (tab: "foryou" | "following") => void
  onInteract: (post: Post) => void
  onComment: (post: Post) => void
  onAskAi: (post: Post) => void
  onViewContext: (post: Post) => void
  onLike: (postId: string) => void
  onCompose: () => void
  onExplore: () => void
  onOpenProfile: () => void
}

const normalizeHandle = (handle: string) => handle.replace(/^@/, "").toLowerCase()

export const FeedView: React.FC<FeedViewProps> = ({
  currentUser,
  feedTab,
  posts,
  followingSet,
  onTabChange,
  onInteract,
  onComment,
  onAskAi,
  onViewContext,
  onLike,
  onCompose,
  onExplore,
  onOpenProfile,
}) => {
  const scrollToTop = () => typeof window !== "undefined" && window.scrollTo({ top: 0, behavior: "smooth" })

  const handleTabChange = (tab: "foryou" | "following") => {
    onTabChange(tab)
    scrollToTop()
  }

  const normalizedFollowingHandles = useMemo(() => {
    const handles = new Set<string>()
    followingSet.forEach((handle) => handles.add(normalizeHandle(handle)))
    handles.add(normalizeHandle(currentUser.handle))
    return handles
  }, [followingSet, currentUser.handle])

  const displayPosts = useMemo(() => {
    if (feedTab === "foryou") {
      return posts.filter((post) => !normalizedFollowingHandles.has(normalizeHandle(post.authorHandle)))
    }
    return posts.filter((post) => normalizedFollowingHandles.has(normalizeHandle(post.authorHandle)))
  }, [feedTab, posts, normalizedFollowingHandles])

  return (
    <div>
      {/* Desktop Header */}
      <div className="sticky top-0 z-10 bg-white/80 dark:bg-slate-950/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 p-0 hidden md:block transition-colors">
        <div className="font-bold text-xl cursor-pointer p-4 pb-2 text-slate-900 dark:text-slate-100" onClick={scrollToTop}>
          Home
        </div>
        <div className="flex border-b border-slate-200 dark:border-slate-800">
          <button
            type="button"
            className={`flex-1 text-center py-3 font-bold cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-900/50 transition-colors relative ${feedTab === "foryou" ? "text-slate-900 dark:text-white" : "text-slate-500"}`}
            onClick={() => handleTabChange("foryou")}
          >
            For You
            {feedTab === "foryou" && (
              <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-16 h-1 bg-indigo-500 rounded-full"></div>
            )}
          </button>
          <button
            type="button"
            className={`flex-1 text-center py-3 font-bold cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-900/50 transition-colors relative ${feedTab === "following" ? "text-slate-900 dark:text-white" : "text-slate-500"}`}
            onClick={() => handleTabChange("following")}
          >
            Following
            {feedTab === "following" && (
              <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-16 h-1 bg-indigo-500 rounded-full"></div>
            )}
          </button>
        </div>
      </div>

      {/* Mobile Tabs (Sticky below the main mobile header) */}
      <div className="md:hidden sticky top-[64px] z-10 bg-white/95 dark:bg-slate-950/95 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 flex transition-colors">
        <button
          type="button"
          className={`flex-1 text-center py-3 font-bold cursor-pointer relative ${feedTab === "foryou" ? "text-slate-900 dark:text-white" : "text-slate-500"}`}
          onClick={() => handleTabChange("foryou")}
        >
          For You
          {feedTab === "foryou" && (
            <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-16 h-1 bg-indigo-500 rounded-full"></div>
          )}
        </button>
        <button
          type="button"
          className={`flex-1 text-center py-3 font-bold cursor-pointer relative ${feedTab === "following" ? "text-slate-900 dark:text-white" : "text-slate-500"}`}
          onClick={() => handleTabChange("following")}
        >
          Following
          {feedTab === "following" && (
            <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-16 h-1 bg-indigo-500 rounded-full"></div>
          )}
        </button>
      </div>

      {/* Compose Trigger (Desktop) */}
      <div className="p-4 border-b border-slate-200 dark:border-slate-800 hidden md:flex gap-4">
        <img
          src={currentUser.avatarUrl || "/placeholder.svg"}
          alt="Me"
          className="w-10 h-10 rounded-full cursor-pointer hover:opacity-80"
          onClick={onOpenProfile}
        />
        <div
          className="flex-1 bg-slate-100 dark:bg-slate-900 rounded-full p-3 px-4 text-slate-500 cursor-text hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors"
          onClick={onCompose}
        >
          What needs deeper context?
        </div>
      </div>

      {/* Posts */}
      <div>
        {displayPosts.length > 0 ? (
          displayPosts.map((post) => (
            <PostCard
              key={post.id}
              post={post}
              onInteract={onInteract}
              onComment={onComment}
              onAskAi={onAskAi}
              onViewContext={onViewContext}
              onLike={onLike}
            />
          ))
        ) : (
          <div className="p-12 text-center text-slate-500">
            <p className="text-lg font-bold mb-2">No posts yet.</p>
            <p className="text-sm mb-4">
              {feedTab === "following"
                ? "You aren't following anyone who has posted recently."
                : "Check back later for more updates."}
            </p>
            {feedTab === "following" && (
              <Button variant="secondary" onClick={onExplore}>
                Find people to follow
              </Button>
            )}
          </div>
        )}

        {displayPosts.length > 0 && (
          <div className="p-8 text-center text-slate-500">
            <p>End of feed.</p>
          </div>
        )}
      </div>
    </div>
  )
}
