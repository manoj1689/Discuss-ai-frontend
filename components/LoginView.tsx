import React, { useState } from "react"
import { X } from "lucide-react"
import { Logo } from "./Logo"
import { hasFirebaseConfig, signInWithGoogleFirebase } from "@/lib/firebaseClient"

interface LoginViewProps {
  onLogin: (payload: { email: string; password: string }) => Promise<void> | void
  onSignup: (payload: { email: string; password: string }) => Promise<void> | void
  onGoogleLogin: (idToken: string) => Promise<void> | void
}

export const LoginView: React.FC<LoginViewProps> = ({ onLogin, onSignup, onGoogleLogin }) => {
  const [authStep, setAuthStep] = useState<"landing" | "signin" | "signup">("landing")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [formError, setFormError] = useState<string | undefined>()
  const [googleError, setGoogleError] = useState<string | undefined>()

  const resetState = () => {
    setEmail("")
    setPassword("")
    setFormError(undefined)
    setGoogleError(undefined)
    setIsLoading(false)
  }

  const closeModal = () => {
    resetState()
    setAuthStep("landing")
  }

  const handleAuthSubmit = async (type: "signin" | "signup") => {
    if (!email || !password) {
      setFormError("Email and password are required")
      return
    }
    setIsLoading(true)
    setFormError(undefined)
    try {
      if (type === "signup") {
        await onSignup({ email, password })
      } else {
        await onLogin({ email, password })
      }
      closeModal()
    } catch (err: any) {
      setFormError(err?.message || "Unable to authenticate")
    } finally {
      setIsLoading(false)
    }
  }

  const handleGoogle = async () => {
    if (!hasFirebaseConfig) {
      setGoogleError("Google Sign-In is not configured")
      return
    }
    setIsLoading(true)
    setGoogleError(undefined)
    try {
      const { idToken } = await signInWithGoogleFirebase()
      await onGoogleLogin(idToken)
      closeModal()
    } catch (err: any) {
      setGoogleError(err?.message || "Google sign-in failed")
    } finally {
      setIsLoading(false)
    }
  }

  const GoogleIcon = () => (
    <svg viewBox="0 0 24 24" className="w-5 h-5 mr-2" aria-hidden="true">
      <path
        fill="currentColor"
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
      />
      <path
        fill="currentColor"
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
      />
      <path
        fill="currentColor"
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.26-.19-.58z"
      />
      <path
        fill="currentColor"
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
      />
    </svg>
  )

  // Modal for Sign In / Sign Up flows
  const AuthModal = ({ title, type }: { title: string; type: "signin" | "signup" }) => (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
      <div className="bg-black border border-slate-800 w-full max-w-[600px] h-full md:h-auto md:min-h-[600px] md:max-h-[90vh] md:rounded-2xl relative flex flex-col shadow-2xl animate-in zoom-in-95 duration-200">
        <div className="flex items-center px-4 h-[53px]">
          <button
            onClick={closeModal}
            className="p-2 -ml-2 hover:bg-slate-900 rounded-full text-slate-100 transition-colors"
          >
            <X size={20} />
          </button>
          <div className="absolute left-1/2 -translate-x-1/2 text-slate-100">
             <Logo size={32} />
          </div>
        </div>

        <div className="flex-1 px-8 md:px-20 py-4 flex flex-col overflow-y-auto">
          <div className="flex-1 flex flex-col justify-start pt-6">
            <h2 className="text-3xl font-bold text-slate-100 mb-8">{title}</h2>
            
            <div className="space-y-6 max-w-[360px] w-full mx-auto">
              <button
                onClick={handleGoogle}
                disabled={isLoading}
                className="w-full bg-white text-black font-bold rounded-full h-[40px] px-4 flex items-center justify-center hover:bg-slate-200 transition-colors disabled:opacity-60"
              >
                <GoogleIcon />
                {isLoading ? "Processing..." : `Sign ${type === "signup" ? "up" : "in"} with Google`}
              </button>

              {googleError && <p className="text-sm text-red-400">{googleError}</p>}
              
              <div className="relative flex items-center py-1">
                <div className="flex-grow border-t border-slate-700"></div>
                <span className="flex-shrink-0 mx-4 text-slate-100 text-sm">or</span>
                <div className="flex-grow border-t border-slate-700"></div>
              </div>

              <div className="space-y-6">
                <input
                  type="email"
                  placeholder="Email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-black border border-slate-700 rounded px-3 h-[56px] text-white focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 transition-colors placeholder-slate-500"
                />

                <input
                  type="password"
                  placeholder="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-black border border-slate-700 rounded px-3 h-[56px] text-white focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 transition-colors placeholder-slate-500"
                />

                {formError && <p className="text-sm text-red-400">{formError}</p>}

                <button
                  className="w-full bg-slate-100 text-black font-bold rounded-full h-[46px] px-4 hover:bg-slate-200 transition-colors disabled:opacity-50"
                  onClick={() => handleAuthSubmit(type)}
                  disabled={isLoading}
                >
                  {isLoading ? "Processing..." : type === "signup" ? "Create account" : "Sign in"}
                </button>

                {type === "signup" ? (
                  <p className="text-sm text-slate-500">
                    Have an account already?{" "}
                    <button
                      onClick={() => {
                        resetState()
                        setAuthStep("signin")
                      }}
                      className="text-indigo-500 hover:underline"
                    >
                      Log in
                    </button>
                  </p>
                ) : (
                  <button className="w-full border border-slate-700 text-white font-bold rounded-full h-[40px] px-4 hover:bg-slate-900 transition-colors">
                    Forgot password?
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const footerLinks = [
    "About", "Help Center", "Terms of Service", "Privacy Policy",
    "Cookie Policy", "Accessibility", "Ads info", "Blog", "Status", "Careers",
    "Brand Resources", "Advertising", "Marketing", "Discuzz for Business", "Developers",
    "Directory", "Settings", "© 2024 Discuzz.ai."
  ];

  return (
    <div className="min-h-screen bg-black text-slate-100 flex flex-col">
      
      <div className="flex-1 flex flex-col md:flex-row">
        {/* Left Column - Branding (Desktop) */}
        <div className="hidden md:flex flex-1 items-center justify-center relative">
          <div className="p-20">
              <Logo size={380} className="text-slate-100" />
          </div>
        </div>

        {/* Right Column - Auth Actions */}
        <div className="flex-1 flex flex-col p-8 md:p-12 lg:p-16 justify-center min-w-[45vw] lg:min-w-[50vw]">
          
          {/* Mobile Logo */}
          <div className="md:hidden mb-12">
              <Logo size={48} className="text-slate-100" />
          </div>

          <div className="space-y-12 max-w-[760px] w-full">
              <h1 className="text-[40px] leading-tight md:text-6xl lg:text-[64px] font-bold tracking-tight text-slate-100 break-words my-12">
                  Context matters.
              </h1>

              <div>
                  <h2 className="text-2xl md:text-3xl font-bold mb-8 text-slate-100">
                      Join today.
                  </h2>

                  <div className="space-y-3 w-[300px]">
                      <button 
                        onClick={handleGoogle}
                        className="w-full bg-white text-black font-bold rounded-full h-[40px] px-4 flex items-center justify-center hover:bg-slate-200 transition-colors disabled:opacity-60"
                        disabled={isLoading}
                      >
                        <GoogleIcon />
                        Sign up with Google
                      </button>
                      {googleError && <p className="text-sm text-red-400">{googleError}</p>}

                      <div className="relative flex items-center py-1">
                          <div className="flex-grow border-t border-slate-800"></div>
                          <span className="flex-shrink-0 mx-2 text-slate-100 text-sm">or</span>
                          <div className="flex-grow border-t border-slate-800"></div>
                      </div>

                      <button
                        onClick={() => {
                          resetState()
                          setAuthStep("signup")
                        }}
                        className="w-full bg-indigo-500 text-white font-bold rounded-full h-[40px] px-4 hover:bg-indigo-600 transition-colors"
                      >
                        Create account
                      </button>

                      <p className="text-[11px] text-slate-500 leading-tight pt-1">
                          By signing up, you agree to the <span className="text-indigo-400 cursor-pointer hover:underline">Terms of Service</span> and <span className="text-indigo-400 cursor-pointer hover:underline">Privacy Policy</span>, including <span className="text-indigo-400 cursor-pointer hover:underline">Cookie Use</span>.
                      </p>
                  </div>

                  <div className="mt-16">
                      <h3 className="text-[17px] font-bold mb-4 text-slate-100">Already have an account?</h3>
                      <button
                        onClick={() => {
                          resetState()
                          setAuthStep("signin")
                        }}
                        className="w-[300px] border border-slate-600 text-indigo-400 font-bold rounded-full h-[40px] px-4 hover:bg-indigo-500/10 transition-colors"
                      >
                        Sign in
                      </button>
                  </div>
              </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="py-4 px-4 text-center">
        <div className="flex flex-wrap justify-center gap-x-4 gap-y-2 text-[13px] text-slate-500">
          {footerLinks.map((link, i) => (
             <span key={i} className="cursor-pointer hover:underline">{link}</span>
          ))}
        </div>
      </div>

      {authStep === "signin" && <AuthModal title="Sign in to Discuzz.ai" type="signin" />}
      {authStep === "signup" && <AuthModal title="Create your account" type="signup" />}

    </div>
  )
}
