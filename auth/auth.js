const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const config = require('../config/config');

class AuthService {
    // User Registration
    static async register(userData) {
        try {
            const { email, password, name, role = 'student' } = userData;

            // Check if user exists
            const existingUser = await User.findOne({ email });
            if (existingUser) {
                throw new Error('User already exists');
            }

            // Hash password
            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash(password, salt);

            // Create user
            const user = new User({
                email,
                password: hashedPassword,
                name,
                role,
                profile: {
                    name,
                    bio: '',
                    avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}`,
                    socialLinks: {},
                    preferences: {
                        emailNotifications: true,
                        theme: 'dark',
                        language: 'en'
                    }
                }
            });

            await user.save();

            // Generate tokens
            const { accessToken, refreshToken } = await this.generateTokens(user);

            return {
                user: this.sanitizeUser(user),
                accessToken,
                refreshToken
            };
        } catch (error) {
            throw error;
        }
    }

    // User Login
    static async login(email, password) {
        try {
            // Find user
            const user = await User.findOne({ email });
            if (!user) {
                throw new Error('Invalid credentials');
            }

            // Verify password
            const isMatch = await bcrypt.compare(password, user.password);
            if (!isMatch) {
                throw new Error('Invalid credentials');
            }

            // Generate tokens
            const { accessToken, refreshToken } = await this.generateTokens(user);

            // Update last login
            user.lastLogin = new Date();
            await user.save();

            return {
                user: this.sanitizeUser(user),
                accessToken,
                refreshToken
            };
        } catch (error) {
            throw error;
        }
    }

    // OAuth Login/Register
    static async oauthLogin(profile, provider) {
        try {
            let user = await User.findOne({ [`oauth.${provider}.id`]: profile.id });

            if (!user) {
                // Create new user
                user = new User({
                    email: profile.email,
                    name: profile.name,
                    role: 'student',
                    oauth: {
                        [provider]: {
                            id: profile.id,
                            accessToken: profile.accessToken
                        }
                    },
                    profile: {
                        name: profile.name,
                        bio: '',
                        avatar: profile.photo || `https://ui-avatars.com/api/?name=${encodeURIComponent(profile.name)}`,
                        socialLinks: {},
                        preferences: {
                            emailNotifications: true,
                            theme: 'dark',
                            language: 'en'
                        }
                    }
                });

                await user.save();
            }

            // Generate tokens
            const { accessToken, refreshToken } = await this.generateTokens(user);

            return {
                user: this.sanitizeUser(user),
                accessToken,
                refreshToken
            };
        } catch (error) {
            throw error;
        }
    }

    // Token Generation
    static async generateTokens(user) {
        const accessToken = jwt.sign(
            { userId: user._id, role: user.role },
            config.jwt.accessSecret,
            { expiresIn: '15m' }
        );

        const refreshToken = jwt.sign(
            { userId: user._id },
            config.jwt.refreshSecret,
            { expiresIn: '7d' }
        );

        // Save refresh token
        user.refreshTokens = user.refreshTokens || [];
        user.refreshTokens.push(refreshToken);
        if (user.refreshTokens.length > 5) {
            user.refreshTokens.shift();
        }
        await user.save();

        return { accessToken, refreshToken };
    }

    // Token Refresh
    static async refreshToken(token) {
        try {
            const decoded = jwt.verify(token, config.jwt.refreshSecret);
            const user = await User.findById(decoded.userId);

            if (!user || !user.refreshTokens.includes(token)) {
                throw new Error('Invalid refresh token');
            }

            // Generate new tokens
            const { accessToken, refreshToken: newRefreshToken } = await this.generateTokens(user);

            // Remove old refresh token
            user.refreshTokens = user.refreshTokens.filter(t => t !== token);
            await user.save();

            return {
                accessToken,
                refreshToken: newRefreshToken
            };
        } catch (error) {
            throw error;
        }
    }

    // Password Reset
    static async requestPasswordReset(email) {
        try {
            const user = await User.findOne({ email });
            if (!user) {
                throw new Error('User not found');
            }

            const resetToken = jwt.sign(
                { userId: user._id },
                config.jwt.resetSecret,
                { expiresIn: '1h' }
            );

            user.resetToken = resetToken;
            user.resetTokenExpiry = Date.now() + 3600000; // 1 hour
            await user.save();

            // TODO: Send reset email
            return resetToken;
        } catch (error) {
            throw error;
        }
    }

    // Reset Password
    static async resetPassword(token, newPassword) {
        try {
            const decoded = jwt.verify(token, config.jwt.resetSecret);
            const user = await User.findOne({
                _id: decoded.userId,
                resetToken: token,
                resetTokenExpiry: { $gt: Date.now() }
            });

            if (!user) {
                throw new Error('Invalid or expired reset token');
            }

            // Hash new password
            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash(newPassword, salt);

            // Update password and clear reset token
            user.password = hashedPassword;
            user.resetToken = undefined;
            user.resetTokenExpiry = undefined;
            await user.save();

            return true;
        } catch (error) {
            throw error;
        }
    }

    // User Sanitization
    static sanitizeUser(user) {
        const sanitized = user.toObject();
        delete sanitized.password;
        delete sanitized.refreshTokens;
        delete sanitized.resetToken;
        delete sanitized.resetTokenExpiry;
        return sanitized;
    }

    // Middleware for route protection
    static authMiddleware(roles = []) {
        return async (req, res, next) => {
            try {
                const token = req.headers.authorization?.split(' ')[1];
                if (!token) {
                    throw new Error('No token provided');
                }

                const decoded = jwt.verify(token, config.jwt.accessSecret);
                const user = await User.findById(decoded.userId);

                if (!user) {
                    throw new Error('User not found');
                }

                if (roles.length && !roles.includes(user.role)) {
                    throw new Error('Unauthorized');
                }

                req.user = this.sanitizeUser(user);
                next();
            } catch (error) {
                res.status(401).json({ error: error.message });
            }
        };
    }
}

module.exports = AuthService;
