const orderDB = require("../models/OrderModel");
const CounterDB = require("../models/CounterModel");
const CartDB = require("../models/CartModel");
const UserDB = require("../models/UserModel");
const NotificationDB = require("../models/NotificationModel");
const OrderResponseDTO = require("../dtos/orderdto/OrderResponseDTO");
const CreateOrderRequestDTO = require("../dtos/orderdto/CreateOrderRequestDTO");
const UpdateOrderStatusRequestDTO = require("../dtos/orderdto/UpdateOrderStatusRequestDTO");
const NotificationResponseDTO = require("../dtos/notificationdto/NotificationResponseDTO");
const { notifyClients } = require("../socket");
const {
  sendAdminNewOrderEmail,
  sendCustomerOrderReceipt,
  sendCustomerOrderStatusEmail,
} = require("../utils/emailService");

exports.createOrder = async (req, res, next) => {
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

    // Populate products for email notifications
    await newOrder.populate('products.productId', 'name title price');

    // 1. Admin In-App & Email Notification
    try {
      const adminNotification = new NotificationDB({
        forAdmin: true,
        title: 'New Order Received',
        message: `Order #${newOrder.orderId} placed for ₹${newOrder.totalAmount} (${newOrder.paymentMethod})`,
        type: 'ADMIN_NEW_ORDER',
        link: '/admin/orders',
        metadata: { orderId: newOrder.orderId, totalAmount: newOrder.totalAmount }
      });
      await adminNotification.save();
      notifyClients({ forAdmin: true, notification: new NotificationResponseDTO(adminNotification) });
      sendAdminNewOrderEmail(newOrder);
    } catch (notifErr) {
      console.error('Failed to dispatch admin order notification:', notifErr.message);
    }

    // 2. Customer In-App & Email Notification
    try {
      if (req.user && req.user.id) {
        const user = await UserDB.findById(req.user.id);
        const userPrefs = user?.notificationPreferences || { emailNotifications: true, inAppNotifications: true };

        if (userPrefs.inAppNotifications !== false) {
          const userNotification = new NotificationDB({
            recipient: req.user.id,
            title: 'Order Placed Successfully',
            message: `Your order #${newOrder.orderId} has been confirmed.`,
            type: 'USER_ORDER_PLACED',
            link: '/myorders',
            metadata: { orderId: newOrder.orderId }
          });
          await userNotification.save();
          notifyClients({ userId: req.user.id, notification: new NotificationResponseDTO(userNotification) });
        }

        if (userPrefs.emailNotifications !== false && user?.email) {
          sendCustomerOrderReceipt(newOrder, user.email);
        }
      } else if (orderReq.guestEmail) {
        // Guest user receipt
        sendCustomerOrderReceipt(newOrder, orderReq.guestEmail);
      }
    } catch (custNotifErr) {
      console.error('Failed to dispatch customer order notification:', custNotifErr.message);
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
    ).populate('userId', 'name email notificationPreferences')
     .populate('products.productId', 'name price images');

    if (!updatedOrder) {
      return res.status(404).json({ message: "Order not found" });
    }

    // Customer Notification on status change
    try {
      const allowedStatuses = ["shipped", "delivered", "cancelled"];
      if (allowedStatuses.includes(statusReq.status?.toLowerCase())) {
        const targetEmail = updatedOrder.guestEmail || updatedOrder.userId?.email;
        const userPrefs = updatedOrder.userId?.notificationPreferences || {
          emailNotifications: true,
          inAppNotifications: true,
        };

        if (updatedOrder.userId && userPrefs.inAppNotifications !== false) {
          const statusText = statusReq.status.charAt(0).toUpperCase() + statusReq.status.slice(1);
          const userNotification = new NotificationDB({
            recipient: updatedOrder.userId._id,
            title: `Order ${statusText}`,
            message: `Your order #${updatedOrder.orderId || updatedOrder._id} is now ${statusReq.status}.`,
            type: 'USER_ORDER_STATUS',
            link: '/myorders',
            metadata: { orderId: updatedOrder.orderId, status: statusReq.status }
          });
          await userNotification.save();
          notifyClients({
            userId: updatedOrder.userId._id,
            notification: new NotificationResponseDTO(userNotification),
          });
        }

        if (targetEmail && (updatedOrder.guestEmail || userPrefs.emailNotifications !== false)) {
          sendCustomerOrderStatusEmail(updatedOrder, targetEmail, statusReq.status);
        }
      }
    } catch (statusNotifErr) {
      console.error('Failed to dispatch status update notification:', statusNotifErr.message);
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
      .populate('products.productId', 'name price images')
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
      .populate('products.productId', 'name price images')
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
    const order = await orderDB.findOne(query).populate('userId', 'email notificationPreferences');
    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }
    // Verify ownership
    const orderUserId = (order.userId?._id || order.userId)?.toString();
    if (orderUserId && orderUserId !== req.user.id) {
      return res.status(403).json({ message: "Not authorized to cancel this order" });
    }
    // Check status
    const cancellableStatuses = ["processing", "paid"];
    if (!cancellableStatuses.includes(order.status.toLowerCase())) {
      return res.status(400).json({ message: `Cannot cancel order in '${order.status}' status.` });
    }

    order.status = "cancelled";
    const updatedOrder = await order.save();
    await updatedOrder.populate('products.productId', 'name price images');

    // Customer and Admin notification & email dispatch on cancellation
    try {
      const userPrefs = order.userId?.notificationPreferences || {
        emailNotifications: true,
        inAppNotifications: true,
      };

      // 1. Customer In-App Notification
      if (order.userId && userPrefs.inAppNotifications !== false) {
        const userNotification = new NotificationDB({
          recipient: orderUserId,
          title: 'Order Cancelled',
          message: `Your order #${updatedOrder.orderId || updatedOrder._id} has been cancelled successfully.`,
          type: 'USER_ORDER_STATUS',
          link: '/myorders',
          metadata: { orderId: updatedOrder.orderId, status: 'cancelled' }
        });
        await userNotification.save();
        notifyClients({
          userId: orderUserId,
          notification: new NotificationResponseDTO(userNotification),
        });
      }

      // 2. Customer Email
      const targetEmail = updatedOrder.guestEmail || order.userId?.email;
      if (targetEmail && (updatedOrder.guestEmail || userPrefs.emailNotifications !== false)) {
        sendCustomerOrderStatusEmail(updatedOrder, targetEmail, 'cancelled');
      }

      // 3. Admin In-App Notification
      const adminNotification = new NotificationDB({
        forAdmin: true,
        title: 'Order Cancelled by Customer',
        message: `Order #${updatedOrder.orderId || updatedOrder._id} was cancelled by the customer.`,
        type: 'ADMIN_ORDER_CANCELLED',
        link: '/admin/orders',
        metadata: { orderId: updatedOrder.orderId, status: 'cancelled' }
      });
      await adminNotification.save();
      notifyClients({
        forAdmin: true,
        notification: new NotificationResponseDTO(adminNotification),
      });
    } catch (notifErr) {
      console.error('Failed to dispatch cancel notifications:', notifErr.message);
    }

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
    const order = await orderDB.findOne(query).populate('products.productId', 'name price images');
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
