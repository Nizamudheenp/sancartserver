const ProductResponseDTO = require('../productdto/ProductResponseDTO');

class OrderUserResponseDTO {
  constructor(user) {
    this.name = user.name;
    this.email = user.email;
  }
}

class OrderResponseDTO {
  constructor(order) {
    this.id = order.orderId;
    this.user = order.userId && order.userId.name
      ? new OrderUserResponseDTO(order.userId)
      : null;
    this.products = Array.isArray(order.products)
      ? order.products.map(p => ({
          product: p.productId && p.productId.name
            ? new ProductResponseDTO(p.productId)
            : null,
          quantity: p.quantity
        }))
      : [];
    this.totalAmount = order.totalAmount;
    this.shippingAddress = order.shippingAddress;
    this.customerPhone = order.customerPhone || order.shippingAddress?.phone || null;
    this.paymentMethod = order.paymentMethod;
    this.paymentId = order.paymentId;
    this.status = order.status;
    this.createdAt = order.createdAt;
    if (order.guestEmail) {
      this.guestEmail = order.guestEmail;
    }
  }
}

module.exports = OrderResponseDTO;
