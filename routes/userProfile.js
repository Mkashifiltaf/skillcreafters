const express = require('express');
const UserProfile = require('../models/userProfile');

const router = express.Router();

// Create or update user profile
router.post('/', async (req, res) => {
    try {
        const { userId, learningStyle, currentSkillLevel, goals, interests, previousCourses, completedExercises, performance, preferredLanguages } = req.body;

        const profile = await UserProfile.findOneAndUpdate({ userId }, {
            learningStyle,
            currentSkillLevel,
            goals,
            interests,
            previousCourses,
            completedExercises,
            performance,
            preferredLanguages
        }, { new: true, upsert: true });

        res.status(200).json(profile);
    } catch (error) {
        res.status(500).json({ message: 'Error creating or updating user profile', error });
    }
});

// Get user profile by userId
router.get('/:userId', async (req, res) => {
    try {
        const profile = await UserProfile.findOne({ userId: req.params.userId });
        if (!profile) return res.status(404).json({ message: 'Profile not found' });
        res.status(200).json(profile);
    } catch (error) {
        res.status(500).json({ message: 'Error retrieving user profile', error });
    }
});

module.exports = router;
