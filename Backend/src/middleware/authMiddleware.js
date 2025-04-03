const jwt = require('jsonwebtoken');

const authenticateToken = (req, res, next) => {

    console.log('Authenticating token');
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Bearer <token>

    if (!token) {
        console.log('Token nhi mila');
        return res.status(401).json({ error: 'Access token missng' });
    }

    try {

        console.log("Token found inside try block");
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded;
        next();
    } catch (error) {
        console.log("inside catch block , token verification failed");
        console.error('Token verification failed:', error.message);
        return res.status(403).json({ error: 'Invalid token' });
    }
};

module.exports = authenticateToken;