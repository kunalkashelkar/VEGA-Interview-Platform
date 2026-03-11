// Evaluation and Scoring Types

export interface DSAQuestionScore {
    questionId: number;
    questionTitle: string;

    // Score components (0-10 total)
    testCaseScore: number;        // 0-4 points
    qualityScore: number;          // 0-3 points (time/space complexity)
    styleScore: number;            // 0-2 points (readability)
    timeBonus: number;             // 0-1 point (completion speed)

    // Penalties
    revealCodeUsed: boolean;
    revealPenalty: number;         // -5 if used
    hintsUsed: number;
    hintPenalty: number;           // -1 per hint
    submissionAttempts: number;
    submissionPenalty: number;     // -0.5 after 2 attempts

    // Final
    totalScore: number;            // Sum with penalties applied
    maxScore: number;              // Always 10

    // Metadata
    timeSpent: number;             // seconds
    codeSubmitted: string;
    testResults: TestCaseResult[];
}

export interface TestCaseResult {
    input: string;
    expected: string;
    actual: string;
    passed: boolean;
    stdout?: string;
}

export interface VoiceQuestionScore {
    questionId: number;
    question: string;
    expectedAnswer: string;

    // Score components (0-10 total)
    accuracyScore: number;         // 0-5 points
    completenessScore: number;     // 0-3 points
    communicationScore: number;    // 0-2 points

    // Data
    transcript: string;
    aiEvaluation?: string;         // AI's assessment

    // Final
    totalScore: number;
    maxScore: number;              // Always 10

    // Metadata
    duration: number;              // seconds
}

export interface ParticipantEvaluation {
    participantId: string;
    name: string;

    // Scores by category
    dsaScores: DSAQuestionScore[];
    voiceScores: VoiceQuestionScore[];

    // Aggregated penalties
    penalties: {
        revealCode: number;
        hints: number;
        submissions: number;
        total: number;
    };

    // Final metrics
    dsaTotalScore: number;
    dsaMaxScore: number;
    voiceTotalScore: number;
    voiceMaxScore: number;

    finalScore: number;            // Total score with penalties
    maxPossibleScore: number;      // Total possible points
    percentage: number;            // (finalScore / maxPossible) * 100

    rank?: number;                 // Position in leaderboard

    // Performance insights
    strengths: string[];
    weaknesses: string[];
    recommendations: string[];
}

export interface CodeQualityAnalysis {
    timeComplexity: string;        // e.g., "O(n)"
    spaceComplexity: string;       // e.g., "O(1)"
    qualityScore: number;          // 0-3
    styleScore: number;            // 0-2
    suggestions: string[];
    isOptimal: boolean;
}

export interface VoiceAnswerEvaluation {
    accuracyScore: number;         // 0-5
    completenessScore: number;     // 0-3
    communicationScore: number;    // 0-2
    feedback: string;
    keyPointsCovered: string[];
    keyPointsMissed: string[];
}

// Action tracking
export interface UserAction {
    type: 'reveal-code' | 'ai-hint' | 'code-submission' | 'voice-answer';
    timestamp: number;
    questionId: number;
    metadata?: any;
}

export interface InterviewSession {
    roomId: string;
    participants: ParticipantEvaluation[];
    config: {
        dsaCount: number;
        vivaCount: number;
        difficulty: string;
        type: string;
    };
    startTime: number;
    endTime?: number;
}
