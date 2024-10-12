const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const session = require("express-session");
const cookieParser = require("cookie-parser");
const bcrypt = require("bcrypt");
const userRoute = require("./routes/userRoute");
const productRoute = require("./routes/productRoute");
const categoryRoute = require("./routes/categoryRoute");
const cartRoute = require("./routes/cartRoute");

dotenv.config();

const app = express();

app.use(express.json());
app.use(cookieParser());
// CORS middleware ekleme, sadece belirli bir origin için izin ver
app.use(
  cors({
    origin: "http://localhost:5173", // Frontend'inizin çalıştığı port
    credentials: true, // Cookie'lerin gönderilmesine izin ver
  })
);
// Connect DB
mongoose
  .connect("mongodb://127.0.0.1/proje-db")
  .then(() => {
    console.log("DB Connected Succesfuly");
  })
  .catch((err) => {
    console.log(err);
  });

app.use("/auth", userRoute);
app.use("/products", productRoute);
app.use("/categories", categoryRoute);
app.use("/cart", cartRoute);

const port = 3000;
app.listen(port, () => {
  console.log(`Sunucu ${port} portunda başlatıldı.`);
});
