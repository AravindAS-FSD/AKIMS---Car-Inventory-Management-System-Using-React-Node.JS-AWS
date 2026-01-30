const jwt = require('jsonwebtoken');

const JWT_SECRET = "your-very-secure-secret";

exports.verifyToken = (event) => {
  const authHeader = event.headers?.authorization || event.headers?.Authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    throw new Error('Unauthorized - Missing or malformed token');
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    return decoded;
  } catch (err) {
    throw new Error('Unauthorized - Invalid or expired token');
  }
};
