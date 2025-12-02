"use client"

import type React from "react"
import type { AppView } from "@/types"

interface SidebarLinkProps {
  icon: React.ComponentType<any>
  label: string
  view?: AppView
  active?: boolean
  onClick: () => void
}

export const SidebarLink: React.FC<SidebarLinkProps> = ({ icon: Icon, label, active = false, onClick }) => (
  <div
    onClick={onClick}
    className={`flex items-center gap-4 p-3 rounded-full cursor-pointer transition-all duration-200 ${
      active
        ? "font-bold text-slate-900 dark:text-white bg-slate-100 dark:bg-transparent"
        : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-950 hover:text-indigo-600 dark:hover:text-indigo-400"
    }`}
  >
    <Icon size={26} fill={active ? "currentColor" : "none"} />
    <span className="text-xl hidden xl:block">{label}</span>
  </div>
)
