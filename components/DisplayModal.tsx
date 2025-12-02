"use client"

import type React from "react"
import { X, Check } from "lucide-react"
import { Button } from "./Button"

interface DisplayModalProps {
  theme: "light" | "dark"
  setTheme: (theme: "light" | "dark") => void
  onClose: () => void
}

export const DisplayModal: React.FC<DisplayModalProps> = ({ theme, setTheme, onClose }) => {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="bg-white dark:bg-slate-900 w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-center relative">
          <h2 className="font-bold text-xl text-slate-900 dark:text-white">Customize your view</h2>
          <button
            onClick={onClose}
            className="absolute right-4 p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 dark:text-slate-400 transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        <div className="p-8">
          <p className="text-center text-slate-500 dark:text-slate-400 mb-8">
            Manage your font size, color, and background. These settings affect all the Discuzz.ai accounts on this
            browser.
          </p>

          <div className="space-y-4">
            <h3 className="font-bold text-slate-500 text-sm uppercase tracking-wide">Background</h3>

            <div className="grid grid-cols-2 gap-4">
              <button
                onClick={() => setTheme("light")}
                className={`p-4 rounded-xl border-2 flex items-center gap-4 transition-all ${
                  theme === "light"
                    ? "border-indigo-500 bg-white shadow-lg"
                    : "border-slate-200 bg-white hover:bg-slate-50"
                }`}
              >
                <div
                  className={`w-5 h-5 rounded-full border border-slate-300 flex items-center justify-center ${theme === "light" ? "bg-indigo-500 border-indigo-500" : "bg-transparent"}`}
                >
                  {theme === "light" && <Check size={12} className="text-white" />}
                </div>
                <span className="font-bold text-slate-900">Default</span>
              </button>

              <button
                onClick={() => setTheme("dark")}
                className={`p-4 rounded-xl border-2 flex items-center gap-4 transition-all ${
                  theme === "dark"
                    ? "border-indigo-500 bg-slate-950 shadow-lg"
                    : "border-slate-700 bg-slate-900 hover:bg-slate-800"
                }`}
              >
                <div
                  className={`w-5 h-5 rounded-full border border-slate-600 flex items-center justify-center ${theme === "dark" ? "bg-indigo-500 border-indigo-500" : "bg-transparent"}`}
                >
                  {theme === "dark" && <Check size={12} className="text-white" />}
                </div>
                <span className="font-bold text-white">Lights out</span>
              </button>
            </div>
          </div>

          <div className="mt-8 flex justify-center">
            <Button variant="primary" onClick={onClose} className="px-8">
              Done
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
