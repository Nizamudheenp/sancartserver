const ProductResponseDTO = require('../productdto/ProductResponseDTO');

class OrderUserResponseDTO {
  constructor(user) {
    this.id = user._id;
    this.name = user.name;
    this.email = user.email;
  }
}

class OrderResponseDTO {
  constructor(order) {
    this.id = order.orderId || order._id?.toString();
    this._id = order._id?.toString() || order.orderId;
    
    // Check if user is populated (e.g. on admin order lists)
    this.user = order.userId && order.userId.name 
      ? new OrderUserResponseDTO(order.userId) 
      : order.userId;

    // Check if product is populated inside products list
    this.products = order.products 
      ? order.products.map(p => ({
          product: p.productId && p.productId.name 
            ? new ProductResponseDTO(p.productId) 
            : p.productId,
          quantity: p.quantity
        }))
      : [];

    this.totalAmount = order.totalAmount;
    this.shippingAddress = order.shippingAddress;
    this.paymentId = order.paymentId;
    this.paymentMethod = order.paymentMethod;
    this.status = order.status;
    this.guestEmail = order.guestEmail;
    this.createdAt = order.createdAt;
  }
}

module.exports = OrderResponseDTO;
