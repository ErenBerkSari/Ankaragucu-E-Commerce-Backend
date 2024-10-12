// const User = require("./models/User");
const jwt = require("jsonwebtoken");
const express = require("express");
const cookieParser = require("cookie-parser");
const User = require("../models/User");
const Token = require("../models/Token");
const bcrypt = require("bcrypt");
const nodemailer = require("nodemailer");

const app = express();
app.use(express.json());

const register = async (req, res) => {
  const { username, password, email } = req.body;

  // Gerekli alanların kontrolü
  if (!username || !password || !email) {
    return res
      .status(400)
      .json({ message: "Kullanıcı adı, email ve şifre gerekli!" });
  }

  try {
    // Kullanıcı adı daha önce kullanılmış mı
    const existingUser = await User.findOne({ username });
    if (existingUser) {
      return res.status(409).json({ message: "Kullanıcı adı zaten mevcut" });
    }

    // Email daha önce kullanılmış mı
    const existingEmail = await User.findOne({ email });
    if (existingEmail) {
      return res.status(409).json({ message: "Email zaten kayıtlı" });
    }

    // Yeni kullanıcıyı kaydet
    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new User({ username, password: hashedPassword, email });
    await newUser.save();

    const accessToken = jwt.sign(
      {
        userId: newUser._id,
        username: newUser.username,
        role: newUser.role,
        email: newUser.email,
      },
      process.env.ACCESS_TOKEN_SECRET,
      { expiresIn: "1m" }
    );

    const refreshToken = jwt.sign(
      {
        userId: newUser._id,
      },
      process.env.REFRESH_TOKEN_SECRET,
      { expiresIn: "1d" }
    );

    const tokenRecord = new Token({
      userId: newUser._id,
      refreshToken,
    });
    await tokenRecord.save();

    const userId = newUser._id;
    res.json({ accessToken, userId, refreshToken, email });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

const login = async (req, res) => {
  const { email, password } = req.body;
  console.log("Login isteği alındı: ", req.body);

  try {
    // Kullanıcıyı email'e göre bul
    const user = await User.findOne({ email });

    // Eğer kullanıcı bulunursa, şifreyi kontrol et
    if (user) {
      const match = await bcrypt.compare(password, user.password);

      // Şifre doğruysa token üret ve yanıtla
      if (match) {
        const accessToken = jwt.sign(
          {
            userId: user._id,
            username: user.username,
            role: user.role,
            email: user.email,
          },
          process.env.ACCESS_TOKEN_SECRET,
          { expiresIn: "1m" }
        );

        const refreshToken = jwt.sign(
          {
            userId: user._id,
          },
          process.env.REFRESH_TOKEN_SECRET,
          { expiresIn: "1d" }
        );

        await Token.findOneAndUpdate(
          { userId: user._id },
          { refreshToken },
          { upsert: true }
        );

        const userId = user._id;
        res.json({ accessToken, userId, refreshToken, email });
      } else {
        return res.status(406).json({ message: "Invalid credentials" });
      }
    } else {
      return res.status(406).json({ message: "Invalid credentials" });
    }
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

const refresh = async (req, res) => {
  const { refreshToken } = req.body;

  if (!refreshToken) {
    return res.status(400).json({ message: "Refresh token sağlanmadı" });
  }

  try {
    const decoded = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET);
    const user = await User.findById(decoded.userId);
    const tokenRecord = await Token.findOne({ userId: user._id, refreshToken });

    if (!user || !tokenRecord) {
      return res
        .status(403)
        .json({ message: "Geçersiz veya süresi dolmuş refresh token" });
    }

    const accessToken = jwt.sign(
      {
        userId: user._id,
        username: user.username,
        role: user.role,
        email: user.email,
      },
      process.env.ACCESS_TOKEN_SECRET,
      { expiresIn: "1m" }
    );
    res.json({ accessToken, username: user.username, email: user.email });
  } catch (error) {
    return res
      .status(401)
      .json({ message: "Yetkisiz: Geçersiz veya süresi dolmuş refresh token" });
  }
};

const logout = async (req, res) => {
  const refreshToken = req.body.refreshToken;
  if (refreshToken) {
    try {
      const decoded = jwt.verify(
        refreshToken,
        process.env.REFRESH_TOKEN_SECRET
      );

      await Token.findOneAndDelete({
        userId: decoded.userId,
        refreshToken: refreshToken,
      });

      res.status(200).json({ message: "Logout successful" });
    } catch (error) {
      res.status(406).json({ message: "Logout failed" });
    }
  } else {
    res.status(400).json({ message: "No token provided" });
  }
};
const sendEmail = async (req, res) => {
  const { title, content, email } = req.body;
  console.log(email);
  if (!title || !content) {
    return res
      .status(400)
      .json({ message: "Mail başlığı ve içeriği gerekli!" });
  }

  try {
    const nodemailer = require("nodemailer");

    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: "",
        pass: "",
      },
    });

    const mailOptions = {
      from: email,
      to: "",
      subject: title,
      text: content,
    };

    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.log("Error:", error);
        return res
          .status(500)
          .json({ message: "Mail gönderilirken hata oluştu!", error });
      } else {
        console.log("Email sent:", info.response);
        return res.status(200).json({ message: "Mail başarıyla gönderildi!" });
      }
    });
  } catch (error) {
    res.status(500).json({ message: "Mail gönderilirken hata oluştu!", error });
  }
};

module.exports = { register, login, refresh, logout, sendEmail };
