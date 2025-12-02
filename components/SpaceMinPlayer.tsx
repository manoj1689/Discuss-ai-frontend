
import React from 'react';
import { Space } from '../types';
import { Maximize2, X, Mic, MicOff } from 'lucide-react';

interface SpaceMinPlayerProps {
  space: Space;
  onMaximize: () => void;
  onClose: () => void;
}

export const SpaceMinPlayer: React.FC<SpaceMinPlayerProps> = ({ space, onMaximize, onClose }) => {
  return (
    <div 
        onClick={onMaximize}
        className="fixed bottom-[70px] md:bottom-6 left-4 right-4 md:left-[96px] md:right-[366px] bg-slate-900 border border-indigo-500/30 shadow-2xl shadow-indigo-900/20 rounded-xl p-3 flex items-center justify-between cursor-pointer z-40 animate-in slide-in-from-bottom-10 duration-300 backdrop-blur-lg"
    >
      <div className="flex items-center gap-3 overflow-hidden">
        {/* Live Indicator Animation */}
        <div className="relative w-10 h-10 flex items-center justify-center shrink-0">
            <div className="absolute inset-0 bg-indigo-500 rounded-full opacity-20 animate-ping"></div>
            <div className="relative w-10 h-10 bg-indigo-600 rounded-full flex items-center justify-center border-2 border-slate-900">
                <div className="flex gap-0.5 items-end h-4 pb-1">
                    <div className="w-0.5 bg-white animate-[bounce_1s_infinite] h-2"></div>
                    <div className="w-0.5 bg-white animate-[bounce_1.2s_infinite] h-3"></div>
                    <div className="w-0.5 bg-white animate-[bounce_0.8s_infinite] h-1.5"></div>
                </div>
            </div>
        </div>

        <div className="flex flex-col overflow-hidden">
            <h4 className="font-bold text-white text-sm truncate pr-4">{space.title}</h4>
            <span className="text-indigo-400 text-xs flex items-center gap-1">
                 {space.participants.length} listening <span className="text-slate-600">·</span> {space.participants.filter(p => p.role === 'host' || p.role === 'speaker').map(p => p.user.name).join(', ')}
            </span>
        </div>
      </div>

      <div className="flex items-center gap-2 shrink-0">
         <button 
            onClick={(e) => {
                e.stopPropagation();
                // Toggle mic logic would go here
            }}
            className="p-2 rounded-full hover:bg-white/10 text-white transition-colors"
         >
            <MicOff size={18} />
         </button>
         <button 
            onClick={(e) => {
                e.stopPropagation();
                onClose();
            }}
            className="p-2 rounded-full hover:bg-red-500/20 text-slate-400 hover:text-red-400 transition-colors"
         >
            <X size={18} />
         </button>
         <div className="w-px h-6 bg-slate-700 mx-1"></div>
         <button className="p-2 rounded-full hover:bg-white/10 text-indigo-400">
            <Maximize2 size={18} />
         </button>
      </div>
    </div>
  );
};