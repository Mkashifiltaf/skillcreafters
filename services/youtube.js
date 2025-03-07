const axios = require('axios');
const config = require('../config/config');

class YouTubeService {
    constructor() {
        this.apiKey = process.env.YOUTUBE_API_KEY;
        this.baseURL = 'https://www.googleapis.com/youtube/v3';
    }

    /**
     * Fetch channel details
     * @param {string} channelId - YouTube channel ID
     */
    async getChannelDetails(channelId) {
        try {
            const response = await axios.get(`${this.baseURL}/channels`, {
                params: {
                    part: 'snippet,statistics',
                    id: channelId,
                    key: this.apiKey
                }
            });
            return response.data.items[0];
        } catch (error) {
            console.error('Error fetching channel details:', error);
            throw error;
        }
    }

    /**
     * Fetch playlist items (course videos)
     * @param {string} playlistId - YouTube playlist ID
     */
    async getPlaylistVideos(playlistId) {
        try {
            const response = await axios.get(`${this.baseURL}/playlistItems`, {
                params: {
                    part: 'snippet,contentDetails',
                    playlistId: playlistId,
                    maxResults: 50,
                    key: this.apiKey
                }
            });
            return response.data.items;
        } catch (error) {
            console.error('Error fetching playlist videos:', error);
            throw error;
        }
    }

    /**
     * Get video statistics
     * @param {string} videoId - YouTube video ID
     */
    async getVideoStats(videoId) {
        try {
            const response = await axios.get(`${this.baseURL}/videos`, {
                params: {
                    part: 'statistics,contentDetails',
                    id: videoId,
                    key: this.apiKey
                }
            });
            return response.data.items[0];
        } catch (error) {
            console.error('Error fetching video stats:', error);
            throw error;
        }
    }

    /**
     * Create course from YouTube playlist
     * @param {string} playlistId - YouTube playlist ID
     * @param {string} instructorId - Instructor ID in our system
     */
    async createCourseFromPlaylist(playlistId, instructorId) {
        try {
            // Fetch playlist details
            const videos = await this.getPlaylistVideos(playlistId);
            
            // Format course structure
            const courseStructure = videos.map(video => ({
                title: video.snippet.title,
                description: video.snippet.description,
                videoId: video.contentDetails.videoId,
                thumbnail: video.snippet.thumbnails.high.url,
                position: video.snippet.position
            }));

            // Return formatted course data
            return {
                title: videos[0].snippet.playlistTitle,
                description: videos[0].snippet.playlistDescription,
                instructorId: instructorId,
                videos: courseStructure,
                totalVideos: videos.length,
                createdAt: new Date()
            };
        } catch (error) {
            console.error('Error creating course from playlist:', error);
            throw error;
        }
    }

    /**
     * Sync video progress
     * @param {string} videoId - YouTube video ID
     * @param {string} userId - User ID in our system
     * @param {number} timestamp - Video timestamp in seconds
     */
    async syncVideoProgress(videoId, userId, timestamp) {
        try {
            // Save progress to our database
            // This is a placeholder - implement actual database operations
            return {
                videoId,
                userId,
                timestamp,
                updatedAt: new Date()
            };
        } catch (error) {
            console.error('Error syncing video progress:', error);
            throw error;
        }
    }

    /**
     * Get video engagement metrics
     * @param {string} videoId - YouTube video ID
     */
    async getVideoEngagement(videoId) {
        try {
            const stats = await this.getVideoStats(videoId);
            return {
                views: stats.statistics.viewCount,
                likes: stats.statistics.likeCount,
                comments: stats.statistics.commentCount,
                duration: stats.contentDetails.duration
            };
        } catch (error) {
            console.error('Error getting video engagement:', error);
            throw error;
        }
    }

    /**
     * Generate video embed URL
     * @param {string} videoId - YouTube video ID
     * @param {Object} options - Embed options
     */
    generateEmbedUrl(videoId, options = {}) {
        const baseUrl = 'https://www.youtube.com/embed/';
        const params = new URLSearchParams({
            rel: 0, // Don't show related videos
            modestbranding: 1, // Minimal YouTube branding
            ...options
        });
        return `${baseUrl}${videoId}?${params.toString()}`;
    }
}

module.exports = new YouTubeService();
