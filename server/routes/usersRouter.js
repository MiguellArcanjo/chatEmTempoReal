import express, { request } from 'express';
import fs from "fs-extra"
import db from "../db.json" with { type: 'json' };
import {generateToken} from '../utils/auth.js';
import authMiddleware from '../middlewares/authMiddleware.js';
import { wrtieFile } from "../utils/file.js"

const usersRouter = express.Router();
const DB_PATH = '../db.json';


usersRouter.get('/contacts', authMiddleware, (req, res) => {
    const userId = req.user.id;

    const user = db.users.find(userDb => userDb.id === userId);

    if (!user || !user.contacts) {
        return res.json({ contacts: [] });
    }

    const contactList = user.contacts.map(contactId => 
        db.users.find(userDb => userDb.id === contactId)
    )

    res.json({ contacts: contactList })
})

usersRouter.post('/addUser', authMiddleware, (req, res) => {
    console.log("Rota /addUser acessada.");
    console.log(req.user)

    const { contactId } = req.body;
    const contactIdNumber = Number(contactId);
    const userId = req.user.id;

    if (!contactId) {
        return res.status(400).json({ error: 'Id do contato é obrigatório' });
    }

    const user = db.users.find(userDb => userDb.id === Number(userId));
    const contact = db.users.find(userDb => userDb.id === Number(contactId));

    if (!user || !contact) {
        return res.status(404).json({ error: 'Usuário ou contato não encontrado' });
    }

    if (!user.contacts) {
        user.contacts = [];
    }

    if (user.contacts.includes(contactIdNumber)) {
        return res.status(400).json({ error: 'Este contato já foi adicionado' });
    }

    user.contacts.push(contactIdNumber);

    wrtieFile(db, (err) => {
        if (err) {
            console.error("Erro ao salvar dados no arquivo:", err);
            return res.status(500).json({ error: 'Erro ao salvar dados' });
        }

        console.log(`Contato ${contactId} adicionado ao usuário ${userId}`);
        res.json({ message: 'Contato adicionado com sucesso', user });
    });
});

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
        password,
        contacts: []
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

usersRouter.post('/sendRequest', authMiddleware, (req, res) => {

    console.log("Rota /addUser acessada.");
    console.log("Banco de dados atual:", db);
    console.log("Usuários:", db.users);
    console.log("Solicitações:", db.requests);

    // Inicializar requests se não existir
    if (!db.requests) {
        db.requests = [];
    }

    console.log(req.user)

    const { contactId } = req.body;
    const contactIdNumber = Number(contactId);
    
    if (isNaN(contactIdNumber)) {
        return res.status(400).json({ error: 'Id do contato inválido' });
    }

    const userId = req.user.id;


    if (!contactId) {
        return res.status(400).json({ error: 'Id do contato é obrigatório' });
    }

    const user = db.users.find(userDb => userDb.id === Number(userId));
    const contact = db.users.find(userDb => userDb.id === contactIdNumber);

    if (!user || !contact) {
        return res.status(404).json({ error: 'Usuário ou contato não encontrado' });
    }

    if (!user.contacts) {
        user.contacts = [];
    }

    if (user.contacts.includes(contactIdNumber)) {
        return res.status(400).json({ error: 'Este contato já foi adicionado' });
    }

    const existingRequest = db.requests.find(request =>
        (request.id_usuario_requisitante === userId && request.id_usuario_receptor === contactIdNumber) ||
        (request.id_usuario_requisitante === contactId && request.id_usuario_receptor === userId)
    );

    if (existingRequest) {
        return res.status(400).json({ error: 'Já existe uma solicitação pendente ou já foi resolvida' });
    }

    const newRequest = {
        id: db.requests.length + 1,
        id_usuario_requisitante: userId,
        id_usuario_receptor: contactIdNumber,
        status: 'pendente'
    };

    db.requests.push(newRequest);

    wrtieFile(db, (err) => {
        if (err) {
            console.error("Erro ao salvar dados no arquivo:", err);
            return res.status(500).json({ error: 'Erro ao salvar dados' });
        }

        res.json({ message: 'Solicitação enviada com sucesso' });
    });
})

usersRouter.get('/requests', authMiddleware, async (req, res) => {
    const userId = req.user.id;

    try {
        const pendingRequests = db.requests.filter(request =>
            request.id_usuario_receptor === userId && request.status === 'pendente'
        );

        const requestWithNames = await Promise.all(pendingRequests.map(async (request) => {
            const sender = db.users.find(user => user.id === request.id_usuario_requisitante);
            return { 
                ...request,
                senderName: sender ? sender.name : "Desconhecido"
            }
        }));

        res.json({ requests: requestWithNames });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Erro ao buscar solicitações." })
    }
});

// Aceitar solicitação de amizade
usersRouter.put('/acceptRequest/:id', authMiddleware, (req, res) => {
    const { id } = req.params;
    const userId = req.user.id;

    const request = db.requests.find(r => r.id === Number(id) && r.id_usuario_receptor === userId && r.status === 'pendente');

    if (!request) {
        return res.status(404).json({ error: 'Solicitação não encontrada ou já foi resolvida' });
    }

    // Adicionar o contato para os dois usuários
    const user = db.users.find(userDb => userDb.id === userId);
    const contact = db.users.find(userDb => userDb.id === request.id_usuario_requisitante);

    // Adiciona os contatos nas listas apenas se a solicitação for aceita
    user.contacts.push(contact.id);
    contact.contacts.push(user.id);

    // Atualizar status da solicitação
    request.status = 'aceito';

    wrtieFile(db, (err) => {
        if (err) {
            console.error("Erro ao salvar dados no arquivo:", err);
            return res.status(500).json({ error: 'Erro ao salvar dados' });
        }

        res.json({ message: 'Solicitação aceita com sucesso' });
    });
});

// Recusar solicitação de amizade
usersRouter.put('/rejectRequest/:id', authMiddleware, (req, res) => {
    const { id } = req.params;
    const userId = req.user.id;

    const request = db.requests.find(r => r.id === Number(id) && r.id_usuario_receptor === userId && r.status === 'pendente');

    if (!request) {
        return res.status(404).json({ error: 'Solicitação não encontrada ou já foi resolvida' });
    }

    // Atualizar status da solicitação
    request.status = 'recusado';

    wrtieFile(db, (err) => {
        if (err) {
            console.error("Erro ao salvar dados no arquivo:", err);
            return res.status(500).json({ error: 'Erro ao salvar dados' });
        }

        res.json({ message: 'Solicitação recusada com sucesso' });
    });
});

export default usersRouter;