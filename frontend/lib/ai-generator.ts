"use client";

export interface DSAQuestion {
    title: string;
    description: string;
    difficulty: string;
    example: {
        input: string;
        output: string;
    };
    testCases: Array<{
        input: string;
        output: string;
    }>;
    boilerplates?: {
        javascript: string;
        python: string;
        cpp: string;
    };
}

export interface VoiceQuestion {
    question: string;
    answer: string;
}

export interface InterviewContent {
    dsa: DSAQuestion[];
    voice: VoiceQuestion[];
}

export async function generateInterviewContent(config: {
    difficulty: string;
    dsaCount: number;
    vivaCount: number;
    type: string;
}): Promise<InterviewContent> {
    const apiKey = process.env.NEXT_PUBLIC_OPENROUTER_API_KEY;
    if (!apiKey || apiKey === 'your_key_here') {
        throw new Error("OpenRouter API key is missing. Please add it to .env.local.");
    }

    const prompt = `
    Generate professional coding interview content for a ${config.type} interview with ${config.difficulty} difficulty.
    
    REQUIRED CONTENT:
    ${config.dsaCount > 0 ? `1. ${config.dsaCount} DSA Questions. Each must have:
       - title
       - description (with technical constraints)
       - difficulty (${config.difficulty})
       - example (input and output strings)
       - testCases (at least 3 sample test cases as an array of {input, output} objects)
       - boilerplates: An object containing starter code for "javascript", "python", and "cpp".
         * javascript: e.g. "function solve(arg1) {\\n  // code\\n}"
         * python: e.g. "def solve(arg1):\\n    pass"
         * cpp: e.g. "int solve(int arg1) {\\n    return 0;\\n}"` : '1. SKIP DSA Questions. Do not generate any coding challenges.'}
    
    2. ${config.vivaCount} Voice/Viva Questions. Each must have:
       - question
       - answer (concise but complete)

    RESPONSE FORMAT:
    You MUST respond with a valid JSON object only. Do not include any other text.
    Format:
    {
      "dsa": [
        ${config.dsaCount > 0 ? '{ "title": "...", "description": "...", "difficulty": "...", "example": { "input": "...", "output": "..." }, "testCases": [{ "input": "...", "output": "..." }], "boilerplates": { "javascript": "...", "python": "...", "cpp": "..." } }' : ''}
      ],
      "voice": [
        { "question": "...", "answer": "..." }
      ]
    }
  `;

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 60000); // Increased to 60s

    try {
        const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${apiKey}`,
                "Content-Type": "application/json",
                "HTTP-Referer": "http://localhost:3000",
                "X-Title": "Niti AI Content Generator",
            },
            body: JSON.stringify({
                model: "stepfun/step-3.5-flash:free",
                messages: [{ role: "user", content: prompt }]
            }),
            signal: controller.signal
        });

        clearTimeout(timeoutId);

        if (!response.ok) {
            const errorText = await response.text();
            console.error("OpenRouter API Error:", response.status, errorText);
            throw new Error(`AI Service Error (${response.status}): ${errorText}`);
        }

        const data = await response.json();
        if (data.error) throw new Error(data.error.message || "AI Generation Failed");

        const rawContent = data.choices?.[0]?.message?.content || "{}";
        console.log("AI Raw Response:", rawContent);

        let cleanJson = rawContent;

        // Robust extraction: find the first '{' and last '}'
        const firstBrace = rawContent.indexOf('{');
        const lastBrace = rawContent.lastIndexOf('}');

        if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
            cleanJson = rawContent.substring(firstBrace, lastBrace + 1);
        }

        try {
            const content = JSON.parse(cleanJson);
            return {
                dsa: content.dsa || [],
                voice: content.voice || []
            };
        } catch (parseError) {
            console.error("JSON Parse Error. First 500 chars:", cleanJson.substring(0, 500));
            console.error("Last 500 chars:", cleanJson.substring(cleanJson.length - 500));
            console.error("Parse error:", parseError);

            // Fallback: return empty content
            console.warn("Using fallback empty content due to parse error");
            return { dsa: [], voice: [] };
        }
    } catch (error: any) {
        clearTimeout(timeoutId);
        if (error.name === 'AbortError') {
            console.error("Content Generation Timed Out (60s)");
            throw new Error("AI Generation Timeout: The model is taking too long to respond. Standard mode enabled.");
        }
        console.error("Content Generation Error:", error);
        throw error;
    }
}

const generateDriverCode = (code: string, language: string, testCases: any[]) => {
    // Smart parser that respects arrays, objects, and quotes
    const parseInput = (inputStr: string) => {
        const args: string[] = [];
        let current = '';
        let depth = 0;
        let inQuotes = false;
        let quoteChar = '';

        for (let i = 0; i < inputStr.length; i++) {
            const char = inputStr[i];

            // Handle quotes
            if ((char === '"' || char === "'") && (i === 0 || inputStr[i - 1] !== '\\')) {
                if (!inQuotes) {
                    inQuotes = true;
                    quoteChar = char;
                } else if (char === quoteChar) {
                    inQuotes = false;
                }
                current += char;
                continue;
            }

            // Track bracket depth
            if (!inQuotes) {
                if (char === '[' || char === '{' || char === '(') depth++;
                if (char === ']' || char === '}' || char === ')') depth--;

                // Split on comma only at depth 0
                if (char === ',' && depth === 0) {
                    args.push(current.trim());
                    current = '';
                    continue;
                }
            }

            current += char;
        }

        if (current.trim()) {
            args.push(current.trim());
        } else if (inputStr.trim() === "") {
            // Handle case where input is just whitespace or empty, usually implying a single empty string argument if checking against test cases that expect string input
            // However, strictly speaking, if inputStr is empty, we might want to pass nothing? 
            // But the error says "missing 1 required positional argument", implying we passed nothing.
            // If the test case input is empty, it likely means an empty string ""
            args.push('""');
        }

        // Process each argument
        return args.map(arg => {
            // Remove parameter name if present (e.g., "nums = [1,2,3]" -> "[1,2,3]")
            const eqIndex = arg.indexOf('=');
            let value = eqIndex !== -1 ? arg.substring(eqIndex + 1).trim() : arg.trim();

            // If empty after trimming (and not one of the special handled types), treat as empty string
            if (value === "") return '""';

            // If already quoted, array, object, number, or boolean, return as-is
            if (value.startsWith('"') || value.startsWith("'") ||
                value.startsWith('[') || value.startsWith('{') ||
                !isNaN(Number(value)) || value === 'true' || value === 'false') {
                return value;
            }

            // Otherwise wrap in quotes (plain string)
            return `"${value}"`;
        }).join(', ');
    };

    if (language === 'javascript') {
        let driver = code + "\n\n// Driver Code\n";
        testCases.forEach((tc) => {
            driver += `try { console.log("---TEST-CASE-START---"); const res = solution(${parseInput(tc.input)}); console.log("---RVAL---"); console.log(JSON.stringify(res)); } catch(e) { console.log(e.message); }\n`;
        });
        return driver;
    } else if (language === 'python') {
        let driver = code + "\n\n# Driver Code\nimport json\n";
        testCases.forEach((tc) => {
            driver += `print("---TEST-CASE-START---")\ntry:\n    res = solution(${parseInput(tc.input)})\n    print("---RVAL---")\n    print(json.dumps(res))\nexcept Exception as e:\n    print(str(e))\n`;
        });
        return driver;
    } else if (language === 'cpp') {
        return code;
    }
    return code;
};

export async function evaluateCode(params: {
    code: string;
    language: string;
    testCases: Array<{ input: string; output: string }>;
    problemTitle: string;
}) {
    try {
        const fullCode = generateDriverCode(params.code, params.language, params.testCases);

        const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5000'}/api/execute`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                language: params.language,
                code: fullCode
            }),
        });

        if (!response.ok) {
            throw new Error(`Execution Service Error: ${response.statusText}`);
        }

        const data = await response.json();

        const rawOutput = data.run?.output || data.output || "";
        const exitCode = data.run?.code;

        const parts = rawOutput.split("---TEST-CASE-START---");
        // parts[0] is global stdout (before first test case)
        const globalStdout = parts[0].trim();

        const results = params.testCases.map((tc, index) => {
            const caseOutputRaw = parts[index + 1] || "";

            // Split into STDOUT and RVAL
            const [caseStdoutRaw, caseRvalRaw] = caseOutputRaw.split("---RVAL---");

            const caseStdout = caseStdoutRaw ? caseStdoutRaw.trim() : "";
            let actual = caseRvalRaw ? caseRvalRaw.trim() : "undefined";

            if (actual === "undefined" || actual === "null" || actual === "") {
                actual = "(nil)";
            }

            const expected = tc.output.trim();

            // Normalize both values for comparison
            let normalizedActual = actual;
            let normalizedExpected = expected;

            try {
                // Try to parse both as JSON to compare actual values
                const parsedActual = JSON.parse(actual);
                const parsedExpected = JSON.parse(expected);
                normalizedActual = JSON.stringify(parsedActual);
                normalizedExpected = JSON.stringify(parsedExpected);
            } catch {
                // If parsing fails, compare as strings
                // Remove quotes from actual if it's a JSON string
                if (actual.startsWith('"') && actual.endsWith('"')) {
                    normalizedActual = actual.slice(1, -1);
                }
            }

            const passed = normalizedActual === normalizedExpected ||
                normalizedActual.replace(/\s/g, '') === normalizedExpected.replace(/\s/g, '');

            return {
                input: tc.input,
                expected: expected,
                actual: actual,
                stdout: caseStdout,
                passed: passed
            };
        });

        const allPassed = results.every(r => r.passed) && exitCode === 0;

        return {
            success: allPassed,
            results: results,
            compilerOutput: globalStdout
        };

    } catch (error: any) {
        console.error("Evaluation Error:", error);
        return {
            success: false,
            results: [],
            compilerOutput: `Error executing code: ${error.message}`
        };
    }
}
