const jwt = require('jsonwebtoken');
require('dotenv').config();

module.exports = (req, res, next) => {
 
  const token = req.header('Authorization').replace('Bearer ', '');
  if (!token) {
    
    return res.status(401).send({ error: 'Authentication required' });
  }

  try {
    
    const decoded = jwt.verify(token, "shiva$rama$krishna");
    req.body.userID = decoded.id;
    next();
  } catch (error) {
    res.status(401).send({ error: 'Invalid token' });
  }
};
