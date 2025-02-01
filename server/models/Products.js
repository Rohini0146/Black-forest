const mongoose = require("mongoose");
const Schema = mongoose.Schema;

// PriceDetail schema for individual price data
const PriceDetailSchema = new Schema(
  {
    price: { type: Number, required: true },
    qty: { type: Number, required: true },
    offerPercent: { type: Number, required: false, default: 0 },
    unit: { type: Schema.Types.ObjectId, ref: "ProductUnit", required: true },
    type: { type: Number, required: true }, // Added "type" field
  },
  { _id: false }
);

const ProductSchema = new Schema(
  {
    name: { type: String, required: true, trim: true },
    category: {
      type: Schema.Types.ObjectId,
      ref: "ProductCategory",
      default: null,
    },
    album: { type: Schema.Types.ObjectId, ref: "Albums", default: null },
    description: { type: String, required: false, trim: true },
    directuse: { type: String, required: false, trim: true },
    footnote: { type: String, required: false, trim: true },
    ingredients: { type: String, required: false, trim: true },
    images: { type: [String], required: false },
    price: { type: [PriceDetailSchema], required: true },
    isActive: { type: Boolean, default: true },
    display_order: { type: Number, default: 10 },
  },
  {
    timestamps: true,
  }
);

// Creating and exporting the Product model
const Products = mongoose.model("Products", ProductSchema);
module.exports = Products;
