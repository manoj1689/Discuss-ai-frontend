"use client"

import type React from "react"
import { useState } from "react"
import type { User, Post } from "@/types"
import { PostCard } from "./PostCard"
import { MapPin, Calendar, LinkIcon, LogOut, MessageSquare, Heart, Sparkles, X } from "lucide-react"
import { Button } from "./Button"
import { EditProfileModal } from "./EditProfileModal"

interface ProfileViewProps {
  user: User
  posts: Post[]
  followUsers?: User[]
  onInteract: (post: Post) => void
  onLike: (postId: string) => void
  onAskAi?: (post: Post) => void
  onViewContext?: (post: Post) => void
  onComment?: (post: Post) => void
  onLogout?: () => void
  onUpdateProfile: (user: User) => void
  followingSet: Set<string>
  onToggleFollow: (handle: string) => void
}

type Tab = "posts" | "replies" | "contexts" | "likes"

export const ProfileView: React.FC<ProfileViewProps> = ({
  user,
  posts,
  onInteract,
  onLike,
  onAskAi,
  onViewContext,
  onComment,
  onLogout,
  onUpdateProfile,
  followingSet,
  onToggleFollow,
  followUsers = [],
}) => {
  const [activeTab, setActiveTab] = useState<Tab>("posts")
  const [showFollowList, setShowFollowList] = useState<"followers" | "following" | null>(null)
  const [isEditingProfile, setIsEditingProfile] = useState(false)

  // Filter Logic
  const userPosts = posts.filter((p) => p.authorHandle === user.handle)
  const likedPosts = posts.filter((p) => p.isLiked)

  // Mock Replies
  const mockReplies = [
    {
      id: "r1",
      to: "@d_miller",
      content: "That's a bold claim. Have you considered the latency implications of such a model?",
      timestamp: Date.now() - 10000000,
    },
    {
      id: "r2",
      to: "@elena_ai",
      content: "Exactly. The collaboration metric is far more useful than the imitation metric.",
      timestamp: Date.now() - 50000000,
    },
  ]

  const getFollowUsers = () => {
    if (followUsers.length === 0) return []
    if (showFollowList === "following") {
      return followUsers.filter((u) => followingSet.has(u.handle.toLowerCase()) || followingSet.has(u.handle))
    }
    return followUsers
  }

  const followUsersList = getFollowUsers()

  // Components for specific tabs
  const ContextCard = ({ post }: { post: Post }) => (
    <div className="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 mb-4 hover:border-indigo-500/30 transition-colors">
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2">
          <Sparkles size={16} className="text-indigo-500 dark:text-indigo-400" />
          <h3 className="font-bold text-slate-800 dark:text-slate-200 text-sm uppercase tracking-wide">Context DNA</h3>
        </div>
        <span className="text-xs text-slate-600">{new Date(post.timestamp).toLocaleDateString()}</span>
      </div>

      <p className="text-slate-500 dark:text-slate-400 text-xs italic mb-4">
        Linked to post: "{post.content.substring(0, 50)}..."
      </p>

      <div className="grid grid-cols-1 gap-3">
        <div className="bg-white dark:bg-slate-950 p-3 rounded-lg border border-slate-100 dark:border-slate-800">
          <span className="text-xs text-indigo-500 dark:text-indigo-400 font-bold block mb-1">INTENT</span>
          <p className="text-sm text-slate-800 dark:text-slate-300">{post.contextProfile.intent}</p>
        </div>
        <div className="bg-white dark:bg-slate-950 p-3 rounded-lg border border-slate-100 dark:border-slate-800">
          <span className="text-xs text-indigo-500 dark:text-indigo-400 font-bold block mb-1">CORE ARGUMENT</span>
          <p className="text-sm text-slate-800 dark:text-slate-300">{post.contextProfile.coreArgument}</p>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-white dark:bg-slate-950 p-3 rounded-lg border border-slate-100 dark:border-slate-800">
            <span className="text-xs text-slate-500 font-bold block mb-1">TONE</span>
            <p className="text-sm text-slate-800 dark:text-slate-300">{post.contextProfile.tone}</p>
          </div>
          <div className="bg-white dark:bg-slate-950 p-3 rounded-lg border border-slate-100 dark:border-slate-800">
            <span className="text-xs text-slate-500 font-bold block mb-1">AUDIENCE</span>
            <p className="text-sm text-slate-800 dark:text-slate-300">{post.contextProfile.audience}</p>
          </div>
        </div>
      </div>
    </div>
  )

  return (
    <div className="min-h-screen pb-20 relative">
      {/* Banner */}
      <div className="h-32 md:h-48 bg-gradient-to-r from-indigo-900 via-slate-800 to-slate-900"></div>

      {/* Profile Header */}
      <div className="px-4 pb-4 -mt-16 md:-mt-20 relative">
        <div className="flex justify-between items-end mb-4">
          <img
            src={user.avatarUrl || "/placeholder.svg"}
            alt={user.name}
            className="w-32 h-32 md:w-40 md:h-40 rounded-full border-4 border-white dark:border-slate-950 object-cover bg-slate-800"
          />
          <div className="flex gap-2">
            {onLogout && (
              <Button
                variant="secondary"
                className="mb-4 rounded-full w-10 h-10 p-0 flex items-center justify-center md:hidden"
                onClick={onLogout}
              >
                <LogOut size={16} />
              </Button>
            )}
            <Button
              variant="secondary"
              className="mb-4 rounded-full font-bold"
              onClick={() => setIsEditingProfile(true)}
            >
              Edit Profile
            </Button>
          </div>
        </div>

        <div className="mb-6">
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            {user.name}
            {onLogout && (
              <button
                onClick={onLogout}
                className="p-1.5 text-slate-500 hover:text-red-500 rounded-full hover:bg-slate-100 dark:hover:bg-slate-900 transition-colors hidden md:block"
                title="Log Out"
              >
                <LogOut size={16} />
              </button>
            )}
          </h1>
          <p className="text-slate-500 mb-3">{user.handle}</p>
          <p className="text-slate-700 dark:text-slate-200 mb-4 leading-relaxed max-w-lg">
            {user.bio || "No bio available."}
          </p>

          <div className="flex flex-wrap gap-4 text-slate-500 text-sm mb-4">
            {user.location && (
              <div className="flex items-center gap-1">
                <MapPin size={16} />
                <span>{user.location}</span>
              </div>
            )}
            {user.website && (
              <div className="flex items-center gap-1">
                <LinkIcon size={16} />
                <a
                  href={`https://${user.website}`}
                  target="_blank"
                  rel="noreferrer"
                  className="text-indigo-500 dark:text-indigo-400 hover:underline"
                >
                  {user.website}
                </a>
              </div>
            )}
            <div className="flex items-center gap-1">
              <Calendar size={16} />
              <span>Joined March 2024</span>
            </div>
          </div>

          <div className="flex gap-4 text-sm">
            <button
              onClick={() => setShowFollowList("following")}
              className="flex gap-1 hover:underline cursor-pointer group"
            >
              <span className="font-bold text-slate-900 dark:text-white group-hover:text-indigo-500 dark:group-hover:text-indigo-400">
                {user.stats?.following || 0}
              </span>
              <span className="text-slate-500">Following</span>
            </button>
            <button
              onClick={() => setShowFollowList("followers")}
              className="flex gap-1 hover:underline cursor-pointer group"
            >
              <span className="font-bold text-slate-900 dark:text-white group-hover:text-indigo-500 dark:group-hover:text-indigo-400">
                {user.stats?.followers || 0}
              </span>
              <span className="text-slate-500">Followers</span>
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-slate-200 dark:border-slate-800 mb-4 overflow-x-auto no-scrollbar">
          {(["posts", "replies", "contexts", "likes"] as Tab[]).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-3 font-medium text-sm capitalize whitespace-nowrap transition-colors border-b-2 ${
                activeTab === tab
                  ? "border-indigo-500 text-slate-900 dark:text-white"
                  : "border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-900/50"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
          {activeTab === "posts" && (
            <div>
              {userPosts.length > 0 ? (
                userPosts.map((post) => (
                  <div key={post.id} className="-mx-4 md:mx-0">
                    <PostCard
                      post={post}
                      onInteract={onInteract}
                      onComment={onComment}
                      onAskAi={onAskAi}
                      onViewContext={onViewContext}
                      onLike={onLike}
                    />
                  </div>
                ))
              ) : (
                <div className="text-center py-10 text-slate-500">
                  <p>No posts yet.</p>
                </div>
              )}
            </div>
          )}

          {activeTab === "replies" && (
            <div className="space-y-4">
              {mockReplies.map((reply) => (
                <div
                  key={reply.id}
                  className="bg-slate-50 dark:bg-slate-900/50 p-4 rounded-xl border border-slate-200 dark:border-slate-800"
                >
                  <div className="text-xs text-slate-500 mb-2 flex items-center gap-2">
                    <MessageSquare size={12} />
                    <span>
                      Replying to <span className="text-indigo-500 dark:text-indigo-400">{reply.to}</span>
                    </span>
                  </div>
                  <p className="text-slate-800 dark:text-slate-300">{reply.content}</p>
                </div>
              ))}
              <div className="text-center py-4 text-xs text-slate-600">Older replies are archived.</div>
            </div>
          )}

          {activeTab === "contexts" && (
            <div>
              {userPosts.length > 0 ? (
                userPosts.map((post) => <ContextCard key={post.id} post={post} />)
              ) : (
                <div className="text-center py-10 text-slate-500">
                  <Sparkles className="mx-auto mb-2 opacity-20" size={32} />
                  <p>No contexts generated yet.</p>
                </div>
              )}
            </div>
          )}

          {activeTab === "likes" && (
            <div>
              {likedPosts.length > 0 ? (
                likedPosts.map((post) => (
                  <div key={post.id} className="-mx-4 md:mx-0">
                    <PostCard
                      post={post}
                      onInteract={onInteract}
                      onComment={onComment}
                      onAskAi={onAskAi}
                      onViewContext={onViewContext}
                      onLike={onLike}
                    />
                  </div>
                ))
              ) : (
                <div className="text-center py-10 text-slate-500">
                  <Heart className="mx-auto mb-2 opacity-20" size={32} />
                  <p>No liked posts yet.</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Followers/Following Modal */}
      {showFollowList && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
          onClick={() => setShowFollowList(null)}
        >
          <div
            className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 w-full max-w-sm rounded-2xl overflow-hidden shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center bg-white/95 dark:bg-slate-900/95">
              <h3 className="font-bold text-slate-900 dark:text-white capitalize">{showFollowList}</h3>
              <button
                onClick={() => setShowFollowList(null)}
                className="p-1 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors"
              >
                <X size={20} className="text-slate-500" />
              </button>
            </div>
            <div className="p-0 h-80 overflow-y-auto">
              {followUsersList.length > 0 ? (
                followUsersList.map((listUser, i) => {
                  const isFollowing = followingSet.has(listUser.handle)
                  return (
                    <div
                      key={i}
                      className="flex items-center gap-3 p-4 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors border-b border-slate-100 dark:border-slate-800/50"
                    >
                      <img
                        src={listUser.avatarUrl || "/placeholder.svg"}
                        alt={listUser.name}
                        className="w-10 h-10 rounded-full object-cover"
                      />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1">
                          <p className="font-bold text-sm text-slate-900 dark:text-slate-200 truncate">
                            {listUser.name}
                          </p>
                        </div>
                        <p className="text-xs text-slate-500 truncate">{listUser.handle}</p>
                        <p className="text-xs text-slate-400 truncate mt-0.5">{listUser.bio}</p>
                      </div>
                      <Button
                        variant={isFollowing ? "secondary" : "primary"}
                        size="sm"
                        className="h-8 px-3 text-xs"
                        onClick={() => onToggleFollow(listUser.handle)}
                      >
                        {isFollowing ? "Unfollow" : "Follow"}
                      </Button>
                    </div>
                  )
                })
              ) : (
                <div className="p-8 text-center text-slate-500">
                  <p>You aren't following anyone yet.</p>
                </div>
              )}

              {followUsersList.length > 0 && <div className="p-4 text-center text-xs text-slate-600">End of list.</div>}
            </div>
          </div>
        </div>
      )}

      {/* Edit Profile Modal */}
      {isEditingProfile && (
        <EditProfileModal
          user={user}
          onClose={() => setIsEditingProfile(false)}
          onSave={(u) => {
            onUpdateProfile(u)
            setIsEditingProfile(false)
          }}
        />
      )}
    </div>
  )
}
