"use client";

import * as React from "react";
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { 
  User, 
  Settings, 
  Code, 
  ArrowUpRight, 
  Info, 
  Users,
  Trophy,
  Brain,
  Sparkles
} from "lucide-react";

import { MultiStepForm } from "@/components/ui/multi-step-form";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toaster } from "@/components/ui/toaster";

export default function Dashboard() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);
  const [username, setUsername] = useState('');
  const [roomToJoin, setRoomToJoin] = useState('');
  const [showJoinInput, setShowJoinInput] = useState(false);
  const [config, setConfig] = useState({
    type: 'technical',
    capacity: 5,
    includeDSA: true,
    dsaCount: 2,
    vivaCount: 3,
    difficulty: 'medium',
    duration: 'auto', // minutes
  });

  const totalSteps = 3;

  const handleNext = () => {
    if (currentStep === 1 && !username.trim()) {
      toaster.create({
        title: "Name Required",
        description: "Please enter your name before continuing.",
        type: "warning",
      });
      return;
    }
    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1);
    } else {
      handleCreateRoom();
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleCreateRoom = () => {
    console.log('handleCreateRoom called');
    const roomId = Math.random().toString(36).substring(2, 9).toUpperCase();
    const configQuery = encodeURIComponent(JSON.stringify(config));
    const targetUrl = `/interview/${roomId}?username=${encodeURIComponent(username)}&config=${configQuery}`;
    console.log('Navigating to:', targetUrl);
    console.log('Config:', config);
    
    try {
      router.push(targetUrl);
      console.log('router.push executed');
    } catch (error) {
      console.error('Navigation error:', error);
      toaster.create({
        title: "Navigation Error",
        description: "Failed to navigate to interview room",
        type: "error",
      });
    }
  };

  const handleJoinRoom = async () => {
    if (!username.trim()) {
      toaster.create({
        title: "Profile Missing",
        description: "Please enter a username first!",
        type: "warning",
      });
      return;
    }
    if (!roomToJoin.trim()) {
      toaster.create({
        title: "Room ID Required",
        description: "Please enter a Room ID to join.",
        type: "warning",
      });
      return;
    }

    const cleanedRoomId = roomToJoin.trim().toUpperCase();

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5000'}/api/rooms/${cleanedRoomId}`);
      if (res.ok) {
        router.push(`/interview/${cleanedRoomId}?username=${encodeURIComponent(username)}`);
      } else {
        toaster.create({
          title: "Room Not Found",
          description: "This Room ID does not exist. Please check the code or create a new room.",
          type: "error",
        });
      }
    } catch (error) {
      console.error("Error checking room:", error);
      toaster.create({
        title: "Connection Error",
        description: "Failed to connect to the server. Is the backend running?",
        type: "error",
      });
    }
  };

  const handleNumericChange = (field: string, value: string) => {
    const parsed = parseInt(value);
    setConfig(prev => ({ ...prev, [field]: isNaN(parsed) ? 1 : parsed }));
  };

  return (
    <div className="min-h-screen bg-white text-black p-4 flex flex-col items-center justify-center font-sans bg-[radial-gradient(circle_at_top_right,var(--tw-gradient-stops))] from-orange-100/50 via-white to-white">
      <div className="absolute top-10 flex flex-col items-center">
         <div className="flex items-center gap-2 mb-1">
            <Sparkles className="w-6 h-6 text-orange-500 fill-orange-500" />
            <h1 className="text-4xl font-black tracking-tighter text-black">
               NITI AI
            </h1>
         </div>
         <div className="h-1 w-24 bg-orange-500 rounded-full" />
      </div>

      <MultiStepForm
        currentStep={currentStep}
        totalSteps={totalSteps}
        title={currentStep === 1 ? "Personal Identity" : currentStep === 2 ? "Room Specifications" : "Interview Content"}
        description={currentStep === 1 ? "Tell us who you are before starting the session." : currentStep === 2 ? "Configure the logistics of this interview room." : "Define the challenges and evaluation criteria."}
        onBack={handleBack}
        onNext={handleNext}
        size="lg"
        nextButtonText={currentStep === totalSteps ? "Create & Launch" : "Continue"}
        className="bg-white border-orange-100 shadow-[0_20px_50px_rgba(249,115,22,0.1)]"
        footerContent={
          <div className="flex items-center gap-1 text-xs text-black/40 uppercase tracking-widest font-bold">
            Niti AI <span className="text-orange-500">v1.2</span>
          </div>
        }
      >
        {/* Step 1: Identity */}
        {currentStep === 1 && (
          <div className="space-y-6 pt-4 animate-in fade-in slide-in-from-right-10 duration-500">
            <div className="space-y-4">
              <div className="flex items-center gap-3 mb-2">
                 <div className="p-2 bg-orange-50 rounded-lg"><User className="w-5 h-5 text-orange-600" /></div>
                 <Label htmlFor="username" className="text-lg font-bold text-black">Display Name</Label>
              </div>
              <Input
                id="username"
                placeholder="How should others see you?"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="h-14 bg-gray-50 border-gray-200 text-lg text-black focus-visible:ring-orange-500/30 focus-visible:border-orange-500 placeholder:text-black/30"
              />
              <p className="text-sm text-black/50 italic font-medium">This name will be displayed in the lobby and result board.</p>
            </div>
          </div>
        )}

        {/* Step 2: Room Specs */}
        {currentStep === 2 && (
          <div className="space-y-8 pt-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                   <div className="p-2 bg-orange-50 rounded-lg"><Settings className="w-5 h-5 text-orange-600" /></div>
                   <Label className="text-black font-bold">Interview Focus</Label>
                </div>
                <Select value={config.type} onValueChange={(v) => setConfig({...config, type: v})}>
                  <SelectTrigger className="h-12 bg-gray-50 border-gray-200 text-black">
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="technical">Technical (Coding Focus)</SelectItem>
                    <SelectItem value="behavioral">Behavioral (Soft Skills)</SelectItem>
                    <SelectItem value="hybrid">Hybrid (Comprehensive)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-4">
                 <div className="flex items-center gap-3">
                   <div className="p-2 bg-orange-50 rounded-lg"><Users className="w-5 h-5 text-orange-600" /></div>
                   <Label className="text-black font-bold">Participant Capacity</Label>
                </div>
                <Input
                  type="number"
                  min="1"
                  max="20"
                  value={config.capacity.toString()}
                  onChange={(e) => handleNumericChange('capacity', e.target.value)}
                  className="h-12 bg-gray-50 border-gray-200 text-black"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-4">
                 <Label className="text-black font-bold">Interview Duration</Label>
                 <Select value={config.duration} onValueChange={(v) => setConfig({...config, duration: v})}>
                    <SelectTrigger className="h-12 bg-gray-50 border-gray-200 text-black">
                      <SelectValue placeholder="Auto (Based on questions)" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="auto">Auto (Calculate for me)</SelectItem>
                      <SelectItem value="15">15 Minutes (Express)</SelectItem>
                      <SelectItem value="30">30 Minutes (Standard)</SelectItem>
                      <SelectItem value="45">45 Minutes (Extended)</SelectItem>
                      <SelectItem value="60">60 Minutes (Intensive)</SelectItem>
                    </SelectContent>
                 </Select>
                 <p className="text-[10px] text-black/40 font-bold uppercase tracking-wider">Calculates 15m/DSA + 5m/Voice if Auto</p>
              </div>

              <div className="space-y-4">
                 <Label className="text-black font-bold">Difficulty Level</Label>
                 <div className="grid grid-cols-3 gap-3">
                    {['Easy', 'Medium', 'Hard'].map((d) => (
                      <Button
                        key={d}
                        variant={config.difficulty === d.toLowerCase() ? 'default' : 'outline'}
                        onClick={() => setConfig({ ...config, difficulty: d.toLowerCase() })}
                        className={`h-12 rounded-xl border-2 transition-all font-black text-xs ${
                          config.difficulty === d.toLowerCase()
                            ? 'border-orange-500 bg-orange-500 text-white shadow-lg shadow-orange-200'
                            : 'border-gray-100 bg-gray-50/50 text-black hover:border-orange-200 hover:bg-orange-50/30'
                        }`}
                      >
                        {d}
                      </Button>
                    ))}
                 </div>
              </div>
            </div>
          </div>
        )}

        {/* Step 3: Content Setup */}
        {currentStep === 3 && (
          <div className="space-y-8 pt-4">
            <div className="p-6 rounded-2xl bg-orange-50/50 border border-orange-100 flex items-center justify-between">
               <div className="flex items-center gap-4">
                  <div className={`p-4 rounded-2xl transition-all ${config.includeDSA ? 'bg-orange-500 text-white shadow-lg shadow-orange-200' : 'bg-gray-200 text-black'}`}>
                     <Code className="w-8 h-8" />
                  </div>
                  <div>
                     <h3 className="text-xl font-black text-black">Coding Challenges</h3>
                     <p className="text-sm text-black/60 font-medium">Include real-time DSA coding round</p>
                  </div>
               </div>
               <Button 
                 variant={config.includeDSA ? 'default' : 'outline'}
                 onClick={() => setConfig({...config, includeDSA: !config.includeDSA})}
                 className={`w-28 h-12 rounded-xl font-black ${config.includeDSA ? 'bg-orange-500 hover:bg-orange-600' : 'border-gray-200 text-black'}`}
               >
                 {config.includeDSA ? 'ENABLED' : 'DISABLED'}
               </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-4">
                   <div className="flex items-center gap-3">
                      <Trophy className="w-5 h-5 text-orange-500" />
                      <Label className="text-black font-bold">DSA Question Count</Label>
                   </div>
                   <Input 
                      type="number"
                      disabled={!config.includeDSA}
                      value={config.includeDSA ? config.dsaCount : 0}
                      onChange={(e) => handleNumericChange('dsaCount', e.target.value)}
                      className="h-12 bg-gray-50 border-gray-200 text-black disabled:opacity-20"
                   />
                </div>
                <div className="space-y-4">
                   <div className="flex items-center gap-3">
                      <Brain className="w-5 h-5 text-orange-400" />
                      <Label className="text-black font-bold">Viva/Voice Count</Label>
                   </div>
                   <Input 
                      type="number"
                      value={config.vivaCount}
                      onChange={(e) => handleNumericChange('vivaCount', e.target.value)}
                      className="h-12 bg-gray-50 border-gray-200 text-black"
                   />
                </div>
            </div>

            <Alert className="bg-orange-50 border-orange-200 text-orange-700">
               <Info className="w-4 h-4 text-orange-600" />
               <AlertDescription className="font-bold">
                  Niti AI AI will automatically generate questions based on these parameters.
               </AlertDescription>
            </Alert>
          </div>
        )}
      </MultiStepForm>

      {/* Footer Actions */}
      <div className="mt-12 w-full max-w-lg flex flex-col items-center gap-6">
          {!showJoinInput ? (
              <button 
                onClick={() => setShowJoinInput(true)}
                className="text-black/50 hover:text-orange-600 transition-colors flex items-center gap-2 group font-black uppercase tracking-widest text-xs"
              >
                Join existing room <ArrowUpRight className="w-4 h-4 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
              </button>
          ) : (
              <div className="flex gap-2 w-full animate-in zoom-in-95 duration-300">
                  <Input 
                    placeholder="ENTER SECRET ROOM ID"
                    value={roomToJoin}
                    onChange={(e) => setRoomToJoin(e.target.value.toUpperCase())}
                    className="h-14 bg-white border-orange-200 text-center font-black tracking-widest text-orange-600 placeholder:text-gray-200"
                  />
                  <Button onClick={handleJoinRoom} className="h-14 px-8 bg-orange-500 hover:bg-orange-600 font-black text-white shadow-lg shadow-orange-100">JOIN</Button>
                  <Button variant="ghost" className="h-14 text-black/30 hover:text-orange-600" onClick={() => setShowJoinInput(false)}>✕</Button>
              </div>
          )}
          <p className="text-[10px] text-black/20 uppercase tracking-[0.4em] font-black">Advanced Agentic Coding Interface</p>
      </div>
    </div>
  );
}
