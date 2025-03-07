const OpenAI = require('openai');
const { Configuration, OpenAIApi } = OpenAI;
const logger = console; // Assuming a logger is not defined elsewhere

class RecommendationEngine {
    constructor(apiKey) {
        this.openai = new OpenAIApi(new Configuration({ apiKey }));
    }

    async generatePersonalizedPath(userProfile) {
        const {
            learningStyle,
            currentSkillLevel,
            goals,
            interests,
            timeCommitment,
            previousCourses,
            completedExercises,
            performance,
            preferredLanguages
        } = userProfile;

        try {
            const completion = await this.openai.createChatCompletion({
                model: "gpt-4",
                messages: [{
                    role: "system",
                    content: `You are an expert educational advisor specializing in creating 
                    personalized learning paths for programming students. Consider their learning style,
                    current skill level, goals, and past performance to create an optimal learning journey.`
                }, {
                    role: "user",
                    content: this.createLearningPathPrompt(userProfile)
                }],
                temperature: 0.7,
                max_tokens: 2000
            });

            return this.parseLearningPath(completion.data.choices[0].message.content);
        } catch (error) {
            logger.error('Error generating learning path:', error);
            throw new Error('Failed to generate learning path. Please try again later.');
        }
    }

    createLearningPathPrompt(userProfile) {
        return `
        Create a personalized learning path for a student with the following profile:
        
        Learning Style: ${userProfile.learningStyle}
        Current Skill Level: ${userProfile.currentSkillLevel}
        Goals: ${userProfile.goals.join(', ')}
        Interests: ${userProfile.interests.join(', ')}
        Time Commitment: ${userProfile.timeCommitment} hours/week
        Previous Courses: ${JSON.stringify(userProfile.previousCourses)}
        Completed Exercises: ${JSON.stringify(userProfile.completedExercises)}
        Performance: ${JSON.stringify(userProfile.performance)}
        Preferred Languages: ${userProfile.preferredLanguages.join(', ')}
        
        Create a structured learning path that includes:
        1. Course recommendations
        2. Project suggestions
        3. Practice exercises
        4. Skill assessments
        5. Milestones
        6. Estimated completion times
        7. Prerequisites for each step
        8. Learning objectives
        9. Success metrics
        10. Alternative paths based on progress
        
        Format the response as a JSON object with these sections.
        Ensure the path is challenging but achievable.
        Include both theoretical and practical components.
        Consider industry relevance and job market demands.
        `;
    }

    parseLearningPath(data) {
        try {
            return JSON.parse(data);
        } catch (error) {
            logger.error('Error parsing learning path:', error);
            throw new Error('Invalid learning path format');
        }
    }

    async getNextBestContent(userId, contentPool) {
        const userProfile = await this.getUserProfile(userId);
        const userHistory = await this.getUserHistory(userId);

        // Calculate content scores based on various factors
        const scoredContent = contentPool.map(content => ({
            ...content,
            score: this.calculateContentScore(content, userProfile, userHistory)
        }));

        // Sort by score and return top recommendations
        return scoredContent
            .sort((a, b) => b.score - a.score)
            .slice(0, 5);
    }

    calculateContentScore(content, userProfile, userHistory) {
        let score = 0;

        // Skill level match
        score += this.getSkillLevelMatch(content.difficulty, userProfile.currentSkillLevel);

        // Learning style match
        score += this.getLearningStyleMatch(content.teachingStyle, userProfile.learningStyle);

        // Topic relevance to goals
        score += this.getTopicRelevance(content.topics, userProfile.goals);

        // Time commitment match
        score += this.getTimeCommitmentMatch(content.estimatedTime, userProfile.timeCommitment);

        // Novelty factor (prefer new topics)
        score += this.getNoveltyScore(content, userHistory);

        // Performance-based adjustment
        score += this.getPerformanceAdjustment(content, userProfile.performance);

        return score;
    }

    getSkillLevelMatch(contentDifficulty, userLevel) {
        const levels = ['beginner', 'intermediate', 'advanced'];
        const contentIndex = levels.indexOf(contentDifficulty);
        const userIndex = levels.indexOf(userLevel);
        
        // Prefer content slightly above user's level
        const diff = contentIndex - userIndex;
        if (diff === 0) return 1.0;
        if (diff === 1) return 0.8;
        if (diff === -1) return 0.6;
        return 0.2;
    }

    getLearningStyleMatch(contentStyle, userStyle) {
        const styles = {
            visual: ['video', 'diagram', 'infographic'],
            auditory: ['lecture', 'podcast', 'discussion'],
            reading: ['text', 'article', 'documentation'],
            kinesthetic: ['practice', 'project', 'exercise']
        };

        if (styles[userStyle].includes(contentStyle)) return 1.0;
        return 0.4;
    }

    getTopicRelevance(contentTopics, userGoals) {
        const matchingTopics = contentTopics.filter(topic => 
            userGoals.some(goal => goal.toLowerCase().includes(topic.toLowerCase()))
        );
        return matchingTopics.length / contentTopics.length;
    }

    getTimeCommitmentMatch(contentTime, userTime) {
        const ratio = contentTime / userTime;
        if (ratio <= 1.2 && ratio >= 0.8) return 1.0;
        if (ratio <= 1.5 && ratio >= 0.5) return 0.7;
        return 0.3;
    }

    getNoveltyScore(content, userHistory) {
        const hasCompleted = userHistory.some(item => 
            item.contentId === content.id ||
            item.topics.some(topic => content.topics.includes(topic))
        );
        return hasCompleted ? 0.3 : 1.0;
    }

    getPerformanceAdjustment(content, performance) {
        const relevantPerformance = performance[content.mainTopic] || 0.7;
        
        // If user is performing well, suggest slightly harder content
        if (relevantPerformance > 0.8) return 0.2;
        // If user is struggling, suggest slightly easier content
        if (relevantPerformance < 0.6) return -0.2;
        return 0;
    }

    async generateSkillMap(userId) {
        const userProfile = await this.getUserProfile(userId);
        const userHistory = await this.getUserHistory(userId);

        // Generate a comprehensive skill map
        const skillMap = {
            core: this.assessCoreSkills(userHistory),
            specialized: this.assessSpecializedSkills(userHistory),
            projects: this.assessProjectExperience(userHistory),
            growth: this.calculateGrowthRate(userHistory),
            gaps: this.identifySkillGaps(userProfile, userHistory),
            recommendations: await this.getSkillRecommendations(userProfile, userHistory)
        };

        return skillMap;
    }

    assessCoreSkills(history) {
        const coreSkills = {
            programming: ['syntax', 'logic', 'debugging'],
            computerScience: ['algorithms', 'dataStructures', 'complexity'],
            softwareEngineering: ['design', 'testing', 'versionControl']
        };

        return Object.entries(coreSkills).reduce((acc, [category, skills]) => {
            acc[category] = skills.map(skill => ({
                name: skill,
                level: this.calculateSkillLevel(skill, history),
                confidence: this.calculateConfidence(skill, history)
            }));
            return acc;
        }, {});
    }

    calculateSkillLevel(skill, history) {
        const relevantActivities = history.filter(activity => 
            activity.skills.includes(skill)
        );

        if (relevantActivities.length === 0) return 0;

        const averagePerformance = relevantActivities.reduce((sum, activity) => 
            sum + activity.performance, 0) / relevantActivities.length;

        // Convert to 0-5 scale
        return Math.round(averagePerformance * 5);
    }

    calculateConfidence(skill, history) {
        const relevantActivities = history.filter(activity => 
            activity.skills.includes(skill)
        );

        // More activities = higher confidence
        const activityCount = relevantActivities.length;
        const maxActivities = 20; // Normalize to this number

        return Math.min(activityCount / maxActivities, 1);
    }

    async getSkillRecommendations(profile, history) {
        try {
            const prompt = `
            Based on this user's profile and history:
            
            Profile: ${JSON.stringify(profile)}
            History: ${JSON.stringify(history)}
            
            Recommend:
            1. Skills to focus on next
            2. Projects to build
            3. Learning resources
            4. Practice exercises
            5. Industry alignment
            
            Consider:
            - Current skill levels
            - Career goals
            - Industry trends
            - Learning pace
            - Available time
            
            Format as JSON with these categories.
            `;

            const completion = await this.openai.createChatCompletion({
                model: "gpt-4",
                messages: [{
                    role: "system",
                    content: "You are a career advisor specializing in software development skills."
                }, {
                    role: "user",
                    content: prompt
                }],
                temperature: 0.7,
                max_tokens: 1000
            });

            return JSON.parse(completion.data.choices[0].message.content);
        } catch (error) {
            logger.error('Error generating skill recommendations:', error);
            return {
                focusSkills: ['error generating recommendations'],
                projects: [],
                resources: [],
                exercises: [],
                industryAlignment: {}
            };
        }
    }
}

module.exports = RecommendationEngine;
