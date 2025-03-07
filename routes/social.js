const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const SocialLearningSystem = require('../services/social-learning');
const logger = require('../utils/logger');

const socialSystem = new SocialLearningSystem(require('../config/db'));

// Study Groups
router.post('/groups', auth, async (req, res) => {
    try {
        const group = await socialSystem.createStudyGroup({
            ...req.body,
            creator: req.user.id
        });
        res.json({ group });
    } catch (err) {
        logger.error('Error creating study group', { error: err });
        res.status(500).json({ message: 'Error creating study group' });
    }
});

router.post('/groups/:id/join', auth, async (req, res) => {
    try {
        const group = await socialSystem.joinStudyGroup(req.params.id, req.user.id);
        res.json({ group });
    } catch (err) {
        logger.error('Error joining study group', { error: err });
        res.status(500).json({ message: err.message });
    }
});

// Discussions
router.post('/discussions', auth, async (req, res) => {
    try {
        const discussion = await socialSystem.createDiscussion({
            ...req.body,
            author: req.user.id
        });
        res.json({ discussion });
    } catch (err) {
        logger.error('Error creating discussion', { error: err });
        res.status(500).json({ message: 'Error creating discussion' });
    }
});

router.post('/discussions/:id/reply', auth, async (req, res) => {
    try {
        const reply = await socialSystem.addDiscussionReply(req.params.id, {
            ...req.body,
            author: req.user.id
        });
        res.json({ reply });
    } catch (err) {
        logger.error('Error adding reply', { error: err });
        res.status(500).json({ message: 'Error adding reply' });
    }
});

// Code Reviews
router.post('/code-reviews', auth, async (req, res) => {
    try {
        const review = await socialSystem.requestCodeReview({
            ...req.body,
            author: req.user.id
        });
        res.json({ review });
    } catch (err) {
        logger.error('Error requesting code review', { error: err });
        res.status(500).json({ message: 'Error requesting code review' });
    }
});

router.post('/code-reviews/:id/submit', auth, async (req, res) => {
    try {
        const review = await socialSystem.submitCodeReview(req.params.id, {
            ...req.body,
            reviewer: req.user.id
        });
        res.json({ review });
    } catch (err) {
        logger.error('Error submitting code review', { error: err });
        res.status(500).json({ message: 'Error submitting code review' });
    }
});

// Mentor Sessions
router.post('/mentor-sessions', auth, async (req, res) => {
    try {
        const session = await socialSystem.createMentorSession({
            ...req.body,
            mentor: req.user.id
        });
        res.json({ session });
    } catch (err) {
        logger.error('Error creating mentor session', { error: err });
        res.status(500).json({ message: 'Error creating mentor session' });
    }
});

router.post('/mentor-sessions/:id/join', auth, async (req, res) => {
    try {
        const session = await socialSystem.joinMentorSession(req.params.id, req.user.id);
        res.json({ session });
    } catch (err) {
        logger.error('Error joining mentor session', { error: err });
        res.status(500).json({ message: err.message });
    }
});

// Project Collaborations
router.post('/projects', auth, async (req, res) => {
    try {
        const project = await socialSystem.createProjectCollaboration({
            ...req.body,
            creator: req.user.id
        });
        res.json({ project });
    } catch (err) {
        logger.error('Error creating project', { error: err });
        res.status(500).json({ message: 'Error creating project' });
    }
});

router.post('/projects/:id/join', auth, async (req, res) => {
    try {
        const project = await socialSystem.joinProjectCollaboration(
            req.params.id,
            req.user.id,
            req.body
        );
        res.json({ project });
    } catch (err) {
        logger.error('Error joining project', { error: err });
        res.status(500).json({ message: err.message });
    }
});

// User Activity
router.get('/activity', auth, async (req, res) => {
    try {
        const activities = await socialSystem.getUserActivity(
            req.user.id,
            req.query.type,
            parseInt(req.query.limit) || 10
        );
        res.json({ activities });
    } catch (err) {
        logger.error('Error getting user activity', { error: err });
        res.status(500).json({ message: 'Error getting user activity' });
    }
});

// Recommended Groups
router.get('/recommended-groups', auth, async (req, res) => {
    try {
        const groups = await socialSystem.getRecommendedGroups(req.user.id);
        res.json({ groups });
    } catch (err) {
        logger.error('Error getting recommended groups', { error: err });
        res.status(500).json({ message: 'Error getting recommended groups' });
    }
});

// Search Mentors
router.get('/mentors', auth, async (req, res) => {
    try {
        const mentors = await socialSystem.searchMentors(req.query);
        res.json({ mentors });
    } catch (err) {
        logger.error('Error searching mentors', { error: err });
        res.status(500).json({ message: 'Error searching mentors' });
    }
});

// Group Analytics
router.get('/groups/:id/analytics', auth, async (req, res) => {
    try {
        const analytics = await socialSystem.getGroupAnalytics(req.params.id);
        res.json({ analytics });
    } catch (err) {
        logger.error('Error getting group analytics', { error: err });
        res.status(500).json({ message: 'Error getting group analytics' });
    }
});

module.exports = router;
