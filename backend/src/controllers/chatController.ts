import { Request, Response } from "express";
import { pool } from "../database/pool.js";
import { logger } from "../utils/logger.js";
import { SocketService } from "../services/socketService.js";

export const getConversations = async (req: Request, res: Response) => {
  try {
    const userId = req.user!.id;
    
    const result = await pool.query(
      `SELECT c.*, 
       (SELECT content FROM messages WHERE conversation_id = c.id ORDER BY created_at DESC LIMIT 1) as last_message,
       (SELECT created_at FROM messages WHERE conversation_id = c.id ORDER BY created_at DESC LIMIT 1) as last_message_at
       FROM conversations c
       JOIN conversation_members cm ON c.id = cm.conversation_id
       WHERE cm.user_id = $1
       ORDER BY updated_at DESC`,
      [userId]
    );

    res.json(result.rows);
  } catch (error) {
    logger.error("Error fetching conversations:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const getMessages = async (req: Request, res: Response) => {
  try {
    const userId = req.user!.id;
    const { conversationId } = req.params;

    // Verify membership
    const membershipCheck = await pool.query(
      "SELECT 1 FROM conversation_members WHERE conversation_id = $1 AND user_id = $2",
      [conversationId, userId]
    );

    if (membershipCheck.rowCount === 0) {
      return res.status(403).json({ message: "Access denied" });
    }

    const result = await pool.query(
      "SELECT * FROM messages WHERE conversation_id = $1 ORDER BY created_at ASC",
      [conversationId]
    );

    res.json(result.rows);
  } catch (error) {
    logger.error("Error fetching messages:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

import { z } from "zod";

const createConversationSchema = z.object({
  participantIds: z.array(z.number()).min(1).optional(),
  name: z.string().optional(),
  isGroup: z.boolean().optional(),
  isSupport: z.boolean().optional(),
  message: z.string().optional(),
});

export const createConversation = async (req: Request, res: Response) => {
  const validation = createConversationSchema.safeParse(req.body);
  if (!validation.success) {
    return res.status(400).json({ message: "Invalid input", errors: validation.error.errors });
  }

  const client = await pool.connect();
  try {
    const userId = req.user!.id;
    let { participantIds, name, isGroup, isSupport, message } = validation.data;
    
    // Initializing participantIds if undefined
    if (!participantIds) participantIds = [];

    if (isSupport) {
      const adminResult = await client.query(
        "SELECT id FROM users WHERE role IN ('admin', 'staff') AND status = 'active'"
      );
      const adminIds = adminResult.rows.map((r: any) => r.id);
      participantIds.push(...adminIds);
      
      // Ensure it's a group chat effectively since multiple admins might be there
      // But acts as a direct support line
      isGroup = true; 
      if (!name) name = "Support Enquiry";
    }

    if (participantIds.length === 0) {
       return res.status(400).json({ message: "At least one participant is required" });
    }

    const allParticipants = Array.from(new Set([userId, ...participantIds])).sort((a, b) => a - b);

    await client.query("BEGIN");

    // Race Condition Protection: Use a PG advisory lock based on the participant IDs
    // This prevents two users from creating the same DM at the same time
    if (!isGroup && allParticipants.length === 2) {
      const lockKey = allParticipants.join(""); // Simple string-based lock
      await client.query("SELECT pg_advisory_xact_lock(hashtext($1))", [lockKey]);

      const existing = await client.query(
        `SELECT conversation_id 
         FROM conversation_members 
         WHERE conversation_id IN (
           SELECT conversation_id FROM conversation_members WHERE user_id = $1
         ) AND user_id = $2
         GROUP BY conversation_id 
         INTERSECT
         SELECT conversation_id 
         FROM conversation_members 
         GROUP BY conversation_id 
         HAVING COUNT(user_id) = 2`,
        [allParticipants[0], allParticipants[1]]
      );
      
      if (existing.rowCount! > 0) {
        await client.query("ROLLBACK");
        return res.json({ id: existing.rows[0].conversation_id });
      }
    }

    const convResult = await client.query(
      "INSERT INTO conversations (name, is_group) VALUES ($1, $2) RETURNING id",
      [name || null, isGroup || false]
    );
    const conversationId = convResult.rows[0].id;

    for (const pId of allParticipants) {
      await client.query(
        "INSERT INTO conversation_members (conversation_id, user_id) VALUES ($1, $2)",
        [conversationId, pId]
      );
    }

    if (message) {
      await client.query(
        "INSERT INTO messages (conversation_id, sender_id, content) VALUES ($1, $2, $3)",
        [conversationId, userId, message]
      );
      // We should potentially update the SocketService here to notify, but 
      // the client will likely poll or the socket event will handle subsequent messages.
      // Ideally, we import SocketService and emit the new message event.
      // But for now, let's keep it simple.
    }

    await client.query("COMMIT");
    await client.query("COMMIT");

    // Socket Notification Logic
    const socketService = SocketService.getInstance();
    
    // Fetch the new conversation details to send to clients
    // We need the same structure as getConversations
    const newConvResult = await pool.query(
      `SELECT c.*, 
       m.content as last_message,
       m.created_at as last_message_at
       FROM conversations c
       LEFT JOIN messages m ON m.conversation_id = c.id AND m.id = (
         SELECT id FROM messages WHERE conversation_id = c.id ORDER BY created_at DESC LIMIT 1
       )
       WHERE c.id = $1`,
      [conversationId]
    );

    const newConversation = newConvResult.rows[0];

    // Notify all participants
    for (const pId of allParticipants) {
       socketService.emitToUser(pId, "new_conversation", newConversation);
    }
    
    // If there was an initial message, we might want to emit that too, 
    // although new_conversation carries the last_message. 
    // But for consistency with open chats:
    if (message) {
      const msgResult = await pool.query(
         "SELECT * FROM messages WHERE conversation_id = $1 ORDER BY created_at DESC LIMIT 1",
         [conversationId]
      );
      if (msgResult.rows[0]) {
        socketService.emitToConversation(conversationId, "new_message", msgResult.rows[0]);
      }
    }

    res.status(201).json({ id: conversationId });
  } catch (error) {
    await client.query("ROLLBACK");
    logger.error("Error creating conversation:", error);
    res.status(500).json({ message: "Internal server error" });
  } finally {
    client.release();
  }
};
