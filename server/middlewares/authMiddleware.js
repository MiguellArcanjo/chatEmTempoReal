import { verifyToken } from "../utils/auth.js";

export default function authMiddleware(req, res, next) {
    const token = req.headers.authorization?.split(' ')[1];

    if (!token) {
        return res.status(403).json({ error: 'Token não fornecido' });
    }

    try {
        const decoded = verifyToken(token);  
        if (!decoded) {
            return res.status(401).json({ error: 'Token inválido ou expirado' });
        }
        req.user = decoded;
        next();
    } catch (error) {
        return res.status(401).json({ error: 'Token inválido ou expirado' });
    }
}
