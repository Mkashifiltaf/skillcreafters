const mongoose = require('mongoose');

const progressSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    courseId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Course',
        required: true
    },
    videoProgress: [{
        videoId: String,
        watchedSeconds: Number,
        totalSeconds: Number,
        completed: Boolean,
        lastWatched: Date,
        notes: String,
        bookmarks: [{
            timestamp: Number,
            note: String,
            createdAt: Date
        }]
    }],
    exerciseProgress: [{
        exerciseId: String,
        completed: Boolean,
        score: Number,
        attempts: Number,
        lastAttempt: Date,
        timeSpent: Number,
        codeSubmissions: [{
            code: String,
            language: String,
            status: String,
            timestamp: Date
        }]
    }],
    quizProgress: [{
        quizId: String,
        score: Number,
        totalQuestions: Number,
        completed: Boolean,
        attempts: Number,
        lastAttempt: Date
    }],
    certificates: [{
        type: String,
        earnedAt: Date,
        url: String
    }],
    overallProgress: {
        percentageCompleted: {
            type: Number,
            default: 0
        },
        timeSpent: {
            type: Number,
            default: 0
        },
        lastAccessed: Date,
        streakDays: {
            type: Number,
            default: 0
        },
        lastStreakUpdate: Date
    },
    achievements: [{
        type: String,
        earnedAt: Date,
        description: String
    }],
    skillLevels: {
        type: Map,
        of: {
            level: Number,
            progress: Number,
            updatedAt: Date
        }
    }
}, {
    timestamps: true
});

// Indexes for faster queries
progressSchema.index({ userId: 1, courseId: 1 });
progressSchema.index({ 'overallProgress.percentageCompleted': 1 });
progressSchema.index({ 'overallProgress.streakDays': 1 });

// Methods

// Update video progress
progressSchema.methods.updateVideoProgress = async function(videoId, watchedSeconds, totalSeconds) {
    const videoProgress = this.videoProgress.find(vp => vp.videoId === videoId);
    if (videoProgress) {
        videoProgress.watchedSeconds = watchedSeconds;
        videoProgress.totalSeconds = totalSeconds;
        videoProgress.completed = watchedSeconds >= totalSeconds * 0.9; // 90% watched is considered complete
        videoProgress.lastWatched = new Date();
    } else {
        this.videoProgress.push({
            videoId,
            watchedSeconds,
            totalSeconds,
            completed: watchedSeconds >= totalSeconds * 0.9,
            lastWatched: new Date()
        });
    }
    await this.updateOverallProgress();
    return this.save();
};

// Update exercise progress
progressSchema.methods.updateExerciseProgress = async function(exerciseId, submission) {
    const exercise = this.exerciseProgress.find(ep => ep.exerciseId === exerciseId);
    if (exercise) {
        exercise.attempts += 1;
        exercise.lastAttempt = new Date();
        exercise.codeSubmissions.push(submission);
        if (submission.status === 'passed') {
            exercise.completed = true;
            exercise.score = 100;
        }
    } else {
        this.exerciseProgress.push({
            exerciseId,
            completed: submission.status === 'passed',
            score: submission.status === 'passed' ? 100 : 0,
            attempts: 1,
            lastAttempt: new Date(),
            codeSubmissions: [submission]
        });
    }
    await this.updateOverallProgress();
    return this.save();
};

// Update streak
progressSchema.methods.updateStreak = async function() {
    const now = new Date();
    const lastUpdate = this.overallProgress.lastStreakUpdate;
    
    if (!lastUpdate) {
        this.overallProgress.streakDays = 1;
    } else {
        const daysSinceLastUpdate = Math.floor((now - lastUpdate) / (1000 * 60 * 60 * 24));
        if (daysSinceLastUpdate === 1) {
            this.overallProgress.streakDays += 1;
        } else if (daysSinceLastUpdate > 1) {
            this.overallProgress.streakDays = 1;
        }
    }
    
    this.overallProgress.lastStreakUpdate = now;
    return this.save();
};

// Update overall progress
progressSchema.methods.updateOverallProgress = async function() {
    const totalItems = this.videoProgress.length + this.exerciseProgress.length + this.quizProgress.length;
    const completedItems = 
        this.videoProgress.filter(v => v.completed).length +
        this.exerciseProgress.filter(e => e.completed).length +
        this.quizProgress.filter(q => q.completed).length;
    
    this.overallProgress.percentageCompleted = (completedItems / totalItems) * 100;
    this.overallProgress.lastAccessed = new Date();
    
    // Update achievements based on progress
    if (this.overallProgress.percentageCompleted >= 100) {
        this.achievements.push({
            type: 'COURSE_COMPLETED',
            earnedAt: new Date(),
            description: 'Completed the entire course!'
        });
    } else if (this.overallProgress.percentageCompleted >= 50 && 
               !this.achievements.find(a => a.type === 'HALFWAY_MILESTONE')) {
        this.achievements.push({
            type: 'HALFWAY_MILESTONE',
            earnedAt: new Date(),
            description: 'Completed 50% of the course!'
        });
    }
    
    return this.save();
};

const Progress = mongoose.model('Progress', progressSchema);

module.exports = Progress;
