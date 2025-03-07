const mongoose = require('mongoose');

const userProfileSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, required: true, unique: true },
    learningStyle: { type: String, enum: ['visual', 'auditory', 'reading', 'kinesthetic'], required: true },
    currentSkillLevel: { type: String, enum: ['beginner', 'intermediate', 'advanced'], required: true },
    goals: [{ type: String }],
    interests: [{ type: String }],
    previousCourses: [{ type: String }],
    completedExercises: [{ type: String }],
    performance: { type: Object, default: {} },
    preferredLanguages: [{ type: String }]
}, { timestamps: true });

const UserProfile = mongoose.model('UserProfile', userProfileSchema);

module.exports = UserProfile;
