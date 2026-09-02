const orderDB = require("../models/OrderModel");
const CounterDB = require("../models/CounterModel");
const CartDB = require("../models/CartModel");
const OrderResponseDTO = require("../dtos/orderdto/OrderResponseDTO");
const CreateOrderRequestDTO = require("../dtos/orderdto/CreateOrderRequestDTO");
const UpdateOrderStatusRequestDTO = require("../dtos/orderdto/UpdateOrderStatusRequestDTO");

exports.createOrder = async (req, res, next) => {
  try {
    const orderReq = new CreateOrderRequestDTO(req.body);

    if (!orderReq.products || orderReq.products.length === 0) {
      return res.status(400).json({ message: "Order must contain at least one product." });
    }

    if (!orderReq.shippingAddress || !orderReq.totalAmount || !orderReq.paymentId || !orderReq.status) {
      return res.status(400).json({ message: "Required order/payment data missing." });
    }

    const order = new orderDB({
      userId: req.user ? req.user.id : undefined,
      guestEmail: req.user ? undefined : orderReq.guestEmail,
      products: orderReq.products,
      totalAmount: orderReq.totalAmount,
      shippingAddress: orderReq.shippingAddress,
      paymentId: orderReq.paymentId,
      status: orderReq.status,
      timestamp: new Date(),
    });

    const mongoIdStr = order._id.toString();
    const idPart = mongoIdStr.substring(mongoIdStr.length - 8).toUpperCase();

    // Increment Counter sequence
    const counter = await CounterDB.findOneAndUpdate(
      { id: "orderId" },
      { $inc: { seq: 1 } },
      { new: true, upsert: true }
    );
    const orderIdString = `SAN${idPart}${String(counter.seq).padStart(4, "0")}`;
    order.orderId = orderIdString;

    const newOrder = await order.save();

    // Automatically clear database cart for authenticated users
    if (req.user && req.user.id) {
      await CartDB.findOneAndUpdate({ user: req.user.id }, { items: [] });
    }

    res.status(201).json(new OrderResponseDTO(newOrder));
  } catch (err) {
    next(err);
  }
};

exports.updateOrderStatus = async (req, res, next) => {
  const { id } = req.params;
  const statusReq = new UpdateOrderStatusRequestDTO(req.body);
  const isCustomId = typeof id === "string" && id.startsWith("SAN");
  const query = isCustomId ? { orderId: id } : { _id: id };

  try {
    const updatedOrder = await orderDB.findOneAndUpdate(
      query,
      { status: statusReq.status },
      { new: true }
    );

    if (!updatedOrder) {
      return res.status(404).json({ message: "Order not found" });
    }

    res.json(new OrderResponseDTO(updatedOrder));
  } catch (err) {
    next(err);
  }
};


exports.getUserOrders = async (req, res, next) => {
  try {
    const orders = await orderDB
      .find({ userId: req.user.id })
      .populate('products.productId', 'name price images brand')
      .sort({ createdAt: -1 });

    res.json(orders.map(order => new OrderResponseDTO(order)));
  } catch (err) {
    next(err);
  }
};

exports.getAllOrders = async (req, res, next) => {
  try {
    const orders = await orderDB
      .find()
      .populate('products.productId', 'name price images brand')
      .populate('userId', 'name email')
      .sort({ createdAt: -1 });

    res.json(orders.map(order => new OrderResponseDTO(order)));
  } catch (err) {
    next(err);
  }
};

exports.cancelOrder = async (req, res, next) => {
  const { id } = req.params;
  const query = id.startsWith("SAN") ? { orderId: id } : { _id: id };
  try {
    const order = await orderDB.findOne(query);
    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }
    // Verify ownership
    if (order.userId && order.userId.toString() !== req.user.id) {
      return res.status(403).json({ message: "Not authorized to cancel this order" });
    }
    // Check status
    const cancellableStatuses = ["processing", "paid"];
    if (!cancellableStatuses.includes(order.status.toLowerCase())) {
      return res.status(400).json({ message: `Cannot cancel order in '${order.status}' status.` });
    }

    order.status = "cancelled";
    const updatedOrder = await order.save();
    res.json(new OrderResponseDTO(updatedOrder));
  } catch (err) {
    next(err);
  }
};

exports.getOrderDetails = async (req, res, next) => {
  try {
    const { id } = req.params;
    let query = {};
    if (id.startsWith("SAN")) {
      query = { orderId: id };
    } else if (id.match(/^[0-9a-fA-F]{24}$/)) {
      query = { _id: id };
    } else {
      return res.status(400).json({ message: "Invalid order ID format" });
    }
    const order = await orderDB.findOne(query).populate('products.productId', 'name price images brand');
    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    // Security check: Only owner, matching guest email, or admin can load order details
    const isAdmin = Boolean(req.user?.isAdmin);
    if (!isAdmin) {
      if (order.userId) {
        if (!req.user || req.user.id !== order.userId.toString()) {
          return res.status(403).json({ message: "You are not authorized to view this order details" });
        }
      } else {
        const { email } = req.query;
        if (!email || email.trim().toLowerCase() !== order.guestEmail?.toLowerCase()) {
          return res.status(403).json({ message: "You are not authorized to view this order. Registered email mismatch." });
        }
      }
    }

    res.json(new OrderResponseDTO(order));
  } catch (err) {
    next(err);
  }
};
