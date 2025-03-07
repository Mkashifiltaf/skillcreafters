const OpenAI = require('openai');
const { Configuration, OpenAIApi } = OpenAI;

class AIExerciseGenerator {
    constructor(apiKey) {
        this.openai = new OpenAIApi(new Configuration({ apiKey }));
        this.difficultyLevels = ['beginner', 'intermediate', 'advanced'];
        this.exerciseTypes = ['practice', 'project', 'challenge'];
    }

    async generateExercise(params) {
        const {
            topic,
            difficulty,
            language,
            concepts = [],
            timeLimit,
            type = 'practice',
            learningStyle,
            previousExercises = []
        } = params;

        const prompt = this.createPrompt(params);
        
        try {
            const completion = await this.openai.createChatCompletion({
                model: "gpt-4",
                messages: [{
                    role: "system",
                    content: `You are an expert programming instructor specializing in creating 
                    educational coding exercises. Generate exercises that are engaging, 
                    practical, and follow best practices in computer science education.`
                }, {
                    role: "user",
                    content: prompt
                }],
                temperature: 0.7,
                max_tokens: 2000
            });

            const exerciseData = completion.data.choices[0].message.content;
            return this.parseExerciseData(exerciseData, language);
        } catch (error) {
            console.error('Error generating exercise:', error);
            throw new Error('Failed to generate exercise');
        }
    }

    createPrompt(params) {
        const {
            topic,
            difficulty,
            language,
            concepts,
            timeLimit,
            type,
            learningStyle,
            previousExercises
        } = params;

        return `
        Create a detailed coding exercise with the following specifications:
        
        Topic: ${topic}
        Programming Language: ${language}
        Difficulty Level: ${difficulty}
        Exercise Type: ${type}
        Time Limit: ${timeLimit} minutes
        Learning Style: ${learningStyle}
        Key Concepts: ${concepts.join(', ')}
        
        Previous Exercises Completed: ${JSON.stringify(previousExercises)}
        
        The exercise should include:
        1. A clear title
        2. A detailed description of the problem
        3. Input/Output specifications
        4. Example test cases with explanations
        5. Starter code
        6. Solution code (hidden from students)
        7. Hints for students who get stuck
        8. Common pitfalls to avoid
        9. Real-world applications of the concept
        10. Learning objectives
        11. Prerequisites
        12. Difficulty rating (1-5)
        13. Estimated completion time
        14. Points/rewards
        15. Tags/categories
        
        Format the response as a JSON object with these fields.
        Make sure the exercise is engaging and practical.
        Include edge cases in test cases.
        Provide clear error messages for common mistakes.
        `;
    }

    parseExerciseData(data, language) {
        try {
            const exercise = JSON.parse(data);
            return this.validateAndEnhanceExercise(exercise, language);
        } catch (error) {
            console.error('Error parsing exercise data:', error);
            throw new Error('Invalid exercise data format');
        }
    }

    validateAndEnhanceExercise(exercise, language) {
        // Add language-specific enhancements
        const enhancedExercise = {
            ...exercise,
            language,
            created: new Date(),
            id: `${language}_${Date.now()}`,
            testCases: this.enhanceTestCases(exercise.testCases, language),
            metadata: {
                ...exercise.metadata,
                version: '1.0',
                generator: 'AI',
                languageVersion: this.getLanguageVersion(language)
            }
        };

        // Validate required fields
        const requiredFields = [
            'title',
            'description',
            'difficulty',
            'testCases',
            'starterCode',
            'solutionCode'
        ];

        for (const field of requiredFields) {
            if (!enhancedExercise[field]) {
                throw new Error(`Missing required field: ${field}`);
            }
        }

        return enhancedExercise;
    }

    enhanceTestCases(testCases, language) {
        return testCases.map((testCase, index) => ({
            ...testCase,
            id: `test_${index + 1}`,
            timeoutMs: this.getTimeoutForLanguage(language),
            memoryLimitMb: this.getMemoryLimitForLanguage(language),
            hidden: testCase.hidden || false
        }));
    }

    getLanguageVersion(language) {
        const versions = {
            python: '3.9',
            javascript: 'ES2021',
            java: '11',
            cpp: 'C++17',
            ruby: '3.0'
        };
        return versions[language] || 'latest';
    }

    getTimeoutForLanguage(language) {
        const timeouts = {
            python: 5000,
            javascript: 5000,
            java: 10000,
            cpp: 3000,
            ruby: 5000
        };
        return timeouts[language] || 5000;
    }

    getMemoryLimitForLanguage(language) {
        const limits = {
            python: 512,
            javascript: 512,
            java: 1024,
            cpp: 256,
            ruby: 512
        };
        return limits[language] || 512;
    }

    async generateHints(code, error, language) {
        try {
            const prompt = `
            Analyze this ${language} code and error:
            
            Code:
            ${code}
            
            Error:
            ${error}
            
            Provide 3 helpful hints to fix the error, ordered from most general to most specific.
            Format the response as a JSON array of strings.
            `;

            const completion = await this.openai.createChatCompletion({
                model: "gpt-4",
                messages: [{
                    role: "system",
                    content: "You are a helpful programming tutor. Provide clear, educational hints that guide students toward the solution without giving it away directly."
                }, {
                    role: "user",
                    content: prompt
                }],
                temperature: 0.7,
                max_tokens: 500
            });

            return JSON.parse(completion.data.choices[0].message.content);
        } catch (error) {
            console.error('Error generating hints:', error);
            return [
                'Try reviewing the error message carefully.',
                'Check your syntax and variable names.',
                'Make sure all required variables are properly initialized.'
            ];
        }
    }

    async generateFeedback(code, testResults, language) {
        try {
            const prompt = `
            Analyze this ${language} code and test results:
            
            Code:
            ${code}
            
            Test Results:
            ${JSON.stringify(testResults)}
            
            Provide constructive feedback on:
            1. Code quality and style
            2. Performance considerations
            3. Potential improvements
            4. Best practices
            
            Format the response as a JSON object with these categories.
            `;

            const completion = await this.openai.createChatCompletion({
                model: "gpt-4",
                messages: [{
                    role: "system",
                    content: "You are a code reviewer providing constructive feedback to help students improve their coding skills."
                }, {
                    role: "user",
                    content: prompt
                }],
                temperature: 0.7,
                max_tokens: 1000
            });

            return JSON.parse(completion.data.choices[0].message.content);
        } catch (error) {
            console.error('Error generating feedback:', error);
            return {
                codeQuality: 'Unable to analyze code quality at this time.',
                performance: 'Unable to analyze performance at this time.',
                improvements: 'Unable to suggest improvements at this time.',
                bestPractices: 'Unable to provide best practices at this time.'
            };
        }
    }

    async suggestNextExercise(userProfile, completedExercise) {
        try {
            const prompt = `
            Based on this user profile and completed exercise, suggest the next exercise:
            
            User Profile:
            ${JSON.stringify(userProfile)}
            
            Completed Exercise:
            ${JSON.stringify(completedExercise)}
            
            Consider:
            1. Learning progress and pace
            2. Areas needing improvement
            3. User's learning style
            4. Previous exercise performance
            5. Topic progression
            
            Suggest 3 exercises in JSON format with title, description, and reasoning.
            `;

            const completion = await this.openai.createChatCompletion({
                model: "gpt-4",
                messages: [{
                    role: "system",
                    content: "You are an AI tutor specializing in personalized learning paths."
                }, {
                    role: "user",
                    content: prompt
                }],
                temperature: 0.7,
                max_tokens: 1000
            });

            return JSON.parse(completion.data.choices[0].message.content);
        } catch (error) {
            console.error('Error suggesting next exercise:', error);
            throw new Error('Failed to suggest next exercise');
        }
    }
}

module.exports = AIExerciseGenerator;
