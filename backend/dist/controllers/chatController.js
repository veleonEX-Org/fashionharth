import { pool } from "../database/pool.js";
import { logger } from "../utils/logger.js";
export const getConversations = async (req, res) => {
    try {
        const userId = req.user.id;
        const result = await pool.query(`SELECT c.*, 
       (SELECT content FROM messages WHERE conversation_id = c.id ORDER BY created_at DESC LIMIT 1) as last_message,
       (SELECT created_at FROM messages WHERE conversation_id = c.id ORDER BY created_at DESC LIMIT 1) as last_message_at
       FROM conversations c
       JOIN conversation_members cm ON c.id = cm.conversation_id
       WHERE cm.user_id = $1
       ORDER BY updated_at DESC`, [userId]);
        res.json(result.rows);
    }
    catch (error) {
        logger.error("Error fetching conversations:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};
export const getMessages = async (req, res) => {
    try {
        const userId = req.user.id;
        const { conversationId } = req.params;
        // Verify membership
        const membershipCheck = await pool.query("SELECT 1 FROM conversation_members WHERE conversation_id = $1 AND user_id = $2", [conversationId, userId]);
        if (membershipCheck.rowCount === 0) {
            return res.status(403).json({ message: "Access denied" });
        }
        const result = await pool.query("SELECT * FROM messages WHERE conversation_id = $1 ORDER BY created_at ASC", [conversationId]);
        res.json(result.rows);
    }
    catch (error) {
        logger.error("Error fetching messages:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};
import { z } from "zod";
const createConversationSchema = z.object({
    participantIds: z.array(z.number()).min(1),
    name: z.string().optional(),
    isGroup: z.boolean().optional(),
});
export const createConversation = async (req, res) => {
    const validation = createConversationSchema.safeParse(req.body);
    if (!validation.success) {
        return res.status(400).json({ message: "Invalid input", errors: validation.error.errors });
    }
    const client = await pool.connect();
    try {
        const userId = req.user.id;
        const { participantIds, name, isGroup } = validation.data;
        const allParticipants = Array.from(new Set([userId, ...participantIds])).sort((a, b) => a - b);
        await client.query("BEGIN");
        // Race Condition Protection: Use a PG advisory lock based on the participant IDs
        // This prevents two users from creating the same DM at the same time
        if (!isGroup && allParticipants.length === 2) {
            const lockKey = allParticipants.join(""); // Simple string-based lock
            await client.query("SELECT pg_advisory_xact_lock(hashtext($1))", [lockKey]);
            const existing = await client.query(`SELECT conversation_id 
         FROM conversation_members 
         WHERE conversation_id IN (
           SELECT conversation_id FROM conversation_members WHERE user_id = $1
         ) AND user_id = $2
         GROUP BY conversation_id 
         INTERSECT
         SELECT conversation_id 
         FROM conversation_members 
         GROUP BY conversation_id 
         HAVING COUNT(user_id) = 2`, [allParticipants[0], allParticipants[1]]);
            if (existing.rowCount > 0) {
                await client.query("ROLLBACK");
                return res.json({ id: existing.rows[0].conversation_id });
            }
        }
        const convResult = await client.query("INSERT INTO conversations (name, is_group) VALUES ($1, $2) RETURNING id", [name || null, isGroup || false]);
        const conversationId = convResult.rows[0].id;
        for (const pId of allParticipants) {
            await client.query("INSERT INTO conversation_members (conversation_id, user_id) VALUES ($1, $2)", [conversationId, pId]);
        }
        await client.query("COMMIT");
        res.status(201).json({ id: conversationId });
    }
    catch (error) {
        await client.query("ROLLBACK");
        logger.error("Error creating conversation:", error);
        res.status(500).json({ message: "Internal server error" });
    }
    finally {
        client.release();
    }
};
