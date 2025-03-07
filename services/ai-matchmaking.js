const tf = require('@tensorflow/tfjs-node');
const natural = require('natural');
const logger = require('../utils/logger');

class AIMatchmaking {
    constructor(db) {
        this.db = db;
        this.similarityThreshold = 0.75;
        this.loadModels();
    }

    async loadModels() {
        try {
            this.matchingModel = await tf.loadLayersModel('file://models/peer_matching');
            this.skillModel = await tf.loadLayersModel('file://models/skill_analysis');
            this.compatibilityModel = await tf.loadLayersModel('file://models/compatibility');
        } catch (err) {
            logger.error('Error loading matchmaking models', { error: err });
        }
    }

    async findIdealMatch(userId, context) {
        const user = await this.db.users.findById(userId);
        const userProfile = await this.buildUserProfile(user);
        const matchContext = await this.analyzeMatchContext(context);

        // Get potential matches
        const potentialMatches = await this.findPotentialMatches(userProfile, matchContext);
        
        // Score and rank matches
        const rankedMatches = await this.rankMatches(userProfile, potentialMatches, matchContext);

        // Get detailed compatibility analysis
        const topMatches = await this.analyzeCompatibility(userProfile, rankedMatches.slice(0, 5));

        return {
            matches: topMatches,
            analysis: this.generateMatchAnalysis(topMatches),
            recommendations: this.generateMatchRecommendations(topMatches)
        };
    }

    async findStudyGroup(userId, preferences) {
        const user = await this.db.users.findById(userId);
        const userProfile = await this.buildUserProfile(user);

        // Find active study groups
        const groups = await this.db.studyGroups.find({ status: 'active' });

        // Analyze group dynamics
        const groupAnalysis = await Promise.all(groups.map(async group => ({
            group,
            dynamics: await this.analyzeGroupDynamics(group),
            compatibility: await this.calculateGroupCompatibility(userProfile, group),
            learningAlignment: await this.analyzeLearningAlignment(userProfile, group)
        })));

        // Rank groups based on multiple factors
        const rankedGroups = this.rankStudyGroups(groupAnalysis, preferences);

        return {
            recommendations: rankedGroups.slice(0, 5),
            analysis: this.generateGroupAnalysis(rankedGroups),
            alternativeOptions: await this.generateAlternativeOptions(userProfile, preferences)
        };
    }

    async matchMentor(userId, requirements) {
        const user = await this.db.users.findById(userId);
        const userProfile = await this.buildUserProfile(user);

        // Find potential mentors
        const mentors = await this.db.users.find({ 
            isMentor: true,
            active: true,
            'mentorProfile.availability': true
        });

        // Analyze mentor-mentee compatibility
        const mentorAnalysis = await Promise.all(mentors.map(async mentor => ({
            mentor,
            compatibility: await this.analyzeMentorCompatibility(userProfile, mentor),
            expertise: await this.analyzeExpertiseMatch(requirements, mentor),
            availability: await this.analyzeAvailability(mentor, requirements)
        })));

        // Rank mentors
        const rankedMentors = this.rankMentors(mentorAnalysis, requirements);

        return {
            recommendations: rankedMentors.slice(0, 3),
            analysis: this.generateMentorAnalysis(rankedMentors),
            alternativeMentors: await this.findAlternativeMentors(requirements)
        };
    }

    async findProjectCollaborators(projectId, requirements) {
        const project = await this.db.projects.findById(projectId);
        const projectProfile = await this.buildProjectProfile(project);

        // Find potential collaborators
        const collaborators = await this.db.users.find({
            skills: { $in: project.requiredSkills },
            availability: true
        });

        // Analyze project-collaborator fit
        const collaboratorAnalysis = await Promise.all(collaborators.map(async user => ({
            user,
            skillMatch: await this.analyzeSkillMatch(projectProfile, user),
            workStyle: await this.analyzeWorkStyleCompatibility(project, user),
            availability: await this.analyzeCollaboratorAvailability(user, project)
        })));

        // Rank collaborators
        const rankedCollaborators = this.rankCollaborators(collaboratorAnalysis, requirements);

        return {
            recommendations: rankedCollaborators.slice(0, 5),
            analysis: this.generateCollaboratorAnalysis(rankedCollaborators),
            teamComposition: this.analyzeTeamComposition(rankedCollaborators)
        };
    }

    // Profile Building Methods
    async buildUserProfile(user) {
        return {
            basic: this.extractBasicProfile(user),
            skills: await this.analyzeSkillProfile(user),
            learning: await this.analyzeLearningProfile(user),
            social: await this.analyzeSocialProfile(user),
            preferences: await this.analyzeUserPreferences(user)
        };
    }

    async buildProjectProfile(project) {
        return {
            requirements: this.analyzeProjectRequirements(project),
            complexity: this.analyzeProjectComplexity(project),
            teamDynamics: await this.analyzeTeamDynamics(project),
            timeline: this.analyzeProjectTimeline(project)
        };
    }

    // Analysis Methods
    async analyzeMatchContext(context) {
        const features = this.extractContextFeatures(context);
        const analysis = await this.matchingModel.predict(tf.tensor2d([features]));
        
        return this.interpretMatchAnalysis(analysis);
    }

    async analyzeGroupDynamics(group) {
        const members = await this.db.users.find({ _id: { $in: group.members } });
        const interactions = await this.getGroupInteractions(group._id);
        
        return {
            cohesion: this.calculateGroupCohesion(interactions),
            roles: this.identifyGroupRoles(members, interactions),
            activity: this.analyzeGroupActivity(interactions),
            performance: await this.analyzeGroupPerformance(group)
        };
    }

    async analyzeMentorCompatibility(mentee, mentor) {
        const features = this.extractMentorshipFeatures(mentee, mentor);
        const compatibility = await this.compatibilityModel.predict(tf.tensor2d([features]));
        
        return {
            score: this.interpretCompatibilityScore(compatibility),
            strengths: this.identifyMentorshipStrengths(mentee, mentor),
            challenges: this.identifyPotentialChallenges(mentee, mentor),
            recommendations: this.generateMentorshipRecommendations(mentee, mentor)
        };
    }

    // Ranking Methods
    async rankMatches(userProfile, potentialMatches, context) {
        return potentialMatches.map(match => ({
            ...match,
            scores: {
                skillAlignment: this.calculateSkillAlignmentScore(userProfile, match),
                learningCompatibility: this.calculateLearningCompatibilityScore(userProfile, match),
                scheduleCompatibility: this.calculateScheduleCompatibilityScore(userProfile, match),
                communicationStyle: this.calculateCommunicationStyleScore(userProfile, match)
            }
        }))
        .sort((a, b) => this.calculateOverallScore(b.scores) - this.calculateOverallScore(a.scores));
    }

    rankStudyGroups(groupAnalysis, preferences) {
        return groupAnalysis.map(analysis => ({
            ...analysis,
            scores: {
                learningAlignment: this.calculateLearningAlignmentScore(analysis),
                scheduleCompatibility: this.calculateGroupScheduleScore(analysis),
                topicRelevance: this.calculateTopicRelevanceScore(analysis, preferences),
                groupDynamics: this.calculateGroupDynamicsScore(analysis)
            }
        }))
        .sort((a, b) => this.calculateOverallGroupScore(b.scores) - this.calculateOverallGroupScore(a.scores));
    }

    rankMentors(mentorAnalysis, requirements) {
        return mentorAnalysis.map(analysis => ({
            ...analysis,
            scores: {
                expertiseMatch: this.calculateExpertiseMatchScore(analysis, requirements),
                availabilityMatch: this.calculateAvailabilityScore(analysis, requirements),
                teachingStyle: this.calculateTeachingStyleScore(analysis),
                pastSuccess: this.calculatePastSuccessScore(analysis)
            }
        }))
        .sort((a, b) => this.calculateOverallMentorScore(b.scores) - this.calculateOverallMentorScore(a.scores));
    }

    // Helper Methods
    calculateOverallScore(scores) {
        return Object.values(scores).reduce((sum, score) => sum + score, 0) / Object.keys(scores).length;
    }

    calculateOverallGroupScore(scores) {
        const weights = {
            learningAlignment: 0.3,
            scheduleCompatibility: 0.2,
            topicRelevance: 0.3,
            groupDynamics: 0.2
        };

        return Object.entries(scores).reduce((sum, [key, score]) => 
            sum + score * weights[key], 0);
    }

    calculateOverallMentorScore(scores) {
        const weights = {
            expertiseMatch: 0.4,
            availabilityMatch: 0.2,
            teachingStyle: 0.2,
            pastSuccess: 0.2
        };

        return Object.entries(scores).reduce((sum, [key, score]) => 
            sum + score * weights[key], 0);
    }

    async getGroupInteractions(groupId) {
        return await this.db.interactions.find({ groupId });
    }

    interpretCompatibilityScore(tensorScore) {
        return tensorScore.dataSync()[0];
    }
}

module.exports = AIMatchmaking;
