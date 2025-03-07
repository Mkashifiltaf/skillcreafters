const logger = require('../utils/logger');

class SkillMasterySystem {
    constructor(db) {
        this.db = db;
        this.masteryLevels = {
            NOVICE: { name: 'Novice', minPoints: 0, maxPoints: 100 },
            APPRENTICE: { name: 'Apprentice', minPoints: 101, maxPoints: 300 },
            PRACTITIONER: { name: 'Practitioner', minPoints: 301, maxPoints: 600 },
            EXPERT: { name: 'Expert', minPoints: 601, maxPoints: 1000 },
            MASTER: { name: 'Master', minPoints: 1001, maxPoints: 1500 },
            GRANDMASTER: { name: 'Grandmaster', minPoints: 1501, maxPoints: null }
        };
    }

    async initializeSkillTree(userId) {
        const skillTree = {
            programming: {
                languages: {
                    python: { points: 0, level: 'NOVICE', subskills: {} },
                    javascript: { points: 0, level: 'NOVICE', subskills: {} },
                    java: { points: 0, level: 'NOVICE', subskills: {} }
                },
                concepts: {
                    algorithms: { points: 0, level: 'NOVICE', subskills: {} },
                    dataStructures: { points: 0, level: 'NOVICE', subskills: {} },
                    designPatterns: { points: 0, level: 'NOVICE', subskills: {} }
                }
            },
            softSkills: {
                communication: { points: 0, level: 'NOVICE', subskills: {} },
                teamwork: { points: 0, level: 'NOVICE', subskills: {} },
                problemSolving: { points: 0, level: 'NOVICE', subskills: {} }
            }
        };

        await this.db.users.updateOne(
            { _id: userId },
            { $set: { skillTree } }
        );

        logger.info('Skill tree initialized', {
            operation: 'initialize_skill_tree',
            userId
        });

        return skillTree;
    }

    async awardPoints(userId, skillPath, points, context) {
        const user = await this.db.users.findById(userId);
        let skill = this.getSkillByPath(user.skillTree, skillPath);

        if (!skill) {
            throw new Error('Skill not found');
        }

        // Calculate bonus points based on context
        const bonusPoints = this.calculateBonusPoints(points, context);
        const totalPoints = points + bonusPoints;

        // Update skill points
        skill.points += totalPoints;

        // Update skill level
        const newLevel = this.calculateMasteryLevel(skill.points);
        const levelChanged = skill.level !== newLevel;
        skill.level = newLevel;

        // Update parent skills
        if (skillPath.includes('.')) {
            const parentPaths = this.getParentPaths(skillPath);
            for (const parentPath of parentPaths) {
                const parentSkill = this.getSkillByPath(user.skillTree, parentPath);
                parentSkill.points += Math.floor(totalPoints * 0.5); // Parent skills get 50% of points
                parentSkill.level = this.calculateMasteryLevel(parentSkill.points);
            }
        }

        await user.save();

        logger.info('Skill points awarded', {
            operation: 'award_points',
            userId,
            skillPath,
            points: totalPoints,
            newLevel: skill.level
        });

        return {
            skill,
            pointsAwarded: totalPoints,
            levelUp: levelChanged
        };
    }

    calculateBonusPoints(basePoints, context) {
        let bonus = 0;

        // Streak bonus
        if (context.streak) {
            bonus += Math.floor(basePoints * (context.streak * 0.1)); // 10% bonus per day in streak
        }

        // Time spent bonus
        if (context.timeSpent) {
            bonus += Math.floor(basePoints * Math.min(context.timeSpent / 3600, 0.5)); // Up to 50% bonus for time spent
        }

        // Difficulty bonus
        if (context.difficulty) {
            const difficultyMultipliers = {
                easy: 1,
                medium: 1.5,
                hard: 2,
                expert: 3
            };
            bonus += Math.floor(basePoints * (difficultyMultipliers[context.difficulty] - 1));
        }

        // Quality bonus
        if (context.quality) {
            bonus += Math.floor(basePoints * (context.quality / 100));
        }

        // First time bonus
        if (context.firstTime) {
            bonus += Math.floor(basePoints * 0.5); // 50% bonus for first time completion
        }

        return bonus;
    }

    calculateMasteryLevel(points) {
        for (const [level, range] of Object.entries(this.masteryLevels)) {
            if (points >= range.minPoints && (!range.maxPoints || points <= range.maxPoints)) {
                return level;
            }
        }
        return 'GRANDMASTER'; // Default to highest level if points exceed all ranges
    }

    async getSkillProgress(userId, skillPath) {
        const user = await this.db.users.findById(userId);
        const skill = this.getSkillByPath(user.skillTree, skillPath);

        if (!skill) {
            throw new Error('Skill not found');
        }

        const level = this.masteryLevels[skill.level];
        const nextLevel = this.getNextLevel(skill.level);

        return {
            currentLevel: level.name,
            points: skill.points,
            nextLevel: nextLevel ? nextLevel.name : null,
            pointsToNextLevel: nextLevel ? nextLevel.minPoints - skill.points : 0,
            progress: nextLevel ? 
                ((skill.points - level.minPoints) / (nextLevel.minPoints - level.minPoints)) * 100 : 100
        };
    }

    async getSkillRecommendations(userId) {
        const user = await this.db.users.findById(userId);
        const recommendations = [];

        // Analyze skill tree for recommendations
        const analyzeSkill = (skill, path) => {
            const siblings = this.getSiblingSkills(user.skillTree, path);
            const avgSiblingPoints = siblings.reduce((sum, s) => sum + s.points, 0) / siblings.length;

            // Recommend underleveled skills
            if (skill.points < avgSiblingPoints * 0.7) {
                recommendations.push({
                    skillPath: path,
                    reason: 'This skill is falling behind related skills',
                    priority: 'high'
                });
            }

            // Recommend skills close to level up
            const nextLevel = this.getNextLevel(skill.level);
            if (nextLevel) {
                const pointsToNext = nextLevel.minPoints - skill.points;
                if (pointsToNext <= 50) {
                    recommendations.push({
                        skillPath: path,
                        reason: `Close to reaching ${nextLevel.name} level`,
                        priority: 'medium'
                    });
                }
            }

            // Recursively analyze subskills
            for (const [subName, subSkill] of Object.entries(skill.subskills)) {
                analyzeSkill(subSkill, `${path}.${subName}`);
            }
        };

        analyzeSkill(user.skillTree, 'root');

        return recommendations;
    }

    async generateSkillReport(userId) {
        const user = await this.db.users.findById(userId);
        const report = {
            overview: {
                totalPoints: 0,
                highestLevel: 'NOVICE',
                skillCount: 0,
                masteredSkills: 0
            },
            categoryBreakdown: {},
            recentProgress: [],
            recommendations: []
        };

        // Analyze skill tree
        const analyzeSkill = (skill, path) => {
            report.overview.totalPoints += skill.points;
            report.overview.skillCount++;

            if (skill.level === 'MASTER' || skill.level === 'GRANDMASTER') {
                report.overview.masteredSkills++;
            }

            if (this.masteryLevels[skill.level].minPoints > 
                this.masteryLevels[report.overview.highestLevel].minPoints) {
                report.overview.highestLevel = skill.level;
            }

            // Category breakdown
            const category = path.split('.')[0];
            if (!report.categoryBreakdown[category]) {
                report.categoryBreakdown[category] = {
                    points: 0,
                    skills: 0,
                    averageLevel: 0
                };
            }
            report.categoryBreakdown[category].points += skill.points;
            report.categoryBreakdown[category].skills++;
            report.categoryBreakdown[category].averageLevel += 
                this.masteryLevels[skill.level].minPoints;
        };

        const traverseSkillTree = (node, path = '') => {
            for (const [key, skill] of Object.entries(node)) {
                const currentPath = path ? `${path}.${key}` : key;
                analyzeSkill(skill, currentPath);
                if (skill.subskills) {
                    traverseSkillTree(skill.subskills, currentPath);
                }
            }
        };

        traverseSkillTree(user.skillTree);

        // Calculate averages
        for (const category of Object.values(report.categoryBreakdown)) {
            category.averageLevel = this.calculateMasteryLevel(
                category.averageLevel / category.skills
            );
        }

        // Get recent progress
        report.recentProgress = await this.db.skillProgress
            .find({ userId })
            .sort({ timestamp: -1 })
            .limit(10);

        // Get recommendations
        report.recommendations = await this.getSkillRecommendations(userId);

        return report;
    }

    // Helper methods
    getSkillByPath(skillTree, path) {
        return path.split('.').reduce((obj, key) => obj && obj[key], skillTree);
    }

    getParentPaths(path) {
        const parts = path.split('.');
        const paths = [];
        for (let i = 1; i < parts.length; i++) {
            paths.push(parts.slice(0, i).join('.'));
        }
        return paths;
    }

    getSiblingSkills(skillTree, path) {
        const parentPath = path.split('.').slice(0, -1).join('.');
        const parent = this.getSkillByPath(skillTree, parentPath);
        return parent ? Object.values(parent) : [];
    }

    getNextLevel(currentLevel) {
        const levels = Object.entries(this.masteryLevels);
        const currentIndex = levels.findIndex(([level]) => level === currentLevel);
        return currentIndex < levels.length - 1 ? levels[currentIndex + 1][1] : null;
    }
}

module.exports = SkillMasterySystem;
