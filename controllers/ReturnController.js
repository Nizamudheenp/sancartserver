const ReturnDB = require('../models/ReturnModel');
const OrderDB = require('../models/OrderModel');
const ReturnResponseDTO = require('../dtos/returndto/ReturnResponseDTO');

exports.createReturnRequest = async (req, res, next) => {
  try {
    const { orderId, productId, reason, details, returnOption } = req.body;

    // Check if order exists
    const order = await OrderDB.findById(orderId);
    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    // Verify ownership of order
    if (order.userId) {
      if (!req.user || req.user.id !== order.userId.toString()) {
        return res.status(403).json({ message: "You are not authorized to return this order" });
      }
    } else {
      const { email } = req.body;
      if (!email || email.trim().toLowerCase() !== order.guestEmail?.toLowerCase()) {
        return res.status(403).json({ message: "You are not authorized to return this order. Registered email mismatch." });
      }
    }

    // Verify order is delivered
    if (order.status?.toLowerCase() !== "delivered") {
      return res.status(400).json({ message: "Only delivered orders are eligible for return" });
    }

    // Verify product is in order
    const hasProduct = order.products.some(p => p.productId.toString() === productId);
    if (!hasProduct) {
      return res.status(400).json({ message: "Product is not part of this order" });
    }

    // Extract image paths from uploaded files (Cloudinary URLs)
    const images = req.files ? req.files.map(file => file.path || file.secure_url || file.url) : [];

    const newReturn = new ReturnDB({
      orderId,
      productId,
      userId: req.user ? req.user.id : order.userId,
      reason,
      details,
      images,
      returnOption,
      status: 'pending'
    });

    await newReturn.save();
    res.status(201).json({ 
      message: "Return request submitted successfully", 
      returnRequest: new ReturnResponseDTO(newReturn) 
    });
  } catch (err) {
    next(err);
  }
};

exports.getReturnRequests = async (req, res, next) => {
  try {
    const returns = await ReturnDB.find()
      .populate('productId', 'name price images brand')
      .populate('userId', 'name email')
      .populate('orderId', 'totalAmount shippingAddress orderId')
      .sort({ createdAt: -1 });

    res.json(returns.map(ret => new ReturnResponseDTO(ret)));
  } catch (err) {
    next(err);
  }
};

exports.updateReturnRequestStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!["pending", "approved", "rejected", "completed"].includes(status)) {
      return res.status(400).json({ message: "Invalid status" });
    }

    const returnRequest = await ReturnDB.findById(id);
    if (!returnRequest) {
      return res.status(404).json({ message: "Return request not found" });
    }

    returnRequest.status = status;
    await returnRequest.save();

    // Automatically update Order status if approved for Refund
    if (status === "approved" && returnRequest.returnOption === "Refund") {
      await OrderDB.findByIdAndUpdate(returnRequest.orderId, { status: "refunded" });
    }

    res.json({ 
      message: "Return request status updated successfully", 
      returnRequest: new ReturnResponseDTO(returnRequest) 
    });
  } catch (err) {
    next(err);
  }
};
