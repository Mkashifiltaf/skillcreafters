const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const AIExerciseGenerator = require('../services/ai-exercise-generator');
const RecommendationEngine = require('../services/recommendation-engine');
const GamificationSystem = require('../services/gamification');
const config = require('../config/config');

// Initialize AI services
const exerciseGenerator = new AIExerciseGenerator(config.openai.apiKey);
const recommendationEngine = new RecommendationEngine(config.openai.apiKey);
const gamificationSystem = new GamificationSystem(config.db);

// Generate AI response for programming questions
router.post('/ask', auth, async (req, res) => {
    try {
        const { prompt } = req.body;
        const response = await exerciseGenerator.generateResponse(prompt);
        res.json({ response });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Error generating AI response' });
    }
});

// Generate custom exercises
router.post('/generate-exercise', auth, async (req, res) => {
    try {
        const {
            topic,
            difficulty,
            language,
            concepts,
            timeLimit,
            type,
            learningStyle
        } = req.body;

        const exercise = await exerciseGenerator.generateExercise({
            topic,
            difficulty,
            language,
            concepts,
            timeLimit,
            type,
            learningStyle,
            previousExercises: req.user.completedExercises
        });

        res.json(exercise);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Error generating exercise' });
    }
});

// Analyze code and provide feedback
router.post('/analyze-code', auth, async (req, res) => {
    try {
        const { code, language, exerciseId } = req.body;
        const feedback = await exerciseGenerator.generateFeedback(code, exerciseId, language);
        
        // Award points for code submission
        const points = await gamificationSystem.awardPoints(req.user.id, 'code_submission', {
            language,
            exerciseId,
            quality: feedback.quality
        });

        res.json({ feedback, points });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Error analyzing code' });
    }
});

// Get hints for practice problems
router.post('/hints', auth, async (req, res) => {
    try {
        const { code, error, language } = req.body;
        const hints = await exerciseGenerator.generateHints(code, error, language);
        res.json({ hints });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Error generating hints' });
    }
});

// Generate personalized learning path
router.post('/learning-path', auth, async (req, res) => {
    try {
        const userProfile = {
            learningStyle: req.user.learningStyle,
            currentSkillLevel: req.user.skillLevel,
            goals: req.user.goals,
            interests: req.user.interests,
            timeCommitment: req.user.timeCommitment,
            previousCourses: req.user.completedCourses,
            completedExercises: req.user.completedExercises,
            performance: req.user.performance,
            preferredLanguages: req.user.preferredLanguages
        };

        const learningPath = await recommendationEngine.generatePersonalizedPath(userProfile);
        res.json({ learningPath });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Error generating learning path' });
    }
});

// Get next recommended content
router.get('/recommendations', auth, async (req, res) => {
    try {
        const recommendations = await recommendationEngine.getNextBestContent(
            req.user.id,
            req.query.contentPool
        );
        res.json({ recommendations });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Error getting recommendations' });
    }
});

// Generate skill map
router.get('/skill-map', auth, async (req, res) => {
    try {
        const skillMap = await recommendationEngine.generateSkillMap(req.user.id);
        res.json({ skillMap });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Error generating skill map' });
    }
});

// Get user progress and achievements
router.get('/progress', auth, async (req, res) => {
    try {
        const progress = await gamificationSystem.getUserProgress(req.user.id);
        res.json({ progress });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Error getting progress' });
    }
});

// Get leaderboard
router.get('/leaderboard', auth, async (req, res) => {
    try {
        const { type = 'global', timeframe = 'weekly', limit = 10 } = req.query;
        const leaderboard = await gamificationSystem.getLeaderboard(type, timeframe, limit);
        res.json({ leaderboard });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Error getting leaderboard' });
    }
});

module.exports = router;
