const mongoose = require('mongoose');
const logger = require('../utils/logger');

class SocialLearningSystem {
    constructor(db) {
        this.db = db;
        this.activityTypes = {
            QUESTION: 'question',
            ANSWER: 'answer',
            DISCUSSION: 'discussion',
            CODE_REVIEW: 'code_review',
            STUDY_GROUP: 'study_group',
            MENTOR_SESSION: 'mentor_session',
            PROJECT_COLLABORATION: 'project_collaboration'
        };
    }

    async createStudyGroup(data) {
        const {
            name,
            description,
            topic,
            skillLevel,
            maxMembers,
            schedule,
            creator,
            isPrivate
        } = data;

        const group = await this.db.studyGroups.create({
            name,
            description,
            topic,
            skillLevel,
            maxMembers,
            schedule,
            creator,
            isPrivate,
            members: [creator],
            created: new Date(),
            status: 'active'
        });

        logger.info('Study group created', {
            operation: 'create_study_group',
            groupId: group._id,
            creator
        });

        return group;
    }

    async joinStudyGroup(groupId, userId) {
        const group = await this.db.studyGroups.findById(groupId);
        
        if (!group) {
            throw new Error('Study group not found');
        }

        if (group.members.length >= group.maxMembers) {
            throw new Error('Study group is full');
        }

        if (group.members.includes(userId)) {
            throw new Error('Already a member of this group');
        }

        group.members.push(userId);
        await group.save();

        logger.info('User joined study group', {
            operation: 'join_study_group',
            groupId,
            userId
        });

        return group;
    }

    async createDiscussion(data) {
        const {
            title,
            content,
            tags,
            author,
            category,
            attachments,
            visibility
        } = data;

        const discussion = await this.db.discussions.create({
            title,
            content,
            tags,
            author,
            category,
            attachments,
            visibility,
            created: new Date(),
            status: 'active',
            views: 0,
            likes: 0,
            replies: []
        });

        logger.info('Discussion created', {
            operation: 'create_discussion',
            discussionId: discussion._id,
            author
        });

        return discussion;
    }

    async addDiscussionReply(discussionId, data) {
        const {
            content,
            author,
            attachments
        } = data;

        const reply = {
            content,
            author,
            attachments,
            created: new Date(),
            likes: 0
        };

        const discussion = await this.db.discussions.findById(discussionId);
        discussion.replies.push(reply);
        await discussion.save();

        logger.info('Reply added to discussion', {
            operation: 'add_discussion_reply',
            discussionId,
            author
        });

        return reply;
    }

    async requestCodeReview(data) {
        const {
            code,
            language,
            title,
            description,
            author,
            tags,
            visibility
        } = data;

        const review = await this.db.codeReviews.create({
            code,
            language,
            title,
            description,
            author,
            tags,
            visibility,
            created: new Date(),
            status: 'open',
            reviews: []
        });

        logger.info('Code review requested', {
            operation: 'request_code_review',
            reviewId: review._id,
            author
        });

        return review;
    }

    async submitCodeReview(reviewId, data) {
        const {
            reviewer,
            comments,
            suggestions,
            rating,
            codeSnippets
        } = data;

        const review = {
            reviewer,
            comments,
            suggestions,
            rating,
            codeSnippets,
            created: new Date()
        };

        const codeReview = await this.db.codeReviews.findById(reviewId);
        codeReview.reviews.push(review);
        
        if (codeReview.reviews.length >= 3) {
            codeReview.status = 'completed';
        }

        await codeReview.save();

        logger.info('Code review submitted', {
            operation: 'submit_code_review',
            reviewId,
            reviewer
        });

        return review;
    }

    async createMentorSession(data) {
        const {
            mentor,
            topic,
            description,
            duration,
            maxParticipants,
            schedule,
            tags,
            requirements
        } = data;

        const session = await this.db.mentorSessions.create({
            mentor,
            topic,
            description,
            duration,
            maxParticipants,
            schedule,
            tags,
            requirements,
            created: new Date(),
            status: 'scheduled',
            participants: []
        });

        logger.info('Mentor session created', {
            operation: 'create_mentor_session',
            sessionId: session._id,
            mentor
        });

        return session;
    }

    async joinMentorSession(sessionId, userId) {
        const session = await this.db.mentorSessions.findById(sessionId);
        
        if (!session) {
            throw new Error('Mentor session not found');
        }

        if (session.participants.length >= session.maxParticipants) {
            throw new Error('Session is full');
        }

        if (session.participants.includes(userId)) {
            throw new Error('Already registered for this session');
        }

        session.participants.push(userId);
        await session.save();

        logger.info('User joined mentor session', {
            operation: 'join_mentor_session',
            sessionId,
            userId
        });

        return session;
    }

    async createProjectCollaboration(data) {
        const {
            title,
            description,
            creator,
            technologies,
            difficulty,
            timeCommitment,
            maxCollaborators,
            requirements,
            goals
        } = data;

        const project = await this.db.projectCollaborations.create({
            title,
            description,
            creator,
            technologies,
            difficulty,
            timeCommitment,
            maxCollaborators,
            requirements,
            goals,
            created: new Date(),
            status: 'open',
            collaborators: [creator],
            tasks: []
        });

        logger.info('Project collaboration created', {
            operation: 'create_project',
            projectId: project._id,
            creator
        });

        return project;
    }

    async joinProjectCollaboration(projectId, userId, application) {
        const project = await this.db.projectCollaborations.findById(projectId);
        
        if (!project) {
            throw new Error('Project not found');
        }

        if (project.collaborators.length >= project.maxCollaborators) {
            throw new Error('Project team is full');
        }

        if (project.collaborators.includes(userId)) {
            throw new Error('Already a collaborator on this project');
        }

        // Add application for creator to review
        project.applications = project.applications || [];
        project.applications.push({
            userId,
            message: application.message,
            experience: application.experience,
            availability: application.availability,
            created: new Date(),
            status: 'pending'
        });

        await project.save();

        logger.info('User applied to project', {
            operation: 'apply_to_project',
            projectId,
            userId
        });

        return project;
    }

    async getUserActivity(userId, type = null, limit = 10) {
        const query = { userId };
        if (type) {
            query.type = type;
        }

        const activities = await this.db.activities
            .find(query)
            .sort({ created: -1 })
            .limit(limit);

        return activities;
    }

    async getRecommendedGroups(userId) {
        const user = await this.db.users.findById(userId);
        const userInterests = user.interests || [];
        const userSkillLevel = user.skillLevel;

        const groups = await this.db.studyGroups
            .find({
                status: 'active',
                isPrivate: false,
                skillLevel: userSkillLevel,
                topic: { $in: userInterests }
            })
            .limit(5);

        return groups;
    }

    async searchMentors(criteria) {
        const {
            topics,
            availability,
            rating,
            language
        } = criteria;

        const query = {
            isMentor: true,
            status: 'active'
        };

        if (topics) {
            query['mentorProfile.topics'] = { $in: topics };
        }

        if (availability) {
            query['mentorProfile.availability'] = availability;
        }

        if (rating) {
            query['mentorProfile.rating'] = { $gte: rating };
        }

        if (language) {
            query['mentorProfile.languages'] = language;
        }

        const mentors = await this.db.users
            .find(query)
            .select('name email mentorProfile rating')
            .sort({ 'mentorProfile.rating': -1 });

        return mentors;
    }

    async getGroupAnalytics(groupId) {
        const group = await this.db.studyGroups.findById(groupId);
        const activities = await this.db.activities.find({ groupId });

        return {
            totalMembers: group.members.length,
            activeMembers: await this.getActiveMembers(groupId),
            meetingsHeld: activities.filter(a => a.type === 'meeting').length,
            discussionsStarted: activities.filter(a => a.type === 'discussion').length,
            averageAttendance: await this.calculateAverageAttendance(groupId),
            topContributors: await this.getTopContributors(groupId),
            recentActivities: activities.slice(0, 5)
        };
    }

    async getActiveMembers(groupId) {
        const oneMonthAgo = new Date();
        oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);

        const activeMembers = await this.db.activities.distinct('userId', {
            groupId,
            created: { $gte: oneMonthAgo }
        });

        return activeMembers.length;
    }

    async calculateAverageAttendance(groupId) {
        const meetings = await this.db.activities.find({
            groupId,
            type: 'meeting'
        });

        if (!meetings.length) return 0;

        const totalAttendance = meetings.reduce((sum, meeting) => 
            sum + meeting.attendees.length, 0);

        return totalAttendance / meetings.length;
    }

    async getTopContributors(groupId) {
        const contributors = await this.db.activities.aggregate([
            { $match: { groupId } },
            { $group: {
                _id: '$userId',
                contributions: { $sum: 1 }
            }},
            { $sort: { contributions: -1 } },
            { $limit: 5 }
        ]);

        return contributors;
    }
}

module.exports = SocialLearningSystem;
