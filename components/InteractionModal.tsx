"use client"

import type React from "react"
import { useState, useRef, useEffect } from "react"
import type { Post, Message, Comment } from "@/types"
import { X, Send, Bot, UserIcon, Info, MessageSquare } from "lucide-react"
import { generateDelegateResponse } from "@/services/geminiService"
import { Button } from "./Button"
import { MOCK_COMMENTS, CURRENT_USER } from "@/constants"

interface InteractionModalProps {
  post: Post | null
  onClose: () => void
  initialTab?: "discuss" | "chat"
  showContextDefault?: boolean
}

export const InteractionModal: React.FC<InteractionModalProps> = ({ post, onClose, initialTab, showContextDefault }) => {
  const [activeTab, setActiveTab] = useState<"discuss" | "chat">(initialTab || "discuss")
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState("")
  const [isTyping, setIsTyping] = useState(false)
  const scrollRef = useRef<HTMLDivElement>(null)
  const commentsEndRef = useRef<HTMLDivElement>(null)
  const [showContext, setShowContext] = useState(!!showContextDefault)

  // Public Discussion State
  const [comments, setComments] = useState<Comment[]>(MOCK_COMMENTS)
  const [publicInput, setPublicInput] = useState("")

  useEffect(() => {
    if (post) {
      setMessages([
        {
          id: "welcome",
          role: "model",
          content: `Hi, I'm ${post.authorName}'s AI Delegate. I've been briefed on the context of this post. Ask me anything about their intent, reasoning, or perspective.`,
          timestamp: Date.now(),
        },
      ])
      // Reset based on trigger intent
      setActiveTab(initialTab || "discuss")
      setShowContext(!!showContextDefault)
    }
  }, [post, initialTab, showContextDefault])

  useEffect(() => {
    if (activeTab === "chat" && scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    } else if (activeTab === "discuss" && commentsEndRef.current) {
      commentsEndRef.current.scrollIntoView({ behavior: "smooth" })
    }
  }, [messages, isTyping, activeTab, comments])

  const handleSendPrivate = async () => {
    if (!input.trim() || !post) return

    const userMsg: Message = {
      id: Date.now().toString(),
      role: "user",
      content: input,
      timestamp: Date.now(),
    }

    setMessages((prev) => [...prev, userMsg])
    setInput("")
    setIsTyping(true)

    try {
      const responseText = await generateDelegateResponse(post.content, post.contextProfile, userMsg.content, messages)

      const aiMsg: Message = {
        id: (Date.now() + 1).toString(),
        role: "model",
        content: responseText,
        timestamp: Date.now(),
      }

      setMessages((prev) => [...prev, aiMsg])
    } catch (err) {
      console.error(err)
    } finally {
      setIsTyping(false)
    }
  }

  const handlePostComment = async () => {
    if (!publicInput.trim() || !post) return

    const newComment: Comment = {
      id: Date.now().toString(),
      author: CURRENT_USER,
      content: publicInput,
      timestamp: Date.now(),
    }

    setComments((prev) => [...prev, newComment])
    setPublicInput("")
    setIsTyping(true) // Re-use typing state for UI feedback

    // Trigger AI Response to the public comment
    try {
      const responseText = await generateDelegateResponse(
        post.content,
        post.contextProfile,
        newComment.content,
        [], // No private history for public comments usually, or maybe context of thread
      )

      setTimeout(() => {
        const aiReply: Comment = {
          id: (Date.now() + 1).toString(),
          author: {
            name: `${post.authorName} (AI Delegate)`,
            handle: post.authorHandle,
            avatarUrl: post.avatarUrl,
          },
          content: responseText,
          timestamp: Date.now(),
          isAiResponse: true,
          replyToId: newComment.id,
        }
        setComments((prev) => [...prev, aiReply])
        setIsTyping(false)
      }, 1500) // Artificial delay to feel like "reading"
    } catch (e) {
      console.error(e)
      setIsTyping(false)
    }
  }

  if (!post) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden flex flex-col h-[85vh] transition-colors">
        {/* Header */}
        <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-white dark:bg-slate-900/95 sticky top-0 z-10">
          <div className="flex items-center gap-3">
            <div className="relative">
              <img
                src={post.avatarUrl || "/placeholder.svg"}
                alt={post.authorName}
                className="w-10 h-10 rounded-full opacity-90"
              />
              <div className="absolute -bottom-1 -right-1 bg-indigo-600 rounded-full p-0.5 border-2 border-white dark:border-slate-900">
                <Bot size={12} className="text-white" />
              </div>
            </div>
            <div>
              <h3 className="font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                {post.authorName}{" "}
                <span className="text-indigo-500 dark:text-indigo-400 text-xs font-normal uppercase tracking-wider">
                  AI Delegate
                </span>
              </h3>
              <p className="text-slate-500 text-xs truncate max-w-[200px]">{post.content}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowContext(!showContext)}
              className={`p-2 rounded-full transition-colors ${showContext ? "text-indigo-500 bg-indigo-50 dark:bg-indigo-500/10" : "text-slate-500 hover:text-slate-900 dark:hover:text-slate-300"}`}
              title="View Context Profile"
            >
              <Info size={20} />
            </button>
            <button
              onClick={onClose}
              className="p-2 text-slate-500 hover:text-slate-900 dark:hover:text-white rounded-full hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Tab Switcher */}
        <div className="flex border-b border-slate-200 dark:border-slate-800">
          <button
            onClick={() => setActiveTab("discuss")}
            className={`flex-1 py-3 text-sm font-bold flex items-center justify-center gap-2 transition-colors ${activeTab === "discuss" ? "text-slate-900 dark:text-white border-b-2 border-indigo-500" : "text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800"}`}
          >
            <MessageSquare size={16} />
            Public Discuzzion
          </button>
          <button
            onClick={() => setActiveTab("chat")}
            className={`flex-1 py-3 text-sm font-bold flex items-center justify-center gap-2 transition-colors ${activeTab === "chat" ? "text-slate-900 dark:text-white border-b-2 border-indigo-500" : "text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800"}`}
          >
            <Bot size={16} />
            Private 1:1 Chat
          </button>
        </div>

        {/* Body Container */}
        <div className="flex flex-1 overflow-hidden relative">
          {/* Context Panel Overlay */}
          {showContext && (
            <div className="absolute top-0 right-0 bottom-0 w-64 bg-slate-50/95 dark:bg-slate-900/95 border-l border-slate-200 dark:border-slate-800 p-4 overflow-y-auto z-20 backdrop-blur-sm animate-in slide-in-from-right duration-200">
              <h4 className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-4">
                Context Profile
              </h4>

              <div className="space-y-4">
                <div>
                  <label className="text-xs text-slate-500 block mb-1">Core Argument</label>
                  <p className="text-sm text-slate-800 dark:text-slate-300 bg-white dark:bg-slate-800/50 p-2 rounded border border-slate-200 dark:border-transparent">
                    {post.contextProfile.coreArgument}
                  </p>
                </div>
                <div>
                  <label className="text-xs text-slate-500 block mb-1">Intent</label>
                  <p className="text-sm text-slate-800 dark:text-slate-300">{post.contextProfile.intent}</p>
                </div>
                <div>
                  <label className="text-xs text-slate-500 block mb-1">Tone</label>
                  <p className="text-sm text-slate-800 dark:text-slate-300">{post.contextProfile.tone}</p>
                </div>
                <div>
                  <label className="text-xs text-slate-500 block mb-1">Audience</label>
                  <p className="text-sm text-slate-800 dark:text-slate-300">{post.contextProfile.audience}</p>
                </div>
              </div>
            </div>
          )}

          {/* Public Discussion Tab */}
          {activeTab === "discuss" && (
            <div className="flex-1 flex flex-col bg-white dark:bg-slate-950">
              <div className="flex-1 overflow-y-auto p-0">
                {/* Original Post Context */}
                <div className="p-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/20">
                  <div className="flex gap-3">
                    <img src={post.avatarUrl || "/placeholder.svg"} className="w-8 h-8 rounded-full" />
                    <div>
                      <p className="font-bold text-sm text-slate-900 dark:text-slate-200">{post.authorName}</p>
                      <p className="text-sm text-slate-800 dark:text-slate-300 mt-1">{post.content}</p>
                    </div>
                  </div>
                </div>

                {/* Comments */}
                <div className="p-4 space-y-6">
                  {comments.map((comment) => (
                    <div key={comment.id} className={`flex gap-3 ${comment.replyToId ? "ml-8 relative" : ""}`}>
                      {comment.replyToId && (
                        <div className="absolute -left-6 top-0 w-4 h-4 border-l-2 border-b-2 border-slate-300 dark:border-slate-700 rounded-bl-lg"></div>
                      )}
                      <img
                        src={comment.author.avatarUrl || "/placeholder.svg"}
                        className="w-8 h-8 rounded-full shrink-0"
                      />
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-bold text-sm text-slate-900 dark:text-slate-200">
                            {comment.author.name}
                          </span>
                          <span className="text-slate-500 text-xs">{comment.author.handle}</span>
                          <span className="text-slate-400 text-xs">
                            ·{" "}
                            {new Date(comment.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                          </span>
                          {comment.isAiResponse && (
                            <span className="bg-indigo-500/10 text-indigo-500 dark:text-indigo-400 text-[10px] px-1.5 py-0.5 rounded border border-indigo-500/20">
                              Auto-Reply
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed">{comment.content}</p>
                      </div>
                    </div>
                  ))}
                  {isTyping && (
                    <div className="flex gap-3 ml-8">
                      <div className="w-8 h-8 rounded-full bg-indigo-500/20 flex items-center justify-center">
                        <Bot size={16} className="text-indigo-500" />
                      </div>
                      <div className="bg-slate-100 dark:bg-slate-800 rounded-2xl rounded-tl-none p-3 flex gap-1 items-center h-10">
                        <div className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce"></div>
                        <div className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce delay-75"></div>
                        <div className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce delay-150"></div>
                      </div>
                    </div>
                  )}
                  <div ref={commentsEndRef} />
                </div>
              </div>

              <div className="p-4 border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
                <div className="flex items-center gap-2">
                  <img src={CURRENT_USER.avatarUrl || "/placeholder.svg"} className="w-8 h-8 rounded-full" />
                  <input
                    type="text"
                    value={publicInput}
                    onChange={(e) => setPublicInput(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handlePostComment()}
                    placeholder="Add to the discussion..."
                    className="flex-1 bg-slate-100 dark:bg-slate-950 border-none rounded-full px-4 py-2 focus:ring-2 focus:ring-indigo-500 focus:outline-none text-slate-900 dark:text-white placeholder-slate-500"
                  />
                  <button
                    onClick={handlePostComment}
                    disabled={!publicInput.trim()}
                    className="p-2 text-indigo-500 hover:bg-indigo-50 dark:hover:bg-indigo-500/10 rounded-full disabled:opacity-50 transition-colors"
                  >
                    <Send size={20} />
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Private Chat Tab */}
          {activeTab === "chat" && (
            <div className="flex-1 flex flex-col bg-slate-50 dark:bg-slate-950">
              <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-4">
                {messages.map((msg) => (
                  <div key={msg.id} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                    <div
                      className={`max-w-[80%] rounded-2xl p-3 ${
                        msg.role === "user"
                          ? "bg-indigo-600 text-white rounded-tr-none"
                          : "bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 rounded-tl-none border border-slate-200 dark:border-slate-700 shadow-sm"
                      }`}
                    >
                      {msg.role === "model" && (
                        <p className="text-[10px] text-indigo-500 dark:text-indigo-300 font-bold mb-1 uppercase tracking-wide">
                          Delegate
                        </p>
                      )}
                      <p className="text-sm leading-relaxed">{msg.content}</p>
                    </div>
                  </div>
                ))}
                {isTyping && (
                  <div className="flex justify-start">
                    <div className="bg-white dark:bg-slate-800 rounded-2xl rounded-tl-none p-3 border border-slate-200 dark:border-slate-700 flex gap-1 items-center">
                      <div
                        className="w-2 h-2 bg-slate-400 dark:bg-slate-500 rounded-full animate-bounce"
                        style={{ animationDelay: "0ms" }}
                      ></div>
                      <div
                        className="w-2 h-2 bg-slate-400 dark:bg-slate-500 rounded-full animate-bounce"
                        style={{ animationDelay: "150ms" }}
                      ></div>
                      <div
                        className="w-2 h-2 bg-slate-400 dark:bg-slate-500 rounded-full animate-bounce"
                        style={{ animationDelay: "300ms" }}
                      ></div>
                    </div>
                  </div>
                )}
              </div>

              {/* Input */}
              <div className="p-4 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800">
                <div className="flex items-center gap-2 bg-slate-100 dark:bg-slate-950 p-2 rounded-full border border-slate-200 dark:border-slate-800 focus-within:border-indigo-500 transition-colors">
                  <div className="w-8 h-8 rounded-full bg-slate-200 dark:bg-slate-800 flex items-center justify-center shrink-0">
                    <UserIcon size={14} className="text-slate-500 dark:text-slate-400" />
                  </div>
                  <input
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleSendPrivate()}
                    placeholder="Ask specifically about intent, tone..."
                    className="flex-1 bg-transparent border-none focus:outline-none text-sm text-slate-900 dark:text-slate-200 placeholder-slate-500"
                    autoFocus
                  />
                  <Button
                    size="sm"
                    variant="primary"
                    onClick={handleSendPrivate}
                    disabled={!input.trim() || isTyping}
                    className="!p-2 !rounded-full"
                  >
                    <Send size={16} />
                  </Button>
                </div>
                <p className="text-center text-xs text-slate-500 dark:text-slate-600 mt-2">
                  Responses generated based on the author's context.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
