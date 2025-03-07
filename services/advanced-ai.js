const OpenAI = require('openai');
const logger = require('../utils/logger');
const { analyzeCodeComplexity } = require('../utils/code-analysis');

class AdvancedAIService {
    constructor(config, db) {
        this.openai = new OpenAI(config.openaiApiKey);
        this.db = db;
        this.contextWindow = 8192; // Maximum context window size
    }

    async generateCustomExercise(params) {
        const {
            userId,
            topic,
            difficulty,
            language,
            concepts = [],
            userLevel,
            learningStyle,
            previousExercises = [],
            timeConstraint
        } = params;

        // Get user's learning history and preferences
        const userProfile = await this.getUserProfile(userId);
        
        // Build comprehensive prompt
        const prompt = await this.buildExercisePrompt({
            topic,
            difficulty,
            language,
            concepts,
            userLevel,
            learningStyle,
            userProfile,
            previousExercises,
            timeConstraint
        });

        // Generate exercise using GPT-4
        const response = await this.openai.chat.completions.create({
            model: "gpt-4",
            messages: [{
                role: "system",
                content: "You are an expert programming instructor specializing in creating challenging and educational coding exercises."
            }, {
                role: "user",
                content: prompt
            }],
            temperature: 0.7,
            max_tokens: 2000
        });

        const exercise = this.parseExerciseResponse(response.choices[0].message.content);
        
        // Store exercise in database
        await this.db.exercises.create({
            ...exercise,
            userId,
            generated: new Date(),
            metadata: {
                topic,
                difficulty,
                language,
                concepts,
                userLevel
            }
        });

        return exercise;
    }

    async analyzeAndImproveCode(code, language, context) {
        // Analyze code complexity and quality
        const analysis = await analyzeCodeComplexity(code, language);

        // Build analysis prompt
        const prompt = this.buildCodeAnalysisPrompt(code, language, analysis, context);

        // Get AI suggestions
        const response = await this.openai.chat.completions.create({
            model: "gpt-4",
            messages: [{
                role: "system",
                content: "You are an expert code reviewer focusing on code quality, performance, and best practices."
            }, {
                role: "user",
                content: prompt
            }],
            temperature: 0.5,
            max_tokens: 2000
        });

        return this.parseCodeAnalysis(response.choices[0].message.content, analysis);
    }

    async generateLearningPath(userId, goals) {
        const userProfile = await this.getUserProfile(userId);
        const skillGaps = await this.analyzeSkillGaps(userId, goals);

        const prompt = this.buildLearningPathPrompt(userProfile, goals, skillGaps);

        const response = await this.openai.chat.completions.create({
            model: "gpt-4",
            messages: [{
                role: "system",
                content: "You are an expert learning path designer specializing in personalized programming education."
            }, {
                role: "user",
                content: prompt
            }],
            temperature: 0.7,
            max_tokens: 2000
        });

        return this.parseLearningPath(response.choices[0].message.content);
    }

    async provideContextualHelp(userId, problem, code, language) {
        const userProfile = await this.getUserProfile(userId);
        const relevantConcepts = await this.identifyRelevantConcepts(code, language);
        const similarProblems = await this.findSimilarProblems(problem, code);

        const prompt = this.buildContextualHelpPrompt({
            problem,
            code,
            language,
            userProfile,
            relevantConcepts,
            similarProblems
        });

        const response = await this.openai.chat.completions.create({
            model: "gpt-4",
            messages: [{
                role: "system",
                content: "You are an expert programming mentor providing detailed, educational assistance."
            }, {
                role: "user",
                content: prompt
            }],
            temperature: 0.7,
            max_tokens: 2000
        });

        return this.parseContextualHelp(response.choices[0].message.content);
    }

    async generateAdaptiveFeedback(userId, submission, exercise) {
        const userProfile = await this.getUserProfile(userId);
        const submissionAnalysis = await this.analyzeSubmission(submission, exercise);
        
        const prompt = this.buildFeedbackPrompt({
            submission,
            exercise,
            userProfile,
            submissionAnalysis
        });

        const response = await this.openai.chat.completions.create({
            model: "gpt-4",
            messages: [{
                role: "system",
                content: "You are an expert programming instructor providing detailed, constructive feedback."
            }, {
                role: "user",
                content: prompt
            }],
            temperature: 0.7,
            max_tokens: 2000
        });

        return this.parseAdaptiveFeedback(response.choices[0].message.content);
    }

    async predictUserChallenges(userId) {
        const userProfile = await this.getUserProfile(userId);
        const learningHistory = await this.getLearningHistory(userId);
        const commonPatterns = await this.analyzeCommonChallenges(userProfile.skillLevel);

        return this.analyzePredictiveChallenges(userProfile, learningHistory, commonPatterns);
    }

    // Helper methods
    async buildExercisePrompt(params) {
        const {
            topic,
            difficulty,
            language,
            concepts,
            userLevel,
            learningStyle,
            userProfile,
            previousExercises,
            timeConstraint
        } = params;

        return `
Generate a programming exercise with the following specifications:

Topic: ${topic}
Language: ${language}
Difficulty: ${difficulty}
Key Concepts: ${concepts.join(', ')}
User Level: ${userLevel}
Learning Style: ${learningStyle}
Time Constraint: ${timeConstraint} minutes

User Background:
- Previous exercises: ${JSON.stringify(previousExercises)}
- Strengths: ${userProfile.strengths.join(', ')}
- Areas for improvement: ${userProfile.areasForImprovement.join(', ')}
- Learning pace: ${userProfile.learningPace}

Requirements:
1. Create a challenging but achievable exercise
2. Include clear requirements and constraints
3. Provide scaffolded hints
4. Include test cases
5. Suggest learning resources
6. Add stretch goals for additional challenge

Format the response in JSON with the following structure:
{
    "title": "Exercise title",
    "description": "Detailed description",
    "requirements": ["req1", "req2", ...],
    "constraints": ["constraint1", "constraint2", ...],
    "startingCode": "Code template",
    "hints": ["hint1", "hint2", ...],
    "testCases": [{
        "input": "test input",
        "expected": "expected output",
        "explanation": "explanation"
    }],
    "resources": ["resource1", "resource2", ...],
    "stretchGoals": ["goal1", "goal2", ...]
}`;
    }

    async buildCodeAnalysisPrompt(code, language, analysis, context) {
        return `
Analyze the following ${language} code:

${code}

Technical Analysis:
- Complexity: ${analysis.complexity}
- Maintainability: ${analysis.maintainability}
- Performance: ${analysis.performance}

Context:
${context}

Please provide:
1. Code quality assessment
2. Potential improvements
3. Performance optimizations
4. Best practices recommendations
5. Security considerations
6. Scalability suggestions

Format the response in JSON.`;
    }

    async analyzeSkillGaps(userId, goals) {
        const userSkills = await this.db.skills.find({ userId });
        const requiredSkills = await this.identifyRequiredSkills(goals);
        
        return requiredSkills.map(skill => ({
            skill: skill.name,
            currentLevel: userSkills.find(us => us.name === skill.name)?.level || 0,
            requiredLevel: skill.requiredLevel,
            gap: skill.requiredLevel - (userSkills.find(us => us.name === skill.name)?.level || 0)
        }));
    }

    async identifyRelevantConcepts(code, language) {
        // Analyze code to identify programming concepts being used
        const analysis = await this.analyzeCode(code, language);
        
        return {
            primaryConcepts: analysis.primaryConcepts,
            relatedConcepts: analysis.relatedConcepts,
            prerequisites: analysis.prerequisites
        };
    }

    async findSimilarProblems(problem, code) {
        // Use embeddings to find similar problems
        const embedding = await this.getEmbedding(problem + code);
        
        return await this.db.problems
            .find({
                $near: {
                    $geometry: {
                        type: "Point",
                        coordinates: embedding
                    }
                }
            })
            .limit(5);
    }

    async analyzeSubmission(submission, exercise) {
        const analysis = {
            correctness: await this.checkCorrectness(submission, exercise),
            efficiency: await this.analyzeEfficiency(submission),
            style: await this.analyzeCodeStyle(submission),
            concepts: await this.identifyRelevantConcepts(submission.code, submission.language)
        };

        return {
            ...analysis,
            recommendations: await this.generateRecommendations(analysis)
        };
    }

    async analyzePredictiveChallenges(userProfile, learningHistory, commonPatterns) {
        // Use machine learning to predict potential challenges
        const features = this.extractFeatures(userProfile, learningHistory);
        const predictions = await this.predictChallenges(features);

        return {
            predictedChallenges: predictions.map(p => ({
                concept: p.concept,
                difficulty: p.difficulty,
                probability: p.probability,
                suggestedPreparation: p.preparation
            })),
            commonPatterns: commonPatterns.filter(p => p.relevance > 0.7)
        };
    }

    // Response parsing methods
    parseExerciseResponse(response) {
        try {
            return JSON.parse(response);
        } catch (err) {
            logger.error('Error parsing exercise response', { error: err });
            throw new Error('Invalid exercise response format');
        }
    }

    parseCodeAnalysis(response, technicalAnalysis) {
        try {
            const analysis = JSON.parse(response);
            return {
                ...analysis,
                technicalMetrics: technicalAnalysis
            };
        } catch (err) {
            logger.error('Error parsing code analysis', { error: err });
            throw new Error('Invalid code analysis format');
        }
    }

    parseLearningPath(response) {
        try {
            return JSON.parse(response);
        } catch (err) {
            logger.error('Error parsing learning path', { error: err });
            throw new Error('Invalid learning path format');
        }
    }

    parseContextualHelp(response) {
        try {
            return JSON.parse(response);
        } catch (err) {
            logger.error('Error parsing contextual help', { error: err });
            throw new Error('Invalid contextual help format');
        }
    }

    parseAdaptiveFeedback(response) {
        try {
            return JSON.parse(response);
        } catch (err) {
            logger.error('Error parsing adaptive feedback', { error: err });
            throw new Error('Invalid adaptive feedback format');
        }
    }
}

module.exports = AdvancedAIService;
