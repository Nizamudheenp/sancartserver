const mongoose = require('mongoose');

const ReturnSchema = new mongoose.Schema({
  orderId: { type: mongoose.Schema.Types.ObjectId, ref: 'Order', required: true, index: true },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: false, index: true },
  productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
  reason: { type: String, required: true },
  details: { type: String, required: false },
  images: [{ type: String }],
  returnOption: { type: String, enum: ["Refund", "Replacement"], required: true },
  status: {
    type: String,
    enum: ["pending", "approved", "rejected", "completed"],
    default: "pending",
    required: true
  },
}, { timestamps: true });

module.exports = mongoose.model('Return', ReturnSchema);
