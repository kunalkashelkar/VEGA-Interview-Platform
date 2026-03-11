"use client";

import React from 'react';
import { Timer, Radio, Hash, LogOut } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';

const InterviewNavbar = ({ roomId, phase, timeRemaining, isDarkMode }: { roomId: string, phase: string, timeRemaining: number, isDarkMode?: boolean }) => {
  const router = useRouter();

  return (
    <nav className={`flex justify-between items-center px-8 py-4 border-b shadow-sm sticky top-0 z-50 transition-colors duration-500 ${isDarkMode ? 'bg-black border-gray-800 text-white' : 'bg-white border-gray-100 text-black'}`}>
      <div className="flex items-center gap-2">
         <div className="w-8 h-8 bg-orange-500 rounded-lg flex items-center justify-center">
            <Radio className="w-5 h-5 text-white animate-pulse" />
         </div>
         <div className={`text-xl font-black tracking-tighter transition-colors ${isDarkMode ? 'text-white' : 'text-black'}`}>NITI AI</div>
      </div>
      
      <div className="hidden md:flex items-center gap-8">
        <div className="flex items-center gap-2">
           <Hash className="w-4 h-4 text-orange-500" />
           <span className={`text-[10px] font-black uppercase tracking-widest mr-1 ${isDarkMode ? 'text-white/30' : 'text-black/30'}`}>Room</span>
           <span className={`font-black text-sm tracking-widest ${isDarkMode ? 'text-white' : 'text-black'}`}>{roomId}</span>
        </div>
        <div className="flex items-center gap-2">
           <div className={`w-2 h-2 rounded-full ${phase === 'coding' ? 'bg-orange-500 pulse' : isDarkMode ? 'bg-gray-800' : 'bg-gray-200'}`} />
           <span className={`text-[10px] font-black uppercase tracking-widest mr-1 ${isDarkMode ? 'text-white/30' : 'text-black/30'}`}>Phase</span>
           <span className={`font-black text-sm capitalize ${isDarkMode ? 'text-white' : 'text-black'}`}>{phase}</span>
        </div>
      </div>

      <div className="flex items-center gap-4">
        <div className="flex items-center gap-3 bg-orange-50 px-4 py-2 rounded-xl border border-orange-100">
          <Timer className="w-4 h-4 text-orange-600" />
          <span className="text-lg font-black font-mono text-orange-600 tracking-tighter">
            {Math.floor(timeRemaining / 60)}:{(timeRemaining % 60).toString().padStart(2, '0')}
          </span>
        </div>

        <Button 
          onClick={() => router.push('/')}
          variant="outline"
          className={`font-black text-[10px] tracking-widest uppercase border-red-100 text-red-500 hover:bg-red-50 transition-all ${isDarkMode ? 'bg-red-500/10 border-red-500/20 text-red-400' : ''}`}
        >
          <LogOut size={12} className="mr-2" /> Leave
        </Button>
      </div>
    </nav>
  );
};

export default InterviewNavbar;
