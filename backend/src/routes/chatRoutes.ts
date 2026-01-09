import { Router } from "express";
import { authenticate } from "../middleware/authMiddleware.js";
import { 
  getConversations, 
  getMessages, 
  createConversation 
} from "../controllers/chatController.js";

const chatRouter = Router();

chatRouter.use(authenticate);

chatRouter.get("/conversations", getConversations);
chatRouter.post("/conversations", createConversation);
chatRouter.get("/conversations/:conversationId/messages", getMessages);

export { chatRouter };
