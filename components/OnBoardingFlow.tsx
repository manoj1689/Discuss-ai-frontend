import React, { useState, useRef } from 'react';
import { User } from '../types';
import { Button } from './Button';
import { Logo } from './Logo';
import { MOCK_USERS } from '../constants';
import { Camera, Mail, Globe, Check, Bell, ChevronRight, Hash, UserPlus, ArrowLeft, Lock } from 'lucide-react';

const LANGUAGES = ["English", "Spanish", "French", "German", "Hindi", "Japanese", "Chinese", "Arabic"];
const TOPICS = [
  "Technology", "AI & ML", "Crypto", "Startups", "Coding",
  "Science", "Space", "Physics", "Biotech",
  "Arts", "Design", "Music", "Photography", "Cinema",
  "News", "Politics", "Economics", "History",
  "Sports", "Gaming", "Fitness", "Travel", "Food"
];

interface OnboardingFlowProps {
  initialUser: User;
  onComplete: (payload: { user: User; following: Set<string>; interests: string[]; languages: string[] }) => void;
  isSaving?: boolean;
}

type Step = 'VERIFICATION' | 'PROFILE' | 'INTERESTS' | 'FOLLOWS' | 'PERMISSIONS';

export const OnboardingFlow: React.FC<OnboardingFlowProps> = ({ initialUser, onComplete, isSaving = false }) => {
  const [step, setStep] = useState<Step>('VERIFICATION');
  
  // User Data State
  const [userData, setUserData] = useState<User>(initialUser);
  const [following, setFollowing] = useState<Set<string>>(new Set());
  
  // Local Step States
  const [verificationCode, setVerificationCode] = useState(['', '', '', '', '', '']);
  const [selectedInterests, setSelectedInterests] = useState<Set<string>>(new Set(initialUser.interests || []));
  const initialLanguage = initialUser.language && LANGUAGES.includes(initialUser.language) ? initialUser.language : 'English';
  const [selectedLanguages, setSelectedLanguages] = useState<Set<string>>(new Set([initialLanguage]));
  
  const verificationRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Step 1: Verification Logic
  const handleVerificationChange = (index: number, value: string) => {
    if (value.length > 1) return;
    const newCode = [...verificationCode];
    newCode[index] = value;
    setVerificationCode(newCode);
    
    // Auto-focus next input
    if (value && index < 5) {
      verificationRefs.current[index + 1]?.focus();
    }
  };

  const handleVerificationKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !verificationCode[index] && index > 0) {
      verificationRefs.current[index - 1]?.focus();
    }
  };

  // Step 2: Profile Logic
  const handleProfileChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setUserData(prev => ({ ...prev, [name]: value }));
  };

  const toggleSetItem = (set: Set<string>, item: string, updateState: React.Dispatch<React.SetStateAction<Set<string>>>) => {
    const newSet = new Set(set);
    if (newSet.has(item)) newSet.delete(item);
    else newSet.add(item);
    updateState(newSet);
  };

  // Step 4: Follow Logic
  const toggleFollow = (handle: string) => {
    const newSet = new Set(following);
    if (newSet.has(handle)) newSet.delete(handle);
    else newSet.add(handle);
    setFollowing(newSet);
  };

  // Navigation
  const handleNext = () => {
    switch (step) {
      case 'VERIFICATION': setStep('PROFILE'); break;
      case 'PROFILE': setStep('INTERESTS'); break;
      case 'INTERESTS': setStep('FOLLOWS'); break;
      case 'FOLLOWS': setStep('PERMISSIONS'); break;
      case 'PERMISSIONS':
        if (isSaving) return;
        onComplete({
          user: userData,
          following,
          interests: Array.from(selectedInterests),
          languages: Array.from(selectedLanguages)
        });
        break;
    }
  };

  const renderVerification = () => (
    <div className="flex flex-col h-full animate-in fade-in slide-in-from-right-4 duration-300">
      <h2 className="text-3xl font-bold mb-2 text-slate-900 dark:text-white">We sent you a code</h2>
      <p className="text-slate-500 dark:text-slate-400 mb-8">Enter the verification code sent to your email to confirm it's really you.</p>
      
      <div className="flex gap-2 sm:gap-4 justify-center mb-8">
        {verificationCode.map((digit, idx) => (
          <input
            key={idx}
            ref={(el) => { verificationRefs.current[idx] = el; }}
            type="text"
            maxLength={1}
            value={digit}
            onChange={(e) => handleVerificationChange(idx, e.target.value)}
            onKeyDown={(e) => handleVerificationKeyDown(idx, e)}
            className="w-10 h-12 sm:w-12 sm:h-14 text-center text-2xl font-bold bg-transparent border-b-2 border-slate-300 dark:border-slate-700 focus:border-indigo-500 outline-none transition-colors text-slate-900 dark:text-white"
          />
        ))}
      </div>

      <div className="mt-auto">
        <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">Didn't receive a code? <span className="text-indigo-500 cursor-pointer hover:underline">Resend email</span></p>
        <Button 
          className="w-full h-12 text-lg rounded-full" 
          onClick={handleNext}
          disabled={verificationCode.some(d => !d)}
        >
          Verify
        </Button>
      </div>
    </div>
  );

  const renderProfile = () => (
    <div className="flex flex-col h-full animate-in fade-in slide-in-from-right-4 duration-300">
      <h2 className="text-3xl font-bold mb-2 text-slate-900 dark:text-white">Pick a profile picture</h2>
      <p className="text-slate-500 dark:text-slate-400 mb-8">Have a favorite selfie? Upload it now.</p>
      
      <div className="flex justify-center mb-8">
        <div className="relative group cursor-pointer">
           <img 
              src={userData.avatarUrl} 
              alt={userData.name} 
              className="w-32 h-32 rounded-full object-cover border-4 border-slate-100 dark:border-slate-800" 
           />
           <div className="absolute inset-0 bg-black/40 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
              <Camera className="text-white" />
           </div>
        </div>
      </div>

      <div className="space-y-6 flex-1 overflow-y-auto px-1">
        <div className="relative group">
           <input 
             type="text" 
             name="name"
             value={userData.name}
             onChange={handleProfileChange}
             className="peer w-full pt-6 pb-2 px-3 bg-transparent border border-slate-300 dark:border-slate-700 rounded focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none transition-all text-slate-900 dark:text-white"
             placeholder=" "
           />
           <label className="absolute left-3 top-2 text-xs text-slate-500 dark:text-slate-400 peer-placeholder-shown:top-4 peer-placeholder-shown:text-base peer-placeholder-shown:text-slate-400 transition-all pointer-events-none">Name</label>
        </div>

        <div className="relative group">
           <textarea 
             name="bio"
             value={userData.bio || ''}
             onChange={handleProfileChange}
             className="peer w-full pt-6 pb-2 px-3 bg-transparent border border-slate-300 dark:border-slate-700 rounded focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none transition-all resize-none h-24 text-slate-900 dark:text-white"
             placeholder=" "
           />
           <label className="absolute left-3 top-2 text-xs text-slate-500 dark:text-slate-400 peer-placeholder-shown:top-4 peer-placeholder-shown:text-base peer-placeholder-shown:text-slate-400 transition-all pointer-events-none">Bio</label>
        </div>
        
        <div className="relative group">
           <input 
             type="text" 
             name="location"
             value={userData.location || ''}
             onChange={handleProfileChange}
             className="peer w-full pt-6 pb-2 px-3 bg-transparent border border-slate-300 dark:border-slate-700 rounded focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none transition-all text-slate-900 dark:text-white"
             placeholder=" "
           />
           <label className="absolute left-3 top-2 text-xs text-slate-500 dark:text-slate-400 peer-placeholder-shown:top-4 peer-placeholder-shown:text-base peer-placeholder-shown:text-slate-400 transition-all pointer-events-none">Location</label>
        </div>
      </div>

      <div className="mt-6 flex justify-between items-center">
         <button onClick={handleNext} className="text-slate-500 hover:text-slate-900 dark:hover:text-white font-medium">Skip for now</button>
         <Button className="px-8 h-12 rounded-full" onClick={handleNext}>Next</Button>
      </div>
    </div>
  );

  const renderInterests = () => (
    <div className="flex flex-col h-full animate-in fade-in slide-in-from-right-4 duration-300">
      <div className="flex-1 overflow-y-auto pr-2">
        <h2 className="text-3xl font-bold mb-2 text-slate-900 dark:text-white">What do you want to see on Discuzz?</h2>
        <p className="text-slate-500 dark:text-slate-400 mb-6">Select interests to personalize your Discuzzion feed.</p>
        
        <div className="mb-8">
          <h3 className="font-bold text-slate-900 dark:text-slate-100 mb-4 flex items-center gap-2">
            <Globe size={18} /> Languages
          </h3>
          <div className="flex flex-wrap gap-3">
             {LANGUAGES.map(lang => (
               <button
                 key={lang}
                 onClick={() => toggleSetItem(selectedLanguages, lang, setSelectedLanguages)}
                 className={`px-4 py-2 rounded-full text-sm font-medium border transition-all ${
                   selectedLanguages.has(lang)
                   ? 'bg-indigo-500 text-white border-indigo-500'
                   : 'bg-transparent text-slate-600 dark:text-slate-300 border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800'
                 }`}
               >
                 {lang}
               </button>
             ))}
          </div>
        </div>

        <div>
          <h3 className="font-bold text-slate-900 dark:text-slate-100 mb-4 flex items-center gap-2">
            <Hash size={18} /> Interests
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
             {TOPICS.map(topic => (
               <button
                 key={topic}
                 onClick={() => toggleSetItem(selectedInterests, topic, setSelectedInterests)}
                 className={`h-20 p-3 rounded-xl border flex items-end font-bold text-left text-sm transition-all ${
                   selectedInterests.has(topic)
                   ? 'bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400 border-indigo-500'
                   : 'bg-transparent text-slate-600 dark:text-slate-300 border-slate-300 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-900'
                 }`}
               >
                 <div className="flex justify-between w-full items-end">
                   <span>{topic}</span>
                   {selectedInterests.has(topic) && <Check size={16} className="bg-indigo-500 text-white rounded-full p-0.5" />}
                 </div>
               </button>
             ))}
          </div>
        </div>
      </div>

      <div className="mt-6 pt-4 border-t border-slate-200 dark:border-slate-800">
        <Button className="w-full h-12 rounded-full" onClick={handleNext}>
           Next: Suggested Follows
        </Button>
      </div>
    </div>
  );

  const renderFollows = () => (
    <div className="flex flex-col h-full animate-in fade-in slide-in-from-right-4 duration-300">
       <h2 className="text-3xl font-bold mb-2 text-slate-900 dark:text-white">Suggested for you</h2>
       <p className="text-slate-500 dark:text-slate-400 mb-6">Based on your interests, you might like these people.</p>
       
       <div className="flex-1 overflow-y-auto -mx-2 px-2">
          {MOCK_USERS.map(user => (
             <div key={user.handle} className="flex items-center gap-3 p-3 hover:bg-slate-50 dark:hover:bg-slate-900 rounded-xl transition-colors mb-2">
                <img src={user.avatarUrl} alt={user.name} className="w-12 h-12 rounded-full object-cover" />
                <div className="flex-1 min-w-0">
                    <p className="font-bold text-slate-900 dark:text-white truncate">{user.name}</p>
                    <p className="text-slate-500 text-sm truncate">{user.handle}</p>
                    <p className="text-slate-600 dark:text-slate-400 text-xs truncate mt-0.5">{user.bio}</p>
                </div>
                <Button 
                   variant={following.has(user.handle) ? "secondary" : "primary"}
                   size="sm"
                   className={following.has(user.handle) ? "w-24" : "w-24"}
                   onClick={() => toggleFollow(user.handle)}
                >
                   {following.has(user.handle) ? 'Following' : 'Follow'}
                </Button>
             </div>
          ))}
       </div>

       <div className="mt-6 pt-4 border-t border-slate-200 dark:border-slate-800 flex justify-between items-center">
         <div className="text-sm text-slate-500 dark:text-slate-400">
            {following.size > 0 ? `${following.size} followed` : 'Follow at least 1 account'}
         </div>
         <Button 
            className="px-8 h-12 rounded-full" 
            onClick={handleNext}
            disabled={following.size === 0}
         >
           Next
         </Button>
      </div>
    </div>
  );

  const renderPermissions = () => (
    <div className="flex flex-col h-full animate-in fade-in slide-in-from-right-4 duration-300">
       <div className="flex-1 flex flex-col items-center justify-center text-center p-4">
          <div className="w-20 h-20 bg-indigo-100 dark:bg-indigo-900/30 rounded-full flex items-center justify-center mb-6">
             <Bell size={40} className="text-indigo-600 dark:text-indigo-400" />
          </div>
          <h2 className="text-3xl font-bold mb-4 text-slate-900 dark:text-white">Turn on notifications</h2>
          <p className="text-slate-500 dark:text-slate-400 max-w-sm mb-8 leading-relaxed">
             Get the most out of Discuzz by staying up to date with what's happening. We promise not to spam you.
          </p>

          <div className="bg-slate-50 dark:bg-slate-900 rounded-xl p-4 w-full max-w-sm border border-slate-200 dark:border-slate-800 text-left mb-8">
              <div className="flex items-start gap-4 mb-4">
                 <div className="bg-emerald-100 dark:bg-emerald-900/30 p-2 rounded-lg">
                    <UserPlus size={20} className="text-emerald-600 dark:text-emerald-400" />
                 </div>
                 <div>
                    <h4 className="font-bold text-sm text-slate-900 dark:text-white">New Followers</h4>
                    <p className="text-xs text-slate-500">Know when someone follows you.</p>
                 </div>
              </div>
              <div className="flex items-start gap-4">
                 <div className="bg-pink-100 dark:bg-pink-900/30 p-2 rounded-lg">
                    <Lock size={20} className="text-pink-600 dark:text-pink-400" />
                 </div>
                 <div>
                    <h4 className="font-bold text-sm text-slate-900 dark:text-white">Context Alerts</h4>
                    <p className="text-xs text-slate-500">Alerts for AI context updates.</p>
                 </div>
              </div>
          </div>
       </div>

       <div className="mt-auto space-y-3">
          <Button className="w-full h-12 rounded-full" onClick={handleNext} disabled={isSaving}>
             {isSaving ? 'Saving preferences...' : 'Allow notifications'}
          </Button>
          <button 
             onClick={handleNext}
             className="w-full py-3 text-slate-500 font-medium hover:text-slate-900 dark:hover:text-white transition-colors disabled:opacity-60"
             disabled={isSaving}
          >
             {isSaving ? 'Saving preferences...' : 'Skip for now'}
          </button>
       </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center p-4 md:p-6 transition-colors">
      <div className="w-full max-w-xl h-[90vh] md:h-[800px] bg-white dark:bg-slate-900 rounded-3xl shadow-2xl flex flex-col overflow-hidden relative border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100">
        {/* Header */}
        <div className="h-16 flex items-center justify-between px-6 border-b border-slate-100 dark:border-slate-800">
          <div className="w-10">
             {step !== 'VERIFICATION' && (
               <button 
                  onClick={() => {
                     if(step === 'PROFILE') setStep('VERIFICATION');
                     if(step === 'INTERESTS') setStep('PROFILE');
                     if(step === 'FOLLOWS') setStep('INTERESTS');
                     if(step === 'PERMISSIONS') setStep('FOLLOWS');
                  }}
                  className="p-2 -ml-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors text-slate-500 dark:text-slate-400"
               >
                  <ArrowLeft size={20} />
               </button>
             )}
          </div>
          <Logo size={32} />
          <div className="w-10"></div>
        </div>

        {/* Progress Bar */}
        <div className="h-1 bg-slate-100 dark:bg-slate-800 w-full">
           <div 
             className="h-full bg-indigo-500 transition-all duration-500 ease-out"
             style={{
               width: step === 'VERIFICATION' ? '20%' : 
                      step === 'PROFILE' ? '40%' : 
                      step === 'INTERESTS' ? '60%' : 
                      step === 'FOLLOWS' ? '80%' : '100%'
             }}
           ></div>
        </div>

        {/* Content Body */}
        <div className="flex-1 p-6 md:p-10 overflow-hidden flex flex-col">
           {step === 'VERIFICATION' && renderVerification()}
           {step === 'PROFILE' && renderProfile()}
           {step === 'INTERESTS' && renderInterests()}
           {step === 'FOLLOWS' && renderFollows()}
           {step === 'PERMISSIONS' && renderPermissions()}
        </div>
      </div>
    </div>
  );
};
