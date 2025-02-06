import express from 'express';
import authMiddleware from '../middlewares/authMiddleware.js';
import db from '../db.json' with { type: 'json' };
import { wrtieFile } from '../utils/file.js';

const chatRouter = express.Router();

chatRouter.get("/messages/:userId/:contactId", (req, res) => {
    const { userId, contactId } = req.params;
    const db = JSON.parse(fs.readFileSync(dbPath, "utf8"));
  
    const conversation = db.messages.filter(
      (msg) =>
        (msg.senderId == userId && msg.receiverId == contactId) ||
        (msg.senderId == contactId && msg.receiverId == userId)
    );
  
    res.json(conversation);
  });

chatRouter.post('/send', authMiddleware, (req, res) => {
    const { receiverId, message } = req.body;
    const senderId = req.user.id;

    if (!db.messages) {
        db.messages = [];
    }

    const newMessage = {
        id: db.messages.length + 1,
        senderId,
        receiverId,
        message,
        timestamp: new Date().toISOString(),
    };

    db.messages.push(newMessage);

    wrtieFile(db, (err) => {
        if (err) {
            return res.status(500).json({ error: 'Erro ao salvar mensagem' });
        }
        res.json({ message: 'Mensagem enviada com sucesso' });
    });
});

export default chatRouter;
