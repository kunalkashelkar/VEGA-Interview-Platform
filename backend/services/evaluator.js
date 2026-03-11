const OpenAI = require('openai');

class InterviewEvaluator {
    constructor() {
        // Initialize OpenRouter client for AI evaluations
        this.openai = new OpenAI({
            baseURL: "https://openrouter.ai/api/v1",
            apiKey: process.env.OPENROUTER_API_KEY || "",
        });
    }

    /**
     * Evaluate a DSA question submission
     */
    evaluateDSA(submission) {
        const {
            questionId,
            questionTitle,
            testResults,
            codeSubmitted,
            timeSpent,
            revealCodeUsed,
            hintsUsed,
            submissionAttempts,
            maxTime
        } = submission;

        // 1. Test Case Score (0-4 points)
        const passedTests = testResults.filter(t => t.passed).length;
        const totalTests = testResults.length;
        const passRate = totalTests > 0 ? passedTests / totalTests : 0;

        let testCaseScore = 0;
        if (passRate === 1) testCaseScore = 4;
        else if (passRate >= 0.75) testCaseScore = 3;
        else if (passRate >= 0.5) testCaseScore = 2;
        else if (passRate >= 0.25) testCaseScore = 1;

        // 2. Quality Score (0-3 points) - Placeholder, will be enhanced with AI
        const qualityScore = passRate === 1 ? 3 : Math.floor(passRate * 3);

        // 3. Style Score (0-2 points) - Placeholder
        // 3. Style Score (0-2 points) - Basic check for now
        const styleScore = codeSubmitted.trim().length > 10 ? 2 : 0;

        // 4. Time Bonus (0-1 point)
        const timeBonus = timeSpent <= (maxTime * 0.5) ? 1 : 0;

        // Calculate penalties
        const revealPenalty = revealCodeUsed ? -5 : 0;
        const hintPenalty = hintsUsed * -1;
        const submissionPenalty = submissionAttempts > 2 ? (submissionAttempts - 2) * -0.5 : 0;

        // Calculate total
        const baseScore = testCaseScore + qualityScore + styleScore + timeBonus;
        // Cap penalty sum so it doesn't exceed base score (optional) or allow negatives. 
        // User requested "severe" penalty. We'll allow total score to hit 0 but not negative.
        const totalScore = Math.max(0, baseScore + revealPenalty + hintPenalty + submissionPenalty);

        return {
            questionId,
            questionTitle,
            testCaseScore,
            qualityScore,
            styleScore,
            timeBonus,
            revealCodeUsed,
            revealPenalty,
            hintsUsed,
            hintPenalty,
            submissionAttempts,
            submissionPenalty,
            totalScore,
            maxScore: 10,
            timeSpent,
            codeSubmitted,
            testResults
        };
    }

    /**
     * Evaluate a voice question answer using AI
     */
    async evaluateVoice(voiceSubmission) {
        const { questionId, question, expectedAnswer, transcript, duration } = voiceSubmission;

        try {
            const prompt = `You are an expert technical interviewer evaluating a candidate's answer.

Question: ${question}
Expected Answer: ${expectedAnswer}
Candidate's Answer: ${transcript}

Evaluate the candidate's answer on a scale of 0-10 with the following breakdown:
1. Accuracy (0-5 points): How correct is the answer?
2. Completeness (0-3 points): Did they cover all key points?
3. Communication (0-2 points): How clear and articulate was the response?

Respond in JSON format:
{
  "accuracyScore": <0-5>,
  "completenessScore": <0-3>,
  "communicationScore": <0-2>,
  "feedback": "<brief feedback>",
  "keyPointsCovered": ["point1", "point2"],
  "keyPointsMissed": ["point1", "point2"]
}`;

            const response = await this.openai.chat.completions.create({
                model: "stepfun/step-3.5-flash:free",
                messages: [{ role: "user", content: prompt }]
            });

            let content = response.choices[0].message.content;
            // Strip markdown code blocks if present
            content = content.replace(/```json\n?|\n?```/g, '').trim();

            const evaluation = JSON.parse(content);

            return {
                questionId,
                question,
                expectedAnswer,
                transcript,
                duration,
                accuracyScore: evaluation.accuracyScore || 0,
                completenessScore: evaluation.completenessScore || 0,
                communicationScore: evaluation.communicationScore || 0,
                totalScore: (evaluation.accuracyScore || 0) + (evaluation.completenessScore || 0) + (evaluation.communicationScore || 0),
                maxScore: 10,
                aiEvaluation: evaluation.feedback,
                keyPointsCovered: evaluation.keyPointsCovered || [],
                keyPointsMissed: evaluation.keyPointsMissed || []
            };
        } catch (error) {
            console.error('Voice evaluation error:', error);
            // Fallback scoring
            return {
                questionId,
                question,
                expectedAnswer,
                transcript,
                duration,
                accuracyScore: 3,
                completenessScore: 2,
                communicationScore: 1,
                totalScore: 6,
                maxScore: 10,
                aiEvaluation: "Evaluation unavailable"
            };
        }
    }

    /**
     * Generate final participant evaluation
     */
    generateFinalReport(participant) {
        const { name, dsaScores = [], voiceScores = [] } = participant;

        // Calculate DSA totals
        const dsaTotalScore = dsaScores.reduce((sum, q) => sum + q.totalScore, 0);
        const dsaMaxScore = dsaScores.length * 10;

        // Calculate Voice totals
        const voiceTotalScore = voiceScores.reduce((sum, q) => sum + q.totalScore, 0);
        const voiceMaxScore = voiceScores.length * 10;

        // Calculate penalties
        const penalties = {
            revealCode: dsaScores.reduce((sum, q) => sum + q.revealPenalty, 0),
            hints: dsaScores.reduce((sum, q) => sum + q.hintPenalty, 0),
            submissions: dsaScores.reduce((sum, q) => sum + q.submissionPenalty, 0),
            total: 0
        };
        penalties.total = penalties.revealCode + penalties.hints + penalties.submissions;

        // Final metrics
        const finalScore = dsaTotalScore + voiceTotalScore;
        const maxPossibleScore = dsaMaxScore + voiceMaxScore;
        const percentage = maxPossibleScore > 0 ? (finalScore / maxPossibleScore) * 100 : 0;

        // Generate insights
        const strengths = [];
        const weaknesses = [];
        const recommendations = [];

        if (dsaTotalScore / dsaMaxScore > 0.8) {
            strengths.push("Strong coding skills");
        } else if (dsaTotalScore / dsaMaxScore < 0.5) {
            weaknesses.push("Needs improvement in coding");
            recommendations.push("Practice more DSA problems");
        }

        if (voiceTotalScore / voiceMaxScore > 0.8) {
            strengths.push("Excellent communication");
        } else if (voiceTotalScore / voiceMaxScore < 0.5) {
            weaknesses.push("Communication needs work");
            recommendations.push("Practice explaining technical concepts");
        }

        if (penalties.revealCode < 0) {
            weaknesses.push("Over-reliance on hints");
            recommendations.push("Try solving problems independently first");
        }

        return {
            name,
            dsaScores,
            voiceScores,
            penalties,
            dsaTotalScore,
            dsaMaxScore,
            voiceTotalScore,
            voiceMaxScore,
            finalScore,
            maxPossibleScore,
            percentage: Math.round(percentage * 10) / 10,
            strengths,
            weaknesses,
            recommendations
        };
    }
}

module.exports = InterviewEvaluator;
