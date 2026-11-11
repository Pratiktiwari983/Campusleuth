const dns = require("node:dns");
dns.setServers(["8.8.8.8", "8.8.4.4"]);

const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const Item = require("./models/Item");
require("dotenv").config({
    path: require("node:path").join(__dirname, ".env")
});

const mongoUri = process.env.MONGO_URI;

if (!mongoUri) {
    throw new Error("MONGO_URI is missing from backend/.env");
}

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Home route
app.get("/", (req, res) => {
    res.send("CampusLeuth Backend is running!");
});

// Health check API
app.get("/api/health", (req, res) => {
    res.json({
        success: true,
        message: "CampusLeuth server is healthy!"
    });
});
app.post("/api/items", async (req, res) => {
  try {
    const newItem = new Item(req.body);
    const savedItem = await newItem.save();

    res.status(201).json({
      success: true,
      message: "Item reported successfully!",
      data: savedItem
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
});
app.get("/api/items", async (req, res) => {
  try {
    const items = await Item.find().sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: items.length,
      data: items
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});
// Connect MongoDB and start server
const PORT = process.env.PORT || 5000;

mongoose.connect(mongoUri)
    .then(() => {
        console.log("MongoDB connected successfully!");

        app.listen(PORT, () => {
            console.log(`CampusLeuth server running on port ${PORT}`);
        });
    })
    .catch((error) => {
        console.error("MongoDB connection failed:", error.message);
    }); 