"use client"

import type React from "react"
import { useEffect, useRef, useState } from "react"
import { X, Bot, Send } from "lucide-react"
import type { Message, Post } from "@/types"
import { generateDelegateResponse } from "@/services/geminiService"
import { Button } from "./Button"
import { useAppSelector } from "@/store/hooks"

interface AiChatModalProps {
  post: Post
  onClose: () => void
}

export const AiChatModal: React.FC<AiChatModalProps> = ({ post, onClose }) => {
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState("")
  const [isTyping, setIsTyping] = useState(false)
  const scrollRef = useRef<HTMLDivElement>(null)
  const { accessToken } = useAppSelector((state) => state.auth)

  useEffect(() => {
    setMessages([
      {
        id: "intro",
        role: "model",
        content: `Hey, I'm ${post.authorName}'s AI delegate. Ask me anything about this post or their perspective.`,
        timestamp: Date.now(),
      },
    ])
  }, [post])

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [messages, isTyping])

  const handleSend = async () => {
    if (!input.trim()) return
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
      const reply = await generateDelegateResponse(
        post.content,
        post.contextProfile,
        userMsg.content,
        messages,
        accessToken,
      )
      const aiMsg: Message = {
        id: (Date.now() + 1).toString(),
        role: "model",
        content: reply,
        timestamp: Date.now(),
      }
      setMessages((prev) => [...prev, aiMsg])
    } catch (e) {
      console.error(e)
    } finally {
      setIsTyping(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="w-full max-w-xl bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xl flex flex-col h-[80vh] overflow-hidden">
        <div className="flex items-center justify-between p-4 border-b border-slate-200 dark:border-slate-800 bg-white/90 dark:bg-slate-900/90 backdrop-blur">
          <div className="flex items-center gap-3">
            <div className="relative">
              <img src={post.avatarUrl || "/placeholder.svg"} alt={post.authorName} className="w-10 h-10 rounded-full" />
              <div className="absolute -bottom-1 -right-1 bg-indigo-600 rounded-full p-0.5 border-2 border-white dark:border-slate-900">
                <Bot size={12} className="text-white" />
              </div>
            </div>
            <div>
              <p className="text-xs uppercase tracking-wide text-indigo-500 font-bold">AI 1:1 Chat</p>
              <h3 className="font-bold text-slate-900 dark:text-slate-100">{post.authorName}</h3>
              <p className="text-xs text-slate-500 line-clamp-1">{post.content}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full text-slate-500 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            <X size={18} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-3" ref={scrollRef}>
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`max-w-[80%] rounded-2xl px-3 py-2 text-sm ${
                  msg.role === "user"
                    ? "bg-indigo-500 text-white rounded-br-none"
                    : "bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-slate-100 rounded-bl-none"
                }`}
              >
                {msg.content}
              </div>
            </div>
          ))}
          {isTyping && (
            <div className="flex items-center gap-2 text-xs text-slate-500">
              <Bot size={14} />
              typing…
            </div>
          )}
        </div>

        <div className="p-3 border-t border-slate-200 dark:border-slate-800 bg-white/90 dark:bg-slate-900/90 backdrop-blur">
          <div className="flex items-center gap-2">
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") handleSend()
              }}
              placeholder="Ask the AI delegate…"
              className="flex-1 bg-slate-100 dark:bg-slate-800 rounded-full px-4 py-2 text-sm border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 ring-indigo-500"
            />
            <Button size="sm" onClick={handleSend} disabled={isTyping}>
              <Send size={16} className="mr-1" />
              Send
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
