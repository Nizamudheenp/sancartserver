const ProductResponseDTO = require('../productdto/ProductResponseDTO');

class ReturnUserResponseDTO {
  constructor(user) {
    this.id = user._id;
    this.name = user.name;
    this.email = user.email;
  }
}

class ReturnOrderResponseDTO {
  constructor(order) {
    this.id = order.orderId || order._id;
    this.totalAmount = order.totalAmount;
    this.shippingAddress = order.shippingAddress;
  }
}

class ReturnResponseDTO {
  constructor(ret) {
    this.id = ret._id;
    
    this.order = ret.orderId && (ret.orderId.totalAmount || ret.orderId.orderId)
      ? new ReturnOrderResponseDTO(ret.orderId)
      : ret.orderId;

    this.user = ret.userId && ret.userId.name
      ? new ReturnUserResponseDTO(ret.userId)
      : ret.userId;

    this.product = ret.productId && ret.productId.name
      ? new ProductResponseDTO(ret.productId)
      : ret.productId;

    this.reason = ret.reason;
    this.details = ret.details;
    this.images = ret.images || [];
    this.returnOption = ret.returnOption;
    this.status = ret.status;
    this.createdAt = ret.createdAt;
  }
}

module.exports = ReturnResponseDTO;
