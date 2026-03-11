"use client";

import React, { useState } from 'react';
import { 
  ShieldCheck, 
  UserCheck, 
  Zap, 
  Radio, 
  Users,
  Copy,
  MessageCircle
} from 'lucide-react';

interface Participant {
  id: string;
  name: string;
  isReady: boolean;
}

const Lobby = ({ roomId, participants, onReady }: { roomId: string, participants: Participant[], onReady: (status: boolean) => void }) => {
  const [isReady, setIsReady] = useState(false);
  const readyCount = participants.filter(p => p.isReady).length;

  const toggleReady = () => {
    const nextStatus = !isReady;
    setIsReady(nextStatus);
    onReady(nextStatus);
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-64px)] bg-white text-black p-6">
      {/* Ready Counter Banner */}
      <div className="mb-12 flex flex-col items-center gap-4">
        <div className="flex gap-2">
            {participants.map((p) => (
                <div 
                  key={p.id} 
                  className={`w-3 h-3 rounded-full transition-all duration-500 ${
                    p.isReady ? 'bg-orange-500 shadow-[0_0_10px_rgba(249,115,22,0.4)]' : 'bg-gray-200'
                  }`} 
                />
            ))}
        </div>
        <div className="text-sm font-black uppercase tracking-widest text-black/40">
           <span className="text-orange-600 font-black">{readyCount}</span> of <span className="text-black">{participants.length}</span> Participants Ready
        </div>
      </div>

      <div className="max-w-5xl w-full grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Left: Info & Gear Check */}
        <div className="space-y-6">
           <div className="bg-white border border-orange-100 p-8 rounded-4xl shadow-[0_10px_40px_rgba(249,115,22,0.05)]">
              <h2 className="text-2xl font-black mb-6 flex items-center gap-3 text-black">
                 <div className="w-2 h-8 bg-orange-500 rounded-full" />
                 Interview Protocol
              </h2>
              <div className="space-y-6 text-black font-medium text-sm leading-relaxed">
                <div className="flex items-start gap-4">
                  <div className="mt-1 w-8 h-8 rounded-xl bg-orange-100 shrink-0 flex items-center justify-center text-orange-600 text-xs font-black">01</div>
                  <p>The timer starts as soon as you enter the coding arena. Focus on efficiency and edge cases.</p>
                </div>
                <div className="flex items-start gap-4">
                  <div className="mt-1 w-8 h-8 rounded-xl bg-orange-100 shrink-0 flex items-center justify-center text-orange-600 text-xs font-black">02</div>
                  <p>After coding, the AI will ask follow-up questions. Your verbal explanation counts for 40% of the score.</p>
                </div>
                <div className="flex items-start gap-4">
                  <div className="mt-1 w-8 h-8 rounded-xl bg-orange-100 shrink-0 flex items-center justify-center text-orange-600 text-xs font-black">03</div>
                  <p>Ensure dynamic communication. Explain <b>why</b> you chose a specific data structure.</p>
                </div>
              </div>
           </div>

           <button
             onClick={toggleReady}
             className={`w-full py-6 rounded-2xl font-black text-xl shadow-xl transition-all duration-300 transform hover:scale-[1.01] active:scale-[0.99] border-b-4 ${
               isReady 
               ? 'bg-orange-600 border-orange-800 text-white shadow-orange-900/10' 
               : 'bg-white border-orange-200 text-orange-600 shadow-orange-100 hover:bg-orange-50'
             }`}
           >
             {isReady ? 'WAITING FOR OTHERS...' : 'SIGNAL READY'}
           </button>
        </div>

        {/* Right: Participant List */}
        <div className="bg-white border border-gray-100 p-8 rounded-4xl flex flex-col shadow-[0_10px_40px_rgba(0,0,0,0.03)]">
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-lg font-black text-black flex items-center gap-2">
               <Users className="w-5 h-5 text-orange-500" />
               Room Members
            </h3>
            <div className="flex items-center gap-2 px-3 py-1 bg-orange-50 rounded-full">
               <Radio className="w-3 h-3 text-orange-500 animate-pulse" />
               <span className="text-[10px] font-black text-orange-600 uppercase tracking-tighter">Live Sessions</span>
            </div>
          </div>
          
          <div className="space-y-4 flex-1 overflow-y-auto custom-scrollbar pr-2">
            {participants.map((p) => (
              <div key={p.id} className="group flex items-center justify-between p-5 bg-gray-50/50 rounded-3xl border border-gray-100 hover:border-orange-200 hover:bg-orange-50/30 transition-all">
                <div className="flex items-center gap-4">
                    <div className="relative">
                        <div className="w-12 h-12 rounded-2xl bg-white border border-gray-200 flex items-center justify-center text-xl font-black text-black/20 group-hover:border-orange-500 group-hover:text-orange-500 transition-all">
                            {p.name[0]?.toUpperCase()}
                        </div>
                        {p.isReady && (
                            <div className="absolute -top-1 -right-1 w-4 h-4 bg-orange-500 rounded-full border-2 border-white flex items-center justify-center">
                                <div className="w-1.5 h-1.5 bg-white rounded-full animate-pulse" />
                            </div>
                        )}
                    </div>
                    <div className="flex flex-col">
                        <span className="font-black text-black">{p.name}</span>
                        <span className="text-[10px] text-black/30 font-black uppercase tracking-widest">{p.isReady ? 'Ready to Start' : 'Entering Room...'}</span>
                    </div>
                </div>
                {p.isReady ? (
                    <UserCheck className="w-5 h-5 text-orange-500" />
                ) : (
                    <Zap className="w-5 h-5 text-gray-200 animate-pulse" />
                )}
              </div>
            ))}
          </div>

          {/* Invite Section */}
          <div className="mt-8 pt-8 border-t border-gray-100">
             <h3 className="text-sm font-black text-black/40 uppercase tracking-widest mb-4">Invite Others</h3>
             <div className="flex gap-3">
                <button 
                  onClick={() => {
                    navigator.clipboard.writeText(window.location.href);
                    // could add a toast here ideally
                    const btn = document.getElementById('copy-btn-text');
                    if (btn) btn.innerText = 'Copied!';
                    setTimeout(() => { if (btn) btn.innerText = 'Copy Link'; }, 2000);
                  }}
                  className="flex-1 py-3 px-4 bg-gray-50 hover:bg-orange-50 border border-gray-200 hover:border-orange-200 rounded-xl font-bold text-black hover:text-orange-600 transition-all flex items-center justify-center gap-2 group"
                >
                  <Copy size={16} className="text-black/30 group-hover:text-orange-500" />
                  <span id="copy-btn-text">Copy Link</span>
                </button>
                <button 
                  onClick={() => {
                    const url = encodeURIComponent(window.location.href);
                    const text = encodeURIComponent("Join me for a mock interview session on Niti AI! 🚀");
                    window.open(`https://wa.me/?text=${text}%20${url}`, '_blank');
                  }}
                  className="flex-1 py-3 px-4 bg-[#25D366]/10 hover:bg-[#25D366]/20 border border-[#25D366]/20 rounded-xl font-bold text-[#25D366] transition-all flex items-center justify-center gap-2"
                >
                  <MessageCircle size={16} />
                  WhatsApp
                </button>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Lobby;
