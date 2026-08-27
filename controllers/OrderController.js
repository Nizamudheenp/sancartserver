const orderDB = require("../models/OrderModel");
const OrderResponseDTO = require("../dtos/orderdto/OrderResponseDTO");
const CreateOrderRequestDTO = require("../dtos/orderdto/CreateOrderRequestDTO");
const UpdateOrderStatusRequestDTO = require("../dtos/orderdto/UpdateOrderStatusRequestDTO");

exports.createOrder = async (req, res) => {
  try {
    const orderReq = new CreateOrderRequestDTO(req.body);

    if (!orderReq.products || orderReq.products.length === 0) {
      return res.status(400).json({ message: "Order must contain at least one product." });
    }

    if (!orderReq.shippingAddress || !orderReq.totalAmount || !orderReq.status || (orderReq.paymentMethod !== "COD" && !orderReq.paymentId)) {
      return res.status(400).json({ message: "Required order/payment data missing." });
    }

    const order = new orderDB({
      userId: req.user ? req.user.id : undefined,
      guestEmail: req.user ? undefined : orderReq.guestEmail,
      products: orderReq.products,
      totalAmount: orderReq.totalAmount,
      shippingAddress: orderReq.shippingAddress,
      paymentId: orderReq.paymentId || "COD",
      paymentMethod: orderReq.paymentMethod || "Online",
      status: orderReq.status,
      timestamp: new Date(),
    });

    const newOrder = await order.save();
    res.status(201).json(new OrderResponseDTO(newOrder));
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

exports.updateOrderStatus = async (req, res) => {
  const { id } = req.params;
  const statusReq = new UpdateOrderStatusRequestDTO(req.body);

  try {
    const updatedOrder = await orderDB.findByIdAndUpdate(
      id,
      { status: statusReq.status },
      { new: true }
    );

    if (!updatedOrder) {
      return res.status(404).json({ message: "Order not found" });
    }

    res.json(new OrderResponseDTO(updatedOrder));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};


exports.getUserOrders = async (req, res) => {
  try {
    const orders = await orderDB
      .find({ userId: req.user.id })
      .populate('products.productId', 'name price images brand')
      .sort({ createdAt: -1 });

    res.json(orders.map(order => new OrderResponseDTO(order)));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getAllOrders = async (req, res) => {
  try {
    const orders = await orderDB
      .find()
      .populate('products.productId', 'name price images brand')
      .populate('userId', 'name email')
      .sort({ createdAt: -1 });

    res.json(orders.map(order => new OrderResponseDTO(order)));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.cancelOrder = async (req, res) => {
  const { id } = req.params;
  try {
    const order = await orderDB.findById(id);
    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }
    // Verify ownership
    if (order.userId && order.userId.toString() !== req.user.id) {
      return res.status(403).json({ message: "Not authorized to cancel this order" });
    }
    // Check status
    const cancellableStatuses = ["pending", "processing", "paid"];
    if (!cancellableStatuses.includes(order.status.toLowerCase())) {
      return res.status(400).json({ message: `Cannot cancel order in '${order.status}' status.` });
    }

    order.status = "cancelled";
    const updatedOrder = await order.save();
    res.json(new OrderResponseDTO(updatedOrder));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
