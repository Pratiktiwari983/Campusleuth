const mongoose = require("mongoose");

const itemSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
            trim: true
        },

        type: {
            type: String,
            required: true,
            enum: ["LOST", "FOUND"]
        },

        category: {
            type: String,
            required: true
        },

        location: {
            type: String,
            required: true
        },

        description: {
            type: String,
            required: true
        },
        imageUrl: {
            type: String,
            default: ""
    },

        status: {
            type: String,
            enum: ["ACTIVE", "CLAIMED", "RETURNED"],
            default: "ACTIVE"
        }
    },
    {
        timestamps: true
    }
);

const Item = mongoose.model("Item", itemSchema);

module.exports = Item;