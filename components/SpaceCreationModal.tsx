
import React, { useState } from 'react';
import { X, Mic, Tag, Globe, Lock, Calendar, Clock, ChevronDown } from 'lucide-react';
import { Button } from './Button';
import { User } from '../types';

interface SpaceCreationModalProps {
  currentUser: User;
  onClose: () => void;
  onStartSpace: (title: string, tags: string[]) => void;
}

export const SpaceCreationModal: React.FC<SpaceCreationModalProps> = ({ currentUser, onClose, onStartSpace }) => {
  const [title, setTitle] = useState('');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [isRecording, setIsRecording] = useState(true);
  const [isScheduleMode, setIsScheduleMode] = useState(false);
  
  const AVAILABLE_TAGS = ['Tech', 'AI', 'Politics', 'Crypto', 'Art', 'Philosophy', 'Science', 'Music', 'Business', 'Gaming'];

  const toggleTag = (tag: string) => {
    if (selectedTags.includes(tag)) {
      setSelectedTags(selectedTags.filter(t => t !== tag));
    } else if (selectedTags.length < 3) {
      setSelectedTags([...selectedTags, tag]);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end md:items-center justify-center p-0 md:p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div 
        className="bg-white dark:bg-slate-900 w-full max-w-lg rounded-t-3xl md:rounded-2xl shadow-2xl overflow-hidden animate-in slide-in-from-bottom-10 duration-300 flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        
        {/* Header */}
        <div className="p-4 flex justify-between items-center shrink-0">
            <button onClick={onClose} className="p-2 -ml-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 transition-colors">
                <X size={24} />
            </button>
            <div className="flex bg-slate-100 dark:bg-slate-800 rounded-full p-1 relative">
                <button 
                    onClick={() => setIsScheduleMode(false)}
                    className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all ${!isScheduleMode ? 'bg-white dark:bg-slate-700 text-indigo-500 shadow-sm' : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'}`}
                >
                    Start Now
                </button>
                <button 
                    onClick={() => setIsScheduleMode(true)}
                    className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all ${isScheduleMode ? 'bg-white dark:bg-slate-700 text-indigo-500 shadow-sm' : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'}`}
                >
                    Schedule
                </button>
            </div>
            <div className="w-10"></div> {/* Spacer for alignment */}
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-8 scrollbar-hide">
            
            {/* Host Info */}
            <div className="flex items-center gap-3">
                <img src={currentUser.avatarUrl} alt={currentUser.name} className="w-12 h-12 rounded-full object-cover border-2 border-slate-200 dark:border-slate-700" />
                <div>
                    <p className="text-xs font-bold text-slate-500 uppercase tracking-wide">Host</p>
                    <p className="font-bold text-slate-900 dark:text-white">{currentUser.name}</p>
                </div>
            </div>

            {/* Title Input */}
            <div className="relative">
                <textarea 
                    placeholder="What do you want to talk about?" 
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="w-full text-3xl font-bold bg-transparent border-none placeholder-slate-300 dark:placeholder-slate-700 text-slate-900 dark:text-white focus:ring-0 p-0 resize-none leading-tight"
                    rows={2}
                    autoFocus
                />
            </div>

            {/* Topics */}
            <div>
                <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2 text-indigo-500 text-xs font-bold uppercase tracking-wider">
                        <Tag size={14} />
                        <span>Select Topics ({selectedTags.length}/3)</span>
                    </div>
                </div>
                <div className="flex flex-wrap gap-2">
                    {AVAILABLE_TAGS.map(tag => (
                        <button
                            key={tag}
                            onClick={() => toggleTag(tag)}
                            className={`px-4 py-2 rounded-full text-sm font-medium transition-all border ${
                                selectedTags.includes(tag)
                                ? 'bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-300 border-indigo-200 dark:border-indigo-700/50'
                                : 'bg-transparent text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
                            }`}
                        >
                            {tag}
                        </button>
                    ))}
                </div>
            </div>

            {/* Settings */}
            <div className="space-y-4 pt-2">
                <div 
                    className="flex items-center justify-between p-4 rounded-xl border border-slate-200 dark:border-slate-800 cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
                    onClick={() => setIsRecording(!isRecording)}
                >
                    <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-full ${isRecording ? 'bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400' : 'bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400'}`}>
                            <Mic size={20} />
                        </div>
                        <div>
                            <p className="font-bold text-sm text-slate-900 dark:text-white">Record Space</p>
                            <p className="text-xs text-slate-500">Recordings are available for replay.</p>
                        </div>
                    </div>
                    <div className={`w-12 h-7 rounded-full transition-colors relative ${isRecording ? 'bg-emerald-500' : 'bg-slate-300 dark:bg-slate-700'}`}>
                        <div className={`absolute top-1 w-5 h-5 bg-white rounded-full shadow-sm transition-all duration-200 ${isRecording ? 'left-6' : 'left-1'}`}></div>
                    </div>
                </div>

                {isScheduleMode && (
                     <div className="flex items-center justify-between p-4 rounded-xl border border-slate-200 dark:border-slate-800">
                        <div className="flex items-center gap-3">
                            <div className="p-2 rounded-full bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400">
                                <Calendar size={20} />
                            </div>
                            <div>
                                <p className="font-bold text-sm text-slate-900 dark:text-white">Schedule</p>
                                <p className="text-xs text-slate-500">Pick a date and time.</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                            <span className="text-sm font-bold text-indigo-500 bg-indigo-50 dark:bg-indigo-900/20 px-3 py-1 rounded-lg">Tomorrow, 7:00 PM</span>
                        </div>
                    </div>
                )}
            </div>
        </div>

        {/* Footer Action */}
        <div className="p-4 border-t border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 shrink-0 safe-area-bottom">
            <Button 
                size="lg" 
                className={`w-full rounded-full h-14 text-lg font-bold shadow-xl transition-all ${isScheduleMode ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900' : 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-indigo-500/20'}`}
                disabled={!title.trim()}
                onClick={() => onStartSpace(title, selectedTags)}
            >
                {isScheduleMode ? (
                    <span className="flex items-center justify-center gap-2"><Calendar size={20} /> Schedule Space</span>
                ) : (
                    <span className="flex items-center justify-center gap-2"><Mic size={20} /> Start your Space</span>
                )}
            </Button>
        </div>

      </div>
    </div>
  );
};