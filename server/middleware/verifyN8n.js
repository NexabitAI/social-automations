module.exports = (req, res, next) => {
    const secret = req.header('X-N8N-SECRET') || req.header('x-n8n-secret');
    if (!secret) {
        return res.status(401).json({ success: false, message: 'No N8N secret provided' });
    }
    if (secret !== process.env.N8N_CALLBACK_SECRET) {
        return res.status(403).json({ success: false, message: 'Invalid N8N secret' });
    }
    next();
};
