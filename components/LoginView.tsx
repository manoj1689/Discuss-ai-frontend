import React, { useState } from 'react';
import { X } from 'lucide-react';
import { Button } from './Button';
import { Logo } from './Logo';

interface LoginViewProps {
  onLogin: () => void;
}

export const LoginView: React.FC<LoginViewProps> = ({ onLogin }) => {
  const [authStep, setAuthStep] = useState<'landing' | 'signin' | 'signup'>('landing');
  const [username, setUsername] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleAuth = () => {
    setIsLoading(true);
    setTimeout(() => {
      onLogin();
      setIsLoading(false);
    }, 1500);
  };

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
  );

  const AppleIcon = () => (
    <svg viewBox="0 0 24 24" className="w-5 h-5 mr-2" fill="currentColor">
      <path d="M16.365 1.43c0 1.14-.493 2.27-1.177 3.08-.684.816-1.813 1.508-2.932 1.508-1.14 0-2.27-.49-3.08-1.177-.816-.684-1.508-1.813-1.508-2.932 0-1.14.49-2.27 1.177-3.08C9.66 1.014 10.79.322 11.91.322c1.14 0 2.27.49 3.08 1.177.816.684 1.508 1.813 1.508 2.932zm-1.52 15.03c1.22 3.06 4.21 4.22 4.21 4.22-.03.07-2.64 8.79-8.43 8.82-2.18.01-4.14-1.47-5.26-1.47-1.12 0-2.7 1.41-4.45 1.5-3.57.19-7.59-3.06-7.59-8.82 0-4.87 3.04-7.41 6.09-7.46 1.95-.03 3.8 1.34 5.01 1.34 1.22 0 3.53-1.65 5.92-1.4 1.01.04 3.86.41 5.68 3.12-4.59 2.27-3.83 8.67-1.18 10.15z"/>
    </svg>
  );

  // Modal for Sign In / Sign Up flows
  const AuthModal = ({ title, type }: { title: string, type: 'signin' | 'signup' }) => (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
      <div className="bg-black border border-slate-800 w-full max-w-[600px] h-full md:h-auto md:min-h-[600px] md:max-h-[90vh] md:rounded-2xl relative flex flex-col shadow-2xl animate-in zoom-in-95 duration-200">
        <div className="flex items-center px-4 h-[53px]">
          <button 
            onClick={() => setAuthStep('landing')} 
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
              <button className="w-full bg-white text-black font-bold rounded-full h-[40px] px-4 flex items-center justify-center hover:bg-slate-200 transition-colors">
                <GoogleIcon />
                Sign {type === 'signup' ? 'up' : 'in'} with Google
              </button>
              <button className="w-full bg-white text-black font-bold rounded-full h-[40px] px-4 flex items-center justify-center hover:bg-slate-200 transition-colors">
                <AppleIcon />
                Sign {type === 'signup' ? 'up' : 'in'} with Apple
              </button>
              
              <div className="relative flex items-center py-1">
                <div className="flex-grow border-t border-slate-700"></div>
                <span className="flex-shrink-0 mx-4 text-slate-100 text-sm">or</span>
                <div className="flex-grow border-t border-slate-700"></div>
              </div>

              <div className="space-y-6">
                <input 
                  type="text" 
                  placeholder="Phone, email, or username" 
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full bg-black border border-slate-700 rounded px-3 h-[56px] text-white focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 transition-colors placeholder-slate-500"
                />
                
                <button 
                  className="w-full bg-slate-100 text-black font-bold rounded-full h-[46px] px-4 hover:bg-slate-200 transition-colors disabled:opacity-50"
                  onClick={handleAuth}
                  disabled={!username && isLoading}
                >
                  {isLoading ? 'Processing...' : (type === 'signup' ? 'Next' : 'Next')}
                </button>

                 {type === 'signup' ? (
                     <p className="text-sm text-slate-500">
                        Have an account already? <button onClick={() => setAuthStep('signin')} className="text-indigo-500 hover:underline">Log in</button>
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
                          onClick={() => handleAuth()}
                          className="w-full bg-white text-black font-bold rounded-full h-[40px] px-4 flex items-center justify-center hover:bg-slate-200 transition-colors"
                      >
                          <GoogleIcon />
                          Sign up with Google
                      </button>
                      
                      <button 
                          onClick={() => handleAuth()}
                          className="w-full bg-white text-black font-bold rounded-full h-[40px] px-4 flex items-center justify-center hover:bg-slate-200 transition-colors"
                      >
                          <AppleIcon />
                          Sign up with Apple
                      </button>

                      <div className="relative flex items-center py-1">
                          <div className="flex-grow border-t border-slate-800"></div>
                          <span className="flex-shrink-0 mx-2 text-slate-100 text-sm">or</span>
                          <div className="flex-grow border-t border-slate-800"></div>
                      </div>

                      <button 
                          onClick={() => setAuthStep('signup')}
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
                          onClick={() => setAuthStep('signin')}
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

      {authStep === 'signin' && <AuthModal title="Sign in to Discuzz.ai" type="signin" />}
      {authStep === 'signup' && <AuthModal title="Create your account" type="signup" />}

    </div>
  );
};
