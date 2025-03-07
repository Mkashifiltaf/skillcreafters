const mongoose = require('mongoose');

const courseSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true,
  },
  slug: {
    type: String,
    required: true,
    unique: true,
  },
  description: {
    type: String,
    required: true,
  },
  instructor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  thumbnail: {
    type: String,
    required: true,
  },
  level: {
    type: String,
    enum: ['beginner', 'intermediate', 'advanced'],
    required: true,
  },
  category: {
    type: String,
    required: true,
  },
  tags: [{
    type: String,
  }],
  prerequisites: [{
    type: String,
  }],
  duration: {
    type: Number, // in minutes
    required: true,
  },
  sections: [{
    title: String,
    description: String,
    order: Number,
    lessons: [{
      title: String,
      description: String,
      videoUrl: String,
      duration: Number,
      order: Number,
      resources: [{
        title: String,
        type: String,
        url: String,
      }],
      quiz: {
        questions: [{
          question: String,
          options: [String],
          correctAnswer: Number,
          explanation: String,
        }],
      },
      assignment: {
        description: String,
        requirements: [String],
        sampleSolution: String,
      },
    }],
  }],
  pricing: {
    isFree: {
      type: Boolean,
      default: true,
    },
    price: {
      type: Number,
      default: 0,
    },
    currency: {
      type: String,
      default: 'USD',
    },
  },
  ratings: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    rating: {
      type: Number,
      min: 1,
      max: 5,
    },
    review: String,
    date: {
      type: Date,
      default: Date.now,
    },
  }],
  averageRating: {
    type: Number,
    default: 0,
  },
  totalStudents: {
    type: Number,
    default: 0,
  },
  certificateTemplate: {
    type: String,
  },
  isPublished: {
    type: Boolean,
    default: false,
  },
  publishedAt: {
    type: Date,
  },
}, {
  timestamps: true,
});

// Calculate average rating before saving
courseSchema.pre('save', function(next) {
  if (this.ratings.length > 0) {
    this.averageRating = this.ratings.reduce((acc, curr) => acc + curr.rating, 0) / this.ratings.length;
  }
  next();
});

const Course = mongoose.model('Course', courseSchema);

module.exports = Course;
