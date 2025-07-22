import jwt from 'jsonwebtoken';

const authUser = async (req, res, next) => {
  try {
    const { token } = req.headers;

    if (!token) {
      return res.status(401).json({ success: false, message: 'Not authorized, login again' });
    }

    const token_decode = jwt.verify(token, process.env.JWT_SECRET);
    req.userId = token_decode.id;
    next();

  } catch (error) {
    console.error("Auth Error:", error);
    res.status(401).json({ success: false, message: 'Token verification failed' });
  }
};

export default authUser;
