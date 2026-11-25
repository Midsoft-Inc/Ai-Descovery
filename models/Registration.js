const mongoose = require("mongoose");
const { FEE_PAISE, CURRENCY, CATEGORIES } = require("../config");

const schema = new mongoose.Schema(
  {
    token: { type: String, required: true, unique: true },           // secret id used in page URLs
    fullName: { type: String, required: true, trim: true, maxlength: 100 },
    email: { type: String, required: true, trim: true, lowercase: true, unique: true, maxlength: 254 },
    phone: { type: String, required: true, trim: true, maxlength: 20 },
    category: { type: String, required: true, enum: CATEGORIES },
    country: { type: String, required: true, trim: true, maxlength: 60 },
    org: { type: String, trim: true, maxlength: 150, default: "" },
    amount: { type: Number, default: FEE_PAISE },
    currency: { type: String, default: CURRENCY },
    status: { type: String, enum: ["pending", "paid"], default: "pending", index: true },
    razorpayOrderId: { type: String, index: true, sparse: true },
    razorpayPaymentId: { type: String },
    paidAt: { type: Date },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Registration", schema);
