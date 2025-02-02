import express from 'express';
import fs from "fs-extra"
import db from "../db.json" with { type: 'json' };
import {generateToken} from '../utils/auth.js';
import authMiddleware from '../middlewares/authMiddleware.js';
import { wrtieFile } from "../utils/file.js"

const usersRouter = express.Router();
const DB_PATH = '../db.json';
// const db = JSON.parse(fs.readFileSync(DB_PATH, 'utf-8'));

usersRouter.post('/register', async (req, res, callback) => {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
        return res.status(400).json({ error: 'Todos os campos são obrigatorios' });
    }

    const userExist = db.users.some(user => user.email === email);
    if (userExist) {
        return res.status(400).json({ error: 'Este e-mail já esta em uso' });
    }

    const newUser = {
        id: db.users.length + 1,
        name, 
        email,
        password
    };

    db.users.push(newUser);

    try {
        wrtieFile(db, callback);

        const token = generateToken(newUser);
        res.status(201).json({ user: newUser, token });
    } catch (error) {
        res.status(500).json({ error: 'Erro ao salvar dados' });
    }
});

usersRouter.get('/me', authMiddleware, (req, res) => {
    const user = db.users.find(userDb => userDb.id === req.user.id);
    if (!user) return res.status(404).json({ error: 'Usuario não encontrado' })
    res.json(user);
});

usersRouter.post('/login', (req, res) => {
    const { email, password } = req.body;
    const user = db.users.find(userDb => 
        userDb.email === email && String(userDb.password) === String(password)
    );

    if (!user) {
        return res.status(401).json({ error: 'Credenciais inválidas' });
    }

    const token = generateToken(user);
    res.json({ token, user });
});

export default usersRouter;