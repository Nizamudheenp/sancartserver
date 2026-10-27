const Razorpay = require('razorpay');
const crypto = require('crypto');
const ProductDB = require('../models/ProductModel');
const RazorpayOrderRequestDTO = require('../dtos/paymentdto/RazorpayOrderRequestDTO');
const RazorpayOrderResponseDTO = require('../dtos/paymentdto/RazorpayOrderResponseDTO');
const VerifyPaymentRequestDTO = require('../dtos/paymentdto/VerifyPaymentRequestDTO');
require("dotenv").config();

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

exports.createRazorpayOrder = async (req, res) => {
  try {
    const orderReq = new RazorpayOrderRequestDTO(req.body);
    let finalAmount = 0;

    // Server-side calculation from database if products are provided (prevents price manipulation)
    if (orderReq.products.length > 0) {
      const productIds = orderReq.products.map((p) => p.productId);
      const dbProducts = await ProductDB.find({ _id: { $in: productIds } });

      if (dbProducts.length !== productIds.length) {
        return res.status(400).json({ error: "One or more products could not be found" });
      }

      const priceMap = new Map();
      dbProducts.forEach((p) => priceMap.set(p._id.toString(), p.price));

      finalAmount = orderReq.products.reduce((sum, item) => {
        const itemPrice = priceMap.get(item.productId.toString()) || 0;
        return sum + itemPrice * (item.quantity || 1);
      }, 0);
    } else if (orderReq.amount && !isNaN(orderReq.amount) && Number(orderReq.amount) > 0) {
      finalAmount = Number(orderReq.amount);
    }

    if (!finalAmount || finalAmount <= 0) {
      return res.status(400).json({ error: "Invalid or zero order amount" });
    }

    const options = {
      amount: Math.round(finalAmount * 100), // amount in paise
      currency: "INR",
      receipt: `receipt_${Date.now()}`,
    };

    const order = await razorpay.orders.create(options);
    res.json(new RazorpayOrderResponseDTO(order));
  } catch (error) {
    console.error("Error creating Razorpay order:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

exports.verifyRazorpayPayment = async (req, res) => {
  try {
    const verifyReq = new VerifyPaymentRequestDTO(req.body);

    if (!verifyReq.razorpayOrderId || !verifyReq.razorpayPaymentId || !verifyReq.razorpaySignature) {
      return res.status(400).json({ error: "Missing required verification parameters" });
    }

    const shasum = crypto.createHmac('sha256', process.env.RAZORPAY_KEY_SECRET);
    shasum.update(`${verifyReq.razorpayOrderId}|${verifyReq.razorpayPaymentId}`);
    const digest = shasum.digest('hex');

    if (digest === verifyReq.razorpaySignature) {
      res.json({ status: "success", message: "Signature verification succeeded" });
    } else {
      res.status(400).json({ error: "Invalid signature, payment verification failed" });
    }
  } catch (error) {
    console.error("Error verifying signature:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};
