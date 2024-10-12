const jwt = require("jsonwebtoken");

const authMiddleware = (req, res, next) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1]; // Bearer token

  if (!token) return res.status(401).json({ message: "Token missing" }); // Token yoksa unauthorized

  jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, decoded) => {
    if (err) {
      if (err.name === "TokenExpiredError") {
        return res.status(403).json({ message: "Token expired" }); // Token süresi dolmuşsa forbidden
      } else {
        return res.status(403).json({ message: "Invalid token" }); // Token geçersizse forbidden
      }
    }

    // Token geçerliyse kullanıcı bilgilerini req.user'a ekle
    req.user = {
      userId: decoded.userId,
      username: decoded.username,
      email: decoded.email,
      role: decoded.role,
    };
    console.log(req.user);
    next();
  });
};

module.exports = authMiddleware;
