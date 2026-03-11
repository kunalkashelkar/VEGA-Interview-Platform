"use client";

import React, { useState, useEffect, useRef } from 'react';
import { X, Send, Sparkles, Brain, Code, Eye } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { CodeBlock, CodeBlockCode, CodeBlockGroup } from '@/components/ui/code-block';
import { Check, Copy } from 'lucide-react';
import { toaster } from '@/components/ui/toaster';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

interface AIChatModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentCode: string;
  problem: any;
}

export default function AIChatModal({ isOpen, onClose, currentCode, problem }: AIChatModalProps) {
  const [messages, setMessages] = useState<Message[]>([
    { role: 'assistant', content: "Hi! I'm your Niti AI assistant. I've analyzed the problem and your current progress. How can I help you? I can provide hints or explain concepts without giving away the full solution." }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  if (!isOpen) return null;

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage: Message = { role: 'user', content: input };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      if (!process.env.NEXT_PUBLIC_OPENROUTER_API_KEY || process.env.NEXT_PUBLIC_OPENROUTER_API_KEY === 'your_key_here') {
        throw new Error("API Key is missing or set to placeholder in .env.local. Please restart your dev server after adding the key.");
      }

      const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${process.env.NEXT_PUBLIC_OPENROUTER_API_KEY}`,
          "Content-Type": "application/json",
          "HTTP-Referer": "http://localhost:3000",
          "X-Title": "Niti AI Interview",
        },
        body: JSON.stringify({
          model: "stepfun/step-3.5-flash:free",
          messages: [
            {
              role: "system",
              content: `You are an elite coding interview assistant on the Niti AI platform. 
              Objective: Help the user solve the problem through hints, conceptual explanations, and logic walkthroughs.
              CRITICAL: NEVER provide a complete code solution in your response unless explicitly asked after multiple hints.
              Current Problem: ${problem?.title}
              Description: ${problem?.description}
              User's Current Code:
              \`\`\`
              ${currentCode}
              \`\`\`
              Be encouraging, professional, and focus on algorithmic efficiency.`
            },
            ...messages.filter(m => !m.content.startsWith("**REVEALED SOLUTION:**")).map(m => ({ role: m.role, content: m.content })),
            { role: "user", content: input }
          ],
        })
      });

      const data = await response.json();
      console.log("OpenRouter Response:", data);

      if (data.error) {
        throw new Error(`OpenRouter Error: ${data.error.message || JSON.stringify(data.error)}`);
      }

      const aiMessage: Message = { 
        role: 'assistant', 
        content: (data.choices?.[0]?.message?.content || "The AI returned an empty response. Please try again.")
          .replace(/(\*\*|__|'''|```|`)/g, '') // Strip markdown symbols
          .replace(/###/g, '') // Strip headers
          .trim()
      };
      setMessages(prev => [...prev, aiMessage]);
    } catch (error: any) {
      console.error("AI Error:", error);
      setMessages(prev => [...prev, { role: 'assistant', content: `CONNECTION ERROR: ${error.message || "Failed to connect to the assistant."}` }]);
    } finally {
      setIsLoading(false);
    }
  };

  const revealSolution = async () => {
     setIsLoading(true);
     try {
       if (!process.env.NEXT_PUBLIC_OPENROUTER_API_KEY || process.env.NEXT_PUBLIC_OPENROUTER_API_KEY === 'your_key_here') {
         throw new Error("API Key missing. Please restart dev server.");
       }

       const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
         method: "POST",
         headers: {
           "Authorization": `Bearer ${process.env.NEXT_PUBLIC_OPENROUTER_API_KEY}`,
           "Content-Type": "application/json",
           "HTTP-Referer": "http://localhost:3000",
           "X-Title": "Niti AI Interview",
         },
         body: JSON.stringify({
           model: "stepfun/step-3.5-flash:free",
           messages: [
             {
               role: "system",
               content: `The user has requested to REVEAL the solution. Provide the optimal code for the problem: ${problem?.title}. Use minimal comments and focus on clean, efficient code.`
             },
             { role: "user", content: "Please reveal the full solution for me now." }
           ],
         })
       });

       const data = await response.json();
       if (data.error) throw new Error(data.error.message || "OpenRouter Error");

       setMessages(prev => [...prev, { role: 'assistant', content: `**REVEALED SOLUTION:**\n\n${data.choices?.[0]?.message?.content || "No solution provided."}` }]);
     } catch (error: any) {
        console.error("Reveal Error:", error);
        setMessages(prev => [...prev, { role: 'assistant', content: `REVEAL ERROR: ${error.message}` }]);
     } finally {
        setIsLoading(false);
     }
  };

  return (
    <div className="fixed inset-0 z-100 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      
      {/* Modal */}
      <div className="relative w-full max-w-2xl bg-white/80 dark:bg-black/80 backdrop-blur-2xl border border-white/20 rounded-3xl shadow-2xl overflow-hidden flex flex-col h-[80vh] animate-in zoom-in-95 duration-300">
        
        {/* Header */}
        <div className="p-6 border-b border-gray-100/10 flex items-center justify-between">
           <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-orange-500 rounded-2xl flex items-center justify-center shadow-lg shadow-orange-500/20">
                 <Brain className="text-white w-6 h-6 animate-pulse" />
              </div>
              <div>
                 <h2 className="text-lg font-black tracking-tight text-black dark:text-white">AI HELP ASSISTANT</h2>
                 <p className="text-[10px] uppercase font-black tracking-widest text-orange-500">StepFun Powered</p>
              </div>
           </div>
           <button onClick={onClose} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl transition-colors text-gray-500">
              <X size={20} />
           </button>
        </div>

        {/* Chat Area */}
        <div ref={scrollRef} className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar">
           {messages.map((m, i) => {
             const parts = m.content.split(/(```[\s\S]*?```)/g);
             
             return (
               <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[90%] p-4 rounded-2xl ${
                    m.role === 'user' 
                    ? 'bg-orange-500 text-white shadow-lg shadow-orange-500/10 rounded-tr-none' 
                    : 'bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 text-black dark:text-white rounded-tl-none shadow-sm'
                  }`}>
                     <div className="space-y-4">
                        {parts.map((part, index) => {
                          if (part.startsWith('```')) {
                            const match = part.match(/```(\w+)?\n?([\s\S]*?)```/);
                            const lang = match?.[1] || 'tsx';
                            const codeStr = match?.[2] || '';
                            
                            return (
                              <div key={index} className="my-2">
                                <CodeBlock className="border-gray-100 dark:border-gray-800">
                                  <CodeBlockGroup className="border-b border-gray-100 dark:border-gray-800 py-1 px-3">
                                    <span className="text-[10px] font-bold uppercase text-orange-500">{lang}</span>
                                    <Button
                                      variant="ghost"
                                      size="icon"
                                      className="h-6 w-6 hover:bg-orange-500/10"
                                      onClick={() => {
                                        navigator.clipboard.writeText(codeStr);
                                        toaster.create({ title: "Copied", type: "success" });
                                      }}
                                    >
                                      <Copy className="h-3 w-3" />
                                    </Button>
                                  </CodeBlockGroup>
                                  <CodeBlockCode code={codeStr} language={lang} theme={m.role === 'user' ? 'github-dark' : 'github-light'} />
                                </CodeBlock>
                              </div>
                            );
                          }
                          return <p key={index} className="text-sm leading-relaxed whitespace-pre-wrap">{part}</p>;
                        })}
                     </div>
                  </div>
               </div>
             );
           })}
           {isLoading && (
              <div className="flex justify-start">
                 <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 p-4 rounded-2xl rounded-tl-none animate-pulse">
                    <div className="flex gap-1">
                       <div className="w-1.5 h-1.5 bg-orange-500 rounded-full animate-bounce" />
                       <div className="w-1.5 h-1.5 bg-orange-500 rounded-full animate-bounce [animation-delay:0.2s]" />
                       <div className="w-1.5 h-1.5 bg-orange-500 rounded-full animate-bounce [animation-delay:0.4s]" />
                    </div>
                 </div>
              </div>
           )}
        </div>

        {/* Action Bar */}
        <div className="px-6 py-4 flex gap-2">
           <Button 
             variant="outline" 
             onClick={revealSolution}
             className="h-10 rounded-xl border-orange-500/20 text-orange-500 font-bold text-xs hover:bg-orange-500 hover:text-white transition-all"
           >
              <Eye size={14} className="mr-2" /> REVEAL SOLUTION
           </Button>
           <div className="flex-1" />
        </div>

        {/* Input */}
        <div className="p-6 border-t border-gray-100/10">
           <div className="relative">
              <input 
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                placeholder="Ask for a hint or clarification..."
                className="w-full bg-gray-50 dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl py-4 pl-6 pr-14 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/50 transition-all text-black dark:text-white"
              />
              <button 
                onClick={handleSend}
                disabled={isLoading}
                className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 bg-orange-500 rounded-xl flex items-center justify-center text-white hover:bg-orange-600 transition-all shadow-lg shadow-orange-500/20 disabled:opacity-50"
              >
                 <Send size={18} />
              </button>
           </div>
        </div>
      </div>
    </div>
  );
}
