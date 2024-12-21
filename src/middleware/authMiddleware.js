const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Organization = require('../models/Organization');

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

const verifyToken = async (req, res, next) => {
    try {
        const token = req.cookies.auth_token;

        if (!token) {
            return res.status(401).json({ error: 'Access denied. No token provided.' });
        }

        try {
            const decoded = jwt.verify(token, JWT_SECRET);
            
            // Get user with organization
            const user = await User.findOne({
                where: { id: decoded.userId },
                include: [{
                    model: Organization,
                    attributes: ['id', 'name']
                }]
            });

            if (!user) {
                return res.status(401).json({ error: 'User not found.' });
            }

            // Attach user and organization info to request
            req.user = user;
            req.organization = user.Organizations?.[0] || null;

            next();
        } catch (error) {
            console.error('Token verification failed:', error);
            return res.status(401).json({ error: 'Invalid token.' });
        }
    } catch (error) {
        console.error('Auth middleware error:', error);
        res.status(500).json({ error: 'Internal server error.' });
    }
};

const generateToken = (user) => {
    return jwt.sign(
        { 
            userId: user.id,
            email: user.email
        },
        JWT_SECRET,
        { expiresIn: '24h' }
    );
};

module.exports = {
    verifyToken,
    generateToken
};
