const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

// Generate JWT Token
const generateToken = (userId) => {
    return jwt.sign(
        { user: { id: userId } },
        process.env.JWT_SECRET || 'secret',
        { expiresIn: '24h' }
    );
};

// Hash Password
const hashPassword = async (password) => {
    const salt = await bcrypt.genSalt(10);
    return await bcrypt.hash(password, salt);
};

// Compare Password
const comparePassword = async (password, hashedPassword) => {
    return await bcrypt.compare(password, hashedPassword);
};

// Validate Email
const validateEmail = (email) => {
    const re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return re.test(String(email).toLowerCase());
};

// Format Error Response
const formatError = (error) => {
    return {
        message: error.message || 'Server Error',
        stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    };
};

// Calculate Course Progress
const calculateCourseProgress = (completedLessons, totalLessons) => {
    return (completedLessons / totalLessons) * 100;
};

// Generate Slug
const generateSlug = (title) => {
    return title
        .toLowerCase()
        .replace(/[^\w ]+/g, '')
        .replace(/ +/g, '-');
};

// Format Date
const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
};

module.exports = {
    generateToken,
    hashPassword,
    comparePassword,
    validateEmail,
    formatError,
    calculateCourseProgress,
    generateSlug,
    formatDate
};
