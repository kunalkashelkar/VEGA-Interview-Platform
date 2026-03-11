const OpenAI = require('openai');
const youtubeService = require('./youtubeService');

class DetailedEvaluationService {
    constructor() {
        this.openai = new OpenAI({
            baseURL: "https://openrouter.ai/api/v1",
            apiKey: process.env.OPENROUTER_API_KEY || "",
        });
    }

    /**
     * Generate comprehensive performance analysis with learning recommendations
     */
    async generateDetailedReport(participantData) {
        const {
            name,
            dsaScores = [],
            voiceScores = [],
            penalties,
            finalScore,
            maxPossibleScore,
            percentage
        } = participantData;

        // Prepare performance summary for AI
        const performanceSummary = this.buildPerformanceSummary(participantData);

        const prompt = `You are an expert technical interview coach and career mentor analyzing a candidate's performance in detail.

CANDIDATE: ${name}
OVERALL SCORE: ${finalScore}/${maxPossibleScore} (${percentage.toFixed(1)}%)

DETAILED PERFORMANCE DATA:
${performanceSummary}

PENALTIES APPLIED:
- Reveal Code Used: ${penalties.revealCode} points
- AI Hints Requested: ${penalties.hints} points
- Multiple Submissions: ${penalties.submissions} points

Based on this comprehensive performance analysis, provide an extremely detailed evaluation report in JSON format.

IMPORTANT INSTRUCTIONS:
1. Be VERY SPECIFIC and DETAILED in all recommendations
2. Provide ACTIONABLE learning paths with concrete resources
3. Recommend REAL courses from actual platforms (Coursera, Udemy, LeetCode, etc.)
4. Include MULTIPLE topics to learn (at least 6-8 topics)
5. Include MULTIPLE course recommendations (at least 6-8 courses)
6. Provide DETAILED practice recommendations with specific daily/weekly goals (at least 6-8 items)
7. Be encouraging but honest about areas needing improvement

JSON FORMAT:
{
  "overallAssessment": "<3-4 sentence comprehensive summary analyzing performance, highlighting key patterns, and providing context for the score>",
  "strengths": [
    {
      "area": "<specific strength area - be detailed>",
      "description": "<2-3 sentence detailed explanation of this strength>",
      "evidence": "<specific evidence from the interview demonstrating this strength>"
    }
    // Include 2-4 strengths
  ],
  "weaknesses": [
    {
      "area": "<specific weakness area - be detailed>",
      "description": "<2-3 sentence detailed explanation of this weakness and why it matters>",
      "impact": "<how this specifically affects interview performance and job readiness>"
    }
    // Include 2-4 weaknesses
  ],
  "topicsToLearn": [
    {
      "topic": "<specific topic name with context>",
      "priority": "<High/Medium/Low>",
      "reason": "<2-3 sentence explanation of why this topic is critical for the candidate based on their performance>",
      "resources": [
        "<specific resource 1 with platform/author>",
        "<specific resource 2 with platform/author>",
        "<specific resource 3 with platform/author>"
      ],
      "estimatedTime": "<realistic time commitment to master this topic>"
    }
    // Include 6-8 topics covering: algorithms, data structures, system design, coding patterns, communication, etc.
  ],
  "recommendedCourses": [
    {
      "title": "<actual course title>",
      "platform": "<Coursera/Udemy/Pluralsight/LeetCode/AlgoExpert/etc>",
      "instructor": "<instructor name if known>",
      "focus": "<detailed 2-3 sentence description of what this course covers and why it's relevant>",
      "estimatedTime": "<hours or weeks>",
      "difficulty": "<Beginner/Intermediate/Advanced>",
      "link": "<actual URL if known, or 'Search on [platform]'>"
    }
    // Include 6-8 courses covering different skill gaps
  ],
  "practiceRecommendations": [
    {
      "category": "<specific category>",
      "action": "<detailed actionable recommendation with specific examples>",
      "frequency": "<daily/3x per week/weekly>",
      "duration": "<time per session>",
      "examples": ["<specific example 1>", "<specific example 2>"]
    }
    // Include 6-8 practice recommendations
  ],
  "nextSteps": [
    "<immediate action 1 - be very specific>",
    "<immediate action 2 - be very specific>",
    "<immediate action 3 - be very specific>",
    "<immediate action 4 - be very specific>",
    "<immediate action 5 - be very specific>"
  ],
  "interviewReadiness": {
    "level": "<Beginner/Intermediate/Advanced/Expert>",
    "confidence": "<percentage based on performance>",
    "timeToReady": "<realistic estimate with explanation>",
    "focusAreas": [
      "<specific focus area 1>",
      "<specific focus area 2>",
      "<specific focus area 3>"
    ],
    "targetCompanies": [
      "<type of company 1 they're ready for>",
      "<type of company 2 to aim for after improvement>"
    ]
  },
  "studyPlan": {
    "week1": "<detailed plan for week 1>",
    "week2": "<detailed plan for week 2>",
    "week3": "<detailed plan for week 3>",
    "week4": "<detailed plan for week 4>",
    "ongoing": "<long-term continuous improvement plan>"
  }
}

Be extremely thorough, specific, and actionable. This report should serve as a complete roadmap for the candidate's improvement.`;

        try {
            const response = await this.openai.chat.completions.create({
                model: "stepfun/step-3.5-flash:free",
                messages: [{ role: "user", content: prompt }],
                temperature: 0.7
            });

            let content = response.choices[0].message.content;
            // Strip markdown code blocks if present
            content = content.replace(/```json\n?|\n?```/g, '').trim();

            const evaluation = JSON.parse(content);

            // Fetch YouTube videos for topics
            if (evaluation.topicsToLearn && evaluation.topicsToLearn.length > 0) {
                console.log("Fetching YouTube recommendations for topics...");
                for (const topic of evaluation.topicsToLearn) {
                    // Search for "Learn <topic name> tutorial"
                    const videos = await youtubeService.searchVideos(`Learn ${topic.topic} tutorial`);
                    topic.recommendedVideos = videos;
                }
            }

            return {
                ...participantData,
                detailedEvaluation: evaluation,
                generatedAt: new Date().toISOString()
            };
        } catch (error) {
            console.error('Detailed evaluation generation error:', error);

            // Fallback evaluation
            return {
                ...participantData,
                detailedEvaluation: this.generateFallbackEvaluation(participantData),
                generatedAt: new Date().toISOString()
            };
        }
    }

    /**
     * Build performance summary for AI analysis
     */
    buildPerformanceSummary(data) {
        const { dsaScores, voiceScores } = data;
        let summary = '';

        // DSA Performance
        if (dsaScores.length > 0) {
            summary += 'CODING QUESTIONS:\n';
            dsaScores.forEach((q, idx) => {
                const passed = q.testResults?.filter(t => t.passed).length || 0;
                const total = q.testResults?.length || 0;
                summary += `Q${idx + 1}: ${q.questionTitle}\n`;
                summary += `  Score: ${q.totalScore}/${q.maxScore}\n`;
                summary += `  Tests Passed: ${passed}/${total}\n`;
                summary += `  Time Spent: ${Math.floor(q.timeSpent / 60)}m ${q.timeSpent % 60}s\n`;
                if (q.revealCodeUsed) summary += `  ⚠️ Used Reveal Code\n`;
                if (q.hintsUsed > 0) summary += `  💡 Used ${q.hintsUsed} hints\n`;
                summary += '\n';
            });
        }

        // Voice Performance
        if (voiceScores.length > 0) {
            summary += 'VOICE QUESTIONS:\n';
            voiceScores.forEach((q, idx) => {
                summary += `Q${idx + 1}: ${q.question}\n`;
                summary += `  Score: ${q.totalScore}/${q.maxScore}\n`;
                summary += `  Accuracy: ${q.accuracyScore}/5\n`;
                summary += `  Completeness: ${q.completenessScore}/3\n`;
                summary += `  Communication: ${q.communicationScore}/2\n`;
                if (q.aiEvaluation) summary += `  Feedback: ${q.aiEvaluation}\n`;
                summary += '\n';
            });
        }

        return summary;
    }

    /**
     * Generate fallback evaluation if AI fails
     */
    generateFallbackEvaluation(data) {
        const { dsaScores, voiceScores, percentage } = data;

        const strengths = [];
        const weaknesses = [];
        const topicsToLearn = [];

        // Analyze DSA performance
        const avgDSAScore = dsaScores.length > 0
            ? dsaScores.reduce((sum, q) => sum + q.totalScore, 0) / dsaScores.length
            : 0;

        if (avgDSAScore >= 7) {
            strengths.push({
                area: "Problem Solving",
                description: "Strong coding and algorithmic thinking skills",
                evidence: "Consistently high scores on DSA questions"
            });
        } else if (avgDSAScore < 5) {
            weaknesses.push({
                area: "Algorithm Design",
                description: "Needs improvement in problem-solving approach",
                impact: "May struggle with technical interview rounds"
            });
            topicsToLearn.push({
                topic: "Data Structures & Algorithms",
                priority: "High",
                reason: "Foundation for technical interviews",
                resources: ["LeetCode Easy/Medium problems", "AlgoExpert course"]
            });
        }

        // Analyze voice performance
        const avgVoiceScore = voiceScores.length > 0
            ? voiceScores.reduce((sum, q) => sum + q.totalScore, 0) / voiceScores.length
            : 0;

        if (avgVoiceScore >= 7) {
            strengths.push({
                area: "Technical Communication",
                description: "Excellent ability to explain concepts clearly",
                evidence: "High scores on voice interview questions"
            });
        } else if (avgVoiceScore < 5) {
            weaknesses.push({
                area: "Communication Skills",
                description: "Needs to improve technical explanation abilities",
                impact: "May not effectively convey knowledge in interviews"
            });
        }

        return {
            overallAssessment: `Performance is ${percentage >= 70 ? 'strong' : percentage >= 50 ? 'moderate' : 'developing'}. ${strengths.length > 0 ? 'Shows promise in ' + strengths[0].area.toLowerCase() : 'Has room for growth'}.`,
            strengths,
            weaknesses,
            topicsToLearn,
            recommendedCourses: [
                {
                    title: "Master the Coding Interview",
                    platform: "Udemy",
                    focus: "Data structures and algorithms",
                    estimatedTime: "20 hours"
                }
            ],
            practiceRecommendations: [
                {
                    category: "DSA Practice",
                    action: "Solve 2-3 LeetCode problems daily",
                    frequency: "Daily"
                }
            ],
            nextSteps: [
                "Review weak areas identified above",
                "Practice similar problems",
                "Schedule mock interviews"
            ],
            interviewReadiness: {
                level: percentage >= 70 ? "Intermediate" : "Beginner",
                confidence: `${Math.round(percentage)}%`,
                timeToReady: percentage >= 70 ? "2-4 weeks" : "1-2 months",
                focusAreas: weaknesses.map(w => w.area)
            }
        };
    }

    /**
     * Format evaluation for display
     */
    formatEvaluationReport(evaluation) {
        const { detailedEvaluation } = evaluation;
        if (!detailedEvaluation) return null;

        return {
            sections: [
                {
                    title: "Overall Assessment",
                    content: detailedEvaluation.overallAssessment,
                    icon: "📊"
                },
                {
                    title: "Strengths",
                    items: detailedEvaluation.strengths,
                    icon: "💪"
                },
                {
                    title: "Areas for Improvement",
                    items: detailedEvaluation.weaknesses,
                    icon: "🎯"
                },
                {
                    title: "Learning Roadmap",
                    items: detailedEvaluation.topicsToLearn,
                    icon: "📚"
                },
                {
                    title: "Recommended Courses",
                    items: detailedEvaluation.recommendedCourses,
                    icon: "🎓"
                },
                {
                    title: "Practice Plan",
                    items: detailedEvaluation.practiceRecommendations,
                    icon: "🏋️"
                },
                {
                    title: "Next Steps",
                    items: detailedEvaluation.nextSteps,
                    icon: "🚀"
                },
                {
                    title: "Interview Readiness",
                    content: detailedEvaluation.interviewReadiness,
                    icon: "✅"
                }
            ]
        };
    }
}

module.exports = DetailedEvaluationService;
