const mongoose = require('mongoose');

const OrderSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: false, index: true },
  orderId: { type: String, unique: true, sparse: true },
  guestEmail: { type: String, required: false },
  products: [
    {
      productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
      quantity: { type: Number, required: true }
    }
  ],
  totalAmount: { type: Number, required: true },
  shippingAddress: { type: String, required: true },
  paymentId: { type: String, required: false },
  paymentMethod: {
    type: String,
    enum: ["Online", "COD"],
    default: "Online",
    required: true
  },
  status: {
    type: String,
    enum: ["processing", "shipped", "paid", "delivered", "cancelled", "refunded"],
    default: "processing",
    required: true
  },
  timestamp: { type: Date, default: Date.now },
}, { timestamps: true });

module.exports = mongoose.model('Order', OrderSchema);
