const WebSocket = require('ws');
const logger = require('../utils/logger');

class RealTimeCollaboration {
    constructor(server) {
        this.wss = new WebSocket.Server({ server });
        this.rooms = new Map();
        this.setupWebSocket();
    }

    setupWebSocket() {
        this.wss.on('connection', (ws, req) => {
            ws.isAlive = true;

            ws.on('pong', () => {
                ws.isAlive = true;
            });

            ws.on('message', async (data) => {
                try {
                    const message = JSON.parse(data);
                    await this.handleMessage(ws, message);
                } catch (err) {
                    logger.error('Error handling message', { error: err });
                    ws.send(JSON.stringify({
                        type: 'error',
                        error: 'Invalid message format'
                    }));
                }
            });

            ws.on('close', () => {
                this.handleDisconnect(ws);
            });
        });

        // Heartbeat to keep connections alive
        setInterval(() => {
            this.wss.clients.forEach((ws) => {
                if (!ws.isAlive) {
                    return ws.terminate();
                }
                ws.isAlive = false;
                ws.ping();
            });
        }, 30000);
    }

    async handleMessage(ws, message) {
        switch (message.type) {
            case 'join_room':
                await this.handleJoinRoom(ws, message);
                break;
            case 'leave_room':
                await this.handleLeaveRoom(ws, message);
                break;
            case 'code_change':
                await this.handleCodeChange(ws, message);
                break;
            case 'cursor_move':
                await this.handleCursorMove(ws, message);
                break;
            case 'chat_message':
                await this.handleChatMessage(ws, message);
                break;
            case 'start_voice':
                await this.handleVoiceStart(ws, message);
                break;
            case 'voice_data':
                await this.handleVoiceData(ws, message);
                break;
            case 'request_help':
                await this.handleHelpRequest(ws, message);
                break;
            case 'provide_help':
                await this.handleHelpProvide(ws, message);
                break;
            default:
                ws.send(JSON.stringify({
                    type: 'error',
                    error: 'Unknown message type'
                }));
        }
    }

    async handleJoinRoom(ws, message) {
        const { roomId, userId, username } = message;
        
        if (!this.rooms.has(roomId)) {
            this.rooms.set(roomId, new Set());
        }

        const room = this.rooms.get(roomId);
        room.add(ws);

        ws.roomId = roomId;
        ws.userId = userId;
        ws.username = username;

        // Send current room state to new user
        const roomState = await this.getRoomState(roomId);
        ws.send(JSON.stringify({
            type: 'room_state',
            state: roomState
        }));

        // Notify others in room
        this.broadcastToRoom(roomId, {
            type: 'user_joined',
            userId,
            username
        }, ws);

        logger.info('User joined room', {
            operation: 'join_room',
            roomId,
            userId,
            username
        });
    }

    async handleLeaveRoom(ws, message) {
        const { roomId } = message;
        const room = this.rooms.get(roomId);
        
        if (room) {
            room.delete(ws);
            if (room.size === 0) {
                this.rooms.delete(roomId);
            }
        }

        this.broadcastToRoom(roomId, {
            type: 'user_left',
            userId: ws.userId,
            username: ws.username
        });

        logger.info('User left room', {
            operation: 'leave_room',
            roomId,
            userId: ws.userId
        });
    }

    async handleCodeChange(ws, message) {
        const { roomId, changes, version } = message;

        // Apply operational transformation if needed
        const transformedChanges = await this.transformChanges(changes, version);

        this.broadcastToRoom(roomId, {
            type: 'code_update',
            changes: transformedChanges,
            userId: ws.userId,
            version: version + 1
        }, ws);

        logger.info('Code changed', {
            operation: 'code_change',
            roomId,
            userId: ws.userId,
            version
        });
    }

    async handleCursorMove(ws, message) {
        const { roomId, position } = message;

        this.broadcastToRoom(roomId, {
            type: 'cursor_update',
            userId: ws.userId,
            username: ws.username,
            position
        }, ws);
    }

    async handleChatMessage(ws, message) {
        const { roomId, content } = message;

        this.broadcastToRoom(roomId, {
            type: 'chat_message',
            userId: ws.userId,
            username: ws.username,
            content,
            timestamp: new Date().toISOString()
        });

        logger.info('Chat message sent', {
            operation: 'chat_message',
            roomId,
            userId: ws.userId
        });
    }

    async handleVoiceStart(ws, message) {
        const { roomId } = message;

        this.broadcastToRoom(roomId, {
            type: 'voice_started',
            userId: ws.userId,
            username: ws.username
        }, ws);

        logger.info('Voice chat started', {
            operation: 'voice_start',
            roomId,
            userId: ws.userId
        });
    }

    async handleVoiceData(ws, message) {
        const { roomId, data } = message;

        this.broadcastToRoom(roomId, {
            type: 'voice_data',
            userId: ws.userId,
            data
        }, ws);
    }

    async handleHelpRequest(ws, message) {
        const { roomId, problem, code } = message;

        this.broadcastToRoom(roomId, {
            type: 'help_requested',
            userId: ws.userId,
            username: ws.username,
            problem,
            code,
            timestamp: new Date().toISOString()
        });

        logger.info('Help requested', {
            operation: 'help_request',
            roomId,
            userId: ws.userId
        });
    }

    async handleHelpProvide(ws, message) {
        const { roomId, targetUserId, solution, explanation } = message;

        // Send to specific user
        this.sendToUser(roomId, targetUserId, {
            type: 'help_provided',
            userId: ws.userId,
            username: ws.username,
            solution,
            explanation,
            timestamp: new Date().toISOString()
        });

        logger.info('Help provided', {
            operation: 'help_provide',
            roomId,
            userId: ws.userId,
            targetUserId
        });
    }

    handleDisconnect(ws) {
        if (ws.roomId) {
            this.handleLeaveRoom(ws, { roomId: ws.roomId });
        }
    }

    async getRoomState(roomId) {
        const room = this.rooms.get(roomId);
        if (!room) return null;

        const users = Array.from(room).map(client => ({
            userId: client.userId,
            username: client.username
        }));

        return {
            users,
            // Add other room state as needed
        };
    }

    async transformChanges(changes, version) {
        // Implement operational transformation logic here
        return changes;
    }

    broadcastToRoom(roomId, message, exclude = null) {
        const room = this.rooms.get(roomId);
        if (!room) return;

        room.forEach(client => {
            if (client !== exclude && client.readyState === WebSocket.OPEN) {
                client.send(JSON.stringify(message));
            }
        });
    }

    sendToUser(roomId, targetUserId, message) {
        const room = this.rooms.get(roomId);
        if (!room) return;

        room.forEach(client => {
            if (client.userId === targetUserId && client.readyState === WebSocket.OPEN) {
                client.send(JSON.stringify(message));
            }
        });
    }
}

module.exports = RealTimeCollaboration;
