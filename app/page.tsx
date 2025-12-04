"use client"

import { useState, useEffect, useMemo } from "react"
import { User, Bell, PenTool, Search, LogOut, Settings, Home, Radio } from "lucide-react"
import { CURRENT_USER } from "@/constants"
import { type Post, AppView, type User as UserType, type ContextProfile, type Message } from "@/types"
import { ComposeFlow } from "@/components/ComposeFlow"
import { InteractionModal } from "@/components/InteractionModal"
import { Button } from "@/components/Button"
import { ProfileView } from "@/components/ProfileView"
import { NotificationsView } from "@/components/NotificationsView"
import { ExploreView } from "@/components/ExploreView"
import { LoginView } from "@/components/LoginView"
import { Logo } from "@/components/Logo"
import { DisplayModal } from "@/components/DisplayModal"
import { apiFetch } from "@/lib/api"
import { getStorageItem, setStorageItem } from "@/lib/client-storage"
import { FeedView } from "@/components/FeedView"
import { SidebarLink } from "@/components/SidebarLink"
import { AiChatModal } from "@/components/AiChatModal"
import { ContextProfileModal } from "@/components/ContextProfileModal"
import { OnboardingFlow } from "@/components/OnBoardingFlow"
import { SpaceCreationModal } from "@/components/SpaceCreationModal"
import { ActiveSpaceView } from "@/components/ActiveSpaceView"
import { SpaceMinPlayer } from "@/components/SpaceMinPlayer"
import { useAppDispatch, useAppSelector } from "@/store/hooks"
import {
  login,
  signup,
  fetchCurrentUser,
  logout as logoutAction,
  setUser,
  loginWithGoogle,
  loadStoredTokens,
  setTokens,
} from "@/store/authSlice"
import { fetchFeed, toggleLike, createPost, searchPosts, clearSearch, fetchUserPosts } from "@/store/postsSlice"
import { fetchNotifications } from "@/store/notificationsSlice"
import {
  createSpace as createSpaceAction,
  endSpace as endSpaceAction,
  setCurrentSpace as setCurrentSpaceAction,
  fetchSpaces,
  leaveSpace,
} from "@/store/spacesSlice"
import { fetchFollowing, followUser, unfollowUser } from "@/store/usersSlice"

const onboardingFlagKey = (user?: UserType | null) => (user?.id ? `discuzz:onboarded:${user.id}` : null)

const hasCompletedOnboarding = (user?: UserType | null) => {
  if (!user) return false
  if (user.onboardingComplete) return true
  if (Array.isArray(user.interests) && user.interests.length > 0) return true

  const key = onboardingFlagKey(user)
  return key ? getStorageItem(key) === "true" : false
}

const rememberOnboardingCompletion = (user?: UserType | null) => {
  const key = onboardingFlagKey(user)
  if (key) {
    setStorageItem(key, "true")
  }
}

export default function AppPage() {
  const dispatch = useAppDispatch()
  const { user: authUser, accessToken } = useAppSelector((state) => state.auth)
  const postsState = useAppSelector((state) => state.posts)
  const notificationsState = useAppSelector((state) => state.notifications)
  const usersState = useAppSelector((state) => state.users)
  const spacesState = useAppSelector((state) => state.spaces)

  const [isOnboarding, setIsOnboarding] = useState(false)
  const [isSavingOnboarding, setIsSavingOnboarding] = useState(false)
  const [theme, setTheme] = useState<"light" | "dark">("dark")

  const [activeView, setActiveView] = useState<AppView>(AppView.FEED)
  const [feedTab, setFeedTab] = useState<"foryou" | "following">("foryou")
  const [interaction, setInteraction] = useState<{ post: Post; mode: "comment" | "askAi" | "context" } | null>(null)
  const [isComposeOpen, setIsComposeOpen] = useState(false)
  const [isDisplayModalOpen, setIsDisplayModalOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")

  const [isSpaceCreationOpen, setIsSpaceCreationOpen] = useState(false)
  const [isSpaceMinimized, setIsSpaceMinimized] = useState(false)

  const isLoggedIn = Boolean(accessToken)
  const currentUser: UserType = authUser || CURRENT_USER
  const followingSet = useMemo(() => new Set(usersState.followingHandles), [usersState.followingHandles])
  const baseForYouPosts = postsState.feeds.foryou.items
  const personalizedForYouPosts = useMemo(() => {
    const interests = authUser?.interests || []
    if (!interests.length) return baseForYouPosts

    const keywords = interests.map((interest) => interest.toLowerCase())
    const matched: Post[] = []
    const remaining: Post[] = []

    baseForYouPosts.forEach((post) => {
      const haystack = `${post.content} ${post.contextProfile.intent} ${post.contextProfile.assumptions} ${post.contextProfile.coreArgument}`.toLowerCase()
      if (keywords.some((kw) => haystack.includes(kw))) {
        matched.push(post)
      } else {
        remaining.push(post)
      }
    })

    return [...matched, ...remaining]
  }, [baseForYouPosts, authUser?.interests])

  const feedPosts = feedTab === "foryou" ? personalizedForYouPosts : postsState.feeds.following.items
  const explorePosts = searchQuery ? postsState.searchResults : personalizedForYouPosts
  const notifications = notificationsState.items
  const currentSpace = spacesState.currentSpace

  useEffect(() => {
    const saved = getStorageItem("discuzz-theme")
    if (saved === "light" || saved === "dark") {
      setTheme(saved)
    }
  }, [])

  useEffect(() => {
    setStorageItem("discuzz-theme", theme)
  }, [theme])

  useEffect(() => {
    dispatch(fetchFeed({ feed: "foryou" }))
    dispatch(fetchSpaces())
  }, [dispatch])

  useEffect(() => {
    const storedTokens = loadStoredTokens()
    if (storedTokens) {
      dispatch(setTokens(storedTokens))
    }
  }, [dispatch])

  useEffect(() => {
    if (
      feedTab === "following" &&
      postsState.feeds.following.items.length === 0 &&
      !postsState.feeds.following.loading
    ) {
      dispatch(fetchFeed({ feed: "following" }))
    }
  }, [feedTab, postsState.feeds.following.items.length, postsState.feeds.following.loading, dispatch])

  useEffect(() => {
    if (searchQuery.trim()) {
      dispatch(searchPosts(searchQuery))
    } else {
      dispatch(clearSearch())
    }
  }, [searchQuery, dispatch])

  useEffect(() => {
    if (accessToken && !authUser) {
      dispatch(fetchCurrentUser())
    }
  }, [accessToken, authUser, dispatch])

  useEffect(() => {
    if (!isLoggedIn || !authUser) return
    const needsOnboarding = !hasCompletedOnboarding(authUser)
    setIsOnboarding(needsOnboarding)
    if (!needsOnboarding) {
      rememberOnboardingCompletion(authUser)
    }
  }, [authUser, isLoggedIn])

  useEffect(() => {
    if (authUser?.handle) {
      dispatch(fetchFollowing(authUser.handle))
      dispatch(fetchUserPosts(authUser.handle))
      if (accessToken) {
        dispatch(fetchNotifications())
      }
    }
  }, [authUser?.handle, accessToken, dispatch])

  useEffect(() => {
    if (activeView === AppView.NOTIFICATIONS && isLoggedIn) {
      dispatch(fetchNotifications())
    }
  }, [activeView, isLoggedIn, dispatch])

  const handleLogin = async ({ email, password }: { email: string; password: string }) => {
    try {
      const result = await dispatch(login({ email, password })).unwrap()
      const needsOnboarding = !hasCompletedOnboarding(result.user)
      setIsOnboarding(needsOnboarding)
      if (!needsOnboarding) {
        rememberOnboardingCompletion(result.user)
      }
    } catch (e) {
      console.error("Login failed", e)
    }
  }

  const handleSignup = async ({ email, password }: { email: string; password: string }) => {
    try {
      const result = await dispatch(signup({ email, password })).unwrap()
      const needsOnboarding = !hasCompletedOnboarding(result.user)
      setIsOnboarding(needsOnboarding)
      if (!needsOnboarding) {
        rememberOnboardingCompletion(result.user)
      }
    } catch (e) {
      console.error("Signup failed", e)
    }
  }

  const handleGoogleLogin = async (idToken: string) => {
    try {
      const result = await dispatch(loginWithGoogle({ idToken })).unwrap()
      const needsOnboarding = !hasCompletedOnboarding(result.user)
      setIsOnboarding(needsOnboarding)
      if (!needsOnboarding) {
        rememberOnboardingCompletion(result.user)
      }
    } catch (e) {
      console.error("Google login failed", e)
    }
  }

  const handleOnboardingComplete = async (payload: {
    user: UserType
    following: Set<string>
    interests: string[]
    languages: string[]
  }) => {
    if (!accessToken || isSavingOnboarding) return

    setIsSavingOnboarding(true)
    const primaryLanguage = payload.languages[0]

    try {
      await apiFetch("/users/me", {
        method: "PATCH",
        token: accessToken,
        body: JSON.stringify({
          name: payload.user.name,
          bio: payload.user.bio,
          location: payload.user.location,
          avatar_url: payload.user.avatarUrl,
          language: primaryLanguage,
        }),
      })

      await apiFetch("/users/me/interests", {
        method: "PUT",
        token: accessToken,
        body: JSON.stringify({
          languages:
            payload.languages.length > 0
              ? payload.languages
              : primaryLanguage
                ? [primaryLanguage]
                : [],
          topics: payload.interests,
        }),
      })

      await dispatch(fetchCurrentUser()).unwrap()
      payload.following.forEach((handle) => dispatch(followUser(handle)))
      rememberOnboardingCompletion(payload.user)
      setIsOnboarding(false)
      window.scrollTo({ top: 0, behavior: "smooth" })
    } catch (e) {
      console.error("Onboarding save failed", e)
    } finally {
      setIsSavingOnboarding(false)
    }
  }

  const handlePublish = async (payload: {
    content: string
    imageUrl?: string | null
    contextProfile: ContextProfile
    interviewHistory: Message[]
  }) => {
    try {
      await dispatch(
        createPost({
          content: payload.content,
          imageUrl: payload.imageUrl || undefined,
          interviewHistory: payload.interviewHistory,
          contextProfile: payload.contextProfile,
        }),
      ).unwrap()
      setIsComposeOpen(false)
      setActiveView(AppView.FEED)
      setFeedTab("foryou")
      if (typeof window !== "undefined") {
        window.scrollTo({ top: 0, behavior: "smooth" })
      }
    } catch (e) {
      console.error("Publish failed", e)
    }
  }

  const handleLike = (postId: string) => {
    const post =
      postsState.feeds.foryou.items.find((p) => p.id === postId) ||
      postsState.feeds.following.items.find((p) => p.id === postId)
    dispatch(toggleLike({ postId, isLiked: Boolean(post?.isLiked) }))
  }

  const handleToggleFollow = async (handle: string) => {
    const normalized = handle.startsWith("@") ? handle : `@${handle}`
    const isFollowing = followingSet.has(normalized.toLowerCase())
    try {
      if (isFollowing) {
        await dispatch(unfollowUser(normalized)).unwrap()
        if (currentUser.stats) {
          dispatch(
            setUser({
              ...currentUser,
              stats: { ...currentUser.stats, following: Math.max(0, currentUser.stats.following - 1) },
            }),
          )
        }
      } else {
        await dispatch(followUser(normalized)).unwrap()
        if (currentUser.stats) {
          dispatch(
            setUser({
              ...currentUser,
              stats: { ...currentUser.stats, following: currentUser.stats.following + 1 },
            }),
          )
        }
      }
    } catch (e) {
      console.error("Follow action failed", e)
    }
  }

  const handleUpdateProfile = (updatedUser: UserType) => {
    dispatch(setUser({ ...currentUser, ...updatedUser }))
  }

  const handleLogout = () => {
    dispatch(logoutAction())
    setActiveView(AppView.FEED)
    setIsOnboarding(false)
  }

  const openInteraction = (post: Post, mode: "comment" | "askAi" | "context" = "comment") => {
    setInteraction({ post, mode })
  }

  const handleStartSpace = (title: string, tags: string[]) => {
    dispatch(createSpaceAction({ title, description: undefined, tags }))
    setIsSpaceCreationOpen(false)
    setIsSpaceMinimized(false)
  }

  const handleEndSpace = () => {
    if (currentSpace) {
      dispatch(endSpaceAction(currentSpace.id))
    }
    dispatch(setCurrentSpaceAction(null))
    setIsSpaceMinimized(false)
  }

  const handleLeaveSpace = () => {
    if (currentSpace) {
      dispatch(leaveSpace(currentSpace.id))
    }
    dispatch(setCurrentSpaceAction(null))
    setIsSpaceMinimized(false)
  }

  const normalizedHandle = (currentUser.handle || "").toLowerCase()
  const profilePosts =
    postsState.userPosts[currentUser.handle] ||
    postsState.userPosts[normalizedHandle] ||
    postsState.feeds.foryou.items.filter((p) => p.authorHandle.toLowerCase() === normalizedHandle)

  const followUsersList = useMemo(
    () =>
      usersState.followingHandles
        .map((handle) => usersState.profiles[handle] || usersState.profiles[handle.toLowerCase()])
        .filter(Boolean) as UserType[],
    [usersState.followingHandles, usersState.profiles],
  )

  const renderContent = () => {
    switch (activeView) {
      case AppView.PROFILE:
        return (
          <ProfileView
            user={currentUser}
            posts={profilePosts}
            onInteract={(p) => openInteraction(p, "comment")}
            onComment={(p) => openInteraction(p, "comment")}
            onAskAi={(p) => openInteraction(p, "askAi")}
            onViewContext={(p) => openInteraction(p, "context")}
            onLike={handleLike}
            onLogout={handleLogout}
            onUpdateProfile={handleUpdateProfile}
            followingSet={followingSet}
            onToggleFollow={handleToggleFollow}
            followUsers={followUsersList}
          />
        )
      case AppView.NOTIFICATIONS:
        return <NotificationsView notifications={notifications} />
      case AppView.EXPLORE:
        return (
          <ExploreView
            posts={explorePosts}
            onInteract={(p) => openInteraction(p, "comment")}
            onLike={handleLike}
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            onAskAi={(p) => openInteraction(p, "askAi")}
            onViewContext={(p) => openInteraction(p, "context")}
          />
        )
      case AppView.FEED:
      default:
        return (
          <FeedView
            currentUser={currentUser}
            feedTab={feedTab}
            posts={feedPosts}
            onTabChange={setFeedTab}
            onInteract={(post) => openInteraction(post, "comment")}
            onComment={(post) => openInteraction(post, "comment")}
            onAskAi={(post) => openInteraction(post, "askAi")}
            onViewContext={(post) => openInteraction(post, "context")}
            onLike={handleLike}
            onCompose={() => setIsComposeOpen(true)}
            onExplore={() => setActiveView(AppView.EXPLORE)}
            onOpenProfile={() => setActiveView(AppView.PROFILE)}
          />
        )
    }
  }

  if (!isLoggedIn) {
    return (
      <div className={theme}>
        <LoginView onLogin={handleLogin} onSignup={handleSignup} onGoogleLogin={handleGoogleLogin} />
      </div>
    )
  }
  // Show Onboarding Flow if active
  if (isOnboarding) {
      return (
        <div className={theme}>
           <OnboardingFlow 
              initialUser={currentUser} 
              onComplete={handleOnboardingComplete}
              isSaving={isSavingOnboarding}
           />
        </div>
      );
  }
  return (
    <div className={theme}>
      <div className="min-h-screen bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex justify-center transition-colors">
        {/* Left Sidebar (Desktop) */}
        <header className="hidden md:flex flex-col w-[80px] xl:w-[275px] h-screen fixed left-0 top-0 border-r border-slate-200 dark:border-slate-800 p-4 justify-between z-20 bg-white dark:bg-slate-950 transition-colors">
          <div className="space-y-6">
            <div
              className="px-3 py-2 cursor-pointer hover:scale-105 transition-transform origin-left w-fit"
              onClick={() => setActiveView(AppView.FEED)}
            >
              <Logo size={42} className="text-slate-900 dark:text-slate-100" />
            </div>

            <nav className="space-y-2">
              <SidebarLink icon={Home} label="Home" active={activeView === AppView.FEED} onClick={() => setActiveView(AppView.FEED)} />
              <SidebarLink icon={Search} label="Explore" active={activeView === AppView.EXPLORE} onClick={() => setActiveView(AppView.EXPLORE)} />

              <SidebarLink icon={Bell} label="Notifications" active={activeView === AppView.NOTIFICATIONS} onClick={() => setActiveView(AppView.NOTIFICATIONS)} />
              <SidebarLink icon={Radio} label="Spaces" onClick={() => setIsSpaceCreationOpen(true)} />
              <SidebarLink icon={User} label="Profile" active={activeView === AppView.PROFILE} onClick={() => setActiveView(AppView.PROFILE)} />
              <SidebarLink icon={Settings} label="Display" onClick={() => setIsDisplayModalOpen(true)} />
            </nav>

            <Button
              variant="accent"
              size="lg"
              className="w-full !rounded-full shadow-lg"
              onClick={() => setIsComposeOpen(true)}
            >
              <span className="hidden xl:inline">Start Discuzzion</span>
              <PenTool className="xl:hidden" size={24} />
            </Button>
          </div>

          <div
            className="flex items-center gap-3 p-3 hover:bg-slate-100 dark:hover:bg-slate-900 rounded-full cursor-pointer transition-colors group"
            onClick={handleLogout}
            title="Log Out"
          >
            <img src={currentUser.avatarUrl || "/placeholder.svg"} alt="Me" className="w-10 h-10 rounded-full" />
            <div className="hidden xl:block overflow-hidden">
              <p className="font-bold text-sm truncate text-slate-900 dark:text-slate-200">{currentUser.name}</p>
              <p className="text-slate-500 text-sm truncate">{currentUser.handle}</p>
            </div>
            <LogOut size={16} className="ml-auto text-slate-500 hidden xl:block group-hover:text-red-500" />
          </div>
        </header>

        {/* Main Content Area */}
        <main className="w-full md:ml-[80px] xl:ml-[275px] md:max-w-[600px] border-r border-slate-200 dark:border-slate-800 min-h-screen pb-20 md:pb-0 relative transition-colors">
          {/* Mobile Header (Main) - Always visible on mobile */}
          <div className="sticky top-0 z-20 bg-white/80 dark:bg-slate-950/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 p-4 flex justify-between items-center md:hidden transition-colors h-[64px]">
            <div className="cursor-pointer" onClick={() => setActiveView(AppView.FEED)}>
              <Logo size={32} className="text-slate-900 dark:text-slate-100" />
            </div>
            <img
              src={currentUser.avatarUrl || "/placeholder.svg"}
              alt="Me"
              className="w-8 h-8 rounded-full cursor-pointer"
              onClick={() => setActiveView(AppView.PROFILE)}
            />
          </div>

          {renderContent()}
        </main>

        {/* Right Sidebar (Trending/Search) - Only visible on large screens */}
        <aside className="hidden lg:block w-[350px] pl-8 py-4 h-screen sticky top-0 bg-white dark:bg-slate-950 transition-colors">
          <div className="bg-slate-100 dark:bg-slate-900 rounded-full p-3 flex items-center gap-3 mb-6 focus-within:ring-2 ring-indigo-500 transition-all group">
            <Search className="text-slate-500 group-focus-within:text-indigo-500" size={20} />
            <input
              type="text"
              placeholder="Search Discuzz.ai"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-transparent border-none focus:outline-none text-slate-900 dark:text-slate-200 w-full placeholder-slate-500"
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  setActiveView(AppView.EXPLORE)
                }
              }}
            />
          </div>

          <div className="bg-slate-50 dark:bg-slate-900 rounded-2xl p-4 mb-6 border border-slate-200 dark:border-slate-800">
            <h2 className="font-bold text-lg mb-4 text-slate-900 dark:text-slate-100">Trending Contexts</h2>
            {[
              { tag: "#AGIAlignment", count: "12.5K" },
              { tag: "#RemoteCulture", count: "8.2K" },
              { tag: "#Web3Identity", count: "5.1K" },
            ].map((topic, i) => (
              <div
                key={i}
                className="py-3 hover:bg-slate-100 dark:hover:bg-slate-800/50 cursor-pointer transition-colors px-2 rounded-lg"
                onClick={() => {
                  setSearchQuery(topic.tag)
                  setActiveView(AppView.EXPLORE)
                }}
              >
                <p className="text-xs text-slate-500">Technology · Trending</p>
                <p className="font-bold text-slate-900 dark:text-slate-200">{topic.tag}</p>
                <p className="text-xs text-slate-500">{topic.count} posts</p>
              </div>
            ))}
          </div>

          <div className="text-xs text-slate-500 px-4 leading-relaxed">
            &copy; 2025 Discuzz.ai. <br />
            Conversation Engine v1.0 <br />
            Powered by Google Gemini 2.5
          </div>
        </aside>

        {/* Mobile Bottom Nav */}
        <div className="fixed bottom-0 left-0 right-0 border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 p-4 flex justify-around md:hidden z-20 pb-6 safe-area-bottom transition-colors">
          <div
            onClick={() => setActiveView(AppView.FEED)}
            className={activeView === AppView.FEED ? "text-slate-900 dark:text-white" : "text-slate-500"}
          >
            <Home size={24} fill={activeView === AppView.FEED ? "currentColor" : "none"} />
          </div>
          <div
            onClick={() => setActiveView(AppView.EXPLORE)}
            className={activeView === AppView.EXPLORE ? "text-slate-900 dark:text-white" : "text-slate-500"}
          >
            <Search size={24} />
          </div>
          <div
            className="bg-indigo-500 p-3 rounded-full -mt-8 shadow-lg shadow-indigo-500/30 border-4 border-white dark:border-slate-950 cursor-pointer"
            onClick={() => setIsComposeOpen(true)}
          >
            <PenTool size={24} className="text-white" />
          </div>
          <div
            onClick={() => setActiveView(AppView.NOTIFICATIONS)}
            className={activeView === AppView.NOTIFICATIONS ? "text-slate-900 dark:text-white" : "text-slate-500"}
          >
            <Bell size={24} fill={activeView === AppView.NOTIFICATIONS ? "currentColor" : "none"} />
          </div>
          <div
            onClick={() => setActiveView(AppView.PROFILE)}
            className={activeView === AppView.PROFILE ? "text-slate-900 dark:text-white" : "text-slate-500"}
          >
            <User size={24} fill={activeView === AppView.PROFILE ? "currentColor" : "none"} />
          </div>
        </div>
                {/* Space Docked Player */}
        {currentSpace && isSpaceMinimized && (
            <SpaceMinPlayer 
                space={currentSpace} 
                onMaximize={() => setIsSpaceMinimized(false)}
                onClose={handleEndSpace}
            />
        )}

        {/* Full Screen Space View */}
        {currentSpace && !isSpaceMinimized && (
            <ActiveSpaceView 
                space={currentSpace} 
                currentUser={currentUser} 
                onMinimize={() => setIsSpaceMinimized(true)}
                onLeave={handleLeaveSpace}
                onEnd={handleEndSpace}
            />
        )}

        {/* Space Creation Modal */}
        {isSpaceCreationOpen && (
            <SpaceCreationModal 
                currentUser={currentUser}
                onClose={() => setIsSpaceCreationOpen(false)}
                onStartSpace={handleStartSpace}
            />
        )}
        {/* Modals */}
        {isComposeOpen && (
          <ComposeFlow currentUser={currentUser} onClose={() => setIsComposeOpen(false)} onPublish={handlePublish} />
        )}

        {interaction?.mode === "comment" && (
          <InteractionModal post={interaction.post} onClose={() => setInteraction(null)} />
        )}

        {interaction?.mode === "askAi" && (
          <AiChatModal post={interaction.post} onClose={() => setInteraction(null)} />
        )}

        {interaction?.mode === "context" && (
          <ContextProfileModal post={interaction.post} onClose={() => setInteraction(null)} />
        )}

        {isDisplayModalOpen && (
          <DisplayModal theme={theme} setTheme={setTheme} onClose={() => setIsDisplayModalOpen(false)} />
        )}
      </div>
    </div>
  )
}
