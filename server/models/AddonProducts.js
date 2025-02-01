// models/AddonProduct.js
const mongoose = require("mongoose");

// Define the AddonProduct Schema
const addonProductSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    price: {
      type: String,
      required: true,
    },
    image: {
      type: String, // The path of the uploaded image
      required: false,
    },
    created_at: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true, // Automatically adds createdAt and updatedAt fields
  }
);

// Create the model for AddonProduct
const AddonProducts = mongoose.model("AddonProducts", addonProductSchema);

module.exports = AddonProducts;
