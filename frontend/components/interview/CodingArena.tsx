"use client";

import React, { useState } from 'react';
import Editor from '@monaco-editor/react';
import { Play, Send, Layout, Terminal, Moon, Sun, Sparkles, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toaster } from '@/components/ui/toaster';
import AIChatModal from './AIChatModal';
import { evaluateCode } from '@/lib/ai-generator';

interface CodingArenaProps {
  problems: any[];
  isDarkMode: boolean;
  setIsDarkMode: (val: boolean) => void;
  onFinishCoding?: (code: string) => void;
}

const BOILERPLATES: Record<string, string> = {
  javascript: `function solution(nums, target) {\n  // Write your code here\n  \n}`,
  python: `def solution(nums, target):\n    # Write your code here\n    pass`,
  cpp: `#include <iostream>\n#include <vector>\n\nusing namespace std;\n\nclass Solution {\npublic:\n    vector<int> solution(vector<int>& nums, int target) {\n        // Write your code here\n        return {};\n    }\n};`
};

const CodingArena = ({ problems = [], isDarkMode, setIsDarkMode, onFinishCoding }: CodingArenaProps) => {
  const [currentIdx, setCurrentIdx] = useState(0);
  const problem = problems[currentIdx];

  const [language, setLanguage] = useState('javascript');
  // Initialize with dynamic boilerplate if available
  const [code, setCode] = useState(problems[0]?.boilerplates?.['javascript'] || BOILERPLATES.javascript);
  const [output, setOutput] = useState('');
  const [isAIModalOpen, setIsAIModalOpen] = useState(false);
  const [isEvaluating, setIsEvaluating] = useState(false);
  const [isSolved, setIsSolved] = useState(false);

  const handleLanguageChange = (newLang: string) => {
    setLanguage(newLang);
    // Use AI-generated boilerplate if available, otherwise fallback to hardcoded defaults
    const newCode = problem?.boilerplates?.[newLang] || BOILERPLATES[newLang] || "";
    setCode(newCode);
    setIsSolved(false);
  };

  const handleRunCode = async () => {
    if (isEvaluating) return;
    setIsEvaluating(true);
    setOutput("Compiling and running against test cases...");

    try {
      const result = await evaluateCode({
        code,
        language,
        testCases: problem?.testCases || [],
        problemTitle: problem?.title || "Unknown Problem"
      });

      let consoleLogs = result.compilerOutput ? `[Compiler Output]\n${result.compilerOutput}\n\n` : "";

      if (result.results && result.results.length > 0) {
        consoleLogs += result.results.map((res: any, i: number) => {
          let log = `> Test Case ${i + 1}: ${res.passed ? '✅ PASS' : '❌ FAIL'}\n  Input: ${res.input}\n  Expected: ${res.expected}\n  Output: ${res.actual}`;
          if (res.stdout) {
            log += `\n  Stdout: ${res.stdout}`;
          }
          return log;
        }).join('\n\n');
      } else {
        consoleLogs += result.success ? "All tests passed!" : "Generation failed to return specific test results.";
      }

      setOutput(consoleLogs);
      setIsSolved(result.success);

      toaster.create({
        title: result.success ? "Tests Passed!" : "Tests Failed",
        description: result.success ? "Your solution passed all sample cases." : "Check the console for errors.",
        type: result.success ? "success" : "error",
      });
    } catch (err: any) {
      console.error(err);
      setOutput(`Error: ${err.message || "Failed to contact code runner service."}`);
    } finally {
      setIsEvaluating(false);
    }
  };

  const handleNextQuestion = () => {
    if (currentIdx < problems.length - 1) {
      setCurrentIdx(prev => prev + 1);
      const nextProblem = problems[currentIdx + 1];
      setCode(nextProblem?.boilerplates?.[language] || BOILERPLATES[language] || BOILERPLATES.javascript);
      setOutput("");
      setIsSolved(false);
      toaster.create({
        title: `Question ${currentIdx + 2}`,
        description: "Moving to the next challenge.",
        type: "info"
      });
    }
  };

  const handleSubmit = async () => {
    if (!isSolved) {
      toaster.create({
        title: "Incomplete Solution",
        description: "You must pass the tests for the final question before submitting.",
        type: "warning"
      });
      return;
    }

    setIsEvaluating(true);
    try {
      toaster.create({
        title: "Submission Successful",
        description: "All solutions saved. Proceeeding to Voice round.",
        type: "success",
      });

      if (onFinishCoding) onFinishCoding(code);
    } catch (err) {
      toaster.create({ title: "Submission Failed", type: "error" });
    } finally {
      setIsEvaluating(false);
    }
  };

  return (
    <div className={`flex flex-col h-[calc(100vh-64px)] transition-colors duration-500 ${isDarkMode ? 'bg-black text-white' : 'bg-white text-black'}`}>
      <div className="flex flex-1 overflow-hidden">
        {/* Problem Panel */}
        <div className={`w-1/3 p-8 overflow-y-auto border-r transition-colors ${isDarkMode ? 'border-gray-800 bg-gray-950' : 'border-gray-100 bg-white'}`}>
          <div className="flex justify-between items-center mb-6">
            <div className="flex items-center gap-2">
              <div className={`p-2 rounded-lg ${isDarkMode ? 'bg-orange-500/10' : 'bg-orange-100'}`}>
                <Layout className={`w-5 h-5 ${isDarkMode ? 'text-orange-500' : 'text-orange-600'}`} />
              </div>
              <h2 className="text-xl font-black tracking-tight">{problem?.title || "Problem Loading..."}</h2>
            </div>
            <span className={`px-3 py-1 text-[10px] font-black uppercase rounded-full border transition-colors ${isDarkMode ? 'bg-orange-500/10 text-orange-400 border-orange-500/20' : 'bg-orange-50 text-orange-600 border-orange-100'
              }`}>{problem?.difficulty || "Medium"}</span>
          </div>

          <div className={`space-y-6 text-sm leading-relaxed font-medium transition-colors ${isDarkMode ? 'text-gray-400' : 'text-black'}`}>
            <p className={`font-bold ${isDarkMode ? 'text-gray-200' : 'text-black'}`}>{problem?.description || "In this challenge, you need to find two numbers in an array that add up to a specific target."}</p>

            <div className={`p-5 rounded-2xl border font-mono text-xs transition-colors ${isDarkMode ? 'bg-gray-900/50 border-gray-800' : 'bg-gray-50 border-gray-100'
              }`}>
              <span className="text-orange-500 font-black tracking-widest uppercase block mb-2 opacity-50">Example</span>
              <div className="space-y-1">
                <div className="flex gap-2">
                  <span className={isDarkMode ? 'text-gray-500' : 'text-black/40'}>Input:</span>
                  <code className={`font-black ${isDarkMode ? 'text-gray-200' : 'text-black'}`}>{problem?.example?.input || "nums = [2,7,11,15], target = 9"}</code>
                </div>
                <div className="flex gap-2">
                  <span className={isDarkMode ? 'text-gray-500' : 'text-black/40'}>Output:</span>
                  <code className={`font-black ${isDarkMode ? 'text-gray-200' : 'text-black'}`}>{problem?.example?.output || "[0,1]"}</code>
                </div>
              </div>
            </div>

            {problem?.testCases && (
              <div className="space-y-4">
                <h3 className={`text-xs font-black uppercase tracking-widest ${isDarkMode ? 'text-gray-400' : 'text-black/40'}`}>Sample Test Cases</h3>
                <div className="space-y-3">
                  {problem.testCases.map((tc: any, i: number) => (
                    <div key={i} className={`p-4 rounded-xl border font-mono text-[11px] transition-colors ${isDarkMode ? 'bg-gray-900/30 border-gray-800/50' : 'bg-white border-gray-100'
                      }`}>
                      <div className="flex gap-2 mb-1">
                        <span className="opacity-40">IN:</span>
                        <span className={isDarkMode ? 'text-gray-300' : 'text-black'}>{tc.input}</span>
                      </div>
                      <div className="flex gap-2">
                        <span className="opacity-40 text-orange-500">OUT:</span>
                        <span className="text-orange-500 font-bold">{tc.output}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Editor Panel */}
        <div className={`w-2/3 flex flex-col ${isDarkMode ? 'bg-black' : 'bg-gray-50/30'}`}>
          {/* Header */}
          <div className={`h-14 border-b flex items-center justify-between px-6 transition-colors ${isDarkMode ? 'bg-gray-950 border-gray-800' : 'bg-white border-gray-100'}`}>
            <div className="flex items-center gap-6">
              <select
                value={language}
                onChange={(e) => handleLanguageChange(e.target.value)}
                className={`bg-transparent text-sm font-black uppercase tracking-widest border-none focus:ring-0 cursor-pointer transition-colors ${isDarkMode ? 'text-gray-400 hover:text-orange-500' : 'text-black'}`}
              >
                <option value="javascript">JavaScript</option>
                <option value="python">Python</option>
                <option value="cpp">C++</option>
              </select>

              <button
                onClick={() => setIsDarkMode(!isDarkMode)}
                className={`p-2 rounded-xl transition-all ${isDarkMode ? 'bg-orange-500/10 text-orange-500 hover:bg-orange-500/20' : 'bg-gray-100 text-gray-500 hover:bg-orange-100 hover:text-orange-600'}`}
              >
                {isDarkMode ? <Sun size={18} /> : <Moon size={18} />}
              </button>

              <Button
                onClick={() => setIsAIModalOpen(true)}
                className={`h-9 px-4 rounded-xl font-black text-xs gap-2 transition-all ${isDarkMode
                  ? 'bg-orange-500/20 border border-orange-500/30 text-orange-400 hover:bg-orange-500 hover:text-white'
                  : 'bg-orange-50 border border-orange-100 text-orange-600 hover:bg-orange-500 hover:text-white'
                  }`}
              >
                <Sparkles size={14} /> AI HELP
              </Button>
            </div>

            <div className="flex gap-3">
              <Button
                onClick={handleRunCode}
                variant="outline"
                disabled={isEvaluating}
                className={`h-9 px-4 font-black transition-all ${isDarkMode
                  ? 'bg-transparent border-gray-800 text-gray-400 hover:bg-gray-900 hover:text-white'
                  : 'border-gray-200 text-black hover:bg-orange-50 hover:text-orange-600 hover:border-orange-200'
                  }`}
              >
                {isEvaluating ? <Loader2 size={14} className="mr-2 animate-spin" /> : <Play size={14} className="mr-2" />} RUN
              </Button>

              {currentIdx < problems.length - 1 ? (
                <Button
                  onClick={handleNextQuestion}
                  disabled={!isSolved || isEvaluating}
                  className={`h-9 px-5 font-black transition-all ${isSolved
                    ? 'bg-orange-500 hover:bg-orange-600 text-white shadow-lg shadow-orange-500/20'
                    : 'bg-gray-100 text-gray-400 border border-gray-200 cursor-not-allowed'
                    }`}
                >
                  NEXT QUESTION
                </Button>
              ) : (
                <Button
                  onClick={handleSubmit}
                  disabled={!isSolved || isEvaluating}
                  className={`h-9 px-5 font-black transition-all ${isSolved
                    ? 'bg-green-600 hover:bg-green-700 text-white shadow-lg shadow-green-500/20'
                    : 'bg-gray-100 text-gray-400 border border-gray-200 cursor-not-allowed'
                    }`}
                >
                  {isEvaluating ? <Loader2 size={14} className="mr-2 animate-spin" /> : <Send size={14} className="mr-2" />} SUBMIT
                </Button>
              )}
            </div>
          </div>

          <div className={`flex-1 relative border-b transition-colors ${isDarkMode ? 'border-gray-800' : 'border-gray-100 bg-white'}`}>
            <Editor
              key={language}
              height="100%"
              path={`file:///main.${language === 'javascript' ? 'js' : language === 'python' ? 'py' : 'cpp'}`}
              language={language}
              theme={isDarkMode ? "vs-dark" : "light"}
              value={code}
              onChange={(value) => setCode(value || "")}
              options={{
                minimap: { enabled: false },
                fontSize: 14,
                lineHeight: 24,
                scrollBeyondLastLine: false,
                automaticLayout: true,
                padding: { top: 24, bottom: 24 },
                fontFamily: "'Geist Mono', 'Fira Code', monospace",
                renderLineHighlight: 'none',
                hideCursorInOverviewRuler: true,
                bracketPairColorization: { enabled: true },
                quickSuggestions: {
                  other: true,
                  comments: true,
                  strings: true
                },
                suggestOnTriggerCharacters: true,
                wordBasedSuggestions: "allDocuments",
                acceptSuggestionOnEnter: "on",
                tabCompletion: "on",
                parameterHints: { enabled: true },
              }}
            />
          </div>

          {/* Console */}
          <div className={`h-1/3 overflow-hidden flex flex-col transition-colors ${isDarkMode ? 'bg-gray-950' : 'bg-white'}`}>
            <div className={`px-6 py-3 text-[10px] font-black uppercase tracking-[0.2em] border-b flex items-center gap-2 transition-colors ${isDarkMode ? 'text-gray-600 border-gray-800' : 'text-black/40 border-gray-50'
              }`}>
              <Terminal size={12} className="text-orange-500" />
              Console Output
            </div>
            <div className={`flex-1 p-6 font-mono text-sm font-medium overflow-y-auto transition-colors ${isDarkMode ? 'bg-black text-orange-400/80' : 'bg-gray-50/50 text-black'
              }`}>
              <pre>{output || "Click 'RUN' to execute test cases against your code..."}</pre>
            </div>
          </div>
        </div>
      </div>

      <AIChatModal
        isOpen={isAIModalOpen}
        onClose={() => setIsAIModalOpen(false)}
        currentCode={code}
        problem={problem}
      />
    </div>
  );
};

export default CodingArena;
