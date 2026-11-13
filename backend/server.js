require("dotenv").config({
    path: require("node:path").join(__dirname, ".env")
});

const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const multer = require("multer");
const { Readable } = require("node:stream");

const Item = require("./models/Item");
const cloudinary = require("./config/cloudinary");

const mongoUri = process.env.MONGO_URI;

if (!mongoUri) {
    throw new Error(
        "MONGO_URI is missing from backend/.env or Render environment variables."
    );
}

const app = express();

app.use(cors());

app.use(express.json({
    limit: "1mb"
}));

const upload = multer({

    storage: multer.memoryStorage(),

    limits: {
        fileSize: 5 * 1024 * 1024
    },

    fileFilter: (req, file, callback) => {

        if (
            file.mimetype &&
            file.mimetype.startsWith("image/")
        ) {
            callback(null, true);
        } else {
            callback(
                new Error("Only image files are allowed.")
            );
        }
    }
});

// Home route
app.get("/", (req, res) => {

    res.status(200).send(
        "CampusLeuth backend is running."
    );

});

// Health check
app.get("/api/health", (req, res) => {

    res.status(200).json({

        success: true,

        message: "CampusLeuth API is healthy.",

        database:
            mongoose.connection.readyState === 1
                ? "connected"
                : "disconnected"

    });

});

// Get all items
app.get("/api/items", async (req, res, next) => {

    try {

        const foundItems = await Item.find()
            .sort({ createdAt: -1 });

        res.status(200).json({

            success: true,

            data: foundItems

        });

    } catch (error) {

        next(error);

    }

});

// Create item
app.post("/api/items", async (req, res, next) => {

    try {

        const {
            name,
            type,
            category,
            location,
            description,
            imageUrl = ""
        } = req.body || {};

        if (
            !name ||
            !type ||
            !category ||
            !location ||
            !description
        ) {

            return res.status(400).json({

                success: false,

                message:
                    "Name, type, category, location, and description are required."

            });

        }

        if (
            !["LOST", "FOUND"].includes(
                String(type).toUpperCase()
            )
        ) {

            return res.status(400).json({

                success: false,

                message: "Type must be either LOST or FOUND."

            });

        }

        const newItem = new Item({

            name: String(name).trim(),

            type: String(type).toUpperCase(),

            category: String(category).trim(),

            location: String(location).trim(),

            description: String(description).trim(),

            imageUrl:
                typeof imageUrl === "string"
                    ? imageUrl
                    : ""

        });

        const savedItem = await newItem.save();

        res.status(201).json({

            success: true,

            message: "Item reported successfully.",

            data: savedItem

        });

    } catch (error) {

        if (error.name === "ValidationError") {

            return res.status(400).json({

                success: false,

                message: error.message

            });

        }

        next(error);

    }

});

// Upload image to Cloudinary
app.post(
    "/api/upload",
    upload.single("image"),
    async (req, res, next) => {

        try {

            if (!req.file) {

                return res.status(400).json({

                    success: false,

                    message: "Please select an image to upload."

                });

            }

            const uploadResult = await new Promise(
                (resolve, reject) => {

                    const cloudinaryStream =
                        cloudinary.uploader.upload_stream(

                            {
                                folder: "campusleuth",
                                resource_type: "image"
                            },

                            (error, result) => {

                                if (error) {
                                    return reject(error);
                                }

                                resolve(result);

                            }

                        );

                    Readable
                        .from(req.file.buffer)
                        .pipe(cloudinaryStream);

                }
            );

            res.status(200).json({

                success: true,

                imageUrl: uploadResult.secure_url

            });

        } catch (error) {

            next(error);

        }

    }
);

// Unknown route
app.use((req, res) => {

    res.status(404).json({

        success: false,

        message: "Route not found."

    });

});

// Error handler
app.use((error, req, res, next) => {

    console.error("API error:", error);

    if (error instanceof multer.MulterError) {

        const status =
            error.code === "LIMIT_FILE_SIZE"
                ? 413
                : 400;

        return res.status(status).json({

            success: false,

            message:
                error.code === "LIMIT_FILE_SIZE"
                    ? "Image must be 5 MB or smaller."
                    : error.message

        });

    }

    if (
        error.message ===
        "Only image files are allowed."
    ) {

        return res.status(400).json({

            success: false,

            message: error.message

        });

    }

    res.status(500).json({

        success: false,

        message:
            "Something went wrong on the server. Please try again."

    });

});

// Start server after MongoDB connection
const PORT = process.env.PORT || 5000;

mongoose.connect(mongoUri)

    .then(() => {

        console.log(
            "MongoDB connected successfully."
        );

        app.listen(PORT, () => {

            console.log(
                `CampusLeuth backend listening on port ${PORT}.`
            );

        });

    })

    .catch((error) => {

        console.error(
            "MongoDB connection failed:",
            error.message
        );

        process.exit(1);

    });