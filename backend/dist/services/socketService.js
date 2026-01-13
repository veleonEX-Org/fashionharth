import { Server } from "socket.io";
import { verifyAccessToken } from "../utils/jwt.js";
import { logger } from "../utils/logger.js";
import { pool } from "../database/pool.js";
export class SocketService {
    constructor() {
        this.io = null;
        this.userSockets = new Map(); // userId -> socketIds
    }
    static getInstance() {
        if (!SocketService.instance) {
            SocketService.instance = new SocketService();
        }
        return SocketService.instance;
    }
    initialize(httpServer, allowedOrigin) {
        this.io = new Server(httpServer, {
            cors: {
                origin: allowedOrigin,
                credentials: true,
            },
        });
        this.io.use(async (socket, next) => {
            try {
                const token = socket.handshake.auth.token || socket.handshake.headers.authorization?.split(" ")[1];
                if (!token) {
                    return next(new Error("Authentication error: No token provided"));
                }
                const payload = verifyAccessToken(token);
                if (payload.type !== "access") {
                    return next(new Error("Authentication error: Invalid token type"));
                }
                socket.data.user = { id: payload.sub, role: payload.role };
                next();
            }
            catch (error) {
                next(new Error("Authentication error: Invalid token"));
            }
        });
        this.io.on("connection", (socket) => {
            const userId = socket.data.user.id;
            logger.info(`User ${userId} connected with socket ${socket.id}`);
            // Track user sockets
            const existingSockets = this.userSockets.get(userId) || [];
            this.userSockets.set(userId, [...existingSockets, socket.id]);
            socket.on("join_conversation", async (conversationId) => {
                try {
                    // Security: Verify user is a member before allowing them to join the room
                    const membershipCheck = await pool.query("SELECT 1 FROM conversation_members WHERE conversation_id = $1 AND user_id = $2", [conversationId, userId]);
                    if (membershipCheck.rowCount === 0) {
                        socket.emit("error", { message: "Unauthorized: You are not a member of this conversation" });
                        return;
                    }
                    socket.join(`conversation_${conversationId}`);
                    logger.info(`Socket ${socket.id} joined conversation_${conversationId}`);
                }
                catch (error) {
                    logger.error("Error joining conversation:", error);
                }
            });
            socket.on("leave_conversation", (conversationId) => {
                socket.leave(`conversation_${conversationId}`);
                logger.info(`Socket ${socket.id} left conversation_${conversationId}`);
            });
            socket.on("send_message", async (data) => {
                try {
                    const { conversationId, content } = data;
                    // 0. Input Validation (System Design: Prevent DoS & Bloat)
                    if (!content || content.trim().length === 0)
                        return;
                    if (content.length > 5000) {
                        socket.emit("error", { message: "Message too long (max 5000 chars)" });
                        return;
                    }
                    // 1. Verify membership (System Design: Security first)
                    const membershipCheck = await pool.query("SELECT 1 FROM conversation_members WHERE conversation_id = $1 AND user_id = $2", [conversationId, userId]);
                    if (membershipCheck.rowCount === 0) {
                        socket.emit("error", { message: "You are not a member of this conversation" });
                        return;
                    }
                    // 2. Save to DB
                    const result = await pool.query("INSERT INTO messages (conversation_id, sender_id, content) VALUES ($1, $2, $3) RETURNING *", [conversationId, userId, content]);
                    const newMessage = result.rows[0];
                    // 3. Broadcast to all members of the conversation
                    this.io?.to(`conversation_${conversationId}`).emit("new_message", newMessage);
                    // Update conversation timestamp (Trigger handles this in SQL, but good to know)
                }
                catch (error) {
                    logger.error("Error handling send_message:", error);
                    socket.emit("error", { message: "Internal server error" });
                }
            });
            socket.on("disconnect", () => {
                logger.info(`Socket ${socket.id} disconnected`);
                const userSocks = this.userSockets.get(userId) || [];
                this.userSockets.set(userId, userSocks.filter(id => id !== socket.id));
                if (this.userSockets.get(userId)?.length === 0) {
                    this.userSockets.delete(userId);
                }
            });
        });
    }
    emitToUser(userId, event, data) {
        const socketIds = this.userSockets.get(userId);
        if (socketIds) {
            socketIds.forEach(id => this.io?.to(id).emit(event, data));
        }
    }
    emitToConversation(conversationId, event, data) {
        this.io?.to(`conversation_${conversationId}`).emit(event, data);
    }
}
