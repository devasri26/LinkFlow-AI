const jwt = require('jsonwebtoken');

const authMiddleware = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'No authorization token, access denied' });
  }

  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'linkflow-ai-cyber-secret-key-999');
    req.user = decoded; // Decoded payload will store { id, email, username }
    next();
  } catch (error) {
    return res.status(401).json({ message: 'Token is invalid or expired' });
  }
};

module.exports = authMiddleware;
