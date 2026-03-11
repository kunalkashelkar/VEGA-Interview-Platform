"use client";

import React, { useState, useEffect, useRef } from 'react';
import Waveform from './Waveform';
import { Mic, MicOff, CheckCircle, Radio, Loader2, Play } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Vapi from '@vapi-ai/web';
import { toaster } from '@/components/ui/toaster';

interface VoiceArenaProps {
  questions?: any[];
  onFinish?: () => void;
}

// Singleton instance to prevent "Duplicate DailyIframe" errors
let vapiInstance: Vapi | null = null;

const VoiceArena = ({ questions = [], onFinish }: VoiceArenaProps) => {
  const [isAiSpeaking, setIsAiSpeaking] = useState(false);
  const [isConnecting, setIsConnecting] = useState(true);
  const [isConnected, setIsConnected] = useState(false);
  const [transcript, setTranscript] = useState<{ role: 'ai' | 'user', text: string }[]>([]);
  const [isMicOn, setIsMicOn] = useState(true);
  const vapiRef = useRef<Vapi | null>(null);

  // Use a ref to track if we've already initialized to prevent double-firing in Strict Mode
  const initialized = useRef(false);
  const mounted = useRef(true);

  useEffect(() => {
    mounted.current = true;

    const initVapi = async () => {
        // strict mode guard
        if (initialized.current) return;
        initialized.current = true;

        const publicKey = process.env.NEXT_PUBLIC_VAPI_PUBLIC_KEY;
        if (!publicKey) {
          toaster.create({
            title: "Vapi Key Missing",
            description: "Please add NEXT_PUBLIC_VAPI_PUBLIC_KEY to your .env.local",
            type: "error"
          });
          if (mounted.current) setIsConnecting(false);
          return;
        }

        if (!vapiInstance) {
          vapiInstance = new Vapi(publicKey);
        }
        const vapi = vapiInstance;
        vapiRef.current = vapi;
        
        // RACECONDITION FIX: Ensure previous session is fully dead
        try {
           vapi.stop(); 
        } catch (e) { } 
        
        // Wait for internal cleanup (crucial for "Duplicate DailyIframe" / Race conditions)
        await new Promise(resolve => setTimeout(resolve, 500));
        
        if (!mounted.current) return; // Stop if unmounted

        // Clean up listeners
        vapi.removeAllListeners();

        const assistant = {
          name: "Niti AI Interviewer",
          firstMessage: "Hello! I'm your Niti AI interviewer. I've reviewed your coding solution. Let's move on to the voice evaluation questions. Are you ready?",
          model: {
            provider: "openai" as const,
            model: "gpt-4",
            messages: [
              {
                role: "system",
                content: `You are a professional technical interviewer at Niti AI. 
                Your goal is to conduct a voice interview based on the following questions:
                ${questions.map((q, i) => `${i + 1}. ${q.question}`).join('\n')}
                
                Key: The candidate's generated answers for reference are:
                ${questions.map((q, i) => `Q${i + 1} Expected: ${q.answer}`).join('\n')}

                INSTRUCTIONS:
                1. Introduce yourself briefly if this is the start.
                2. Ask the questions one by one. Do not dump all questions at once.
                3. Listen to the candidate's response. You can ask follow-up questions if needed to clarify their answer.
                4. If the candidate is stuck, provide a small hint.
                5. Once all questions are covered, thank the candidate and tell them they can click "FINISH INTERVIEW".
                6. Keep your tone professional, encouraging, and clear.`
              }
            ]
          },
          voice: {
            provider: "vapi" as const,
            voiceId: "Kylie",
          },
          transcriber: {
            provider: "deepgram" as const,
            model: "nova-2", 
            language: "en"
          }
        };

        console.log("Starting Vapi with assistant config:", JSON.stringify(assistant));
        
        vapi.on('call-start', () => {
          if (!mounted.current) return;
          setIsConnected(true);
          setIsConnecting(false);
        });

        vapi.on('call-end', () => {
          if (!mounted.current) return;
          setIsConnected(false);
          setIsConnecting(false);
          setIsAiSpeaking(false);
        });

        vapi.on('speech-start', () => {
            if (mounted.current) setIsAiSpeaking(true);
        });
        vapi.on('speech-end', () => {
            if (mounted.current) setIsAiSpeaking(false);
        });

    vapi.on('message', (message: any) => {
          if (!mounted.current) return;
          if (message.type === 'transcript' && message.transcriptType === 'final') {
            setTranscript(prev => {
              const newRole = message.role === 'assistant' ? 'ai' : 'user';
              const newText = message.transcript;

              if (prev.length === 0) {
                return [{ role: newRole, text: newText }];
              }

              const lastMsg = prev[prev.length - 1];
              if (lastMsg.role === newRole) {
                // Deduplication: Check if the new text is already at the end of the last message
                const cleanNewText = newText.trim();
                const cleanLastText = lastMsg.text.trim();
                
                if (cleanLastText.endsWith(cleanNewText)) {
                    return prev; // Ignore duplicate
                }
                
                return [
                  ...prev.slice(0, -1),
                  { ...lastMsg, text: lastMsg.text + " " + newText }
                ];
              } else {
                return [...prev, { role: newRole, text: newText }];
              }
            });
          }
          if (message.type === 'error') {
              console.error("Vapi Message Error:", message);
          }
        });

        vapi.on('error', (e) => {
          console.error("Vapi Error Event:", JSON.stringify(e, null, 2));
          if (!mounted.current) return;
          setIsConnecting(false);
        });

        try {
            await vapi.start(assistant as any);
        } catch (err) {
            console.error("Failed to start Vapi:", err);
            if (mounted.current) setIsConnecting(false);
        }
    };

    initVapi();

    return () => {
      mounted.current = false;
      const instance = vapiInstance || vapiRef.current; // Fallback to ref if singleton logic fails
      if (instance) {
        instance.stop();
        instance.removeAllListeners();
      }
      vapiRef.current = null;
      initialized.current = false; 
    };
  }, []); // Remove dependency on questions to strictly run once on mount

  const handleToggleMic = () => {
    if (vapiRef.current) {
      const newStatus = !isMicOn;
      vapiRef.current.setMuted(!newStatus);
      setIsMicOn(newStatus);
    }
  };

  const handleFinish = () => {
    if (vapiRef.current) {
        vapiRef.current.stop();
        vapiRef.current.removeAllListeners();
    }
    if (onFinish) {
        onFinish();
    }
  };

  return (
    <div className="flex flex-col lg:flex-row h-[calc(100vh-64px)] bg-[radial-gradient(circle_at_top_left,var(--tw-gradient-stops))] from-orange-50/50 via-white to-white text-black p-6 lg:p-12 gap-12 overflow-hidden">
      
      {/* LEFT: Visualizer & Status */}
      <div className="flex-1 flex flex-col items-center justify-center animate-in fade-in slide-in-from-left-10 duration-700">
        <div className="relative mb-12 group">
            <div className={`absolute -inset-1 rounded-full blur-2xl transition-all duration-1000 ${isAiSpeaking ? 'bg-orange-300/40 opacity-100' : 'bg-gray-200/0 opacity-0'}`} />
            <div className={`w-80 h-80 rounded-full border-4 flex items-center justify-center transition-all duration-500 relative z-10 bg-white ${
            isAiSpeaking ? 'border-orange-500 shadow-2xl shadow-orange-200 scale-105' : 'border-gray-100 shadow-xl shadow-gray-100'
            }`}>
            <div className="text-center flex flex-col items-center text-black">
                {isConnecting ? (
                    <div className="flex flex-col items-center gap-4">
                        <Loader2 className="w-16 h-16 text-orange-500 animate-spin" />
                        <span className="text-xs font-black uppercase tracking-[0.3em] text-orange-400 animate-pulse">Initializing Neural Link...</span>
                    </div>
                ) : (
                    <>
                        <div className={`text-[10px] font-black uppercase tracking-[0.3em] mb-8 transition-colors ${isAiSpeaking ? 'text-orange-500' : 'text-black/20'}`}>
                            {isConnected ? (isAiSpeaking ? 'AI Speaking' : 'Listening Mode') : 'Session Ended'}
                        </div>
                        <div className="w-48 h-32 flex items-center justify-center">
                            <Waveform isActive={isAiSpeaking} />
                        </div>
                    </>
                )}
            </div>
            </div>
        </div>

        <div className="flex flex-col items-center gap-6">
            <div className="text-center space-y-2">
                <h2 className="text-3xl font-black tracking-tight text-black">Voice Round</h2>
                <p className="text-black/40 font-medium text-sm">Speak clearly. The AI is listening.</p>
            </div>

            <div className="flex items-center gap-6">
                <button 
                    disabled={!isConnected}
                    onClick={handleToggleMic}
                    className={`w-20 h-20 rounded-3xl border-2 flex items-center justify-center transition-all duration-300 ${
                    !isConnected ? 'opacity-50 cursor-not-allowed border-gray-100 text-gray-300' :
                    isMicOn 
                    ? 'bg-white border-gray-100 text-black/60 hover:border-orange-200 hover:text-orange-500 hover:shadow-xl hover:shadow-orange-100/50 hover:-translate-y-1' 
                    : 'bg-red-50 border-red-100 text-red-500 hover:bg-red-100 hover:scale-105 shadow-lg shadow-red-100'
                    }`}
                >
                    {isMicOn ? <Mic size={28} /> : <MicOff size={28} />}
                </button>
                
                <Button 
                    disabled={isConnecting}
                    onClick={handleFinish}
                    className="h-20 px-10 bg-black text-white hover:bg-orange-600 hover:scale-[1.02] active:scale-[0.98] font-black rounded-3xl flex items-center gap-3 shadow-2xl shadow-black/5 hover:shadow-orange-200 transition-all text-sm uppercase tracking-widest"
                >
                    <CheckCircle size={20} /> Finish Interview
                </Button>
            </div>
        </div>
      </div>
      
      {/* RIGHT: Transcript */}
      <div className="flex-1 w-full max-w-2xl bg-white border border-gray-100 rounded-[2.5rem] p-10 shadow-[0_40px_100px_rgba(0,0,0,0.05)] flex flex-col animate-in fade-in slide-in-from-right-10 duration-700 delay-150">
          <div className="flex items-center justify-between mb-8 border-b border-gray-50 pb-6">
             <h3 className="text-black/30 text-[10px] font-black uppercase tracking-[0.3em] flex items-center gap-3">
                <span className="w-2 h-2 bg-orange-500 rounded-full animate-pulse" />
                Live Transcript
             </h3>
             <div className="px-3 py-1 bg-orange-50 rounded-full border border-orange-100 text-[10px] font-black text-orange-600 uppercase tracking-widest">
                Real-time
             </div>
          </div>

          <div className="flex-1 overflow-y-auto space-y-6 pr-4 custom-scrollbar">
            {transcript.length === 0 && !isConnecting && (
              <div className="flex flex-col items-center justify-center h-full text-black/20 gap-4">
                 <Radio className="w-8 h-8 opacity-20" />
                 <span className="font-black uppercase tracking-widest text-xs">Waiting for conversation...</span>
              </div>
            )}
            
            {transcript.map((line, i) => (
              <div key={i} className={`flex ${line.role === 'ai' ? 'justify-start' : 'justify-end'} animate-in slide-in-from-bottom-2 duration-500`}>
                 <div className={`max-w-[85%] p-6 rounded-3xl text-sm leading-relaxed font-bold tracking-tight ${
                   line.role === 'ai' 
                   ? 'bg-orange-50 border border-orange-100 text-black rounded-tl-none shadow-sm' 
                   : 'bg-white border border-gray-100 text-black/70 rounded-tr-none shadow-sm'
                 }`}>
                   <span className="block text-[9px] uppercase tracking-widest opacity-30 mb-2 font-black">
                    {line.role === 'ai' ? 'Interviewer' : 'You'}
                   </span>
                   {line.text}
                 </div>
              </div>
            ))}
            
            {isAiSpeaking && (
              <div className="flex justify-start animate-pulse">
                <div className="bg-orange-50/30 border border-dashed border-orange-200 px-6 py-4 rounded-3xl rounded-tl-none text-orange-400 text-[10px] font-black tracking-widest flex items-center gap-3">
                   <div className="flex gap-1">
                     <div className="w-1 h-1 bg-orange-400 rounded-full animate-bounce delay-0" />
                     <div className="w-1 h-1 bg-orange-400 rounded-full animate-bounce delay-150" />
                     <div className="w-1 h-1 bg-orange-400 rounded-full animate-bounce delay-300" />
                   </div>
                   AI IS THINKING...
                </div>
              </div>
            )}
            <div id="transcript-end" />
          </div>
      </div>

      <style jsx>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #ffe7d9;
          border-radius: 10px;
        }
      `}</style>
    </div>
  );
};

export default VoiceArena;
