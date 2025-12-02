import type React from "react"
import type { Notification } from "@/types"
import { Heart, MessageSquare, User, AtSign, Bell } from "lucide-react"

interface NotificationsViewProps {
  notifications: Notification[]
}

export const NotificationsView: React.FC<NotificationsViewProps> = ({ notifications }) => {
  const getIcon = (type: string) => {
    switch (type) {
      case "like":
        return <Heart size={20} className="text-pink-600" fill="currentColor" />
      case "reply":
        return <MessageSquare size={20} className="text-indigo-500" fill="currentColor" />
      case "follow":
        return <User size={20} className="text-indigo-600" fill="currentColor" />
      case "mention":
        return <AtSign size={20} className="text-emerald-500" />
      default:
        return <Bell size={20} className="text-slate-400" />
    }
  }

  return (
    <div className="min-h-screen">
      <div className="sticky top-0 z-10 bg-white/80 dark:bg-slate-950/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 p-4 transition-colors">
        <h1 className="font-bold text-xl text-slate-900 dark:text-slate-100">Notifications</h1>
      </div>

      <div className="divide-y divide-slate-200 dark:divide-slate-800">
        {notifications.map((notif) => (
          <div
            key={notif.id}
            className={`p-4 hover:bg-slate-50 dark:hover:bg-slate-900/50 transition-colors flex gap-4 ${!notif.read ? "bg-indigo-50/50 dark:bg-slate-900/20" : ""}`}
          >
            <div className="pt-1 flex-shrink-0">{getIcon(notif.type)}</div>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <img
                  src={notif.user.avatarUrl || "/placeholder.svg"}
                  alt={notif.user.name}
                  className="w-8 h-8 rounded-full"
                />
                <p className="text-slate-900 dark:text-slate-100">
                  <span className="font-bold hover:underline cursor-pointer">{notif.user.name}</span>
                  <span className="text-slate-500 ml-1">
                    {notif.type === "like" && "liked your post"}
                    {notif.type === "reply" && "replied to your post"}
                    {notif.type === "follow" && "followed you"}
                    {notif.type === "mention" && "mentioned you"}
                  </span>
                </p>
              </div>
              {notif.postPreview && (
                <p className="text-slate-600 dark:text-slate-400 text-sm mt-1 line-clamp-2">"{notif.postPreview}"</p>
              )}
            </div>
          </div>
        ))}
        {notifications.length === 0 && (
          <div className="p-8 text-center text-slate-500">
            <Bell size={48} className="mx-auto mb-4 opacity-20" />
            <p>No notifications yet.</p>
          </div>
        )}
      </div>
    </div>
  )
}
