// album.model.js
const mongoose = require("mongoose");

const albumsSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
  },
  isActive: {
    type: Boolean,
    required: true,
  },

  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const Albums = mongoose.model("Albums", albumsSchema);

module.exports = Albums;

