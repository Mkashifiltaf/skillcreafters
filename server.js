const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');

const config = require('./config/config');
const { logger, stream } = require('./utils/logger');

// Load environment variables
dotenv.config();

const app = express();

// Security middleware
app.use(helmet());
app.use(rateLimit(config.rateLimit));

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('public'));
app.use(morgan('combined', { stream }));

// Connect to MongoDB
mongoose.connect(config.mongodb.uri, config.mongodb.options)
    .then(() => {
        logger.info('Connected to MongoDB');
    })
    .catch(err => {
        logger.error('Error connecting to MongoDB:', err);
        process.exit(1);
    });

// Import routes
const authRoutes = require('./routes/auth');
const courseRoutes = require('./routes/courses');
const userRoutes = require('./routes/users');
const aiRoutes = require('./routes/ai');

// Use routes
app.use('/api/auth', authRoutes);
app.use('/api/courses', courseRoutes);
app.use('/api/users', userRoutes);
app.use('/api/ai', aiRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
    logger.error(err.stack);
    res.status(500).send('Something broke!');
});

// Serve static files in production
if (config.nodeEnv === 'production') {
    app.use(express.static('client/build'));
    app.get('*', (req, res) => {
        res.sendFile(path.resolve(__dirname, 'client', 'build', 'index.html'));
    });
}

const PORT = config.port;
app.listen(PORT, () => {
    logger.info(`Server running on port ${PORT} in ${config.nodeEnv} mode`);
});
