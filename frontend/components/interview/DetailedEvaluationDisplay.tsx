"use client";

import React from 'react';
import { 
  Brain, 
  TrendingUp, 
  Target,
  BookOpen, 
  GraduationCap, 
  Rocket,
  CheckCircle2,
  AlertCircle,
  PlayCircle,
  ExternalLink,
  Clock,
  BarChart3
} from 'lucide-react';
import Image from 'next/image';

interface DetailedEvaluationProps {
  evaluation: any;
}

export default function DetailedEvaluationDisplay({ evaluation }: DetailedEvaluationProps) {
  if (!evaluation?.detailedEvaluation) {
    return null;
  }

  const { detailedEvaluation } = evaluation;

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700 max-w-7xl mx-auto">
      
      {/* 1. Hero Bento Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Main Score & Summary Card */}
        <div className="md:col-span-2 bg-white border border-gray-200 rounded-xl p-6 shadow-sm relative overflow-hidden">
          <div className="flex items-start justify-between mb-4">
             <div className="flex items-center gap-3">
                <div className="p-2 bg-orange-50 rounded-lg">
                    <Brain className="w-5 h-5 text-orange-600" />
                </div>
                <div>
                   <h2 className="text-lg font-bold text-gray-900 leading-tight">AI Assessment</h2>
                   <p className="text-xs text-gray-500">Comprehensive performance analysis</p>
                </div>
             </div>
             {evaluation.percentage !== undefined && (
               <div className="flex flex-col items-end">
                  <span className="text-xl font-black text-gray-900">{Math.round(evaluation.percentage)}%</span>
                  <span className="text-[10px] text-gray-400 uppercase font-bold tracking-wider">Score</span>
               </div>
             )}
          </div>
          
          <h3 className="text-xl font-medium text-gray-800 mb-4 leading-relaxed tracking-tight">
              {detailedEvaluation.overallAssessment}
          </h3>

          <div className="flex flex-wrap gap-2 mt-auto">
              {detailedEvaluation.strengths?.slice(0, 3).map((s: any, i: number) => (
                  <span key={i} className="px-3 py-1 bg-green-50 text-green-700 border border-green-100 rounded-lg text-xs font-semibold flex items-center gap-1.5">
                    <CheckCircle2 size={12} /> {s.area}
                  </span>
              ))}
          </div>
        </div>

        {/* Readiness Card */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 shadow-sm text-white flex flex-col justify-between relative overflow-hidden">
           <div>
              <div className="flex items-center gap-2 mb-2 text-zinc-400">
                  <BarChart3 size={16} />
                  <span className="text-xs font-bold uppercase tracking-wider">Readiness</span>
              </div>
              <div className="text-2xl font-bold mb-1">{detailedEvaluation.interviewReadiness?.level || 'Analyzing...'}</div>
              <div className="text-sm text-zinc-400">Time to ready: <span className="text-white font-medium">{detailedEvaluation.interviewReadiness?.timeToReady || 'N/A'}</span></div>
           </div>
           
           <div className="mt-6 pt-6 border-t border-zinc-800">
              <div className="text-xs text-zinc-500 mb-2 uppercase font-bold tracking-wider">Focus Areas</div>
              <div className="space-y-1">
                 {detailedEvaluation.interviewReadiness?.focusAreas?.slice(0, 3).map((area: string, i: number) => (
                    <div key={i} className="text-sm text-zinc-300 flex items-center gap-2">
                       <span className="w-1 h-1 rounded-full bg-orange-500"></span> {area}
                    </div>
                 ))}
              </div>
           </div>
        </div>
      </div>

      {/* 2. Analysis Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Key Strengths */}
          <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm h-full">
               <div className="flex items-center gap-2 mb-4">
                  <TrendingUp className="w-4 h-4 text-green-600" />
                  <h3 className="text-base font-bold text-gray-900">Key Strengths</h3>
               </div>
               <div className="space-y-3">
                  {detailedEvaluation.strengths?.map((strength: any, idx: number) => (
                      <div key={idx} className="p-3 bg-gray-50 rounded-lg border border-gray-100 hover:border-green-100 transition-colors">
                          <h4 className="font-semibold text-sm text-gray-900 mb-1 flex items-center gap-2">
                             {strength.area}
                          </h4>
                          <p className="text-xs text-gray-600 leading-normal">{strength.description}</p>
                      </div>
                  ))}
               </div>
          </div>

          {/* Areas to Improve */}
          <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm h-full">
               <div className="flex items-center gap-2 mb-4">
                  <AlertCircle className="w-4 h-4 text-red-600" />
                  <h3 className="text-base font-bold text-gray-900">Areas for Improvement</h3>
               </div>
               <div className="space-y-3">
                  {detailedEvaluation.weaknesses?.map((weakness: any, idx: number) => (
                      <div key={idx} className="p-3 bg-gray-50 rounded-lg border border-gray-100 hover:border-red-100 transition-colors">
                          <h4 className="font-semibold text-sm text-gray-900 mb-1 flex items-center gap-2">
                             {weakness.area}
                          </h4>
                          <p className="text-xs text-gray-600 leading-normal">{weakness.description}</p>
                      </div>
                  ))}
               </div>
          </div>
      </div>

      {/* 3. Personalized Learning Roadmap (Bento Style) */}
      <section className="bg-white border border-gray-200 rounded-xl p-6 md:p-8 shadow-sm">
          <div className="flex items-center gap-3 mb-8 border-b border-gray-100 pb-4">
              <div className="p-2 bg-blue-50 rounded-lg">
                <BookOpen className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-900">Personalized Learning Roadmap</h3>
                <p className="text-xs text-gray-500 font-medium">Curated resources based on your skill gaps</p>
              </div>
          </div>

          <div className="space-y-10">
              {detailedEvaluation.topicsToLearn?.map((topic: any, idx: number) => (
                  <div key={idx} className="relative">
                      {/* Topic Header */}
                      <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-2 mb-4">
                          <h4 className="text-lg font-bold text-gray-900 flex items-center gap-3">
                            <span className="flex items-center justify-center w-6 h-6 rounded-full bg-gray-100 text-xs text-gray-500 font-mono">{idx + 1}</span>
                            {topic.topic}
                          </h4>
                          <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wide ${
                              topic.priority === 'High' ? 'bg-red-50 text-red-600' : 'bg-blue-50 text-blue-600'
                          }`}>
                              {topic.priority} Priority
                          </span>
                      </div>
                      <p className="text-sm text-gray-600 mb-6 pl-9 max-w-3xl">{topic.reason}</p>

             {/* Video Grid for Topic */}
                      {topic.recommendedVideos && topic.recommendedVideos.length > 0 ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 pl-0 sm:pl-9">
                            {topic.recommendedVideos.slice(0, 6).map((video: any, vidx: number) => (
                                <a 
                                    key={vidx} 
                                    href={video.link} 
                                    target="_blank" 
                                    rel="noopener noreferrer"
                                    className="group block bg-white rounded-lg overflow-hidden border border-gray-200 hover:border-gray-300 hover:shadow-md transition-all duration-200"
                                >
                                    {/* Thumbnail 16:9 */}
                                    <div className="aspect-video relative bg-gray-100 overflow-hidden">
                                        {video.thumbnail ? (
                                            <Image 
                                                src={video.thumbnail} 
                                                alt={video.title} 
                                                fill 
                                                className="object-cover transition-transform duration-500 group-hover:scale-105" 
                                            />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center text-gray-300">
                                                <PlayCircle size={24} />
                                            </div>
                                        )}
                                        
                                        {/* Overlay */}
                                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors flex items-center justify-center">
                                            <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center shadow-sm opacity-0 group-hover:opacity-100 transform scale-75 group-hover:scale-100 transition-all duration-200">
                                                <PlayCircle className="w-4 h-4 text-gray-900 fill-gray-900" />
                                            </div>
                                        </div>
                                        
                                        {video.length && (
                                            <div className="absolute bottom-1 right-1 px-1.5 py-0.5 bg-black/80 rounded text-[9px] font-medium text-white">
                                                {video.length}
                                            </div>
                                        )}
                                    </div>
                                    
                                    {/* Content */}
                                    <div className="p-2.5">
                                        <h5 className="text-[11px] font-semibold text-gray-900 leading-snug line-clamp-2 mb-1 group-hover:text-blue-600 transition-colors">
                                            {video.title}
                                        </h5>
                                        <div className="flex items-center justify-between text-[10px] text-gray-400 font-medium">
                                            <span className="truncate max-w-[80px]">{video.channel}</span>
                                            {video.views && <span>{video.views} views</span>}
                                        </div>
                                    </div>
                                </a>
                            ))}
                        </div>
                      ) : (
                        <div className="ml-9 p-4 bg-gray-50 rounded-lg text-center text-gray-400 text-xs border border-dashed border-gray-200">
                            Loading recommended tutorials...
                        </div>
                      )}
                  </div>
              ))}
          </div>
      </section>

      {/* 4. Footer Grid: Courses & Practice */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Recommended Courses */}
          <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
             <div className="flex items-center gap-2 mb-5">
                <GraduationCap className="w-4 h-4 text-purple-600" />
                <h3 className="text-base font-bold text-gray-900">Recommended Courses</h3>
             </div>
             <div className="space-y-3">
                {detailedEvaluation.recommendedCourses?.map((course: any, idx: number) => (
                    <div key={idx} className="flex gap-3 p-3 rounded-lg border border-gray-100 hover:bg-purple-50/30 transition-colors">
                        <div className="w-8 h-8 rounded bg-purple-50 flex items-center justify-center text-purple-600 font-bold text-xs shrink-0">
                            {idx + 1}
                        </div>
                        <div className="min-w-0 flex-1">
                            <h4 className="text-sm font-semibold text-gray-900 leading-tight truncate">{course.title}</h4>
                            <div className="text-xs text-gray-500 mt-1 flex items-center gap-2">
                                <span className="font-medium text-purple-600">{course.platform}</span>
                                <span>•</span> 
                                <span>{course.estimatedTime}</span>
                            </div>
                            {course.link && (
                                <a href={course.link} target="_blank" className="mt-2 inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-gray-400 hover:text-purple-600 transition-colors">
                                    View Course <ExternalLink size={10} />
                                </a>
                            )}
                        </div>
                    </div>
                ))}
            </div>
          </div>

          {/* Daily Practice */}
          <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
             <div className="flex items-center gap-2 mb-5">
                <Target className="w-4 h-4 text-indigo-600" />
                <h3 className="text-base font-bold text-gray-900">Practice Plan</h3>
             </div>
             <div className="space-y-3">
                 {detailedEvaluation.practiceRecommendations?.map((rec: any, idx: number) => (
                     <div key={idx} className="p-3 bg-indigo-50/20 rounded-lg border border-indigo-50/50">
                         <div className="flex justify-between items-start mb-1">
                             <h4 className="text-sm font-semibold text-indigo-900">{rec.action}</h4>
                             <span className="text-[9px] font-bold uppercase tracking-wide text-indigo-500 bg-indigo-50 px-1.5 py-0.5 rounded ml-2 whitespace-nowrap">{rec.frequency}</span>
                         </div>
                         <div className="flex items-center gap-2 mt-1">
                             <Clock size={10} className="text-gray-400" />
                             <span className="text-xs text-gray-500">{rec.duration}</span>
                             <span className="text-gray-300">•</span>
                             <span className="text-xs text-gray-400">{rec.category}</span>
                         </div>
                     </div>
                 ))}
             </div>
          </div>
      </div>

    </div>
  );
}
