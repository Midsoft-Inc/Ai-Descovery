const mongoose = require("mongoose");
module.exports = mongoose.model("Contact", new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true, maxlength: 100 },
    email: { type: String, required: true, trim: true, lowercase: true, maxlength: 254 },
    topic: { type: String, required: true, maxlength: 60 },
    message: { type: String, required: true, trim: true, maxlength: 2000 },
  },
  { timestamps: true }
));
