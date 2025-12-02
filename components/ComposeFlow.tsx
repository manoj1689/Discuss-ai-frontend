"use client"

import type React from "react"
import { useState, useEffect, useRef } from "react"
import { Bot, X, ArrowRight, Sparkles, Check, ChevronLeft, Edit2, ImageIcon } from "lucide-react"
import { Button } from "./Button"
import { generateInterviewQuestions, generateContextProfile } from "@/services/geminiService"
import type { ContextProfile, Message, Post, User } from "@/types"

interface ComposeFlowProps {
  currentUser: User
  onClose: () => void
  onPublish: (post: Post) => void
}

type Step = "DRAFT" | "INTERVIEW" | "SUMMARY" | "REVIEW"

export const ComposeFlow: React.FC<ComposeFlowProps> = ({ currentUser, onClose, onPublish }) => {
  const [step, setStep] = useState<Step>("DRAFT")
  const [draft, setDraft] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [attachedImage, setAttachedImage] = useState<string | null>(null)

  // Interview State
  const [messages, setMessages] = useState<Message[]>([])
  const [answerInput, setAnswerInput] = useState("")
  const [questionQueue, setQuestionQueue] = useState<string[]>([])
  const [answers, setAnswers] = useState<string[]>([])
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [isTyping, setIsTyping] = useState(false)

  // Final State
  const [profile, setProfile] = useState<ContextProfile | null>(null)

  const messagesEndRef = useRef<HTMLDivElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages, isTyping, step])

  const handleStartInterview = async () => {
    if (!draft.trim()) return
    setIsLoading(true)
    try {
      const questions = await generateInterviewQuestions(draft)
      setQuestionQueue(questions)
      setAnswers(new Array(questions.length).fill(""))
      setCurrentQuestionIndex(0)

      if (questions.length > 0) {
        setMessages([
          {
            id: "intro",
            role: "model",
            content: `I've read your draft. Let's clarify a few things to build your context profile.\n\n${questions[0]}`,
            timestamp: Date.now(),
          },
        ])
        setStep("INTERVIEW")
      }
    } catch (e) {
      console.error(e)
      setMessages([
        {
          id: "error",
          role: "model",
          content: "I'm having trouble connecting to the interview service. Please try again.",
          timestamp: Date.now(),
        },
      ])
    } finally {
      setIsLoading(false)
    }
  }

  const handleEditAt = (index: number) => {
    setCurrentQuestionIndex(index)
    setAnswerInput(answers[index])

    const newMessages: Message[] = []
    newMessages.push({
      id: "intro",
      role: "model",
      content: `I've read your draft. Let's clarify a few things to build your context profile.\n\n${questionQueue[0]}`,
      timestamp: Date.now(),
    })

    for (let i = 0; i < index; i++) {
      newMessages.push({
        id: `ans-${i}`,
        role: "user",
        content: answers[i],
        timestamp: Date.now(),
      })
      newMessages.push({
        id: `q-${i + 1}`,
        role: "model",
        content: questionQueue[i + 1],
        timestamp: Date.now(),
      })
    }

    setMessages(newMessages)
    setStep("INTERVIEW")
  }

  const handleBack = () => {
    if (step === "INTERVIEW") {
      if (currentQuestionIndex > 0) {
        handleEditAt(currentQuestionIndex - 1)
      } else {
        setStep("DRAFT")
        setMessages([])
        setQuestionQueue([])
        setAnswers([])
      }
    } else if (step === "SUMMARY") {
      handleEditAt(questionQueue.length - 1)
    } else if (step === "REVIEW") {
      setStep("SUMMARY")
    }
  }

  const handleSendAnswer = () => {
    if (!answerInput.trim()) return

    const updatedAnswers = [...answers]
    updatedAnswers[currentQuestionIndex] = answerInput
    setAnswers(updatedAnswers)

    const userMsg: Message = {
      id: Date.now().toString(),
      role: "user",
      content: answerInput,
      timestamp: Date.now(),
    }

    setMessages((prev) => [...prev, userMsg])
    setAnswerInput("")

    const nextIndex = currentQuestionIndex + 1

    if (nextIndex < questionQueue.length) {
      setIsTyping(true)
      setTimeout(() => {
        const nextQ = questionQueue[nextIndex]
        const aiMsg: Message = {
          id: (Date.now() + 1).toString(),
          role: "model",
          content: nextQ,
          timestamp: Date.now(),
        }
        setMessages((prev) => [...prev, aiMsg])
        setCurrentQuestionIndex(nextIndex)
        setIsTyping(false)
      }, 600)
    } else {
      setIsTyping(true)
      setTimeout(() => {
        setStep("SUMMARY")
        setIsTyping(false)
      }, 600)
    }
  }

  const handleSynthesize = async () => {
    setIsLoading(true)
    try {
      const cleanHistory: Message[] = questionQueue.flatMap((q, i) => [
        { id: `q-${i}`, role: "model" as const, content: q, timestamp: 0 },
        { id: `a-${i}`, role: "user" as const, content: answers[i], timestamp: 0 },
      ])

      const generatedProfile = await generateContextProfile(draft, cleanHistory)
      setProfile(generatedProfile)
      setStep("REVIEW")
    } catch (e) {
      console.error(e)
    } finally {
      setIsLoading(false)
    }
  }

  const handleFinalPublish = () => {
    if (!profile) return

    const newPost: Post = {
      id: Date.now().toString(),
      authorName: currentUser.name,
      authorHandle: currentUser.handle,
      avatarUrl: currentUser.avatarUrl,
      content: draft,
      imageUrl: attachedImage || undefined,
      timestamp: Date.now(),
      likes: 0,
      replyCount: 0,
      contextProfile: profile,
    }

    onPublish(newPost)
    onClose()
  }

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onloadend = () => {
        setAttachedImage(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const getProgress = () => {
    switch (step) {
      case "DRAFT":
        return 10
      case "INTERVIEW":
        const total = questionQueue.length || 1
        return 20 + (currentQuestionIndex / total) * 50
      case "SUMMARY":
        return 80
      case "REVIEW":
        return 100
      default:
        return 0
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 w-full max-w-2xl rounded-2xl shadow-2xl flex flex-col max-h-[90vh] overflow-hidden relative transition-colors">
        {/* Progress Bar */}
        <div className="h-1 bg-slate-100 dark:bg-slate-800 w-full flex">
          <div
            className="h-full bg-indigo-500 transition-all duration-500 ease-out"
            style={{ width: `${getProgress()}%` }}
          ></div>
        </div>

        {/* Header */}
        <div className="p-4 flex items-center justify-between border-b border-slate-200 dark:border-slate-800">
          <div className="flex items-center gap-3">
            {step !== "DRAFT" && (
              <button
                onClick={handleBack}
                className="p-1.5 -ml-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 dark:hover:text-white transition-colors"
              >
                <ChevronLeft size={20} />
              </button>
            )}

            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-indigo-50 dark:bg-indigo-500/10 flex items-center justify-center text-indigo-500">
                {step === "DRAFT" && <span className="font-bold">1</span>}
                {step === "INTERVIEW" && <Bot size={18} />}
                {step === "SUMMARY" && <Check size={18} />}
                {step === "REVIEW" && <Sparkles size={18} />}
              </div>
              <h2 className="font-semibold text-lg text-slate-900 dark:text-slate-100">
                {step === "DRAFT" && "Draft Your Thought"}
                {step === "INTERVIEW" && "The Context Interview"}
                {step === "SUMMARY" && "Review Answers"}
                {step === "REVIEW" && "Review Context DNA"}
              </h2>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-500 hover:text-slate-900 dark:hover:text-white rounded-full hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 scroll-smooth">
          {step === "DRAFT" && (
            <div className="h-full flex flex-col">
              <div className="flex-1 min-h-[120px]">
                <textarea
                  value={draft}
                  onChange={(e) => setDraft(e.target.value)}
                  placeholder="What's on your mind? Don't worry about being perfect, the AI will help clarify later."
                  className="w-full h-full bg-transparent text-xl text-slate-900 dark:text-slate-200 placeholder-slate-400 dark:placeholder-slate-600 border-none focus:ring-0 resize-none p-0"
                  autoFocus
                />
                {attachedImage && (
                  <div className="relative mt-2 inline-block">
                    <img
                      src={attachedImage || "/placeholder.svg"}
                      alt="Attachment"
                      className="h-32 rounded-xl object-cover border border-slate-200 dark:border-slate-800"
                    />
                    <button
                      onClick={() => setAttachedImage(null)}
                      className="absolute -top-2 -right-2 bg-slate-900 text-white rounded-full p-1 border border-white hover:bg-slate-700"
                    >
                      <X size={12} />
                    </button>
                  </div>
                )}
              </div>

              {/* Tools Row */}
              <div className="flex items-center gap-2 py-2 border-t border-slate-100 dark:border-slate-800/50">
                <input
                  type="file"
                  ref={fileInputRef}
                  className="hidden"
                  accept="image/*"
                  onChange={handleImageUpload}
                />
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="p-2 text-indigo-500 rounded-full hover:bg-indigo-50 dark:hover:bg-indigo-500/10 transition-colors"
                  title="Add Image"
                >
                  <ImageIcon size={20} />
                </button>
              </div>

              {/* Preview Area */}
              <div className="mt-4 pt-4 border-t border-slate-200 dark:border-slate-800 animate-in fade-in duration-500">
                <div className="flex justify-between items-end mb-2">
                  <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider">Post Preview</h3>
                  <span className={`text-xs ${draft.length > 280 ? "text-red-500" : "text-slate-500"}`}>
                    {draft.length} chars
                  </span>
                </div>

                <div className="bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 rounded-xl p-4">
                  <div className="flex gap-3">
                    <img
                      src={currentUser.avatarUrl || "/placeholder.svg"}
                      alt={currentUser.name}
                      className="w-10 h-10 rounded-full object-cover"
                    />
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-bold text-slate-900 dark:text-slate-100">{currentUser.name}</span>
                        <span className="text-slate-500 text-sm">{currentUser.handle}</span>
                        <span className="text-slate-600 text-sm">·</span>
                        <span className="text-slate-500 text-sm">Now</span>
                      </div>

                      <p className="text-slate-800 dark:text-slate-200 text-base leading-relaxed whitespace-pre-wrap break-words">
                        {draft || <span className="text-slate-500 italic">Type to preview...</span>}
                      </p>

                      {attachedImage && (
                        <div className="mt-3 rounded-xl overflow-hidden border border-slate-200 dark:border-slate-800">
                          <img src={attachedImage || "/placeholder.svg"} className="w-full h-auto object-cover" />
                        </div>
                      )}

                      <div className="flex items-center justify-between text-slate-500 max-w-md mt-4 pt-2 border-t border-slate-200 dark:border-slate-800/50">
                        <div className="flex gap-4">
                          <div className="w-4 h-4 bg-slate-200 dark:bg-slate-800 rounded-full"></div>
                          <div className="w-4 h-4 bg-slate-200 dark:bg-slate-800 rounded-full"></div>
                          <div className="w-4 h-4 bg-slate-200 dark:bg-slate-800 rounded-full"></div>
                        </div>
                        <div className="flex items-center gap-1.5 px-2 py-1 rounded-full bg-slate-200 dark:bg-slate-800/50 text-slate-500 border border-slate-300 dark:border-slate-700/50">
                          <Bot size={12} />
                          <span className="text-[10px] font-medium">Pending Context</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-6 flex justify-end">
                <Button
                  variant="accent"
                  onClick={handleStartInterview}
                  disabled={!draft.trim()}
                  isLoading={isLoading}
                  className="gap-2"
                >
                  Start Interview <ArrowRight size={16} />
                </Button>
              </div>
            </div>
          )}

          {step === "INTERVIEW" && (
            <div className="flex flex-col h-full">
              <div className="flex-1 space-y-4 mb-4">
                {messages.map((msg) => (
                  <div key={msg.id} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                    <div
                      className={`max-w-[85%] p-4 rounded-2xl ${
                        msg.role === "model"
                          ? "bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-slate-200 border border-slate-200 dark:border-slate-700"
                          : "bg-indigo-600 text-white"
                      } whitespace-pre-wrap animate-in fade-in slide-in-from-bottom-2 duration-300`}
                    >
                      {msg.role === "model" && <Bot size={16} className="mb-2 text-indigo-500 dark:text-indigo-400" />}
                      {msg.content}
                    </div>
                  </div>
                ))}
                {isTyping && (
                  <div className="flex justify-start">
                    <div className="bg-slate-100 dark:bg-slate-800 rounded-2xl p-4 border border-slate-200 dark:border-slate-700 flex gap-1 items-center animate-pulse">
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
                <div ref={messagesEndRef} />
              </div>

              <div className="mt-auto space-y-3 pt-4 border-t border-slate-200 dark:border-slate-800/50">
                <textarea
                  value={answerInput}
                  onChange={(e) => setAnswerInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault()
                      handleSendAnswer()
                    }
                  }}
                  placeholder="Type your answer here..."
                  className="w-full p-3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 text-slate-900 dark:text-slate-200 resize-none h-24"
                  disabled={isTyping}
                  autoFocus
                />
                <div className="flex justify-between items-center">
                  <span className="text-xs text-slate-500">
                    Question {currentQuestionIndex + 1} of {questionQueue.length}
                  </span>
                  <Button variant="primary" onClick={handleSendAnswer} disabled={!answerInput.trim() || isTyping}>
                    Reply
                  </Button>
                </div>
              </div>
            </div>
          )}

          {step === "SUMMARY" && (
            <div className="space-y-6">
              <div className="bg-slate-50 dark:bg-slate-800/50 rounded-xl p-4 border border-slate-200 dark:border-slate-700 mb-6">
                <h3 className="text-sm font-bold text-slate-500 dark:text-slate-400 mb-2">Original Draft</h3>
                <p className="text-slate-900 dark:text-slate-200">{draft}</p>
              </div>

              <div className="space-y-4">
                <h3 className="text-sm font-bold text-indigo-500 dark:text-indigo-400 uppercase tracking-wider">
                  Interview Summary
                </h3>
                {questionQueue.map((q, i) => (
                  <div
                    key={i}
                    className="group flex gap-4 p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 transition-all"
                  >
                    <div className="flex-1 space-y-2">
                      <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">{q}</p>
                      <p className="text-slate-900 dark:text-slate-200">{answers[i]}</p>
                    </div>
                    <button
                      onClick={() => handleEditAt(i)}
                      className="opacity-0 group-hover:opacity-100 p-2 text-slate-500 hover:text-indigo-500 dark:hover:text-indigo-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full h-fit transition-all"
                      title="Edit this answer"
                    >
                      <Edit2 size={16} />
                    </button>
                  </div>
                ))}
              </div>

              <div className="pt-6 flex justify-end">
                <Button
                  variant="accent"
                  size="lg"
                  onClick={handleSynthesize}
                  isLoading={isLoading}
                  className="gap-2 w-full md:w-auto"
                >
                  Synthesize Profile <Sparkles size={16} />
                </Button>
              </div>
            </div>
          )}

          {step === "REVIEW" && profile && (
            <div className="space-y-6">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/20 to-purple-500/20 blur-xl"></div>
                <div className="relative bg-white dark:bg-slate-900 border border-indigo-200 dark:border-indigo-500/30 rounded-xl p-6 shadow-lg dark:shadow-none">
                  <div className="flex items-center gap-2 mb-4">
                    <Sparkles className="text-indigo-500 dark:text-indigo-400" size={20} />
                    <h3 className="text-sm font-bold text-indigo-900 dark:text-indigo-100 uppercase tracking-wider">
                      Generated Context Profile
                    </h3>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="p-3 bg-slate-50 dark:bg-slate-950 rounded-lg border border-slate-200 dark:border-slate-800">
                      <label className="text-xs text-slate-500 block mb-1">Core Argument</label>
                      <p className="text-sm text-slate-900 dark:text-slate-300 font-medium">{profile.coreArgument}</p>
                    </div>
                    <div className="p-3 bg-slate-50 dark:bg-slate-950 rounded-lg border border-slate-200 dark:border-slate-800">
                      <label className="text-xs text-slate-500 block mb-1">Intent</label>
                      <p className="text-sm text-slate-900 dark:text-slate-300">{profile.intent}</p>
                    </div>
                    <div className="p-3 bg-slate-50 dark:bg-slate-950 rounded-lg border border-slate-200 dark:border-slate-800">
                      <label className="text-xs text-slate-500 block mb-1">Tone</label>
                      <p className="text-sm text-slate-900 dark:text-slate-300">{profile.tone}</p>
                    </div>
                    <div className="p-3 bg-slate-50 dark:bg-slate-950 rounded-lg border border-slate-200 dark:border-slate-800">
                      <label className="text-xs text-slate-500 block mb-1">Target Audience</label>
                      <p className="text-sm text-slate-900 dark:text-slate-300">{profile.audience}</p>
                    </div>
                  </div>

                  <div className="mt-4 p-3 bg-slate-50 dark:bg-slate-950 rounded-lg border border-slate-200 dark:border-slate-800">
                    <label className="text-xs text-slate-500 block mb-1">Assumptions</label>
                    <p className="text-sm text-slate-900 dark:text-slate-300">{profile.assumptions}</p>
                  </div>

                  <p className="text-xs text-indigo-500/60 dark:text-indigo-300/60 mt-4 text-center">
                    This profile will govern how your AI Delegate handles replies.
                  </p>
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4">
                <Button variant="ghost" onClick={handleBack}>
                  Back to Summary
                </Button>
                <Button variant="accent" size="lg" onClick={handleFinalPublish} className="w-full md:w-auto">
                  Confirm & Publish Post
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
