import React from 'react';
import { X, CheckCircle2, AlertCircle, TrendingUp, Award, BookOpen } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { generateEvaluationPDF } from '@/lib/pdf-generator';

interface EvaluationModalProps {
  isOpen: boolean;
  onClose: () => void;
  candidateName: string;
  score: number;
  evaluationData: any;
}

const EvaluationModal = ({ isOpen, onClose, candidateName, score, evaluationData }: EvaluationModalProps) => {
  if (!isOpen) return null;

  // Simulated AI evaluation data based on score
  const isHighPerformer = score > 800;
  
  const strengths = isHighPerformer 
    ? ["Excellent problem decomposition skills.", "Strong grasp of time complexity analysis.", "Clear and professional communication."]
    : ["Good attempt at identifying edge cases.", "Demonstrated persistence in debugging.", "Basic understanding of data structures."];

  const weaknesses = isHighPerformer
    ? ["Could optimize space complexity further.", "Minor syntax hesitations in corner cases."]
    : ["Struggled with optimal solution derivation.", "Communication could be more structured.", "Code modularity needs improvement."];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
      <div 
        className="absolute inset-0 bg-black/40 backdrop-blur-sm animate-in fade-in duration-300"
        onClick={onClose}
      />
      <div className="relative w-full max-w-2xl bg-white rounded-[2.5rem] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300 flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="bg-orange-500 p-8 flex justify-between items-start relative overflow-hidden">
          <div className="relative z-10 text-white">
            <div className="flex items-center gap-2 text-orange-100 font-black uppercase tracking-widest text-xs mb-2">
                <Award size={14} /> AI Assessment Report
            </div>
            <h2 className="text-3xl font-black tracking-tight">{candidateName}</h2>
            <div className="flex items-baseline gap-2 mt-1 opacity-90">
                <span className="text-5xl font-black">{score}</span>
                <span className="text-sm font-bold uppercase tracking-widest">/ 1000 Points</span>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="relative z-10 w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-all"
          >
            <X size={20} />
          </button>
          
          {/* Decorative background elements */}
          <div className="absolute top-0 right-0 p-8 opacity-10 text-black rotate-12">
            <TrendingUp size={180} />
          </div>
        </div>

        {/* Scrollable Content */}
        <div className="p-8 overflow-y-auto custom-scrollbar space-y-8 bg-white">
            
            {/* Executive Summary */}
            <div className="space-y-4">
                <div className="flex items-center gap-2 text-black/30 font-black uppercase tracking-widest text-xs">
                    <BookOpen size={14} /> Executive Summary
                </div>
                <p className="text-black/70 leading-relaxed font-medium">
                    {isHighPerformer 
                        ? `${candidateName} demonstrated exceptional technical competency. The solution for the algorithmic challenge was optimal (O(n)), and the voice responses indicated a deep understanding of standard engineering practices.` 
                        : `${candidateName} showed potential but struggled with the advanced concepts. While the core logic was sound, the solution lacked the necessary optimizations for a production-grade environment.`}
                </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Key Strengths */}
                <div className="space-y-4">
                    <div className="flex items-center gap-2 text-green-600 font-black uppercase tracking-widest text-xs">
                        <CheckCircle2 size={14} /> Key Strengths
                    </div>
                    <div className="space-y-3">
                        {strengths.map((s, i) => (
                            <div key={i} className="flex items-start gap-3 bg-green-50/50 p-4 rounded-2xl border border-green-100">
                                <div className="mt-1 min-w-[6px] h-[6px] rounded-full bg-green-500" />
                                <p className="text-sm font-bold text-green-900">{s}</p>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Areas for Improvement */}
                <div className="space-y-4">
                    <div className="flex items-center gap-2 text-orange-600 font-black uppercase tracking-widest text-xs">
                        <AlertCircle size={14} /> Areas for Improvement
                    </div>
                    <div className="space-y-3">
                        {weaknesses.map((w, i) => (
                            <div key={i} className="flex items-start gap-3 bg-orange-50 p-4 rounded-2xl border border-orange-100">
                                <div className="mt-1 min-w-[6px] h-[6px] rounded-full bg-orange-500" />
                                <p className="text-sm font-bold text-orange-900">{w}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Recommended Path */}
            <div className="bg-gray-50 border border-gray-100 rounded-3xl p-6">
                <div className="flex items-center gap-2 text-black font-black uppercase tracking-widest text-xs mb-4">
                    <TrendingUp size={14} /> Recommended Learning Path
                </div>
                <div className="flex gap-2 flex-wrap">
                    {['Advanced DP', 'System Design Primitives', 'Concurrent Collections'].map(tag => (
                        <span key={tag} className="px-3 py-1 bg-white border border-gray-200 rounded-full text-xs font-bold text-black/60 shadow-sm">
                            {tag}
                        </span>
                    ))}
                </div>
            </div>
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-gray-50 bg-gray-50/30 flex justify-end gap-3">
            <Button variant="ghost" onClick={onClose} className="font-bold text-black/50 hover:text-black">Close</Button>
            <Button 
                onClick={() => evaluationData && generateEvaluationPDF(candidateName, score, evaluationData)}
                className="bg-orange-500 text-white font-bold rounded-xl hover:bg-orange-600"
            >
                Download PDF Report
            </Button>
        </div>
      </div>
    </div>
  );
};

export default EvaluationModal;
