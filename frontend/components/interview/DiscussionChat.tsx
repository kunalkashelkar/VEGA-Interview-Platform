"use client";

import React, { useState } from 'react';
import { Send, MessageSquare } from 'lucide-react';

const DiscussionChat = () => {
  const [messages, setMessages] = useState([
    { user: 'Candidate_482', text: 'That coding problem was tricky!', role: 'other' },
    { user: 'Candidate_109', text: 'Yeah, I struggled with the edge cases.', role: 'other' },
  ]);
  const [input, setInput] = useState('');

  const sendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;
    setMessages([...messages, { user: 'You', text: input, role: 'me' }]);
    setInput('');
  };

  return (
    <div className="flex flex-col h-[500px] bg-white border border-orange-100 rounded-4xl overflow-hidden shadow-xl shadow-orange-100/20">
      <div className="px-8 py-6 bg-orange-50/30 border-b border-orange-50 flex justify-between items-center">
        <div className="flex items-center gap-2">
           <MessageSquare className="w-5 h-5 text-orange-500" />
           <h3 className="font-black text-black tracking-tight">Session Talk</h3>
        </div>
        <span className="text-[10px] font-black uppercase tracking-widest text-orange-600 bg-white px-3 py-1 rounded-full border border-orange-100 shadow-sm">Room Chat</span>
      </div>
      
      <div className="flex-1 overflow-y-auto p-8 space-y-6 custom-scrollbar bg-white">
        {messages.map((msg, i) => (
          <div key={i} className={`flex flex-col ${msg.role === 'me' ? 'items-end' : 'items-start'}`}>
            <span className="text-[10px] font-black text-black/20 uppercase tracking-widest mb-2 px-1">{msg.user}</span>
            <div className={`px-5 py-3 rounded-2xl max-w-[85%] text-sm font-black ${
              msg.role === 'me' 
              ? 'bg-orange-500 text-white shadow-lg shadow-orange-100' 
              : 'bg-gray-50 text-black border border-gray-100'
            }`}>
              {msg.text}
            </div>
          </div>
        ))}
      </div>

      <form onSubmit={sendMessage} className="p-6 bg-white border-t border-gray-50 flex gap-3">
        <input 
          type="text" 
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Type your message..."
          className="flex-1 bg-gray-50 border border-gray-100 rounded-2xl px-5 py-3 text-sm text-black font-medium focus:border-orange-200 focus:bg-white outline-none transition-all placeholder:text-black/20"
        />
        <button type="submit" className="w-12 h-12 flex items-center justify-center bg-orange-500 hover:bg-orange-600 rounded-2xl text-white shadow-lg shadow-orange-100 transition-all active:scale-95">
          <Send size={20} />
        </button>
      </form>
    </div>
  );
};

export default DiscussionChat;
