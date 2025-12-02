
import React, { useState, useEffect, useRef } from 'react';
import { Space, SpaceParticipant, User } from '../types';
import { ChevronDown, Mic, MicOff, MessageSquare, Heart, Share, Hand, X, MoreHorizontal, Sparkles, Send, User as UserIcon, Settings, Flag, Copy } from 'lucide-react';
import { Button } from './Button';

interface ActiveSpaceViewProps {
  space: Space;
  currentUser: User;
  onMinimize: () => void;
  onLeave: () => void;
  onEnd: () => void;
}

export const ActiveSpaceView: React.FC<ActiveSpaceViewProps> = ({ 
  space, 
  currentUser, 
  onMinimize, 
  onLeave,
  onEnd 
}) => {
  const [isMuted, setIsMuted] = useState(false);
  const [reactions, setReactions] = useState<{id: number, type: string, x: number}[]>([]);
  
  // New Functional States
  const [isHandRaised, setIsHandRaised] = useState(false);
  const [showComments, setShowComments] = useState(false);
  const [chatInput, setChatInput] = useState('');
  const [chatMessages, setChatMessages] = useState<{id: string, user: User, text: string}[]>([
      { id: '1', user: space.participants.find(p => p.role !== 'host')?.user || currentUser, text: "Can we discuss the latency implications?" },
      { id: '2', user: space.participants[0].user, text: "Great point, let's dive into that." }
  ]);
  const [toast, setToast] = useState<string | null>(null);
  
  // Menu State
  const [showMenu, setShowMenu] = useState(false);
  const [showEndConfirmation, setShowEndConfirmation] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const isHost = space.hostId === currentUser.handle;

  useEffect(() => {
      if (showComments && messagesEndRef.current) {
          messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
      }
  }, [showComments, chatMessages]);

  // Click outside handler for menu
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setShowMenu(false);
      }
    };

    if (showMenu) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showMenu]);

  const triggerReaction = (type: string) => {
    const id = Date.now();
    const x = Math.random() * 80 + 10; // Random horizontal position
    setReactions(prev => [...prev, { id, type, x }]);
    
    // Cleanup reaction after animation
    setTimeout(() => {
        setReactions(prev => prev.filter(r => r.id !== id));
    }, 2000);
  };

  const handleRaiseHand = () => {
      const newState = !isHandRaised;
      setIsHandRaised(newState);
      if (newState) {
          triggerReaction('hand');
          setToast("Hand raised. Host notified.");
          setTimeout(() => setToast(null), 3000);
      } else {
          setToast("Hand lowered.");
          setTimeout(() => setToast(null), 2000);
      }
  };

  const handleSendMessage = () => {
      if (!chatInput.trim()) return;
      
      const newMessage = {
          id: Date.now().toString(),
          user: currentUser,
          text: chatInput
      };
      
      setChatMessages(prev => [...prev, newMessage]);
      setChatInput('');
      
      // Simulate reaction from others
      setTimeout(() => {
          triggerReaction('heart');
      }, 500);
  };

  const ParticipantBubble = ({ p, size = 'md' }: { p: SpaceParticipant, size?: 'sm' | 'md' | 'lg' }) => {
    const sizeClasses = {
        sm: 'w-12 h-12',
        md: 'w-16 h-16 md:w-20 md:h-20',
        lg: 'w-24 h-24 md:w-32 md:h-32'
    };

    return (
        <div className="flex flex-col items-center gap-2 relative group">
            <div className="relative">
                <div className={`rounded-full overflow-hidden border-2 ${p.isSpeaking ? 'border-indigo-500 shadow-[0_0_0_4px_rgba(99,102,241,0.4)]' : 'border-transparent'} ${sizeClasses[size]}`}>
                    <img src={p.user.avatarUrl} alt={p.user.name} className="w-full h-full object-cover bg-slate-800" />
                </div>
                {/* Role Badge */}
                <div className="absolute -bottom-1 -right-1">
                    {p.role === 'host' && (
                        <span className="bg-indigo-500 text-white text-[10px] px-1.5 py-0.5 rounded-full border-2 border-white dark:border-slate-900 font-bold uppercase">Host</span>
                    )}
                    {p.role === 'speaker' && (
                        <span className="bg-emerald-500 text-white text-[10px] px-1.5 py-0.5 rounded-full border-2 border-white dark:border-slate-900 font-bold uppercase">Spkr</span>
                    )}
                </div>
                {/* Mute Indicator */}
                {p.isMuted && (
                    <div className="absolute bottom-0 left-0 bg-slate-200 dark:bg-slate-900/80 p-1 rounded-full border border-white dark:border-slate-700">
                        <MicOff size={10} className="text-slate-500 dark:text-red-400" />
                    </div>
                )}
            </div>
            <span className="text-slate-900 dark:text-white text-xs font-medium max-w-[80px] truncate">{p.user.name}</span>
        </div>
    );
  };

  return (
    <div className="fixed inset-0 z-40 flex flex-col bg-slate-50 dark:bg-gradient-to-b dark:from-indigo-950 dark:via-slate-900 dark:to-black text-slate-900 dark:text-white overflow-hidden animate-in slide-in-from-bottom duration-300 transition-colors">
      
      {/* Toast Notification */}
      {toast && (
          <div className="absolute top-20 left-1/2 -translate-x-1/2 z-50 bg-slate-900 dark:bg-white text-white dark:text-slate-900 px-4 py-2 rounded-full font-medium text-sm shadow-xl animate-in fade-in slide-in-from-top-4">
              {toast}
          </div>
      )}

      {/* End Space Confirmation Modal */}
      {showEndConfirmation && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-white dark:bg-slate-900 w-full max-w-sm rounded-2xl p-6 shadow-2xl border border-slate-200 dark:border-slate-800 animate-in zoom-in-95 duration-200">
                <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">End this space?</h3>
                <p className="text-slate-500 dark:text-slate-400 mb-6 text-sm">
                    This will end the live conversation for everyone.
                </p>
                <div className="flex flex-col gap-3">
                    <button 
                        onClick={onEnd}
                        className="w-full py-3 bg-red-500 hover:bg-red-600 text-white font-bold rounded-full transition-colors"
                    >
                        End Space
                    </button>
                    <button 
                        onClick={() => setShowEndConfirmation(false)}
                        className="w-full py-3 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-900 dark:text-white font-bold rounded-full transition-colors"
                    >
                        Cancel
                    </button>
                </div>
            </div>
        </div>
      )}

      {/* Background Reactions Layer */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden z-10">
        {reactions.map(r => (
            <div 
                key={r.id}
                className="absolute bottom-20 text-4xl animate-float-up opacity-0"
                style={{ left: `${r.x}%` }}
            >
                {r.type === 'heart' && '❤️'}
                {r.type === 'fire' && '🔥'}
                {r.type === '100' && '💯'}
                {r.type === 'hand' && '✋'}
            </div>
        ))}
      </div>

      {/* Header */}
      <div className="p-4 flex items-center justify-between shrink-0 bg-white/80 dark:bg-black/20 backdrop-blur-md relative z-20 border-b border-slate-200 dark:border-transparent transition-colors">
        <button onClick={onMinimize} className="p-2 -ml-2 rounded-full hover:bg-slate-200 dark:hover:bg-white/10 transition-colors text-slate-600 dark:text-white">
            <ChevronDown size={28} />
        </button>
        <div className="flex flex-col items-center">
             <span className="text-[10px] font-bold uppercase tracking-widest text-indigo-500 dark:text-indigo-400 mb-1">Live Space</span>
             <h3 className="font-bold text-sm max-w-[200px] truncate text-slate-900 dark:text-white">{space.title}</h3>
        </div>
        
        {/* Context Menu */}
        <div className="relative" ref={menuRef}>
            <button 
                onClick={() => setShowMenu(!showMenu)}
                className={`p-2 -mr-2 rounded-full transition-colors text-slate-500 dark:text-white/70 ${showMenu ? 'bg-slate-200 dark:bg-white/10' : 'hover:bg-slate-200 dark:hover:bg-white/10'}`}
            >
                <MoreHorizontal size={24} />
            </button>
            
            {showMenu && (
                <div className="absolute right-0 top-full mt-2 w-60 bg-white dark:bg-slate-900 rounded-xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden z-50 animate-in fade-in zoom-in-95 duration-100 origin-top-right">
                    <div className="p-3 border-b border-slate-100 dark:border-slate-800">
                        <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Space Details</p>
                        <p className="text-sm font-bold text-slate-900 dark:text-white truncate">{space.title}</p>
                    </div>
                    <button 
                        onClick={() => {
                            navigator.clipboard.writeText(window.location.href);
                            setToast("Link copied to clipboard");
                            setShowMenu(false);
                            setTimeout(() => setToast(null), 2000);
                        }}
                        className="w-full text-left px-4 py-3 text-sm font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors flex items-center gap-3"
                    >
                        <Copy size={18} className="text-slate-400" /> Copy Link
                    </button>
                    <button className="w-full text-left px-4 py-3 text-sm font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors flex items-center gap-3">
                        <Share size={18} className="text-slate-400" /> Share via...
                    </button>
                    <button className="w-full text-left px-4 py-3 text-sm font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors flex items-center gap-3">
                        <Settings size={18} className="text-slate-400" /> Audio Settings
                    </button>
                    <div className="h-px bg-slate-100 dark:bg-slate-800 my-1"></div>
                    <button className="w-full text-left px-4 py-3 text-sm font-medium text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors flex items-center gap-3">
                        <Flag size={18} /> Report Space
                    </button>
                </div>
            )}
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-y-auto p-4 md:p-8 relative z-0">
         {/* Host & Speakers Area */}
         <div className="mb-8">
            <div className="flex justify-center flex-wrap gap-6 md:gap-10 py-8">
                {space.participants.filter(p => p.role === 'host').map(p => (
                    <ParticipantBubble key={p.user.handle} p={p} size="lg" />
                ))}
                {space.participants.filter(p => p.role === 'speaker').map(p => (
                    <ParticipantBubble key={p.user.handle} p={p} size="md" />
                ))}
            </div>
         </div>

         {/* Listeners Area */}
         <div className="bg-slate-100 dark:bg-white/5 rounded-3xl p-6 min-h-[300px] transition-colors">
             <h4 className="text-xs font-bold text-slate-400 dark:text-white/50 uppercase tracking-widest mb-6">Listeners ({space.participants.filter(p => p.role === 'listener').length})</h4>
             <div className="grid grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-y-6 gap-x-4">
                 {space.participants.filter(p => p.role === 'listener').map(p => (
                    <ParticipantBubble key={p.user.handle} p={p} size="sm" />
                 ))}
                 
                 {/* Placeholders for visual density */}
                 {[...Array(5)].map((_, i) => (
                    <div key={i} className="flex flex-col items-center gap-2 opacity-30">
                        <div className="w-12 h-12 rounded-full bg-slate-200 dark:bg-white/10"></div>
                        <div className="w-8 h-2 bg-slate-200 dark:bg-white/10 rounded"></div>
                    </div>
                 ))}
             </div>
         </div>
      </div>

      {/* Controls */}
      <div className="p-4 pb-8 bg-white/90 dark:bg-black/40 backdrop-blur-md border-t border-slate-200 dark:border-white/10 shrink-0 relative z-20 transition-colors">
         
         {/* Tags */}
         <div className="flex justify-center gap-2 mb-6">
             {space.tags.map(tag => (
                 <span key={tag} className="text-[10px] px-2 py-1 bg-slate-200 dark:bg-white/10 rounded-full text-slate-600 dark:text-white/70 uppercase tracking-wide font-bold">{tag}</span>
             ))}
         </div>

         <div className="flex items-center justify-between max-w-2xl mx-auto px-4">
             {/* Left Actions */}
             <div className="flex items-center gap-4">
                 <button 
                     onClick={() => isHost ? setShowEndConfirmation(true) : onLeave()}
                     className="px-6 py-2.5 bg-red-100 dark:bg-red-500/20 text-red-600 dark:text-red-400 hover:bg-red-200 dark:hover:bg-red-500 hover:text-red-700 dark:hover:text-white rounded-full text-sm font-bold uppercase tracking-wide transition-all border border-red-200 dark:border-red-500/50"
                 >
                     {isHost ? 'End' : 'Leave'}
                 </button>
             </div>

             {/* Center Mic */}
             <div className="absolute left-1/2 -translate-x-1/2 -translate-y-1/2 top-4 md:top-1/2">
                <button 
                    onClick={() => setIsMuted(!isMuted)}
                    className={`w-16 h-16 rounded-full flex items-center justify-center shadow-2xl transition-all scale-100 hover:scale-105 ${isMuted ? 'bg-slate-100 dark:bg-white/10 text-slate-600 dark:text-white border border-slate-200 dark:border-white/20' : 'bg-indigo-500 text-white border-4 border-indigo-400 shadow-[0_0_20px_rgba(99,102,241,0.5)]'}`}
                >
                    {isMuted ? <MicOff size={24} /> : <Mic size={28} />}
                </button>
             </div>

             {/* Right Actions */}
             <div className="flex items-center gap-4">
                <button 
                    onClick={() => triggerReaction('heart')}
                    className="p-3 rounded-full bg-slate-100 dark:bg-white/10 hover:bg-slate-200 dark:hover:bg-white/20 text-pink-500 dark:text-pink-400 transition-colors"
                >
                    <Heart size={20} fill="currentColor" />
                </button>
                <button 
                    onClick={handleRaiseHand}
                    className={`p-3 rounded-full transition-colors ${isHandRaised ? 'bg-yellow-400 dark:bg-yellow-500 text-slate-900 hover:bg-yellow-300 dark:hover:bg-yellow-400' : 'bg-slate-100 dark:bg-white/10 hover:bg-slate-200 dark:hover:bg-white/20 text-yellow-500 dark:text-yellow-400'}`}
                    title={isHandRaised ? "Lower hand" : "Raise hand to speak"}
                >
                    <Hand size={20} fill={isHandRaised ? "currentColor" : "none"} />
                </button>
                <button 
                    onClick={() => setShowComments(!showComments)}
                    className={`p-3 rounded-full transition-colors ${showComments ? 'bg-slate-200 dark:bg-white text-slate-900' : 'bg-slate-100 dark:bg-white/10 hover:bg-slate-200 dark:hover:bg-white/20 text-slate-600 dark:text-white'}`}
                >
                    <MessageSquare size={20} fill={showComments ? "currentColor" : "none"} />
                </button>
             </div>
         </div>
         
         {/* AI Co-Host Badge (Unique to Discuzz) */}
         <div className="mt-6 flex justify-center">
             <div className="flex items-center gap-2 px-3 py-1 bg-indigo-50 dark:bg-indigo-500/10 border border-indigo-200 dark:border-indigo-500/30 rounded-full">
                 <Sparkles size={12} className="text-indigo-500 dark:text-indigo-400" />
                 <span className="text-xs text-indigo-600 dark:text-indigo-300">AI Context Monitor Active</span>
             </div>
         </div>
      </div>

      {/* Comments Overlay */}
      {showComments && (
        <div className="absolute inset-0 z-50 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md flex flex-col animate-in slide-in-from-right duration-300 md:w-96 md:left-auto md:border-l border-slate-200 dark:border-white/10 transition-colors">
            {/* Header */}
            <div className="p-4 border-b border-slate-200 dark:border-white/10 flex justify-between items-center bg-slate-50 dark:bg-black/20">
                <h3 className="font-bold text-slate-900 dark:text-white flex items-center gap-2">
                    <MessageSquare size={16} /> Discussion
                </h3>
                <button 
                    onClick={() => setShowComments(false)}
                    className="p-2 -mr-2 rounded-full hover:bg-slate-200 dark:hover:bg-white/10 text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors"
                >
                    <X size={20} />
                </button>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {chatMessages.map(msg => (
                    <div key={msg.id} className="flex gap-3 animate-in fade-in slide-in-from-bottom-2">
                        <img src={msg.user.avatarUrl} alt={msg.user.name} className="w-8 h-8 rounded-full object-cover shrink-0 bg-slate-200 dark:bg-slate-800" />
                        <div className="flex-1">
                            <div className="flex items-baseline gap-2">
                                <span className="text-sm font-bold text-slate-900 dark:text-white">{msg.user.name}</span>
                                <span className="text-[10px] text-slate-500 dark:text-slate-400">{msg.user.handle}</span>
                            </div>
                            <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed">{msg.text}</p>
                        </div>
                    </div>
                ))}
                <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div className="p-3 border-t border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-black/20">
                <div className="flex items-center gap-2 bg-slate-200 dark:bg-white/10 rounded-full px-4 py-2 border border-transparent focus-within:border-indigo-500 transition-colors">
                    <input 
                        type="text"
                        value={chatInput}
                        onChange={(e) => setChatInput(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                        placeholder="Say something..."
                        className="flex-1 bg-transparent border-none focus:outline-none text-sm text-slate-900 dark:text-white placeholder-slate-500"
                        autoFocus
                    />
                    <button 
                        onClick={handleSendMessage}
                        disabled={!chatInput.trim()}
                        className="text-indigo-500 dark:text-indigo-400 disabled:opacity-50 hover:text-indigo-600 dark:hover:text-indigo-300 transition-colors"
                    >
                        <Send size={18} />
                    </button>
                </div>
            </div>
        </div>
      )}

    </div>
  );
};