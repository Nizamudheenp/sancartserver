const ReturnDB = require('../models/ReturnModel');
const OrderDB = require('../models/OrderModel');

exports.createReturnRequest = async (req, res) => {
  try {
    const { orderId, productId, reason, details, returnOption } = req.body;

    // Check if order exists
    const order = await OrderDB.findById(orderId);
    if (!order) {
      return res.status(404).json({ message: "Order not found" });
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
    const images = req.files ? req.files.map(file => file.path) : [];

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
    res.status(201).json({ message: "Return request submitted successfully", returnRequest: newReturn });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getReturnRequests = async (req, res) => {
  try {
    const returns = await ReturnDB.find()
      .populate('productId', 'name price images brand')
      .populate('userId', 'name email')
      .populate('orderId', 'totalAmount shippingAddress')
      .sort({ createdAt: -1 });

    res.json(returns);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.updateReturnRequestStatus = async (req, res) => {
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

    res.json({ message: "Return request status updated successfully", returnRequest });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
