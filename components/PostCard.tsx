"use client"

import type React from "react"
import { useState, useRef, useEffect } from "react"
import type { Post } from "@/types"
import { MessageCircle, Heart, Share, Bot, LinkIcon, Sparkles, Send } from "lucide-react"

interface PostCardProps {
  post: Post
  onInteract: (post: Post) => void
  onLike?: (postId: string) => void
  onReply?: (post: Post) => void
}

export const PostCard: React.FC<PostCardProps> = ({ post, onInteract, onLike, onReply }) => {
  const [showShareMenu, setShowShareMenu] = useState(false)
  const [feedback, setFeedback] = useState<string | null>(null)
  const menuRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setShowShareMenu(false)
      }
    }

    if (showShareMenu) {
      document.addEventListener("mousedown", handleClickOutside)
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [showShareMenu])

  const handleLike = (e: React.MouseEvent) => {
    e.stopPropagation()
    if (onLike) onLike(post.id)
  }

  const handleReply = (e: React.MouseEvent) => {
    e.stopPropagation()
    if (onReply) {
      onReply(post)
    } else {
      onInteract(post)
    }
  }

  const handleCopyLink = async (e: React.MouseEvent) => {
    e.stopPropagation()
    try {
      if (typeof navigator !== "undefined" && navigator.clipboard) {
        await navigator.clipboard.writeText(`${post.authorName} on Discuzz.ai: "${post.content}"`)
        setFeedback("Copied to clipboard")
        setTimeout(() => setFeedback(null), 2000)
      }
    } catch (err) {
      console.error("Failed to copy", err)
    }
    setShowShareMenu(false)
  }

  const handleShareContext = async (e: React.MouseEvent) => {
    e.stopPropagation()

    const textToShare = `
Discussion by ${post.authorName}

"${post.content}"

🧠 AI Context Profile:
• Intent: ${post.contextProfile.intent}
• Core Argument: ${post.contextProfile.coreArgument}

Join the discuzzion at Discuzz.ai
`.trim()

    const shareData = {
      title: `Context Profile: ${post.authorName}`,
      text: textToShare,
      url: typeof window !== "undefined" ? window.location.href : "",
    }

    try {
      if (typeof navigator !== "undefined" && navigator.share && navigator.canShare && navigator.canShare(shareData)) {
        await navigator.share(shareData)
      } else if (typeof navigator !== "undefined" && navigator.clipboard) {
        await navigator.clipboard.writeText(textToShare)
        setFeedback("Context copied")
        setTimeout(() => setFeedback(null), 2000)
      }
    } catch (err) {
      console.error("Error sharing context:", err)
    }
    setShowShareMenu(false)
  }

  const handleNativeShare = async (e: React.MouseEvent) => {
    e.stopPropagation()
    const shareData = {
      title: `Discuzzion by ${post.authorName}`,
      text: post.content,
      url: typeof window !== "undefined" ? window.location.href : "",
    }

    try {
      if (typeof navigator !== "undefined" && navigator.share && navigator.canShare && navigator.canShare(shareData)) {
        await navigator.share(shareData)
      }
    } catch (err) {
      console.error("Error sharing:", err)
    }
    setShowShareMenu(false)
  }

  return (
    <div
      onClick={() => onInteract(post)}
      className="bg-white dark:bg-slate-900/50 border-b border-slate-200 dark:border-slate-800 p-4 hover:bg-slate-50 dark:hover:bg-slate-900 transition-colors cursor-pointer animate-in fade-in duration-500 relative"
    >
      {/* Visual Feedback Toast */}
      {feedback && (
        <div className="absolute top-4 right-4 bg-indigo-500 text-white text-xs font-bold px-3 py-1.5 rounded-full shadow-lg z-20 animate-in fade-in slide-in-from-top-2">
          {feedback}
        </div>
      )}

      <div className="flex gap-3">
        <img
          src={post.avatarUrl || "/placeholder.svg"}
          alt={post.authorName}
          className="w-10 h-10 rounded-full object-cover shrink-0"
        />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1 flex-wrap">
            <span className="font-bold text-slate-900 dark:text-slate-100 hover:underline truncate">
              {post.authorName}
            </span>
            <span className="text-slate-500 text-sm truncate">{post.authorHandle}</span>
            <span className="text-slate-600 dark:text-slate-600 text-sm">·</span>
            <span className="text-slate-500 text-sm whitespace-nowrap">
              {new Date(post.timestamp).toLocaleDateString()}
            </span>

            {/* AI Delegate Badge */}
            <div className="ml-auto flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-600 dark:bg-indigo-500/10 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-500/20 shrink-0">
              <Bot size={12} />
              <span className="text-[10px] font-medium uppercase tracking-wide">AI Context</span>
            </div>
          </div>

          <p className="text-slate-800 dark:text-slate-200 text-base leading-relaxed whitespace-pre-wrap mb-3 break-words">
            {post.content}
          </p>

          {post.imageUrl && (
            <div className="mt-3 mb-3 rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-800">
              <img
                src={post.imageUrl || "/placeholder.svg"}
                alt="Post attachment"
                className="w-full h-auto object-cover max-h-[500px]"
                loading="lazy"
              />
            </div>
          )}

          <div
            className="flex items-center justify-between text-slate-500 max-w-md mt-2"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={handleReply}
              className="flex items-center gap-2 hover:text-sky-500 transition-colors group flex-1"
              title="Reply"
            >
              <div className="p-2 rounded-full group-hover:bg-sky-500/10 transition-colors">
                <MessageCircle size={18} />
              </div>
              <span className="text-sm group-hover:text-sky-500">{post.replyCount}</span>
            </button>

            {/* Chat / Ask AI Button */}
            <button
              onClick={(e) => {
                e.stopPropagation()
                onInteract(post)
              }}
              className="flex items-center gap-2 hover:text-indigo-500 dark:hover:text-indigo-400 transition-colors group flex-1"
              title="Chat with AI Delegate"
            >
              <div className="p-2 rounded-full group-hover:bg-indigo-500/10 transition-colors">
                <Bot size={18} />
              </div>
              <span className="text-sm hidden sm:inline group-hover:text-indigo-500 dark:group-hover:text-indigo-400">
                Ask AI
              </span>
            </button>

            <button
              onClick={handleLike}
              className={`flex items-center gap-2 transition-colors group flex-1 ${post.isLiked ? "text-pink-600" : "hover:text-pink-600"}`}
              title="Like"
            >
              <div className="p-2 rounded-full group-hover:bg-pink-600/10 transition-colors">
                <Heart size={18} fill={post.isLiked ? "currentColor" : "none"} />
              </div>
              <span className={`text-sm ${post.isLiked ? "text-pink-600" : "group-hover:text-pink-600"}`}>
                {post.likes}
              </span>
            </button>

            {/* Share Menu Trigger */}
            <div className="relative flex-1">
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  setShowShareMenu(!showShareMenu)
                }}
                className={`flex items-center gap-2 transition-colors group ${showShareMenu ? "text-sky-500" : "hover:text-sky-500"}`}
                title="Share"
              >
                <div className="p-2 rounded-full group-hover:bg-sky-500/10 transition-colors">
                  <Share size={18} />
                </div>
              </button>

              {/* Dropdown Menu */}
              {showShareMenu && (
                <div
                  ref={menuRef}
                  className="absolute bottom-full right-0 md:left-0 mb-2 w-56 bg-white dark:bg-black border border-slate-200 dark:border-slate-800 rounded-xl shadow-xl z-30 overflow-hidden flex flex-col py-1 animate-in fade-in zoom-in-95 duration-100"
                >
                  <button
                    onClick={handleCopyLink}
                    className="flex items-center gap-3 px-4 py-3 hover:bg-slate-100 dark:hover:bg-slate-900 text-slate-800 dark:text-slate-200 text-sm font-medium transition-colors text-left"
                  >
                    <LinkIcon size={18} className="text-slate-400" />
                    Copy link to post
                  </button>
                  <button
                    onClick={handleShareContext}
                    className="flex items-center gap-3 px-4 py-3 hover:bg-slate-100 dark:hover:bg-slate-900 text-slate-800 dark:text-slate-200 text-sm font-medium transition-colors text-left"
                  >
                    <Sparkles size={18} className="text-indigo-500 dark:text-indigo-400" />
                    Share Context Snapshot
                  </button>
                  <button
                    onClick={handleNativeShare}
                    className="flex items-center gap-3 px-4 py-3 hover:bg-slate-100 dark:hover:bg-slate-900 text-slate-800 dark:text-slate-200 text-sm font-medium transition-colors text-left"
                  >
                    <Send size={18} className="text-slate-400" />
                    Share via...
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
