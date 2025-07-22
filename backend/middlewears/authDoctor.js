import jwt from 'jsonwebtoken';

const authDoctor = async (req, res, next) => {
  try {
    const { dtoken } = req.headers;

    if (!dtoken) {
      return res.status(401).json({ success: false, message: 'Not authorized, login again' });
    }

    const token_decode = jwt.verify(dtoken, process.env.JWT_SECRET);
    req.docId = token_decode.id;
    next();

  } catch (error) {
    console.error("Auth Error:", error);
    res.status(401).json({ success: false, message: 'Token verification failed' });
  }
};

export default authDoctor;
