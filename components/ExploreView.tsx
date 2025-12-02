"use client"

import type React from "react"
import type { Post } from "@/types"
import { PostCard } from "./PostCard"
import { Search, TrendingUp } from "lucide-react"

interface ExploreViewProps {
  posts: Post[]
  onInteract: (post: Post) => void
  onLike: (postId: string) => void
  searchQuery: string
  onSearchChange: (query: string) => void
}

export const ExploreView: React.FC<ExploreViewProps> = ({ posts, onInteract, onLike, searchQuery, onSearchChange }) => {
  const filteredPosts = posts.filter(
    (post) =>
      post.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
      post.authorName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      post.authorHandle.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  const tags = ["Technology", "AI Safety", "Remote Work", "Philosophy", "Design", "Politics"]

  return (
    <div className="min-h-screen">
      {/* Search Header */}
      <div className="sticky top-0 z-10 bg-white/80 dark:bg-slate-950/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 p-4 transition-colors">
        <div className="bg-slate-100 dark:bg-slate-900 rounded-full p-3 flex items-center gap-3 focus-within:ring-2 ring-indigo-500 transition-all border border-slate-200 dark:border-slate-800/50">
          <Search className="text-slate-500" size={20} />
          <input
            type="text"
            placeholder="Search people, topics, or context..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="bg-transparent border-none focus:outline-none text-slate-900 dark:text-slate-200 w-full placeholder-slate-500"
            autoFocus
          />
        </div>
      </div>

      {/* Content */}
      {!searchQuery && (
        <div className="p-4 border-b border-slate-200 dark:border-slate-800">
          <h2 className="font-bold text-lg text-slate-900 dark:text-slate-100 mb-4 flex items-center gap-2">
            <TrendingUp size={20} className="text-indigo-500 dark:text-indigo-400" />
            Trends for you
          </h2>
          <div className="flex flex-wrap gap-2">
            {tags.map((tag) => (
              <span
                key={tag}
                onClick={() => onSearchChange(tag)}
                className="px-4 py-2 bg-slate-100 dark:bg-slate-900 hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-full text-sm font-medium cursor-pointer transition-colors border border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700"
              >
                #{tag}
              </span>
            ))}
          </div>
        </div>
      )}

      <div className="pb-20">
        {filteredPosts.length > 0 ? (
          filteredPosts.map((post) => <PostCard key={post.id} post={post} onInteract={onInteract} onLike={onLike} />)
        ) : (
          <div className="p-8 text-center text-slate-500">
            <Search className="mx-auto mb-4 opacity-20" size={48} />
            <p>No results found for "{searchQuery}".</p>
            <p className="text-sm mt-2">Try searching for keywords or author names.</p>
          </div>
        )}
      </div>
    </div>
  )
}
