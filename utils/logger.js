const winston = require('winston');
const config = require('../config/config');

// Define log levels
const levels = {
    error: 0,
    warn: 1,
    info: 2,
    http: 3,
    debug: 4
};

// Define colors for each level
const colors = {
    error: 'red',
    warn: 'yellow',
    info: 'green',
    http: 'magenta',
    debug: 'white'
};

// Tell winston that we want to link the colors
winston.addColors(colors);

// Custom format for AI operations
const aiFormat = winston.format.printf(({ timestamp, level, message, ...metadata }) => {
    let msg = `${timestamp} [${level}] : ${message}`;
    
    if (metadata.userId) {
        msg += ` | User: ${metadata.userId}`;
    }
    
    if (metadata.operation) {
        msg += ` | Operation: ${metadata.operation}`;
    }
    
    if (metadata.duration) {
        msg += ` | Duration: ${metadata.duration}ms`;
    }
    
    if (metadata.error) {
        msg += ` | Error: ${metadata.error.message}`;
        if (metadata.error.stack) {
            msg += `\n${metadata.error.stack}`;
        }
    }

    return msg;
});

// Define the format to be used
const format = winston.format.combine(
    winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    winston.format.colorize({ all: true }),
    winston.format.metadata({ fillExcept: ['message', 'level', 'timestamp'] }),
    aiFormat
);

// Create the logger
const logger = winston.createLogger({
    level: config.nodeEnv === 'production' ? 'info' : 'debug',
    levels,
    format,
    transports: [
        // Write all logs to console
        new winston.transports.Console(),
        
        // Write all logs with level 'error' and below to 'error.log'
        new winston.transports.File({
            filename: 'logs/error.log',
            level: 'error',
            format: winston.format.uncolorize()
        }),
        
        // Write all logs with level 'info' and below to 'combined.log'
        new winston.transports.File({
            filename: 'logs/combined.log',
            format: winston.format.uncolorize()
        }),
        
        // Write AI-specific logs to 'ai.log'
        new winston.transports.File({
            filename: 'logs/ai.log',
            format: winston.format.uncolorize()
        })
    ]
});

// Create a stream object with a 'write' function that will be used by morgan
logger.stream = {
    write: (message) => logger.http(message.trim())
};

// Specialized AI logger functions
logger.aiOperation = (operation, metadata = {}) => {
    logger.info(operation, { operation, ...metadata });
};

logger.aiError = (error, metadata = {}) => {
    logger.error(error.message, { error, ...metadata });
};

logger.aiPerformance = (operation, duration, metadata = {}) => {
    logger.info(`${operation} completed`, { operation, duration, ...metadata });
};

logger.aiWarning = (message, metadata = {}) => {
    logger.warn(message, metadata);
};

logger.aiDebug = (message, metadata = {}) => {
    logger.debug(message, metadata);
};

// Log AI model usage
logger.aiModelUsage = (model, tokens, metadata = {}) => {
    logger.info(`AI model usage: ${model}`, {
        operation: 'model_usage',
        model,
        tokens,
        ...metadata
    });
};

// Log exercise generation
logger.exerciseGeneration = (params, metadata = {}) => {
    logger.info('Exercise generation', {
        operation: 'generate_exercise',
        params,
        ...metadata
    });
};

// Log recommendation generation
logger.recommendationGeneration = (userId, type, metadata = {}) => {
    logger.info('Recommendation generation', {
        operation: 'generate_recommendations',
        userId,
        type,
        ...metadata
    });
};

// Log gamification events
logger.gamificationEvent = (userId, event, points, metadata = {}) => {
    logger.info('Gamification event', {
        operation: 'gamification',
        userId,
        event,
        points,
        ...metadata
    });
};

module.exports = logger;
