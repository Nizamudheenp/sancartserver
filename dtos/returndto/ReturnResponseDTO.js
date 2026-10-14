const ProductResponseDTO = require('../productdto/ProductResponseDTO');

class ReturnUserResponseDTO {
  constructor(user) {
    this.name = user.name;
    this.email = user.email;
  }
}

class ReturnOrderResponseDTO {
  constructor(order) {
    this.id = order.orderId;
    this.totalAmount = order.totalAmount;
    this.shippingAddress = order.shippingAddress;
  }
}

class ReturnResponseDTO {
  constructor(ret) {
    this.id = ret._id;

    this.order = ret.orderId && (ret.orderId.totalAmount || ret.orderId.orderId)
      ? new ReturnOrderResponseDTO(ret.orderId)
      : null;

    this.user = ret.userId && ret.userId.name
      ? new ReturnUserResponseDTO(ret.userId)
      : null;

    this.product = ret.productId && ret.productId.name
      ? new ProductResponseDTO(ret.productId)
      : null;

    this.reason = ret.reason;
    this.details = ret.details;
    this.images = ret.images || [];
    this.returnOption = ret.returnOption;
    this.status = ret.status;
    this.createdAt = ret.createdAt;
  }
}

module.exports = ReturnResponseDTO;
