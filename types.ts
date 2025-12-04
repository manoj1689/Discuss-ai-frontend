export interface ContextProfile {
  intent: string
  tone: string
  assumptions: string
  audience: string
  coreArgument: string
}

export interface Message {
  id: string
  role: "user" | "model" | "system"
  content: string
  timestamp: number
}

export interface UserStats {
  followers: number
  following: number
}

export interface User {
  id?: number
  email?: string
  name: string
  handle: string
  avatarUrl: string
  bio?: string
  location?: string
  website?: string
   language?: string
   interests?: string[]
   notificationsEnabled?: boolean
   onboardingComplete?: boolean
  stats?: UserStats
  isVerified?: boolean
  createdAt?: string
}

export interface Post {
  id: string
  authorName: string
  authorHandle: string
  content: string
  imageUrl?: string | null
  timestamp: number | string
  contextProfile: ContextProfile
  likes: number
  replyCount: number
  avatarUrl?: string
  isLiked?: boolean
}

export interface Comment {
  id: string
  author: User
  content: string
  timestamp: number | string
  isAiResponse?: boolean
  replyToId?: string | number
}

export enum AppView {
  FEED = "FEED",
  EXPLORE = "EXPLORE",
  NOTIFICATIONS = "NOTIFICATIONS",
  PROFILE = "PROFILE",
}

export interface Notification {
  id: string
  type: "like" | "reply" | "follow" | "mention"
  user: User
  postPreview?: string
  timestamp: number | string
  read: boolean
}

export interface AuthTokens {
  accessToken: string
  refreshToken: string
  expiresIn?: number
}

export interface PaginatedResponse<T> {
  items: T[]
  total: number
  page?: number
  perPage?: number
  hasNext?: boolean
}

export type SpaceRole = "host" | "speaker" | "listener" | "co_host"

export interface SpaceParticipant {
  user: User
  role: SpaceRole
  isMuted: boolean
  isSpeaking: boolean
  handRaised?: boolean
}

export interface Space {
  id: string
  title: string
  description?: string | null
  tags: string[]
  host: User
  participants: SpaceParticipant[]
  isActive: boolean
  startedAt?: number | string
  listenerCount?: number
}

export interface SpaceMessage {
  id: string
  user: User
  content: string
  timestamp: number | string
}
