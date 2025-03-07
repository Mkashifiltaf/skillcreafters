const logger = require('../utils/logger');

class CompetitiveGamification {
    constructor(db) {
        this.db = db;
    }

    async createChallenge(data) {
        const { name, description, startDate, endDate, maxTeams } = data;

        const challenge = await this.db.challenges.create({
            name,
            description,
            startDate,
            endDate,
            maxTeams,
            teams: [],
            status: 'upcoming'
        });

        logger.info('Challenge created', { challengeId: challenge._id });
        return challenge;
    }

    async registerTeam(challengeId, teamData) {
        const challenge = await this.db.challenges.findById(challengeId);

        if (!challenge) {
            throw new Error('Challenge not found');
        }

        if (challenge.teams.length >= challenge.maxTeams) {
            throw new Error('Challenge is full');
        }

        challenge.teams.push(teamData);
        await challenge.save();

        logger.info('Team registered for challenge', { challengeId, team: teamData });
        return challenge;
    }

    async startChallenge(challengeId) {
        const challenge = await this.db.challenges.findById(challengeId);

        if (!challenge) {
            throw new Error('Challenge not found');
        }

        challenge.status = 'ongoing';
        await challenge.save();

        logger.info('Challenge started', { challengeId });
        return challenge;
    }

    async endChallenge(challengeId) {
        const challenge = await this.db.challenges.findById(challengeId);

        if (!challenge) {
            throw new Error('Challenge not found');
        }

        challenge.status = 'completed';
        await challenge.save();

        logger.info('Challenge ended', { challengeId });
        return challenge;
    }

    async scoreChallenge(challengeId, scores) {
        const challenge = await this.db.challenges.findById(challengeId);

        if (!challenge) {
            throw new Error('Challenge not found');
        }

        challenge.scores = scores;
        await challenge.save();

        logger.info('Scores updated for challenge', { challengeId, scores });
        return challenge;
    }

    async getLeaderboard(challengeId) {
        const challenge = await this.db.challenges.findById(challengeId);

        if (!challenge) {
            throw new Error('Challenge not found');
        }

        const leaderboard = challenge.teams.sort((a, b) => b.score - a.score);
        return leaderboard;
    }

    async awardPoints(userId, activity, details) {
        if (!userId || !activity) {
            throw new Error('Invalid userId or activity.');
        }
        const pointsMap = {
            'exercise_completion': 10,
            'course_completion': 100,
            'streak_continuation': 20,
            'helping_others': 30,
            'bug_fixing': 15,
            'code_review': 25,
            'documentation': 20,
            'quiz_completion': 15
        };
        const points = pointsMap[activity] || 0;
        const multiplier = await this.getMultiplier(userId, activity);
        const totalPoints = Math.round(points * multiplier);
        await this.updateUserPoints(userId, totalPoints);
        await this.checkLevelUp(userId);
        await this.checkAchievements(userId, activity, details);
        return {
            activity,
            basePoints: points,
            multiplier,
            totalPoints,
            newTotal: await this.getUserPoints(userId)
        };
    }

    async getMultiplier(userId, activity) {
        if (!userId || !activity) {
            throw new Error('Invalid userId or activity.');
        }
        const streak = await this.getUserStreak(userId);
        const baseMultiplier = 1.0;
        // Streak multiplier
        const streakMultiplier = Math.min(streak / 10, 0.5);
        // Time of day multiplier (encourage consistent learning times)
        const hourMultiplier = this.getTimeMultiplier();
        // Quality multiplier (based on previous performance)
        const qualityMultiplier = await this.getQualityMultiplier(userId, activity);
        return baseMultiplier + streakMultiplier + hourMultiplier + qualityMultiplier;
    }
}

module.exports = CompetitiveGamification;
