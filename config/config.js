module.exports = {
    // Server Configuration
    port: process.env.PORT || 5000,
    nodeEnv: process.env.NODE_ENV || 'development',
    
    // MongoDB Configuration
    mongodb: {
        uri: process.env.MONGODB_URI || 'mongodb://localhost:27017/skillcrafters',
        options: {
            useNewUrlParser: true,
            useUnifiedTopology: true
        }
    },

    // JWT Configuration
    jwt: {
        secret: process.env.JWT_SECRET || 'secret',
        expiresIn: '24h'
    },

    // OpenAI Configuration
    openai: {
        apiKey: process.env.OPENAI_API_KEY,
        models: {
            default: 'gpt-4',
            code: 'gpt-4',
            embedding: 'text-embedding-ada-002'
        },
        maxTokens: 2000,
        temperature: 0.7
    },

    // Exercise Generation Configuration
    exerciseGen: {
        difficultyLevels: ['beginner', 'intermediate', 'advanced'],
        exerciseTypes: ['practice', 'project', 'challenge'],
        supportedLanguages: ['python', 'javascript', 'java', 'cpp', 'ruby'],
        timeoutLimits: {
            python: 5000,
            javascript: 5000,
            java: 10000,
            cpp: 3000,
            ruby: 5000
        },
        memoryLimits: {
            python: 512,
            javascript: 512,
            java: 1024,
            cpp: 256,
            ruby: 512
        }
    },

    // Recommendation System Configuration
    recommendations: {
        updateFrequency: 24 * 60 * 60 * 1000, // 24 hours
        maxRecommendations: 10,
        minConfidenceScore: 0.7,
        weights: {
            skillLevel: 0.3,
            learningStyle: 0.2,
            goals: 0.2,
            performance: 0.15,
            interests: 0.15
        }
    },

  // Gamification Configuration
    gamification: {
        points: {
            exercise_completion: 10,
            course_completion: 100,
            streak_continuation: 20,
            helping_others: 30,
            bug_fixing: 15,
            code_review: 25,
            documentation: 20,
            quiz_completion: 15
        },  
        streakMultiplier: {
            max: 1.5,
            increment: 0.05
        },
        levels: [
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
        ],
        leaderboardTypes: ['global', 'friends', 'local'],
        timeframes: ['daily', 'weekly', 'monthly', 'allTime']
    },

    // Course Configuration
    courses: {
        defaultPageSize: 10,
        maxPageSize: 50,
        supportedLevels: ['beginner', 'intermediate', 'advanced'],
        supportedCategories: ['AI', 'Machine Learning', 'Deep Learning', 'Computer Vision', 'NLP']
    },

    // Upload Configuration
    upload: {
        maxFileSize: 5 * 1024 * 1024, // 5MB
        allowedFileTypes: ['.jpg', '.jpeg', '.png', '.pdf'],
        storageProvider: 'local' // or 's3' for production
    },

    // Email Configuration
    email: {
        from: 'noreply@skillcrafters.com',
        smtp: {
            host: process.env.SMTP_HOST,
            port: process.env.SMTP_PORT,
            secure: true,
            auth: {
                user: process.env.SMTP_USER,
                pass: process.env.SMTP_PASS
            }
        }
    },

    // Rate Limiting
    rateLimit: {
        windowMs: 15 * 60 * 1000, // 15 minutes
        max: 100 // limit each IP to 100 requests per windowMs
    },

    // Cache Configuration
    cache: {
        ttl: 60 * 60 * 1000, // 1 hour
        checkPeriod: 120 * 60 * 1000 // 2 hours
    }
};
