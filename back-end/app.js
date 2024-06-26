const express = require("express");
const cors = require("cors");
const cookieparser = require("cookie-parser");
const bodyParser = require("body-parser");
const Razorpay = require('razorpay');
const shortid = require('shortid');
const connectDB = require("./config/db");
const authRoutes = require("./routes/authRoutes");
const auctionRoutes = require("./routes/auctionRoutes");
const bidRoutes = require("./routes/bidRoutes");
const paymentRoutes = require('./routes/paymentRoutes');

const app = express();

connectDB();

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.json());
app.use(cors({
  origin: 'http://localhost:3000',
  methods: ["GET", "POST"],
  credentials: true,
}));
app.use(cookieparser());

app.use("/api/auth", authRoutes);
app.use("/api/auctions", auctionRoutes);
app.use("/api/bids", bidRoutes);
app.use('/api/payment', paymentRoutes);

app.get("/", (req, res) => {
  res.send("Hello World");
});

module.exports = app;
