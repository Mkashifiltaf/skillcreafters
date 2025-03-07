const mongoose = require('mongoose');

const CourseSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    instructor: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    price: {
        type: Number,
        required: true
    },
    level: {
        type: String,
        enum: ['beginner', 'intermediate', 'advanced'],
        required: true
    },
    topics: [{
        type: String
    }],
    duration: {
        type: String,
        required: true
    },
    lessons: [{
        title: String,
        content: String,
        videoUrl: String,
        duration: String,
        order: Number
    }],
    enrolledStudents: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }],
    ratings: [{
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        },
        rating: Number,
        review: String,
        date: {
            type: Date,
            default: Date.now
        }
    }],
    averageRating: {
        type: Number,
        default: 0
    },
    thumbnail: {
        type: String,
        default: 'default-course-thumbnail.jpg'
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: Date.now
    }
});

// Update average rating when a new rating is added
CourseSchema.methods.updateAverageRating = function() {
    const ratings = this.ratings.map(r => r.rating);
    this.averageRating = ratings.reduce((a, b) => a + b, 0) / ratings.length;
    return this.save();
};

module.exports = mongoose.model('Course', CourseSchema);
