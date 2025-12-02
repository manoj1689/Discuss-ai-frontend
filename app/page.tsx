"use client"

import { useState, useEffect } from "react"
import { User, Bell, PenTool, Search, LogOut, Settings, Home, Radio } from "lucide-react"
import { MOCK_POSTS, CURRENT_USER, MOCK_NOTIFICATIONS, MOCK_USERS } from "@/constants"
import { type Post, AppView, type User as UserType } from "@/types"
import { ComposeFlow } from "@/components/ComposeFlow"
import { InteractionModal } from "@/components/InteractionModal"
import { Button } from "@/components/Button"
import { ProfileView } from "@/components/ProfileView"
import { NotificationsView } from "@/components/NotificationsView"
import { ExploreView } from "@/components/ExploreView"
import { LoginView } from "@/components/LoginView"
import { Logo } from "@/components/Logo"
import { DisplayModal } from "@/components/DisplayModal"
import { getStorageItem, setStorageItem } from "@/lib/client-storage"
import { FeedView } from "@/components/FeedView"
import { SidebarLink } from "@/components/SidebarLink"
import { AiChatModal } from "@/components/AiChatModal"
import { ContextProfileModal } from "@/components/ContextProfileModal"
import { OnboardingFlow } from "@/components/OnBoardingFlow"
import { SpaceCreationModal } from "@/components/SpaceCreationModal"
import { ActiveSpaceView } from "@/components/ActiveSpaceView"
import { SpaceMinPlayer } from "@/components/SpaceMinPlayer"

export default function AppPage() {
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  // Onboarding State
  const [isOnboarding, setIsOnboarding] = useState(false);
  // Theme State
  const [theme, setTheme] = useState<"light" | "dark">("dark")

  useEffect(() => {
    const saved = getStorageItem("discuzz-theme")
    if (saved === "light" || saved === "dark") {
      setTheme(saved)
    }
  }, [])

  useEffect(() => {
    setStorageItem("discuzz-theme", theme)
  }, [theme])

  // App Data State
  const [currentUser, setCurrentUser] = useState<UserType>(CURRENT_USER)
  const [posts, setPosts] = useState<Post[]>(MOCK_POSTS)
  const [notifications] = useState(MOCK_NOTIFICATIONS)

  // Follow State
  const [followingSet, setFollowingSet] = useState<Set<string>>(() => {
    return new Set(MOCK_USERS.slice(0, 3).map((u) => u.handle))
  })

  // UI State
  const [activeView, setActiveView] = useState<AppView>(AppView.FEED)
  const [feedTab, setFeedTab] = useState<"foryou" | "following">("foryou")
  const [interaction, setInteraction] = useState<{ post: Post; mode: "comment" | "askAi" | "context" } | null>(null)
  const [isComposeOpen, setIsComposeOpen] = useState(false)
  const [isDisplayModalOpen, setIsDisplayModalOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")

    // --- Spaces State ---
  const [isSpaceCreationOpen, setIsSpaceCreationOpen] = useState(false);
  const [currentSpace, setCurrentSpace] = useState<Space | null>(null);
  const [isSpaceMinimized, setIsSpaceMinimized] = useState(false);

  const handleLogin = () => {
    setIsLoggedIn(true)
    // Start Onboarding after login
    setIsOnboarding(true)
  }

  const handleOnboardingComplete = (updatedUser: UserType, initialFollowing: Set<string>) => {
    setCurrentUser((prev) => ({
      ...updatedUser,
      stats: {
        ...prev.stats!,
        following: initialFollowing.size,
      },
    }))
    
    // Merge initial following set with new choices, or just set it
    // For this flow, we'll respect the onboarding choices primarily
    const mergedFollowing = new Set([...followingSet, ...initialFollowing])
    setFollowingSet(mergedFollowing)
    
    setIsOnboarding(false)
    window.scrollTo({ top: 0, behavior: "smooth" })
  }

  
  const handlePublish = (newPost: Post) => {
    setPosts([newPost, ...posts])
    setIsComposeOpen(false)
    setActiveView(AppView.FEED)
    setFeedTab("foryou")
    if (typeof window !== "undefined") {
      window.scrollTo({ top: 0, behavior: "smooth" })
    }
  }

  const handleLike = (postId: string) => {
    setPosts(
      posts.map((post) => {
        if (post.id === postId) {
          const isLiked = !post.isLiked
          return {
            ...post,
            isLiked,
            likes: post.likes + (isLiked ? 1 : -1),
          }
        }
        return post
      }),
    )
  }

  const handleToggleFollow = (handle: string) => {
    const newFollowing = new Set(followingSet)
    let isFollowing = false

    if (newFollowing.has(handle)) {
      newFollowing.delete(handle)
      isFollowing = false
    } else {
      newFollowing.add(handle)
      isFollowing = true
    }

    setFollowingSet(newFollowing)

    setCurrentUser((prev) => ({
      ...prev,
      stats: {
        ...prev.stats!,
        following: prev.stats!.following + (isFollowing ? 1 : -1),
      },
    }))
  }

  const handleUpdateProfile = (updatedUser: UserType) => {
    setCurrentUser(updatedUser)
  }

  const handleLogout = () => {
    setIsLoggedIn(false)
    setActiveView(AppView.FEED)
  }

  const openInteraction = (post: Post, mode: "comment" | "askAi" | "context" = "comment") => {
    setInteraction({ post, mode })
  }
  // --- Spaces Logic ---
  const handleStartSpace = (title: string, tags: string[]) => {
      // Create Mock Participants
      const participants: SpaceParticipant[] = [
          { user: currentUser, role: 'host', isMuted: false, isSpeaking: true },
          ...MOCK_USERS.slice(0, 2).map(u => ({ user: u, role: 'speaker', isMuted: true, isSpeaking: false } as SpaceParticipant)),
          ...MOCK_USERS.slice(2).map(u => ({ user: u, role: 'listener', isMuted: true, isSpeaking: false } as SpaceParticipant))
      ];

      const newSpace: Space = {
          id: Date.now().toString(),
          title,
          tags,
          hostId: currentUser.handle,
          participants,
          isActive: true,
          startedAt: Date.now()
      };

      setCurrentSpace(newSpace);
      setIsSpaceCreationOpen(false);
      setIsSpaceMinimized(false);
  };

  const handleEndSpace = () => {
      setCurrentSpace(null);
      setIsSpaceMinimized(false);
  };

  const renderContent = () => {
    switch (activeView) {
      case AppView.PROFILE:
        return (
          <ProfileView
            user={currentUser}
            posts={posts}
            onInteract={(p) => openInteraction(p, "comment")}
            onComment={(p) => openInteraction(p, "comment")}
            onAskAi={(p) => openInteraction(p, "askAi")}
            onViewContext={(p) => openInteraction(p, "context")}
            onLike={handleLike}
            onLogout={handleLogout}
            onUpdateProfile={handleUpdateProfile}
            followingSet={followingSet}
            onToggleFollow={handleToggleFollow}
          />
        )
      case AppView.NOTIFICATIONS:
        return <NotificationsView notifications={notifications} />
      case AppView.EXPLORE:
        return (
          <ExploreView
            posts={posts}
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
            posts={posts}
            followingSet={followingSet}
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
        <LoginView onLogin={handleLogin} />
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
                onLeave={() => {
                    // Logic to remove user from participants
                    handleEndSpace();
                }}
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
