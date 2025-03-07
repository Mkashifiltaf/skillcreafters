class GamificationSystem {
    constructor(db) {
        this.db = db;
        this.achievementTypes = {
            STREAK: 'streak',
            COMPLETION: 'completion',
            MASTERY: 'mastery',
            CONTRIBUTION: 'contribution',
            SPEED: 'speed',
            ACCURACY: 'accuracy',
            EXPLORATION: 'exploration',
            SOCIAL: 'social'
        };

        this.levels = [
            { level: 1, xpRequired: 0, title: 'Novice' },
            { level: 2, xpRequired: 100, title: 'Apprentice' },
            { level: 3, xpRequired: 300, title: 'Developer' },
            { level: 4, xpRequired: 600, title: 'Skilled Developer' },
            { level: 5, xpRequired: 1000, title: 'Expert' },
            { level: 6, xpRequired: 1500, title: 'Master' },
            { level: 7, xpRequired: 2100, title: 'Grandmaster' },
            { level: 8, xpRequired: 2800, title: 'Legend' },
            { level: 9, xpRequired: 3600, title: 'Champion' },
            { level: 10, xpRequired: 4500, title: 'Elite' }
        ];

        this.badges = {
            streaks: [
                { id: 'streak_3', name: '3-Day Streak', description: 'Learn for 3 consecutive days', xp: 50 },
                { id: 'streak_7', name: 'Weekly Warrior', description: 'Learn for 7 consecutive days', xp: 100 },
                { id: 'streak_30', name: 'Monthly Master', description: 'Learn for 30 consecutive days', xp: 500 }
            ],
            completion: [
                { id: 'complete_1', name: 'First Steps', description: 'Complete your first course', xp: 100 },
                { id: 'complete_5', name: 'Course Collector', description: 'Complete 5 courses', xp: 300 },
                { id: 'complete_10', name: 'Knowledge Seeker', description: 'Complete 10 courses', xp: 500 }
            ],
            mastery: [
                { id: 'master_python', name: 'Python Master', description: 'Achieve mastery in Python', xp: 1000 },
                { id: 'master_js', name: 'JavaScript Guru', description: 'Achieve mastery in JavaScript', xp: 1000 },
                { id: 'master_java', name: 'Java Expert', description: 'Achieve mastery in Java', xp: 1000 }
            ],
            contribution: [
                { id: 'contribute_1', name: 'Helper', description: 'Help another student', xp: 50 },
                { id: 'contribute_10', name: 'Mentor', description: 'Help 10 students', xp: 200 },
                { id: 'contribute_50', name: 'Community Leader', description: 'Help 50 students', xp: 1000 }
            ]
        };
    }

    async awardPoints(userId, activity, details) {
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
        const streak = await this.getUserStreak(userId);
        const baseMultiplier = 1.0;
        
        // Streak multiplier
        const streakMultiplier = Math.min(streak / 10, 0.5); // Max 1.5x for 10-day streak
        
        // Time of day multiplier (encourage consistent learning times)
        const hourMultiplier = this.getTimeMultiplier();
        
        // Quality multiplier (based on previous performance)
        const qualityMultiplier = await this.getQualityMultiplier(userId, activity);
        
        return baseMultiplier + streakMultiplier + hourMultiplier + qualityMultiplier;
    }

    getTimeMultiplier() {
        const hour = new Date().getHours();
        // Bonus for learning during focused hours (8AM-11AM, 2PM-5PM)
        if ((hour >= 8 && hour <= 11) || (hour >= 14 && hour <= 17)) {
            return 0.2;
        }
        return 0;
    }

    async getQualityMultiplier(userId, activity) {
        const recentActivities = await this.getRecentActivities(userId, activity);
        if (!recentActivities.length) return 0;

        const averageQuality = recentActivities.reduce((sum, act) => 
            sum + act.quality, 0) / recentActivities.length;
        
        return Math.min(averageQuality / 2, 0.3); // Max 0.3x bonus for quality
    }

    async checkLevelUp(userId) {
        const currentXP = await this.getUserPoints(userId);
        const currentLevel = await this.getUserLevel(userId);
        const nextLevel = this.levels.find(l => l.level === currentLevel + 1);

        if (nextLevel && currentXP >= nextLevel.xpRequired) {
            await this.updateUserLevel(userId, nextLevel.level);
            await this.awardLevelUpRewards(userId, nextLevel);
            return {
                levelUp: true,
                newLevel: nextLevel.level,
                title: nextLevel.title,
                rewards: await this.getLevelUpRewards(nextLevel.level)
            };
        }

        return { levelUp: false };
    }

    async awardLevelUpRewards(userId, level) {
        const rewards = await this.getLevelUpRewards(level.level);
        
        // Award rewards
        for (const reward of rewards) {
            switch (reward.type) {
                case 'badge':
                    await this.awardBadge(userId, reward.id);
                    break;
                case 'feature':
                    await this.unlockFeature(userId, reward.id);
                    break;
                case 'bonus':
                    await this.awardBonus(userId, reward.amount);
                    break;
            }
        }
    }

    async checkAchievements(userId, activity, details) {
        const achievements = [];

        // Check streak achievements
        if (activity === 'streak_continuation') {
            const streak = await this.getUserStreak(userId);
            const streakAchievements = this.badges.streaks.filter(badge => 
                streak >= parseInt(badge.id.split('_')[1])
            );
            achievements.push(...streakAchievements);
        }

        // Check completion achievements
        if (activity === 'course_completion') {
            const completedCourses = await this.getCompletedCourses(userId);
            const completionAchievements = this.badges.completion.filter(badge =>
                completedCourses.length >= parseInt(badge.id.split('_')[1])
            );
            achievements.push(...completionAchievements);
        }

        // Check mastery achievements
        if (activity === 'mastery_achieved') {
            const masteryAchievement = this.badges.mastery.find(badge =>
                badge.id === `master_${details.language.toLowerCase()}`
            );
            if (masteryAchievement) {
                achievements.push(masteryAchievement);
            }
        }

        // Award new achievements
        for (const achievement of achievements) {
            await this.awardAchievement(userId, achievement);
        }

        return achievements;
    }

    async getLeaderboard(type = 'global', timeframe = 'weekly', limit = 10) {
        const leaderboards = {
            global: await this.getGlobalLeaderboard(timeframe, limit),
            friends: await this.getFriendsLeaderboard(timeframe, limit),
            local: await this.getLocalLeaderboard(timeframe, limit)
        };
        if (!leaderboards[type]) {
            throw new Error('Invalid leaderboard type.');
        }
        return leaderboards[type];
    }

    async getGlobalLeaderboard(timeframe, limit) {
        // Implementation for global leaderboard
        const query = this.createLeaderboardQuery(timeframe);
        return await this.db.users.find(query)
            .sort({ points: -1 })
            .limit(limit)
            .project({
                username: 1,
                points: 1,
                level: 1,
                badges: 1
            });
    }

    async getFriendsLeaderboard(userId, timeframe, limit) {
        const friends = await this.getUserFriends(userId);
        const query = {
            userId: { $in: friends },
            ...this.createLeaderboardQuery(timeframe)
        };
        
        return await this.db.users.find(query)
            .sort({ points: -1 })
            .limit(limit)
            .project({
                username: 1,
                points: 1,
                level: 1,
                badges: 1
            });
    }

    createLeaderboardQuery(timeframe) {
        const now = new Date();
        const timeframes = {
            daily: new Date(now.setDate(now.getDate() - 1)),
            weekly: new Date(now.setDate(now.getDate() - 7)),
            monthly: new Date(now.setMonth(now.getMonth() - 1)),
            allTime: new Date(0)
        };

        return {
            lastActive: { $gte: timeframes[timeframe] || timeframes.weekly }
        };
    }

    async getUserProgress(userId) {
        return {
            level: await this.getUserLevel(userId),
            xp: await this.getUserPoints(userId),
            streak: await this.getUserStreak(userId),
            achievements: await this.getUserAchievements(userId),
            recentActivity: await this.getRecentActivities(userId),
            stats: await this.getUserStats(userId),
            nextMilestone: await this.getNextMilestone(userId)
        };
    }

    async getUserStats(userId) {
        const now = new Date();
        const thisWeek = new Date(now.setDate(now.getDate() - 7));

        return {
            totalExercisesCompleted: await this.countUserActivities(userId, 'exercise_completion'),
            weeklyExercisesCompleted: await this.countUserActivities(userId, 'exercise_completion', thisWeek),
            totalCoursesCompleted: await this.countUserActivities(userId, 'course_completion'),
            currentStreak: await this.getUserStreak(userId),
            longestStreak: await this.getUserLongestStreak(userId),
            helpfulnessRating: await this.getUserHelpfulnessRating(userId),
            averageAccuracy: await this.getUserAverageAccuracy(userId),
            totalPoints: await this.getUserPoints(userId),
            rank: await this.getUserRank(userId)
        };
    }

    async getNextMilestone(userId) {
        const currentStats = await this.getUserStats(userId);
        const nextMilestones = [];

        // Check next level
        const currentLevel = await this.getUserLevel(userId);
        const nextLevel = this.levels.find(l => l.level === currentLevel + 1);
        if (nextLevel) {
            nextMilestones.push({
                type: 'level',
                current: currentLevel,
                next: nextLevel.level,
                progress: currentStats.totalPoints / nextLevel.xpRequired,
                remaining: nextLevel.xpRequired - currentStats.totalPoints
            });
        }

        // Check next streak achievement
        const currentStreak = currentStats.currentStreak;
        const nextStreakBadge = this.badges.streaks.find(badge => {
            const requiredStreak = parseInt(badge.id.split('_')[1]);
            return currentStreak < requiredStreak;
        });
        if (nextStreakBadge) {
            nextMilestones.push({
                type: 'streak',
                current: currentStreak,
                next: parseInt(nextStreakBadge.id.split('_')[1]),
                progress: currentStreak / parseInt(nextStreakBadge.id.split('_')[1]),
                remaining: parseInt(nextStreakBadge.id.split('_')[1]) - currentStreak
            });
        }

        return nextMilestones;
    }

    // Skill Tree Management
    async unlockSkill(userId, skillId) {
        const user = await this.db.users.findById(userId);
        const skill = await this.db.skills.findById(skillId);

        if (!skill) {
            throw new Error('Skill not found');
        }

        // Check prerequisites
        for (const prereqId of skill.prerequisites) {
            if (!user.unlockedSkills.includes(prereqId)) {
                throw new Error('Prerequisites not met');
            }
        }

        // Check if user has enough skill points
        if (user.skillPoints < skill.cost) {
            throw new Error('Not enough skill points');
        }

        // Unlock skill
        user.unlockedSkills.push(skillId);
        user.skillPoints -= skill.cost;
        await user.save();

        logger.info('Skill unlocked', {
            operation: 'unlock_skill',
            userId,
            skillId
        });

        return { skill, remainingPoints: user.skillPoints };
    }

    async getSkillTree(userId) {
        const user = await this.db.users.findById(userId);
        const allSkills = await this.db.skills.find({});

        return allSkills.map(skill => ({
            ...skill.toObject(),
            unlocked: user.unlockedSkills.includes(skill._id),
            available: skill.prerequisites.every(prereq => 
                user.unlockedSkills.includes(prereq)
            )
        }));
    }

    // Quest System
    async startQuest(userId, questId) {
        const user = await this.db.users.findById(userId);
        const quest = await this.db.quests.findById(questId);

        if (!quest) {
            throw new Error('Quest not found');
        }

        // Check if user meets level requirement
        if (user.level < quest.requiredLevel) {
            throw new Error('Level requirement not met');
        }

        // Check if user has required skills
        for (const skillId of quest.requiredSkills) {
            if (!user.unlockedSkills.includes(skillId)) {
                throw new Error('Required skills not unlocked');
            }
        }

        // Start quest
        user.activeQuests.push({
            questId,
            progress: 0,
            started: new Date(),
            objectives: quest.objectives.map(obj => ({
                ...obj,
                completed: false
            }))
        });

        await user.save();

        logger.info('Quest started', {
            operation: 'start_quest',
            userId,
            questId
        });

        return quest;
    }

    async updateQuestProgress(userId, questId, objectiveId) {
        const user = await this.db.users.findById(userId);
        const activeQuest = user.activeQuests.find(q => q.questId.equals(questId));

        if (!activeQuest) {
            throw new Error('Quest not active');
        }

        const objective = activeQuest.objectives.find(o => o._id.equals(objectiveId));
        if (!objective) {
            throw new Error('Objective not found');
        }

        objective.completed = true;
        activeQuest.progress = (activeQuest.objectives.filter(o => o.completed).length / 
            activeQuest.objectives.length) * 100;

        // Check if quest is completed
        if (activeQuest.progress === 100) {
            const quest = await this.db.quests.findById(questId);
            
            // Award rewards
            user.experience += quest.experienceReward;
            user.currency += quest.currencyReward;
            
            // Add achievements
            if (quest.achievements) {
                user.achievements.push(...quest.achievements);
            }

            // Remove from active quests
            user.activeQuests = user.activeQuests.filter(q => !q.questId.equals(questId));
            
            // Add to completed quests
            user.completedQuests.push({
                questId,
                completedAt: new Date()
            });
        }

        await user.save();

        logger.info('Quest progress updated', {
            operation: 'update_quest_progress',
            userId,
            questId,
            progress: activeQuest.progress
        });

        return activeQuest;
    }

    // Enhanced Achievement System
    async checkAchievements(userId) {
        const user = await this.db.users.findById(userId);
        const allAchievements = await this.db.achievements.find({});
        const newAchievements = [];

        for (const achievement of allAchievements) {
            if (user.achievements.includes(achievement._id)) {
                continue;
            }

            let earned = false;
            switch (achievement.type) {
                case 'level':
                    earned = user.level >= achievement.requirement;
                    break;
                case 'skill_count':
                    earned = user.unlockedSkills.length >= achievement.requirement;
                    break;
                case 'quest_count':
                    earned = user.completedQuests.length >= achievement.requirement;
                    break;
                case 'streak':
                    earned = user.currentStreak >= achievement.requirement;
                    break;
                case 'contribution':
                    earned = user.contributions >= achievement.requirement;
                    break;
            }

            if (earned) {
                user.achievements.push(achievement._id);
                user.experience += achievement.experienceReward;
                newAchievements.push(achievement);
            }
        }

        if (newAchievements.length > 0) {
            await user.save();
            
            logger.info('New achievements earned', {
                operation: 'check_achievements',
                userId,
                achievements: newAchievements.map(a => a._id)
            });
        }

        return newAchievements;
    }

    // Daily Rewards and Streaks
    async claimDailyReward(userId) {
        const user = await this.db.users.findById(userId);
        const now = new Date();
        const lastClaim = user.lastDailyReward;

        // Check if reward is available
        if (lastClaim && isSameDay(now, lastClaim)) {
            throw new Error('Daily reward already claimed');
        }

        // Calculate streak
        if (lastClaim && isDayBefore(lastClaim, now)) {
            user.currentStreak++;
            user.maxStreak = Math.max(user.currentStreak, user.maxStreak);
        } else {
            user.currentStreak = 1;
        }

        // Calculate reward
        const baseReward = 100;
        const streakBonus = Math.min(user.currentStreak * 10, 100); // Cap at 100% bonus
        const totalReward = baseReward * (1 + streakBonus / 100);

        user.currency += totalReward;
        user.lastDailyReward = now;

        await user.save();

        logger.info('Daily reward claimed', {
            operation: 'claim_daily_reward',
            userId,
            reward: totalReward,
            streak: user.currentStreak
        });

        return {
            reward: totalReward,
            streak: user.currentStreak,
            nextReward: baseReward * (1 + Math.min((user.currentStreak + 1) * 10, 100) / 100)
        };
    }

    // Leaderboard System
    async getLeaderboard(category, timeframe = 'weekly', limit = 10) {
        const now = new Date();
        let startDate;

        switch (timeframe) {
            case 'daily':
                startDate = new Date(now.setHours(0, 0, 0, 0));
                break;
            case 'weekly':
                startDate = new Date(now.setDate(now.getDate() - now.getDay()));
                break;
            case 'monthly':
                startDate = new Date(now.setDate(1));
                break;
            case 'all_time':
                startDate = new Date(0);
                break;
            default:
                throw new Error('Invalid timeframe');
        }

        const pipeline = [
            {
                $match: {
                    timestamp: { $gte: startDate }
                }
            },
            {
                $group: {
                    _id: '$userId',
                    score: { $sum: `$${category}` }
                }
            },
            {
                $sort: { score: -1 }
            },
            {
                $limit: limit
            },
            {
                $lookup: {
                    from: 'users',
                    localField: '_id',
                    foreignField: '_id',
                    as: 'user'
                }
            },
            {
                $unwind: '$user'
            },
            {
                $project: {
                    userId: '$_id',
                    username: '$user.username',
                    score: 1,
                    rank: { $add: [{ $indexOfArray: ['$_id', '$_id'] }, 1] }
                }
            }
        ];

        return await this.db.activities.aggregate(pipeline);
    }

    // Team Challenges
    async createTeamChallenge(data) {
        const {
            name,
            description,
            startDate,
            endDate,
            objectives,
            rewards,
            teamSize,
            creator
        } = data;

        const challenge = await this.db.teamChallenges.create({
            name,
            description,
            startDate,
            endDate,
            objectives,
            rewards,
            teamSize,
            creator,
            status: 'recruiting',
            teams: []
        });

        logger.info('Team challenge created', {
            operation: 'create_team_challenge',
            challengeId: challenge._id,
            creator
        });

        return challenge;
    }

    async joinTeamChallenge(challengeId, userId, teamId = null) {
        const challenge = await this.db.teamChallenges.findById(challengeId);
        
        if (!challenge) {
            throw new Error('Challenge not found');
        }

        if (challenge.status !== 'recruiting') {
            throw new Error('Challenge is not recruiting');
        }

        // Join existing team or create new one
        if (teamId) {
            const team = challenge.teams.find(t => t._id.equals(teamId));
            if (!team) {
                throw new Error('Team not found');
            }
            if (team.members.length >= challenge.teamSize) {
                throw new Error('Team is full');
            }
            team.members.push(userId);
        } else {
            challenge.teams.push({
                name: `Team ${challenge.teams.length + 1}`,
                members: [userId],
                progress: 0,
                completedObjectives: []
            });
        }

        await challenge.save();

        logger.info('User joined team challenge', {
            operation: 'join_team_challenge',
            challengeId,
            userId,
            teamId
        });

        return challenge;
    }

    // Helper functions
    isSameDay(date1, date2) {
        return date1.getFullYear() === date2.getFullYear() &&
            date1.getMonth() === date2.getMonth() &&
            date1.getDate() === date2.getDate();
    }

    isDayBefore(date1, date2) {
        const day1 = new Date(date1.setHours(0, 0, 0, 0));
        const day2 = new Date(date2.setHours(0, 0, 0, 0));
        const diffTime = Math.abs(day2 - day1);
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        return diffDays === 1;
    }
}

module.exports = GamificationSystem;
