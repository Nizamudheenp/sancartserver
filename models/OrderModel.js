const mongoose = require('mongoose');

const ShippingAddressSchema = new mongoose.Schema({
  fullName: { type: String, required: true, trim: true },
  phone: { type: String, required: true, trim: true },
  street: { type: String, required: true, trim: true },
  landmark: { type: String, default: '', trim: true },
  city: { type: String, required: true, trim: true },
  state: { type: String, required: true, trim: true },
  pincode: { type: String, required: true, trim: true }
}, { _id: false });

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
  shippingAddress: { type: ShippingAddressSchema, required: true },
  customerPhone: { type: String, required: true, trim: true },
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
