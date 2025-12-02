"use client"

import type React from "react"
import { X, Sparkles, Bot } from "lucide-react"
import type { Post } from "@/types"

interface ContextProfileModalProps {
  post: Post
  onClose: () => void
}

export const ContextProfileModal: React.FC<ContextProfileModalProps> = ({ post, onClose }) => {
  const { contextProfile } = post

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="w-full max-w-lg bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden">
        <div className="flex items-center justify-between p-4 border-b border-slate-200 dark:border-slate-800 bg-white/90 dark:bg-slate-900/90 backdrop-blur">
          <div className="flex items-center gap-2">
            <Sparkles size={18} className="text-indigo-500" />
            <div>
              <p className="text-xs uppercase tracking-wide text-indigo-500 font-bold">Context DNA</p>
              <p className="text-sm text-slate-700 dark:text-slate-200">{post.authorName}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full text-slate-500 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            <X size={18} />
          </button>
        </div>

        <div className="p-5 space-y-4">
          <div className="flex items-center gap-3">
            <img src={post.avatarUrl || "/placeholder.svg"} alt={post.authorName} className="w-10 h-10 rounded-full" />
            <div>
              <p className="font-bold text-slate-900 dark:text-slate-100">{post.authorName}</p>
              <p className="text-xs text-slate-500">{post.authorHandle}</p>
            </div>
            <span className="ml-auto inline-flex items-center gap-1 text-xs font-semibold text-indigo-500 bg-indigo-50 dark:bg-indigo-500/10 px-2 py-1 rounded-full border border-indigo-100 dark:border-indigo-500/20">
              <Bot size={12} />
              AI Annotated
            </span>
          </div>

          <div className="space-y-3">
            <div className="bg-slate-50 dark:bg-slate-800/60 p-3 rounded-xl border border-slate-200 dark:border-slate-800">
              <p className="text-[11px] font-semibold text-indigo-500 uppercase tracking-wide mb-1">Core Argument</p>
              <p className="text-sm text-slate-800 dark:text-slate-200">{contextProfile.coreArgument}</p>
            </div>
            <div className="bg-slate-50 dark:bg-slate-800/60 p-3 rounded-xl border border-slate-200 dark:border-slate-800">
              <p className="text-[11px] font-semibold text-indigo-500 uppercase tracking-wide mb-1">Intent</p>
              <p className="text-sm text-slate-800 dark:text-slate-200">{contextProfile.intent}</p>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-slate-50 dark:bg-slate-800/60 p-3 rounded-xl border border-slate-200 dark:border-slate-800">
                <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wide mb-1">Tone</p>
                <p className="text-sm text-slate-800 dark:text-slate-200">{contextProfile.tone}</p>
              </div>
              <div className="bg-slate-50 dark:bg-slate-800/60 p-3 rounded-xl border border-slate-200 dark:border-slate-800">
                <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wide mb-1">Audience</p>
                <p className="text-sm text-slate-800 dark:text-slate-200">{contextProfile.audience}</p>
              </div>
            </div>
          </div>

          <div className="text-xs text-slate-500 dark:text-slate-400 bg-slate-50 dark:bg-slate-800/60 p-3 rounded-xl border border-slate-200 dark:border-slate-800">
            Generated contextual profile to explain the author’s perspective. Use responsibly.
          </div>
        </div>
      </div>
    </div>
  )
}
