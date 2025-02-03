import express from "express";
import fs from "fs-extra";
import db from "../db.json" with { type: 'json' };
import authMiddleware from "../middlewares/authMiddleware.js";
import { wrtieFile } from "../utils/file.js";

const chatRouter = express.Router();

chatRouter.post("/send", authMiddleware, (req, res) => {
    const { receiverId, message } = req.body;
    const senderId = req.user.id;

    if (!receiverId || !message) {
        return res.status(400).json({ error: "Destinatário e mensagem são obrigatórios." });
    }

    const receiverExists = db.users.some(user => user.id === receiverId);
    if (!receiverExists) {
        return res.status(404).json({ error: "Destinatário não encontrado." });
    }

    const newMessage = {
        id: db.messages.length + 1,
        senderId,
        receiverId,
        message,
        timestamp: new Date().toISOString()
    };

    db.messages.push(newMessage);

    wrtieFile(db, (err) => {
        if (err) {
            return res.status(500).json({ error: "Erro ao salvar mensagem." });
        }

        res.json({ message: "Mensagem enviada!", data: newMessage });
    });
});

chatRouter.get("/:contactId", authMiddleware, (req, res) => {
    const userId = req.user.id;
    const contactId = Number(req.params.contactId);

    const messages = db.messages.filter(msg =>
        (msg.senderId === userId && msg.receiverId === contactId) ||
        (msg.senderId === contactId && msg.receiverId === userId)
    );

    res.json({ messages });
});

export default chatRouter;