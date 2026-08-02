const mongoose = require('mongoose');

const ProductSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String },
  price: { type: Number, required: true },
  images: [{ type: String }],
  category: { type: String , index: true},
  brand: { type: String },
  tags: { type: [String], index: true},
  stock: { type: Number, default: 0 },
  reviews: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Review' }],
  rating: { type: Number, default: 0 },
  numReviews: { type: Number, default: 0 },

}, { timestamps: true });

ProductSchema.index({createdAt: -1})

module.exports = mongoose.model('Product', ProductSchema);
