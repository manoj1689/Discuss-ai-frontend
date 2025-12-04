import { Comment, ContextProfile, Notification, Post, Space, SpaceMessage, SpaceParticipant, User } from "@/types"

export const mapUser = (data: any): User => ({
  id: data?.id,
  email: data?.email,
  name: data?.name || "",
  handle: (() => {
    const handle = data?.handle || ""
    return handle.startsWith("@") ? handle : handle ? `@${handle}` : ""
  })(),
  avatarUrl: data?.avatar_url || data?.avatarUrl || "/placeholder.svg",
  bio: data?.bio || "",
  location: data?.location || "",
  website: data?.website || "",
  language: data?.language,
  interests: Array.isArray(data?.interests) ? data.interests : [],
  notificationsEnabled: data?.notifications_enabled ?? data?.notificationsEnabled,
  onboardingComplete: Boolean(
    data?.onboarding_complete ??
      data?.onboardingComplete ??
      (Array.isArray(data?.interests) && data.interests.length > 0)
  ),
  stats: data?.stats
    ? {
        followers: data.stats.followers || 0,
        following: data.stats.following || 0,
      }
    : undefined,
  isVerified: data?.is_verified ?? data?.isVerified,
  createdAt: data?.created_at || data?.createdAt,
})

export const mapContextProfile = (data: any): ContextProfile => ({
  intent: data?.intent || "",
  tone: data?.tone || "",
  assumptions: data?.assumptions || "",
  audience: data?.audience || "",
  coreArgument: data?.coreArgument || data?.core_argument || "",
})

export const mapPost = (data: any): Post => ({
  id: String(data?.id ?? crypto.randomUUID()),
  authorName: data?.author_name || data?.authorName || data?.author?.name || "",
  authorHandle: (() => {
    const handle = data?.author_handle || data?.authorHandle || data?.author?.handle || ""
    return handle.startsWith("@") ? handle : handle ? `@${handle}` : ""
  })(),
  avatarUrl: data?.avatar_url || data?.avatarUrl || data?.author?.avatar_url || "/placeholder.svg",
  content: data?.content || "",
  imageUrl: data?.image_url ?? data?.imageUrl ?? null,
  contextProfile: mapContextProfile(data?.context_profile || data?.contextProfile || {}),
  likes: data?.likes ?? data?.likes_count ?? 0,
  replyCount: data?.reply_count ?? data?.replyCount ?? 0,
  isLiked: Boolean(data?.is_liked),
  timestamp: data?.timestamp || data?.created_at || Date.now(),
})

export const mapComment = (data: any): Comment => ({
  id: String(data?.id ?? crypto.randomUUID()),
  author: mapUser(data?.author),
  content: data?.content || "",
  timestamp: data?.timestamp || data?.created_at || Date.now(),
  isAiResponse: data?.is_ai_response ?? data?.isAiResponse,
  replyToId: data?.reply_to_id ?? data?.replyToId,
})

export const mapNotification = (data: any): Notification => ({
  id: String(data?.id ?? crypto.randomUUID()),
  type: data?.type,
  user: mapUser(data?.user),
  postPreview: data?.post_preview || data?.postPreview,
  timestamp: data?.timestamp || data?.created_at || Date.now(),
  read: Boolean(data?.read ?? data?.is_read ?? false),
})

export const mapSpaceParticipant = (data: any): SpaceParticipant => ({
  user: mapUser(data?.user),
  role: data?.role,
  isMuted: Boolean(data?.is_muted),
  isSpeaking: Boolean(data?.is_speaking),
  handRaised: Boolean(data?.hand_raised),
})

export const mapSpace = (data: any): Space => ({
  id: String(data?.id ?? crypto.randomUUID()),
  title: data?.title || "",
  description: data?.description || "",
  tags: data?.tags || [],
  host: mapUser(data?.host),
  participants: Array.isArray(data?.participants) ? data.participants.map(mapSpaceParticipant) : [],
  isActive: Boolean(data?.is_active ?? data?.isActive ?? true),
  startedAt: data?.started_at || data?.startedAt,
  listenerCount: data?.listener_count ?? data?.listenerCount ?? data?.participants?.length ?? 0,
})

export const mapSpaceMessage = (data: any): SpaceMessage => ({
  id: String(data?.id ?? crypto.randomUUID()),
  user: mapUser(data?.user),
  content: data?.content || "",
  timestamp: data?.timestamp || data?.created_at || Date.now(),
})
